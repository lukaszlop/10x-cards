import { z } from "zod";

// Bazowy schemat dla pojedynczej fiszki
const baseFlashcardSchema = z.object({
  front: z.string().max(200, "Front text cannot exceed 200 characters"),
  back: z.string().max(500, "Back text cannot exceed 500 characters"),
  source: z.enum(["manual", "ai-full", "ai-edited"] as const),
});

// Schemat dla fiszki manualnej
const manualFlashcardSchema = baseFlashcardSchema.extend({
  source: z.literal("manual"),
  generation_id: z.null(),
});

// Schemat dla fiszki AI (pełnej lub edytowanej)
const aiFlashcardSchema = baseFlashcardSchema.extend({
  source: z.enum(["ai-full", "ai-edited"] as const),
  generation_id: z.number().positive("Generation ID must be a positive number"),
});

// Schemat dla pojedynczej fiszki (unia typów)
export const flashcardSchema = z.discriminatedUnion("source", [manualFlashcardSchema, aiFlashcardSchema]);

// Schemat dla komendy tworzenia wielu fiszek
export const createFlashcardsSchema = z.object({
  flashcards: z
    .array(flashcardSchema)
    .min(1, "At least one flashcard is required")
    .max(100, "Maximum 100 flashcards can be created at once"),
});

// Typ inferowany ze schematu
export type CreateFlashcardsSchema = z.infer<typeof createFlashcardsSchema>;
