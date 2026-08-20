-- Standalone line-item descriptions. Names are copied onto document items as text only.

create table if not exists public.descriptions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint descriptions_name_not_blank check (char_length(trim(name)) > 0)
);

create unique index if not exists descriptions_name_lower_unique
  on public.descriptions (lower(trim(name)));

create index if not exists descriptions_name_idx on public.descriptions (name);

create or replace function public.set_descriptions_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  new.name = trim(new.name);
  return new;
end;
$$;

drop trigger if exists descriptions_set_updated_at on public.descriptions;
create trigger descriptions_set_updated_at
before insert or update on public.descriptions
for each row
execute function public.set_descriptions_updated_at();

alter table public.descriptions enable row level security;

drop policy if exists descriptions_public_access on public.descriptions;
create policy descriptions_public_access
on public.descriptions
for all
to anon, authenticated
using (true)
with check (true);

grant select, insert, update, delete on public.descriptions to anon, authenticated;

insert into public.descriptions (name)
select min(trim(i.description))
from public.document_items i
where char_length(trim(i.description)) > 0
  and not exists (
    select 1
    from public.descriptions d
    where lower(d.name) = lower(trim(i.description))
  )
group by lower(trim(i.description));
