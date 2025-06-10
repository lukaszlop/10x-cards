// import type { SupabaseClient } from "@supabase/supabase-js";
import crypto from "crypto";
import type { SupabaseClient } from "../../db/supabase.client";
import type { GenerationDTO, GenerationFlashcardProposal } from "../../types";
import { OpenRouterLogger } from "../openrouter.logger";
import { OpenRouterService } from "./openrouter.service";

export interface GenerationServiceConfig {
  supabase: SupabaseClient;
  userId: string;
}

export class GenerationService {
  private supabase: SupabaseClient;
  private userId: string;
  private openRouter: OpenRouterService;
  private logger: OpenRouterLogger;

  constructor(config: GenerationServiceConfig) {
    this.supabase = config.supabase;
    this.userId = config.userId;
    this.openRouter = new OpenRouterService({
      supabase: config.supabase,
      userId: config.userId,
    });
    this.logger = new OpenRouterLogger();

    // Configure OpenRouter for flashcard generation
    this.openRouter.setSystemMessage(
      "Jesteś pomocnym asystentem AI specjalizującym się w tworzeniu fiszek edukacyjnych. " +
        "Twórz zwięzłe, przejrzyste i skuteczne fiszki, które pomagają użytkownikom w nauce i zapamiętywaniu informacji. " +
        "Zawsze odpowiadaj w formacie JSON, zgodnie z podanym schematem, bez żadnego dodatkowego tekstu."
    );

    this.openRouter.updateModelConfig({
      name: "openai/gpt-4o-mini",
      temperature: 0.7,
      max_tokens: 1000,
      top_p: 0.9,
    });
  }

  async generateFlashcards(sourceText: string): Promise<GenerationDTO> {
    const startTime = Date.now();

    try {
      // Prepare prompt for flashcard generation
      const prompt = `Twoim zadaniem jest tworzenie fiszek edukacyjnych z podanego tekstu. Każda fiszka powinna mieć przód (pytanie) i tył (odpowiedź).

Zasady:
1. Stwórz 3-5 zwięzłych i przejrzystych fiszek.
2. Skup się na kluczowych pojęciach i ważnych informacjach.
3. Pytania powinny być konkretne i jednoznaczne.
4. Udzielaj jasnych i precyzyjnych odpowiedzi.
5. Odpowiadaj WYŁĄCZNIE tablicą JSON w dokładnie pokazanym poniżej formacie.

Tekst do przetworzenia:
${sourceText}

Wymagany format JSON:
[
  {
    "front": "Jaki jest główny cel MCP (Model Context Protocol)?",
    "back": "MCP to uniwersalny, otwarty standard, który umożliwia bezproblemową integrację między LLM a systemami zewnętrznymi, rozwiązując problem integracji M×N.",
    "source": "ai-full"
  }
]

Pamiętaj: Zwróć WYŁĄCZNIE tablicę JSON, bez żadnego innego tekstu ani wyjaśnień.`;

      // Call OpenRouter API with reduced max_tokens for initial test
      const response = await this.openRouter.sendMessage(prompt);

      // Parse the flashcard proposals from the response
      let proposals: GenerationFlashcardProposal[];
      try {
        proposals = JSON.parse(response.answer);

        if (!Array.isArray(proposals)) {
          throw new Error("Response is not an array of flashcards");
        }

        // Validate each flashcard
        proposals.forEach((card, index) => {
          if (!card.front || typeof card.front !== "string") {
            throw new Error(`Flashcard at index ${index} is missing a valid 'front' property`);
          }
          if (!card.back || typeof card.back !== "string") {
            throw new Error(`Flashcard at index ${index} is missing a valid 'back' property`);
          }
          if (card.source !== "ai-full") {
            card.source = "ai-full"; // Fix source if not set correctly
          }
        });

        if (proposals.length === 0) {
          throw new Error("No flashcards were generated");
        }

        if (proposals.length > 10) {
          // Limit the number of flashcards if the model generates too many
          proposals = proposals.slice(0, 10);
        }
      } catch (error) {
        this.logger.error("Failed to parse flashcard proposals", error);
        throw new Error(
          `Failed to parse flashcard proposals: ${error instanceof Error ? error.message : String(error)}`
        );
      }

      // Create generation record
      const { data: generation, error: dbError } = await this.supabase
        .from("generations")
        .insert({
          user_id: this.userId,
          source_text_length: sourceText.length,
          source_text_hash: this.hashText(sourceText),
          model: "openai/gpt-4o-mini",
          generated_count: proposals.length,
          generation_duration: Date.now() - startTime,
          confidence_score: response.confidence,
        })
        .select()
        .single();

      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`);
      }

      // Log successful generation with metadata
      this.logger.debug("Generation completed successfully", {
        generation_id: generation.id,
        generated_count: proposals.length,
        confidence_score: response.confidence,
        duration_ms: Date.now() - startTime,
      });

      return {
        generation_id: generation.id,
        flashcards_proposals: proposals,
        generated_count: proposals.length,
        confidence_score: response.confidence,
      };
    } catch (error) {
      // Log error to generation_error_logs
      await this.logGenerationError(error, sourceText);
      throw error;
    }
  }

  private hashText(text: string): string {
    return crypto.createHash("md5").update(text).digest("hex");
  }

  private async logGenerationError(error: unknown, sourceText: string): Promise<void> {
    try {
      await this.supabase.from("generation_error_logs").insert({
        user_id: this.userId,
        error_code: "GENERATION_FAILED",
        error_message: error instanceof Error ? error.message : String(error),
        model: "openai/gpt-4o-mini",
        source_text_hash: this.hashText(sourceText),
        source_text_length: sourceText.length,
      });
    } catch (logError) {
      console.error("Failed to log generation error:", logError);
    }
  }
}
