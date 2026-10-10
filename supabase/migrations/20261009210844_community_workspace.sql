-- ENVET M6. Apply only after review; no real member or staff records are seeded.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to service_role;

create table private.staff_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  granted_at timestamptz not null default now()
);

create table public.horses (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (char_length(btrim(name)) between 2 and 100),
  summary text not null check (char_length(btrim(summary)) between 10 and 700),
  details text not null default '' check (char_length(details) <= 2000),
  state text not null default 'draft' check (state in ('draft','published','archived')),
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.services (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(btrim(title)) between 2 and 100),
  summary text not null check (char_length(btrim(summary)) between 10 and 700),
  details text not null default '' check (char_length(details) <= 2000),
  state text not null default 'draft' check (state in ('draft','published','archived')),
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.article_likes (
  article_slug text not null check (article_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (article_slug, user_id)
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  article_slug text not null check (article_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  author_id uuid not null references auth.users(id) on delete cascade,
  author_label text not null default 'Community member' check (author_label = 'Community member'),
  body text not null check (char_length(btrim(body)) between 2 and 2000),
  state text not null default 'published' check (state in ('published','hidden')),
  created_at timestamptz not null default now()
);
create index comments_article_published_order on public.comments (article_slug, created_at desc, id desc) where state = 'published';

create table public.comment_reports (
  comment_id uuid not null references public.comments(id) on delete cascade,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  reason text not null check (reason in ('spam','privacy','harmful','other')),
  created_at timestamptz not null default now(),
  primary key (comment_id, reporter_id)
);

create table private.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 2 and 100),
  email text check (email is null or char_length(email) <= 254),
  phone text check (phone is null or char_length(phone) <= 30),
  service_interest text not null check (char_length(btrim(service_interest)) between 2 and 100),
  note text not null default '' check (char_length(note) <= 500),
  consent_at timestamptz not null,
  status text not null default 'new' check (status in ('new','contacted','booked','closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint inquiry_contact_required check (email is not null or phone is not null),
  constraint inquiry_email_format check (email is null or email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  constraint inquiry_phone_format check (phone is null or phone ~ '^[+() .0-9-]{7,30}$')
);
create index inquiries_status_created on private.inquiries (status, created_at desc);

create table private.daily_page_counts (
  day date not null,
  path text not null check (char_length(path) between 1 and 200),
  views bigint not null default 0 check (views >= 0),
  primary key (day, path)
);

create table private.rate_buckets (
  scope text not null,
  key_hash text not null,
  window_start timestamptz not null,
  used integer not null default 1 check (used > 0),
  expires_at timestamptz not null,
  primary key (scope, key_hash, window_start)
);
create index rate_buckets_expiry on private.rate_buckets (expires_at);

create table private.staff_audit (
  id bigint generated always as identity primary key,
  actor_id uuid not null,
  action text not null,
  target_type text not null,
  target_key text not null,
  occurred_at timestamptz not null default now()
);
create index staff_audit_occurred on private.staff_audit (occurred_at);

alter table private.staff_members enable row level security;
alter table private.inquiries enable row level security;
alter table private.daily_page_counts enable row level security;
alter table private.rate_buckets enable row level security;
alter table private.staff_audit enable row level security;
alter table public.horses enable row level security;
alter table public.services enable row level security;
alter table public.article_likes enable row level security;
alter table public.comments enable row level security;
alter table public.comment_reports enable row level security;

revoke all on table private.staff_members, private.inquiries, private.daily_page_counts, private.rate_buckets, private.staff_audit from public, anon, authenticated;
revoke all on table public.horses, public.services, public.article_likes, public.comments, public.comment_reports from public, anon, authenticated;
grant select on table public.horses, public.services to anon, authenticated;
grant all on table private.staff_members, private.inquiries, private.daily_page_counts, private.rate_buckets, private.staff_audit to service_role;
grant all on table public.horses, public.services, public.article_likes, public.comments, public.comment_reports to service_role;
grant usage, select on sequence private.staff_audit_id_seq to service_role;

create policy horses_public_read on public.horses for select to anon, authenticated using (state = 'published');
create policy services_public_read on public.services for select to anon, authenticated using (state = 'published');

-- Only a signed-in user's actual UUID may be manually inserted into staff_members.
-- Operator must first verify auth.users.email_confirmed_at and the linked
-- auth.identities provider='google' verified provider email for each named admin.
-- There is deliberately no email-triggered promotion or public membership RPC.

create function private.assert_staff(p_actor uuid)
returns void language plpgsql security invoker set search_path = '' as $$
begin
  if p_actor is null or not exists (
    select 1 from private.staff_members where user_id = p_actor for key share
  ) then
    raise exception 'staff access denied' using errcode = '42501';
  end if;
end;
$$;

create function private.take_rate(p_scope text, p_key_hash text, p_limit integer, p_window_seconds integer)
returns void language plpgsql security invoker set search_path = '' as $$
declare
  bucket_start timestamptz;
  accepted integer;
begin
  if p_scope is null or p_key_hash is null or p_key_hash !~ '^[0-9a-f]{64}$' or
     p_limit is null or p_limit < 1 or p_window_seconds is null or p_window_seconds < 60 then
    raise exception 'invalid rate bucket' using errcode = '22023';
  end if;
  bucket_start := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  -- Each request prunes expired hashed buckets. No raw address is stored.
  delete from private.rate_buckets where expires_at < now();
  insert into private.rate_buckets (scope, key_hash, window_start, used, expires_at)
  values (p_scope, p_key_hash, bucket_start, 1, bucket_start + make_interval(secs => p_window_seconds + 3600))
  on conflict (scope, key_hash, window_start) do update
    set used = private.rate_buckets.used + 1
    where private.rate_buckets.used < p_limit
  returning used into accepted;
  if accepted is null then
    raise exception 'rate limited' using errcode = 'P0001';
  end if;
end;
$$;

create function public.submit_inquiry(
  p_name text, p_email text, p_phone text, p_service_interest text,
  p_note text, p_consent boolean, p_contact_key text, p_global_key text
) returns uuid language plpgsql security invoker set search_path = '' as $$
declare new_id uuid;
begin
  if p_consent is distinct from true then
    raise exception 'contact permission required' using errcode = '22023';
  end if;
  perform private.take_rate('inquiry-contact', p_contact_key, 3, 86400);
  perform private.take_rate('inquiry-global', p_global_key, 200, 3600);
  insert into private.inquiries (name, email, phone, service_interest, note, consent_at)
  values (btrim(p_name), nullif(lower(btrim(p_email)), ''), nullif(btrim(p_phone), ''), btrim(p_service_interest), coalesce(btrim(p_note), ''), now())
  returning id into new_id;
  return new_id;
end;
$$;

create function public.record_page_count(p_path text, p_rate_key text)
returns void language plpgsql security invoker set search_path = '' as $$
begin
  if p_path is null or p_path !~ '^/[a-z0-9/-]*$' or char_length(p_path) > 200 then
    raise exception 'invalid public path' using errcode = '22023';
  end if;
  perform private.take_rate('page-hour', p_rate_key, 10000, 3600);
  insert into private.daily_page_counts (day, path, views)
  values ((now() at time zone 'UTC')::date, p_path, 1)
  on conflict (day, path) do update set views = private.daily_page_counts.views + 1;
end;
$$;

create function public.add_article_like(p_slug text, p_actor uuid, p_rate_key text)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare inserted integer;
begin
  if p_actor is null or p_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then
    raise exception 'invalid like' using errcode = '22023';
  end if;
  if exists (select 1 from public.article_likes where article_slug = p_slug and user_id = p_actor) then return false; end if;
  perform private.take_rate('like-member', p_rate_key, 30, 3600);
  insert into public.article_likes (article_slug, user_id) values (p_slug, p_actor)
    on conflict do nothing;
  get diagnostics inserted = row_count;
  return inserted = 1;
end;
$$;

create function public.remove_article_like(p_slug text, p_actor uuid)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare removed integer;
begin
  delete from public.article_likes where article_slug = p_slug and user_id = p_actor;
  get diagnostics removed = row_count;
  return removed = 1;
end;
$$;

create function public.create_comment(p_slug text, p_actor uuid, p_body text, p_rate_key text)
returns uuid language plpgsql security invoker set search_path = '' as $$
declare new_id uuid;
begin
  if p_actor is null or p_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' or
     p_body is null or char_length(btrim(p_body)) not between 2 and 2000 then
    raise exception 'invalid comment' using errcode = '22023';
  end if;
  perform private.take_rate('comment-member', p_rate_key, 5, 3600);
  insert into public.comments (article_slug, author_id, body)
  values (p_slug, p_actor, btrim(p_body)) returning id into new_id;
  return new_id;
end;
$$;

create function public.remove_comment(p_id uuid, p_actor uuid)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare removed integer;
begin
  delete from public.comments where id = p_id and author_id = p_actor;
  get diagnostics removed = row_count;
  return removed = 1;
end;
$$;

create function public.report_comment(p_id uuid, p_actor uuid, p_reason text, p_rate_key text)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare inserted integer;
begin
  if p_actor is null or p_reason not in ('spam','privacy','harmful','other') or
     not exists (select 1 from public.comments where id = p_id and state = 'published') then
    raise exception 'invalid report' using errcode = '22023';
  end if;
  if exists (select 1 from public.comment_reports where comment_id = p_id and reporter_id = p_actor) then return false; end if;
  perform private.take_rate('report-member', p_rate_key, 10, 86400);
  insert into public.comment_reports (comment_id, reporter_id, reason)
  values (p_id, p_actor, p_reason) on conflict do nothing;
  get diagnostics inserted = row_count;
  return inserted = 1;
end;
$$;

create function public.staff_save_content(
  p_actor uuid, p_kind text, p_slug text, p_title text, p_summary text,
  p_details text, p_state text, p_expected_version integer default null
) returns integer language plpgsql security invoker set search_path = '' as $$
declare saved_version integer;
begin
  perform private.assert_staff(p_actor);
  if p_kind not in ('horse','service') or p_state not in ('draft','published','archived') or
     p_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then
    raise exception 'invalid content' using errcode = '22023';
  end if;
  if p_kind = 'horse' then
    if p_expected_version is null then
      insert into public.horses (slug, name, summary, details, state)
      values (p_slug, p_title, p_summary, coalesce(p_details,''), p_state)
      returning version into saved_version;
    else
      update public.horses set name = p_title, summary = p_summary,
        details = coalesce(p_details,''), state = p_state,
        version = version + 1, updated_at = now()
      where slug = p_slug and version = p_expected_version
      returning version into saved_version;
    end if;
  else
    if p_expected_version is null then
      insert into public.services (slug, title, summary, details, state)
      values (p_slug, p_title, p_summary, coalesce(p_details,''), p_state)
      returning version into saved_version;
    else
      update public.services set title = p_title, summary = p_summary,
        details = coalesce(p_details,''), state = p_state,
        version = version + 1, updated_at = now()
      where slug = p_slug and version = p_expected_version
      returning version into saved_version;
    end if;
  end if;
  if saved_version is null then
    raise exception 'content changed; reload before saving' using errcode = 'P0002';
  end if;
  insert into private.staff_audit (actor_id, action, target_type, target_key)
  values (p_actor, 'save', p_kind, p_slug);
  delete from private.staff_audit where occurred_at < now() - interval '90 days';
  return saved_version;
end;
$$;

create function public.staff_set_inquiry_status(p_actor uuid, p_id uuid, p_status text)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare changed integer;
begin
  perform private.assert_staff(p_actor);
  if p_status not in ('new','contacted','booked','closed') then
    raise exception 'invalid status' using errcode = '22023';
  end if;
  update private.inquiries set status = p_status, updated_at = now() where id = p_id;
  get diagnostics changed = row_count;
  if changed = 1 then
    insert into private.staff_audit (actor_id, action, target_type, target_key)
    values (p_actor, 'status', 'inquiry', p_id::text);
  end if;
  return changed = 1;
end;
$$;

create function public.staff_delete_inquiry(p_actor uuid, p_id uuid)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare changed integer;
begin
  perform private.assert_staff(p_actor);
  delete from private.inquiries where id = p_id;
  get diagnostics changed = row_count;
  if changed = 1 then
    insert into private.staff_audit (actor_id, action, target_type, target_key)
    values (p_actor, 'delete', 'inquiry', p_id::text);
  end if;
  return changed = 1;
end;
$$;

create function public.staff_hide_comment(p_actor uuid, p_id uuid)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare changed integer;
begin
  perform private.assert_staff(p_actor);
  update public.comments set state = 'hidden' where id = p_id and state = 'published';
  get diagnostics changed = row_count;
  if changed = 1 then
    insert into private.staff_audit (actor_id, action, target_type, target_key)
    values (p_actor, 'hide', 'comment', p_id::text);
  end if;
  return changed = 1;
end;
$$;

create function public.staff_access(p_actor uuid)
returns boolean language sql security invoker stable set search_path = '' as $$
  select p_actor is not null and exists
    (select 1 from private.staff_members where user_id = p_actor);
$$;

create function public.staff_dashboard(p_actor uuid, p_page integer default 0)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare result jsonb;
begin
  perform private.assert_staff(p_actor);
  if p_page is null or p_page < 0 or p_page > 10000 then
    raise exception 'invalid page' using errcode = '22023';
  end if;
  select jsonb_build_object(
    'page', p_page,
    'more_inquiries', (select count(*) > (p_page + 1) * 100 from private.inquiries),
    'inquiries', coalesce((select jsonb_agg(to_jsonb(i) order by i.created_at desc)
      from (select id, name, email, phone, service_interest, note, consent_at,
                   status, created_at, updated_at from private.inquiries
            order by created_at desc, id desc limit 100 offset p_page * 100) i), '[]'::jsonb),
    'pages', coalesce((select jsonb_agg(to_jsonb(d) order by d.day desc, d.path)
      from (select day, path, views from private.daily_page_counts
            where day >= (now() at time zone 'UTC')::date - 29
            order by day desc, path) d), '[]'::jsonb),
    'more_comments', (select count(*) > (p_page + 1) * 100 from public.comments),
    'comments', coalesce((select jsonb_agg(to_jsonb(c) order by c.created_at desc)
      from (select id, article_slug, author_label, body, state, created_at
            from public.comments order by created_at desc, id desc limit 100 offset p_page * 100) c), '[]'::jsonb),
    'more_reports', (select count(*) > (p_page + 1) * 100 from public.comment_reports),
    'reports', coalesce((select jsonb_agg(to_jsonb(r) order by r.created_at desc)
      from (select report.comment_id, report.reason, report.created_at,
                   comment.article_slug, comment.body, comment.state
            from public.comment_reports report
            join public.comments comment on comment.id = report.comment_id
            order by report.created_at desc, report.comment_id desc
            limit 100 offset p_page * 100) r), '[]'::jsonb)
  ) into result;
  return result;
end;
$$;

revoke all on function private.assert_staff(uuid), private.take_rate(text,text,integer,integer) from public, anon, authenticated;
revoke all on function public.submit_inquiry(text,text,text,text,text,boolean,text,text),
  public.record_page_count(text,text), public.add_article_like(text,uuid,text),
  public.remove_article_like(text,uuid), public.create_comment(text,uuid,text,text),
  public.remove_comment(uuid,uuid), public.report_comment(uuid,uuid,text,text),
  public.staff_save_content(uuid,text,text,text,text,text,text,integer),
  public.staff_set_inquiry_status(uuid,uuid,text), public.staff_delete_inquiry(uuid,uuid),
  public.staff_hide_comment(uuid,uuid), public.staff_access(uuid),
  public.staff_dashboard(uuid,integer) from public, anon, authenticated;
grant execute on function private.assert_staff(uuid), private.take_rate(text,text,integer,integer) to service_role;
grant execute on function public.submit_inquiry(text,text,text,text,text,boolean,text,text),
  public.record_page_count(text,text), public.add_article_like(text,uuid,text),
  public.remove_article_like(text,uuid), public.create_comment(text,uuid,text,text),
  public.remove_comment(uuid,uuid), public.report_comment(uuid,uuid,text,text),
  public.staff_save_content(uuid,text,text,text,text,text,text,integer),
  public.staff_set_inquiry_status(uuid,uuid,text), public.staff_delete_inquiry(uuid,uuid),
  public.staff_hide_comment(uuid,uuid), public.staff_access(uuid),
  public.staff_dashboard(uuid,integer) to service_role;
