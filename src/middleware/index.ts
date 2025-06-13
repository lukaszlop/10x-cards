import { createServerClient } from "@supabase/ssr";
import { defineMiddleware } from "astro:middleware";
import type { Database } from "../db/database.types";

export const onRequest = defineMiddleware(async ({ cookies, locals }, next) => {
  const supabase = createServerClient<Database>(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_KEY,
    {
      cookies: {
        get(key) {
          const cookie = cookies.get(key);
          return cookie?.value;
        },
        set(key, value, options) {
          const { name: _, ...rest } = options ?? {};
          cookies.set(key, value, {
            path: "/",
            ...rest,
            secure: import.meta.env.PROD,
            httpOnly: true,
            sameSite: "lax",
          });
        },
        remove(key, options) {
          const { name: _, ...rest } = options ?? {};
          cookies.delete(key, {
            path: "/",
            ...rest,
            secure: import.meta.env.PROD,
            httpOnly: true,
            sameSite: "lax",
          });
        },
      },
    }
  );

  // Get user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Add supabase client and user to locals
  locals.supabase = supabase;
  locals.user = user;

  const response = await next();

  // Sprawdzamy czy odpowiedź nie jest przekierowaniem
  if (response.status === 302) {
    // Dajemy czas na zapisanie cookies
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return response;
});
