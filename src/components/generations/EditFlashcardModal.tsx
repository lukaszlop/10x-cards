import { useEffect, useState, type ChangeEvent } from "react";
import type { ProposalViewModel } from "../../types";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Textarea } from "../ui/textarea";

interface EditFlashcardModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: ProposalViewModel;
  onSave: (editedData: Partial<ProposalViewModel>) => void;
}

interface ValidationErrors {
  front?: string;
  back?: string;
}

export function EditFlashcardModal({ isOpen, onClose, proposal, onSave }: EditFlashcardModalProps) {
  const [editedFront, setEditedFront] = useState(proposal.currentFront);
  const [editedBack, setEditedBack] = useState(proposal.currentBack);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    setEditedFront(proposal.currentFront);
    setEditedBack(proposal.currentBack);
    setValidationErrors({});
  }, [proposal]);

  const validate = () => {
    const errors: ValidationErrors = {};

    if (editedFront.length > 200) {
      errors.front = "Przód fiszki nie może przekraczać 200 znaków";
    }

    if (editedBack.length > 500) {
      errors.back = "Tył fiszki nie może przekraczać 500 znaków";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      onSave({
        currentFront: editedFront,
        currentBack: editedBack,
        isAccepted: true,
        isEdited: true,
      });
      onClose();
    }
  };

  const handleFrontChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setEditedFront(e.target.value);
    if (validationErrors.front) {
      setValidationErrors((prev) => ({ ...prev, front: undefined }));
    }
  };

  const handleBackChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setEditedBack(e.target.value);
    if (validationErrors.back) {
      setValidationErrors((prev) => ({ ...prev, back: undefined }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edytuj fiszkę</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Przód fiszki
              <span className={`text-xs ml-2 ${editedFront.length > 200 ? "text-red-500" : "text-gray-500"}`}>
                ({editedFront.length}/200 znaków)
              </span>
            </label>
            <Textarea value={editedFront} onChange={handleFrontChange} className="min-h-[150px] resize-y" />
            {validationErrors.front && <p className="text-sm text-red-500">{validationErrors.front}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Tył fiszki
              <span className={`text-xs ml-2 ${editedBack.length > 500 ? "text-red-500" : "text-gray-500"}`}>
                ({editedBack.length}/500 znaków)
              </span>
            </label>
            <Textarea value={editedBack} onChange={handleBackChange} className="min-h-[150px] resize-y " />
            {validationErrors.back && <p className="text-sm text-red-500">{validationErrors.back}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Anuluj
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              editedFront.length > 200 ||
              editedBack.length > 500 ||
              (editedFront === proposal.currentFront && editedBack === proposal.currentBack)
            }
          >
            Zapisz zmiany
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
