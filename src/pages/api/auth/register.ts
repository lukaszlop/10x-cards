import { createSupabaseServerInstance } from "@/db/supabase.client";
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request, cookies }) => {
  const { email, password } = await request.json();

  const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
    });
  }

  return new Response(JSON.stringify({ user: data.user }), {
    status: 200,
  });
};
