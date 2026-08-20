-- J.R. Enterprises bill documents
-- Apply in the Supabase SQL editor or via supabase db push.

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'document_type') then
    create type document_type as enum ('invoice', 'quotation', 'challan');
  end if;
end
$$;

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  document_number text not null unique,
  document_type document_type not null,
  customer_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.document_items (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  serial_number integer not null,
  description text not null,
  quantity numeric(12, 2) not null,
  unit_price numeric(12, 2) not null,
  total numeric(12, 2) not null,
  created_at timestamptz not null default now()
);

create table if not exists public.document_counters (
  prefix text primary key,
  last_number bigint not null default 0,
  constraint document_counters_prefix_check check (prefix in ('DC', 'QTN'))
);

insert into public.document_counters (prefix, last_number)
values ('DC', 0), ('QTN', 0)
on conflict (prefix) do nothing;

create index if not exists documents_type_idx on public.documents (document_type);
create index if not exists documents_created_at_idx on public.documents (created_at desc);
create index if not exists documents_customer_name_idx on public.documents (customer_name);
create index if not exists document_items_document_id_idx on public.document_items (document_id);

create or replace function public.set_documents_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists documents_set_updated_at on public.documents;
create trigger documents_set_updated_at
before update on public.documents
for each row
execute function public.set_documents_updated_at();

create or replace function public.next_document_number(p_prefix text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  next_value bigint;
begin
  if p_prefix not in ('DC', 'QTN') then
    raise exception 'Invalid document number prefix: %', p_prefix;
  end if;

  insert into public.document_counters as counters (prefix, last_number)
  values (p_prefix, 1)
  on conflict (prefix)
  do update set last_number = counters.last_number + 1
  returning last_number into next_value;

  return p_prefix || '-' || lpad(next_value::text, 5, '0');
end;
$$;

alter table public.documents enable row level security;
alter table public.document_items enable row level security;
alter table public.document_counters enable row level security;

drop policy if exists documents_public_access on public.documents;
create policy documents_public_access
on public.documents
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists document_items_public_access on public.document_items;
create policy document_items_public_access
on public.document_items
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists document_counters_read on public.document_counters;
create policy document_counters_read
on public.document_counters
for select
to anon, authenticated
using (true);

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.documents to anon, authenticated;
grant select, insert, update, delete on public.document_items to anon, authenticated;
grant select on public.document_counters to anon, authenticated;
revoke all on function public.next_document_number(text) from public;
grant execute on function public.next_document_number(text) to anon, authenticated;
