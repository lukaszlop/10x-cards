/// <reference types="astro/client" />

import type { Session, SupabaseClient, User as SupabaseUser } from "@supabase/supabase-js";
import type { Database } from "./db/database.types";

interface AppUser {
  id: string;
  email?: string;
}

declare namespace App {
  interface Locals {
    supabase: SupabaseClient<Database> | null;
    session: Session | null;
    user: SupabaseUser | null;
  }
}

interface ImportMetaEnv {
  readonly PUBLIC_SUPABASE_URL: string;
  readonly PUBLIC_SUPABASE_KEY: string;
  readonly PUBLIC_SITE_URL: string;
  readonly OPENROUTER_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
