import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

interface FlashcardGenerationFormProps {
  onSubmit: (sourceText: string) => void;
  isLoading: boolean;
  initialText?: string;
}

export function FlashcardGenerationForm({ onSubmit, isLoading, initialText = "" }: FlashcardGenerationFormProps) {
  const [sourceText, setSourceText] = useState(initialText);
  const [charCount, setCharCount] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    setSourceText(initialText);
  }, [initialText]);

  useEffect(() => {
    setCharCount(sourceText.length);

    if (sourceText.length === 0) {
      setValidationError(null);
    } else if (sourceText.length < 1000) {
      setValidationError("Tekst musi zawierać co najmniej 1000 znaków");
    } else if (sourceText.length > 10000) {
      setValidationError("Tekst nie może przekraczać 10000 znaków");
    } else {
      setValidationError(null);
    }
  }, [sourceText]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validationError && !isLoading && sourceText.length >= 1000) {
      onSubmit(sourceText);
    }
  };

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setSourceText(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Textarea
          value={sourceText}
          onChange={handleTextChange}
          placeholder="Wprowadź tekst źródłowy do wygenerowania fiszek..."
          className="min-h-[200px] max-h-[400px] resize-none bg-white"
          disabled={isLoading}
        />
        <div className="flex justify-between text-sm text-gray-500">
          <span>{charCount} znaków</span>
          {validationError && <span className="text-red-500">{validationError}</span>}
        </div>
      </div>
      <Button
        type="submit"
        disabled={!!validationError || isLoading || sourceText.length < 1000}
        className="w-full sm:w-auto"
      >
        {isLoading ? "Generowanie..." : "Generuj fiszki"}
      </Button>
    </form>
  );
}
