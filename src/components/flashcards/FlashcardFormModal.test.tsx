import type { FlashcardResponseDTO } from "@/types";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FlashcardFormModal } from "./FlashcardFormModal";

// Mock UI components
interface MockButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  variant?: string;
  [key: string]: unknown;
}

interface MockDialogProps {
  children: React.ReactNode;
  open?: boolean;
}

interface MockTextareaProps {
  className?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  [key: string]: unknown;
}

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, disabled, type, variant, ...props }: MockButtonProps) => (
    <button onClick={onClick} disabled={disabled} type={type} data-variant={variant} {...props}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: MockDialogProps) => (
    <div role="dialog" style={{ display: open ? "block" : "none" }}>
      {children}
    </div>
  ),
  DialogContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/ui/textarea", () => ({
  Textarea: ({ className, placeholder, value, onChange, ...props }: MockTextareaProps) => (
    <textarea className={className} placeholder={placeholder} value={value} onChange={onChange} {...props} />
  ),
}));

// Test data factories
const createMockFlashcard = (overrides: Partial<FlashcardResponseDTO> = {}): FlashcardResponseDTO => ({
  id: 1,
  front: "Test question",
  back: "Test answer",
  source: "manual",
  generation_id: null,
  user_id: "test-user",
  created_at: "2023-01-01T00:00:00.000Z",
  updated_at: "2023-01-01T00:00:00.000Z",
  ...overrides,
});

const createLongText = (length: number): string => "a".repeat(length);

describe("FlashcardFormModal", () => {
  // Mock functions
  const mockOnSubmit = vi.fn();
  const mockOnClose = vi.fn();

  const defaultProps = {
    isOpen: true,
    mode: "create" as const,
    onSubmit: mockOnSubmit,
    onClose: mockOnClose,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should not render when closed", () => {
      // Arrange & Act
      render(<FlashcardFormModal {...defaultProps} isOpen={false} />);

      // Assert
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("should render create mode correctly", () => {
      // Arrange & Act
      render(<FlashcardFormModal {...defaultProps} mode="create" />);

      // Assert
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText("Dodaj nową fiszkę")).toBeInTheDocument();
      expect(screen.getByText("Wypełnij poniższy formularz, aby utworzyć nową fiszkę.")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Dodaj" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Anuluj" })).toBeInTheDocument();
    });

    it("should render edit mode correctly", () => {
      // Arrange & Act
      render(<FlashcardFormModal {...defaultProps} mode="edit" />);

      // Assert
      expect(screen.getByText("Edytuj fiszkę")).toBeInTheDocument();
      expect(screen.getByText("Zmodyfikuj zawartość fiszki według potrzeb.")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Zapisz zmiany" })).toBeInTheDocument();
    });

    it("should render form fields with correct labels and placeholders", () => {
      // Arrange & Act
      render(<FlashcardFormModal {...defaultProps} />);

      // Assert
      expect(screen.getByText("Przód fiszki")).toBeInTheDocument();
      expect(screen.getByText("Tył fiszki")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Wpisz pytanie...")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Wpisz odpowiedź...")).toBeInTheDocument();
    });
  });

  describe("Form Initialization", () => {
    it("should initialize with empty fields in create mode", () => {
      // Arrange & Act
      render(<FlashcardFormModal {...defaultProps} mode="create" />);

      // Assert
      const frontInput = screen.getByPlaceholderText("Wpisz pytanie...");
      const backInput = screen.getByPlaceholderText("Wpisz odpowiedź...");

      expect(frontInput).toHaveValue("");
      expect(backInput).toHaveValue("");
    });

    it("should initialize with initialData in edit mode", () => {
      // Arrange
      const initialData = createMockFlashcard({
        front: "Initial question",
        back: "Initial answer",
      });

      // Act
      render(<FlashcardFormModal {...defaultProps} mode="edit" initialData={initialData} />);

      // Assert
      const frontInput = screen.getByPlaceholderText("Wpisz pytanie...");
      const backInput = screen.getByPlaceholderText("Wpisz odpowiedź...");

      expect(frontInput).toHaveValue("Initial question");
      expect(backInput).toHaveValue("Initial answer");
    });

    it("should reset form when initialData changes", async () => {
      // Arrange
      const initialData1 = createMockFlashcard({
        front: "Question 1",
        back: "Answer 1",
      });

      const initialData2 = createMockFlashcard({
        front: "Question 2",
        back: "Answer 2",
      });

      const { rerender } = render(<FlashcardFormModal {...defaultProps} mode="edit" initialData={initialData1} />);

      // Act - Change initialData
      rerender(<FlashcardFormModal {...defaultProps} mode="edit" initialData={initialData2} />);

      // Assert
      await waitFor(() => {
        const frontInput = screen.getByPlaceholderText("Wpisz pytanie...");
        const backInput = screen.getByPlaceholderText("Wpisz odpowiedź...");

        expect(frontInput).toHaveValue("Question 2");
        expect(backInput).toHaveValue("Answer 2");
      });
    });

    it("should reset to empty when initialData becomes null", async () => {
      // Arrange
      const initialData = createMockFlashcard({
        front: "Some question",
        back: "Some answer",
      });

      const { rerender } = render(<FlashcardFormModal {...defaultProps} mode="edit" initialData={initialData} />);

      // Act - Remove initialData
      rerender(<FlashcardFormModal {...defaultProps} mode="create" initialData={null} />);

      // Assert
      await waitFor(() => {
        const frontInput = screen.getByPlaceholderText("Wpisz pytanie...");
        const backInput = screen.getByPlaceholderText("Wpisz odpowiedź...");

        expect(frontInput).toHaveValue("");
        expect(backInput).toHaveValue("");
      });
    });
  });

  describe("Character Counting", () => {
    it("should display correct character count for empty fields", () => {
      // Arrange & Act
      render(<FlashcardFormModal {...defaultProps} />);

      // Assert
      expect(screen.getByText("(0/200 znaków)")).toBeInTheDocument();
      expect(screen.getByText("(0/500 znaków)")).toBeInTheDocument();
    });

    it("should update character count when typing in front field", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<FlashcardFormModal {...defaultProps} />);

      const frontInput = screen.getByPlaceholderText("Wpisz pytanie...");

      // Act
      await user.type(frontInput, "Hello");

      // Assert
      await waitFor(() => {
        expect(screen.getByText("(5/200 znaków)")).toBeInTheDocument();
      });
    });

    it("should update character count when typing in back field", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<FlashcardFormModal {...defaultProps} />);

      const backInput = screen.getByPlaceholderText("Wpisz odpowiedź...");

      // Act
      await user.type(backInput, "World");

      // Assert
      await waitFor(() => {
        expect(screen.getByText("(5/500 znaków)")).toBeInTheDocument();
      });
    });

    it("should show red color when front text exceeds 200 characters", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<FlashcardFormModal {...defaultProps} />);

      const frontInput = screen.getByPlaceholderText("Wpisz pytanie...");
      const longText = createLongText(201);

      // Act
      await user.type(frontInput, longText);

      // Assert
      await waitFor(() => {
        const counterElement = screen.getByText("(201/200 znaków)");
        expect(counterElement).toHaveClass("text-red-500");
      });
    });

    it("should show red color when back text exceeds 500 characters", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<FlashcardFormModal {...defaultProps} />);

      const backInput = screen.getByPlaceholderText("Wpisz odpowiedź...");
      const longText = createLongText(501);

      // Act
      await user.type(backInput, longText);

      // Assert
      await waitFor(() => {
        const counterElement = screen.getByText("(501/500 znaków)");
        expect(counterElement).toHaveClass("text-red-500");
      });
    });

    it("should show gray color when text is within limits", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<FlashcardFormModal {...defaultProps} />);

      const frontInput = screen.getByPlaceholderText("Wpisz pytanie...");

      // Act
      await user.type(frontInput, "Normal text");

      // Assert
      await waitFor(() => {
        const counterElement = screen.getByText("(11/200 znaków)");
        expect(counterElement).toHaveClass("text-gray-500");
      });
    });
  });

  describe("Form Validation", () => {
    it("should show validation error for empty front field", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<FlashcardFormModal {...defaultProps} />);

      const backInput = screen.getByPlaceholderText("Wpisz odpowiedź...");
      const submitButton = screen.getByRole("button", { name: "Dodaj" });

      // Act - Fill only back field and submit
      await user.type(backInput, "Some answer");
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText("Przód fiszki jest wymagany")).toBeInTheDocument();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it("should show validation error for empty back field", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<FlashcardFormModal {...defaultProps} />);

      const frontInput = screen.getByPlaceholderText("Wpisz pytanie...");
      const submitButton = screen.getByRole("button", { name: "Dodaj" });

      // Act - Fill only front field and submit
      await user.type(frontInput, "Some question");
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText("Tył fiszki jest wymagany")).toBeInTheDocument();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it("should show validation error for front field exceeding 200 characters", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<FlashcardFormModal {...defaultProps} />);

      const frontInput = screen.getByPlaceholderText("Wpisz pytanie...");
      const backInput = screen.getByPlaceholderText("Wpisz odpowiedź...");
      const submitButton = screen.getByRole("button", { name: "Dodaj" });

      const longText = createLongText(201);

      // Act
      await user.type(frontInput, longText);
      await user.type(backInput, "Valid answer");

      // Assert - Submit button should be disabled due to character limit
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
        expect(screen.getByText("(201/200 znaków)")).toHaveClass("text-red-500");
      });

      // Try submitting - should not call onSubmit due to disabled button
      await user.click(submitButton);
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it("should show validation error for back field exceeding 500 characters", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<FlashcardFormModal {...defaultProps} />);

      const frontInput = screen.getByPlaceholderText("Wpisz pytanie...");
      const backInput = screen.getByPlaceholderText("Wpisz odpowiedź...");
      const submitButton = screen.getByRole("button", { name: "Dodaj" });

      const longText = createLongText(501);

      // Act
      await user.type(frontInput, "Valid question");
      await user.type(backInput, longText);

      // Assert - Submit button should be disabled due to character limit
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
        expect(screen.getByText("(501/500 znaków)")).toHaveClass("text-red-500");
      });

      // Try submitting - should not call onSubmit due to disabled button
      await user.click(submitButton);
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it("should submit valid form successfully", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<FlashcardFormModal {...defaultProps} />);

      const frontInput = screen.getByPlaceholderText("Wpisz pytanie...");
      const backInput = screen.getByPlaceholderText("Wpisz odpowiedź...");
      const submitButton = screen.getByRole("button", { name: "Dodaj" });

      // Act
      await user.type(frontInput, "Valid question");
      await user.type(backInput, "Valid answer");
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          front: "Valid question",
          back: "Valid answer",
        });
      });
    });
  });

  describe("Submit Button State", () => {
    it("should disable submit button initially in create mode", () => {
      // Arrange & Act
      render(<FlashcardFormModal {...defaultProps} mode="create" />);

      // Assert
      const submitButton = screen.getByRole("button", { name: "Dodaj" });
      expect(submitButton).toBeDisabled();
    });

    it("should enable submit button when form has valid changes in create mode", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<FlashcardFormModal {...defaultProps} mode="create" />);

      const frontInput = screen.getByPlaceholderText("Wpisz pytanie...");
      const backInput = screen.getByPlaceholderText("Wpisz odpowiedź...");

      // Act
      await user.type(frontInput, "Question");
      await user.type(backInput, "Answer");

      // Assert
      await waitFor(() => {
        const submitButton = screen.getByRole("button", { name: "Dodaj" });
        expect(submitButton).not.toBeDisabled();
      });
    });

    it("should disable submit button when front text exceeds 200 characters", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<FlashcardFormModal {...defaultProps} />);

      const frontInput = screen.getByPlaceholderText("Wpisz pytanie...");
      const backInput = screen.getByPlaceholderText("Wpisz odpowiedź...");

      // Act
      await user.type(frontInput, createLongText(201));
      await user.type(backInput, "Valid answer");

      // Assert
      await waitFor(() => {
        const submitButton = screen.getByRole("button", { name: "Dodaj" });
        expect(submitButton).toBeDisabled();
      });
    });

    it("should disable submit button when back text exceeds 500 characters", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<FlashcardFormModal {...defaultProps} />);

      const frontInput = screen.getByPlaceholderText("Wpisz pytanie...");
      const backInput = screen.getByPlaceholderText("Wpisz odpowiedź...");

      // Act
      await user.type(frontInput, "Valid question");
      await user.type(backInput, createLongText(501));

      // Assert
      await waitFor(() => {
        const submitButton = screen.getByRole("button", { name: "Dodaj" });
        expect(submitButton).toBeDisabled();
      });
    });

    it("should disable submit button in edit mode when no changes made", () => {
      // Arrange
      const initialData = createMockFlashcard({
        front: "Original question",
        back: "Original answer",
      });

      // Act
      render(<FlashcardFormModal {...defaultProps} mode="edit" initialData={initialData} />);

      // Assert
      const submitButton = screen.getByRole("button", { name: "Zapisz zmiany" });
      expect(submitButton).toBeDisabled();
    });

    it("should enable submit button in edit mode when changes are made", async () => {
      // Arrange
      const user = userEvent.setup();
      const initialData = createMockFlashcard({
        front: "Original question",
        back: "Original answer",
      });

      render(<FlashcardFormModal {...defaultProps} mode="edit" initialData={initialData} />);

      const frontInput = screen.getByPlaceholderText("Wpisz pytanie...");

      // Act - Make a change
      await user.clear(frontInput);
      await user.type(frontInput, "Modified question");

      // Assert
      await waitFor(() => {
        const submitButton = screen.getByRole("button", { name: "Zapisz zmiany" });
        expect(submitButton).not.toBeDisabled();
      });
    });

    it("should disable submit button when edited text reverts to original", async () => {
      // Arrange
      const user = userEvent.setup();
      const initialData = createMockFlashcard({
        front: "Original question",
        back: "Original answer",
      });

      render(<FlashcardFormModal {...defaultProps} mode="edit" initialData={initialData} />);

      const frontInput = screen.getByPlaceholderText("Wpisz pytanie...");

      // Act - Change and revert
      await user.clear(frontInput);
      await user.type(frontInput, "Modified question");
      await user.clear(frontInput);
      await user.type(frontInput, "Original question");

      // Assert
      await waitFor(() => {
        const submitButton = screen.getByRole("button", { name: "Zapisz zmiany" });
        expect(submitButton).toBeDisabled();
      });
    });
  });

  describe("Dialog Interaction", () => {
    it("should call onClose when cancel button is clicked", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<FlashcardFormModal {...defaultProps} />);

      const cancelButton = screen.getByRole("button", { name: "Anuluj" });

      // Act
      await user.click(cancelButton);

      // Assert
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("should handle dialog close interaction", async () => {
      // Arrange
      const { rerender } = render(<FlashcardFormModal {...defaultProps} isOpen={true} />);

      // Verify dialog is initially present
      expect(screen.getByRole("dialog")).toBeInTheDocument();

      // Act - Close dialog by changing isOpen prop
      rerender(<FlashcardFormModal {...defaultProps} isOpen={false} />);

      // Assert - Dialog should not be present
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("should not call onClose when dialog content is clicked", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<FlashcardFormModal {...defaultProps} />);

      const dialogContent = screen.getByRole("dialog");

      // Act
      await user.click(dialogContent);

      // Assert
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    it("should handle null mode gracefully", () => {
      // Arrange & Act
      render(<FlashcardFormModal {...defaultProps} mode={null} />);

      // Assert
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      // Should default to create-like behavior
      expect(screen.getByRole("button", { name: "Anuluj" })).toBeInTheDocument();
    });

    it("should handle rapid typing and character count updates", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<FlashcardFormModal {...defaultProps} />);

      const frontInput = screen.getByPlaceholderText("Wpisz pytanie...");

      // Act - Type rapidly
      await user.type(frontInput, "Quick brown fox");

      // Assert
      await waitFor(() => {
        expect(screen.getByText("(15/200 znaków)")).toBeInTheDocument();
      });
    });

    it("should handle form submission with exact character limits", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<FlashcardFormModal {...defaultProps} />);

      const frontInput = screen.getByPlaceholderText("Wpisz pytanie...");
      const backInput = screen.getByPlaceholderText("Wpisz odpowiedź...");
      const submitButton = screen.getByRole("button", { name: "Dodaj" });

      const exactFrontLimit = createLongText(200);
      const exactBackLimit = createLongText(500);

      // Act
      await user.type(frontInput, exactFrontLimit);
      await user.type(backInput, exactBackLimit);
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          front: exactFrontLimit,
          back: exactBackLimit,
        });
      });
    });

    it("should display initialData correctly when modal is opened", () => {
      // Arrange
      const initialData = createMockFlashcard({
        front: "Test Question Data",
        back: "Test Answer Data",
      });

      // Act
      render(<FlashcardFormModal {...defaultProps} mode="edit" initialData={initialData} isOpen={true} />);

      // Assert - Initial data should be displayed
      expect(screen.getByDisplayValue("Test Question Data")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Test Answer Data")).toBeInTheDocument();
      expect(screen.getByText("Edytuj fiszkę")).toBeInTheDocument();
    });
  });

  describe("Business Rules", () => {
    it("should enforce character limits as per business requirements", () => {
      // Arrange & Act
      render(<FlashcardFormModal {...defaultProps} />);

      // Assert - Verify the exact limits are displayed
      expect(screen.getByText("(0/200 znaków)")).toBeInTheDocument(); // Front limit: 200
      expect(screen.getByText("(0/500 znaków)")).toBeInTheDocument(); // Back limit: 500
    });

    it("should enforce Polish business rules correctly", () => {
      // Arrange & Act
      render(<FlashcardFormModal {...defaultProps} />);

      // Assert - Polish labels and interface text
      expect(screen.getByText("Przód fiszki")).toBeInTheDocument();
      expect(screen.getByText("Tył fiszki")).toBeInTheDocument();
      expect(screen.getByText("Dodaj nową fiszkę")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Dodaj" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Anuluj" })).toBeInTheDocument();

      // Submit button should be disabled initially (enforcing form validation)
      const submitButton = screen.getByRole("button", { name: "Dodaj" });
      expect(submitButton).toBeDisabled();
    });

    it("should implement submit button disable logic correctly", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<FlashcardFormModal {...defaultProps} mode="create" />);

      const frontInput = screen.getByPlaceholderText("Wpisz pytanie...");
      const backInput = screen.getByPlaceholderText("Wpisz odpowiedź...");
      const submitButton = screen.getByRole("button", { name: "Dodaj" });

      // Assert - Initially disabled (empty form)
      expect(submitButton).toBeDisabled();

      // Act - Fill both fields with valid data
      await user.type(frontInput, "Valid question");
      await user.type(backInput, "Valid answer");

      // Assert - Should be enabled when both fields have content
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });

      // Test character limits
      await user.clear(frontInput);
      await user.type(frontInput, createLongText(201)); // Over 200 limit

      // Assert - Should be disabled when exceeding character limits
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
        expect(screen.getByText("(201/200 znaków)")).toHaveClass("text-red-500");
      });
    });

    it("should handle exact boundary conditions for character limits", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<FlashcardFormModal {...defaultProps} />);

      const frontInput = screen.getByPlaceholderText("Wpisz pytanie...");
      const backInput = screen.getByPlaceholderText("Wpisz odpowiedź...");

      // Test front field boundary (200 chars)
      const text199 = createLongText(199);
      const text200 = createLongText(200);
      const text201 = createLongText(201);

      // Act & Assert - 199 chars (valid)
      await user.type(frontInput, text199);
      await user.type(backInput, "answer");

      await waitFor(() => {
        const submitButton = screen.getByRole("button", { name: "Dodaj" });
        expect(submitButton).not.toBeDisabled();
        expect(screen.getByText("(199/200 znaków)")).toHaveClass("text-gray-500");
      });

      // Act & Assert - 200 chars (valid, at limit)
      await user.clear(frontInput);
      await user.type(frontInput, text200);

      await waitFor(() => {
        const submitButton = screen.getByRole("button", { name: "Dodaj" });
        expect(submitButton).not.toBeDisabled();
        expect(screen.getByText("(200/200 znaków)")).toHaveClass("text-gray-500");
      });

      // Act & Assert - 201 chars (invalid, over limit)
      await user.clear(frontInput);
      await user.type(frontInput, text201);

      await waitFor(() => {
        const submitButton = screen.getByRole("button", { name: "Dodaj" });
        expect(submitButton).toBeDisabled();
        expect(screen.getByText("(201/200 znaków)")).toHaveClass("text-red-500");
      });
    });
  });
});
