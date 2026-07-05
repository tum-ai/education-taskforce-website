begin;

select plan(26);

select has_table('public', 'accounts', 'accounts table exists');
select has_table('public', 'day_uploads', 'day_uploads table exists');
select has_table('public', 'participant_credentials', 'participant credentials table exists');
select has_table('public', 'langdock_credentials', 'langdock credentials table exists');
select has_table('public', 'lovable_credentials', 'lovable credentials table exists');
select has_table('public', 'course_notes', 'course notes table exists');
select ok(
  exists (
    select 1
    from pg_constraint
    where conrelid = 'public.accounts'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) like '%admin%'
      and pg_get_constraintdef(oid) like '%participant%'
  ),
  'accounts role has a check constraint'
);
select ok(
  exists (
    select 1
    from pg_constraint
    where conrelid = 'public.day_uploads'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) like '%day_number%'
      and pg_get_constraintdef(oid) like '%5%'
  ),
  'day uploads day number has a check constraint'
);
select ok(
  exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'accounts'
  ),
  'accounts table has RLS policies'
);
select ok(
  exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'day_uploads'
  ),
  'day_uploads table has RLS policies'
);
select ok(
  exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'participant_credentials'
  ),
  'participant_credentials table has RLS policies'
);
select ok(
  exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'langdock_credentials'
  ),
  'langdock_credentials table has RLS policies'
);
select is(
  (select rowsecurity from pg_tables where schemaname = 'public' and tablename = 'accounts'),
  true,
  'accounts RLS is enabled'
);
select is(
  (select rowsecurity from pg_tables where schemaname = 'public' and tablename = 'day_uploads'),
  true,
  'day_uploads RLS is enabled'
);
select is(
  (select rowsecurity from pg_tables where schemaname = 'public' and tablename = 'participant_credentials'),
  true,
  'participant_credentials RLS is enabled'
);
select is(
  (select rowsecurity from pg_tables where schemaname = 'public' and tablename = 'langdock_credentials'),
  true,
  'langdock_credentials RLS is enabled'
);
select is(
  (select rowsecurity from pg_tables where schemaname = 'public' and tablename = 'lovable_credentials'),
  true,
  'lovable_credentials RLS is enabled'
);
select is(
  (select rowsecurity from pg_tables where schemaname = 'public' and tablename = 'course_notes'),
  true,
  'course_notes RLS is enabled'
);
-- Admin-only access: every command must have a policy gated on current_user_is_admin().
-- coalesce(qual, with_check) covers INSERT policies, which only set with_check.
select is(
  (
    select count(distinct cmd)
    from pg_policies
    where schemaname = 'public'
      and tablename = 'lovable_credentials'
      and coalesce(qual, with_check) like '%current_user_is_admin%'
  ),
  4::bigint,
  'lovable_credentials has admin-gated policies for select/insert/update/delete'
);
select is(
  (
    select count(distinct cmd)
    from pg_policies
    where schemaname = 'public'
      and tablename = 'course_notes'
      and coalesce(qual, with_check) like '%current_user_is_admin%'
  ),
  4::bigint,
  'course_notes has admin-gated policies for select/insert/update/delete'
);
-- No policy (including any future anon policy) may grant access without the admin check.
select is(
  (
    select count(*)
    from pg_policies
    where schemaname = 'public'
      and tablename = 'lovable_credentials'
      and coalesce(qual, with_check) not like '%current_user_is_admin%'
  ),
  0::bigint,
  'lovable_credentials has no policies that bypass the admin check'
);
select is(
  (
    select count(*)
    from pg_policies
    where schemaname = 'public'
      and tablename = 'course_notes'
      and coalesce(qual, with_check) not like '%current_user_is_admin%'
  ),
  0::bigint,
  'course_notes has no policies that bypass the admin check'
);
select is(
  (select public from storage.buckets where id = 'participant-uploads'),
  false,
  'participant-uploads bucket is private'
);
select is(
  (select file_size_limit from storage.buckets where id = 'participant-uploads'),
  52428800::bigint,
  'participant-uploads bucket has the configured file size limit'
);
select has_function('public', 'current_user_role', array[]::text[], 'current_user_role helper exists');
select has_function('public', 'current_user_is_admin', array[]::text[], 'current_user_is_admin helper exists');

select * from finish();

rollback;
