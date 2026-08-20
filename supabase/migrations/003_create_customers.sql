-- Standalone customer directory. Names are copied onto documents as text only
-- (no foreign key between customers and documents).

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint customers_name_not_blank check (char_length(trim(name)) > 0)
);

create unique index if not exists customers_name_lower_unique
  on public.customers (lower(trim(name)));

create index if not exists customers_name_idx on public.customers (name);

create or replace function public.set_customers_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  new.name = trim(new.name);
  return new;
end;
$$;

drop trigger if exists customers_set_updated_at on public.customers;
create trigger customers_set_updated_at
before insert or update on public.customers
for each row
execute function public.set_customers_updated_at();

alter table public.customers enable row level security;

drop policy if exists customers_public_access on public.customers;
create policy customers_public_access
on public.customers
for all
to anon, authenticated
using (true)
with check (true);

grant select, insert, update, delete on public.customers to anon, authenticated;

-- Seed from existing document customer names (no link is created).
insert into public.customers (name)
select distinct trim(d.customer_name)
from public.documents d
where char_length(trim(d.customer_name)) > 0
  and not exists (
    select 1
    from public.customers c
    where lower(c.name) = lower(trim(d.customer_name))
  );
