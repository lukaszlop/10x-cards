import type { APIRoute } from "astro";
import { DEFAULT_USER_ID } from "../../db/supabase.client";
import { createFlashcardsSchema, getFlashcardsQuerySchema } from "../../lib/schemas/flashcard.schema";
import { FlashcardService } from "../../lib/services/flashcard.service";

export const prerender = false;

export const GET: APIRoute = async ({ url, locals }) => {
  try {
    // Parse and validate query parameters
    const searchParams = Object.fromEntries(url.searchParams.entries());
    const validationResult = getFlashcardsQuerySchema.safeParse(searchParams);

    if (!validationResult.success) {
      console.warn("Validation failed for flashcards query parameters:", {
        errors: validationResult.error.errors,
        userId: DEFAULT_USER_ID,
      });
      return new Response(
        JSON.stringify({
          error: "Invalid query parameters",
          details: validationResult.error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Create service instance and fetch flashcards
    const flashcardService = new FlashcardService(locals.supabase);
    const response = await flashcardService.getFlashcards(DEFAULT_USER_ID, validationResult.data);

    // Return the paginated response
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Detailed error logging
    console.error("Unexpected error while fetching flashcards:", {
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
        requestId: Date.now().toString(36),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

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

export const DELETE: APIRoute = async () => {
  return new Response(
    JSON.stringify({
      error: "Flashcard ID is required for deletion. Use DELETE /api/flashcards/{id} instead.",
    }),
    {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};
