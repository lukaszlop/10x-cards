/// <reference types="astro/client" />

import type { Session, SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "./db/database.types";

interface User {
  id: string;
  email?: string;
}

declare namespace App {
  interface Locals {
    supabase: SupabaseClient<Database>;
    session: Session | null;
    user: User | null;
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
