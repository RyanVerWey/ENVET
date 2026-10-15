-- Run after applying the M6 migration to an isolated Supabase test database.
-- This read-only check does not create users or grant staff membership.
do $$
declare rel text;
begin
  foreach rel in array array[
    'public.horses','public.services','public.article_likes','public.comments',
    'public.comment_reports','private.staff_members','private.inquiries',
    'private.daily_page_counts','private.rate_buckets','private.staff_audit'
  ] loop
    if not (select c.relrowsecurity from pg_class c where c.oid = rel::regclass) then
      raise exception 'RLS missing on %', rel;
    end if;
  end loop;
  if has_schema_privilege('anon','private','USAGE') or
     has_schema_privilege('authenticated','private','USAGE') then
    raise exception 'private schema exposed';
  end if;
  if has_table_privilege('anon','private.inquiries','SELECT') or
     has_table_privilege('authenticated','private.inquiries','SELECT') or
     has_table_privilege('anon','private.daily_page_counts','SELECT') or
     has_table_privilege('authenticated','private.staff_members','INSERT') or
     has_table_privilege('authenticated','public.comments','INSERT') or
     has_table_privilege('authenticated','public.article_likes','INSERT') or
     has_table_privilege('anon','public.comments','SELECT') then
    raise exception 'unexpected table grant';
  end if;
  if has_function_privilege('anon',
       'public.submit_inquiry(text,text,text,text,text,boolean,text,text)','EXECUTE') or
     has_function_privilege('authenticated',
       'public.staff_save_content(uuid,text,text,text,text,text,text,integer)','EXECUTE') then
    raise exception 'service RPC exposed';
  end if;
  if not has_table_privilege('anon','public.horses','SELECT') or
     not has_table_privilege('anon','public.services','SELECT') then
    raise exception 'published content unreadable';
  end if;
  if exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
             where n.nspname = 'public' and p.proname in
               ('submit_inquiry','record_page_count','staff_save_content') and p.prosecdef) then
    raise exception 'exposed SECURITY DEFINER function';
  end if;
end;
$$;
