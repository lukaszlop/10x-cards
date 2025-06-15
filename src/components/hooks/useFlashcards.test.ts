import type { CreateFlashcardDTO, FlashcardResponseDTO, FlashcardsResponseDTO, UpdateFlashcardDTO } from "@/types";
import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it } from "vitest";
import { server } from "../../test/setup";
import { useFlashcards } from "./useFlashcards";

// Test data factories
const createMockFlashcard = (id: number, overrides: Partial<FlashcardResponseDTO> = {}): FlashcardResponseDTO => ({
  id,
  front: `Question ${id}`,
  back: `Answer ${id}`,
  source: "manual",
  generation_id: null,
  user_id: "test-user-id",
  created_at: new Date(Date.now() - id * 1000).toISOString(),
  updated_at: new Date(Date.now() - id * 1000).toISOString(),
  ...overrides,
});

const createMockResponse = (
  flashcards: FlashcardResponseDTO[],
  pagination = { page: 1, limit: 9, total: flashcards.length }
): FlashcardsResponseDTO => ({
  data: flashcards,
  pagination,
});

describe("useFlashcards", () => {
  beforeEach(() => {
    // Reset any runtime handlers after each test
    server.resetHandlers();
  });

  describe("Initial State", () => {
    it("should initialize with correct default values", () => {
      // Arrange & Act
      const { result } = renderHook(() => useFlashcards());

      // Assert
      expect(result.current.flashcards).toEqual([]);
      expect(result.current.isLoading).toBe(true);
      expect(result.current.error).toBe(null);
      expect(result.current.pagination).toEqual({
        page: 1,
        limit: 9, // DEFAULT_PAGE_SIZE
        total: 0,
      });
    });

    it("should initialize with custom options", () => {
      // Arrange & Act
      const { result } = renderHook(() =>
        useFlashcards({
          initialPage: 2,
          initialLimit: 18,
        })
      );

      // Assert
      expect(result.current.pagination.page).toBe(2);
      expect(result.current.pagination.limit).toBe(18);
    });
  });

  describe("Fetching Flashcards", () => {
    it("should fetch flashcards successfully on mount", async () => {
      // Arrange
      const mockFlashcards = [createMockFlashcard(1), createMockFlashcard(2)];
      const mockResponse = createMockResponse(mockFlashcards);

      server.use(
        http.get("/api/flashcards", ({ request }) => {
          const url = new URL(request.url);
          const page = url.searchParams.get("page");
          const limit = url.searchParams.get("limit");
          const sort = url.searchParams.get("sort");
          const order = url.searchParams.get("order");

          // Verify correct parameters
          expect(page).toBe("1");
          expect(limit).toBe("9");
          expect(sort).toBe("created_at");
          expect(order).toBe("desc");

          return HttpResponse.json(mockResponse);
        })
      );

      // Act
      const { result } = renderHook(() => useFlashcards());

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.flashcards).toEqual(mockFlashcards);
      expect(result.current.pagination.total).toBe(2);
      expect(result.current.error).toBe(null);
    });

    it("should handle fetch error gracefully", async () => {
      // Arrange
      server.use(
        http.get("/api/flashcards", () => {
          return HttpResponse.error();
        })
      );

      // Act
      const { result } = renderHook(() => useFlashcards());

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe("Błąd podczas ładowania fiszek. Spróbuj ponownie.");
      expect(result.current.flashcards).toEqual([]);
    });

    it("should handle API error response", async () => {
      // Arrange
      server.use(
        http.get("/api/flashcards", () => {
          return new HttpResponse(null, { status: 500 });
        })
      );

      // Act
      const { result } = renderHook(() => useFlashcards());

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe("Błąd podczas ładowania fiszek. Spróbuj ponownie.");
    });
  });

  describe("Pagination", () => {
    it("should update page and refetch data", async () => {
      // Arrange - Setup handlers for both pages
      const initialFlashcards = [createMockFlashcard(1)];
      const secondPageFlashcards = [createMockFlashcard(2)];

      server.use(
        http.get("/api/flashcards", ({ request }) => {
          const url = new URL(request.url);
          const page = url.searchParams.get("page");

          if (page === "1") {
            return HttpResponse.json(createMockResponse(initialFlashcards));
          } else if (page === "2") {
            return HttpResponse.json(createMockResponse(secondPageFlashcards, { page: 2, limit: 9, total: 2 }));
          }

          return HttpResponse.json(createMockResponse([]));
        })
      );

      const { result } = renderHook(() => useFlashcards());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.flashcards).toEqual(initialFlashcards);
      });

      // Act - Change page
      result.current.setPage(2);

      // Assert
      await waitFor(() => {
        expect(result.current.pagination.page).toBe(2);
        expect(result.current.flashcards).toEqual(secondPageFlashcards);
      });
    });

    it("should reset to page 1 when changing limit", async () => {
      // Arrange
      const initialFlashcards = [createMockFlashcard(1)];

      server.use(
        http.get("/api/flashcards", ({ request }) => {
          const url = new URL(request.url);
          const page = url.searchParams.get("page");
          const limit = url.searchParams.get("limit");

          if (limit === "18") {
            expect(page).toBe("1"); // Should reset to page 1
            return HttpResponse.json(createMockResponse(initialFlashcards, { page: 1, limit: 18, total: 1 }));
          }

          return HttpResponse.json(createMockResponse(initialFlashcards));
        })
      );

      const { result } = renderHook(() => useFlashcards({ initialPage: 2 }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Act - Change limit
      result.current.setLimit(18);

      // Assert
      await waitFor(() => {
        expect(result.current.pagination.page).toBe(1);
        expect(result.current.pagination.limit).toBe(18);
      });
    });
  });

  describe("Add Flashcard", () => {
    it("should add flashcard successfully and refresh data", async () => {
      // Arrange - Initial load
      const initialFlashcards = [createMockFlashcard(1)];
      const refreshedFlashcards = [createMockFlashcard(2), createMockFlashcard(1)];
      let getCallCount = 0;

      server.use(
        http.get("/api/flashcards", () => {
          getCallCount++;
          if (getCallCount === 1) {
            return HttpResponse.json(createMockResponse(initialFlashcards));
          }
          return HttpResponse.json(createMockResponse(refreshedFlashcards));
        }),
        http.post("/api/flashcards", async ({ request }) => {
          const body = (await request.json()) as CreateFlashcardDTO;
          expect(body.front).toBe("New question");
          expect(body.back).toBe("New answer");
          expect(body.source).toBe("manual");
          return HttpResponse.json({ id: 2 });
        })
      );

      const { result } = renderHook(() => useFlashcards());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const newFlashcard: CreateFlashcardDTO = {
        front: "New question",
        back: "New answer",
        source: "manual",
        generation_id: null,
      };

      // Act
      await result.current.addFlashcard(newFlashcard);

      // Assert - Should have refreshed data
      await waitFor(() => {
        expect(result.current.flashcards.length).toBe(2);
      });
    });

    it("should handle add flashcard error", async () => {
      // Arrange - Initial load
      server.use(
        http.get("/api/flashcards", () => {
          return HttpResponse.json(createMockResponse([]));
        }),
        http.post("/api/flashcards", () => {
          return new HttpResponse(null, { status: 400 });
        })
      );

      const { result } = renderHook(() => useFlashcards());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const newFlashcard: CreateFlashcardDTO = {
        front: "New question",
        back: "New answer",
        source: "manual",
        generation_id: null,
      };

      // Act & Assert
      await expect(result.current.addFlashcard(newFlashcard)).rejects.toThrow();
    });
  });

  describe("Update Flashcard", () => {
    it("should update flashcard in place successfully", async () => {
      // Arrange - Initial load
      const initialFlashcards = [createMockFlashcard(1), createMockFlashcard(2)];
      const updatedFlashcard = createMockFlashcard(1, { front: "Updated question" });

      server.use(
        http.get("/api/flashcards", () => {
          return HttpResponse.json(createMockResponse(initialFlashcards));
        }),
        http.put("/api/flashcards", async ({ request }) => {
          const body = (await request.json()) as UpdateFlashcardDTO & { id: number };
          expect(body.id).toBe(1);
          expect(body.front).toBe("Updated question");
          return HttpResponse.json(updatedFlashcard);
        })
      );

      const { result } = renderHook(() => useFlashcards());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const updateData: UpdateFlashcardDTO = {
        front: "Updated question",
        back: "Answer 1",
        source: "manual",
      };

      // Act
      await result.current.updateFlashcard(1, updateData);

      // Assert - Should update flashcard in place
      await waitFor(() => {
        expect(result.current.flashcards[0].front).toBe("Updated question");
      });
    });

    it("should handle update flashcard error", async () => {
      // Arrange - Initial load
      const initialFlashcards = [createMockFlashcard(1)];

      server.use(
        http.get("/api/flashcards", () => {
          return HttpResponse.json(createMockResponse(initialFlashcards));
        }),
        http.put("/api/flashcards", () => {
          return new HttpResponse(null, { status: 404 });
        })
      );

      const { result } = renderHook(() => useFlashcards());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const updateData: UpdateFlashcardDTO = {
        front: "Updated question",
        back: "Updated answer",
        source: "manual",
      };

      // Act & Assert
      await expect(result.current.updateFlashcard(1, updateData)).rejects.toThrow();
    });
  });

  describe("Remove Flashcard", () => {
    it("should remove flashcard and refresh data", async () => {
      // Arrange - Initial load with multiple flashcards
      const initialFlashcards = [createMockFlashcard(1), createMockFlashcard(2)];
      const remainingFlashcards = [createMockFlashcard(2)];
      let getCallCount = 0;

      server.use(
        http.get("/api/flashcards", () => {
          getCallCount++;
          if (getCallCount === 1) {
            return HttpResponse.json(createMockResponse(initialFlashcards));
          }
          return HttpResponse.json(createMockResponse(remainingFlashcards));
        }),
        http.delete("/api/flashcards", async ({ request }) => {
          const body = (await request.json()) as { id: number };
          expect(body.id).toBe(1);
          return HttpResponse.json({});
        })
      );

      const { result } = renderHook(() => useFlashcards());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Act
      await result.current.removeFlashcard(1);

      // Assert - Should have refreshed and removed the flashcard
      await waitFor(() => {
        expect(result.current.flashcards.length).toBe(1);
        expect(result.current.flashcards[0].id).toBe(2);
      });
    });

    it("should go to previous page when deleting last item on page > 1", async () => {
      // Arrange - Single item on page 2
      const singleFlashcard = [createMockFlashcard(1)];

      server.use(
        http.get("/api/flashcards", ({ request }) => {
          const url = new URL(request.url);
          const page = url.searchParams.get("page");

          if (page === "2") {
            return HttpResponse.json(createMockResponse(singleFlashcard, { page: 2, limit: 9, total: 1 }));
          }
          return HttpResponse.json(createMockResponse([]));
        }),
        http.delete("/api/flashcards", () => {
          return HttpResponse.json({});
        })
      );

      const { result } = renderHook(() => useFlashcards({ initialPage: 2 }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.pagination.page).toBe(2);
        expect(result.current.flashcards.length).toBe(1);
      });

      // Act - Delete the last item on page 2
      await result.current.removeFlashcard(1);

      // Assert - Should go back to page 1
      await waitFor(() => {
        expect(result.current.pagination.page).toBe(1);
      });
    });

    it("should handle remove flashcard error", async () => {
      // Arrange - Initial load
      const initialFlashcards = [createMockFlashcard(1)];

      server.use(
        http.get("/api/flashcards", () => {
          return HttpResponse.json(createMockResponse(initialFlashcards));
        }),
        http.delete("/api/flashcards", () => {
          return new HttpResponse(null, { status: 404 });
        })
      );

      const { result } = renderHook(() => useFlashcards());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Act & Assert
      await expect(result.current.removeFlashcard(1)).rejects.toThrow();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty flashcards list", async () => {
      // Arrange
      server.use(
        http.get("/api/flashcards", () => {
          return HttpResponse.json(createMockResponse([]));
        })
      );

      // Act
      const { result } = renderHook(() => useFlashcards());

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.flashcards).toEqual([]);
      expect(result.current.pagination.total).toBe(0);
    });

    it("should preserve credentials in all API calls", async () => {
      // Arrange
      let requestsReceived = 0;

      server.use(
        http.get("/api/flashcards", ({ request }) => {
          requestsReceived++;
          // Verify that credentials are being sent (MSW receives the full request)
          expect(request.credentials).toBe("include");
          return HttpResponse.json(createMockResponse([]));
        }),
        http.post("/api/flashcards", ({ request }) => {
          requestsReceived++;
          expect(request.credentials).toBe("include");
          return HttpResponse.json({ id: 1 });
        }),
        http.put("/api/flashcards", ({ request }) => {
          requestsReceived++;
          expect(request.credentials).toBe("include");
          return HttpResponse.json(createMockFlashcard(1));
        }),
        http.delete("/api/flashcards", ({ request }) => {
          requestsReceived++;
          expect(request.credentials).toBe("include");
          return HttpResponse.json({});
        })
      );

      const { result } = renderHook(() => useFlashcards());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Act - Test all API methods
      await result.current.addFlashcard({
        front: "Test",
        back: "Test",
        source: "manual",
        generation_id: null,
      });

      await result.current.updateFlashcard(1, {
        front: "Updated",
        back: "Updated",
        source: "manual",
      });

      await result.current.removeFlashcard(1);

      // Assert - All requests should have been intercepted with credentials
      expect(requestsReceived).toBeGreaterThanOrEqual(4);
    });

    it("should handle malformed API response", async () => {
      // Arrange
      server.use(
        http.get("/api/flashcards", () => {
          return HttpResponse.json(null); // Malformed response
        })
      );

      // Act
      const { result } = renderHook(() => useFlashcards());

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe("Błąd podczas ładowania fiszek. Spróbuj ponownie.");
    });
  });

  describe("Business Rules", () => {
    it("should use correct default page size", () => {
      // Arrange & Act
      const { result } = renderHook(() => useFlashcards());

      // Assert - DEFAULT_PAGE_SIZE should be 9
      expect(result.current.pagination.limit).toBe(9);
    });

    it("should use correct API parameters for sorting", async () => {
      // Arrange
      let requestReceived = false;

      server.use(
        http.get("/api/flashcards", ({ request }) => {
          const url = new URL(request.url);
          const sort = url.searchParams.get("sort");
          const order = url.searchParams.get("order");

          expect(sort).toBe("created_at");
          expect(order).toBe("desc");
          requestReceived = true;

          return HttpResponse.json(createMockResponse([]));
        })
      );

      // Act
      renderHook(() => useFlashcards());

      // Assert
      await waitFor(() => {
        expect(requestReceived).toBe(true);
      });
    });

    it("should maintain type safety in all operations", () => {
      // Arrange & Act
      const { result } = renderHook(() => useFlashcards());

      // Assert - TypeScript should ensure all methods exist and have correct signatures
      expect(typeof result.current.addFlashcard).toBe("function");
      expect(typeof result.current.updateFlashcard).toBe("function");
      expect(typeof result.current.removeFlashcard).toBe("function");
      expect(typeof result.current.setPage).toBe("function");
      expect(typeof result.current.setLimit).toBe("function");
    });
  });
});
