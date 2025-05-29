<conversation_summary>
<decisions>

1. Supabase będzie obsługiwać tabelę użytkowników (`users`) z kolumnami: `id` (UUID), `email`, `created_at`, `encrypted_password`, `confirmed_at`.
2. Tabela `flashcards` będzie zawierać: `id` (bigserial), `front` (VARCHAR(200)), `back` (VARCHAR(500)), `source` (z constraint CHECK ograniczającym wartości do "ai-full", "ai-edited", "manual"), `created_at`, `updated_at`, `generation_id` (FK do `generations`) oraz `user_id` (FK do `users`).
3. Tabela `generations` będzie zawierać: `id` (bigserial), `user_id` (FK), `model`, `generated_count`, `accepted_unedited_count`, `accepted_edited_count`, `source_text_hash`, `source_text_length` (z ograniczeniem wartości od 1000 do 10000) oraz kolumnę `created_at`.
4. Tabela `generations_error_logs` będzie zawierać: `id` (bigserial), `user_id` (FK), `model`, `source_text_hash`, `source_text_length` (z ograniczeniem wartości od 1000 do 10000), `error_code`, `error_message` oraz `created_at`.
5. Pole `updated_at` w tabeli `flashcards` ma być automatycznie aktualizowane za pomocą triggera.
6. Zasady RLS będą wdrożone, aby użytkownik miał dostęp tylko do swoich danych, wykorzystując autoryzację opartą na Supabase Auth.
7. Klucze główne w tabelach `flashcards`, `generations` i `generations_error_logs` pozostaną jako bigserial, mimo że identyfikatory w tabeli `users` są typu UUID.
   </decisions>

<matched_recommendations>

1. Użycie constraint CHECK dla kolumny `source` w tabeli `flashcards`.
2. Dodanie kolumny `created_at` w tabelach `generations` oraz `generations_error_logs` do śledzenia czasu utworzenia rekordów.
3. Implementacja triggera do automatycznej aktualizacji pola `updated_at` w tabeli `flashcards`.
4. Utworzenie indeksów na kolumnach kluczowych, takich jak `user_id` we wszystkich tabelach oraz `generation_id` w tabeli `flashcards` i `source_text_hash` w tabelach `generations` oraz `generations_error_logs`.
5. Zdefiniowanie relacji między tabelami przy użyciu kluczy obcych oraz wdrożenie zasad RLS dla ochrony danych użytkowników.
   </matched_recommendations>

<database_planning_summary>
Główne wymagania dotyczące schematu bazy danych obejmują rozdzielenie danych na cztery główne encje: użytkownicy (`users`), fiszki (`flashcards`), sesje generacji (`generations`) oraz logi błędów generacji (`generations_error_logs`).
Kluczowe encje i ich relacje:

- Encja `users` (zarządzana przez Supabase) posiada UUID jako identyfikator i zawiera podstawowe dane użytkownika.
- Encja `flashcards` zawiera informacje o fiszkach, w tym pola tekstowe `front` (do 200 znaków) i `back` (do 500 znaków) oraz kolumnę `source` z ograniczeniem CHECK. Fiszki są powiązane z użytkownikiem oraz – opcjonalnie – z generacją.
- Encje `generations` oraz `generations_error_logs` przechowują historię generowania fiszek przez AI, w tym szczegóły modelu, metryki generacji oraz szczegóły błędów. Obie encje posiadają ograniczenie dla pola `source_text_length` (od 1000 do 10000).
  Bezpieczeństwo i skalowalność:
- Wdrożenie zasad RLS zapewni, że użytkownik uzyska dostęp tylko do swoich rekordów.
- Indeksowanie kluczowych kolumn (`user_id`, `generation_id`, `source_text_hash`) zagwarantuje wydajność zapytań.
- Użycie triggera dla automatycznej aktualizacji `updated_at` zapewni aktualność danych.
  Wszystkie powyższe decyzje są zgodne z wymaganiami MVP i dają solidny fundament do dalszego rozwoju systemu.
  </database_planning_summary>

<unresolved_issues>
Brak nierozwiązanych kwestii – obecne decyzje i zalecenia są kompletne na potrzeby MVP.
</unresolved_issues>
</conversation_summary>
