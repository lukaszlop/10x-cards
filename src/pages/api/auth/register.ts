import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const { email, password } = await request.json();

  if (!email || !password) {
    return new Response(JSON.stringify({ error: "Email i hasło są wymagane" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const redirectUrl = `${new URL(request.url).origin}/auth/confirm-email`;

  const { data, error } = await locals.supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectUrl,
    },
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (data.user && !data.user.email_confirmed_at) {
    return new Response(
      JSON.stringify({
        message: "Rejestracja przebiegła pomyślnie. Sprawdź swoją skrzynkę email i kliknij w link aktywacyjny.",
        requiresConfirmation: true,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  return new Response(JSON.stringify({ message: "Zarejestrowano pomyślnie" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
