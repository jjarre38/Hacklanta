-- HomePath database schema (Supabase / PostgreSQL)
-- Guest mode: cases are keyed by an anonymous session_id stored in the browser.
-- No SSNs, banking credentials, or identity documents are stored.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- resources
create table if not exists resources (
  id                    text primary key,
  name                  text not null,
  category              text not null,
  secondary_categories  text[] not null default '{}',
  counties_served       text[] not null,          -- primary matching field
  zip_codes_served      text[],
  address               text,
  phone                 text,
  website               text,
  eligibility_summary   text not null,
  application_method    text not null,
  status                text not null default 'UNKNOWN'
                        check (status in ('OPEN','WAITLIST','FUNDS_LIMITED','CLOSED','UNKNOWN')),
  last_verified         date not null,
  typical_amount        numeric(10,2),
  serves_families_with_children boolean default false,
  requires_eviction_filing     boolean default false,
  created_at            timestamptz not null default now()
);
create index if not exists resources_category_idx on resources (category);
create index if not exists resources_counties_idx on resources using gin (counties_served);

-- --------------------------------------------------------------- user_cases
create table if not exists user_cases (
  id                       text primary key,
  session_id               text not null,
  zip_code                 text not null,
  county                   text not null,
  state                    text not null default 'GA',
  monthly_rent             numeric(10,2) not null,
  amount_owed              numeric(10,2) not null,
  available_today          numeric(10,2) not null default 0,
  monthly_income           numeric(10,2) not null default 0,
  next_paycheck_amount     numeric(10,2),
  next_paycheck_date       date,
  household_size           int not null default 1,
  has_children             boolean not null default false,
  employment_status        text,
  income_recently_reduced  boolean not null default false,
  contacted_landlord       boolean not null default false,
  payment_plan_discussed   boolean not null default false,
  payment_plan_rejected    boolean not null default false,
  payment_plan_accepted    boolean not null default false,
  can_afford_payment_plan  boolean not null default false,
  applied_for_assistance   boolean not null default false,
  assistance_status        text check (assistance_status in ('APPROVED','DENIED','WAITLISTED','NOT_ATTEMPTED')),
  eviction_stage           text not null
                           check (eviction_stage in ('BEHIND_ON_RENT','NOTICE_RECEIVED','EVICTION_FILED','COURT_DATE_SCHEDULED','JUDGMENT_ENTERED','UNSURE')),
  court_date               date,
  case_number              text,
  legal_aid_contacted      boolean default false,
  new_housing_found        boolean default false,
  staying_not_realistic    boolean default false,
  housing_barrier          text,
  case_status              text not null
                           check (case_status in ('PREVENTION','URGENT_INTERVENTION','LEGAL_HELP_RECOMMENDED','TRANSITION_RECOVERY')),
  raw                      jsonb,                  -- full UserCase snapshot for the app
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);
create index if not exists user_cases_session_idx on user_cases (session_id);
create index if not exists user_cases_county_idx on user_cases (county);

-- -------------------------------------------------------------- case_events
create table if not exists case_events (
  id             text primary key,
  case_id        text not null references user_cases(id) on delete cascade,
  type           text not null,
  description    text not null,
  event_date     timestamptz not null,
  is_user_action boolean not null default true,
  created_at     timestamptz not null default now()
);
create index if not exists case_events_case_idx on case_events (case_id, event_date);

-- ------------------------------------------------------------- action_items
create table if not exists action_items (
  id          text not null,
  case_id     text not null references user_cases(id) on delete cascade,
  title       text not null,
  description text not null,
  reason      text not null,
  urgency     text not null check (urgency in ('TODAY','BEFORE_COURT','THIS_WEEK','ONGOING')),
  completed   boolean not null default false,
  created_at  timestamptz not null default now(),
  primary key (case_id, id)
);

-- ------------------------------------------------------------ payment_plans
create table if not exists payment_plans (
  id              uuid primary key default gen_random_uuid(),
  case_id         text not null references user_cases(id) on delete cascade,
  total_owed      numeric(10,2) not null,
  available_today numeric(10,2) not null,
  installments    jsonb not null,               -- [{amount, dueDate, label}]
  proposal_text   text,
  created_at      timestamptz not null default now()
);
create index if not exists payment_plans_case_idx on payment_plans (case_id);

-- ---------------------------------------------------------------- documents
create table if not exists documents (
  id             uuid primary key default gen_random_uuid(),
  case_id        text references user_cases(id) on delete cascade,
  session_id     text not null,
  storage_path   text,                          -- path in the 'documents' storage bucket
  file_name      text,
  mime_type      text,
  extracted      jsonb,                         -- ExtractedDocument
  confirmed      boolean not null default false,
  created_at     timestamptz not null default now()
);
create index if not exists documents_case_idx on documents (case_id);

-- ------------------------------------------------------------------ storage
-- Private bucket for uploaded notices. Accessed only by the server (service role).
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

-- ---------------------------------------------------------- row level security
-- All writes go through server routes using the service role key, which bypasses RLS.
-- Enable RLS so the anon key cannot read other people's cases.
alter table user_cases    enable row level security;
alter table case_events   enable row level security;
alter table action_items  enable row level security;
alter table payment_plans enable row level security;
alter table documents     enable row level security;
alter table resources     enable row level security;

drop policy if exists "resources are public" on resources;
create policy "resources are public" on resources for select using (true);

-- ------------------------------------------------------ iMessage agent (Photon)
-- A subscription links one case to one iMessage handle (phone or email).
-- Linking is user-initiated: the dashboard issues a short-lived code and the
-- user texts "LINK <code>" to the agent, which proves they own the handle and
-- records their opt-in. Texting STOP sets status to STOPPED.
create table if not exists imessage_subscriptions (
  id                         uuid primary key default gen_random_uuid(),
  case_id                    text not null references user_cases(id) on delete cascade,
  session_id                 text not null,
  status                     text not null default 'PENDING'
                             check (status in ('PENDING','ACTIVE','STOPPED')),
  link_code                  text unique,
  link_code_expires_at       timestamptz,
  handle                     text,                -- phone (+1...) or Apple ID email
  chat_id                    text,                -- Messages chat to reply into
  last_notified_status       text,
  pending_update             jsonb,               -- CaseUpdate awaiting YES/NO
  pending_update_expires_at  timestamptz,
  opted_in_at                timestamptz,
  created_at                 timestamptz not null default now(),
  updated_at                 timestamptz not null default now()
);
create index if not exists imessage_subscriptions_case_idx on imessage_subscriptions (case_id);
create index if not exists imessage_subscriptions_session_idx on imessage_subscriptions (session_id);
create unique index if not exists imessage_subscriptions_active_handle_idx
  on imessage_subscriptions (handle) where status = 'ACTIVE';

-- One row per notification sent; the unique key prevents duplicate reminders.
create table if not exists imessage_notifications (
  id               uuid primary key default gen_random_uuid(),
  subscription_id  uuid not null references imessage_subscriptions(id) on delete cascade,
  dedupe_key       text not null,
  kind             text not null,
  body             text not null,
  sent_at          timestamptz not null default now(),
  unique (subscription_id, dedupe_key)
);

alter table imessage_subscriptions enable row level security;
alter table imessage_notifications enable row level security;
