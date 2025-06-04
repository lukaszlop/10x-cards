import type { SupabaseClient } from "../../db/supabase.client";
import type { CreateFlashcardDTO, FlashcardResponseDTO } from "../../types";

export class FlashcardService {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Creates multiple flashcards for a given user
   * @param userId - The ID of the user creating the flashcards
   * @param flashcards - Array of flashcard data to create
   * @returns Array of created flashcards
   * @throws Error if database operation fails
   */
  async createFlashcards(userId: string, flashcards: CreateFlashcardDTO[]): Promise<FlashcardResponseDTO[]> {
    // Przygotuj dane do insertu, dodając user_id do każdej fiszki
    const flashcardsWithUserId = flashcards.map((flashcard) => ({
      ...flashcard,
      user_id: userId,
    }));

    // Wykonaj batch insert
    const { data, error } = await this.supabase.from("flashcards").insert(flashcardsWithUserId).select();

    if (error) {
      console.error("Database error while creating flashcards:", {
        error,
        userId,
        flashcardsCount: flashcards.length,
      });
      throw new Error(`Failed to create flashcards: ${error.message}`);
    }

    return data as FlashcardResponseDTO[];
  }
}
