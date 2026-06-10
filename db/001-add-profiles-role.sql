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

-- Enable RLS
alter table public.profiles enable row level security;

-- Policy: Users can insert and update their own profile
create policy "Users can insert their own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- Policy: Allow public read access (optional, remove if you want to restrict visibility)
create policy "Public can read profiles"
on public.profiles
for select
to public
using (true);
