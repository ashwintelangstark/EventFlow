-- ========================================================
-- EventFlow Database Schema for Supabase (PostgreSQL)
-- Hand this file to your teammate tomorrow to execute in Supabase SQL Editor!
-- ========================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE (Links with Supabase Auth auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null,
  role text default 'attendee' check (role in ('admin', 'staff', 'attendee')),
  category text default 'Student',
  organization text default 'Alliance University',
  phone text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS policies for profiles
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- 2. REGISTRATIONS TABLE (Event participants)
create table if not exists public.registrations (
  id text primary key,
  user_id uuid references public.profiles(id) on delete set null,
  name text not null,
  email text not null,
  phone text,
  category text not null,
  organization text not null,
  designation text,
  department text,
  dietary_preference text,
  areas_of_interest text[],
  notes text,
  status text default 'Registered' check (status in ('Registered', 'Checked In')),
  registered_at timestamp with time zone default timezone('utc'::text, now()) not null,
  checked_in_at timestamp with time zone
);

alter table public.registrations enable row level security;

create policy "Admins and Staff can view all registrations"
  on public.registrations for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role in ('admin', 'staff')
    )
    or auth.uid() = user_id
  );

create policy "Anyone authenticated can create a registration"
  on public.registrations for insert
  to authenticated
  with check (true);

create policy "Admins and Staff can update check-in status"
  on public.registrations for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role in ('admin', 'staff')
    )
  );

-- 3. ANNOUNCEMENTS TABLE
create table if not exists public.announcements (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  message text not null,
  type text default 'General' check (type in ('General', 'Logistics', 'Registration', 'Schedule', 'Guidelines', 'Activity', 'Opportunity')),
  status text default 'Published' check (status in ('Draft', 'Scheduled', 'Published')),
  scheduled_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.announcements enable row level security;

create policy "Published announcements are viewable by everyone"
  on public.announcements for select
  using (status = 'Published');

create policy "Admins can manage announcements"
  on public.announcements for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- 4. INITIAL SEED DATA (Optional)
insert into public.announcements (title, message, type, status) values
  ('Welcome to IDEA → AI → IMPACT', 'We are excited to have you all at AU-QUASAR! Get ready for a day of innovation and prototyping.', 'General', 'Published'),
  ('Event Venue Details', 'The event will be held at AU-QUASAR Innovation Center, Alliance University, Bengaluru.', 'Logistics', 'Published'),
  ('Registration Confirmation', 'Thank you for registering! Please carry a valid ID card to the event.', 'Registration', 'Published');
