import { z } from "zod";

// Bazowy schemat dla pojedynczej fiszki
const baseFlashcardSchema = z.object({
  front: z.string().max(200, "Front text cannot exceed 200 characters"),
  back: z.string().max(500, "Back text cannot exceed 500 characters"),
});

// Schemat dla fiszki manualnej
const manualFlashcardSchema = baseFlashcardSchema.extend({
  source: z.literal("manual").optional(),
  generation_id: z.null().optional(),
});

// Schemat dla fiszki AI (pełnej lub edytowanej)
const aiFlashcardSchema = baseFlashcardSchema.extend({
  source: z.enum(["ai-full", "ai-edited"] as const),
  generation_id: z.number().positive("Generation ID must be a positive number"),
});

// Schemat dla pojedynczej fiszki (unia typów)
export const flashcardSchema = z.union([manualFlashcardSchema, aiFlashcardSchema]);

// Schemat dla komendy tworzenia wielu fiszek
export const createFlashcardsSchema = z.object({
  flashcards: z
    .array(flashcardSchema)
    .min(1, "At least one flashcard is required")
    .max(100, "Maximum 100 flashcards can be created at once"),
});

// Schemat dla parametrów zapytania GET /flashcards
export const getFlashcardsQuerySchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  sort: z.enum(["created_at", "updated_at", "front", "back"]).default("created_at"),
  order: z.enum(["asc", "desc"]).default("desc"),
  source: z.enum(["manual", "ai-full", "ai-edited"]).optional(),
  generation_id: z.coerce.number().positive().optional(),
});

// Typy inferowane ze schematów
export type CreateFlashcardsSchema = z.infer<typeof createFlashcardsSchema>;
export type GetFlashcardsQuerySchema = z.infer<typeof getFlashcardsQuerySchema>;
