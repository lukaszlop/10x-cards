import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const { email } = await request.json();

  if (!email) {
    return new Response(JSON.stringify({ error: "Email jest wymagany" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = locals.supabase;

  const redirectUrl = `${new URL(request.url).origin}/auth/password-recovery`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl,
  });

  if (error) {
    console.error("Reset password error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  return new Response(JSON.stringify({ message: "Email z linkiem do resetowania hasła został wysłany" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
