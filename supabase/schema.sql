create extension if not exists pgcrypto;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  external_reference text not null unique,
  mercadopago_preference_id text,
  mercadopago_payment_id text,
  status text not null default 'preference_created',
  status_detail text,
  buyer_name text,
  buyer_email text,
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

create index if not exists orders_status_idx on public.orders(status);
create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists orders_buyer_email_idx on public.orders(buyer_email);

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
