drop policy if exists "Verifiers update assigned collections"
on public.collections;

create policy "Verifiers update assigned collections"
on public.collections
for update
to authenticated
using (
  status = 'pending'
  and (
    public.current_user_role() in ('admin', 'verifier')
    and (
      public.current_user_role() = 'admin'
      or collection_point_id = (
        select collection_point_id
        from public.profiles
        where profiles.id = (select auth.uid())
      )
    )
  )
)
with check (
  public.current_user_role() in ('admin', 'verifier')
  and status = 'verified'
);
