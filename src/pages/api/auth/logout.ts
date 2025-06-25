import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ locals, cookies }) => {
  // In test environment, handle mock logout
  if (import.meta.env.NODE_ENV === "test" || import.meta.env.CI) {
    // Remove mock session cookie
    cookies.delete("sb-access-token", {
      path: "/",
    });

    return new Response(JSON.stringify({ message: "Wylogowano pomyślnie" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Production/development mode - use real Supabase
  try {
    const { error } = await locals.supabase.auth.signOut();

    if (error) {
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
