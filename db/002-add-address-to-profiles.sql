-- Add address and full_name fields to profiles table
alter table public.profiles
  add column if not exists full_name text;

alter table public.profiles
  add column if not exists address text;

alter table public.profiles
  add column if not exists phone text;

alter table public.profiles
  add column if not exists updated_at timestamptz default now();

-- Update the updated_at timestamp on profile updates
create or replace function update_profiles_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_profiles_timestamp on public.profiles;
create trigger update_profiles_timestamp
before update on public.profiles
for each row
execute function update_profiles_updated_at();

-- Remove all existing policies to avoid recursion
alter table public.profiles disable row level security;
alter table public.profiles enable row level security;

-- Drop all policies
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Public can read profiles" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;

-- Create clean policies
create policy "users_insert_own" on public.profiles for insert
  to authenticated with check (auth.uid() = id);

create policy "users_update_own" on public.profiles for update
  to authenticated using (auth.uid() = id);

create policy "users_select" on public.profiles for select
  to authenticated using (true);

create policy "public_read" on public.profiles for select
  to public using (true);



