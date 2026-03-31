-- ============================================================
-- TrackFlow — Supabase Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ──────────────────────────────────────────────────────────────
-- PROFILES
-- ──────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id                    uuid references auth.users(id) on delete cascade primary key,
  email                 text not null,
  full_name             text,
  avatar_url            text,
  phone                 text,
  account_type          text not null default 'individual' check (account_type in ('individual','family','business')),
  business_name         text,
  currency              text not null default 'NGN',
  monthly_income        numeric(15,2),
  onboarding_completed  boolean not null default false,
  is_admin              boolean not null default false,
  push_subscription     jsonb,
  date_of_birth         date,
  state                 text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- Idempotent column additions for existing deployments
alter table public.profiles add column if not exists date_of_birth date;
alter table public.profiles add column if not exists state text;

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on signup
-- Reads full_name, account_type, phone, and avatar_url from OAuth / signup metadata
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, phone, account_type)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'phone',
    coalesce(new.raw_user_meta_data->>'account_type', 'individual')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- ──────────────────────────────────────────────────────────────
-- TRANSACTIONS
-- ──────────────────────────────────────────────────────────────
create table if not exists public.transactions (
  id                  uuid default uuid_generate_v4() primary key,
  user_id             uuid references public.profiles(id) on delete cascade not null,
  type                text not null check (type in ('income','expense')),
  amount              numeric(15,2) not null check (amount > 0),
  category            text not null,
  description         text not null,
  date                date not null,
  note                text,
  tags                text[],
  receipt_url         text,
  is_recurring        boolean not null default false,
  recurring_interval  text check (recurring_interval in ('daily','weekly','monthly','yearly')),
  budget_id           uuid,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table public.transactions enable row level security;

create policy "Users can manage own transactions"
  on public.transactions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index idx_transactions_user_date on public.transactions(user_id, date desc);
create index idx_transactions_type on public.transactions(user_id, type);
create index idx_transactions_category on public.transactions(user_id, category);

create trigger transactions_updated_at
  before update on public.transactions
  for each row execute procedure public.set_updated_at();

-- ──────────────────────────────────────────────────────────────
-- BUDGETS
-- ──────────────────────────────────────────────────────────────
create table if not exists public.budgets (
  id               uuid default uuid_generate_v4() primary key,
  user_id          uuid references public.profiles(id) on delete cascade not null,
  name             text not null,
  category         text not null,
  amount           numeric(15,2) not null check (amount > 0),
  spent            numeric(15,2) not null default 0 check (spent >= 0),
  period           text not null default 'monthly' check (period in ('weekly','monthly','yearly')),
  start_date       date not null,
  end_date         date not null,
  color            text,
  alert_threshold  integer not null default 80 check (alert_threshold between 1 and 100),
  is_active        boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table public.budgets enable row level security;

create policy "Users can manage own budgets"
  on public.budgets for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index idx_budgets_user on public.budgets(user_id, is_active);

create trigger budgets_updated_at
  before update on public.budgets
  for each row execute procedure public.set_updated_at();

-- ──────────────────────────────────────────────────────────────
-- GOALS
-- ──────────────────────────────────────────────────────────────
create table if not exists public.goals (
  id              uuid default uuid_generate_v4() primary key,
  user_id         uuid references public.profiles(id) on delete cascade not null,
  name            text not null,
  description     text,
  target_amount   numeric(15,2) not null check (target_amount > 0),
  current_amount  numeric(15,2) not null default 0 check (current_amount >= 0),
  target_date     date not null,
  category        text not null default 'general',
  icon            text,
  color           text,
  is_completed    boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.goals enable row level security;

create policy "Users can manage own goals"
  on public.goals for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index idx_goals_user on public.goals(user_id, is_completed);

create trigger goals_updated_at
  before update on public.goals
  for each row execute procedure public.set_updated_at();

-- ──────────────────────────────────────────────────────────────
-- NOTIFICATIONS
-- ──────────────────────────────────────────────────────────────
create table if not exists public.notifications (
  id         uuid default uuid_generate_v4() primary key,
  user_id    uuid references public.profiles(id) on delete cascade not null,
  title      text not null,
  body       text not null,
  type       text not null default 'system' check (type in ('budget_alert','goal_milestone','system','insight')),
  is_read    boolean not null default false,
  data       jsonb,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "Users can manage own notifications"
  on public.notifications for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index idx_notifications_user on public.notifications(user_id, is_read, created_at desc);

-- ──────────────────────────────────────────────────────────────
-- SUBSCRIPTIONS
-- ──────────────────────────────────────────────────────────────
create table if not exists public.subscriptions (
  id                uuid default uuid_generate_v4() primary key,
  user_id           uuid references public.profiles(id) on delete cascade not null unique,
  plan              text not null default 'free' check (plan in ('free','pro','business')),
  status            text not null default 'active' check (status in ('active','cancelled','expired','trial')),
  flw_tx_ref        text,
  amount            numeric(10,2) not null default 0,
  next_billing_date date,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create policy "Users can view own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create policy "Service role can manage subscriptions"
  on public.subscriptions for all
  using (true);

create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute procedure public.set_updated_at();

-- Auto-create free subscription on profile creation
create or replace function public.handle_new_profile()
returns trigger as $$
begin
  insert into public.subscriptions (user_id, plan, status)
  values (new.id, 'free', 'active');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_profile_created on public.profiles;
create trigger on_profile_created
  after insert on public.profiles
  for each row execute procedure public.handle_new_profile();
