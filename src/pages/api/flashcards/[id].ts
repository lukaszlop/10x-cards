import type { APIRoute } from "astro";
import { z } from "zod";
import { DEFAULT_USER_ID } from "../../../db/supabase.client";
import type { FlashcardResponseDTO } from "../../../types";

// Validation schema for the response
const flashcardResponseSchema = z.object({
  id: z.number(),
  front: z.string(),
  back: z.string(),
  source: z.enum(["ai-full", "ai-edited", "manual"]),
  generation_id: z.number().nullable(),
  user_id: z.string().uuid(),
  created_at: z.string(),
  updated_at: z.string(),
}) satisfies z.ZodType<FlashcardResponseDTO>;

// Validation schema for the request body
const updateFlashcardSchema = z.object({
  front: z.string().max(200, "Front text cannot exceed 200 characters").optional(),
  back: z.string().max(500, "Back text cannot exceed 500 characters").optional(),
  source: z.enum(["ai-edited", "manual"] as const).optional(),
  generation_id: z.number().optional(),
});

export const GET: APIRoute = async ({ params, locals }): Promise<Response> => {
  const requestStartTime = Date.now();

  try {
    const { supabase } = locals;

    // Validate id parameter
    const { id } = params;
    if (!id || isNaN(Number(id))) {
      console.warn("Invalid flashcard ID provided:", {
        id,
        userId: DEFAULT_USER_ID,
        timestamp: new Date().toISOString(),
      });
      return new Response(
        JSON.stringify({
          error: "Invalid flashcard ID",
          details: "The ID must be a valid number",
          code: "INVALID_ID_FORMAT",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Convert id to number for database query
    const flashcardId = Number(id);

    // Query the database for the flashcard
    const { data: flashcard, error } = await supabase
      .from("flashcards")
      .select("*")
      .eq("id", flashcardId)
      .eq("user_id", DEFAULT_USER_ID)
      .single();

    // Handle database errors
    if (error) {
      console.error("Database error while fetching flashcard:", {
        error: {
          message: error.message,
          code: error.code,
          details: error.details,
        },
        flashcardId,
        userId: DEFAULT_USER_ID,
        timestamp: new Date().toISOString(),
        duration: Date.now() - requestStartTime,
      });
      return new Response(
        JSON.stringify({
          error: "Internal server error",
          details: "Failed to fetch flashcard from database",
          code: "DATABASE_ERROR",
          requestId: Date.now().toString(36),
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Return 404 if flashcard not found
    if (!flashcard) {
      console.warn("Flashcard not found:", {
        flashcardId,
        userId: DEFAULT_USER_ID,
        timestamp: new Date().toISOString(),
        duration: Date.now() - requestStartTime,
      });
      return new Response(
        JSON.stringify({
          error: "Flashcard not found",
          details: "The requested flashcard does not exist or you do not have access to it",
          code: "FLASHCARD_NOT_FOUND",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Log raw data before validation
    console.log("Raw flashcard data:", {
      ...flashcard,
      created_at_type: typeof flashcard.created_at,
      updated_at_type: typeof flashcard.updated_at,
    });

    // Validate response data
    const validationResult = flashcardResponseSchema.safeParse(flashcard);
    if (!validationResult.success) {
      console.error("Response validation failed:", {
        errors: validationResult.error.errors,
        flashcardId,
        userId: DEFAULT_USER_ID,
        timestamp: new Date().toISOString(),
        duration: Date.now() - requestStartTime,
      });
      return new Response(
        JSON.stringify({
          error: "Internal server error",
          details: "Response data validation failed",
          code: "RESPONSE_VALIDATION_ERROR",
          requestId: Date.now().toString(36),
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Log successful operation
    console.info("Flashcard retrieved successfully:", {
      flashcardId,
      userId: DEFAULT_USER_ID,
      timestamp: new Date().toISOString(),
      duration: Date.now() - requestStartTime,
    });

    // Return the validated flashcard data
    return new Response(JSON.stringify(validationResult.data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Detailed error logging
    console.error("Unexpected error while fetching flashcard:", {
      error:
        error instanceof Error
          ? {
              message: error.message,
              stack: error.stack,
            }
          : error,
      timestamp: new Date().toISOString(),
      duration: Date.now() - requestStartTime,
    });

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: "An unexpected error occurred while processing your request",
        code: "UNEXPECTED_ERROR",
        requestId: Date.now().toString(36),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

export const PUT: APIRoute = async ({ params, request, locals }) => {
  try {
    // 1. Extract and validate the flashcard ID
    const flashcardId = params.id;
    if (!flashcardId || isNaN(Number(flashcardId))) {
      return new Response(JSON.stringify({ error: "Invalid flashcard ID" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const numericFlashcardId = Number(flashcardId);

    // 2. Parse and validate request body
    const body = await request.json();
    const validationResult = updateFlashcardSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid request data",
          details: validationResult.error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { data: validatedData } = validationResult;

    // 3. Check if flashcard exists
    const { data: existingFlashcard, error: fetchError } = await locals.supabase
      .from("flashcards")
      .select()
      .eq("id", numericFlashcardId)
      .eq("user_id", DEFAULT_USER_ID)
      .single();

    if (fetchError || !existingFlashcard) {
      return new Response(JSON.stringify({ error: "Flashcard not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 4. Update the flashcard
    const { data: updatedFlashcard, error: updateError } = await locals.supabase
      .from("flashcards")
      .update(validatedData)
      .eq("id", numericFlashcardId)
      .eq("user_id", DEFAULT_USER_ID)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating flashcard:", updateError);
      return new Response(JSON.stringify({ error: "Failed to update flashcard" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 5. Return the updated flashcard
    return new Response(JSON.stringify(updatedFlashcard), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating flashcard:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
