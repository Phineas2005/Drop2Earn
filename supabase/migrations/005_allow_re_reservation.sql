alter table public.material_reservations
  drop constraint if exists material_reservations_collection_id_key;

create unique index if not exists material_reservations_active_collection_key
on public.material_reservations (collection_id)
where status = 'reserved';
