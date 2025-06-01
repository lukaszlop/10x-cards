-- Migration: Add development user
-- Description: Adds a default development user to auth.users table
-- Note: This should only be used in development

-- Insert development user into auth.users
insert into auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role
) values (
    '931c3075-6c7d-4824-bb8e-a301dd050ddf'::uuid, -- DEFAULT_USER_ID
    'dev@10x.cards',
    '$2a$10$default_password_hash', -- This is just a placeholder, not a real password since we won't use it
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Development User"}',
    false,
    'authenticated'
) on conflict (id) do nothing;