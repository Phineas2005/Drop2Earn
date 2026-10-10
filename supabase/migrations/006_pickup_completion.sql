alter table public.material_reservations
  drop constraint if exists material_reservations_status_check;

alter table public.material_reservations
  add constraint material_reservations_status_check
  check (status in ('reserved', 'pickup_requested', 'released', 'completed'));

create or replace function public.request_material_pickup(
  target_reservation_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if public.current_user_role() <> 'recycler' then
    raise exception 'Only recycler accounts can request pickup';
  end if;

  update public.material_reservations
  set status = 'pickup_requested'
  where id = target_reservation_id
    and recycler_id = (select auth.uid())
    and status = 'reserved';

  if not found then
    raise exception 'Reservation not found or not available for pickup request';
  end if;
end;
$function$;

create or replace function public.get_admin_reservations()
returns table (
  id uuid,
  collection_id uuid,
  recycler_name text,
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
    p.full_name,
    c.material,
    c.verified_weight,
    c.location,
    mr.status,
    mr.created_at
  from public.material_reservations mr
  join public.collections c on c.id = mr.collection_id
  join public.profiles p on p.id = mr.recycler_id
  where public.current_user_role() = 'admin'
  order by mr.created_at desc;
$function$;

create or replace function public.complete_material_reservation(
  target_reservation_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if public.current_user_role() <> 'admin' then
    raise exception 'Only admins can complete reservations';
  end if;

  update public.material_reservations
  set status = 'completed'
  where id = target_reservation_id
    and status = 'pickup_requested';

  if not found then
    raise exception 'Reservation is not awaiting pickup confirmation';
  end if;
end;
$function$;

revoke all on function public.request_material_pickup(uuid) from public;
grant execute on function public.request_material_pickup(uuid) to authenticated;
revoke all on function public.get_admin_reservations() from public;
grant execute on function public.get_admin_reservations() to authenticated;
revoke all on function public.complete_material_reservation(uuid) from public;
grant execute on function public.complete_material_reservation(uuid) to authenticated;
