-- Run this in Supabase Dashboard -> SQL Editor
-- This sets up the public schema for MakanBijak user data.

-- 0. Drop all existing RLS policies on the target tables so this script is safe to re-run

do $$
declare
  pol record;
begin
  for pol in select policyname from pg_policies where schemaname = 'public' and tablename = 'profiles' loop
    execute format('drop policy if exists %I on public.profiles', pol.policyname);
  end loop;

  for pol in select policyname from pg_policies where schemaname = 'public' and tablename = 'health_profiles' loop
    execute format('drop policy if exists %I on public.health_profiles', pol.policyname);
  end loop;

  for pol in select policyname from pg_policies where schemaname = 'public' and tablename = 'scan_history' loop
    execute format('drop policy if exists %I on public.scan_history', pol.policyname);
  end loop;
end $$;

-- 1. Profiles table (auto-created from auth trigger)

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique not null,
  full_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Health profiles table

create table if not exists public.health_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  data jsonb not null default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id)
);

-- 3. Scan history table

create table if not exists public.scan_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  food jsonb not null,
  food_items jsonb default '[]',
  advice jsonb default '{}',
  source text,
  created_at timestamptz default now()
);

-- 4. Enable RLS on all tables

alter table if exists public.profiles enable row level security;
alter table if exists public.health_profiles enable row level security;
alter table if exists public.scan_history enable row level security;

-- 5. RLS policies for profiles

create policy "Users can read own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 6. RLS policies for health_profiles

create policy "Users can read own health profile"
  on public.health_profiles for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own health profile"
  on public.health_profiles for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own health profile"
  on public.health_profiles for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 7. RLS policies for scan_history

create policy "Users can read own scan history"
  on public.scan_history for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own scan history"
  on public.scan_history for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can delete own scan history"
  on public.scan_history for delete
  to authenticated
  using (auth.uid() = user_id);

-- 8. Trigger: create a profile row automatically on auth sign-up

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name)
  values (
    new.id,
    new.raw_user_meta_data ->> 'username',
    new.raw_user_meta_data ->> 'full_name'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
