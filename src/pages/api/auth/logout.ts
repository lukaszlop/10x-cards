import { isFeatureEnabled } from "@/features";
import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ locals, cookies }) => {
  if (!isFeatureEnabled("auth")) {
    return new Response(JSON.stringify({ error: "Authentication not available" }), { status: 404 });
  }

  // Clear auth cookies
  cookies.delete("sb-access-token", {
    path: "/",
  });

  cookies.delete("sb-refresh-token", {
    path: "/",
  });

  // In test environment, just return success
  if (import.meta.env.NODE_ENV === "test" || import.meta.env.CI) {
    console.log("[TEST MODE] Logout successful - cookies cleared");
    return new Response(JSON.stringify({ message: "Wylogowano pomyślnie" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Production/development mode - use real Supabase
  try {
    const { error } = await locals.supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ message: "Wylogowano pomyślnie" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Logout error:", error);
    return new Response(JSON.stringify({ error: "Błąd podczas wylogowywania" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
