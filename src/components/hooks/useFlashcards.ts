import type { CreateFlashcardDTO, FlashcardResponseDTO, FlashcardsResponseDTO, UpdateFlashcardDTO } from "@/types";
import { useEffect, useState } from "react";

interface UseFlashcardsOptions {
  initialPage?: number;
  initialLimit?: number;
}

interface UseFlashcardsReturn {
  flashcards: FlashcardResponseDTO[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  addFlashcard: (flashcard: CreateFlashcardDTO) => Promise<void>;
  updateFlashcard: (id: number, data: UpdateFlashcardDTO) => Promise<void>;
  removeFlashcard: (id: number) => Promise<void>;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
}

const DEFAULT_PAGE_SIZE = 9; // Ustawienie domyślnej wartości na najmniejszą z PAGE_SIZE_OPTIONS

export function useFlashcards({
  initialPage = 1,
  initialLimit = DEFAULT_PAGE_SIZE,
}: UseFlashcardsOptions = {}): UseFlashcardsReturn {
  const [flashcards, setFlashcards] = useState<FlashcardResponseDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: initialPage,
    limit: initialLimit,
    total: 0,
  });

  // Fetch flashcards with pagination
  const fetchFlashcards = async (page: number, limit: number) => {
    try {
      setIsLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort: "created_at",
        order: "desc",
      });

      const response = await fetch(`/api/flashcards?${queryParams}`);

      if (!response.ok) {
        throw new Error("Failed to fetch flashcards");
      }

      const data: FlashcardsResponseDTO = await response.json();
      setFlashcards(data.data);
      setPagination((prev) => ({
        ...prev,
        ...data.pagination,
      }));
    } catch (err) {
      setError("Failed to load flashcards. Please try again.");
      console.error("Error fetching flashcards:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Update page number
  const setPage = (page: number) => {
    setPagination((prev) => ({
      ...prev,
      page,
    }));
  };

  // Update items per page
  const setLimit = (limit: number) => {
    setPagination((prev) => ({
      ...prev,
      page: 1, // Reset to first page when changing limit
      limit,
    }));
  };

  // Fetch data when pagination changes
  useEffect(() => {
    fetchFlashcards(pagination.page, pagination.limit);
  }, [pagination.page, pagination.limit]);

  const addFlashcard = async (flashcard: CreateFlashcardDTO) => {
    try {
      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          flashcards: [flashcard],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create flashcard");
      }

      // Refresh the current page to show the new flashcard
      await fetchFlashcards(pagination.page, pagination.limit);
    } catch (err) {
      console.error("Error creating flashcard:", err);
      throw err;
    }
  };

  const updateFlashcard = async (id: number, data: UpdateFlashcardDTO) => {
    try {
      const response = await fetch(`/api/flashcards/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update flashcard");
      }

      const updatedFlashcard = await response.json();
      // Update the flashcard in the current list
      setFlashcards((prev) => prev.map((flashcard) => (flashcard.id === id ? updatedFlashcard : flashcard)));
    } catch (err) {
      console.error("Error updating flashcard:", err);
      throw err;
    }
  };

  const removeFlashcard = async (id: number) => {
    try {
      const response = await fetch(`/api/flashcards/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete flashcard");
      }

      // After successful deletion, check if we need to go to the previous page
      const isLastItemOnPage = flashcards.length === 1 && pagination.page > 1;
      if (isLastItemOnPage) {
        setPagination((prev) => ({
          ...prev,
          page: prev.page - 1,
        }));
      } else {
        await fetchFlashcards(pagination.page, pagination.limit);
      }
    } catch (err) {
      console.error("Error deleting flashcard:", err);
      throw err;
    }
  };

  return {
    flashcards,
    isLoading,
    error,
    pagination,
    addFlashcard,
    updateFlashcard,
    removeFlashcard,
    setPage,
    setLimit,
  };
}
