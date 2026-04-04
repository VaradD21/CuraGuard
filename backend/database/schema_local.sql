-- Project Guardian — Local PostgreSQL Schema V3
-- Privacy-first: no raw text or images stored, only encrypted AI verdicts.
-- Run in pgAdmin or psql: \i schema_local.sql

create extension if not exists "pgcrypto";

-- Parents (account holders)
create table if not exists public.parents (
  id           uuid primary key default gen_random_uuid(),
  email        text unique not null,
  password_hash text not null,
  created_at   timestamptz default now()
);

-- Children
create table if not exists public.children (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.parents (id) on delete cascade,
  name text not null,
  age integer,
  email text,
  mobile_number text,
  student_id text,
  grade text,
  access_code text unique not null,
  is_activated boolean default false,
  activated_at timestamptz,
  created_at timestamptz default now()
);

-- Events (one row per screen capture analysed)
create table if not exists public.events (
  id                 uuid primary key default gen_random_uuid(),
  parent_id          uuid not null references public.parents(id) on delete cascade,
  device_id          text not null,
  captured_at        timestamptz not null,
  window_title       text,
  process_name       text,
  -- Privacy: NEVER raw text. SHA-256 hash only for deduplication.
  text_hash          text,
  sentiment_score    double precision,
  sentiment_label    text,
  relationship_score double precision,
  risk_score         double precision,
  risk_label         text,
  alert              boolean default false,
  text_snippet       text,
  -- Non-sensitive summary visible without decryption
  threat_category    text,
  detected_phase     text,
  action_recommended text,
  behavioral_flags   text,   -- JSON array as text
  -- AES-256 Fernet encrypted full verdict (decrypt via /decrypt endpoint)
  verdict_enc        text,
  created_at         timestamptz default now()
);

create index if not exists idx_events_parent_device
  on public.events (parent_id, device_id, captured_at desc);

create index if not exists idx_events_alert
  on public.events (parent_id, alert, captured_at desc)
  where alert = true;

-- Alerts (one row per triggered threat)
create table if not exists public.alerts (
  id         uuid primary key default gen_random_uuid(),
  parent_id  uuid not null references public.parents(id) on delete cascade,
  event_id   uuid references public.events(id) on delete cascade,
  reason     text,
  created_at timestamptz default now()
);

create index if not exists idx_alerts_parent
  on public.alerts (parent_id, created_at desc);

-- Devices (registered child devices with per-device child_age)
create table if not exists public.devices (
  id          uuid primary key default gen_random_uuid(),
  parent_id   uuid not null references public.parents(id) on delete cascade,
  device_id   text not null,
  device_name text,
  child_age   integer default 12,
  last_seen   timestamptz,
  created_at  timestamptz default now(),
  unique (parent_id, device_id)
);
