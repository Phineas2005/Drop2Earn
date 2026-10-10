create or replace function public.get_admin_users()
returns table (
  id uuid,
  full_name text,
  phone text,
  role text,
  collection_point_id uuid
)
language sql
stable
security definer
set search_path = ''
as $function$
  select
    p.id,
    p.full_name,
    p.phone,
    p.role,
    p.collection_point_id
  from public.profiles p
  where public.current_user_role() = 'admin'
  order by p.full_name nulls last;
$function$;

create or replace function public.admin_update_user_role(
  target_profile_id uuid,
  target_role text,
  target_collection_point_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if public.current_user_role() <> 'admin' then
    raise exception 'Only admins can manage user roles';
  end if;

  if target_profile_id = (select auth.uid()) then
    raise exception 'You cannot change your own role';
  end if;

  if target_role not in ('collector', 'recycler', 'verifier', 'admin') then
    raise exception 'Invalid user role';
  end if;

  if target_role = 'verifier' and target_collection_point_id is null then
    raise exception 'A verifier must be assigned to a collection point';
  end if;

  if not exists (
    select 1
    from public.profiles
    where id = target_profile_id
  ) then
    raise exception 'User profile not found';
  end if;

  update public.profiles
  set role = target_role,
      collection_point_id = case
        when target_role = 'verifier' then target_collection_point_id
        else null
      end
  where id = target_profile_id;
end;
$function$;

revoke all on function public.get_admin_users() from public;
grant execute on function public.get_admin_users() to authenticated;
revoke all on function public.admin_update_user_role(uuid, text, uuid) from public;
grant execute on function public.admin_update_user_role(uuid, text, uuid) to authenticated;
