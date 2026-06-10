-- Add or ensure the user role field exists on the profiles table.
-- Run this in your Supabase SQL editor or Postgres console for the project.

create table if not exists public.profiles (
  id uuid primary key,
  email text,
  role text not null default 'resident',
  created_at timestamptz default now()
);

alter table public.profiles
  add column if not exists role text not null default 'resident';

create index if not exists profiles_role_idx on public.profiles (role);
