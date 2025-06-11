# API Endpoint Implementation Plan: GET /flashcards/{id}

## 1. Przegląd punktu końcowego

Endpoint służy do pobrania szczegółów pojedynczej fiszki, która należy do uwierzytelnionego użytkownika. Umożliwia on weryfikację, czy żądana fiszka istnieje oraz jest własnością użytkownika, który wysyła żądanie.

## 2. Szczegóły żądania

- **Metoda HTTP**: GET
- **Struktura URL**: `/flashcards/{id}`
- **Parametry**:
  - **Wymagane**:
    - `id`: identyfikator fiszki (np. liczba, odpowiadająca kolumnie `id` w tabeli `flashcards`)
  - **Opcjonalne**: brak
- **Request Body**: Brak

## 3. Wykorzystywane typy

- **FlashcardResponseDTO**: Typ definiowany w `src/types.ts`, odpowiadający strukturze fiszki pobranej z bazy danych.

## 4. Szczegóły odpowiedzi

- **Sukces (200)**: Zwraca obiekt fiszki w formacie JSON, zgodny z typem `FlashcardResponseDTO`.
- **Błędy**:
  - **401 Unauthorized**: Jeżeli token uwierzytelniający jest niepoprawny lub brakuje go.
  - **404 Not Found**: Jeżeli fiszka o podanym `id` nie istnieje lub nie należy do uwierzytelnionego użytkownika.
  - **500 Internal Server Error**: Dla niespodziewanych błędów serwera.

## 5. Przepływ danych

1. Użytkownik wysyła żądanie GET do endpointu `/flashcards/{id}` wraz z tokenem uwierzytelniającym.
2. Middleware lub logika uwierzytelniająca weryfikuje token i wydobywa identyfikator użytkownika.
3. Dane wejściowe (parametr `id`) są walidowane (np. czy są liczbą) przed przekazaniem do logiki biznesowej.
4. Serwis wykonuje zapytanie do bazy danych, filtrując rekordy w tabeli `flashcards` po `id` oraz `user_id` równym identyfikatorowi uwierzytelnionego użytkownika.
5. Jeżeli fiszka zostanie odnaleziona, jej dane są zwracane w odpowiedzi.
6. W przypadku braku rekordu następuje zwrócenie błędu 404.

## 6. Względy bezpieczeństwa

- **Uwierzytelnianie**: Wymagane jest użycie tokena uwierzytelniającego (Supabase Auth).
- **Autoryzacja**: Zapewnienie, że tylko właściciel fiszki ma do niej dostęp (RLS w Supabase).
- **Walidacja wejścia**: Sprawdzenie poprawności parametrów (np. `id` musi być liczbą) przed wykonaniem zapytania do bazy.

## 7. Obsługa błędów

- **401 Unauthorized**: Zwracany, gdy brakuje lub jest niepoprawny token uwierzytelniający.
- **404 Not Found**: Zwracany, gdy fiszka o podanym `id` nie istnieje lub nie jest powiązana z użytkownikiem:
  - Upewnij się, że logika wyszukiwania poprawnie filtruje po `user_id`.
- **500 Internal Server Error**: Wszelkie nieoczekiwane błędy (np. błąd połączenia z bazą) powinny być logowane i zwracane jako błąd serwera.

## 8. Rozważania dotyczące wydajności

- Upewnić się, że kolumny `id` i `user_id` w tabeli `flashcards` są odpowiednio indeksowane.

## 9. Etapy wdrożenia

1. **Implementacja endpointu**:
   - Utworzyć plik API (np. w `src/pages/api/flashcards/[id].ts` lub odpowiednim miejscu dla Astro API) obsługujący metodę GET.
2. **Uwierzytelnianie i autoryzacja**:
   - Wyciągnąć token z nagłówka `Authorization` i zweryfikować go z użyciem Supabase Auth.
   - Pobierać identyfikator użytkownika z kontekstu (np. `context.locals` lub inny mechanizm przekazywania danych uwierzytelniających).
3. **Walidacja parametrów**:
   - Sprawdzić, czy parametr `id` jest poprawnie sformatowany.
4. **Logika dostępu do bazy danych**:
   - Wykonać zapytanie do tabeli `flashcards`, filtrując po `id` i `user_id`.
5. **Obsługa wyniku zapytania**:
   - Jeśli fiszka zostanie znaleziona, zwrócić kod 200 i dane fiszki w formacie JSON.
   - Jeśli nie, zwrócić kod 404.
6. **Obsługa błędów**:
   - Zaimplementować odpowiednie bloki catch, które zwrócą błąd 500 w przypadku wyjątków oraz zalogują błąd dla celów diagnostycznych.
