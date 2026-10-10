create table if not exists public.material_reservations (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null unique references public.collections(id) on delete restrict,
  recycler_id uuid not null references public.profiles(id) on delete restrict,
  status text not null default 'reserved'
    check (status in ('reserved', 'released', 'completed')),
  created_at timestamptz not null default now(),
  released_at timestamptz
);

alter table public.material_reservations enable row level security;

grant select on table public.material_reservations to authenticated;

drop policy if exists "Recyclers view own reservations"
on public.material_reservations;

create policy "Recyclers view own reservations"
on public.material_reservations
for select
to authenticated
using (recycler_id = (select auth.uid()));

create or replace function public.reserve_material(target_collection_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  reservation_id uuid;
begin
  if public.current_user_role() <> 'recycler' then
    raise exception 'Only recycler accounts can reserve material';
  end if;

  if not exists (
    select 1
    from public.collections
    where id = target_collection_id
      and status = 'verified'
  ) then
    raise exception 'This collection is not available for reservation';
  end if;

  insert into public.material_reservations (collection_id, recycler_id)
  values (target_collection_id, (select auth.uid()))
  returning id into reservation_id;

  return reservation_id;
exception
  when unique_violation then
    raise exception 'This material has already been reserved';
end;
$function$;

revoke all on function public.reserve_material(uuid)
from public;

grant execute on function public.reserve_material(uuid)
to authenticated;

create or replace view public.verified_material_supply
as
select
  c.id,
  c.material,
  c.verified_weight,
  c.location,
  c.verified_at
from public.collections c
where c.status = 'verified'
  and not exists (
    select 1
    from public.material_reservations mr
    where mr.collection_id = c.id
      and mr.status = 'reserved'
  );

grant select on table public.verified_material_supply
to authenticated;
