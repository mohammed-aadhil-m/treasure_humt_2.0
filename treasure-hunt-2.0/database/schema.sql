-- ============================================================
-- TREASURE HUNT 2.0 — Database Schema (Supabase / PostgreSQL)
-- Run this in the Supabase SQL Editor (Project > SQL Editor > New query)
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- EVENT SETTINGS (single row, configurable by admin)
-- ------------------------------------------------------------
create table if not exists event_settings (
  id smallint primary key default 1,
  event_name text not null default 'TREASURE HUNT 2.0',
  tagline text not null default 'SCAN. SOLVE. SEARCH. CONQUER.',
  event_date date not null default '2026-09-09',
  total_rounds int not null default 5,
  status text not null default 'NOT_STARTED', -- NOT_STARTED | RUNNING | PAUSED | ENDED
  leaderboard_visible boolean not null default true,
  default_max_attempts int, -- null = unlimited
  wrong_answer_penalty int not null default 10,
  hint_penalty int not null default 0,
  updated_at timestamptz not null default now(),
  constraint single_row check (id = 1)
);

insert into event_settings (id) values (1) on conflict (id) do nothing;

-- ------------------------------------------------------------
-- ADMINS
-- ------------------------------------------------------------
create table if not exists admins (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- ROUNDS
-- ------------------------------------------------------------
create table if not exists rounds (
  id uuid primary key default gen_random_uuid(),
  round_number int unique not null check (round_number between 1 and 5),
  name text not null,
  description text,
  points int not null default 100,
  max_attempts int, -- null = unlimited
  wrong_answer_penalty int not null default 10,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- CHALLENGES (question pool per round)
-- ------------------------------------------------------------
create table if not exists challenges (
  id uuid primary key default gen_random_uuid(),
  round_id uuid not null references rounds(id) on delete cascade,
  code text unique, -- human friendly id e.g. R1-001
  type text not null check (type in ('quiz','riddle','puzzle','image_puzzle')),
  question text not null,
  options jsonb, -- for quiz: ["A text","B text","C text","D text"]
  correct_answer text not null, -- for quiz: 'A'|'B'|'C'|'D', for others: canonical answer
  accepted_answers text[] not null default '{}', -- extra accepted text answers (lowercased/trimmed at insert time is not enforced here; normalized at query time)
  hint text not null,
  image_url text,
  points int, -- overrides round points if set
  penalty int, -- overrides round penalty if set
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_challenges_round on challenges(round_id);

-- ------------------------------------------------------------
-- QR CHECKPOINTS (exactly 5, one per round)
-- ------------------------------------------------------------
create table if not exists qr_checkpoints (
  id uuid primary key default gen_random_uuid(),
  checkpoint_number int unique not null check (checkpoint_number between 1 and 5),
  secure_token text unique not null default encode(gen_random_bytes(16), 'hex'),
  internal_location text,
  hint_note text, -- admin-only note about where it's physically hidden
  is_active boolean not null default true,
  scan_count int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_qr_token on qr_checkpoints(secure_token);

-- ------------------------------------------------------------
-- TEAMS
-- ------------------------------------------------------------
create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  team_code text unique not null, -- access code participants enter
  team_name text not null,
  members text[] not null default '{}',
  status text not null default 'REGISTERED', -- REGISTERED | IN_PROGRESS | COMPLETED
  current_round int not null default 0, -- 0 = not started, 1-5 = active round, 6 = finished
  score int not null default 0,
  started_at timestamptz,
  completed_at timestamptz,
  last_activity_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint max_two_members check (cardinality(members) <= 2)
);

create index if not exists idx_teams_code on teams(team_code);
create unique index if not exists idx_teams_name_lower on teams (lower(trim(team_name)));

-- ------------------------------------------------------------
-- TEAM SESSIONS (lightweight session token, no password needed)
-- ------------------------------------------------------------
create table if not exists team_sessions (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  session_token text unique not null default encode(gen_random_bytes(24), 'hex'),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '2 days')
);

create index if not exists idx_session_token on team_sessions(session_token);

-- ------------------------------------------------------------
-- TEAM_CHALLENGES (assignment record — enforces "never twice" & no re-roll on refresh)
-- ------------------------------------------------------------
create table if not exists team_challenges (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  challenge_id uuid not null references challenges(id) on delete cascade,
  round_id uuid not null references rounds(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  completed_at timestamptz,
  attempts int not null default 0,
  status text not null default 'ASSIGNED', -- ASSIGNED | COMPLETED
  unique (team_id, challenge_id)
);

create index if not exists idx_tc_team on team_challenges(team_id);
create index if not exists idx_tc_challenge on team_challenges(challenge_id);

-- Only one ACTIVE (non-completed) assignment per team per round at a time
create unique index if not exists idx_tc_one_active_per_round
  on team_challenges(team_id, round_id)
  where status = 'ASSIGNED';

-- ------------------------------------------------------------
-- TEAM_PROGRESS (per-round timing / checkpoint record)
-- ------------------------------------------------------------
create table if not exists team_progress (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  round_id uuid not null references rounds(id) on delete cascade,
  qr_checkpoint_id uuid references qr_checkpoints(id),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  score_earned int not null default 0,
  time_taken_seconds int,
  unique (team_id, round_id)
);

create index if not exists idx_progress_team on team_progress(team_id);

-- ------------------------------------------------------------
-- ANSWER_ATTEMPTS (audit trail — every submission)
-- ------------------------------------------------------------
create table if not exists answer_attempts (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  challenge_id uuid not null references challenges(id) on delete cascade,
  answer text,
  is_correct boolean not null,
  attempt_number int not null,
  points_change int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_attempts_team on answer_attempts(team_id);
create index if not exists idx_attempts_challenge on answer_attempts(challenge_id);

-- ============================================================
-- Seed the 5 rounds and 5 QR checkpoints (idempotent)
-- ============================================================
insert into rounds (round_number, name, description, points, wrong_answer_penalty)
values
  (1, 'Round 1', 'Easy — Riddle / Quiz / Puzzle', 100, 10),
  (2, 'Round 2', 'Easy/Medium — Logic Puzzle / Riddle / Quiz', 150, 10),
  (3, 'Round 3', 'Medium — Logic / Technical Quiz / Puzzle / Riddle', 200, 15),
  (4, 'Round 4', 'Medium/Hard — Hard Puzzle / Riddle / Quiz', 250, 15),
  (5, 'Round 5', 'Hard — Final Challenge', 500, 20)
on conflict (round_number) do nothing;

insert into qr_checkpoints (checkpoint_number, internal_location)
values
  (1, 'Starting point (publicly displayed on projector)'),
  (2, 'TO BE SET BY ADMIN'),
  (3, 'TO BE SET BY ADMIN'),
  (4, 'TO BE SET BY ADMIN'),
  (5, 'TO BE SET BY ADMIN')
on conflict (checkpoint_number) do nothing;
