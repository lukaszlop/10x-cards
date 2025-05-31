import { defineMiddleware, MiddlewareContext, MiddlewareNext } from "astro:middleware";

import { supabaseClient } from "../db/supabase.client";

export const onRequest = defineMiddleware((context: MiddlewareContext, next: MiddlewareNext) => {
  context.locals.supabase = supabaseClient;
  return next();
});
