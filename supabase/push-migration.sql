-- Run this once in Supabase SQL Editor for an existing Ritual project.
alter table habits add column if not exists schedule_days integer[] not null default array[0,1,2,3,4,5,6];
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
  created_at timestamptz default now()
);

alter table push_subscriptions enable row level security;
alter table push_reminder_log enable row level security;
drop policy if exists "own push subscriptions" on push_subscriptions;
create policy "own push subscriptions" on push_subscriptions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table push_reminder_log add column if not exists endpoint text;
alter table push_reminder_log drop constraint if exists push_reminder_log_habit_id_scheduled_on_key;
create unique index if not exists push_reminder_log_once_per_device_per_day on push_reminder_log (habit_id, endpoint, scheduled_on);
