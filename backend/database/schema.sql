-- CuraGuard V 2.0 — Production-Grade Supabase Schema
-- Run this in the Supabase SQL Editor to reset and configure your database.

-- 1. Initialize Extensions
create extension if not exists "pgcrypto";

-- 2. Parents Table
create table if not exists public.parents (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  full_name text,
  phone_number text,
  created_at timestamptz default now()
);

-- 3. Children Table
create table if not exists public.children (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.parents (id) on delete cascade,
  name text not null,
  access_code text unique not null,
  is_activated boolean default false,
  activated_at timestamptz,
  created_at timestamptz default now()
);

-- 4. Devices Table (Linking many devices to a single parent/child environment)
create table if not exists public.devices (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.parents (id) on delete cascade,
  device_id text unique not null,
  device_name text,
  child_age integer default 14,
  created_at timestamptz default now()
);

-- 5. Events Table (Heart of the Analytics)
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.parents (id) on delete cascade,
  child_id uuid references public.children (id) on delete cascade,
  device_id text not null,
  captured_at timestamptz not null,
  window_title text,
  process_name text,
  text_hash text, -- Privacy: only store hash of raw text
  sentiment_score double precision,
  sentiment_label text,
  relationship_score double precision,
  risk_score double precision,
  risk_label text,
  alert boolean default false,
  
  -- V 2.0 Extended Attributes
  threat_category text,
  detected_phase text,
  action_recommended text,
  behavioral_flags jsonb default '[]',
  verdict_enc text, -- AES-256 encrypted full AI judgment
  duration_seconds bigint default 0, -- [NEW] Actual time spent in this app window
  
  created_at timestamptz default now()
);

-- 6. Alerts Table (Explicit interventions)
create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.parents (id) on delete cascade,
  child_id uuid references public.children (id) on delete cascade,
  event_id uuid references public.events (id) on delete cascade,
  reason text,
  created_at timestamptz default now()
);

-- 7. High-Performance Indexes
create index if not exists idx_events_parent_captured on public.events (parent_id, captured_at desc);
create index if not exists idx_events_child_captured on public.events (child_id, captured_at desc);
create index if not exists idx_events_device_id on public.events (device_id);
create index if not exists idx_children_parent on public.children (parent_id);

-- 8. Enable Row Level Security (RLS)
alter table public.parents enable row level security;
alter table public.children enable row level security;
alter table public.devices enable row level security;
alter table public.events enable row level security;
alter table public.alerts enable row level security;
