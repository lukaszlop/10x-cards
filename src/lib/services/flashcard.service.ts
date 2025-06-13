import type { SupabaseClient } from "../../db/supabase.client";
import type {
  CreateFlashcardDTO,
  FlashcardResponseDTO,
  FlashcardsResponseDTO,
  GetFlashcardsQuerySchema,
} from "../../types";

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
      source: flashcard.source ?? "manual",
      generation_id: flashcard.generation_id ?? null,
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

  /**
   * Retrieves paginated flashcards for a given user with optional filtering and sorting
   * @param userId - The ID of the user retrieving flashcards
   * @param params - Query parameters for pagination, sorting and filtering
   * @returns Paginated flashcards response
   * @throws Error if database operation fails
   */
  async getFlashcards(userId: string, params: GetFlashcardsQuerySchema): Promise<FlashcardsResponseDTO> {
    const { page = 1, limit = 10, sort = "created_at", order = "desc" } = params;
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from("flashcards")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order(sort, { ascending: order === "asc" })
      .range(offset, offset + limit - 1);

    if (params.source) {
      query = query.eq("source", params.source);
    }
    if (params.generation_id) {
      query = query.eq("generation_id", params.generation_id);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Database error while fetching flashcards:", error);
      throw new Error(`Failed to fetch flashcards: ${error.message}`);
    }

    return {
      data: data as FlashcardResponseDTO[],
      pagination: {
        page,
        limit,
        total: count ?? 0,
      },
    };
  }

  async updateFlashcard(data: {
    id: number;
    front: string;
    back: string;
    userId: string;
  }): Promise<FlashcardResponseDTO> {
    const { data: flashcard, error } = await this.supabase
      .from("flashcards")
      .update({
        front: data.front,
        back: data.back,
      })
      .eq("id", data.id)
      .eq("user_id", data.userId)
      .select()
      .single();

    if (error) {
      console.error("Database error while updating flashcard:", error);
      throw new Error(`Failed to update flashcard: ${error.message}`);
    }

    return flashcard as FlashcardResponseDTO;
  }

  async deleteFlashcard(id: number, userId: string): Promise<void> {
    const { error } = await this.supabase.from("flashcards").delete().eq("id", id).eq("user_id", userId);

    if (error) {
      console.error("Database error while deleting flashcard:", error);
      throw new Error(`Failed to delete flashcard: ${error.message}`);
    }
  }
}
