import type { SupabaseClient } from "../db/supabase.client";

declare module "astro" {
  interface Locals {
    supabase: SupabaseClient;
    user: {
      id: string;
      email: string;
    } | null;
  }
}
