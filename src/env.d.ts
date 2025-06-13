/// <reference types="astro/client" />

import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "./db/database.types";

declare namespace App {
  interface Locals {
    supabase: SupabaseClient<Database>;
    user: User | null;
  }
}

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_KEY: string;
  readonly PUBLIC_SUPABASE_URL: string;
  readonly PUBLIC_SUPABASE_KEY: string;
  readonly OPENROUTER_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface User {
  id: string;
  email?: string;
}

declare namespace App {
  interface Locals {
    supabase: import("@supabase/supabase-js").SupabaseClient;
    user?: User;
  }
}
