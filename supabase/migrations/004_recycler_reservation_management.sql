create or replace function public.get_my_reservations()
returns table (
  id uuid,
  collection_id uuid,
  material text,
  verified_weight numeric,
  location text,
  status text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $function$
  select
    mr.id,
    mr.collection_id,
    c.material,
    c.verified_weight,
    c.location,
    mr.status,
    mr.created_at
  from public.material_reservations mr
  join public.collections c on c.id = mr.collection_id
  where mr.recycler_id = (select auth.uid())
  order by mr.created_at desc;
$function$;

create or replace function public.release_material_reservation(
  target_reservation_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if public.current_user_role() <> 'recycler' then
    raise exception 'Only recycler accounts can release reservations';
  end if;

  update public.material_reservations
  set
    status = 'released',
    released_at = now()
  where id = target_reservation_id
    and recycler_id = (select auth.uid())
    and status = 'reserved';

  if not found then
    raise exception 'Reservation not found or already released';
  end if;
end;
$function$;

revoke all on function public.get_my_reservations()
from public;

grant execute on function public.get_my_reservations()
to authenticated;

revoke all on function public.release_material_reservation(uuid)
from public;

grant execute on function public.release_material_reservation(uuid)
to authenticated;
