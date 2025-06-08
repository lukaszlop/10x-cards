import { FlashcardProposalItem } from ".";
import type { ProposalViewModel } from "../../types";

interface FlashcardProposalListProps {
  proposals: ProposalViewModel[];
  onUpdateProposal: (index: number, updatedData: Partial<ProposalViewModel>) => void;
  onToggleAcceptance: (index: number) => void;
}

export function FlashcardProposalList({ proposals, onUpdateProposal, onToggleAcceptance }: FlashcardProposalListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {proposals.map((proposal, index) => (
        <FlashcardProposalItem
          key={proposal.id}
          proposal={proposal}
          index={index}
          onUpdate={onUpdateProposal}
          onToggleAcceptance={onToggleAcceptance}
        />
      ))}
    </div>
  );
}
