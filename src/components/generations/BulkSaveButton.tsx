import { Button } from "../ui/button";

interface BulkSaveButtonProps {
  onSave: (saveAll: boolean) => void;
  isSaving: boolean;
  acceptedCount: number;
  totalCount: number;
}

export function BulkSaveButton({ onSave, isSaving, acceptedCount, totalCount }: BulkSaveButtonProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-end gap-4">
      <Button
        onClick={() => onSave(true)}
        disabled={isSaving || totalCount === 0}
        variant="outline"
        size="lg"
        className="w-full sm:w-auto"
      >
        {isSaving ? "Zapisywanie..." : `Zapisz wszystkie (${totalCount})`}
      </Button>
      <Button
        onClick={() => onSave(false)}
        disabled={isSaving || acceptedCount === 0}
        size="lg"
        className="w-full sm:w-auto"
      >
        {isSaving ? "Zapisywanie..." : `Zapisz zaakceptowane (${acceptedCount})`}
      </Button>
    </div>
  );
}
