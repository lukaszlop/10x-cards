import type { User } from "@supabase/supabase-js";
import { atom } from "nanostores";

export const $user = atom<User | null>(null);

export const setUser = (user: User | null) => {
  console.log("[AUTH STORE] Setting user:", user?.email || "null");
  $user.set(user);
};
