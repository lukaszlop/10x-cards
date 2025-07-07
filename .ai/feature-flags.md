# Feature Flags System - Implementation Plan

## Overview

Implementing a universal TypeScript module for feature flags to separate deployments from releases in the 10xCards application. The system will work on both frontend and backend with build-time evaluation.

## Core Requirements

- Universal TypeScript module (`src/features/`)
- Build-time evaluation (static configuration)
- Support for environments: `local`, `integration`, `prod`
- Integration points: API endpoints, Astro pages, Navigation component
- Initial flags: `auth`, `collections`
- Default behavior: `false` when undefined
- Functional API: `isFeatureEnabled('auth')`

## Implementation Steps

### 1. Environment Variables Setup

#### 1.1 Update `src/env.d.ts`

```typescript
/// <reference types="astro/client" />
interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_KEY: string;
  readonly ENV_NAME: "local" | "integration" | "prod"; // Add this
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Add Astro.locals typing for existing user
declare namespace App {
  interface Locals {
    user: {
      email: string;
      id: string;
    } | null;
  }
}
```

#### 1.2 Update `.env.example`

```env
SUPABASE_URL=your_project_url
SUPABASE_KEY=your_anon_key
ENV_NAME=local
```

### 2. Feature Flags Core Module

#### 2.1 Create `src/features/flags.config.ts`

```typescript
export type Environment = "local" | "integration" | "prod";
export type FeatureName = "auth" | "collections";

export interface FeatureConfig {
  [key: string]: boolean;
}

export interface EnvironmentConfig {
  [env: string]: FeatureConfig;
}

export const FEATURE_FLAGS: EnvironmentConfig = {
  local: {
    auth: true,
    collections: true,
  },
  integration: {
    auth: true,
    collections: false,
  },
  prod: {
    auth: false,
    collections: false,
  },
};
```

#### 2.2 Create `src/features/flags.ts`

```typescript
import { FEATURE_FLAGS, type Environment, type FeatureName } from "./flags.config";

/**
 * Get current environment from ENV_NAME variable
 */
function getCurrentEnvironment(): Environment {
  const envName = import.meta.env.ENV_NAME;
  if (!envName || !["local", "integration", "prod"].includes(envName)) {
    console.warn(`Invalid ENV_NAME: ${envName}, defaulting to 'local'`);
    return "local";
  }
  return envName as Environment;
}

/**
 * Check if a feature is enabled in the current environment
 * @param featureName - Name of the feature to check
 * @returns boolean - true if feature is enabled, false otherwise (default: false)
 */
export function isFeatureEnabled(featureName: FeatureName): boolean {
  const environment = getCurrentEnvironment();
  const envConfig = FEATURE_FLAGS[environment];

  if (!envConfig) {
    console.warn(`No configuration found for environment: ${environment}`);
    return false;
  }

  return envConfig[featureName] ?? false;
}

/**
 * Get all enabled features for current environment
 */
export function getEnabledFeatures(): FeatureName[] {
  const environment = getCurrentEnvironment();
  const envConfig = FEATURE_FLAGS[environment];

  if (!envConfig) {
    return [];
  }

  return Object.entries(envConfig)
    .filter(([_, enabled]) => enabled)
    .map(([featureName, _]) => featureName as FeatureName);
}

/**
 * Check multiple features at once
 */
export function areAllFeaturesEnabled(...features: FeatureName[]): boolean {
  return features.every((feature) => isFeatureEnabled(feature));
}

/**
 * Check if any of the features is enabled
 */
export function isAnyFeatureEnabled(...features: FeatureName[]): boolean {
  return features.some((feature) => isFeatureEnabled(feature));
}
```

#### 2.3 Create `src/features/middleware.ts`

```typescript
import { isFeatureEnabled } from "./flags";

export interface FeatureRouteConfig {
  path: string;
  feature: "auth" | "collections";
  redirectTo?: string;
}

/**
 * Route mappings for feature flags
 */
export const FEATURE_ROUTES: FeatureRouteConfig[] = [
  // Auth routes
  { path: "/auth/login", feature: "auth" },
  { path: "/auth/register", feature: "auth" },
  { path: "/auth/reset-password", feature: "auth" },
  { path: "/auth/password-recovery", feature: "auth" },
  { path: "/auth/confirm-email", feature: "auth" },
  { path: "/auth/registration-pending", feature: "auth" },
  { path: "/auth/update-password", feature: "auth" },

  // Collections routes
  { path: "/flashcards", feature: "collections" },
  { path: "/generations", feature: "collections" },

  // API routes
  { path: "/api/auth/", feature: "auth" },
  { path: "/api/flashcards", feature: "collections" },
  { path: "/api/generations", feature: "collections" },
];

/**
 * Check if a route is protected by feature flags
 */
export function isRouteEnabled(pathname: string): boolean {
  const route = FEATURE_ROUTES.find((route) => {
    if (route.path.endsWith("/")) {
      return pathname.startsWith(route.path);
    }
    return pathname === route.path || pathname.startsWith(route.path + "/");
  });

  if (!route) {
    // Route not governed by feature flags - allow access
    return true;
  }

  return isFeatureEnabled(route.feature);
}

/**
 * Get disabled route redirect target
 */
export function getDisabledRouteRedirect(pathname: string): string {
  const route = FEATURE_ROUTES.find((route) => {
    if (route.path.endsWith("/")) {
      return pathname.startsWith(route.path);
    }
    return pathname === route.path || pathname.startsWith(route.path + "/");
  });

  return route?.redirectTo || "/";
}
```

#### 2.4 Create `src/features/index.ts`

```typescript
export { isFeatureEnabled, getEnabledFeatures, areAllFeaturesEnabled, isAnyFeatureEnabled } from "./flags";
export { isRouteEnabled, getDisabledRouteRedirect, FEATURE_ROUTES } from "./middleware";
export type { Environment, FeatureName } from "./flags.config";
```

### 3. Middleware Integration

#### 3.1 Update `src/middleware/index.ts`

```typescript
import { createSupabaseServerInstance } from "../db/supabase.client.ts";
import { defineMiddleware } from "astro:middleware";
import { isRouteEnabled, getDisabledRouteRedirect } from "../features";

// Public paths - Auth API endpoints & Server-Rendered Astro Pages
const PUBLIC_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/reset-password",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/reset-password",
];

export const onRequest = defineMiddleware(async ({ locals, cookies, url, request, redirect }, next) => {
  // Check feature flags first
  if (!isRouteEnabled(url.pathname)) {
    const redirectTarget = getDisabledRouteRedirect(url.pathname);
    return redirect(redirectTarget);
  }

  // Skip auth check for public paths
  if (PUBLIC_PATHS.includes(url.pathname)) {
    return next();
  }

  const supabase = createSupabaseServerInstance({
    cookies,
    headers: request.headers,
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    locals.user = {
      email: user.email,
      id: user.id,
    };
  } else if (!PUBLIC_PATHS.includes(url.pathname)) {
    return redirect("/auth/login");
  }

  return next();
});
```

### 4. Layout Integration

#### 4.1 Update `src/layouts/Layout.astro`

```astro
---
import { Navigation } from "@/components/Navigation";
import { Toaster } from "@/components/ui/sonner";
import { isFeatureEnabled } from "@/features";
// ... other imports

interface Props {
  title: string;
}

const { title } = Astro.props;
const user = Astro.locals.user ?? null;

// Feature flags for UI components
const authEnabled = isFeatureEnabled("auth");
const collectionsEnabled = isFeatureEnabled("collections");
---

<!doctype html>
<html lang="en">
  <!-- head content stays the same -->
  <body class="sm:bg-gray-100">
    <!-- ... toaster and background -->

    <div data-astro-transition-persist="navigation">
      <Navigation
        initialUser={user}
        authEnabled={authEnabled}
        collectionsEnabled={collectionsEnabled}
        client:only="react"
      />
    </div>

    <!-- ... rest of layout -->
  </body>
</html>
```

### 5. Navigation Component Update

#### 5.1 Update `src/components/Navigation.tsx`

```typescript
interface NavigationProps {
  initialUser: User | null;
  authEnabled: boolean;
  collectionsEnabled: boolean;
}

export const Navigation = ({ initialUser, authEnabled, collectionsEnabled }: NavigationProps) => {
  // ... existing logic

  // Update navigation items based on feature flags
  const navigationItems = [
    ...(collectionsEnabled
      ? [
          { href: "/generations", label: "Generowanie fiszek", testId: "nav-generations" },
          { href: "/flashcards", label: "Moje fiszki", testId: "nav-flashcards" },
        ]
      : []),
  ];

  // ... rest of component logic with conditional rendering
};
```

### 6. API Endpoints Protection

#### 6.1 Update API endpoints (example: `src/pages/api/flashcards.ts`)

```typescript
import type { APIRoute } from "astro";
import { isFeatureEnabled } from "@/features";

export const GET: APIRoute = async ({ request }) => {
  // Check feature flag first
  if (!isFeatureEnabled("collections")) {
    return new Response("Feature not available", { status: 404 });
  }

  // ... existing logic
};

export const POST: APIRoute = async ({ request }) => {
  if (!isFeatureEnabled("collections")) {
    return new Response("Feature not available", { status: 404 });
  }

  // ... existing logic
};
```

#### 6.2 Update auth API endpoints

```typescript
// src/pages/api/auth/login.ts, register.ts, etc.
import { isFeatureEnabled } from "@/features";

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!isFeatureEnabled("auth")) {
    return new Response("Authentication not available", { status: 404 });
  }

  // ... existing logic
};
```

### 7. Page-Level Protection

#### 7.1 Example: Update `src/pages/generations.astro`

```astro
---
import { GenerationsView } from "../components/generations/GenerationsView";
import Layout from "../layouts/Layout.astro";
import { isFeatureEnabled } from "@/features";

// Check feature flag
if (!isFeatureEnabled("collections")) {
  return Astro.redirect("/");
}
---

<Layout title="Generowanie Fiszek AI">
  <!-- ... existing content -->
</Layout>
```

### 8. Testing Strategy

#### 8.1 Unit Tests for Feature Flags

```typescript
// src/features/flags.test.ts
import { describe, it, expect, vi } from "vitest";
import { isFeatureEnabled } from "./flags";

describe("Feature Flags", () => {
  it("should return false for disabled features", () => {
    vi.stubEnv("ENV_NAME", "prod");
    expect(isFeatureEnabled("auth")).toBe(false);
  });

  it("should return true for enabled features", () => {
    vi.stubEnv("ENV_NAME", "local");
    expect(isFeatureEnabled("auth")).toBe(true);
  });

  it("should default to false for unknown features", () => {
    vi.stubEnv("ENV_NAME", "local");
    expect(isFeatureEnabled("unknown" as any)).toBe(false);
  });
});
```

#### 8.2 E2E Tests Updates

```typescript
// e2e/feature-flags.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Feature Flags", () => {
  test("should hide collections when disabled", async ({ page }) => {
    // Set ENV_NAME=integration (collections disabled)
    await page.goto("/");
    await expect(page.locator('[data-test-id="nav-flashcards"]')).not.toBeVisible();
  });

  test("should show 404 for disabled auth routes", async ({ page }) => {
    // Set ENV_NAME=prod (auth disabled)
    const response = await page.goto("/auth/login");
    expect(response?.status()).toBe(404);
  });
});
```

## Implementation Checklist

### Phase 1: Core Setup

- [ ] Update `src/env.d.ts` with ENV_NAME typing
- [ ] Update `.env.example` with ENV_NAME
- [ ] Create `src/features/flags.config.ts`
- [ ] Create `src/features/flags.ts`
- [ ] Create `src/features/middleware.ts`
- [ ] Create `src/features/index.ts`

### Phase 2: Middleware Integration

- [ ] Update `src/middleware/index.ts` with feature flag checks
- [ ] Test middleware redirects for disabled features

### Phase 3: UI Integration

- [ ] Update `src/layouts/Layout.astro`
- [ ] Update `src/components/Navigation.tsx`
- [ ] Test navigation visibility changes

### Phase 4: API Protection

- [ ] Update all auth API endpoints
- [ ] Update all collections API endpoints
- [ ] Test API 404 responses for disabled features

### Phase 5: Page Protection

- [ ] Update all auth pages
- [ ] Update all collections pages
- [ ] Test page redirects for disabled features

### Phase 6: Testing

- [ ] Write unit tests for feature flags
- [ ] Update E2E tests for feature flag scenarios
- [ ] Test all environments (local, integration, prod)

## Configuration Examples

### Local Development (Everything enabled)

```env
ENV_NAME=local
```

### Integration Environment (Limited features)

```env
ENV_NAME=integration
```

### Production (Controlled rollout)

```env
ENV_NAME=prod
```

## Future Enhancements

1. Runtime flag updates (database-driven)
2. User-specific flags (A/B testing)
3. Percentage rollouts
4. Feature flag analytics
5. Admin UI for flag management
