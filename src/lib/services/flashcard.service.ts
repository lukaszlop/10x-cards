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
    const { page, limit, sort, order, source, generation_id } = params;
    const offset = (page - 1) * limit;

    // Start building the query
    let query = this.supabase
      .from("flashcards")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order(sort, { ascending: order === "asc" })
      .range(offset, offset + limit - 1);

    // Apply optional filters
    if (source) {
      query = query.eq("source", source);
    }
    if (generation_id) {
      query = query.eq("generation_id", generation_id);
    }

    // Execute the query
    const { data, error, count } = await query;

    if (error) {
      console.error("Database error while fetching flashcards:", {
        error,
        userId,
        params,
      });
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
}
