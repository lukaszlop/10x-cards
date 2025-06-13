import crypto from "crypto";
import { z } from "zod";
import type { SupabaseClient } from "../../db/supabase.client";
import { OpenRouterLogger } from "../openrouter.logger";
import type { ApiClient, ModelConfig, ParsedResponse, RequestPayload, ResponseFormat } from "../openrouter.types";

export interface OpenRouterServiceConfig {
  supabase: SupabaseClient;
  userId: string;
}

export class OpenRouterService {
  private readonly apiKey: string;
  private systemMessage: string;
  private responseFormat: ResponseFormat;
  private modelConfig: ModelConfig;
  private readonly apiClient: ApiClient;
  private readonly baseUrl = "https://openrouter.ai/api/v1";
  private readonly supabase: SupabaseClient;
  private readonly userId: string;
  private readonly logger: OpenRouterLogger;

  constructor(config: OpenRouterServiceConfig) {
    // Get API key from environment variables
    const apiKey = import.meta.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OpenRouter API key not found in environment variables");
    }
    this.apiKey = apiKey;
    this.supabase = config.supabase;
    this.userId = config.userId;
    this.logger = new OpenRouterLogger();

    // Set default system message
    this.systemMessage = "You are a helpful assistant.";

    // Set default response format
    this.responseFormat = {
      type: "json_schema",
      json_schema: {
        name: "chatResponseSchema",
        strict: true,
        schema: {
          answer: { type: "string" },
          confidence: { type: "number" },
        },
      },
    };

    // Set default model configuration
    this.modelConfig = {
      name: "openai/gpt-4o-mini",
      temperature: 0.7,
      max_tokens: 1000,
      top_p: 0.9,
    };

    // Initialize API client with retry mechanism
    this.apiClient = {
      post: async (payload: RequestPayload): Promise<ParsedResponse> => {
        const maxRetries = 3;
        const baseDelay = 1000; // 1 second

        for (let attempt = 0; attempt < maxRetries; attempt++) {
          try {
            this.logger.debug("Sending request to OpenRouter API", {
              attempt: attempt + 1,
              maxRetries,
              model: this.modelConfig.name,
            });

            const response = await fetch(`${this.baseUrl}/chat/completions`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.apiKey}`,
                "HTTP-Referer": import.meta.env.PUBLIC_SITE_URL || "http://localhost:3000",
                "X-Title": "10xCards",
              },
              body: JSON.stringify(payload),
            });

            if (!response.ok) {
              const errorData = await response.json().catch(() => null);
              const errorMessage = errorData?.error?.message || `HTTP error! status: ${response.status}`;
              const error = new Error(errorMessage);
              this.logger.error("Request failed", error, payload);
              throw error;
            }

            const data = await response.json();
            this.logger.debug("Received response from OpenRouter API");
            return this.parseResponse(data);
          } catch (error) {
            if (attempt === maxRetries - 1) {
              this.logger.error("Max retries exceeded", error, payload);
              await this.logError(error, payload);
              throw error;
            }
            this.logger.warn(`Attempt ${attempt + 1} failed, retrying...`, { error });
            // Exponential backoff
            await new Promise((resolve) => setTimeout(resolve, baseDelay * Math.pow(2, attempt)));
          }
        }

        throw new Error("Max retries exceeded");
      },
    };
  }

  // Private helper method for response parsing
  private parseResponse(response: unknown): ParsedResponse {
    try {
      // Validate response structure
      const responseSchema = z.object({
        choices: z
          .array(
            z.object({
              message: z.object({
                content: z.string(),
              }),
            })
          )
          .min(1),
      });

      const validatedResponse = responseSchema.parse(response);
      const content = validatedResponse.choices[0].message.content;

      try {
        // Parse JSON content
        const parsedContent = JSON.parse(content);

        // Validate against our expected schema
        const resultSchema = z.object({
          answer: z.string(),
          confidence: z.number(),
        });

        return resultSchema.parse(parsedContent);
      } catch {
        // If parsing as JSON fails, treat the content as a regular string response
        return {
          answer: content,
          confidence: 1.0,
        };
      }
    } catch (error) {
      this.logger.error("Failed to parse response", error);
      this.handleError(error);
      throw error;
    }
  }

  // Private error handler
  private async handleError(error: unknown): Promise<void> {
    // Log error details
    await this.logError(error);

    if (error instanceof Error) {
      if (error.message.includes("401")) {
        throw new Error("Authentication failed. Please check your API key.");
      }
      if (error.message.includes("429")) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }
      if (error.message.includes("500")) {
        throw new Error("OpenRouter service is experiencing issues. Please try again later.");
      }
    }

    throw new Error("An unexpected error occurred while processing your request.");
  }

  private async logError(error: unknown, payload?: RequestPayload): Promise<void> {
    try {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorCode = this.getErrorCode(error);

      await this.supabase.from("generation_error_logs").insert({
        user_id: this.userId,
        error_code: errorCode,
        error_message: errorMessage,
        model: this.modelConfig.name,
        source_text_hash: payload ? this.hashText(JSON.stringify(payload)) : "",
        source_text_length: payload ? JSON.stringify(payload).length : 0,
      });
    } catch (logError) {
      // If logging to database fails, at least log to console via our secure logger
      this.logger.error("Failed to log error to database", logError);
    }
  }

  private getErrorCode(error: unknown): string {
    if (error instanceof Error) {
      if (error.message.includes("401")) return "AUTH_ERROR";
      if (error.message.includes("429")) return "RATE_LIMIT";
      if (error.message.includes("500")) return "API_ERROR";
      if (error.message.includes("timeout")) return "TIMEOUT";
      if (error.message.includes("network")) return "NETWORK_ERROR";
    }
    return "UNKNOWN_ERROR";
  }

  private hashText(text: string): string {
    return crypto.createHash("md5").update(text).digest("hex");
  }

  private buildRequestPayload(userMessage: string): RequestPayload {
    return {
      messages: [
        {
          role: "system",
          content: this.systemMessage,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      model: this.modelConfig.name,
      temperature: this.modelConfig.temperature,
      max_tokens: this.modelConfig.max_tokens,
      top_p: this.modelConfig.top_p,
    };
  }

  /**
   * Sends a message to OpenRouter API and returns the response
   * @param userMessage The message to send
   * @returns Promise with the parsed response
   * @throws Error if the request fails or the response is invalid
   */
  public async sendMessage(userMessage: string): Promise<ParsedResponse> {
    if (!userMessage.trim()) {
      throw new Error("User message cannot be empty");
    }

    const payload = this.buildRequestPayload(userMessage);
    return this.apiClient.post(payload);
  }

  /**
   * Updates the system message used in requests
   * @param message The new system message
   */
  public setSystemMessage(message: string): void {
    if (!message.trim()) {
      throw new Error("System message cannot be empty");
    }
    this.systemMessage = message;
  }

  /**
   * Updates the model configuration
   * @param config The new model configuration
   */
  public updateModelConfig(config: ModelConfig): void {
    if (
      !config.name ||
      config.temperature < 0 ||
      config.temperature > 1 ||
      config.max_tokens < 1 ||
      config.top_p < 0 ||
      config.top_p > 1
    ) {
      throw new Error("Invalid model configuration");
    }
    this.modelConfig = config;
  }

  /**
   * Updates the response format
   * @param format The new response format
   */
  public setResponseFormat(format: ResponseFormat): void {
    if (format.type !== "json_schema" || !format.json_schema?.name || !format.json_schema?.schema) {
      throw new Error("Invalid response format");
    }
    this.responseFormat = format;
  }
}
