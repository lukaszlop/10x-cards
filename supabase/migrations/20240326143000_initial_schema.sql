-- Migration: Initial Schema Setup
-- Description: Creates the initial database schema for the 10x-cards application
-- Tables: flashcards, generations, generation_error_logs
-- Note: The users table is managed by Supabase Auth

-- Step 1: Create base tables without foreign key constraints first
-- Create generations table (referenced by flashcards)
create table if not exists generations (
    id bigserial primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    model varchar not null,
    generated_count integer not null,
    accepted_unedited_count integer,
    accepted_edited_count integer,
    source_text_hash varchar not null,
    source_text_length integer not null check (source_text_length between 1000 and 10000),
    generation_duration integer not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Create generation_error_logs table
create table if not exists generation_error_logs (
    id bigserial primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    model varchar not null,
    source_text_hash varchar not null,
    source_text_length integer not null check (source_text_length between 1000 and 10000),
    error_code varchar not null,
    error_message text not null,
    created_at timestamptz not null default now()
);

-- Create flashcards table (depends on generations)
create table if not exists flashcards (
    id bigserial primary key,
    front varchar(200) not null,
    back varchar(500) not null,
    source varchar not null check (source in ('ai-full', 'ai-edited', 'manual')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    generation_id bigint,
    user_id uuid not null references auth.users(id) on delete cascade
);

-- Step 2: Add foreign key constraints
alter table flashcards
    add constraint flashcards_generation_id_fkey
    foreign key (generation_id)
    references generations(id)
    on delete set null;

-- Step 3: Create all indexes
create index if not exists generations_user_id_idx on generations(user_id);
create index if not exists generation_error_logs_user_id_idx on generation_error_logs(user_id);
create index if not exists flashcards_user_id_idx on flashcards(user_id);
create index if not exists flashcards_generation_id_idx on flashcards(generation_id);

-- Step 4: Create trigger functions
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Step 5: Create triggers
create trigger update_flashcards_updated_at
    before update on flashcards
    for each row
    execute function update_updated_at_column();

create trigger update_generations_updated_at
    before update on generations
    for each row
    execute function update_updated_at_column();

-- Step 6: Enable Row Level Security on all tables
alter table generations enable row level security;
alter table generation_error_logs enable row level security;
alter table flashcards enable row level security;

-- Step 7: Create RLS Policies

-- Policies for generations
create policy "Users can view their own generations"
    on generations
    for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Users can insert their own generations"
    on generations
    for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Users can update their own generations"
    on generations
    for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- Policies for generation_error_logs
create policy "Users can view their own error logs"
    on generation_error_logs
    for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Users can insert their own error logs"
    on generation_error_logs
    for insert
    to authenticated
    with check (auth.uid() = user_id);

-- Policies for flashcards
create policy "Users can view their own flashcards"
    on flashcards
    for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Users can insert their own flashcards"
    on flashcards
    for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Users can update their own flashcards"
    on flashcards
    for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can delete their own flashcards"
    on flashcards
    for delete
    to authenticated
    using (auth.uid() = user_id);