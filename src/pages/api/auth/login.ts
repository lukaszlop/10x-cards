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
    console.log(`[TEST MODE] NODE_ENV: ${import.meta.env.NODE_ENV}`);
    console.log(`[TEST MODE] CI: ${import.meta.env.CI}`);

    // Get test credentials from environment variables
    const testEmail = import.meta.env.E2E_USERNAME;
    const testPassword = import.meta.env.E2E_PASSWORD;

    console.log(`[TEST MODE] Expected email: ${testEmail}`);
    console.log(`[TEST MODE] Expected password: ${testPassword ? "[SET]" : "[NOT SET]"}`);
    console.log(`[TEST MODE] Received email: ${email}`);
    console.log(`[TEST MODE] Received password: ${password ? "[SET]" : "[NOT SET]"}`);
    console.log(`[TEST MODE] Email match: ${email === testEmail}`);
    console.log(`[TEST MODE] Password match: ${password === testPassword}`);

    // Mock successful login for test credentials
    if (email === testEmail && password === testPassword) {
      // Set mock session cookie
      cookies.set("sb-access-token", "mock-session-token", {
        path: "/",
        httpOnly: false, // Set to false for easier debugging in tests
        secure: false, // Set to false for local testing
        sameSite: "lax",
        maxAge: 3600, // 1 hour
      });

      console.log(`[TEST MODE] Login successful for: ${email}, cookie set`);
      return new Response(JSON.stringify({ message: "Zalogowano pomyślnie" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Mock failed login
    console.log(`[TEST MODE] Login failed for: ${email} (expected: ${testEmail})`);
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
