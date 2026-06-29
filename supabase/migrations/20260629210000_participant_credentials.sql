create table if not exists public.participant_credentials (
  account_id uuid primary key references public.accounts(id) on delete cascade,
  temporary_password text not null,
  updated_at timestamptz not null default now()
);

alter table public.participant_credentials enable row level security;

drop policy if exists "participant_credentials_select_admin" on public.participant_credentials;
create policy "participant_credentials_select_admin"
on public.participant_credentials
for select
to authenticated
using (public.current_user_is_admin());

drop policy if exists "participant_credentials_insert_admin" on public.participant_credentials;
create policy "participant_credentials_insert_admin"
on public.participant_credentials
for insert
to authenticated
with check (public.current_user_is_admin());

drop policy if exists "participant_credentials_update_admin" on public.participant_credentials;
create policy "participant_credentials_update_admin"
on public.participant_credentials
for update
to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

drop policy if exists "participant_credentials_delete_admin" on public.participant_credentials;
create policy "participant_credentials_delete_admin"
on public.participant_credentials
for delete
to authenticated
using (public.current_user_is_admin());
