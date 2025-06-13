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
import type { ProposalViewModel } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const editProposalSchema = z.object({
  front: z
    .string()
    .min(1, "Przód fiszki nie może być pusty.")
    .max(200, "Przód fiszki może mieć maksymalnie 200 znaków."),
  back: z.string().min(1, "Tył fiszki nie może być pusty.").max(500, "Tył fiszki może mieć maksymalnie 500 znaków."),
});

type EditProposalFormData = z.infer<typeof editProposalSchema>;

interface EditFlashcardModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: ProposalViewModel;
  onSave: (editedData: Partial<ProposalViewModel>) => void;
}

export function EditFlashcardModal({ isOpen, onClose, proposal, onSave }: EditFlashcardModalProps) {
  const form = useForm<EditProposalFormData>({
    resolver: zodResolver(editProposalSchema),
    defaultValues: {
      front: proposal.currentFront,
      back: proposal.currentBack,
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        front: proposal.currentFront,
        back: proposal.currentBack,
      });
    }
  }, [isOpen, proposal, form]);

  const handleSave = (data: EditProposalFormData) => {
    onSave({
      currentFront: data.front,
      currentBack: data.back,
      isAccepted: true,
      isEdited: true,
    });
    onClose();
  };

  const frontValue = form.watch("front");
  const backValue = form.watch("back");

  const isSubmitDisabled = !form.formState.isDirty || !form.formState.isValid;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edytuj fiszkę</DialogTitle>
          <DialogDescription>
            Zmodyfikuj zawartość fiszki według potrzeb. Kliknij &apos;Zapisz zmiany&apos;, aby zatwierdzić.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Przód fiszki
              <span className={`text-xs ml-2 ${frontValue.length > 200 ? "text-red-500" : "text-gray-500"}`}>
                ({frontValue.length}/200 znaków)
              </span>
            </label>
            <Textarea
              {...form.register("front")}
              defaultValue={proposal.currentFront}
              className="min-h-[150px] resize-none"
            />
            {form.formState.errors.front && (
              <p className="text-sm text-red-500">{form.formState.errors.front.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Tył fiszki
              <span className={`text-xs ml-2 ${backValue.length > 500 ? "text-red-500" : "text-gray-500"}`}>
                ({backValue.length}/500 znaków)
              </span>
            </label>
            <Textarea
              {...form.register("back")}
              defaultValue={proposal.currentBack}
              className="min-h-[150px] resize-none"
            />
            {form.formState.errors.back && <p className="text-sm text-red-500">{form.formState.errors.back.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Anuluj
            </Button>
            <Button type="submit" disabled={isSubmitDisabled}>
              Zapisz zmiany
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
