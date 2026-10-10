create or replace function public.get_admin_payouts()
returns table (
  id uuid,
  collector_name text,
  material text,
  verified_weight numeric,
  earnings numeric,
  payout_status text,
  verified_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $function$
  select
    c.id,
    p.full_name,
    c.material,
    c.verified_weight,
    c.earnings,
    c.payout_status,
    c.verified_at
  from public.collections c
  join public.profiles p on p.id = c.collector_id
  where public.current_user_role() = 'admin'
    and c.status = 'verified'
    and (
      c.payout_status = 'paid'
      or exists (
        select 1
        from public.material_reservations mr
        where mr.collection_id = c.id
          and mr.status = 'completed'
      )
    )
  order by c.verified_at desc;
$function$;

create or replace function public.mark_collection_paid(
  target_collection_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if public.current_user_role() <> 'admin' then
    raise exception 'Only admins can mark payouts as paid';
  end if;

  update public.collections
  set payout_status = 'paid', paid_at = now()
  where id = target_collection_id
    and status = 'verified'
    and payout_status = 'pending'
    and exists (
      select 1
      from public.material_reservations mr
      where mr.collection_id = public.collections.id
        and mr.status = 'completed'
    );

  if not found then
    raise exception 'A completed material handoff is required before payout';
  end if;
end;
$function$;

revoke all on function public.get_admin_payouts() from public;
grant execute on function public.get_admin_payouts() to authenticated;
revoke all on function public.mark_collection_paid(uuid) from public;
grant execute on function public.mark_collection_paid(uuid) to authenticated;
