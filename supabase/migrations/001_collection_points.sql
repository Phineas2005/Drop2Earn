create table if not exists public.collection_points (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  location text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists collection_point_id uuid
  references public.collection_points(id) on delete set null;

insert into public.collection_points (name, location)
select seed.name, seed.location
from (
  values
    ('Drop2Earn Hub — Lusaka Central', 'Lusaka Central'),
    ('Drop2Earn Hub — Kalingalinga', 'Kalingalinga'),
    ('Drop2Earn Hub — Chawama', 'Chawama'),
    ('Drop2Earn Hub — Matero', 'Matero')
) as seed(name, location)
where not exists (
  select 1
  from public.collection_points cp
  where cp.location = seed.location
);

update public.collections c
set collection_point_id = cp.id
from public.collection_points cp
where c.collection_point_id is null
  and c.location = cp.location;

alter table public.collection_points enable row level security;

drop policy if exists "Authenticated users view active collection points"
on public.collection_points;

create policy "Authenticated users view active collection points"
on public.collection_points
for select
to authenticated
using (is_active = true);

drop policy if exists "Verifiers view assigned collection point"
on public.collection_points;

create policy "Verifiers view assigned collection point"
on public.collection_points
for select
to authenticated
using (
  id = (
    select collection_point_id
    from public.profiles
    where profiles.id = (select auth.uid())
  )
);

drop policy if exists "Verifiers update pending collections"
on public.collections;

drop policy if exists "Verifiers update assigned collections"
on public.collections;

drop policy if exists "Verifiers view pending collections"
on public.collections;

create policy "Verifiers view assigned collections"
on public.collections
for select
to authenticated
using (
  status = 'pending'
  and (
    public.current_user_role() = 'admin'
    or collection_point_id = (
      select collection_point_id
      from public.profiles
      where profiles.id = (select auth.uid())
    )
  )
);

create policy "Verifiers update assigned collections"
on public.collections
for update
to authenticated
using (
  status = 'pending'
  and (
    public.current_user_role() in ('admin')
    or collection_point_id = (
      select collection_point_id
      from public.profiles
      where profiles.id = (select auth.uid())
    )
  )
)
with check (
  public.current_user_role() in ('admin', 'verifier')
  and status = 'verified'
);
