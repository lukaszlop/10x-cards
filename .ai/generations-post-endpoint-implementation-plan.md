/\*
API Endpoint Implementation Plan: POST /generations

## 1. Przegląd punktu końcowego

Ten endpoint umożliwia przesłanie tekstu wejściowego, którego długość mieści się w zakresie 1000-10000 znaków, aby wygenerować propozycje fiszek (flashcards) przy użyciu zewnętrznego API LLM. Endpoint tworzy rekord generacji w bazie danych i zwraca wygenerowane propozycje fiszek oraz informacje o liczbie wygenerowanych rekordów.

## 2. Szczegóły żądania

- Metoda HTTP: POST
- Struktura URL: /generations
- Parametry:
  - Wymagane:
    - source_text (string): tekst wejściowy o długości między 1000 a 10000 znaków
  - Opcjonalne: brak
- Request Body Example:
  ```json
  {
    "source_text": "Przykładowy tekst o długości od 1000 do 10000 znaków."
  }
  ```

## 3. Wykorzystywane typy

- DTO i Command Modele:
  - `CreateGenerationCommand` (zawiera pole `source_text`)
  - `GenerationDTO` (z polami: generation_id, flashcards_proposals, generated_count i opcjonalnie flashcards)
  - `GenerationFlashcardProposal` (z polami: front, back, source przyjmującym wartość 'ai-full')
  - `GenerationErrorLogDTO` (dla logowania błędów w tabeli generation_error_logs)

## 4. Szczegóły odpowiedzi

- Sukces (HTTP 201):

  ```json
  {
    "generation_id": 123,
    "flashcards_proposals": [{ "front": "Generated Question", "back": "Generation answer", "source": "ai-full" }],
    "generated_count": 5
  }
  ```

- Kody statusu:
  - 201: Pomyślne utworzenie generacji
  - 400: Błędne dane wejściowe (np. niepoprawna długość `source_text` )
  - 500: Błąd serwera (np. awaria serwisu AI lub błąd zapisu do bazy danych)

## 4. Przepływ danych

1. Klient wysyła żądanie POST z `source_text` w ciele żądania.
2. Endpoint weryfikuje autentyczność użytkownika (używając Supabase Auth z context.locals).
3. Walidacja danych wejściowych: sprawdzenie czy `source_text` mieści się w wymaganym zakresie długości.
4. Logika biznesowa:
   - Wywołanie usługi (service layer `generation.service`), która:
     a. Wywołuje zewnętrzne API LLM w celu generacji propozycji fiszek.
     b. Mierzy czas trwania generacji.
     c. Tworzy rekord w tabeli `generations` z odpowiednimi metadanymi (model, generated_count, source_text_hash, source_text_length, generation_duration).
5. W przypadku sukcesu, zwracana jest odpowiedź zawierająca:
   - generation_id
   - flashcards_proposals (tablica propozycji fiszek)
   - generated_count
6. W przypadku niepowodzenia wywołania API LLM:
   - Logowanie błędu do tabeli `generation_error_logs`
   - Zwrócenie odpowiedniego komunikatu o błędzie

## 5. Względy bezpieczeństwa

- Autoryzacja: Endpoint zabezpieczony poprzez Supabase Auth. Tylko uwierzytelnieni użytkownicy mogą wywoływać ten endpoint.
- Walidacja danych: Zapewnienie, że `source_text` spełnia wymogi zakresu długości.
- Ochrona przed atakami typu injection poprzez stosowanie walidacji i sanitacji danych wejściowych.

## 6. Obsługa błędów

- 400 Bad Request: Gdy walidacja `source_text` nie powiedzie się lub dane wejściowe są nieprawidłowe.
- 401 Unauthorized: Gdy użytkownik nie jest uwierzytelniony.
- 422 Unprocessable Entity: Gdy dane wejściowe są poprawnie sformatowane, ale nie spełniają reguł biznesowych (np. brak wymaganych pól przy określonych źródłach).
- 500 Internal Server Error: W przypadku błędów po stronie zewnętrznego API LLM lub nieoczekiwanych problemów serwera. Błąd powinien być również logowany w tabeli `generation_error_logs`.

## 7. Rozważenia dotyczące wydajności

- Timeout dla wywołania AI: 60 sekund na czas oczekiwania, inaczej błąd timeout.
- Zewnętrzne API LLM może generować opóźnienia; rozważ asynchroniczne przetwarzanie lub mechanizm kolejkowania zadań.
- Monitorowanie czasu wykonania generacji i optymalizacja zapytań do bazy danych.
- Możliwość skalowania usługi poprzez rozdzielenie logiki generacji i zapisu danych.

## 8. Etapy wdrożenia

1. Utworzenie nowego endpointu POST /generations w odpowiednim pliku (np. w katalogu `src/pages/api`).
2. Implementacja walidacji wejściowej przy użyciu biblioteki `zod`, zgodnie z zasadami: długość `source_text` pomiędzy 1000 a 10000 znaków.
3. Dodanie logiki uwierzytelniania korzystającej z supabase z context.locals.
4. Wyodrębnienie logiki biznesowej do warstwy serwisowej (service layer `generation.service`) odpowiedzialnej za:
   - Wywołanie zewnętrznego API LLM. Na etapie developmentu skorzystamy z mocków zamiast wywoływać serwis AI.
   - Mierzenie czasu generacji
   - Zapis rekordu w tabeli `generations`
5. Implementacja mechanizmu logowania błędów w przypadku niepowodzenia wywołania API poprzez zapis do tabeli `generation_error_logs`.
6. Zwracanie struktury odpowiedzi zgodnie z API Specification:
   - generation_id
   - flashcards_proposals
   - generated_count
7. Code review, audyt bezpieczeństwa i dokumentacja.
   \*/
