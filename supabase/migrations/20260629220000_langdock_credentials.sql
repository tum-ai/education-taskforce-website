create table if not exists public.langdock_credentials (
  id uuid primary key default gen_random_uuid(),
  label text not null check (length(trim(label)) > 0),
  email text not null check (email = lower(email) and position('@' in email) > 1),
  langdock_password text not null check (length(langdock_password) > 0),
  group_label text,
  device_label text,
  login_url text not null default 'https://app.langdock.com/' check (login_url ~ '^https?://'),
  scan_nonce text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists langdock_credentials_email_idx on public.langdock_credentials (email);

alter table public.langdock_credentials enable row level security;

drop policy if exists "langdock_credentials_select_admin" on public.langdock_credentials;
create policy "langdock_credentials_select_admin"
on public.langdock_credentials
for select
to authenticated
using (public.current_user_is_admin());

drop policy if exists "langdock_credentials_insert_admin" on public.langdock_credentials;
create policy "langdock_credentials_insert_admin"
on public.langdock_credentials
for insert
to authenticated
with check (public.current_user_is_admin());

drop policy if exists "langdock_credentials_update_admin" on public.langdock_credentials;
create policy "langdock_credentials_update_admin"
on public.langdock_credentials
for update
to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

drop policy if exists "langdock_credentials_delete_admin" on public.langdock_credentials;
create policy "langdock_credentials_delete_admin"
on public.langdock_credentials
for delete
to authenticated
using (public.current_user_is_admin());
