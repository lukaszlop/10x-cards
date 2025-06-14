import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const { oldPassword, newPassword } = await request.json();

  if (!oldPassword || !newPassword) {
    return new Response(JSON.stringify({ error: "Stare i nowe hasło są wymagane" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = locals.supabase;

  // First, reauthenticate the user with their old password
  const { error: reauthError } = await supabase.auth.signInWithPassword({
    email: locals.user?.email || "",
    password: oldPassword,
  });

  if (reauthError) {
    return new Response(JSON.stringify({ error: "Nieprawidłowe stare hasło" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // If reauthentication is successful, update the password
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    return new Response(JSON.stringify({ error: updateError.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ message: "Hasło zostało pomyślnie zmienione" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
