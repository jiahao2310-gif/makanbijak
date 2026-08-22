-- Run this in Supabase Dashboard -> SQL Editor
-- This sets up the public.profiles table and a trigger that auto-creates
-- a profile row whenever a user signs up via Supabase Auth.

-- 1. Profiles table

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique not null,
  full_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Enable Row Level Security

alter table public.profiles enable row level security;

-- 3. RLS policies

create policy "Users can read own profile"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 4. Trigger: create a profile row automatically on auth sign-up

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name)
  values (
    new.id,
    new.raw_user_meta_data ->> 'username',
    new.raw_user_meta_data ->> 'full_name'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
