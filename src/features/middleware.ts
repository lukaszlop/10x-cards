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
