import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { FlashcardResponseDTO } from "@/types";
import { SkeletonLoader } from "./SkeletonLoader";

interface FlashcardsListProps {
  flashcards: FlashcardResponseDTO[];
  isLoading: boolean;
  onEdit: (flashcard: FlashcardResponseDTO) => void;
  onDelete: (flashcardId: number) => void;
}

export function FlashcardsList({ flashcards, isLoading, onEdit, onDelete }: FlashcardsListProps) {
  if (isLoading) {
    return <SkeletonLoader />;
  }

  if (flashcards.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">Nie znaleziono fiszek. Dodaj swoją pierwszą fiszkę!</div>
    );
  }

  // Sort flashcards by creation date (newest first)
  const sortedFlashcards = [...flashcards].sort((a, b) => {
    const dateA = new Date(a.created_at);
    const dateB = new Date(b.created_at);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {sortedFlashcards.map((flashcard) => (
        <Card key={flashcard.id} className="flex flex-col h-[350px]">
          <CardContent className="flex-grow pt-6 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 scrollbar-thumb-rounded-full scrollbar-track-rounded-full">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Przód fiszki</h3>
              <p className="mt-1">{flashcard.front}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Tył fiszki</h3>
              <p className="mt-1">{flashcard.back}</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 border-t bg-gray-50/50">
            <Button variant="outline" size="sm" onClick={() => onEdit(flashcard)}>
              Edytuj
            </Button>
            <Button variant="destructive" size="sm" onClick={() => onDelete(flashcard.id)}>
              Usuń
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
