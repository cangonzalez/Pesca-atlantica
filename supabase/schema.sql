create extension if not exists pgcrypto;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  external_reference text not null unique,
  mercadopago_preference_id text,
  mercadopago_payment_id text,
  status text not null default 'preference_created',
  status_detail text,
  buyer_user_id uuid references auth.users(id) on delete set null,
  buyer_name text,
  buyer_email text,
  buyer_phone text,
  delivery_address text,
  delivery_notes text,
  currency text not null default 'ARS',
  total_amount numeric(12, 2) not null default 0,
  items jsonb not null default '[]'::jsonb,
  payment_method_id text,
  payment_type_id text,
  raw_payment jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders enable row level security;

grant usage on schema public to service_role;
grant select, insert, update on public.orders to service_role;
grant select on public.orders to authenticated;

alter table public.orders add column if not exists buyer_user_id uuid references auth.users(id) on delete set null;
alter table public.orders add column if not exists buyer_phone text;
alter table public.orders add column if not exists delivery_address text;
alter table public.orders add column if not exists delivery_notes text;

create index if not exists orders_status_idx on public.orders(status);
create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists orders_buyer_email_idx on public.orders(buyer_email);
create index if not exists orders_buyer_user_id_idx on public.orders(buyer_user_id);

drop policy if exists "Users can read their own orders" on public.orders;
create policy "Users can read their own orders"
on public.orders
for select
to authenticated
using (auth.uid() = buyer_user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
before update on public.orders
for each row
execute function public.set_updated_at();
