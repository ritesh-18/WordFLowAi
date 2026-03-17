-- ============================================================
-- WordFlow AI — Database Schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  full_name     text,
  avatar_url    text,
  created_at    timestamptz default now() not null,
  updated_at    timestamptz default now() not null
);

-- ============================================================
-- USER SETTINGS
-- ============================================================
create table public.user_settings (
  id                    uuid primary key default uuid_generate_v4(),
  user_id               uuid references public.profiles(id) on delete cascade not null unique,
  default_wpm           int default 300 check (default_wpm between 50 and 1500),
  preferred_theme       text default 'tech' check (preferred_theme in ('corporate','daily_life','tech')),
  focus_mode_enabled    boolean default false,
  ambient_sound         text default 'none' check (ambient_sound in ('none','rain','white_noise','cafe','forest')),
  reminder_enabled      boolean default false,
  reminder_time         time default '09:00:00',
  created_at            timestamptz default now() not null,
  updated_at            timestamptz default now() not null
);

-- ============================================================
-- THEME PACKS
-- ============================================================
create table public.theme_packs (
  id          uuid primary key default uuid_generate_v4(),
  slug        text unique not null,
  name        text not null,
  description text,
  color       text default '#6172f3',
  icon        text default '📚',
  created_at  timestamptz default now() not null
);

-- ============================================================
-- WORDS
-- ============================================================
create table public.words (
  id           uuid primary key default uuid_generate_v4(),
  theme_id     uuid references public.theme_packs(id) on delete cascade not null,
  word         text not null,
  definition   text,
  difficulty   int default 1 check (difficulty between 1 and 3),
  created_at   timestamptz default now() not null
);

create index idx_words_theme_id on public.words(theme_id);

-- ============================================================
-- PRACTICE SESSIONS
-- ============================================================
create table public.sessions (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid references public.profiles(id) on delete cascade not null,
  theme_id          uuid references public.theme_packs(id),
  wpm               int,
  words_practiced   int default 0,
  duration_seconds  int default 0,
  focus_mode_used   boolean default false,
  completed         boolean default false,
  started_at        timestamptz default now() not null,
  ended_at          timestamptz
);

create index idx_sessions_user_id on public.sessions(user_id);
create index idx_sessions_started_at on public.sessions(started_at desc);

-- ============================================================
-- SPEECH METRICS
-- ============================================================
create table public.speech_metrics (
  id                  uuid primary key default uuid_generate_v4(),
  session_id          uuid references public.sessions(id) on delete cascade not null,
  user_id             uuid references public.profiles(id) on delete cascade not null,
  spoken_wpm          int,
  pause_count         int default 0,
  longest_pause_ms    int default 0,
  total_speaking_ms   int default 0,
  total_silence_ms    int default 0,
  transcription       text,
  recorded_at         timestamptz default now() not null
);

create index idx_speech_metrics_user_id on public.speech_metrics(user_id);
create index idx_speech_metrics_session_id on public.speech_metrics(session_id);

-- ============================================================
-- STREAKS
-- ============================================================
create table public.streaks (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid references public.profiles(id) on delete cascade not null unique,
  current_streak  int default 0,
  longest_streak  int default 0,
  last_practice   date,
  total_days      int default 0,
  updated_at      timestamptz default now() not null
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles        enable row level security;
alter table public.user_settings   enable row level security;
alter table public.theme_packs     enable row level security;
alter table public.words           enable row level security;
alter table public.sessions        enable row level security;
alter table public.speech_metrics  enable row level security;
alter table public.streaks         enable row level security;

-- profiles
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);
create policy "Profile created on signup"
  on public.profiles for insert with check (auth.uid() = id);

-- user_settings
create policy "Users manage own settings"
  on public.user_settings for all using (auth.uid() = user_id);

-- theme_packs (public read)
create policy "Anyone can read theme packs"
  on public.theme_packs for select using (true);

-- words (public read)
create policy "Anyone can read words"
  on public.words for select using (true);

-- sessions
create policy "Users manage own sessions"
  on public.sessions for all using (auth.uid() = user_id);

-- speech_metrics
create policy "Users manage own speech metrics"
  on public.speech_metrics for all using (auth.uid() = user_id);

-- streaks
create policy "Users manage own streaks"
  on public.streaks for all using (auth.uid() = user_id);

-- ============================================================
-- TRIGGER: auto-create profile on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  insert into public.user_settings (user_id) values (new.id);
  insert into public.streaks (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- TRIGGER: auto-update streak on session complete
-- ============================================================
create or replace function public.update_streak_on_session()
returns trigger language plpgsql security definer as $$
declare
  v_streak    public.streaks%rowtype;
  v_today     date := current_date;
begin
  if new.completed = true and old.completed = false then
    select * into v_streak from public.streaks where user_id = new.user_id;

    if v_streak.last_practice = v_today then
      -- already practiced today, nothing changes
      return new;
    elsif v_streak.last_practice = v_today - 1 then
      -- consecutive day
      update public.streaks set
        current_streak = current_streak + 1,
        longest_streak = greatest(longest_streak, current_streak + 1),
        last_practice  = v_today,
        total_days     = total_days + 1,
        updated_at     = now()
      where user_id = new.user_id;
    else
      -- streak broken
      update public.streaks set
        current_streak = 1,
        last_practice  = v_today,
        total_days     = total_days + 1,
        updated_at     = now()
      where user_id = new.user_id;
    end if;
  end if;
  return new;
end;
$$;

create trigger on_session_completed
  after update on public.sessions
  for each row execute function public.update_streak_on_session();
