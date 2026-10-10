create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  href text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_recipient_created_idx
  on public.notifications (recipient_id, created_at desc);

alter table public.notifications enable row level security;

drop policy if exists "Users view their notifications" on public.notifications;
create policy "Users view their notifications"
on public.notifications
for select
to authenticated
using (recipient_id = (select auth.uid()));

drop policy if exists "Users update their notifications" on public.notifications;
create policy "Users update their notifications"
on public.notifications
for update
to authenticated
using (recipient_id = (select auth.uid()))
with check (recipient_id = (select auth.uid()));

create or replace function public.get_my_notifications()
returns table (
  id uuid,
  title text,
  message text,
  href text,
  read_at timestamptz,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $function$
  select n.id, n.title, n.message, n.href, n.read_at, n.created_at
  from public.notifications n
  where n.recipient_id = (select auth.uid())
  order by n.created_at desc
  limit 30;
$function$;

create or replace function public.mark_notification_read(target_notification_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
begin
  update public.notifications
  set read_at = coalesce(read_at, now())
  where id = target_notification_id
    and recipient_id = (select auth.uid());
end;
$function$;

revoke all on table public.notifications from public;
grant select, update on table public.notifications to authenticated;
revoke all on function public.get_my_notifications() from public;
grant execute on function public.get_my_notifications() to authenticated;
revoke all on function public.mark_notification_read(uuid) from public;
grant execute on function public.mark_notification_read(uuid) to authenticated;

create or replace function public.notify_collection_transition()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  collector_name text;
begin
  if new.status = 'verified' and old.status is distinct from new.status then
    insert into public.notifications (recipient_id, title, message, href)
    values (
      new.collector_id,
      'Collection verified',
      format('%s has been verified at %s. Your earnings are now calculated.', new.material, coalesce(new.location, 'the collection point')),
      '/dashboard'
    );
  end if;

  if new.payout_status = 'paid' and old.payout_status is distinct from new.payout_status then
    insert into public.notifications (recipient_id, title, message, href)
    values (
      new.collector_id,
      'Payout marked as paid',
      format('Your K%s payout for %s has been marked as paid.', to_char(coalesce(new.earnings, 0), 'FM999999990.00'), new.material),
      '/dashboard'
    );
  end if;

  return new;
end;
$function$;

drop trigger if exists collections_notification_trigger on public.collections;
create trigger collections_notification_trigger
after update of status, payout_status on public.collections
for each row execute function public.notify_collection_transition();

create or replace function public.notify_reservation_transition()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  admin_id uuid;
  collection_owner uuid;
begin
  if new.status = 'pickup_requested' and old.status is distinct from new.status then
    for admin_id in
      select id from public.profiles where role = 'admin'
    loop
      insert into public.notifications (recipient_id, title, message, href)
      values (
        admin_id,
        'Pickup request received',
        'A recycler has requested pickup confirmation for verified material.',
        '/admin'
      );
    end loop;
  end if;

  if new.status = 'completed' and old.status is distinct from new.status then
    select c.collector_id into collection_owner
    from public.collections c
    where c.id = new.collection_id;

    insert into public.notifications (recipient_id, title, message, href)
    values (
      new.recycler_id,
      'Material handoff completed',
      'An admin confirmed your material handoff.',
      '/recycler'
    );

    if collection_owner is not null then
      insert into public.notifications (recipient_id, title, message, href)
      values (
        collection_owner,
        'Collection handoff completed',
        'Your verified material has completed the recycling handoff.',
        '/dashboard'
      );
    end if;
  end if;

  return new;
end;
$function$;

drop trigger if exists reservations_notification_trigger on public.material_reservations;
create trigger reservations_notification_trigger
after update of status on public.material_reservations
for each row execute function public.notify_reservation_transition();
