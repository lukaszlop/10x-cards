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
};
