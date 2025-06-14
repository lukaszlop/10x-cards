import { createSupabaseServer } from "@/db/supabase";
import { defineMiddleware } from "astro:middleware";

const protectedRoutes = ["/generations", "/flashcards"];
const authRoutes = ["/auth/login", "/auth/register"];

export const onRequest = defineMiddleware(async (context, next) => {
  const currentPath = context.url.pathname;
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

  return next();
});
