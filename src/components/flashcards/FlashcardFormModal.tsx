import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { FlashcardResponseDTO, UpdateFlashcardDTO } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const flashcardFormSchema = z.object({
  front: z.string().min(1, "Przód fiszki jest wymagany").max(200, "Question must be at most 200 characters"),
  back: z.string().min(1, "Tył fiszki jest wymagany").max(500, "Answer must be at most 500 characters"),
});

interface FlashcardFormModalProps {
  isOpen: boolean;
  mode: "create" | "edit" | null;
  initialData?: FlashcardResponseDTO | null;
  onSubmit: (data: UpdateFlashcardDTO) => void;
  onClose: () => void;
}

export function FlashcardFormModal({ isOpen, mode, initialData, onSubmit, onClose }: FlashcardFormModalProps) {
  const form = useForm<z.infer<typeof flashcardFormSchema>>({
    resolver: zodResolver(flashcardFormSchema),
    defaultValues: {
      front: initialData?.front || "",
      back: initialData?.back || "",
    },
  });

  // Reset form values when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        front: initialData.front,
        back: initialData.back,
      });
    } else {
      form.reset({
        front: "",
        back: "",
      });
    }
  }, [form, initialData]);

  const handleSubmit = (values: z.infer<typeof flashcardFormSchema>) => {
    onSubmit(values);
  };

  const handleOpenChange = (value: boolean) => {
    if (!value) onClose();
  };

  const frontLength = form.watch("front")?.length || 0;
  const backLength = form.watch("back")?.length || 0;
  const isUnchanged =
    initialData && form.watch("front") === initialData.front && form.watch("back") === initialData.back;

  // Check if the submit button should be disabled
  const isSubmitDisabled =
    frontLength > 200 || // Front text too long
    backLength > 500 || // Back text too long
    !form.formState.isDirty || // No changes in the form
    Boolean(mode === "edit" && isUnchanged); // In edit mode and no changes made

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Dodaj nową fiszkę" : "Edytuj fiszkę"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Wypełnij poniższy formularz, aby utworzyć nową fiszkę."
              : "Zmodyfikuj zawartość fiszki według potrzeb."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Przód fiszki
              <span className={`text-xs ml-2 ${frontLength > 200 ? "text-red-500" : "text-gray-500"}`}>
                ({frontLength}/200 znaków)
              </span>
            </label>
            <Textarea
              {...form.register("front")}
              className="min-h-[150px] resize-none"
              placeholder="Wpisz pytanie..."
            />
            {form.formState.errors.front && (
              <p className="text-sm text-red-500">{form.formState.errors.front.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Tył fiszki
              <span className={`text-xs ml-2 ${backLength > 500 ? "text-red-500" : "text-gray-500"}`}>
                ({backLength}/500 znaków)
              </span>
            </label>
            <Textarea
              {...form.register("back")}
              className="min-h-[150px] resize-none"
              placeholder="Wpisz odpowiedź..."
            />
            {form.formState.errors.back && <p className="text-sm text-red-500">{form.formState.errors.back.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Anuluj
            </Button>
            <Button type="submit" disabled={isSubmitDisabled}>
              {mode === "create" ? "Dodaj" : "Zapisz zmiany"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
