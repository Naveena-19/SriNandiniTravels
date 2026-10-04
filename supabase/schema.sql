-- Production schema for Sri Nandini Travels

create table if not exists drivers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  driver_id text unique not null,
  password_hash text,
  phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists trips (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone text not null,
  pickup text not null,
  destination text not null,
  trip_date date not null,
  car_type text not null,
  status text not null default 'new',
  notes text,
  source text not null default 'website',
  assigned_driver_id uuid references drivers(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists trips_trip_date_idx on trips(trip_date);
create index if not exists trips_status_idx on trips(status);

-- Example row statuses:
-- new, upcoming, active, completed, cancelled, call-only

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  pickup text not null,
  destination text not null,
  travel_date date not null,
  car_type text not null,
  notes text,
  created_at timestamptz not null default now()
);

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trips_updated_at on trips;
create trigger trips_updated_at
before update on trips
for each row
execute function update_updated_at();

-- RLS example
-- Enable Row Level Security for production systems.
-- alter table trips enable row level security;
-- alter table drivers enable row level security;
-- alter table bookings enable row level security;

-- Example policies:
-- create policy "Driver can view assigned trips" on trips for select using (assigned_driver_id = auth.uid());
-- create policy "Owner can manage all trips" on trips for all using (auth.jwt()->>'role' = 'admin');
