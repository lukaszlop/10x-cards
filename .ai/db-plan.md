/\* PostgreSQL Database Schema Plan for 10x-cards

1. Tables Definition

---

**Table: users**

This table is managed by Supabase Auth.

- id: UUID PRIMARY KEY
- email: VARCHAR NOT NULL UNIQUE
- encrypted_password: VARCHAR NOT NULL
- created_at: TIMESTAMPTZ NOT NULL DEFAULT now()
- confirmed_at: TIMESTAMPTZ

---

**Table: flashcards**

- id: BIGSERIAL PRIMARY KEY
- front: VARCHAR(200) NOT NULL
- back: VARCHAR(500) NOT NULL
- source: VARCHAR NOT NULL CHECK (source IN ('ai-full', 'ai-edited', 'manual'))
- created_at: TIMESTAMPTZ NOT NULL DEFAULT now()
- updated_at: TIMESTAMPTZ NOT NULL DEFAULT now()
- generation_id: BIGINT REFERENCES generations(id) ON DELETE SET NULL
- user_id: UUID NOT NULL REFERENCES users(id)

_Trigger: Automatically update the `updated_at` column on record updates._

---

**Table: generations**

- id: BIGSERIAL PRIMARY KEY
- user_id: UUID NOT NULL REFERENCES users(id)
- model: VARCHAR NOT NULL
- generated_count: INTEGER NOT NULL
- accepted_unedited_count: INTEGER NULLABLE
- accepted_edited_count: INTEGER NULLABLE
- source_text_hash: VARCHAR NOT NULL
- source_text_length: INTEGER NOT NULL CHECK (source_text_length BETWEEN 1000 AND 10000)
- generation_duration: INTEGER NOT NULL
- confidence_score: DECIMAL(3,2) NOT NULL CHECK (confidence_score BETWEEN 0 AND 1)
- created_at: TIMESTAMPTZ NOT NULL DEFAULT now()
- updated_at: TIMESTAMPTZ NOT NULL DEFAULT now()

_Note: The confidence_score is a value between 0 and 1 returned by the LLM API indicating how confident the model is about its generated flashcards. Higher values indicate greater confidence._

---

**Table: generation_error_logs**

- id: BIGSERIAL PRIMARY KEY
- user_id: UUID NOT NULL REFERENCES users(id)
- model: VARCHAR NOT NULL
- source_text_hash: VARCHAR NOT NULL
- source_text_length: INTEGER NOT NULL CHECK (source_text_length BETWEEN 1000 AND 10000)
- error_code: VARCHAR NOT NULL
- error_message: TEXT NOT NULL
- created_at: TIMESTAMPTZ NOT NULL DEFAULT now()

2. Relationships

- One user (users) has many flashcards.
- One user (users) has many records in generations table.
- One user (users) has many records in generation_error_logs table.
- Each flashcard (flashcards) can optionally be linked to one generation (generations) via flashcards.generation_id.

3. Indexes

- INDEX on flashcards.user_id
- INDEX on flashcards.generation_id
- INDEX on generations.user_id
- INDEX on generation_error_logs.user_id
- INDEX on generations.confidence_score

4. Triggers

- A trigger on the flashcards table to automatically update the updated_at column on every update.

5. PostgreSQL Row-Level Security (RLS)

- In flashards, generations and generation_error_logs tables implement RLS policies that allow a user to only access records where `user_id` matches a Supabase Auth user ID (e.g. auth.uid() = user_id)
  \*/
