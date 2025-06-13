import type { User } from "@supabase/supabase-js";
import { atom } from "nanostores";

export const userStore = atom<User | null>(null);

// Initialize user state from Supabase
export const initializeUserStore = async (user: User | null) => {
  userStore.set(user);
};
