import type { APIRoute } from "astro";
import { z } from "zod";
import { GenerationService } from "../../lib/services/generation.service";

const generateSchema = z.object({
  source_text: z
    .string()
    .min(100, "Tekst musi mieć co najmniej 100 znaków.")
    .max(10000, "Tekst nie może przekraczać 10 000 znaków."),
});

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { supabase } = locals;
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const body = await request.json();
    const validationResult = generateSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(JSON.stringify({ error: validationResult.error.flatten() }), { status: 400 });
    }

    const generationService = new GenerationService({ supabase, userId: user.id });

    const generationData = await generationService.generateFlashcards(validationResult.data.source_text);

    return new Response(JSON.stringify(generationData), { status: 200 });
  } catch (error) {
    console.error("Error in POST /api/generations:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
};
