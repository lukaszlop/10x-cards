# API Endpoint Implementation Plan: DELETE /flashcards/{id}

## 1. Przegląd punktu końcowego

Endpoint służy do usuwania pojedynczej fiszki (flashcard) przypisanej do zalogowanego użytkownika. Umożliwia trwałe usunięcie rekordu na podstawie identyfikatora (id) fiszki.

## 2. Szczegóły żądania

- **Metoda HTTP**: DELETE
- **Struktura URL**: /flashcards/{id}
- **Parametry**:
  - _Wymagane_:
    - `id` (route parameter) – identyfikator fiszki, który ma zostać usunięty
  - _Opcjonalne_: Brak
- **Request Body**: Brak

## 3. Wykorzystywane typy

- **DTO/Typy**:
  - Możliwe odniesienie do `FlashcardResponseDTO` z `src/types.ts`, choć endpoint nie zwraca obiektu fiszki, a jedynie komunikat powodzenia.
  - Nie ma dedykowanego Command Model dla usuwania, gdyż operacja polega jedynie na identyfikatorze.

## 4. Szczegóły odpowiedzi

- **Sukces (200 OK)**:
  - Treść: `{ "message": "Flashcard deleted successfully." }`
- **Błędy**:
  - **401 Unauthorized**: Jeżeli użytkownik nie jest uwierzytelniony.
  - **404 Not Found**: Jeżeli fiszka o podanym `id` nie istnieje lub nie należy do zalogowanego użytkownika.
  - **500 Internal Server Error**: W przypadku nieoczekiwanych błędów po stronie serwera.

## 5. Przepływ danych

1. Klient wysyła żądanie DELETE na URL `/flashcards/{id}` z wartością `id` fiszki do usunięcia.
2. Middleware autoryzacji (np. wykorzystujący Supabase Auth) weryfikuje, czy użytkownik jest zalogowany.
3. Endpoint pobiera parametr `id` z URL i dokonuje walidacji (np. czy `id` jest liczbą).
4. Sprawdzana jest obecność fiszki w bazie danych, przy czym weryfikowane jest, czy rekordu dotyczy aktualnie zalogowanego użytkownika (porównanie `user_id`).
5. W przypadku znalezienia rekordu, wykonywane jest zapytanie DELETE w tabeli `flashcards` przy użyciu Supabase.
6. Po pomyślnym usunięciu, endpoint zwraca odpowiedź JSON z komunikatem "Flashcard deleted successfully.".

## 6. Względy bezpieczeństwa

- **Uwierzytelnienie i autoryzacja**:
  - Endpoint musi być dostępny tylko dla uwierzytelnionych użytkowników. Wykorzystanie Supabase Auth lub innego mechanizmu autoryzacji jest wymagane.
  - Przed wykonaniem operacji usunięcia należy sprawdzić, czy fiszka należy do aktualnego użytkownika (sprawdzenie `user_id`).
- **Walidacja danych**:
  - Walidacja parametru `id` (czy jest liczbą i prawidłowym identyfikatorem).

## 7. Obsługa błędów

- **401 Unauthorized**: Zwracany, gdy użytkownik nie jest zalogowany lub token autoryzacyjny jest nieprawidłowy.
- **404 Not Found**: Zwracany, gdy fiszka o podanym `id` nie istnieje lub nie należy do użytkownika.
- **500 Internal Server Error**: Zwracany w przypadku wystąpienia błędu podczas operacji usunięcia. Dodatkowo, błąd może być logowany (np. przez wbudowany mechanizm loggera lub w tabeli error logów, jeśli taki mechanizm jest wdrożony w projekcie).

## 8. Rozważania dotyczące wydajności

- Zoptymalizowanie zapytań SQL poprzez wykorzystanie indeksu na kolumnie `id` w tabeli `flashcards`.

## 9. Etapy wdrożenia

1. **Utworzenie endpointu**: Dodanie pliku API endpoint w lokalizacji `src/pages/api/flashcards/[id].ts`.
2. **Implementacja middleware**: Zapewnienie, że dostęp do endpointu jest ograniczony do uwierzytelnionych użytkowników (np. sprawdzenie tokena Supabase lub sesji).
3. **Walidacja parametru `id`**: Pobranie parametru z URL i walidacja, czy jest prawidłowym identyfikatorem (np. liczba).
4. **Weryfikacja własności rekordu**: Sprawdzenie, czy fiszka o danym `id` istnieje i należy do zalogowanego użytkownika (porównanie `user_id`).
5. **Operacja usunięcia**: Wykonanie zapytania DELETE przy użyciu klienta Supabase.
6. **Zwrócenie odpowiedzi**: Po pomyślnym usunięciu, zwrócenie odpowiedzi 200 z odpowiednim komunikatem.
