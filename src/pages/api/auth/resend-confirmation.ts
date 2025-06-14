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

  const { error } = await supabase.auth.resend({
    type: "signup",
    email: email,
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ message: "Link potwierdzający został wysłany ponownie." }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
