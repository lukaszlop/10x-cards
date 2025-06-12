# Plan implementacji widoku: Moje fiszki

## 1. Przegląd

Widok "Moje fiszki" jest centralnym miejscem do zarządzania osobistymi fiszkami użytkownika. Umożliwia on przeglądanie wszystkich zapisanych fiszek, tworzenie nowych (ręcznie), edytowanie istniejących oraz ich usuwanie. Widok ten integruje się z API w celu zapewnienia spójności danych i obsługuje kluczowe historyjki użytkownika związane z zarządzaniem fiszkami (US-005, US-006, US-007).

## 2. Routing widoku

Widok będzie dostępny pod następującą ścieżką w aplikacji:

- **Ścieżka:** `/flashcards`

Implementacja routingu zostanie zrealizowana poprzez utworzenie pliku `src/pages/flashcards.astro`.

## 3. Struktura komponentów

Widok zostanie zaimplementowany w architekturze komponentowej z wykorzystaniem Astro i React. Poniżej przedstawiono hierarchię komponentów:

```
src/pages/flashcards.astro
└── src/components/views/FlashcardsView.tsx (Główny komponent React, `client:load`)
    ├── Button ("Dodaj nową fiszkę")
    ├── FlashcardsList.tsx
    │   └── (mapowanie fiszek na wiersze tabeli/listy)
    │       ├── Dane fiszki (Front, Back)
    │       ├── Button ("Edytuj")
    │       └── Button ("Usuń")
    ├── FlashcardFormModal.tsx (Używany do tworzenia i edycji)
    │   └── Formularz (z polami Input, Textarea, Button)
    └── DeleteConfirmationDialog.tsx (Modal potwierdzający usunięcie)
```

## 4. Szczegóły komponentów

### FlashcardsPage.astro

- **Opis komponentu:** Strona Astro, która renderuje główny komponent React dla widoku fiszek. Odpowiada za ustawienie renderowania po stronie klienta.
- **Główne elementy:**
  - Import i renderowanie komponentu `FlashcardsView` z dyrektywą `client:load`.
  - Podstawowy layout strony (np. `MainLayout.astro`).
- **Obsługiwane interakcje:** Brak, deleguje logikę do komponentu React.
- **Propsy:** Brak.

### FlashcardsView.tsx

- **Opis komponentu:** Główny, stanowy komponent React, który zarządza całym widokiem "Moje fiszki". Odpowiada za pobieranie danych, obsługę stanu i koordynację interakcji między komponentami podrzędnymi.
- **Główne elementy:**
  - Przycisk "Dodaj nową fiszkę" (`Button` z Shadcn/ui).
  - Komponent `FlashcardsList`.
  - Komponent `FlashcardFormModal` (kontrolowany przez stan `FlashcardsView`).
  - Komponent `DeleteConfirmationDialog` (kontrolowany przez stan `FlashcardsView`).
- **Obsługiwane interakcje:**
  - Kliknięcie przycisku "Dodaj nową fiszkę" -> otwiera `FlashcardFormModal` w trybie 'create'.
  - Odbieranie zdarzeń `onEdit` i `onDelete` z `FlashcardsList`.
  - Zarządzanie stanem `isLoading`, `error` oraz widocznością modali.
- **Typy:** `FlashcardsViewState`, `FlashcardResponseDTO`.
- **Propsy:** Brak.

### FlashcardsList.tsx

- **Opis komponentu:** Komponent prezentacyjny, odpowiedzialny za wyświetlanie listy fiszek w formie tabeli (`Table` z Shadcn/ui).
- **Główne elementy:**
  - Tabela z kolumnami: "Pytanie (Front)", "Odpowiedź (Back)", "Akcje".
  - Wiersze tabeli, gdzie każdy wiersz reprezentuje jedną fiszkę.
  - Przyciski "Edytuj" i "Usuń" w kolumnie "Akcje".
- **Obsługiwane interakcje:**
  - Kliknięcie przycisku "Edytuj" -> emituje zdarzenie `onEdit(flashcard)`.
  - Kliknięcie przycisku "Usuń" -> emituje zdarzenie `onDelete(flashcardId)`.
- **Typy:** `FlashcardResponseDTO`.
- **Propsy:**
  - `flashcards: FlashcardResponseDTO[]`
  - `onEdit: (flashcard: FlashcardResponseDTO) => void`
  - `onDelete: (flashcardId: number) => void`

### FlashcardFormModal.tsx

- **Opis komponentu:** Modal (`Dialog` z Shadcn/ui) zawierający formularz do tworzenia lub edycji fiszki. Wykorzystuje `react-hook-form` i `zod` do walidacji.
- **Główne elementy:**
  - Formularz z polem `Input` dla "Front" i `Textarea` dla "Back".
  - Komunikaty walidacyjne.
  - Przyciski "Zapisz" i "Anuluj".
- **Obsługiwane interakcje:**
  - Wprowadzanie danych w polach formularza.
  - Zgłoszenie formularza -> emituje zdarzenie `onSubmit(data)`.
  - Kliknięcie "Anuluj" lub zamknięcie modala -> emituje `onClose()`.
- **Warunki walidacji:**
  - `front`: Wymagane, maksymalnie 200 znaków.
  - `back`: Wymagane, maksymalnie 500 znaków.
  - Przycisk "Zapisz" jest nieaktywny, jeśli formularz jest nieprawidłowy.
- **Typy:** `UpdateFlashcardDTO`, `FlashcardResponseDTO`.
- **Propsy:**
  - `isOpen: boolean`
  - `mode: 'create' | 'edit'`
  - `initialData?: FlashcardResponseDTO` (dla trybu 'edit')
  - `onSubmit: (data: UpdateFlashcardDTO) => void`
  - `onClose: () => void`

### DeleteConfirmationDialog.tsx

- **Opis komponentu:** Prosty modal (`AlertDialog` z Shadcn/ui) do potwierdzenia operacji usunięcia fiszki.
- **Główne elementy:**
  - Tytuł i treść z zapytaniem o potwierdzenie.
  - Przycisk "Potwierdź" (`AlertDialogAction`).
  - Przycisk "Anuluj" (`AlertDialogCancel`).
- **Obsługiwane interakcje:**
  - Kliknięcie "Potwierdź" -> emituje `onConfirm()`.
  - Kliknięcie "Anuluj" -> emituje `onCancel()`.
- **Propsy:**
  - `isOpen: boolean`
  - `onConfirm: () => void`
  - `onCancel: () => void`

## 5. Typy

Do implementacji widoku wykorzystane zostaną istniejące typy DTO oraz zdefiniowany zostanie nowy typ dla stanu widoku.

- **Istniejące typy (z `src/types.ts`):**

  - `FlashcardResponseDTO`: Używany do reprezentowania fiszek pobranych z API.
  - `CreateFlashcardsCommand`: Używany do tworzenia nowej fiszki (opakowuje `ManualFlashcardDTO`).
  - `UpdateFlashcardDTO`: Używany do aktualizacji istniejącej fiszki.

- **Nowy typ ViewModel/State:**
  ```typescript
  // Ten typ będzie zarządzał stanem całego widoku w komponencie FlashcardsView.tsx
  export interface FlashcardsViewState {
    flashcards: FlashcardResponseDTO[];
    isLoading: boolean;
    error: string | null;
    isModalOpen: boolean;
    modalMode: "create" | "edit" | null;
    editingFlashcard: FlashcardResponseDTO | null; // Fiszka aktualnie w edycji
    isDeleteDialogOpen: boolean;
    deletingFlashcardId: number | null; // ID fiszki do usunięcia
  }
  ```

## 6. Zarządzanie stanem

Stan będzie zarządzany lokalnie w komponencie `FlashcardsView.tsx` przy użyciu hooków React (`useState`, `useReducer`).

Zaleca się stworzenie dedykowanego customowego hooka `useFlashcards`, który będzie hermetyzował całą logikę biznesową:

- Pobieranie danych z API.
- Obsługa stanu ładowania i błędów.
- Funkcje do dodawania, aktualizowania i usuwania fiszek, które komunikują się z API i aktualizują stan lokalny (z podejściem optymistycznego UI lub przez ponowne pobranie danych).

Hook ten udostępniałby stan (`flashcards`, `isLoading`, `error`) oraz metody (`addFlashcard`, `updateFlashcard`, `removeFlashcard`) do komponentu `FlashcardsView`.

## 7. Integracja API

Komponent `FlashcardsView` (poprzez hook `useFlashcards`) będzie komunikował się z następującymi endpointami API:

- **`GET /api/flashcards`**:

  - **Akcja:** Pobranie listy fiszek przy pierwszym załadowaniu komponentu.
  - **Odpowiedź:** `FlashcardsResponseDTO`

- **`POST /api/flashcards`**:

  - **Akcja:** Utworzenie nowej, ręcznej fiszki po zatwierdzeniu formularza w trybie 'create'.
  - **Żądanie:** `CreateFlashcardsCommand` z jedną fiszką, gdzie `source` to `manual`, a `generation_id` to `null`.
  - **Odpowiedź:** `{ flashcards: FlashcardResponseDTO[] }`

- **`PUT /api/flashcards/{id}`**:

  - **Akcja:** Zaktualizowanie istniejącej fiszki po zatwierdzeniu formularza w trybie 'edit'.
  - **Żądanie:** `UpdateFlashcardDTO` z polami `front` i/lub `back`. Jeśli fiszka była wygenerowana przez AI, jej `source` powinien zostać zmieniony na `ai-edited`.
  - **Odpowiedź:** `FlashcardResponseDTO`

- **`DELETE /api/flashcards/{id}`**:
  - **Akcja:** Usunięcie fiszki po potwierdzeniu w `DeleteConfirmationDialog`.
  - **Odpowiedź:** `{ message: "Flashcard deleted successfully." }`

## 8. Interakcje użytkownika

- **Wyświetlenie listy:** Po wejściu na `/flashcards`, użytkownik widzi listę swoich fiszek lub stan ładowania.
- **Dodawanie fiszki:**
  1. Użytkownik klika "Dodaj nową fiszkę".
  2. Otwiera się `FlashcardFormModal` z pustym formularzem.
  3. Użytkownik wypełnia formularz i klika "Zapisz".
  4. Aplikacja wysyła żądanie `POST`, a po sukcesie zamyka modal i odświeża listę.
- **Edycja fiszki:**
  1. Użytkownik klika "Edytuj" przy wybranej fiszce.
  2. Otwiera się `FlashcardFormModal` z wypełnionymi danymi fiszki.
  3. Użytkownik modyfikuje dane i klika "Zapisz".
  4. Aplikacja wysyła żądanie `PUT`, a po sukcesie zamyka modal i odświeża listę.
- **Usuwanie fiszki:**
  1. Użytkownik klika "Usuń" przy wybranej fiszce.
  2. Otwiera się `DeleteConfirmationDialog`.
  3. Użytkownik klika "Potwierdź".
  4. Aplikacja wysyła żądanie `DELETE`, a po sukcesie zamyka dialog i odświeża listę.

## 9. Warunki i walidacja

Walidacja danych będzie odbywać się po stronie klienta w komponencie `FlashcardFormModal` przed wysłaniem żądania do API.

- **Technologia:** `react-hook-form` do zarządzania formularzem, `zod` do definicji schematu walidacji.
- **Reguły walidacji:**
  - `front`:
    - Musi być stringiem.
    - Nie może być pusty.
    - Maksymalna długość: 200 znaków.
  - `back`:
    - Musi być stringiem.
    - Nie może być pusty.
    - Maksymalna długość: 500 znaków.
- **Stan interfejsu:**
  - Przycisk "Zapisz" w formularzu jest nieaktywny, dopóki wszystkie warunki walidacji nie zostaną spełnione.
  - Komunikaty o błędach walidacji są wyświetlane pod odpowiednimi polami formularza.

## 10. Obsługa błędów

- **Błąd pobierania danych (`GET`):** W przypadku niepowodzenia pobrania listy fiszek, na ekranie powinien zostać wyświetlony komunikat o błędzie (np. "Nie udało się wczytać fiszek. Spróbuj ponownie.") oraz ewentualnie przycisk do ponowienia próby.
- **Błędy zapisu/edycji (`POST`/`PUT`):** Jeśli zapis lub edycja nie powiedzie się, modal nie powinien być zamykany. Należy wyświetlić komunikat o błędzie (np. w formie `Toast` lub pod przyciskiem "Zapisz"), informując użytkownika o problemie i pozwalając mu spróbować ponownie bez utraty wprowadzonych danych.
- **Błąd usunięcia (`DELETE`):** W przypadku błędu, dialog potwierdzenia powinien zostać zamknięty, a użytkownik poinformowany o niepowodzeniu operacji za pomocą komponentu `Toast`.
- **Przypadek brzegowy (np. 404 Not Found):** Jeśli użytkownik próbuje edytować lub usunąć fiszkę, która została w międzyczasie usunięta, aplikacja powinna wyświetlić stosowny komunikat i odświeżyć listę, aby usunąć nieistniejący element z widoku.

## 11. Kroki implementacji

1.  **Utworzenie pliku strony:** Stwórz plik `src/pages/flashcards.astro` i podstawowy layout.
2.  **Struktura komponentów React:** Stwórz pliki dla komponentów React w `src/components/views/`: `FlashcardsView.tsx`, `FlashcardsList.tsx`, `FlashcardFormModal.tsx` i `DeleteConfirmationDialog.tsx`.
3.  **Implementacja `useFlashcards`:** Stwórz custom hook `useFlashcards` do zarządzania stanem i logiką API (pobieranie, tworzenie, aktualizacja, usuwanie).
4.  **Implementacja komponentu listy:** Zbuduj `FlashcardsList.tsx`, który będzie renderował dane przy użyciu `Table` z Shadcn/ui i emitował zdarzenia `onEdit`/`onDelete`.
5.  **Implementacja modala z formularzem:** Zbuduj `FlashcardFormModal.tsx` z użyciem `Dialog`, `react-hook-form` i `zod` do walidacji. Zapewnij obsługę trybów 'create' i 'edit'.
6.  **Implementacja dialogu potwierdzenia:** Zbuduj `DeleteConfirmationDialog.tsx` używając `AlertDialog` z Shadcn/ui.
7.  **Złożenie widoku:** W `FlashcardsView.tsx` zintegruj hook `useFlashcards` i wszystkie komponenty podrzędne. Zarządzaj widocznością modali na podstawie stanu.
8.  **Renderowanie w Astro:** W `flashcards.astro` zaimportuj i wyrenderuj gotowy komponent `FlashcardsView.tsx` z dyrektywą `client:load`.
9.  **Stylowanie:** Użyj Tailwind CSS do dopracowania wyglądu i responsywności widoku.
10. **Testowanie:** Przetestuj ręcznie wszystkie ścieżki użytkownika, walidację i obsługę błędów.
