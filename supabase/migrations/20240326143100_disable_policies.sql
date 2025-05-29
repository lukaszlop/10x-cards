-- Migration: Disable all RLS policies
-- Description: Drops all previously defined RLS policies from flashcards, generations and generation_error_logs tables
-- Note: Tables will still have RLS enabled, just no policies defined

-- Drop flashcards policies
drop policy if exists "Users can view their own flashcards" on flashcards;
drop policy if exists "Users can insert their own flashcards" on flashcards;
drop policy if exists "Users can update their own flashcards" on flashcards;
drop policy if exists "Users can delete their own flashcards" on flashcards;

-- Drop generations policies
drop policy if exists "Users can view their own generations" on generations;
drop policy if exists "Users can insert their own generations" on generations;
drop policy if exists "Users can update their own generations" on generations;

-- Drop generation_error_logs policies
drop policy if exists "Users can view their own error logs" on generation_error_logs;
drop policy if exists "Users can insert their own error logs" on generation_error_logs;