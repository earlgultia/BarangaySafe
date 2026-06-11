-- Create incident_reports and enforce row level security.
-- Run this in your Supabase SQL editor or Postgres console for the project.

create table if not exists public.incident_reports (
  id bigserial primary key,
  user_id uuid references public.profiles(id),
  description text,
  image_url text,
  latitude numeric,
  longitude numeric,
  address text,
  status incident_status default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz
);

alter table if exists public.incident_reports add column if not exists user_id uuid references public.profiles(id);
alter table if exists public.incident_reports add column if not exists description text;
alter table if exists public.incident_reports add column if not exists image_url text;
alter table if exists public.incident_reports add column if not exists latitude numeric;
alter table if exists public.incident_reports add column if not exists longitude numeric;
alter table if exists public.incident_reports add column if not exists address text;
alter table if exists public.incident_reports add column if not exists status incident_status default 'pending';
alter table if exists public.incident_reports add column if not exists created_at timestamptz default now();
alter table if exists public.incident_reports add column if not exists updated_at timestamptz;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'incident_reports'
      and column_name = 'status'
      and data_type in ('text', 'character varying')
  ) then
    alter table public.incident_reports
      alter column status type incident_status using status::incident_status;
  end if;
end $$;

alter table public.incident_reports enable row level security;

do $$
declare
  r record;
begin
  for r in (
    select policyname from pg_policies
    where schemaname = 'public'
      and tablename = 'incident_reports'
  ) loop
    execute format('drop policy if exists %I on public.incident_reports', r.policyname);
  end loop;
end $$;

-- Allow authenticated users to insert reports only for themselves.
create policy "Users can insert their own incident report"
on public.incident_reports
for insert
to authenticated
with check (
  auth.uid() = user_id
  and status = 'pending'
);

-- Allow authenticated users to select their own reports.
create policy "Users can select their own incident reports"
on public.incident_reports
for select
to authenticated
using (auth.uid() = user_id);

-- Allow staff and admins to select all incident reports.
create policy "Staff and admins can select incident reports"
on public.incident_reports
for select
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('staff', 'admin')
  )
);

-- Allow report owners to update their own report details if needed.
create policy "Users can update their own incident report"
on public.incident_reports
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Allow staff and admins to update incident status.
create policy "Staff and admins can update incident status"
on public.incident_reports
for update
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('staff', 'admin')
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('staff', 'admin')
  )
);
