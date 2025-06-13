import type { APIRoute } from "astro";
import { z } from "zod";
import { FlashcardService } from "../../lib/services/flashcard.service";
import type { CreateFlashcardDTO } from "../../types";

const singleFlashcardSchema = z.object({
  front: z.string().min(1),
  back: z.string().min(1),
  source: z.enum(["manual", "ai-full", "ai-edited"]).optional().default("manual"),
  generation_id: z.number().nullable().optional().default(null),
});

const multipleFlashcardsSchema = z.object({
  flashcards: z.array(singleFlashcardSchema),
});

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { user, supabase } = locals;
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const body = await request.json();
    const multipleResult = multipleFlashcardsSchema.safeParse(body);

    let flashcardsToCreate: CreateFlashcardDTO[];

    if (multipleResult.success) {
      flashcardsToCreate = multipleResult.data.flashcards;
    } else {
      const singleResult = singleFlashcardSchema.safeParse(body);
      if (singleResult.success) {
        flashcardsToCreate = [singleResult.data];
      } else {
        return new Response(JSON.stringify({ error: "Invalid request body" }), { status: 400 });
      }
    }

    if (flashcardsToCreate.length === 0) {
      return new Response(JSON.stringify({ error: "No flashcards to create" }), { status: 400 });
    }

    const flashcardService = new FlashcardService(supabase);
    const createdFlashcards = await flashcardService.createFlashcards(user.id, flashcardsToCreate);

    if (!createdFlashcards || createdFlashcards.length === 0) {
      return new Response(JSON.stringify({ error: "Failed to create flashcard records." }), { status: 500 });
    }

    // Odpowiedź zależy od tego, czy tworzono jedną, czy wiele fiszek
    const responseBody = createdFlashcards.length === 1 ? createdFlashcards[0] : createdFlashcards;
    return new Response(JSON.stringify(responseBody), { status: 201 });
  } catch (error) {
    console.error("Error creating flashcard:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
};

export const GET: APIRoute = async ({ url, locals }) => {
  try {
    const { user, supabase } = locals;

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const searchParams = new URL(url).searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sort = searchParams.get("sort") || "created_at";
    const order = searchParams.get("order") || "desc";

    const validationResult = z
      .object({
        page: z.number().min(1),
        limit: z.number().min(1).max(100),
        sort: z.enum(["front", "back", "created_at", "updated_at"]),
        order: z.enum(["asc", "desc"]),
      })
      .safeParse({ page, limit, sort, order });

    if (!validationResult.success) {
      return new Response(JSON.stringify({ error: validationResult.error }), { status: 400 });
    }

    const flashcardService = new FlashcardService(supabase);
    const response = await flashcardService.getFlashcards(user.id, validationResult.data);

    return new Response(JSON.stringify(response));
  } catch (error) {
    console.error("Error fetching flashcards:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
};

export const PUT: APIRoute = async ({ request, locals }) => {
  try {
    const { user, supabase } = locals;

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const body = await request.json();
    const validationResult = z
      .object({
        id: z.number(),
        front: z.string().min(1),
        back: z.string().min(1),
      })
      .safeParse(body);

    if (!validationResult.success) {
      return new Response(JSON.stringify({ error: validationResult.error }), { status: 400 });
    }

    const flashcardService = new FlashcardService(supabase);
    const flashcard = await flashcardService.updateFlashcard({
      ...validationResult.data,
      userId: user.id,
    });

    return new Response(JSON.stringify(flashcard));
  } catch (error) {
    console.error("Error updating flashcard:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ request, locals }) => {
  try {
    const { user, supabase } = locals;

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const body = await request.json();
    const validationResult = z.object({ id: z.number() }).safeParse(body);

    if (!validationResult.success) {
      return new Response(JSON.stringify({ error: validationResult.error }), { status: 400 });
    }

    const flashcardService = new FlashcardService(supabase);
    await flashcardService.deleteFlashcard(validationResult.data.id, user.id);

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting flashcard:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
};
