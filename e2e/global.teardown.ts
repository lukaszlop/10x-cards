import { test as teardown } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/db/database.types";

teardown("cleanup database", async () => {
  console.log("🧹 Starting database cleanup...");

  // Create Supabase client using environment variables
  const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.PUBLIC_SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing Supabase environment variables");
    throw new Error("PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_KEY must be set");
  }

  const supabase = createClient<Database>(supabaseUrl, supabaseKey);

  try {
    // Get test credentials from environment variables
    const testEmail = process.env.E2E_USERNAME;
    const testPassword = process.env.E2E_PASSWORD;

    if (!testEmail || !testPassword) {
      console.error("❌ E2E_USERNAME and E2E_PASSWORD environment variables must be set");
      throw new Error("E2E_USERNAME and E2E_PASSWORD must be set for database cleanup");
    }

    console.log(`🔐 Signing in as test user: ${testEmail}`);

    // Sign in to Supabase to respect RLS policies
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    if (signInError) {
      console.error("❌ Error signing in:", signInError.message);
      throw signInError;
    }

    if (!authData.user) {
      console.error("❌ No user data returned after successful sign in");
      throw new Error("Failed to get user data after sign in");
    }

    const testUserId = authData.user.id;
    console.log(`🔍 Successfully signed in as: ${testEmail} (ID: ${testUserId})`);

    // Delete flashcards for the test user
    const { error: deleteError, count } = await supabase.from("flashcards").delete().eq("user_id", testUserId);

    if (deleteError) {
      console.error("❌ Error deleting flashcards:", deleteError.message);
      throw deleteError;
    }

    console.log(`✅ Successfully deleted ${count || 0} flashcards for test user`);

    // Optional: Also clean up generations table if needed
    const { error: generationsError, count: generationsCount } = await supabase
      .from("generations")
      .delete()
      .eq("user_id", testUserId);

    if (generationsError) {
      console.error("❌ Error deleting generations:", generationsError.message);
      throw generationsError;
    }

    console.log(`✅ Successfully deleted ${generationsCount || 0} generations for test user`);

    // Optional: Clean up generation error logs
    const { error: errorLogsError, count: errorLogsCount } = await supabase
      .from("generation_error_logs")
      .delete()
      .eq("user_id", testUserId);

    if (errorLogsError) {
      console.error("❌ Error deleting generation error logs:", errorLogsError.message);
      throw errorLogsError;
    }

    console.log(`✅ Successfully deleted ${errorLogsCount || 0} generation error logs for test user`);

    // Sign out to clean up the session
    await supabase.auth.signOut();
    console.log("🔓 Signed out from test user session");

    console.log("🎉 Database cleanup completed successfully!");
  } catch (error) {
    console.error("❌ Failed to cleanup database:", error);
    // Try to sign out even if cleanup failed
    try {
      await supabase.auth.signOut();
      console.log("🔓 Signed out from test user session (after error)");
    } catch (signOutError) {
      console.error("❌ Also failed to sign out:", signOutError);
    }
    throw error;
  }
});
