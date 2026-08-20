-- Start document numbers at 2000 (next issued = 2000 when counter is 1999).
-- Only raises counters that have not already passed 1999.

update public.document_counters
set last_number = 1999
where last_number < 1999;

insert into public.document_counters (prefix, last_number)
values ('DC', 1999), ('QTN', 1999)
on conflict (prefix) do nothing;

-- If a counter row is missing at runtime, the first number issued should be 2000.
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
  values (p_prefix, 2000)
  on conflict (prefix)
  do update set last_number = counters.last_number + 1
  returning last_number into next_value;

  return p_prefix || '-' || lpad(next_value::text, 5, '0');
end;
$$;

revoke all on function public.next_document_number(text) from public;
grant execute on function public.next_document_number(text) to anon, authenticated;
