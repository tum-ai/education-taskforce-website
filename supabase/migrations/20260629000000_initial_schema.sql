create extension if not exists pgcrypto;

create table if not exists public.accounts (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text not null,
  role text not null check (role in ('admin', 'participant')),
  created_at timestamptz not null default now()
);

create table if not exists public.day_uploads (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  day_number int not null check (day_number between 1 and 5),
  title text not null,
  file_type text not null check (file_type in ('image', 'html', 'pdf', 'document', 'other')),
  storage_path text not null,
  original_filename text not null,
  content_type text not null,
  file_size_bytes int not null,
  created_at timestamptz not null default now()
);

create unique index if not exists accounts_username_lower_idx on public.accounts (lower(username));
create index if not exists day_uploads_account_day_idx on public.day_uploads (account_id, day_number, created_at);

alter table public.accounts enable row level security;
alter table public.day_uploads enable row level security;

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.accounts where id = auth.uid()
$$;

create or replace function public.current_user_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() = 'admin', false)
$$;

grant execute on function public.current_user_role() to authenticated;
grant execute on function public.current_user_is_admin() to authenticated;

drop policy if exists "accounts_select_own_or_admin" on public.accounts;
create policy "accounts_select_own_or_admin"
on public.accounts
for select
to authenticated
using (id = auth.uid() or public.current_user_is_admin());

drop policy if exists "day_uploads_select_own_or_admin" on public.day_uploads;
create policy "day_uploads_select_own_or_admin"
on public.day_uploads
for select
to authenticated
using (account_id = auth.uid() or public.current_user_is_admin());

drop policy if exists "day_uploads_insert_admin" on public.day_uploads;
create policy "day_uploads_insert_admin"
on public.day_uploads
for insert
to authenticated
with check (public.current_user_is_admin());

drop policy if exists "day_uploads_update_admin" on public.day_uploads;
create policy "day_uploads_update_admin"
on public.day_uploads
for update
to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

drop policy if exists "day_uploads_delete_admin" on public.day_uploads;
create policy "day_uploads_delete_admin"
on public.day_uploads
for delete
to authenticated
using (public.current_user_is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('participant-uploads', 'participant-uploads', false, 52428800, null)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "participant_uploads_select_authorized" on storage.objects;
create policy "participant_uploads_select_authorized"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'participant-uploads'
  and (
    public.current_user_is_admin()
    or (
      (storage.foldername(name))[1] = 'accounts'
      and (storage.foldername(name))[2] = auth.uid()::text
      and exists (
        select 1
        from public.day_uploads uploads
        where uploads.account_id = auth.uid()
          and uploads.storage_path = storage.objects.name
      )
    )
  )
);

drop policy if exists "participant_uploads_insert_admin" on storage.objects;
create policy "participant_uploads_insert_admin"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'participant-uploads'
  and public.current_user_is_admin()
);

drop policy if exists "participant_uploads_update_admin" on storage.objects;
create policy "participant_uploads_update_admin"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'participant-uploads'
  and public.current_user_is_admin()
)
with check (
  bucket_id = 'participant-uploads'
  and public.current_user_is_admin()
);

drop policy if exists "participant_uploads_delete_admin" on storage.objects;
create policy "participant_uploads_delete_admin"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'participant-uploads'
  and public.current_user_is_admin()
);
