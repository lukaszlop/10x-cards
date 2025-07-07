import { isFeatureEnabled } from "@/features";
import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  if (!isFeatureEnabled("auth")) {
    return new Response(JSON.stringify({ error: "Authentication not available" }), { status: 404 });
  }

  const { email, password } = await request.json();

  if (!email || !password) {
    return new Response(JSON.stringify({ error: "Email i hasło są wymagane" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // In test environment, return mock response
  if (import.meta.env.NODE_ENV === "test" || import.meta.env.CI) {
    console.log(`[TEST MODE] Registration attempt: ${email}`);
    return new Response(JSON.stringify({ message: "Zarejestrowano pomyślnie" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Production/development mode - use real Supabase
  try {
    const { error } = await locals.supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ message: "Zarejestrowano pomyślnie" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return new Response(JSON.stringify({ error: "Błąd podczas rejestracji" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
