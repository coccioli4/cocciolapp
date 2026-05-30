-- CocciolApp V2 Supabase schema
-- Run this in Supabase SQL Editor.

create extension if not exists "uuid-ossp";

create table families (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamptz default now()
);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  family_id uuid references families(id) on delete cascade,
  display_name text not null,
  role text default 'member',
  created_at timestamptz default now()
);

create table categories (
  id uuid primary key default uuid_generate_v4(),
  family_id uuid references families(id) on delete cascade not null,
  name text not null,
  parent_id uuid references categories(id) on delete set null,
  icon text,
  color text,
  budget_monthly numeric default 0,
  archived boolean default false,
  created_at timestamptz default now()
);

create table expenses (
  id uuid primary key default uuid_generate_v4(),
  family_id uuid references families(id) on delete cascade not null,
  title text not null,
  amount numeric not null,
  paid_by uuid references profiles(id) on delete set null,
  category_id uuid references categories(id) on delete set null,
  spent_at date not null default current_date,
  notes text,
  recurring text,
  created_at timestamptz default now()
);

create table reminders (
  id uuid primary key default uuid_generate_v4(),
  family_id uuid references families(id) on delete cascade not null,
  title text not null,
  due_at timestamptz,
  assigned_to uuid references profiles(id) on delete set null,
  priority text default 'medium',
  status text default 'open',
  recurrence text,
  notes text,
  created_at timestamptz default now()
);

create table events (
  id uuid primary key default uuid_generate_v4(),
  family_id uuid references families(id) on delete cascade not null,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  category text,
  location text,
  notes text,
  created_at timestamptz default now()
);

create table maintenance_items (
  id uuid primary key default uuid_generate_v4(),
  family_id uuid references families(id) on delete cascade not null,
  title text not null,
  asset text,
  frequency text,
  next_due date,
  notes text,
  created_at timestamptz default now()
);

create table shopping_items (
  id uuid primary key default uuid_generate_v4(),
  family_id uuid references families(id) on delete cascade not null,
  name text not null,
  checked boolean default false,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz default now()
);

create table documents (
  id uuid primary key default uuid_generate_v4(),
  family_id uuid references families(id) on delete cascade not null,
  title text not null,
  file_path text not null,
  entity_type text,
  entity_id uuid,
  created_at timestamptz default now()
);

create table inbox_items (
  id uuid primary key default uuid_generate_v4(),
  family_id uuid references families(id) on delete cascade not null,
  text text not null,
  status text default 'new',
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz default now()
);

alter table families enable row level security;
alter table profiles enable row level security;
alter table categories enable row level security;
alter table expenses enable row level security;
alter table reminders enable row level security;
alter table events enable row level security;
alter table maintenance_items enable row level security;
alter table shopping_items enable row level security;
alter table documents enable row level security;
alter table inbox_items enable row level security;

-- Basic RLS helper: a user can access rows in their family.
create or replace function current_family_id()
returns uuid as $$
  select family_id from profiles where id = auth.uid();
$$ language sql security definer;

create policy "profiles family read" on profiles for select using (family_id = current_family_id() or id = auth.uid());
create policy "profiles self update" on profiles for update using (id = auth.uid());

create policy "family rows read" on families for select using (id = current_family_id());

create policy "categories all" on categories for all using (family_id = current_family_id()) with check (family_id = current_family_id());
create policy "expenses all" on expenses for all using (family_id = current_family_id()) with check (family_id = current_family_id());
create policy "reminders all" on reminders for all using (family_id = current_family_id()) with check (family_id = current_family_id());
create policy "events all" on events for all using (family_id = current_family_id()) with check (family_id = current_family_id());
create policy "maintenance all" on maintenance_items for all using (family_id = current_family_id()) with check (family_id = current_family_id());
create policy "shopping all" on shopping_items for all using (family_id = current_family_id()) with check (family_id = current_family_id());
create policy "documents all" on documents for all using (family_id = current_family_id()) with check (family_id = current_family_id());
create policy "inbox all" on inbox_items for all using (family_id = current_family_id()) with check (family_id = current_family_id());

alter publication supabase_realtime add table expenses, reminders, events, maintenance_items, shopping_items, inbox_items;
