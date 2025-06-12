### 1. Aktorzy i ich role

W procesie autentykacji biorą udział cztery główne strony (aktorzy):

1.  **Przeglądarka (Klient)**: Reprezentuje interfejs użytkownika (komponenty React), z którym wchodzi w interakcję użytkownik. Przechowuje tokeny w bezpiecznych ciasteczkach `HttpOnly` i inicjuje żądania.
2.  **Astro Middleware**: Działa jako serwerowa "bramka" dla żądań przychodzących do aplikacji. Jest pierwszą linią obrony – weryfikuje sesję użytkownika przy każdej nawigacji po stronie renderowanej na serwerze.
3.  **Astro API (`/api/auth/callback`)**: Specjalistyczny, serwerowy punkt końcowy, którego jedynym zadaniem jest bezpieczna wymiana kodu autoryzacyjnego (otrzymanego w linku e-mail) na pełnoprawną sesję użytkownika.
4.  **Supabase Auth**: Zewnętrzna usługa, która działa jako "źródło prawdy" (source of truth) w kwestii tożsamości. Zarządza danymi użytkowników, hasłami, generuje i weryfikuje tokeny JWT oraz obsługuje wysyłkę e-maili transakcyjnych (np. weryfikacyjnych).

### 2. Przepływy autentykacji

Zidentyfikowałem trzy kluczowe przepływy, które muszą zostać zwizualizowane:

1.  **Dostęp do strony chronionej i odświeżanie sesji**: Pokazuje, jak `Middleware` chroni zasoby i jak biblioteka `@supabase/ssr` w tle, w sposób niewidoczny dla użytkownika, odświeża wygasające tokeny dostępowe, zapewniając ciągłość sesji.
2.  **Rejestracja i weryfikacja przez e-mail**: Ilustruje, jak użytkownik tworzy konto, a następnie finalizuje proces, klikając w link weryfikacyjny, co uruchamia bezpieczny przepływ po stronie serwera przez `Astro API`.
3.  **Logowanie i wylogowanie**: Klasyczny proces, w którym użytkownik podaje poświadczenia, a w odpowiedzi otrzymuje ciasteczka sesyjne. Pokazany zostanie również proces czyszczenia sesji podczas wylogowania.

### 3. Proces weryfikacji i odświeżania tokenów

- **Tokeny**: Supabase używa pary tokenów:
  - **Access Token (JWT)**: Krótkożyjący (np. 1 godzina), używany do autoryzacji żądań.
  - **Refresh Token**: Długożyjący, bezpiecznie przechowywany i używany wyłącznie do uzyskania nowego Access Tokena.
- **Weryfikacja**: `Middleware` przy każdym żądaniu przekazuje ciasteczka do serwerowego klienta Supabase. Klient weryfikuje sygnaturę i datę ważności Access Tokena.
- **Odświeżanie**: Jeśli Access Token wygasł, ale Refresh Token jest wciąż ważny, serwerowy klient Supabase automatycznie używa go do uzyskania nowej pary tokenów od `Supabase Auth`. Następnie aktualizuje ciasteczka w odpowiedzi do przeglądarki. Ten proces jest kluczowy dla bezpieczeństwa i wygody użytkowania.

```mermaid
sequenceDiagram
    autonumber

    participant Browser as Przeglądarka (Klient)
    participant Middleware as Astro Middleware
    participant API as Astro API (Callback)
    participant Supabase as Supabase Auth

    %% --- Przepływ 1: Dostęp do strony chronionej ---
    Note over Przeglądarka, Supabase: Scenariusz: Zalogowany użytkownik wchodzi na chronioną stronę

    activate Przeglądarka
    Przeglądarka->>Middleware: GET /moje-fiszki (z cookie sesyjnym)
    activate Middleware

    Middleware->>Supabase: Weryfikuj sesję z przekazanych cookies
    activate Supabase

    alt Sesja i tokeny są ważne
        Supabase-->>Middleware: Zwraca dane sesji
    else Access Token wygasł, Refresh Token jest ważny
        Supabase->>Supabase: Użyj Refresh Tokena, aby wydać nowy Access Token
        Supabase-->>Middleware: Zwraca nową sesję i zaktualizowane cookie
        Middleware-->>Przeglądarka: Odpowiedź z nagłówkiem "Set-Cookie" (odświeża tokeny)
    end
    deactivate Supabase

    Middleware-->>Przeglądarka: Zezwól na dostęp, renderuj stronę
    deactivate Middleware
    deactivate Przeglądarka


    %% --- Przepływ 2: Rejestracja i weryfikacja e-mail ---
    Note over Przeglądarka, Supabase: Scenariusz: Nowy użytkownik tworzy konto

    activate Przeglądarka
    Przeglądarka->>Supabase: signUp(email, haslo)
    activate Supabase

    par Rejestracja w bazie
        Supabase->>Supabase: Zapisz nowego użytkownika
    and Wysłanie e-maila
        Supabase->>Supabase: Wygeneruj token weryfikacyjny i wyślij e-mail
    end

    Supabase-->>Przeglądarka: Odpowiedź: "Sprawdź skrzynkę e-mail"
    deactivate Supabase
    deactivate Przeglądarka

    Note over Przeglądarka, Supabase: ...później, użytkownik klika link w mailu...

    activate Przeglądarka
    Przeglądarka->>API: GET /api/auth/callback?code=...
    activate API

    API->>Supabase: exchangeCodeForSession(otrzymany_kod)
    activate Supabase
    Supabase-->>API: Zwraca nową, ważną sesję i tokeny
    deactivate Supabase

    API-->>Przeglądarka: Ustaw cookie sesyjne i przekieruj na /moje-fiszki
    deactivate API
    deactivate Przeglądarka

    %% --- Przepływ 3: Logowanie ---
    Note over Przeglądarka, Supabase: Scenariusz: Powracający użytkownik loguje się

    activate Przeglądarka
    Przeglądarka->>Supabase: signInWithPassword(email, haslo)
    activate Supabase
    Supabase-->>Przeglądarka: Odpowiedź z sesją, ustawia cookie
    deactivate Supabase
    deactivate Przeglądarka
```
