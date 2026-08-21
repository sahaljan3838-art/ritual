-- Supabase/Postgres production schema. Enable RLS before exposing any table.
create table profiles (id uuid primary key references auth.users on delete cascade, display_name text, reduced_motion boolean default false, created_at timestamptz default now());
create type habit_kind as enum ('build','break');
create type difficulty as enum ('tiny','easy','moderate','challenging');
create table habits (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users on delete cascade,
  name text not null, kind habit_kind not null, why text, cue text, routine text, minimum_version text,
  replacement text, friction_plan text, difficulty difficulty default 'tiny', target_minutes int,
  reminder_time time, reminder_enabled boolean default false, schedule_days integer[] not null default array[0,1,2,3,4,5,6],
  color text default '#6674E8', archived boolean default false, created_at timestamptz default now()
);
create table habit_events (id uuid primary key default gen_random_uuid(), habit_id uuid not null references habits on delete cascade, user_id uuid not null references auth.users on delete cascade, occurred_on date not null, status text check(status in ('complete','partial','skipped')), note text, created_at timestamptz default now(), unique(habit_id, occurred_on));
create table recovery_checkins (id uuid primary key default gen_random_uuid(), habit_id uuid not null references habits on delete cascade, user_id uuid not null references auth.users on delete cascade, reason text not null, adjustment text, created_at timestamptz default now());
create table coach_conversations (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users on delete cascade, messages jsonb not null, created_at timestamptz default now());
alter table profiles enable row level security; alter table habits enable row level security; alter table habit_events enable row level security; alter table recovery_checkins enable row level security; alter table coach_conversations enable row level security;
create policy "own profile" on profiles using (auth.uid()=id) with check(auth.uid()=id);
create policy "own habits" on habits using (auth.uid()=user_id) with check(auth.uid()=user_id);
create policy "own events" on habit_events using (auth.uid()=user_id) with check(auth.uid()=user_id);
create policy "own recovery" on recovery_checkins using (auth.uid()=user_id) with check(auth.uid()=user_id);
create policy "own conversations" on coach_conversations using (auth.uid()=user_id) with check(auth.uid()=user_id);

-- Run these two lines once in an existing project created before reminders.
alter table habits add column if not exists reminder_time time;
alter table habits add column if not exists reminder_enabled boolean default false;
alter table habits add column if not exists schedule_days integer[] not null default array[0,1,2,3,4,5,6];

-- Background push subscriptions. The browser stores only its own subscription;
-- the scheduled server function reads them with the Supabase service-role key.
create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  endpoint text not null unique,
  subscription jsonb not null,
  timezone text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create table if not exists push_reminder_log (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references habits on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  endpoint text not null,
  scheduled_on date not null,
  created_at timestamptz default now(),
  unique (habit_id, endpoint, scheduled_on)
);
alter table push_subscriptions enable row level security;
alter table push_reminder_log enable row level security;
drop policy if exists "own push subscriptions" on push_subscriptions;
create policy "own push subscriptions" on push_subscriptions for all using (auth.uid()=user_id) with check (auth.uid()=user_id);

-- If you ran the earlier version of this schema, run this migration once too.
alter table push_reminder_log add column if not exists endpoint text;
alter table push_reminder_log drop constraint if exists push_reminder_log_habit_id_scheduled_on_key;
create unique index if not exists push_reminder_log_once_per_device_per_day on push_reminder_log (habit_id, endpoint, scheduled_on);
