create table if not exists public.course_notes (
  id uuid primary key default gen_random_uuid(),
  day_number int not null check (day_number between 1 and 5),
  age_group text not null check (age_group in ('younger', 'older')),
  markdown text not null default '',
  updated_by uuid references public.accounts(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (day_number, age_group)
);

create index if not exists course_notes_day_age_idx on public.course_notes (day_number, age_group);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists course_notes_set_updated_at on public.course_notes;
create trigger course_notes_set_updated_at
before update on public.course_notes
for each row
execute function public.set_updated_at();

alter table public.course_notes enable row level security;

drop policy if exists "course_notes_select_admin" on public.course_notes;
create policy "course_notes_select_admin"
on public.course_notes
for select
to authenticated
using (public.current_user_is_admin());

drop policy if exists "course_notes_insert_admin" on public.course_notes;
create policy "course_notes_insert_admin"
on public.course_notes
for insert
to authenticated
with check (public.current_user_is_admin());

drop policy if exists "course_notes_update_admin" on public.course_notes;
create policy "course_notes_update_admin"
on public.course_notes
for update
to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

drop policy if exists "course_notes_delete_admin" on public.course_notes;
create policy "course_notes_delete_admin"
on public.course_notes
for delete
to authenticated
using (public.current_user_is_admin());
