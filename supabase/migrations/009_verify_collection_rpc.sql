create or replace function public.verify_collection(
  target_collection_id uuid,
  target_verified_weight numeric,
  target_rate_per_kg numeric
)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
declare
  actor_role text;
  actor_collection_point_id uuid;
  target_collection_point_id uuid;
begin
  select p.role, p.collection_point_id
  into actor_role, actor_collection_point_id
  from public.profiles p
  where p.id = (select auth.uid());

  if actor_role not in ('admin', 'verifier') then
    raise exception 'Only verifiers and admins can verify collections';
  end if;

  if target_verified_weight <= 0 or target_rate_per_kg < 0 then
    raise exception 'Verified weight and payout rate must be valid';
  end if;

  select c.collection_point_id
  into target_collection_point_id
  from public.collections c
  where c.id = target_collection_id
    and c.status = 'pending';

  if not found then
    raise exception 'Collection is not pending or does not exist';
  end if;

  if actor_role = 'verifier'
     and actor_collection_point_id is distinct from target_collection_point_id then
    raise exception 'You can only verify collections at your assigned collection point';
  end if;

  update public.collections
  set verified_weight = target_verified_weight,
      rate_per_kg = target_rate_per_kg,
      status = 'verified',
      verified_by = (select auth.uid()),
      verified_at = now()
  where id = target_collection_id
    and status = 'pending';

  if not found then
    raise exception 'Collection could not be verified';
  end if;
end;
$function$;

revoke all on function public.verify_collection(uuid, numeric, numeric) from public;
grant execute on function public.verify_collection(uuid, numeric, numeric) to authenticated;
