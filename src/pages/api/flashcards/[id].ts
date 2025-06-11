import type { APIRoute } from "astro";
import { z } from "zod";
import { DEFAULT_USER_ID, supabaseClient } from "../../../db/supabase.client";
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

export const GET: APIRoute = async ({ params }) => {
  try {
    // Validate flashcard ID
    const flashcardId = params.id;
    if (!flashcardId || isNaN(Number(flashcardId))) {
      return new Response(
        JSON.stringify({
          error: "Invalid flashcard ID provided",
        }),
        { status: 400 }
      );
    }

    // Convert ID to number and validate if it's positive
    const id = Number(flashcardId);
    if (id <= 0) {
      return new Response(
        JSON.stringify({
          error: "Flashcard ID must be a positive number",
        }),
        { status: 400 }
      );
    }

    // Fetch the flashcard
    const { data: flashcard, error: fetchError } = await supabaseClient
      .from("flashcards")
      .select("*")
      .eq("id", id)
      .eq("user_id", DEFAULT_USER_ID)
      .single();

    if (fetchError?.code === "PGRST116") {
      // PGRST116 indicates no rows returned by Postgrest
      return new Response(
        JSON.stringify({
          error: "Flashcard not found",
        }),
        { status: 404 }
      );
    }

    if (fetchError) {
      console.error("Error fetching flashcard:", fetchError);
      return new Response(
        JSON.stringify({
          error: "Failed to fetch flashcard from database",
        }),
        { status: 500 }
      );
    }

    return new Response(JSON.stringify(flashcard), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching flashcard:", error);
    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred while fetching the flashcard",
      }),
      { status: 500 }
    );
  }
};

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    // 1. Extract and validate the flashcard ID
    const flashcardId = params.id;
    if (!flashcardId || isNaN(Number(flashcardId))) {
      return new Response(
        JSON.stringify({
          error: "Invalid flashcard ID",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const numericFlashcardId = Number(flashcardId);

    // 2. Parse and validate request body
    let body;
    try {
      // Check if request has a body
      const contentLength = request.headers.get("content-length");
      if (!contentLength || contentLength === "0") {
        return new Response(
          JSON.stringify({
            error: "Request body is required",
            details: "Please provide the flashcard data to update",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Try to parse the body as JSON
      body = await request.json();
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: "Invalid request body",
          details: "Please provide valid JSON data",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

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
    const { data: existingFlashcard, error: fetchError } = await supabaseClient
      .from("flashcards")
      .select()
      .eq("id", numericFlashcardId)
      .eq("user_id", DEFAULT_USER_ID)
      .single();

    if (fetchError || !existingFlashcard) {
      return new Response(
        JSON.stringify({
          error: "Flashcard not found",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 4. Update the flashcard
    const { data: updatedFlashcard, error: updateError } = await supabaseClient
      .from("flashcards")
      .update(validatedData)
      .eq("id", numericFlashcardId)
      .eq("user_id", DEFAULT_USER_ID)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating flashcard:", updateError);
      return new Response(
        JSON.stringify({
          error: "Failed to update flashcard",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 5. Return the updated flashcard
    return new Response(JSON.stringify(updatedFlashcard), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating flashcard:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    // Validate flashcard ID
    const flashcardId = params.id;
    if (!flashcardId) {
      return new Response(
        JSON.stringify({
          error: "Flashcard ID is required for deletion",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (isNaN(Number(flashcardId))) {
      return new Response(
        JSON.stringify({
          error: "Invalid flashcard ID provided",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Convert ID to number and validate if it's positive
    const id = Number(flashcardId);
    if (id <= 0) {
      return new Response(
        JSON.stringify({
          error: "Flashcard ID must be a positive number",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // First check if the flashcard exists and belongs to the user
    const { data: flashcard, error: fetchError } = await supabaseClient
      .from("flashcards")
      .select("id")
      .eq("id", id)
      .eq("user_id", DEFAULT_USER_ID)
      .single();

    if (fetchError || !flashcard) {
      return new Response(
        JSON.stringify({
          error: "Flashcard not found or you do not have permission to delete it",
        }),
        { status: 404 }
      );
    }

    // Delete the flashcard
    const { error: deleteError } = await supabaseClient
      .from("flashcards")
      .delete()
      .eq("id", id)
      .eq("user_id", DEFAULT_USER_ID);

    if (deleteError) {
      console.error("Error deleting flashcard:", deleteError);
      return new Response(
        JSON.stringify({
          error: "Failed to delete the flashcard",
        }),
        { status: 500 }
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({
        message: "Flashcard deleted successfully",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting flashcard:", error);
    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred while deleting the flashcard",
      }),
      { status: 500 }
    );
  }
};
