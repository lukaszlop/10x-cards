import { useState } from "react";
import { BulkSaveButton, FlashcardGenerationForm, FlashcardProposalList, SkeletonLoader } from ".";
import type { GenerationDTO, GenerationFlashcardProposal, GenerationViewState, ProposalViewModel } from "../../types";
import { useToastManager } from "../hooks/useToastManager";

export function GenerationsView() {
  const toastManager = useToastManager();

  const [state, setState] = useState<GenerationViewState>({
    sourceText: "",
    isLoadingProposals: false,
    isSavingFlashcards: false,
    proposals: [],
    generationId: null,
    error: null,
    editingProposalIndex: null,
  });

  const resetState = () => {
    setState({
      sourceText: "",
      isLoadingProposals: false,
      isSavingFlashcards: false,
      proposals: [],
      generationId: null,
      error: null,
      editingProposalIndex: null,
    });
  };

  const handleGenerateProposals = async (sourceText: string) => {
    setState((prev) => ({ ...prev, isLoadingProposals: true, error: null }));

    try {
      const response = await fetch("/api/generations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source_text: sourceText }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate flashcards");
      }

      const data = (await response.json()) as GenerationDTO;
      const proposals: ProposalViewModel[] = data.flashcards_proposals.map(
        (proposal: GenerationFlashcardProposal, index: number) => ({
          id: `proposal-${index}`,
          originalFront: proposal.front,
          originalBack: proposal.back,
          currentFront: proposal.front,
          currentBack: proposal.back,
          isEdited: false,
          isAccepted: false,
          generation_id_internal: data.generation_id,
        })
      );

      setState((prev) => ({
        ...prev,
        proposals,
        generationId: data.generation_id,
        isLoadingProposals: false,
        sourceText,
      }));

      // Show success toast after proposals are generated
      toastManager.showSuccess(
        `Wygenerowano ${proposals.length} ${proposals.length === 1 ? "propozycję" : proposals.length <= 4 ? "propozycje" : "propozycji"} fiszek! Sprawdź i zaakceptuj te, które Ci się podobają.`
      );
    } catch (error) {
      console.error("Error generating flashcards:", error);
      setState((prev) => ({
        ...prev,
        isLoadingProposals: false,
        error: "Nie udało się wygenerować fiszek. Spróbuj ponownie.",
      }));
      toastManager.showError("Nie udało się wygenerować fiszek. Spróbuj ponownie.");
    }
  };

  const handleSaveFlashcards = async (saveAll: boolean) => {
    const flashcardsToSave = saveAll ? state.proposals : state.proposals.filter((p) => p.isAccepted);

    if (flashcardsToSave.length === 0) return;

    setState((prev) => ({ ...prev, isSavingFlashcards: true, error: null }));

    try {
      const flashcardsData = flashcardsToSave.map((proposal) => ({
        front: proposal.currentFront,
        back: proposal.currentBack,
        source: proposal.isEdited ? ("ai-edited" as const) : ("ai-full" as const),
        generation_id: proposal.generation_id_internal,
      }));

      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flashcards: flashcardsData }),
      });

      if (!response.ok) {
        throw new Error("Failed to save flashcards");
      }

      toastManager.showSuccess(`Zapisano ${flashcardsToSave.length} fiszek. Możesz teraz wygenerować kolejne.`);

      resetState();
    } catch (error) {
      console.error("Error saving flashcards:", error);
      setState((prev) => ({
        ...prev,
        isSavingFlashcards: false,
        error: "Nie udało się zapisać fiszek. Spróbuj ponownie.",
      }));
      toastManager.showError("Nie udało się zapisać fiszek. Spróbuj ponownie.");
    }
  };

  const handleToggleAcceptance = (index: number) => {
    setState((prev) => ({
      ...prev,
      proposals: prev.proposals.map((p, i) => (i === index ? { ...p, isAccepted: !p.isAccepted } : p)),
    }));
  };

  const handleUpdateProposal = (index: number, updatedData: Partial<ProposalViewModel>) => {
    setState((prev) => ({
      ...prev,
      proposals: prev.proposals.map((p, i) =>
        i === index
          ? {
              ...p,
              ...updatedData,
              isEdited:
                updatedData.isEdited ??
                (updatedData.currentFront !== undefined || updatedData.currentBack !== undefined),
              isAccepted: updatedData.isAccepted ?? p.isAccepted,
            }
          : p
      ),
    }));
  };

  return (
    <div className="space-y-8">
      <FlashcardGenerationForm
        onSubmit={handleGenerateProposals}
        isLoading={state.isLoadingProposals}
        initialText={state.sourceText}
      />

      {state.isLoadingProposals && <SkeletonLoader />}

      {!state.isLoadingProposals && state.proposals.length > 0 && (
        <>
          <FlashcardProposalList
            proposals={state.proposals}
            onUpdateProposal={handleUpdateProposal}
            onToggleAcceptance={handleToggleAcceptance}
          />
          <BulkSaveButton
            onSave={handleSaveFlashcards}
            isSaving={state.isSavingFlashcards}
            acceptedCount={state.proposals.filter((p) => p.isAccepted).length}
            totalCount={state.proposals.length}
          />
        </>
      )}
    </div>
  );
}
