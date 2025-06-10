# Przewodnik Implementacji Usługi OpenRouter

## 1. Opis usługi

Usługa OpenRouter to moduł integrujący interfejs API OpenRouter w celu uzupełnienia czatów opartych na LLM. Jej zadaniem jest:

1. Wysyłanie zapytań do OpenRouter API wykorzystujących komunikaty systemowe oraz użytkownika.
2. Odbieranie i walidacja ustrukturyzowanych odpowiedzi, zgodnych z zadanym schematem JSON.
3. Dynamiczne ustawianie parametrów modelu, takich jak nazwa modelu i parametry operacyjne (np. temperature, max_tokens).

## 2. Opis konstruktora

Konstruktor usługi inicjuje podstawowe konfiguracje, w tym:

- Klucz API oraz ustawienia uwierzytelniania (przechowywane w zmiennych środowiskowych).
- Domyślny komunikat systemowy (np. "You are a helpful assistant.").
- Domyślny `response_format` zdefiniowany według wzoru:

  ```json
  {
    "type": "json_schema",
    "json_schema": {
      "name": "chatResponseSchema",
      "strict": true,
      "schema": {
        "answer": { "type": "string" },
        "confidence": { "type": "number" }
      }
    }
  }
  ```

- Domyślną nazwę modelu (np. "openrouter-llm-002") oraz parametry modelu (np. { temperature: 0.7, max_tokens: 150, top_p: 0.9 }).

## 3. Publiczne metody i pola

1. **sendMessage(userMessage: string): Promise<Response>**

   - Wysyła komunikat użytkownika wraz z domyślnym komunikatem systemowym do OpenRouter API.
   - Łączy komunikaty w jeden ładunek, wykorzystując ustawiony `response_format`, nazwę modelu i parametry modelu.

2. **setSystemMessage(message: string): void**

   - Umożliwia aktualizację domyślnego komunikatu systemowego.

3. **updateModelConfig(config: ModelConfig): void**

   - Pozwala na aktualizację nazwy modelu oraz parametrów używanych przy zapytaniach.

4. **setResponseFormat(format: ResponseFormat): void**
   - Ustawia schemat odpowiedzi, umożliwiając konfigurację walidowanego formatu.
   - Przykład wzoru:
     ```json
     {
       "type": "json_schema",
       "json_schema": {
         "name": "customSchema",
         "strict": true,
         "schema": { "result": { "type": "string" } }
       }
     }
     ```

## 4. Prywatne metody i pola

1. **apiClient**

   - Niskopoziomowy moduł odpowiedzialny za komunikację HTTP z OpenRouter API.
   - Realizuje automatyczne ponawianie zapytań (retry) przy niepowodzeniach sieciowych.

2. **buildRequestPayload(userMessage: string): RequestPayload**

   - Łączy komunikat systemowy z użytkownika i buduje pełny ładunek zapytania.
   - Upewnia się, że wszystkie wymagane pola (system message, user message, response_format, model name, model parameters) są poprawnie skonfigurowane.

3. **parseResponse(response: any): ParsedResponse**

   - Waliduje otrzymaną odpowiedź według skonfigurowanego schematu JSON.
   - W przypadku niezgodności lub błędów, przekazuje informację do modułu obsługi błędów.

4. **handleError(error: any): void**
   - Centralizuje obsługę błędów, loguje problemy i mapuje je na czytelne komunikaty dla użytkownika.

## 5. Obsługa błędów

Główne scenariusze błędów oraz proponowane podejścia:

1. **Błąd sieci**

   - Problem: Timeout lub brak połączenia.
   - Rozwiązanie: Implementacja retry z mechanizmem backoff i dokładne logowanie błędów.

2. **Błędne dane uwierzytelniające**

   - Problem: Nieprawidłowy lub wygasły klucz API.
   - Rozwiązanie: Weryfikacja konfiguracji oraz zwracanie komunikatów o błędach uwierzytelniania.

3. **Przekroczenie limitów API**

   - Problem: Osiągnięcie limitu zapytań.
   - Rozwiązanie: Implementacja mechanizmu opóźnień i ponownych prób wysłania zapytań, wraz z informowaniem użytkownika o przeciążeniu systemu.

4. **Nieprawidłowy format odpowiedzi**

   - Problem: Odpowiedź nie spełnia oczekiwanego schematu JSON.
   - Rozwiązanie: Weryfikacja odpowiedzi przy użyciu walidatora schematów, fallback do trybu awaryjnego oraz zgłaszanie błędu.

5. **Błędy wewnętrzne serwisu**
   - Problem: Nieoczekiwane wyjątki lub błędy logiczne.
   - Rozwiązanie: Użycie centralnego mechanizmu `handleError` do przechwytywania i logowania błędów oraz zwracania przyjaznych komunikatów błędów.

## 6. Kwestie bezpieczeństwa

- **Przechowywanie danych uwierzytelniających:** Używanie zmiennych środowiskowych do przechowywania klucza API.
- **Ograniczone logowanie:** Unikanie zapisywania wrażliwych danych w logach, zwłaszcza w środowisku produkcyjnym.

## 7. Plan wdrożenia krok po kroku

1. **Przygotowanie środowiska**

   - Skonfigurowanie zmiennych środowiskowych (API Key, endpointy).
   - Instalacja niezbędnych bibliotek (HTTP client, walidatory, logger).

2. **Implementacja modułu API Connector**

   - Utworzenie `apiClient` z obsługą retries oraz mechanizmem backoff.
   - Testowanie połączeń z OpenRouter API.

3. **Budowa konstruktora usługi**

   - Inicjalizacja domyślnych parametrów (komunikat systemowy, response_format, model name, model parameters).
   - Umożliwienie ich modyfikacji przez metody publiczne.

4. **Implementacja metody buildRequestPayload**

   - Scalanie komunikatu systemowego oraz komunikatu użytkownika.
   - Ustawienie response_format według wzoru:
     ```json
     {
       "type": "json_schema",
       "json_schema": {
         "name": "chatResponseSchema",
         "strict": true,
         "schema": {
           "answer": { "type": "string" },
           "confidence": { "type": "number" }
         }
       }
     }
     ```
   - Włączenie nazwy modelu oraz parametrów modelu do ładunku.

5. **Implementacja metody sendMessage**

   - Wysłanie przygotowanego żądania do OpenRouter API przy wykorzystaniu `apiClient`.
   - Obsługa asynchroniczna odpowiedzi.

6. **Implementacja metody parseResponse**

   - Walidacja i przetwarzanie odpowiedzi przy użyciu zdefiniowanego schematu JSON.
   - Przekazanie błędów do centralnej obsługi w razie niezgodności.

7. **Wdrożenie centralnej obsługi błędów**

   - Implementacja metody `handleError` obsługującej wszystkie zdefiniowane scenariusze błędów.
   - Logowanie i komunikacja błędów zgodnie z najlepszymi praktykami.
