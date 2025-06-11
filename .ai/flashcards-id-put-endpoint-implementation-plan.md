# API Endpoint Implementation Plan: PUT /flashcards/{id}

## 1. Przegląd punktu końcowego

Endpoint umożliwiający modyfikację istniejącej fiszki. Użytkownik wysyła żądanie z nowymi danymi (front, back oraz source), a system weryfikuje dane, aktualizuje rekord w bazie i zwraca zaktualizowany obiekt fiszki.

## 2. Szczegóły żądania

- **Metoda HTTP**: PUT
- **Struktura URL**: /flashcards/{id}
- **Parametry**:
  - Wymagane:
    - `id` (parametr ścieżki) – identyfikator fiszki do edycji.
    - Body żądania (JSON) zawierający:
      - `front`: tekst fiszki (max. 200 znaków)
      - `back`: treść fiszki (max. 500 znaków)
      - `source`: źródło fiszki, możliwe wartości: `ai-edited`, `manual`
  - Opcjonalne: brak (możliwa częściowa aktualizacja, zależnie od implementacji)
- **Request Body**: JSON z powyższymi polami

## 3. Wykorzystywane typy

- **UpdateFlashcardDTO** – definiowany w `src/types.ts`, reprezentuje strukturę danych do aktualizacji fiszki.
- **FlashcardResponseDTO** – definiowany w `src/types.ts`, reprezentuje strukturę fiszki zwracaną w odpowiedzi.

## 4. Szczegóły odpowiedzi

- **Sukces (200 OK)**: Zwraca zaktualizowany obiekt fiszki w formacie JSON (FlashcardResponseDTO).
- **Błędy**:
  - 400 – Nieprawidłowe dane wejściowe (np. przekroczenie limitu znaków lub nieprawidłowa wartość `source`).
  - 401 – Nieautoryzowany dostęp.
  - 404 – Fiszka o podanym `id` nie istnieje.
  - 500 – Błąd serwera.

## 5. Przepływ danych

1. Klient wysyła żądanie PUT do `/flashcards/{id}` z danymi do aktualizacji.
2. Serwer weryfikuje autentyczność użytkownika oraz sprawdza, czy użytkownik ma prawo modyfikować wskazaną fiszkę.
3. Walidacja danych wejściowych:
   - Pole `front` nie przekracza 200 znaków.
   - Pole `back` nie przekracza 500 znaków.
   - Pole `source` należy do dozwolonych wartości: `ai-edited` lub `manual`.
4. System wyszukuje fiszkę w bazie danych.
5. Jeśli fiszka istnieje i walidacja przejdzie pozytywnie, rekord jest aktualizowany.
6. Zaktualizowana fiszka jest zwracana do klienta jako odpowiedź.

## 6. Względy bezpieczeństwa

- Weryfikacja autoryzacji: Upewnienie się, że użytkownik jest zalogowany i jest właścicielem fiszki.
- Walidacja danych wejściowych w celu ochrony przed atakami typu SQL Injection i innymi exploitami.
- Użycie `supabase` client z `context.locals` dla bezpiecznych operacji na bazie danych.
- Monitorowanie i logowanie nieautoryzowanych prób oraz potencjalnych błędów.

## 7. Obsługa błędów

- **400 Bad Request**: Zwracane przy błędach walidacji (np. przekroczenie limitu znaków, nieprawidłowa wartość `source`).
- **401 Unauthorized**: Gdy użytkownik nie jest zalogowany lub nie ma dostępu do modyfikacji danej fiszki.
- **404 Not Found**: Jeśli fiszka o podanym `id` nie zostanie odnaleziona.
- **500 Internal Server Error**: W przypadku nieoczekiwanych błędów serwera.

## 8. Rozważania dotyczące wydajności

- Aktualizacja pojedynczego rekordu minimalizuje obciążenie bazy danych.
- Wykorzystanie triggera w bazie danych do automatycznej aktualizacji pola `updated_at`.

## 9. Etapy wdrożenia

1. Utworzenie pliku endpointu w katalogu: `src/pages/api/flashcards/[id].ts` (lub według przyjętej struktury projektu).
2. Implementacja walidacji danych wejściowych za pomocą narzędzi takich jak Zod, sprawdzając długości pól `front` i `back` oraz poprawność `source`.
3. Weryfikacja autoryzacji użytkownika – sprawdzenie, czy użytkownik jest zalogowany i czy posiada prawo do edycji konkretnej fiszki.
4. Implementacja logiki aktualizacji:
   - Wywołanie metody serwisowej (np. `FlashcardService.updateFlashcard`) odpowiadającej za aktualizację rekordu w bazie.
   - Użycie `supabase` client z `context.locals` do wykonania zaktualizowanego zapytania.
5. Generowanie odpowiedzi: Przy powodzeniu zwrócenie zaktualizowanego obiektu fiszki z kodem 200.
6. Implementacja obsługi błędów:
   - Zwracanie odpowiednich kodów statusu (400, 401, 404, 500) w zależności od sytuacji.
   - Logowanie błędów w systemie, w razie potrzeby do dodatkowych tabel logów.
