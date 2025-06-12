# Architektura UI dla 10x-cards

## 1. Przegląd struktury UI

Architektura interfejsu użytkownika opiera się na widoku generowania fiszek dostępnym po autoryzacji. Struktura obejmuje widoki uwierzytelniania, generowania fiszek, listy fiszek z modalem edycji, panelu użytkownika oraz widok sesji powtórkowej. Całość zapewnia zgodność z WCAG AA, korzysta z responsywnego designu opartego na Tailwind, gotowych komponentów Shadcn/ui oraz React.

## 2. Lista widoków

### 2.1. Ekran logowania

- **Ścieżka widoku:** `/login` i `/register`
- **Główny cel:** Umożliwienie użytkownikowi logowania oraz rejestracji.
- **Kluczowe informacje do wyświetlenia:** Formularze z polami email i hasło; wiadomości o błędach uwierzytelniania.
- **Kluczowe komponenty:** Formularz logowania/rejestracji, komponent walidacji, przyciski, komunikaty błędów.
- **UX, dostępność i bezpieczeństwo:** Prosty formularz, czytelne komunikaty błędów, obsługa klawiatury, zabezpieczenia JWT.

### 2.2. Widok generowania fiszek AI

- **Ścieżka widoku:** `/generations`
- **Główny cel:** Umożliwia użytkownikowi generowanie propozycji fiszek przez AI i ich rewizję (zaakceptuj, edytuj lub odrzuć).
- **Kluczowe informacje do wyświetlenia:** Pole wprowadzania tekstu,lista propozycji fiszek wygenerowanych przez AI, przyciski akceptacji, edycji lub odrzucenia dla każdej fiszki.
- **Kluczowe komponenty:** Komponent wejścia tekstowego, przycisk "Generuj fiszki", lista fiszek, przyciski akcji (zapisz wszystkie, zapisz zaakceptowane), wskaźnik ładowania (skeleton), komunikaty o błędach.
- **UX, dostępność i bezpieczeństwo:** Intuicyjny formularz, walidacja długości tekstu (1000-10000 znaków), responsywność, czytelne komunikaty i inline komunikaty o błędach.

### 2.3. Widok listy fiszek (Moje fiszki)

- **Ścieżka widoku:** `/flashcards`
- **Główny cel:** Przegląd, edycja oraz usuwanie zapisanych fiszek.
- **Kluczowe informacje do wyświetlenia:** Lista zapisanych fiszek z informacjami o pytaniu i odpowiedzi.
- **Kluczowe komponenty:** Lista elementów, komponent modal edycji, pzyciski usuwania, potwierdzenie operacji.
- **UX, dostępność i bezpieczeństwo:** Czytelny układ listy, dostępność klawiaturowa modyfikacji, potwierdzenia usunięcia.

### 2.4. Modal edycji fiszki

- **Ścieżka widoku:** Wyświetlany nad widokiem listy fiszek.
- **Główny cel:** Umożliwia edycję fiszek z walidacją danych bez zapisu w czasie rzeczywistym.
- **Kluczowe informacje do wyświetlenia:** Formularz edycji fiszki, pola "Przód" oraz "Tył", komunikaty walidacyjne.
- **Kluczowe komponenty:** Modal z formularzem, przyciski "Zapisz" i "Anuluj".
- **UX, dostępność i bezpieczeństwo:** Intuicyjny modal, dostępność dla czytników ekranów, walidacja danych po stronie klienta przed wysłaniem zmian.

### 2.5. Panel użytkownika

- **Ścieżka widoku:** `/profile`
- **Główny cel:** Zarządzanie informacjami o koncie użytkownika i ustawieniami.
- **Kluczowe informacje do wyświetlenia:** Dane użytkownika, opcje edycji profilu, przycisk wylogowania.
- **Kluczowe komponenty:** Formularz edycji profilu, przyciski akcji.
- **UX, dostępność i bezpieczeństwo:** Bezpieczne wylogowanie, łatwy dostęp do ustawień, prosty i czytelny interfejs.

### 2.6. Ekran sesji powtórkowych

- **Ścieżka widoku:** `/session`
- **Główny cel:** Umożliwić użytkownikowi naukę fiszek na podstawie algorytmu powtórek.
- **Kluczowe informacje do wyświetlenia:** Prezentacja fiszki (przód, a po interakcji – tył), opcje oceny przyswojenia fiszki.
- **Kluczowe komponenty:** Komponent wyświetlania fiszki, przyciski do odsłaniania treści, przyciski interakcji (np. "Pokaż odpowiedź", "Ocena"), licznik sesji.
- **UX, dostępność i bezpieczeństwo:** Minimalistyczny interfejs skupiony na nauce, responsywność, czytelne przyciski o wysokim kontraście, intuicyjny system przechodzenia między fiszkami.

## 3. Mapa podróży użytkownika

1. Użytkownik wchodzi na stronę i trafia do ekranu logowania/rejestracji.
2. Po pomyślnym zalogowaniu następuje przekierowanie do widoku generowania fiszek AI (`/generations`).
3. Użytkownik wprowadza tekst i inicjuje generowanie propozycji fiszek.
4. Wygenerowane fiszki są prezentowane z możliwością zaznaczenia, edycji inline lub usunięcia (opcjonalne otwarcie modala edycji).
5. Użytkownik zatwierdza (bulk lub pojedynczo) wybrane fiszki, które są zapisywane przez API (`/flashcards`).
6. Opcjonalnie, użytkownik przechodzi do widoku "Moje fiszki" (`/flashcards`), gdzie może przeglądać, edytować lub usuwać fiszki.
7. Użytkownik korzysta z nawigacji, aby odwiedzić panel użytkownika oraz opcjonalnie rozpocząć sesję powtórkową (`/session`).
8. W przypadku błędów (np. walidacji, problemów z API) użytkownik otrzymuje komunikaty inline.

## 4. Układ i struktura nawigacji

- Nawigacja główna będzie dostępna jako górne menu w layoucie strony po zalogowaniu.
- Linki nawigacyjne obejmują: "Generowanie fiszek", "Moje fiszki", "Profil" oraz przycisk wylogowania.
- Dla urządzeń mobilnych wdrożone zostanie hamburger menu z responsywnym rozkładem.
- Nawigacja umożliwia bezproblemowe przechodzenie między widokami, zachowując kontekst użytkownika oraz jego dane sesyjne.

## 5. Kluczowe komponenty

- **Formularze uwierzytelniania:** Komponenty logowania i rejestracji z obsługą walidacji.
- **Komponent generowania fiszek:** Z polem tekstowym i przyciskiem uruchamiającym proces generowania, ze wskaźnikiem ładowania.
- **Lista fiszek:** Interaktywny komponent wyświetlający listę fiszek z opcjami edycji i usuwania.
- **Modal edycji:** Komponent umożliwiający edycję fiszek z walidacją danych przed zatwierdzeniem.
- **Toast Notifications:** Komponenty do wyświetlania komunikatów o sukcesach oraz błędach.
- **Menu Nawigacji:** Elementy nawigacyjne ułatwiające przemieszczeni się między widokami.
- **Komponent sesji powtórek:** Interaktywny układ wyświetlania fiszek podczas sesji nauki z mechnizmem oceny.
