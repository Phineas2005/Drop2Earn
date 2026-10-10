alter table public.collection_points
  add constraint collection_points_location_key unique (location);

drop policy if exists "Admins view all collection points"
on public.collection_points;

create policy "Admins view all collection points"
on public.collection_points
for select
to authenticated
using (public.current_user_role() = 'admin');

drop policy if exists "Admins insert collection points"
on public.collection_points;

create policy "Admins insert collection points"
on public.collection_points
for insert
to authenticated
with check (public.current_user_role() = 'admin');

drop policy if exists "Admins update collection points"
on public.collection_points;

create policy "Admins update collection points"
on public.collection_points
for update
to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

drop policy if exists "Admins view all profiles"
on public.profiles;

create policy "Admins view all profiles"
on public.profiles
for select
to authenticated
using (public.current_user_role() = 'admin');

create or replace function public.admin_assign_verifier(
  target_profile_id uuid,
  target_collection_point_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if public.current_user_role() <> 'admin' then
    raise exception 'Only admins can assign verifiers';
  end if;

  if not exists (
    select 1
    from public.collection_points
    where id = target_collection_point_id
      and is_active = true
  ) then
    raise exception 'The selected collection point is not active';
  end if;

  update public.profiles
  set collection_point_id = target_collection_point_id
  where id = target_profile_id
    and role = 'verifier';

  if not found then
    raise exception 'The selected profile is not a verifier';
  end if;
end;
$function$;

revoke all on function public.admin_assign_verifier(uuid, uuid)
from public;

grant execute on function public.admin_assign_verifier(uuid, uuid)
to authenticated;
