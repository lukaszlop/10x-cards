# Specyfikacja techniczna modułu autentykacji

## Wprowadzenie

Niniejszy dokument opisuje architekturę i implementację modułu rejestracji, logowania i odzyskiwania hasła dla aplikacji 10x-cards. Rozwiązanie bazuje na stacku technologicznym określonym w `@tech-stack.md`, w tym Astro, React i Supabase, oraz spełnia wymagania funkcjonalne zdefiniowane w `@prd.md` (US-001, US-002, US-009).

## 1. Architektura Interfejsu Użytkownika (Frontend)

### 1.1. Nowe strony Astro

W celu obsługi procesów autentykacji, utworzone zostaną następujące strony w `src/pages/`:

- **`/login.astro`**: Strona logowania. Będzie renderować komponent React `LoginForm`. W przypadku, gdy zalogowany użytkownik spróbuje uzyskać do niej dostęp, zostanie przekierowany na stronę główną (`/`).
- **`/register.astro`**: Strona rejestracji. Będzie renderować komponent React `RegisterForm`. Podobnie jak w przypadku strony logowania, zalogowani użytkownicy będą przekierowywani.
- **`/reset-password.astro`**: Strona umożliwiająca użytkownikowi zainicjowanie procesu resetowania hasła. Będzie renderować komponent `ResetPasswordForm`.
- **`/update-password.astro`**: Strona, na którą użytkownik zostanie przekierowany z linku w mailu resetującym hasło. Umożliwi ustawienie nowego hasła i będzie renderować komponent `UpdatePasswordForm`.

### 1.2. Modyfikacja istniejących komponentów

- **`src/components/Navigation.tsx`**: Ten komponent React zostanie rozszerzony o logikę warunkowego renderowania linków nawigacyjnych w zależności od stanu autentykacji użytkownika.
  - **Stan niezalogowany**: Widoczne będą przyciski/linki "Zaloguj się" (prowadzący do `/login`) i "Zarejestruj się" (prowadzący do `/register`).
  - **Stan zalogowany**: Widoczne będą linki do "Moje fiszki", "Generuj fiszki" oraz przycisk "Wyloguj".
  - Stan autentykacji będzie odczytywany po stronie klienta z wykorzystaniem hooka `useSupabaseAuth()` (patrz sekcja 3).

### 1.3. Nowe komponenty React

Wszystkie formularze interaktywne będą komponentami React, zlokalizowanymi w `src/components/auth/`:

- **`LoginForm.tsx`**: Komponent zawierający formularz logowania (email, hasło). Będzie wykorzystywał `react-hook-form` do zarządzania stanem i `zod` do walidacji po stronie klienta. Po pomyślnym zalogowaniu, użytkownik zostanie przekierowany do strony `/generations`. W przypadku błędu, pod polem formularza wyświetli się komunikat zwrotny z API.
- **`RegisterForm.tsx`**: Komponent z formularzem rejestracji (email, hasło). Podobnie jak `LoginForm`, będzie używał `react-hook-form` i `zod`. Po wysłaniu formularza, wyświetli komunikat informujący o konieczności potwierdzenia adresu e-mail.
- **`ResetPasswordForm.tsx`**: Komponent z polem na adres e-mail, inicjujący wysłanie linku do resetowania hasła.
- **`UpdatePasswordForm.tsx`**: Komponent z polem na nowe hasło, który będzie weryfikował token z URL i dokonywał zmiany hasła.

### 1.4. Walidacja i obsługa błędów

- Walidacja po stronie klienta (Client-Side) będzie realizowana przy użyciu `zod` i `react-hook-form` w celu natychmiastowego feedbacku dla użytkownika (np. niepoprawny format e-mail, zbyt krótkie hasło).
- Komunikaty o błędach pochodzące z API (np. "Użytkownik o podanym adresie e-mail już istnieje", "Nieprawidłowe hasło") będą przechwytywane w komponentach formularzy i wyświetlane w sposób czytelny dla użytkownika.
- Globalne powiadomienia (np. "Zostałeś pomyślnie zalogowany", "Sprawdź swoją skrzynkę e-mail") będą realizowane za pomocą komponentu `Toaster` z `sonner`, już zintegrowanego w `Layout.astro`.

## 2. Logika Backendowa

Architektura backendowa wykorzysta w pełni możliwości trybu SSR (Server-Side Rendering) w Astro.

### 2.1. Middleware

Sercem logiki autoryzacyjnej po stronie serwera będzie middleware Astro zlokalizowany w `src/middleware/index.ts`.

- **Działanie**: Middleware będzie uruchamiany przy każdym żądaniu do serwera.
- **Zadania**:
  1. Utworzenie serwerowego klienta Supabase przy użyciu `createSupabaseServerClient` z pakietu `@supabase/ssr`, przekazując mu ciasteczka (`Astro.cookies`) z bieżącego żądania.
  2. Pobranie sesji użytkownika za pomocą `supabase.auth.getSession()`.
  3. Zapisanie informacji o sesji i użytkowniku w `Astro.locals`, co udostępni te dane we wszystkich komponentach Astro renderowanych po stronie serwera.
  4. Ochrona tras: Sprawdzenie, czy bieżące żądanie dotyczy chronionej strony (np. `/generations`, `/flashcards`). Jeśli użytkownik nie jest zalogowany (`Astro.locals.session` jest `null`), zostanie wykonane przekierowanie (`Astro.redirect`) na stronę `/login`.

### 2.2. API Endpoints

Standardowe operacje (logowanie, rejestracja) będą obsługiwane przez klienta Supabase po stronie przeglądarki. Potrzebny będzie jednak endpoint do obsługi przepływu OAuth.

- **`src/pages/api/auth/callback.ts`**: Ten endpoint będzie odpowiedzialny za obsługę zwrotnych wywołań od Supabase po potwierdzeniu e-maila lub kliknięciu w link do resetowania hasła. Jego zadaniem będzie wymiana kodu autoryzacyjnego na sesję użytkownika za pomocą `supabase.auth.exchangeCodeForSession()` i przekierowanie użytkownika na odpowiednią stronę (np. stronę główną po potwierdzeniu rejestracji).

### 2.3. Struktura danych i bezpieczeństwo (Supabase)

- **Tabela `users`**: Zarządzana automatycznie przez Supabase Auth.
- **Tabela `flashcards`**: Tabela `flashcards` posiada już kolumnę `user_id` (typu `UUID`) powiązaną z użytkownikiem. Nie są wymagane żadne zmiany w schemacie tabeli.
- **Row Level Security (RLS)**: Kluczowym elementem będzie włączenie i skonfigurowanie polityk RLS na tabeli `flashcards`, aby zapewnić, że:
  - Użytkownicy mogą odczytywać (`SELECT`) wyłącznie własne fiszki (`auth.uid() = user_id`).

### 2.4. Renderowanie Server-Side

Dzięki middleware, każda strona `.astro` będzie miała dostęp do danych zalogowanego użytkownika przez `Astro.locals.user`. Pozwoli to na serwerowe renderowanie treści specyficznych dla użytkownika. Na przykład, strona `src/pages/flashcards.astro` w swojej części `---` (frontmatter) będzie mogła wykonać zapytanie do Supabase o fiszki, filtrując je po `Astro.locals.user.id`, a następnie wyrenderować je jako statyczny HTML, który zostanie wysłany do klienta.

## 3. System Autentykacji (Integracja z Supabase)

### 3.1. Konfiguracja

- Wykorzystane zostaną istniejące zmienne środowiskowe z pliku `.env`: `SUPABASE_URL` i `SUPABASE_KEY`. Zmienna `SUPABASE_URL` wskazuje na instancję Supabase w kontenerze Docker. Zmienna `SUPABASE_KEY` pełni rolę klucza publicznego (anon key).
- Konfiguracja Astro musi zapewniać dostępność tych zmiennych po stronie serwera i klienta. Zgodnie z konwencją Astro, zmienne dostępne po stronie klienta muszą mieć prefiks `PUBLIC_`. Należy upewnić się, że klucz `SUPABASE_KEY` jest udostępniony jako `PUBLIC_SUPABASE_KEY`.

### 3.2. Klient Supabase

W celu reużywalności kodu, w `src/db/` zostanie utworzony plik `supabase.ts` (lub podobny) eksportujący funkcje do tworzenia klientów Supabase:

- **Klient serwerowy**: Funkcja tworząca klienta Supabase dla kontekstu serwerowego (middleware, strony Astro) z obsługą cookies.
- **Klient przeglądarki**: Funkcja tworząca singleton klienta Supabase dla kontekstu klienckiego (komponenty React). Będzie używać `createSupabaseBrowserClient`.

### 3.3. Scenariusze autentykacji

- **Rejestracja**: `RegisterForm.tsx` wywoła `supabase.auth.signUp()`.
- **Logowanie**: `LoginForm.tsx` wywoła `supabase.auth.signInWithPassword()`. Supabase automatycznie ustawi odpowiednie ciasteczka sesyjne.
- **Wylogowanie**: Przycisk w `Navigation.tsx` wywoła `supabase.auth.signOut()`. Ciasteczka sesyjne zostaną usunięte.
- **Odzyskiwanie hasła**:
  1. `ResetPasswordForm.tsx` wywoła `supabase.auth.resetPasswordForEmail()`.
  2. Użytkownik, po przejściu na stronę `/update-password` z linku, w komponencie `UpdatePasswordForm.tsx` wywoła `supabase.auth.updateUser()`, aby ustawić nowe hasło.
- **Śledzenie stanu autentykacji na kliencie**: Komponenty React (głównie `Navigation.tsx`) będą używać hooka `supabase.auth.onAuthStateChange()`, aby dynamicznie reagować na zmiany stanu zalogowania (np. po zalogowaniu w innej karcie przeglądarki).

## 4. Mapowanie na historyjki użytkownika (User Stories)

Poniższa sekcja potwierdza, że architektura opisana w tym dokumencie w pełni pokrywa wymagania zdefiniowane w `@prd.md`.

**ID: US-001 - Rejestracja konta**

- **Realizacja**:
  - Strona `src/pages/register.astro` i komponent `src/components/auth/RegisterForm.tsx` (formularz email/hasło).
  - Wywołanie `supabase.auth.signUp()` z mechanizmem potwierdzenia email.
  - Endpoint `src/pages/api/auth/callback.ts` do finalizacji sesji po kliknięciu w link weryfikacyjny, co skutkuje zalogowaniem użytkownika.

**ID: US-002 - Logowanie do aplikacji**

- **Realizacja**:
  - Strona `src/pages/login.astro` i komponent `src/components/auth/LoginForm.tsx` (formularz logowania).
  - Komponent `src/components/Navigation.tsx` warunkowo wyświetlający opcje "Zaloguj" / "Wyloguj".
  - Proces odzyskiwania hasła realizowany przez strony `/reset-password` i `/update-password` oraz odpowiadające im komponenty React.
  - Przekierowanie do widoku generowania (`/generations`) po udanym logowaniu.

**ID: US-009 - Bezpieczny dostęp i autoryzacja**

- **Realizacja**:
  - Middleware `src/middleware/index.ts` chroniący trasy wymagające autentykacji.
  - Polityki Row Level Security (RLS) w bazie danych Supabase na tabeli `flashcards`, ograniczające dostęp do danych wyłącznie do ich właściciela (`auth.uid() = user_id`).
