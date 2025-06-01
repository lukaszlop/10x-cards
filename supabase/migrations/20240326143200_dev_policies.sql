-- Migration: Add development policies
-- Description: Adds policies to allow DEFAULT_USER_ID to perform operations without authentication
-- Note: This should only be used in development

-- Development policies for generations
create policy "Dev user can perform all operations on generations"
    on generations
    for all
    using (user_id = '931c3075-6c7d-4824-bb8e-a301dd050ddf'::uuid)
    with check (user_id = '931c3075-6c7d-4824-bb8e-a301dd050ddf'::uuid);

-- Development policies for generation_error_logs
create policy "Dev user can perform all operations on error logs"
    on generation_error_logs
    for all
    using (user_id = '931c3075-6c7d-4824-bb8e-a301dd050ddf'::uuid)
    with check (user_id = '931c3075-6c7d-4824-bb8e-a301dd050ddf'::uuid);

-- Development policies for flashcards
create policy "Dev user can perform all operations on flashcards"
    on flashcards
    for all
    using (user_id = '931c3075-6c7d-4824-bb8e-a301dd050ddf'::uuid)
    with check (user_id = '931c3075-6c7d-4824-bb8e-a301dd050ddf'::uuid);