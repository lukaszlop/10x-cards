import { createSupabaseServer } from "@/db/supabase";
import { defineMiddleware } from "astro:middleware";

const protectedRoutes = ["/generations", "/flashcards"];
const authRoutes = ["/auth/login", "/auth/register"];

// Mock user for test environment (compatible with SupabaseUser type)
const mockTestUser = {
  id: "test-user-123",
  email: "test@test.com",
  aud: "authenticated",
  role: "authenticated",
  email_confirmed_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  app_metadata: {},
  user_metadata: {},
  identities: [],
  factors: [],
};

export const onRequest = defineMiddleware(async (context, next) => {
  const currentPath = context.url.pathname;

  // In test environment, use mock authentication
  if (import.meta.env.NODE_ENV === "test" || import.meta.env.CI) {
    console.log(`[TEST MODE] Processing request for: ${currentPath}`);

    // Mock Supabase client for test environment
    context.locals.supabase = null; // Not needed in tests

    // Determine if user should be "logged in" based on session cookie or default
    const sessionCookie = context.cookies.get("sb-access-token");
    const isLoggedIn =
      sessionCookie?.value === "mock-session-token" || context.url.searchParams.get("test_auth") === "true";

    if (isLoggedIn) {
      context.locals.user = mockTestUser;
      context.locals.session = {
        access_token: "mock-access-token",
        refresh_token: "mock-refresh-token",
        expires_in: 3600,
        expires_at: Date.now() + 3600000,
        token_type: "bearer",
        user: mockTestUser,
      };
      console.log(`[TEST MODE] User authenticated: ${mockTestUser.email}`);
    } else {
      context.locals.user = null;
      context.locals.session = null;
      console.log(`[TEST MODE] User not authenticated`);
    }

    // Handle auth redirects in test mode
    if (protectedRoutes.some((route) => currentPath.startsWith(route))) {
      if (!isLoggedIn) {
        console.log(`[TEST MODE] Redirecting to login: ${currentPath}`);
        return context.redirect("/auth/login");
      }
    }

    if (authRoutes.includes(currentPath)) {
      if (isLoggedIn) {
        console.log(`[TEST MODE] Redirecting logged-in user to home: ${currentPath}`);
        return context.redirect("/");
      }
    }

    return next();
  }

  // Production/development mode - use real Supabase
  try {
    context.locals.supabase = createSupabaseServer(context);

    // Get user from server - this is secure and authenticated
    const {
      data: { user },
    } = await context.locals.supabase.auth.getUser();
    context.locals.user = user;

    // For backwards compatibility, also get session
    // Note: Only use session for non-security critical operations
    const {
      data: { session },
    } = await context.locals.supabase.auth.getSession();
    context.locals.session = session;

    // Protect routes by checking authenticated user
    if (protectedRoutes.some((route) => currentPath.startsWith(route))) {
      if (!user) {
        return context.redirect("/auth/login");
      }
    }

    // Redirect logged-in users away from auth pages
    if (authRoutes.includes(currentPath)) {
      if (user) {
        return context.redirect("/");
      }
    }
  } catch (error) {
    console.warn("Supabase middleware error (continuing):", error);

    // Set defaults for error cases
    context.locals.user = null;
    context.locals.session = null;
    context.locals.supabase = null;

    // In non-test environments, still try to redirect to login for protected routes
    if (protectedRoutes.some((route) => currentPath.startsWith(route))) {
      return context.redirect("/auth/login");
    }
  }

  return next();
});
