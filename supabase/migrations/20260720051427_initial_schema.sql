-- FounderOS — initial schema
-- Modules: profiles, projects, milestones, tasks, goals, habits, finance,
-- calendar, notes, activity, integrations, AI briefs.
-- Every table is user-owned with RLS; auth is Supabase Auth (Google/GitHub).

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.project_status as enum ('planning', 'active', 'on_hold', 'completed', 'archived');
create type public.task_status as enum ('backlog', 'todo', 'in_progress', 'review', 'done');
create type public.task_priority as enum ('critical', 'high', 'medium', 'low');
create type public.goal_category as enum ('personal', 'business', 'health', 'financial', 'learning');
create type public.note_kind as enum ('quick', 'meeting', 'technical', 'idea', 'decision');
create type public.event_kind as enum ('meeting', 'focus', 'deadline', 'personal');
create type public.integration_provider as enum ('github', 'google_calendar');

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Profiles (1:1 with auth.users, auto-created on signup)
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  plan text not null default 'free',
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Projects & milestones
-- ---------------------------------------------------------------------------

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  description text,
  color text not null default 'indigo',
  glyph text,
  status public.project_status not null default 'planning',
  progress int not null default 0 check (progress between 0 and 100),
  start_date date,
  target_date date,
  tags text[] not null default '{}',
  position int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

create table public.milestones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  title text not null,
  due_date date,
  completed_at timestamptz,
  position int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger milestones_set_updated_at
  before update on public.milestones
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Tasks (project_id nullable → personal tasks)
-- ---------------------------------------------------------------------------

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  project_id uuid references public.projects (id) on delete set null,
  milestone_id uuid references public.milestones (id) on delete set null,
  title text not null,
  description text,
  status public.task_status not null default 'todo',
  priority public.task_priority not null default 'medium',
  due_at timestamptz,
  estimated_minutes int,
  labels text[] not null default '{}',
  position int not null default 0,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Goals
-- ---------------------------------------------------------------------------

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null,
  category public.goal_category not null default 'personal',
  target_value numeric(14, 2),
  current_value numeric(14, 2) not null default 0,
  unit text,
  icon text,
  color text not null default 'indigo',
  due_date date,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger goals_set_updated_at
  before update on public.goals
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Habits
-- ---------------------------------------------------------------------------

create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  icon text,
  color text not null default 'indigo',
  target_per_week int not null default 7 check (target_per_week between 1 and 7),
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger habits_set_updated_at
  before update on public.habits
  for each row execute function public.set_updated_at();

create table public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  habit_id uuid not null references public.habits (id) on delete cascade,
  logged_on date not null default current_date,
  created_at timestamptz not null default now(),
  unique (habit_id, logged_on)
);

-- ---------------------------------------------------------------------------
-- Finance (visibility, not accounting — docs/02 §7)
-- ---------------------------------------------------------------------------

create table public.income_sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  kind text not null default 'other',
  color text not null default 'indigo',
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger income_sources_set_updated_at
  before update on public.income_sources
  for each row execute function public.set_updated_at();

create table public.income_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  source_id uuid not null references public.income_sources (id) on delete cascade,
  amount numeric(14, 2) not null check (amount >= 0),
  received_on date not null default current_date,
  note text,
  created_at timestamptz not null default now()
);

create table public.finance_settings (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  currency text not null default 'INR',
  monthly_income_goal numeric(14, 2),
  savings_goal numeric(14, 2),
  current_balance numeric(14, 2),
  updated_at timestamptz not null default now()
);

create trigger finance_settings_set_updated_at
  before update on public.finance_settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Calendar (manual events now, Google sync in Phase 2)
-- ---------------------------------------------------------------------------

create table public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  project_id uuid references public.projects (id) on delete set null,
  title text not null,
  kind public.event_kind not null default 'meeting',
  color text not null default 'indigo',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  location text,
  external_id text,
  external_source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create trigger calendar_events_set_updated_at
  before update on public.calendar_events
  for each row execute function public.set_updated_at();

create unique index calendar_events_external_uidx
  on public.calendar_events (user_id, external_source, external_id)
  where external_id is not null;

-- ---------------------------------------------------------------------------
-- Notes
-- ---------------------------------------------------------------------------

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  project_id uuid references public.projects (id) on delete set null,
  title text not null,
  content text not null default '',
  kind public.note_kind not null default 'quick',
  tags text[] not null default '{}',
  pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger notes_set_updated_at
  before update on public.notes
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Activity log (dashboard feed)
-- ---------------------------------------------------------------------------

create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kind text not null,
  title text not null,
  meta jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Integrations (tokens live server-side only; never exposed to the client)
-- ---------------------------------------------------------------------------

create table public.integrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  provider public.integration_provider not null,
  status text not null default 'connected',
  account_label text,
  credentials jsonb not null default '{}'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, provider)
);

create trigger integrations_set_updated_at
  before update on public.integrations
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- AI briefs (one per user per day)
-- ---------------------------------------------------------------------------

create table public.ai_briefs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  brief_date date not null default current_date,
  content jsonb not null,
  model text,
  created_at timestamptz not null default now(),
  unique (user_id, brief_date)
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index projects_user_status_idx on public.projects (user_id, status);
create index milestones_project_idx on public.milestones (project_id);
create index tasks_user_status_idx on public.tasks (user_id, status);
create index tasks_user_due_idx on public.tasks (user_id, due_at);
create index tasks_project_idx on public.tasks (project_id);
create index goals_user_idx on public.goals (user_id);
create index habits_user_idx on public.habits (user_id);
create index habit_logs_habit_day_idx on public.habit_logs (habit_id, logged_on desc);
create index habit_logs_user_day_idx on public.habit_logs (user_id, logged_on desc);
create index income_entries_user_month_idx on public.income_entries (user_id, received_on desc);
create index income_entries_source_idx on public.income_entries (source_id);
create index calendar_events_user_start_idx on public.calendar_events (user_id, starts_at);
create index notes_user_updated_idx on public.notes (user_id, updated_at desc);
create index activity_log_user_time_idx on public.activity_log (user_id, occurred_at desc);

-- ---------------------------------------------------------------------------
-- Row Level Security — users touch only their own rows
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (id = (select auth.uid()));

create policy "Users can update own profile"
  on public.profiles for update
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Owner-scoped policies for every user_id table
do $$
declare
  t text;
begin
  foreach t in array array[
    'projects', 'milestones', 'tasks', 'goals', 'habits', 'habit_logs',
    'income_sources', 'income_entries', 'calendar_events', 'notes',
    'activity_log', 'integrations', 'ai_briefs'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy "Users manage own %s" on public.%I for all '
      || 'using (user_id = (select auth.uid())) '
      || 'with check (user_id = (select auth.uid()))',
      t, t
    );
  end loop;
end;
$$;

alter table public.finance_settings enable row level security;

create policy "Users manage own finance settings"
  on public.finance_settings for all
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
