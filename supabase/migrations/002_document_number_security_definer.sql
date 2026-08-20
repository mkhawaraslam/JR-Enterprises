-- Allow document number generation through RPC without exposing counter writes to the client.

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

revoke all on function public.next_document_number(text) from public;
grant execute on function public.next_document_number(text) to anon, authenticated;
