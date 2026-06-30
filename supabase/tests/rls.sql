begin;

select plan(18);

select has_table('public', 'accounts', 'accounts table exists');
select has_table('public', 'day_uploads', 'day_uploads table exists');
select has_table('public', 'participant_credentials', 'participant credentials table exists');
select has_table('public', 'langdock_credentials', 'langdock credentials table exists');
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
