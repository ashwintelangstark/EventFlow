-- ========================================================
-- EventFlow Production Database Schema for Supabase (PostgreSQL)
-- Matches live Supabase deployment (https://hckxoiaoowzrvusxhzoc.supabase.co)
-- ========================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- Custom enum for user roles
do $$ begin
  create type public.user_role as enum ('admin', 'staff');
exception
  when duplicate_object then null;
end $$;

-- 1. PROFILES TABLE (Linked to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default 'Attendee',
  role public.user_role not null default 'staff',
  category text,
  organization text,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- 2. REGISTRATIONS TABLE (Event participants & check-in status)
create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  full_name text not null,
  email text not null,
  phone text,
  category text default 'Student',
  organization text default 'Alliance University',
  designation text default 'Participant',
  department text,
  dietary_preference text,
  areas_of_interest text[],
  additional_info text,
  status text not null default 'Registered' check (status in ('Registered', 'Checked In')),
  checked_in_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.registrations enable row level security;

create policy "Authenticated users can view registrations"
  on public.registrations for select
  to authenticated
  using (true);

create policy "Authenticated users can insert registrations"
  on public.registrations for insert
  to authenticated
  with check (true);

create policy "Admins and Staff can update check-in status"
  on public.registrations for update
  to authenticated
  using (true);

-- 3. ANNOUNCEMENTS TABLE (Broadcast notices & updates)
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  type text not null default 'General',
  status text not null default 'Draft' check (status in ('Draft', 'Scheduled', 'Published')),
  scheduled_at timestamp with time zone,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.announcements enable row level security;

create policy "Announcements are viewable by authenticated users"
  on public.announcements for select
  to authenticated
  using (true);

create policy "Admins can manage announcements"
  on public.announcements for all
  to authenticated
  using (true);

-- 4. EVENT_SESSIONS TABLE (Agenda sequence & stages)
create table if not exists public.event_sessions (
  id serial primary key,
  sequence_number integer not null,
  title text not null,
  start_time text not null,
  end_time text not null,
  description text not null default '',
  key_activities text[] default array[]::text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.event_sessions enable row level security;

create policy "Event sessions viewable by authenticated users"
  on public.event_sessions for select
  to authenticated
  using (true);

create policy "Admins can manage event sessions"
  on public.event_sessions for all
  to authenticated
  using (true);
