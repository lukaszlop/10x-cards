import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerInstance } from "../db/supabase.client";

// Public paths that don't require authentication
const PUBLIC_PATHS = [
  "/", // Assuming the homepage is public
  "/login",
  "/register",
  "/reset-password",
  // Auth API endpoints
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
  "/api/auth/reset-password",
];

export const onRequest = defineMiddleware(async ({ locals, cookies, url, request, redirect }, next) => {
  const supabase = createSupabaseServerInstance({
    cookies,
    headers: request.headers,
  });

  // IMPORTANT: Always get user session first before any other operations
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Assign supabase and user to locals for use in pages
  locals.supabase = supabase;
  if (user) {
    locals.user = {
      id: user.id,
      email: user.email,
    };
  }

  // Redirect to login for protected routes if user is not authenticated
  if (!user && !PUBLIC_PATHS.includes(url.pathname)) {
    return redirect("/login");
  }

  // If the user is logged in and tries to access a public auth page like /login, redirect them to a dashboard or home.
  if (user && (url.pathname === "/login" || url.pathname === "/register")) {
    return redirect("/"); // Or any other authenticated page
  }

  return next();
});
