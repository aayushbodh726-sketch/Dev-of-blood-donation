-- LifeFlow API tables. The Edge Function uses the server-side secret key;
-- direct browser access to these tables stays disabled by RLS and grants.
create table if not exists public.app_users (
  auth_user_id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  phone text,
  blood_group text not null check (blood_group in ('A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG')),
  role text not null default 'DONOR' check (role in ('DONOR', 'RECIPIENT')),
  city text not null,
  state text not null,
  zip_code text,
  is_available boolean not null default true,
  last_donated_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blood_requests (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null constraint blood_requests_recipient_id_fkey references public.app_users(auth_user_id) on delete cascade,
  patient_name text not null,
  hospital_name text not null,
  hospital_addr text,
  blood_group text not null check (blood_group in ('A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG')),
  units_needed integer not null check (units_needed > 0),
  urgency text not null default 'NORMAL' check (urgency in ('CRITICAL', 'HIGH', 'NORMAL')),
  city text not null,
  state text not null,
  contact_phone text not null,
  status text not null default 'OPEN',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.donation_history (
  id uuid primary key default gen_random_uuid(),
  donor_id uuid not null constraint donation_history_donor_id_fkey references public.app_users(auth_user_id) on delete cascade,
  request_id uuid not null constraint donation_history_request_id_fkey references public.blood_requests(id) on delete cascade,
  status text not null default 'PLEDGED',
  date timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint donation_history_donor_request_unique unique (donor_id, request_id)
);

create index if not exists app_users_donor_search_idx on public.app_users (role, is_available, blood_group, city);
create index if not exists blood_requests_status_created_idx on public.blood_requests (status, created_at desc);
create index if not exists donation_history_status_idx on public.donation_history (status);

alter table public.app_users enable row level security;
alter table public.blood_requests enable row level security;
alter table public.donation_history enable row level security;

revoke all on table public.app_users, public.blood_requests, public.donation_history from anon, authenticated;
grant all on table public.app_users, public.blood_requests, public.donation_history to service_role;
