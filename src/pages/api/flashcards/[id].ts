import type { APIRoute } from "astro";
import { z } from "zod";
import type { FlashcardResponseDTO } from "../../../types";

export const prerender = false;

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
  front: z.string().min(1),
  back: z.string().min(1),
});

export const GET: APIRoute = async ({ params, locals }) => {
  const supabase = locals.supabase;
  if (!supabase) {
    return new Response(JSON.stringify({ error: "Supabase client not found" }), { status: 500 });
  }

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const { id } = params;
    if (!id || isNaN(Number(id))) {
      return new Response(JSON.stringify({ error: "Invalid flashcard ID" }), { status: 400 });
    }

    const numericId = Number(id);

    const { data, error } = await supabase
      .from("flashcards")
      .select("*")
      .eq("id", numericId)
      .eq("user_id", user.id)
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: "Flashcard not found" }), { status: 404 });
    }

    const validatedData = flashcardResponseSchema.parse(data);
    return new Response(JSON.stringify(validatedData));
  } catch (error) {
    console.error("Error fetching flashcard:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
};

export const PUT: APIRoute = async ({ request, params, locals }) => {
  const supabase = locals.supabase;
  if (!supabase) {
    return new Response(JSON.stringify({ error: "Supabase client not found" }), { status: 500 });
  }

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const { id } = params;
    if (!id || isNaN(Number(id))) {
      return new Response(JSON.stringify({ error: "Invalid flashcard ID" }), { status: 400 });
    }

    const numericId = Number(id);

    const body = await request.json();
    const validationResult = updateFlashcardSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(JSON.stringify({ error: validationResult.error }), { status: 400 });
    }

    const { data, error } = await supabase
      .from("flashcards")
      .update(validationResult.data)
      .eq("id", numericId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: "Failed to update flashcard" }), { status: 500 });
    }

    const validatedData = flashcardResponseSchema.parse(data);
    return new Response(JSON.stringify(validatedData));
  } catch (error) {
    console.error("Error updating flashcard:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  const supabase = locals.supabase;
  if (!supabase) {
    return new Response(JSON.stringify({ error: "Supabase client not found" }), { status: 500 });
  }

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const { id } = params;
    if (!id || isNaN(Number(id))) {
      return new Response(JSON.stringify({ error: "Invalid flashcard ID" }), { status: 400 });
    }

    const numericId = Number(id);

    const { error } = await supabase.from("flashcards").delete().eq("id", numericId).eq("user_id", user.id);

    if (error) {
      return new Response(JSON.stringify({ error: "Failed to delete flashcard" }), { status: 500 });
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting flashcard:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
};
