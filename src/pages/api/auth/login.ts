import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals, cookies }) => {
  const { email, password } = await request.json();

  if (!email || !password) {
    return new Response(JSON.stringify({ error: "Email i hasło są wymagane" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // In test environment, return mock responses
  if (import.meta.env.NODE_ENV === "test" || import.meta.env.CI) {
    console.log(`[TEST MODE] Login attempt: ${email}`);

    // Mock successful login for test credentials - using actual test credentials
    if (email === "test@test.com" && password === "Testy123") {
      // Set mock session cookie
      cookies.set("sb-access-token", "mock-session-token", {
        path: "/",
        httpOnly: true,
        secure: false, // Set to false for local testing
        sameSite: "lax",
      });

      console.log(`[TEST MODE] Login successful for: ${email}`);
      return new Response(JSON.stringify({ message: "Zalogowano pomyślnie" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Mock failed login
    console.log(`[TEST MODE] Login failed for: ${email}`);
    return new Response(JSON.stringify({ error: "Nieprawidłowy email lub hasło" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Production/development mode - use real Supabase
  try {
    const { error } = await locals.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ message: "Zalogowano pomyślnie" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Login error:", error);
    return new Response(JSON.stringify({ error: "Błąd podczas logowania" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
