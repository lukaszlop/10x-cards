Frontend - Astro z React dla komponentów interaktywnych:

- Astro 5 pozwala na tworzenie szybkich, wydajnych stron i aplikacji z minimalną ilością JavaScript
- React 19 zapewni interaktywność tam, gdzie jest potrzebna
- TypeScript 5 dla statycznego typowania kodu i lepszego wsparcia IDE
- Tailwind 4 pozwala na wygodne stylowanie aplikacji
- Shadcn/ui zapewnia bibliotekę dostępnych komponentów React, na których oprzemy UI

Backend - Supabase jako kompleksowe rozwiązanie backendowe:

- Zapewnia bazę danych PostgreSQL
- Zapewnia SDK w wielu językach, które posłużą jako Backend-as-a-Service
- Jest rozwiązaniem open source, które można hostować lokalnie lub na własnym serwerze
- Posiada wbudowaną autentykację użytkowników

AI - Komunikacja z modelami przez usługę Openrouter.ai:

- Dostęp do szerokiej gamy modeli (OpenAI, Anthropic, Google i wiele innych), które pozwolą nam znaleźć rozwiązanie zapewniające wysoką efektywność i niskie koszta
- Pozwala na ustawianie limitów finansowych na klucze API

Testowanie - Kompleksowe pokrycie testami na różnych poziomach:

**Testy jednostkowe:**

- Vitest jako szybki framework testowy oparty na Vite, zapewniający natywne wsparcie dla TypeScript i ES modules
- React Testing Library do testowania komponentów React z focus na user experience
- @testing-library/jest-dom dla dodatkowych matchers do testowania DOM

**Testy integracyjne:**

- MSW (Mock Service Worker) do mockowania API requests na poziomie service worker
- Supertest do testowania HTTP endpoints
- Testcontainers dla izolowanych testów z rzeczywistą bazą danych PostgreSQL

**Testy end-to-end:**

- Playwright jako nowoczesne narzędzie E2E obsługujące wszystkie główne przeglądarki (Chromium, Firefox, WebKit)
- @playwright/test dla struktury testów i assertions
- Wsparcie dla visual regression testing przez porównywanie screenshotów

**Testy wydajnościowe:**

- Lighthouse CI do monitorowania Core Web Vitals i performance metrics
- k6 do testów obciążeniowych API endpoints

**Testy dostępności:**

- @axe-core/playwright do automatycznego audytu accessibility
- Pa11y dla dodatowych testów zgodności z WCAG 2.1 AA

**Testy bezpieczeństwa:**

- Snyk do skanowania zależności pod kątem podatności
- OWASP ZAP do podstawowych testów penetracyjnych

**Dane testowe:**

- Faker.js do generowania realistycznych danych testowych
- Fishery jako factory pattern library dla consistent test objects
- Supabase test utilities do pracy z bazą danych w testach

CI/CD i Hosting:

- Github Actions do tworzenia pipeline'ów CI/CD z automatycznym uruchamianiem wszystkich typów testów przy każdym commit i PR
- DigitalOcean do hostowania aplikacji za pośrednictwem obrazu docker
- Quality gates w CI/CD: minimum 80% coverage, zero critical vulnerabilities, performance budget compliance
