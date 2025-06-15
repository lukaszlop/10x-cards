import { createSupabaseServer } from "@/db/supabase";
import { defineMiddleware } from "astro:middleware";

const protectedRoutes = ["/generations", "/flashcards"];
const authRoutes = ["/auth/login", "/auth/register"];

export const onRequest = defineMiddleware(async (context, next) => {
  const currentPath = context.url.pathname;

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
    // In test/CI environments, Supabase might not be available
    console.warn("Supabase middleware error (continuing):", error);

    // Set defaults for test environment
    context.locals.user = null;
    context.locals.session = null;
    context.locals.supabase = null;

    // Skip auth checks in test environment
    if (import.meta.env.NODE_ENV === "test" || import.meta.env.CI) {
      return next();
    }

    // In non-test environments, still try to redirect to login for protected routes
    if (protectedRoutes.some((route) => currentPath.startsWith(route))) {
      return context.redirect("/auth/login");
    }
  }

  return next();
});
