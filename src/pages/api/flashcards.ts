import type { APIRoute } from "astro";
import { DEFAULT_USER_ID } from "../../db/supabase.client";
import { createFlashcardsSchema } from "../../lib/schemas/flashcard.schema";
import { FlashcardService } from "../../lib/services/flashcard.service";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parsuj body żądania
    let body;
    try {
      body = await request.json();
    } catch (error) {
      console.error("Failed to parse request body:", error);
      return new Response(
        JSON.stringify({
          error: "Invalid JSON in request body",
          details: error instanceof Error ? error.message : "Unknown parsing error",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Waliduj dane wejściowe
    const validationResult = createFlashcardsSchema.safeParse(body);
    if (!validationResult.success) {
      console.warn("Validation failed for flashcards creation:", {
        errors: validationResult.error.errors,
        userId: DEFAULT_USER_ID,
      });
      return new Response(
        JSON.stringify({
          error: "Validation failed",
          details: validationResult.error.errors,
        }),
        {
          status: 422,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Utwórz instancję serwisu
    const flashcardService = new FlashcardService(locals.supabase);

    // Zapisz fiszki w bazie
    const createdFlashcards = await flashcardService.createFlashcards(
      DEFAULT_USER_ID,
      validationResult.data.flashcards
    );

    // Zwróć utworzone fiszki
    return new Response(JSON.stringify({ flashcards: createdFlashcards }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Szczegółowe logowanie błędu
    console.error("Unexpected error while creating flashcards:", {
      error:
        error instanceof Error
          ? {
              message: error.message,
              stack: error.stack,
            }
          : error,
      timestamp: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        requestId: Date.now().toString(36), // Dodaj identyfikator żądania do śledzenia błędów
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
