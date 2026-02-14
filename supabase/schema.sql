-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Users Table
create table if not exists public.users (
  id uuid default uuid_generate_v4() primary key,
  email text unique not null,
  password text not null,
  name text,
  role text default 'user' check (role in ('user', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Content Table
create table if not exists public.content (
  id uuid default uuid_generate_v4() primary key,
  creator_id uuid references public.users(id) not null,
  title text not null,
  description text,
  price numeric not null,
  currency text default 'USD',
  image_base_64 text,
  mime_type text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Transactions Table
create table if not exists public.transactions (
  id uuid default uuid_generate_v4() primary key,
  content_id uuid references public.content(id),
  content_title text,
  amount numeric not null,
  net_amount numeric not null,
  currency text,
  buyer_masked text,
  timestamp bigint,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Withdrawals Table
create table if not exists public.withdrawals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id),
  user_name text,
  amount numeric not null,
  currency text,
  method text,
  account_number text,
  status text default 'pending' check (status in ('pending', 'completed', 'rejected')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security
alter table public.users enable row level security;
alter table public.content enable row level security;
alter table public.transactions enable row level security;
alter table public.withdrawals enable row level security;

-- Policies: Allow full access for service_role (backend server)
-- and read access for anon on public content

-- Users policies
create policy "Service role full access on users" on public.users
  for all using (true) with check (true);

-- Content policies
create policy "Service role full access on content" on public.content
  for all using (true) with check (true);

-- Transactions policies
create policy "Service role full access on transactions" on public.transactions
  for all using (true) with check (true);

-- Withdrawals policies
create policy "Service role full access on withdrawals" on public.withdrawals
  for all using (true) with check (true);
