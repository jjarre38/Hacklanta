-- HomePath accounts: one saved case per signed-in user.
-- Run once in the Supabase SQL editor (Dashboard → SQL Editor → New query).
-- Auth users live in Supabase's built-in auth.users table; this only stores each user's case.
-- Guests (not signed in) are unaffected: their case stays in their browser only.

create table if not exists account_cases (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  -- The full UserCase object. The app validates it on load; the size cap stops abuse of the anon key.
  data       jsonb not null check (octet_length(data::text) < 262144),
  updated_at timestamptz not null default now()
);

-- Row-level security: a signed-in user can only see and change their own row.
alter table account_cases enable row level security;

drop policy if exists "read own case" on account_cases;
create policy "read own case" on account_cases
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "insert own case" on account_cases;
create policy "insert own case" on account_cases
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "update own case" on account_cases;
create policy "update own case" on account_cases
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "delete own case" on account_cases;
create policy "delete own case" on account_cases
  for delete to authenticated using ((select auth.uid()) = user_id);
