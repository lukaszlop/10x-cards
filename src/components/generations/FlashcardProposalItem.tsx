import { useState } from "react";
import { EditFlashcardModal } from ".";
import type { ProposalViewModel } from "../../types";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Switch } from "../ui/switch";

interface FlashcardProposalItemProps {
  proposal: ProposalViewModel;
  index: number;
  onUpdate: (index: number, updatedData: Partial<ProposalViewModel>) => void;
  onToggleAcceptance: (index: number) => void;
}

export function FlashcardProposalItem({ proposal, index, onUpdate, onToggleAcceptance }: FlashcardProposalItemProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Handler dla zmian ze Switcha
  const handleAcceptanceChange = () => {
    onToggleAcceptance(index);
  };

  // Handler dla zapisanych zmian z modalu
  const handleEditSave = (editedData: Partial<ProposalViewModel>) => {
    onUpdate(index, editedData);
    setIsEditModalOpen(false);
  };

  return (
    <>
      <Card className="flex flex-col h-[350px]">
        {proposal.isEdited && (
          <p className="text-sm font-medium text-blue-500 block z-1 bg-white mx-6 mb-[-44px]">Edytowano</p>
        )}
        <CardContent className="flex-grow mt-2 pt-6 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 scrollbar-thumb-rounded-full scrollbar-track-rounded-full ">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Przód fiszki</h3>

            <p className="mt-1">{proposal.currentFront}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Tył fiszki</h3>
            <p className="mt-1">{proposal.currentBack}</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center border-t bg-gray-50/50">
          <div className="flex items-center space-x-2">
            <Switch checked={proposal.isAccepted} onCheckedChange={handleAcceptanceChange} />
            <span className="text-sm text-gray-500">{proposal.isAccepted ? "Zaakceptowana" : "Odrzucona"}</span>
          </div>
          <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
            Edytuj
          </Button>
        </CardFooter>
      </Card>

      <EditFlashcardModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        proposal={proposal}
        onSave={handleEditSave}
      />
    </>
  );
}
