// import type { SupabaseClient } from "@supabase/supabase-js";
import crypto from "crypto";
import type { SupabaseClient } from "../../db/supabase.client";
import type { GenerationDTO, GenerationFlashcardProposal } from "../../types";

export interface GenerationServiceConfig {
  supabase: SupabaseClient;
  userId: string;
}

export class GenerationService {
  private supabase: SupabaseClient;
  private userId: string;

  constructor(config: GenerationServiceConfig) {
    this.supabase = config.supabase;
    this.userId = config.userId;
  }

  async generateFlashcards(sourceText: string): Promise<GenerationDTO> {
    const startTime = Date.now();

    try {
      // Mock LLM API call with 1 second delay
      const proposals = await this.callAIService(sourceText);

      // Create generation record
      const { data: generation, error: dbError } = await this.supabase
        .from("generations")
        .insert({
          user_id: this.userId,
          source_text_length: sourceText.length,
          source_text_hash: this.hashText(sourceText),
          model: "gpt-4-mock", // Using mock model identifier
          generated_count: proposals.length,
          generation_duration: Date.now() - startTime,
        })
        .select()
        .single();

      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`);
      }

      return {
        generation_id: generation.id,
        flashcards_proposals: proposals,
        generated_count: proposals.length,
      };
    } catch (error) {
      // Log error to generation_error_logs
      await this.logGenerationError(error, sourceText);
      throw error;
    }
  }

  private async callAIService(sourceText: string): Promise<GenerationFlashcardProposal[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Generate 3 mock flashcards based on text length
    const textLength = sourceText.length;
    return [
      {
        front: `What is the length of the provided text?`,
        back: `The text is ${textLength} characters long`,
        source: "ai-full",
      },
      {
        front: `How many paragraphs would this text have if each paragraph was 500 characters?`,
        back: `Approximately ${Math.ceil(textLength / 500)} paragraphs`,
        source: "ai-full",
      },
      {
        front: `If this text was a book, how many pages would it be (assuming 3000 characters per page)?`,
        back: `Approximately ${Math.ceil(textLength / 3000)} pages`,
        source: "ai-full",
      },
    ];
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
        model: "gpt-4-mock",
        source_text_hash: this.hashText(sourceText),
        source_text_length: sourceText.length,
      });
    } catch (logError) {
      console.error("Failed to log generation error:", logError);
    }
  }
}
