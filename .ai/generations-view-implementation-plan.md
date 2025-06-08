# Plan implementacji widoku "Generowanie Fiszek AI"

## 1. Przegląd

Widok "Generowanie Fiszek AI" umożliwia użytkownikom wprowadzanie tekstu źródłowego, na podstawie którego system (wykorzystując model LLM poprzez API) generuje propozycje fiszek. Użytkownik może następnie przeglądać te propozycje, edytować je, akceptować lub odrzucać, a na końcu zapisać wybrane fiszki w systemie. Celem jest przyspieszenie procesu tworzenia materiałów do nauki.

## 2. Routing widoku

Widok będzie dostępny pod następującą ścieżką:

- `/generations`

## 3. Struktura komponentów

Struktura komponentów widoku będzie następująca:

```
src/pages/generations.astro
└── GenerationsView.tsx (Główny komponent React dla widoku)
    ├── FlashcardGenerationForm.tsx (Formularz do wprowadzania tekstu i inicjowania generacji)
    ├── FlashcardProposalList.tsx (Lista wygenerowanych propozycji fiszek)
    │   └── FlashcardProposalItem.tsx (Pojedyncza propozycja fiszki z opcjami)
    │       └── EditFlashcardModal.tsx (Opcjonalny modal do edycji fiszki)
    ├── SkeletonLoader.tsx (Komponent wyświetlający szkielet ładowania dla listy)
    ├── BulkSaveButton.tsx (Przycisk do zapisu wszystkich propozycji fiszek lub tylko zaakceptowanych)
    └── ErrorToast.tsx (Komponent do wyświetlania globalnych błędów, np. z Shadcn/ui Toast)
```

- `generations.astro`: Główny plik strony Astro, który zaimportuje i wyrenderuje komponent `GenerationsView.tsx`.
- `GenerationsView.tsx`: Główny kontener React zarządzający stanem całego widoku, obsługą API i koordynacją komponentów podrzędnych.
- `FlashcardGenerationForm.tsx`: Komponent React zawierający pole `Textarea` do wprowadzenia tekstu źródłowego oraz przycisk "Generuj fiszki". Odpowiada za walidację długości tekstu.
- `FlashcardProposalList.tsx`: Komponent React wyświetlający listę propozycji fiszek (`FlashcardProposalItem`). Może zawierać opcje filtrowania lub zaznaczania/odznaczania wszystkich.
- `FlashcardProposalItem.tsx`: Komponent React reprezentujący pojedynczą propozycję fiszki. Wyświetla przód i tył fiszki oraz przyciski akcji: "Akceptuj" (checkbox/toggle), "Edytuj", "Odrzuć" (lub deakceptuj).
- `EditFlashcardModal.tsx`: Komponent React (Shadcn/ui Dialog) do edycji treści wybranej propozycji fiszki. Uruchamiany po kliknięciu "Edytuj" w `FlashcardProposalItem`.
- `SkeletonLoader.tsx`: Komponent (wykorzystujący Shadcn/ui `Skeleton`) wyświetlany podczas ładowania propozycji fiszek.
- `BulkSaveButton.tsx`: Komponent React zawierający przycisk do inicjowania zapisu wybranych/zaakceptowanych propozycji fiszek.
- `ErrorToast.tsx`: Wykorzystanie systemu powiadomień (np. Shadcn/ui `Toast`) do wyświetlania błędów API lub innych niepowodzeń.

## 4. Szczegóły komponentów

### `GenerationsView.tsx`

- **Opis komponentu:** Główny komponent React zarządzający logiką i stanem widoku generowania fiszek. Odpowiada za komunikację z API, zarządzanie listą propozycji oraz obsługę błędów. Koordynuje działanie komponentów podrzędnych.
- **Główne elementy:** Renderuje `FlashcardGenerationForm`, `FlashcardProposalList` (lub `SkeletonLoader`), `BulkSaveButton` oraz obsługuje `ErrorToast`.
- **Obsługiwane interakcje:** Orkiestruje proces od wysłania tekstu po zapis fiszek, przekazując odpowiednie funkcje i stany do komponentów podrzędnych. Zarządza aktualizacją flag `isAccepted` i `isEdited` w `ProposalViewModel`.
- **Obsługiwana walidacja:** Brak bezpośredniej walidacji, deleguje do komponentów podrzędnych.
- **Typy:** `GenerationViewState` (stan wewnętrzny), `ProposalViewModel`.
- **Propsy:** Brak (jest to komponent najwyższego poziomu dla tej funkcjonalności w React).

### `FlashcardGenerationForm.tsx`

- **Opis komponentu:** Formularz do wprowadzania tekstu źródłowego przez użytkownika i inicjowania procesu generowania fiszek.
- **Główne elementy:** `Textarea` (Shadcn/ui) na tekst źródłowy, `Button` (Shadcn/ui) "Generuj fiszki", licznik znaków, komunikaty walidacyjne.
- **Obsługiwane interakcje:**
  - Wprowadzanie tekstu w `Textarea`.
  - Kliknięcie przycisku "Generuj fiszki".
- **Obsługiwana walidacja:**
  - Długość tekstu źródłowego musi mieścić się w zakresie 1000-10000 znaków. Komunikat o błędzie wyświetlany, jeśli warunek nie jest spełniony. Przycisk "Generuj fiszki" jest nieaktywny, jeśli tekst jest niepoprawny lub trwa ładowanie.
- **Typy:**
  - Props: `onSubmit: (sourceText: string) => void`, `isLoading: boolean`, `initialText?: string`.
  - Stan wewnętrzny: `sourceText: string`, `charCount: number`, `validationError: string | null`.
- **Propsy:**
  - `onSubmit(sourceText: string)`: Funkcja zwrotna wywoływana po pomyślnej walidacji i kliknięciu przycisku generowania.
  - `isLoading: boolean`: Informuje, czy trwa proces generowania fiszek (do deaktywacji formularza).
  - `initialText?: string`: Opcjonalny tekst początkowy dla `Textarea`.

### `FlashcardProposalList.tsx`

- **Opis komponentu:** Wyświetla listę wygenerowanych przez AI propozycji fiszek. Umożliwia użytkownikowi interakcję z poszczególnymi elementami listy.
- **Główne elementy:** Lista komponentów `FlashcardProposalItem`. Opcjonalnie przyciski "Zaakceptuj wszystkie" / "Odrzuć wszystkie".
- **Obsługiwane interakcje:** Delegowanie akcji dla poszczególnych `FlashcardProposalItem` (edycja, akceptacja/odrzucenie).
- **Obsługiwana walidacja:** Brak bezpośredniej, polega na walidacji w `FlashcardProposalItem` (podczas edycji).
- **Typy:**
  - Props: `proposals: ProposalViewModel[]`, `onUpdateProposal: (index: number, updatedProposalData: Partial<ProposalViewModel>) => void`, `onToggleAcceptance: (index: number) => void`, `onEditProposal: (index: number) => void`.
- **Propsy:**
  - `proposals: ProposalViewModel[]`: Tablica propozycji fiszek do wyświetlenia.
  - `onUpdateProposal(index: number, updatedProposalData: Partial<ProposalViewModel>)`: Funkcja zwrotna aktualizująca dane propozycji (np. po edycji, ustawiając `isEdited`).
  - `onToggleAcceptance(index: number)`: Funkcja zwrotna do zmiany stanu `isAccepted` propozycji.
  - `onEditProposal(index: number)`: Funkcja zwrotna inicjująca edycję propozycji.

### `FlashcardProposalItem.tsx`

- **Opis komponentu:** Reprezentuje pojedynczą propozycję fiszki na liście. Wyświetla jej treść i umożliwia indywidualne akcje.
- **Główne elementy:** Wyświetlanie `front` i `back` propozycji (np. w Shadcn/ui `Card`), `Checkbox` lub `Switch` (Shadcn/ui) do zarządzania flagą `isAccepted`, `Button` (Shadcn/ui) "Edytuj". Przycisk "Odrzuć" może być usunięty na rzecz przełącznika akceptacji.
- **Obsługiwane interakcje:**
  - Zmiana stanu akceptacji (np. kliknięcie checkboxa/switcha).
  - Kliknięcie przycisku "Edytuj".
- **Obsługiwana walidacja:** Walidacja edytowanych pól (front/back) odbywa się w `EditFlashcardModal`.
- **Typy:**
  - Props: `proposal: ProposalViewModel`, `index: number`, `onUpdate: (index: number, updatedData: Partial<ProposalViewModel>) => void`, `onToggleAcceptance: (index: number) => void`, `onEdit: (index: number) => void`.
- **Propsy:**
  - `proposal: ProposalViewModel`: Dane propozycji do wyświetlenia.
  - `index: number`: Indeks propozycji na liście.
  - `onUpdate`: Dziedziczone z `FlashcardProposalList`, wywoływane po zapisie z `EditFlashcardModal`.
  - `onToggleAcceptance`: Dziedziczone z `FlashcardProposalList`.
  - `onEdit`: Dziedziczone z `FlashcardProposalList`.

### `EditFlashcardModal.tsx`

- **Opis komponentu:** Modal (okno dialogowe) do edycji treści (przód i tył) wybranej propozycji fiszki.
- **Główne elementy:** Komponent `Dialog` z Shadcn/ui, dwa pola `Textarea` (Shadcn/ui) dla `front` i `back`, przyciski "Zapisz zmiany" i "Anuluj". Komunikaty walidacyjne.
- **Obsługiwane interakcje:**
  - Edycja tekstu w polach `front` i `back`.
  - Kliknięcie "Zapisz zmiany".
  - Kliknięcie "Anuluj" lub zamknięcie modala.
- **Obsługiwana walidacja:**
  - `front`: Maksymalna długość 200 znaków.
  - `back`: Maksymalna długość 500 znaków.
  - Komunikaty o błędach wyświetlane, jeśli warunki nie są spełnione. Przycisk "Zapisz zmiany" nieaktywny przy błędach.
- **Typy:**
  - Props: `isOpen: boolean`, `onClose: () => void`, `proposal: ProposalViewModel | null`, `onSave: (editedData: { front: string; back: string }) => void`.
  - Stan wewnętrzny: `editedFront: string`, `editedBack: string`, `validationErrors: { front?: string; back?: string }`.
- **Propsy:**
  - `isOpen: boolean`: Kontroluje widoczność modala.
  - `onClose()`: Funkcja zwrotna wywoływana przy zamknięciu modala.
  - `proposal: ProposalViewModel | null`: Aktualnie edytowana propozycja (lub null jeśli modal nie jest aktywny z konkretną propozycją).
  - `onSave(editedData: { front: string; back: string })`: Funkcja zwrotna wywoływana po pomyślnej walidacji i kliknięciu "Zapisz zmiany". Powinna również sygnalizować, że propozycja została edytowana (`isEdited = true`).

### `BulkSaveButton.tsx`

- **Opis komponentu:** Przycisk umożliwiający zapisanie wszystkich zaakceptowanych propozycji fiszek.
- **Główne elementy:** `Button` (Shadcn/ui) z tekstem np. "Zapisz zaakceptowane fiszki" lub "Zapisz X zaakceptowanych fiszek".
- **Obsługiwane interakcje:** Kliknięcie przycisku.
- **Obsługiwana walidacja:** Przycisk powinien być nieaktywny, jeśli nie ma żadnych zaakceptowanych propozycji do zapisania lub jeśli trwa operacja zapisu (`isSavingFlashcards`).
- **Typy:**
  - Props: `onSave: () => void`, `isDisabled: boolean`, `acceptedCount: number`.
- **Propsy:**
  - `onSave()`: Funkcja zwrotna wywoływana po kliknięciu przycisku, inicjująca proces zapisu w komponencie nadrzędnym (`GenerationsView`).
  - `isDisabled: boolean`: Informuje, czy przycisk powinien być nieaktywny.
  - `acceptedCount: number`: Liczba aktualnie zaakceptowanych fiszek (do wyświetlenia na przycisku).

## 5. Typy

Wszystkie typy DTO i Command, takie jak `CreateGenerationCommand`, `GenerationDTO`, `CreateFlashcardsCommand` i `CreateFlashcardDTO`, są zdefiniowane w pliku `src/types.ts`.

Dla potrzeb tego widoku, w pliku `src/types.ts` zdefiniowano również następujące typy ViewModel, które zarządzają stanem interfejsu użytkownika:

- **`ProposalViewModel`**: Reprezentuje pojedynczą propozycję fiszki w UI.

  - `id: string`
  - `originalFront: string`
  - `originalBack: string`
  - `currentFront: string`
  - `currentBack: string`
  - `isEdited: boolean`
  - `isAccepted: boolean`
  - `generation_id_internal?: number`

- **`GenerationViewState`**: Agreguje cały stan widoku generowania fiszek.
  - `sourceText: string`
  - `isLoadingProposals: boolean`
  - `isSavingFlashcards: boolean`
  - `proposals: ProposalViewModel[]`
  - `generationId: number | null`
  - `error: string | null`
  - `editingProposalIndex: number | null`

## 6. Zarządzanie stanem

Stan będzie zarządzany głównie w komponencie `GenerationsView.tsx` przy użyciu hooków React (`useState`, `useCallback`, potencjalnie `useReducer` dla bardziej złożonej logiki lub `useEffect` do reakcji na zmiany propsów/stanu).

- **Kluczowe zmienne stanu w `GenerationsView.tsx`:**

  - `sourceText` (przekazywany do i zarządzany przez `FlashcardGenerationForm`, ale może być też podniesiony wyżej)
  - `proposals: ProposalViewModel[]` (każdy element z flagami `isEdited`, `isAccepted`)
  - `isLoadingProposals: boolean`
  - `isSavingFlashcards: boolean`
  - `generationId: number | null`
  - `error: string | null`
  - `editingProposalIndex: number | null` (lub `editingProposal: ProposalViewModel | null`)

- **Niestandardowy hook (`useFlashcardGeneration`):** Można rozważyć stworzenie customowego hooka, np. `useFlashcardGenerationMachine` lub `useFlashcardGenerationLogic`, który hermetyzowałby logikę biznesową:
  - Zarządzanie stanem (`proposals`, `isLoadingProposals`, `isSavingFlashcards`, `error`, `generationId`).
  - Funkcje do interakcji z API (`generateProposals`, `saveFlashcards`).
  - Funkcje do modyfikacji stanu propozycji (`updateProposalContent`, `toggleAcceptance`, `initiateEdit`).
  - Logika aktualizacji flagi `isEdited` po zmianie `currentFront` lub `currentBack`.
    Taki hook uprościłby komponent `GenerationsView.tsx`, czyniąc go bardziej deklaratywnym.

## 7. Integracja API

Integracja będzie obejmować dwa główne endpointy:

**1. `POST /api/generations`**

- **Cel:** Wysłanie tekstu źródłowego do AI w celu wygenerowania propozycji fiszek.
- **Typ żądania (Request Body):** `CreateGenerationCommand` (zdefiniowany w `src/types.ts`)
  ```typescript
  // src/types.ts
  export interface CreateGenerationCommand {
    source_text: string;
  }
  ```
- **Typ odpowiedzi (Response Body):** `GenerationDTO` (zdefiniowany w `src/types.ts`)
  ```typescript
  // src/types.ts
  export interface GenerationDTO {
    generation_id: number;
    flashcards_proposals: GenerationFlashcardProposal[]; // GenerationFlashcardProposal: { front: string, back: string, source: "ai-full" }
    generated_count: number;
    flashcards?: FlashcardResponseDTO[]; // Opcjonalne, prawdopodobnie nieużywane bezpośrednio w tym widoku po generacji
  }
  ```
- **Obsługa Frontend:**
  - `FlashcardGenerationForm` zbiera `source_text`.
  - Po kliknięciu "Generuj fiszki", `GenerationsView` (lub hook) wysyła żądanie.
  - Ustawia `isLoadingProposals = true`.
  - Po otrzymaniu odpowiedzi:
    - Przetwarza `flashcards_proposals` na listę `ProposalViewModel[]`. Każda propozycja dostaje unikalne `id` klienckie, `originalFront/Back`, `currentFront/Back` (początkowo takie same jak original), `isEdited = false`, `isAccepted` (zgodnie z domyślną logiką UX, np. `true` dla wszystkich).
    - Zapisuje `generation_id`.
    - Ustawia `isLoadingProposals = false`.
  - W przypadku błędu: ustawia `error` i `isLoadingProposals = false`.

**2. `POST /api/flashcards`** (wywoływane przez akcję w `GenerationsView.tsx`, inicjowaną przez `BulkSaveButton.tsx`)

- **Cel:** Zapisanie zaakceptowanych i ewentualnie edytowanych propozycji fiszek.
- **Typ żądania (Request Body):** `CreateFlashcardsCommand` (zdefiniowany w `src/types.ts`)
  ```typescript
  // src/types.ts
  export interface CreateFlashcardsCommand {
    flashcards: CreateFlashcardDTO[]; // CreateFlashcardDTO to unia ManualFlashcardDTO | AIFullFlashcardDTO | AIEditedFlashcardDTO
  }
  ```
- **Typ odpowiedzi (Response Body):** `{ flashcards: FlashcardResponseDTO[] }` (gdzie `FlashcardResponseDTO` to `Tables<"flashcards">`, zdefiniowany w `src/types.ts`)
- **Obsługa Frontend:**
  - Po kliknięciu `BulkSaveButton` (gdy nie jest `isDisabled`), wywoływana jest funkcja (`handleSaveFlashcards`) w `GenerationsView.tsx`.
  - `GenerationsView` (lub hook) filtruje listę `proposals`, aby uzyskać te, które mają `isAccepted === true`.
  - Mapuje odfiltrowane `ProposalViewModel` na tablicę `CreateFlashcardDTO[]`:
    - `front`: `proposal.currentFront`
    - `back`: `proposal.currentBack`
    - `source`: Jeśli `proposal.isEdited === true`, to `"ai-edited"`, w przeciwnym razie `"ai-full"`.
    - `generation_id`: zapisane wcześniej `generationId` z odpowiedzi `/api/generations`.
  - Ustawia `isSavingFlashcards = true`.
  - Wysyła żądanie do `/api/flashcards` (implementacja endpointu znajduje się w `@flashcards.ts`).
  - Po otrzymaniu odpowiedzi:
    - Wyświetla komunikat o sukcesie (np. Toast).
    - Może wyczyścić listę propozycji lub przekierować użytkownika.
    - Ustawia `isSavingFlashcards = false`.
  - W przypadku błędu: ustawia `error` i `isSavingFlashcards = false`.

## 8. Interakcje użytkownika

- **Wprowadzanie tekstu:** Użytkownik wpisuje tekst w `Textarea` w `FlashcardGenerationForm`. Licznik znaków aktualizuje się, a walidacja długości jest sprawdzana na bieżąco.
- **Generowanie fiszek:** Kliknięcie przycisku "Generuj fiszki" (gdy aktywny) inicjuje wywołanie API `POST /api/generations`. Wyświetlany jest stan ładowania (`SkeletonLoader`).
- **Przeglądanie propozycji:** Wygenerowane propozycje są wyświetlane jako lista `FlashcardProposalItem`.
- **Akceptowanie/Odrzucanie propozycji:** Użytkownik może użyć przełącznika (checkbox/switch) przy każdej propozycji, aby zmienić jej stan `isAccepted`.
- **Edycja propozycji:** Kliknięcie przycisku "Edytuj" na `FlashcardProposalItem` otwiera `EditFlashcardModal` z danymi tej propozycji. Użytkownik może zmienić `currentFront` i `currentBack`. Po zapisie zmian w modalu, flaga `isEdited` dla tej propozycji jest ustawiana na `true` w `GenerationsView.tsx`.
- **Zapisywanie fiszek:** Kliknięcie `BulkSaveButton` inicjuje wywołanie API `POST /api/flashcards` z zaakceptowanymi (`isAccepted === true`) propozycjami, z odpowiednio ustawionym polem `source` na podstawie flagi `isEdited`. Wyświetlany jest stan ładowania.

## 9. Warunki i walidacja

- **`FlashcardGenerationForm`:**
  - **Warunek:** Długość `source_text` musi wynosić od 1000 do 10000 znaków.
  - **Walidacja:** Na bieżąco podczas wpisywania.
  - **Wpływ na UI:** Wyświetlenie komunikatu błędu pod `Textarea`. Dezaktywacja przycisku "Generuj fiszki", jeśli warunek nie jest spełniony lub jeśli `isLoadingProposals` jest `true`.
- **`EditFlashcardModal`:**
  - **Warunek:** `front` (przód fiszki) - maksymalnie 200 znaków.
  - **Walidacja:** Przy próbie zapisu zmian w modalu.
  - **Wpływ na UI:** Wyświetlenie komunikatu błędu przy odpowiednim polu. Dezaktywacja przycisku "Zapisz zmiany", jeśli którekolwiek pole jest niepoprawne.
  - **Warunek:** `back` (tył fiszki) - maksymalnie 500 znaków.
  - **Walidacja:** Przy próbie zapisu zmian w modalu.
  - **Wpływ na UI:** Wyświetlenie komunikatu błędu przy odpowiednim polu. Dezaktywacja przycisku "Zapisz zmiany", jeśli którekolwiek pole jest niepoprawne.
- **`BulkSaveButton.tsx`:**
  - **Warunek:** Przycisk jest aktywny (`isDisabled = false`) tylko jeśli są zaakceptowane (`isAccepted === true`) propozycje do zapisu ORAZ nie trwa aktualnie operacja zapisu (`isSavingFlashcards`).
  - **Walidacja:** Sprawdzane w `GenerationsView.tsx` i przekazywane jako prop `isDisabled`.
  - **Wpływ na UI:** Przycisk jest wyszarzony/nieaktywny.
- **Ogólne:**
  - Przyciski akcji (Generuj, Zapisz) powinny być nieaktywne podczas trwania operacji API (np. `isLoadingProposals` lub `isSavingFlashcards` jest `true`).

## 10. Obsługa błędów

- **Błędy walidacji formularza (`FlashcardGenerationForm`, `EditFlashcardModal`):**
  - Wyświetlanie komunikatów inline przy odpowiednich polach.
  - Dezaktywacja przycisków akcji.
- **Błędy API (`POST /api/generations`, `POST /api/flashcards`):**
  - Po otrzymaniu odpowiedzi o błędzie z API (np. status 4xx, 5xx):
    - Stan `error` w `GenerationsView.tsx` jest ustawiany na odpowiedni komunikat.
    - Komunikat błędu jest wyświetlany użytkownikowi za pomocą komponentu `Toast` (np. "Nie udało się wygenerować fiszek. Spróbuj ponownie." lub "Wystąpił błąd podczas zapisywania fiszek.").
    - Szczegółowe błędy (jeśli dostępne i bezpieczne do wyświetlenia) mogą być zawarte lub zalogowane do konsoli.
    - Stany ładowania (`isLoadingProposals`, `isSavingFlashcards`) są resetowane do `false`.
- **Brak propozycji od AI:** Jeśli API `/api/generations` zwróci sukces, ale pustą listę `flashcards_proposals`:
  - Wyświetlić komunikat informacyjny, np. "Nie udało się wygenerować żadnych propozycji fiszek dla podanego tekstu." zamiast pustej listy lub błędu.
- **Błędy sieciowe:**
  - Ogólny komunikat o błędzie sieciowym wyświetlany przez `Toast`, jeśli żądanie `fetch` nie powiedzie się.

## 11. Kroki implementacji

1.  **Aktualizacja `ProposalViewModel`**: Zmodyfikować definicję `ProposalViewModel` w sekcji "Typy" tego planu, dodając `isEdited: boolean` i `isAccepted: boolean`, oraz usuwając `source` i `isSelected`.
2.  **Utworzenie plików komponentów:** Stworzyć pliki `.astro` i `.tsx` zgodnie ze zdefiniowaną strukturą komponentów, w tym dla `BulkSaveButton.tsx`.
3.  **Implementacja `GenerationsPageView.astro`:** Podstawowa strona Astro, która importuje i renderuje główny komponent React (`GenerationsView.tsx`).
4.  **Implementacja `GenerationsView.tsx`:**
    - Zdefiniować stan (`GenerationViewState`) używając hooków React, uwzględniając zaktualizowany `ProposalViewModel`.
    - Implementować logikę inicjalizacji `proposals` po odpowiedzi z API `/generations`, ustawiając `isEdited = false` i `isAccepted` (np. na `true`).
    - Stworzyć funkcje do obsługi API (`handleGenerateProposals`, `handleSaveFlashcards`).
    - Stworzyć funkcje do aktualizacji stanu propozycji: `handleToggleAcceptance(index)`, `handleSetEdited(index, editedFront, editedBack)` (która ustawia `currentFront`, `currentBack` i `isEdited = true`).
    - Podstawowy layout renderujący `FlashcardGenerationForm`, `FlashcardProposalList` / `SkeletonLoader` oraz `BulkSaveButton`.
5.  **Implementacja `FlashcardGenerationForm.tsx`:** (bez zmian związanych z nowymi flagami `ProposalViewModel`)
    - Dodać `Textarea` i `Button` z Shadcn/ui.
    - Zaimplementować logikę walidacji długości tekstu (1000-10000 znaków), licznik znaków.
    - Obsłużyć `onSubmit` i wywołać odpowiednią funkcję przekazaną przez propsy.
    - Zarządzać stanem `isLoading` przekazanym przez propsy.
6.  **Integracja API `POST /api/generations`:**
    - W `GenerationsView.tsx`, zaimplementować pełną logikę wywołania API `POST /api/generations`.
    - Obsłużyć stany ładowania i błędy.
    - Przetworzyć odpowiedź API na `ProposalViewModel[]` z nowymi flagami (`isEdited`, `isAccepted`).
7.  **Implementacja `SkeletonLoader   .tsx`:** Stworzyć prosty komponent wyświetlający kilka szkieletów (Shadcn/ui `Skeleton`) imitujących listę fiszek.
8.  **Implementacja `FlashcardProposalList.tsx` i `FlashcardProposalItem.tsx`:**
    - `FlashcardProposalList` przekazuje `onToggleAcceptance` do `FlashcardProposalItem`.
    - `FlashcardProposalItem` używa `Checkbox` lub `Switch` do zmiany `proposal.isAccepted` poprzez `onToggleAcceptance`.
    - Upewnić się, że przycisk "Edytuj" w `FlashcardProposalItem` poprawnie inicjuje edycję.
9.  **Implementacja `EditFlashcardModal.tsx`:**
    - Stworzyć modal z Shadcn/ui `Dialog`.
    - Dodać formularz edycji z walidacją (max 200 dla front, max 500 dla back).
    - Po zapisie (`onSave`), modal przekazuje zmienione `front` i `back`. W `GenerationsView.tsx`, funkcja obsługująca zapis z modala powinna zaktualizować `currentFront`, `currentBack` oraz ustawić `isEdited = true` dla odpowiedniej propozycji.
10. **Implementacja `BulkSaveButton.tsx`:**
    - Stworzyć komponent przycisku.
    - Przyjmować propsy `onSave`, `isDisabled`, `acceptedCount`.
    - Wyświetlać odpowiedni tekst i stan na podstawie propsów.
11. **Integracja API `POST /api/flashcards` z `BulkSaveButton`:**
    - W `GenerationsView.tsx`, zmodyfikować funkcję `handleSaveFlashcards`:
      - Filtrować `proposals` po `isAccepted === true`.
      - Mapować przefiltrowane propozycje do `CreateFlashcardDTO[]`, ustawiając `source` na `"ai-edited"` jeśli `isEdited === true`, w przeciwnym razie na `"ai-full"`.
      - Wywołuje API `POST /api/flashcards`.
      - Obsługuje stany ładowania (`isSavingFlashcards`) i błędy.
    - Przekazać tę funkcję jako `onSave` do `BulkSaveButton.tsx`.
    - Obliczyć `acceptedCount` i `isDisabled` dla `BulkSaveButton.tsx` na podstawie stanu `proposals` (liczba `isAccepted === true`) i `isSavingFlashcards`.
12. **Obsługa błędów globalnych:** Zintegrować system `Toast` (np. z Shadcn/ui) do wyświetlania błędów API i innych powiadomień w `GenerationsView.tsx`.
13. **Styling i responsywność:** Dopracować wygląd przy użyciu Tailwind CSS, upewniając się, że widok jest responsywny i zgodny z WCAG AA.
14. **Testowanie:** Przetestować cały przepływ z nowymi flagami: generowanie, akceptowanie/odrzucanie, edycja (sprawdzając zmianę `isEdited`), zapisywanie (sprawdzając poprawność `source` w żądaniu API), oraz obsługę błędów.

```

```
