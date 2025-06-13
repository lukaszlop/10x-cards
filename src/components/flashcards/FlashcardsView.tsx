import { useFlashcards } from "@/components/hooks/useFlashcards";
import { Button } from "@/components/ui/button";
import type { FlashcardResponseDTO, FlashcardsViewState, ManualFlashcardDTO, UpdateFlashcardDTO } from "@/types";
import { useState } from "react";
import { toast } from "sonner";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";
import { FlashcardFormModal } from "./FlashcardFormModal";
import { FlashcardsList } from "./FlashcardsList";
import { PaginationControls } from "./PaginationControls";

const DEFAULT_PAGE_SIZE = 9; // Ustawienie domyślnej wartości na najmniejszą z PAGE_SIZE_OPTIONS

export function FlashcardsView() {
  const {
    flashcards,
    isLoading,
    error,
    pagination,
    addFlashcard,
    updateFlashcard,
    removeFlashcard,
    setPage,
    setLimit,
  } = useFlashcards({ initialLimit: DEFAULT_PAGE_SIZE });

  const [state, setState] = useState<Omit<FlashcardsViewState, "flashcards" | "isLoading" | "error">>({
    isModalOpen: false,
    modalMode: null,
    editingFlashcard: null,
    isDeleteDialogOpen: false,
    deletingFlashcardId: null,
  });

  // Modal handlers
  const handleOpenCreateModal = () => {
    setState((prev) => ({
      ...prev,
      isModalOpen: true,
      modalMode: "create",
      editingFlashcard: null,
    }));
  };

  const handleOpenEditModal = (flashcard: FlashcardResponseDTO) => {
    setState((prev) => ({
      ...prev,
      isModalOpen: true,
      modalMode: "edit",
      editingFlashcard: flashcard,
    }));
  };

  const handleCloseModal = () => {
    setState((prev) => ({
      ...prev,
      isModalOpen: false,
      modalMode: null,
      editingFlashcard: null,
    }));
  };

  // Delete dialog handlers
  const handleOpenDeleteDialog = (flashcardId: number) => {
    setState((prev) => ({
      ...prev,
      isDeleteDialogOpen: true,
      deletingFlashcardId: flashcardId,
    }));
  };

  const handleCloseDeleteDialog = () => {
    setState((prev) => ({
      ...prev,
      isDeleteDialogOpen: false,
      deletingFlashcardId: null,
    }));
  };

  // Form submission handlers
  const handleSubmit = async (data: UpdateFlashcardDTO) => {
    if (!data.front || !data.back) {
      toast.error("Przód fiszki i tył fiszki są wymagane");
      return;
    }

    try {
      if (state.modalMode === "create") {
        const newFlashcard: ManualFlashcardDTO = {
          front: data.front,
          back: data.back,
          source: "manual",
          generation_id: null,
        };
        await addFlashcard(newFlashcard);
        toast.success("Fiszka została dodana");
      } else if (state.modalMode === "edit" && state.editingFlashcard) {
        const source =
          state.editingFlashcard.source === "ai-full"
            ? ("ai-edited" as const)
            : state.editingFlashcard.source === "manual" || state.editingFlashcard.source === "ai-edited"
              ? state.editingFlashcard.source
              : ("ai-edited" as const);

        await updateFlashcard(state.editingFlashcard.id, {
          ...data,
          source,
        });
        toast.success("Fiszka została zaktualizowana");
      }
      handleCloseModal();
    } catch (error) {
      console.error("Failed to save flashcard:", error);
      toast.error("Nie udało się zapisać fiszki. Spróbuj ponownie.");
    }
  };

  const handleDelete = async () => {
    if (!state.deletingFlashcardId) return;

    try {
      await removeFlashcard(state.deletingFlashcardId);
      toast.success("Fiszka została usunięta");
      handleCloseDeleteDialog();
    } catch (error) {
      console.error("Failed to delete flashcard:", error);
      toast.error("Nie udało się usunąć fiszki. Spróbuj ponownie.");
    }
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Spróbuj ponownie</Button>
      </div>
    );
  }

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button onClick={handleOpenCreateModal}>Dodaj nową fiszkę</Button>
      </div>

      <FlashcardsList
        flashcards={flashcards}
        isLoading={isLoading}
        onEdit={handleOpenEditModal}
        onDelete={handleOpenDeleteDialog}
      />

      {!isLoading && flashcards.length > 0 && (
        <PaginationControls
          currentPage={pagination.page}
          totalPages={totalPages}
          pageSize={pagination.limit}
          onPageChange={setPage}
          onPageSizeChange={setLimit}
        />
      )}

      <FlashcardFormModal
        isOpen={state.isModalOpen}
        mode={state.modalMode}
        initialData={state.editingFlashcard}
        onSubmit={handleSubmit}
        onClose={handleCloseModal}
      />

      <DeleteConfirmationDialog
        isOpen={state.isDeleteDialogOpen}
        onConfirm={handleDelete}
        onCancel={handleCloseDeleteDialog}
      />
    </div>
  );
}
