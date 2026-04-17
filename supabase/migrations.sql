-- ============================================================
-- Music Hub West – Supabase schema
-- Run this in Supabase → SQL Editor → New query
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── PROFILES ────────────────────────────────────────────────
create table if not exists profiles (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete cascade,
  name        text,
  email       text,
  role        text not null default 'user', -- 'user' | 'admin'
  avatar_url  text,
  company     text,
  qr_token    uuid unique default uuid_generate_v4(),
  created_at  timestamptz default now()
);

-- ─── EVENTS ──────────────────────────────────────────────────
create table if not exists events (
  id          uuid primary key default uuid_generate_v4(),
  slug        text unique,
  title       text not null,
  date        date,
  location    text,
  description text,
  cover_url   text,
  status      text default 'published', -- 'draft' | 'published' | 'live' | 'past'
  created_at  timestamptz default now()
);

-- ─── SPEAKERS ────────────────────────────────────────────────
create table if not exists speakers (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  bio         text,
  photo_url   text,
  company     text,
  title       text,
  linkedin    text,
  instagram   text,
  website     text,
  created_at  timestamptz default now()
);

-- ─── AGENDA SESSIONS ─────────────────────────────────────────
create table if not exists agenda_sessions (
  id          uuid primary key default uuid_generate_v4(),
  event_id    uuid references events(id) on delete cascade,
  speaker_id  uuid references speakers(id) on delete set null,
  title       text not null,
  description text,
  start_time  time,
  end_time    time,
  room        text,
  type        text default 'talk', -- 'talk' | 'workshop' | 'break' | 'panel'
  sort_order  int default 0,
  created_at  timestamptz default now()
);

-- ─── Q&A QUESTIONS ───────────────────────────────────────────
create table if not exists questions (
  id          uuid primary key default uuid_generate_v4(),
  session_id  uuid references agenda_sessions(id) on delete cascade,
  user_id     uuid references profiles(id) on delete set null,
  text        text not null,
  likes       int default 0,
  is_answered boolean default false,
  created_at  timestamptz default now()
);

create table if not exists question_likes (
  question_id uuid references questions(id) on delete cascade,
  user_id     uuid references profiles(id) on delete cascade,
  primary key (question_id, user_id)
);

-- ─── ATTENDANCES ─────────────────────────────────────────────
create table if not exists attendances (
  id            uuid primary key default uuid_generate_v4(),
  event_id      uuid references events(id) on delete cascade,
  user_id       uuid references profiles(id) on delete cascade,
  verified_at   timestamptz,
  verified_by   uuid references profiles(id) on delete set null,
  unique(event_id, user_id)
);

-- ─── ACHIEVEMENTS ────────────────────────────────────────────
create table if not exists achievements (
  id            uuid primary key default uuid_generate_v4(),
  slug          text unique not null,
  title_sv      text not null,
  title_en      text,
  description_sv text,
  description_en text,
  icon          text,      -- emoji or icon name
  threshold     int not null default 1  -- number of events to earn this
);

create table if not exists user_achievements (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid references profiles(id) on delete cascade,
  achievement_id  uuid references achievements(id) on delete cascade,
  earned_at       timestamptz default now(),
  unique(user_id, achievement_id)
);

-- ─── PUSH NOTIFICATIONS ──────────────────────────────────────
create table if not exists push_subscriptions (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid references profiles(id) on delete set null,
  subscription  jsonb not null,
  created_at    timestamptz default now()
);

create table if not exists notifications (
  id        uuid primary key default uuid_generate_v4(),
  title     text not null,
  body      text,
  url       text default '/app',
  sent_at   timestamptz default now(),
  sent_by   uuid references profiles(id) on delete set null
);

-- ─── ANNOUNCEMENTS ───────────────────────────────────────────
create table if not exists announcements (
  id          uuid primary key default uuid_generate_v4(),
  title       text not null,
  body        text,
  category    text default 'info', -- 'info' | 'warning' | 'event'
  pinned      boolean default false,
  event_id    uuid references events(id) on delete set null,
  created_at  timestamptz default now()
);

-- ─── SEED ACHIEVEMENTS ───────────────────────────────────────
insert into achievements (slug, title_sv, title_en, description_sv, description_en, icon, threshold) values
  ('first_event',  'Deltagare',   'Participant',   'Deltog i ditt första evenemang',   'Attended your first event',    '🥉', 1),
  ('entusiast',    'Entusiast',   'Enthusiast',    'Deltog i 3 evenemang',              'Attended 3 events',            '🥈', 3),
  ('ambassador',   'Ambassador',  'Ambassador',    'Deltog i 5 evenemang',              'Attended 5 events',            '🥇', 5),
  ('legend',       'Legend',      'Legend',        'Deltog i 10+ evenemang',            'Attended 10+ events',          '💎', 10)
on conflict (slug) do nothing;

-- ─── ROW LEVEL SECURITY ───────────────────────────────────────
alter table profiles enable row level security;
alter table questions enable row level security;
alter table question_likes enable row level security;
alter table attendances enable row level security;
alter table push_subscriptions enable row level security;
alter table user_achievements enable row level security;

-- Profiles: users see their own, admins see all
create policy "Users can view own profile"
  on profiles for select using (auth.uid() = user_id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = user_id);

create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = user_id);

-- Questions: anyone can read, auth users can insert
create policy "Anyone can read questions"
  on questions for select using (true);

create policy "Auth users can insert questions"
  on questions for insert with check (auth.uid() is not null);

-- Likes: auth users only
create policy "Auth users can manage likes"
  on question_likes for all using (
    auth.uid() = (select user_id from profiles where id = question_likes.user_id)
  );

-- Public tables (no RLS needed — readable by all)
-- events, speakers, agenda_sessions, achievements, announcements, notifications
-- These are managed by admin via service key

-- ─── REALTIME ─────────────────────────────────────────────────
-- Enable realtime for Q&A
alter publication supabase_realtime add table questions;
alter publication supabase_realtime add table question_likes;
