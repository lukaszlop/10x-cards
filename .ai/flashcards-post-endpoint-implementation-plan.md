# API Endpoint Implementation Plan: POST /flashcards

## 1. Przegląd punktu końcowego

Ten endpoint umożliwia tworzenie jednego lub wielu flashcards. Wspiera on flashcards tworzone ręcznie (manual) oraz te generowane przez AI (ai-full, ai-edited). Jego głównym celem jest walidacja danych, zastosowanie reguł biznesowych oraz zapis utworzonych rekordów w bazie danych (tabela flashcards), powiązanych z odpowiednim użytkownikiem.

## 2. Szczegóły żądania

- **Metoda HTTP**: POST
- **Struktura URL**: /flashcards
- **Parametry**:
  - **Wymagane**:
    - W ciele żądania (JSON) musi znajdować się pole `flashcards`, które jest tablicą obiektów. Dla każdego obiektu flashcard wymagane są:
      - `front`: string (maksymalnie 200 znaków)
      - `back`: string (maksymalnie 500 znaków)
      - `source`: string; jedna z wartości: "manual", "ai-full", "ai-edited"
      - `generation_id`:
        - Dla flashcards typu "ai-full" lub "ai-edited" wartość wymagana (number).
        - Dla flashcards typu "manual" powinna być równa null.

## 3. Wykorzystywane typy

- `FlashcardResponseDTO` – reprezentuje pojedynczy flashcard zwracany w odpowiedzi.
- `CreateFlashcardsCommand` – model komendowy dla żądania POST /flashcards.
- `ManualFlashcardDTO`, `AIFullFlashcardDTO`, `AIEditedFlashcardDTO` – warianty typu flashcard w zależności od źródła.

## 4. Szczegóły odpowiedzi

- **Sukces**:
  - Kod statusu: **201 Created**
  - Treść odpowiedzi (JSON):
    ```json
    {
      "flashcards": [
        {
          "front": "Question text 1",
          "back": "Answer text 1",
          "source": "manual",
          "generation_id": null
        },
        {
          "front": "Question text 2",
          "back": "Answer text 2",
          "source": "ai-full",
          "generation_id": 123
        }
      ]
    }
    ```
- **Błędy**:
  - 400 Bad Request: Niepoprawny format danych lub brak wymaganych pól.
  - 401 Unauthorized: Nieautoryzowany dostęp.
  - 422 Unprocessable Entity: Naruszenie reguł walidacji (np. brak generation_id dla flashcards typu ai-full lub ai-edited).
  - 500 Internal Server Error: Błąd po stronie serwera.

## 5. Przepływ danych

1. Klient wysyła żądanie POST zawierające JSON zgodny z modelem `CreateFlashcardsCommand`.
2. Żądanie przechodzi przez middleware autoryzacyjne (Supabase Auth), które weryfikuje token i ustawia informacje o użytkowniku (user_id) w `context.locals`.
3. Walidacja danych wejściowych:
   - Użycie biblioteki Zod do weryfikacji obecności kluczowych pól oraz długości `front` i `back`.
   - Walidacja wartości `source` oraz warunkowego pola `generation_id`.
4. Przekazanie zwalidowanych danych do warstwy logiki biznesowej (service layer `flashcard.service`), np. funkcji w `src/lib/services/flashcard.service.ts`:
   - Przypisanie `user_id` z kontekstu autoryzacji do każdego flashcarda.
   - Wykonanie operacji INSERT do tabeli `flashcards` w bazie przy użyciu Supabase.
5. Zwrócenie utworzonych rekordów flashcards w odpowiedzi API.

## 6. Względy bezpieczeństwa

- **Autoryzacja**: Endpoint chroniony za pomocą Supabase Auth. Każde żądanie musi zawierać ważny token autoryzacyjny.
- **Walidacja danych**: Surowe dane wejściowe są walidowane, aby zapobiec atakom związanym z wstrzykiwaniem lub przekraczaniem limitów pól.
- **Ochrona bazy danych**: Użycie zapytań przygotowanych/ORM oraz ograniczenia na poziomie bazy (przypisanie user_id) zapobiega nieautoryzowanemu dostępowi czy modyfikacjom.

## 7. Obsługa błędów

- **400 Bad Request**: Zwrot, gdy format danych żądania jest niepoprawny lub brakuje kluczowych pól.
- **401 Unauthorized**: Zwrot, gdy użytkownik nie jest autoryzowany.
- **422 Unprocessable Entity**: Zwrot, gdy dane nie spełniają reguł walidacji (np. nieprawidłowy `source` lub brak `generation_id` dla flashcards typu AI).
- **500 Internal Server Error**: Zwrot w przypadku niespodziewanych błędów, takich jak problemy z bazą danych.
- **Rejestracja błędów**: W przypadku krytycznych błędów możliwe jest rejestrowanie szczegółów w tabeli `generation_error_logs` lub w systemie logowania serwera.

## 8. Rozważania dotyczące wydajności

- **Batch Processing**: Jeśli żądanie zawiera dużą liczbę flashcards, użycie operacji batch insert może poprawić wydajność.
- **Ograniczenie rozmiaru żądania**: Weryfikacja liczby flashcards w żądaniu, aby zapobiec przeciążeniu systemu.
- **Optymalizacja zapytań**: Zapewnienie odpowiednich indeksów na kolumnach takich jak `user_id` i `generation_id` w tabeli `flashcards` dla szybszego dostępu.

## 9. Etapy wdrożenia

1. Stworzenie Zod schema do walidacji żądania POST /flashcards.
2. Implementacja logiki biznesowej w warstwie serwisowej (np. w `src/lib/services/flashcard.service.ts`), która:
   - Przypisuje `user_id` z kontekstu autoryzacji.
   - Wykonuje inserty do tabeli `flashcards`.
3. Implementacja endpointu API w pliku `src/pages/api/flashcards.ts`:
   - Integracja middleware autoryzacyjnego (Supabase Auth).
   - Użycie Zod schema do walidacji danych wejściowych.
   - Wywołanie funkcji serwisowej i obsługa wyników.
4. Implementacja obsługi błędów zgodnie z ustalonymi kodami statusów (400, 401, 422, 500).
