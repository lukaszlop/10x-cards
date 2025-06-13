import { createSupabaseServerInstance } from "@/db/supabase.client";
import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ cookies, request }) => {
  const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });

  const { error } = await supabase.auth.signOut();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
    });
  }

  // Redirect to login page after logout
  return new Response(null, {
    status: 302,
    headers: {
      Location: "/login",
    },
  });
};
