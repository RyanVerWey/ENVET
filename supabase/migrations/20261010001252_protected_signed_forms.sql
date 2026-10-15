-- Prepared additive M6 increment. Do not apply to hosted data until release review.
-- Ciphertext only. No customer, staff or signing keys are seeded.
set lock_timeout = '5s';
set statement_timeout = '30s';
create table private.signed_forms (
  id uuid primary key,
  signer_id uuid not null,
  request_id uuid not null,
  kind text not null check (kind in ('liability','donation')),
  document_version text not null check (char_length(document_version) between 20 and 180),
  request_digest text not null check (request_digest ~ '^[0-9a-f]{64}$'),
  record_digest text not null check (record_digest ~ '^[0-9a-f]{64}$'),
  protected_record jsonb not null check (jsonb_typeof(protected_record) = 'object' and octet_length(protected_record::text) < 300000),
  created_at timestamptz not null default now(),
  unique (signer_id, request_id)
);
-- No auth.users cascading FK: signed evidence must survive account deletion.
create index signed_forms_created on private.signed_forms(created_at desc, id desc);
create table private.form_reviews (
  form_id uuid primary key references private.signed_forms(id) on delete restrict,
  status text not null default 'submitted' check (status in ('submitted','needs_followup','reviewed','revoked','trial','accepted','declined')),
  version integer not null default 1 check (version > 0),
  first_reviewed_at timestamptz,
  updated_at timestamptz not null default now()
);
create index form_reviews_status on private.form_reviews(status, updated_at);
create table private.form_review_events (
  id uuid primary key,
  form_id uuid not null references private.signed_forms(id) on delete restrict,
  actor_id uuid not null,
  status text not null,
  version integer not null,
  protected_evaluation jsonb not null check (jsonb_typeof(protected_evaluation) = 'object' and octet_length(protected_evaluation::text) < 50000),
  created_at timestamptz not null default now(),
  unique(form_id,version)
);
create table private.form_participants (
  form_id uuid primary key references private.signed_forms(id) on delete restrict,
  participant_id uuid not null
);
create index form_participants_identity on private.form_participants(participant_id);
create table private.program_visits (
  id uuid primary key,
  request_id uuid not null,
  actor_id uuid not null,
  form_id uuid not null references private.signed_forms(id) on delete restrict,
  participant_id uuid not null,
  visit_day date not null,
  session_key text not null check (session_key ~ '^[a-z0-9][a-z0-9-]{0,39}$'),
  service_slug text not null references public.services(slug) on delete restrict,
  state text not null default 'completed' check (state in ('completed','void')),
  void_reason text check (void_reason in ('duplicate','entry_error','did_not_attend')),
  created_at timestamptz not null default now(),
  unique(actor_id,request_id),
  check ((state = 'void') = (void_reason is not null))
);
create unique index visits_no_duplicate_attendance on private.program_visits(participant_id,visit_day,session_key) where state='completed';
create index visits_day on private.program_visits(visit_day, state);
create index visits_form on private.program_visits(form_id);
create index visits_service on private.program_visits(service_slug);

alter table private.signed_forms enable row level security;
alter table private.form_reviews enable row level security;
alter table private.form_review_events enable row level security;
alter table private.form_participants enable row level security;
alter table private.program_visits enable row level security;
revoke all on private.signed_forms, private.form_reviews, private.form_review_events, private.form_participants, private.program_visits from public, anon, authenticated;
grant select, insert on private.signed_forms, private.form_review_events to service_role;
grant select, insert, update on private.form_reviews, private.form_participants, private.program_visits to service_role;

create function private.immutable_signed_form() returns trigger language plpgsql security invoker set search_path='' as $$
begin raise exception 'signed evidence is immutable; explicit operator authorization required for purge' using errcode='42501'; end; $$;
create trigger signed_form_immutable before update or delete on private.signed_forms for each row execute function private.immutable_signed_form();

create function public.submit_signed_form(p_id uuid, p_actor uuid, p_request uuid, p_kind text, p_version text, p_request_digest text, p_record_digest text, p_record jsonb, p_rate_key text)
returns uuid language plpgsql security invoker set search_path='' as $$
declare existing private.signed_forms%rowtype;
begin
  if p_actor is null or p_id is null or p_request is null then raise exception 'invalid signer' using errcode='22023'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_actor::text || ':' || p_request::text,0));
  select * into existing from private.signed_forms where signer_id=p_actor and request_id=p_request;
  if found then
    if existing.request_digest <> p_request_digest or existing.kind <> p_kind or existing.document_version <> p_version then raise exception 'replay changed' using errcode='P0002'; end if;
    return existing.id;
  end if;
  perform private.take_rate('signed-form-account', p_rate_key, 10, 86400);
  insert into private.signed_forms(id,signer_id,request_id,kind,document_version,request_digest,record_digest,protected_record)
    values(p_id,p_actor,p_request,p_kind,p_version,p_request_digest,p_record_digest,p_record);
  insert into private.form_reviews(form_id) values(p_id);
  return p_id;
end; $$;

create function public.read_signed_form(p_actor uuid, p_id uuid, p_staff boolean default false)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare result jsonb;
begin
  if p_actor is null then raise exception 'access denied' using errcode='42501'; end if;
  if p_staff then perform private.assert_staff(p_actor); end if;
  select jsonb_build_object('id',s.id,'kind',s.kind,'created_at',s.created_at,'record_digest',s.record_digest,'protected_record',s.protected_record,'status',r.status,'version',r.version,
    'participant_id',case when p_staff then fp.participant_id else null end,
    'evaluation',case when p_staff then (select jsonb_build_object('id',e.id,'protected_evaluation',e.protected_evaluation) from private.form_review_events e where e.form_id=s.id order by e.version desc limit 1) else null end,
    'visits',case when p_staff then coalesce((select jsonb_agg(jsonb_build_object('id',v.id,'day',v.visit_day,'session',v.session_key,'service',v.service_slug,'state',v.state) order by v.visit_day desc,v.id) from (select * from private.program_visits where form_id=s.id order by visit_day desc,id limit 100) v),'[]'::jsonb) else '[]'::jsonb end)
    into result from private.signed_forms s join private.form_reviews r on r.form_id=s.id left join private.form_participants fp on fp.form_id=s.id where s.id=p_id and (p_staff or s.signer_id=p_actor);
  if result is not null and p_staff then insert into private.staff_audit(actor_id,action,target_type,target_key) values(p_actor,'read','signed_form',p_id::text); end if;
  return result;
end; $$;

create function public.staff_form_queue(p_actor uuid,p_page integer default 0,p_status text default 'all')
returns jsonb language plpgsql security invoker set search_path='' as $$
begin
  perform private.assert_staff(p_actor);
  if p_page is null or p_page < 0 or p_page > 10000 or p_status is null or p_status not in ('all','submitted','needs_followup','reviewed','revoked','trial','accepted','declined') then raise exception 'invalid queue' using errcode='22023'; end if;
  return jsonb_build_object('rows',coalesce((select jsonb_agg(t order by t.created_at desc,t.id desc) from (
    select s.id,s.kind,s.created_at,r.status,r.version from private.signed_forms s join private.form_reviews r on r.form_id=s.id where p_status='all' or r.status=p_status order by s.created_at desc,s.id desc limit 50 offset p_page*50) t),'[]'::jsonb),
    'more',(select count(*) > (p_page+1)*50 from private.form_reviews where p_status='all' or status=p_status));
end; $$;

create function public.staff_review_form(p_actor uuid,p_id uuid,p_expected integer,p_status text,p_event uuid,p_evaluation jsonb,p_participant uuid default null)
returns boolean language plpgsql security invoker set search_path='' as $$
declare k text; next_version integer; linked uuid;
begin
  perform private.assert_staff(p_actor);
  -- Same guard as attendance, acquired before any participant/visit invariant reads.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('signed-form:'||p_id::text,1));
  select kind into k from private.signed_forms where id=p_id;
  if k is null then return false; end if;
  if p_status is null or (k='liability' and p_status not in ('submitted','needs_followup','reviewed','revoked')) or (k='donation' and p_status not in ('submitted','needs_followup','trial','accepted','declined')) then raise exception 'invalid review state' using errcode='22023'; end if;
  if p_participant is not null and (k<>'liability' or p_status<>'reviewed') then raise exception 'invalid participant link' using errcode='22023'; end if;
  if p_participant is not null and not exists(select 1 from private.form_participants where participant_id=p_participant) then raise exception 'participant not found' using errcode='22023'; end if;
  if exists(select 1 from private.program_visits where form_id=p_id) and p_participant is not null and p_participant <> (select participant_id from private.form_participants where form_id=p_id) then raise exception 'attendance already linked; operator reconciliation required' using errcode='P0002'; end if;
  update private.form_reviews set status=p_status,version=version+1,first_reviewed_at=case when p_status='submitted' then first_reviewed_at else coalesce(first_reviewed_at,now()) end,updated_at=now() where form_id=p_id and version=p_expected returning version into next_version;
  if next_version is null then raise exception 'review changed' using errcode='P0002'; end if;
  insert into private.form_review_events(id,form_id,actor_id,status,version,protected_evaluation) values(p_event,p_id,p_actor,p_status,next_version,p_evaluation);
  if k='liability' and p_status='reviewed' then
    select participant_id into linked from private.form_participants where form_id=p_id;
    insert into private.form_participants(form_id,participant_id) values(p_id,coalesce(p_participant,linked,gen_random_uuid())) on conflict(form_id) do update set participant_id=excluded.participant_id;
  end if;
  insert into private.staff_audit(actor_id,action,target_type,target_key) values(p_actor,'review:'||p_status,'signed_form',p_id::text);
  return true;
end; $$;

create function public.staff_record_visit(p_actor uuid,p_id uuid,p_request uuid,p_form uuid,p_day date,p_session text,p_service text)
returns uuid language plpgsql security invoker set search_path='' as $$
declare participant uuid; prior private.program_visits%rowtype; form_status text;
begin
  perform private.assert_staff(p_actor);
  if p_request is null or p_id is null or p_day is null or p_day > (now() at time zone 'America/New_York')::date or p_day < '2020-01-01'::date then raise exception 'invalid attendance' using errcode='22023'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_actor::text||':'||p_request::text,0));
  select * into prior from private.program_visits where actor_id=p_actor and request_id=p_request;
  if found then
    if prior.form_id<>p_form or prior.visit_day<>p_day or prior.session_key<>p_session or prior.service_slug<>p_service then raise exception 'replay changed' using errcode='P0002'; end if;
    return prior.id;
  end if;
  -- Serialize with review/relink before taking fresh status and identity snapshots.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('signed-form:'||p_form::text,1));
  select status into form_status from private.form_reviews where form_id=p_form for update;
  select participant_id into participant from private.form_participants where form_id=p_form;
  if participant is null or form_status<>'reviewed' then raise exception 'review required' using errcode='22023'; end if;
  -- SHARE conflicts with a concurrent service state update, unlike KEY SHARE.
  -- Identical nonce replays above remain valid after service archival.
  perform 1 from public.services where slug=p_service and state='published' for share;
  if not found then raise exception 'published service required' using errcode='22023'; end if;
  insert into private.program_visits(id,request_id,actor_id,form_id,participant_id,visit_day,session_key,service_slug) values(p_id,p_request,p_actor,p_form,participant,p_day,p_session,p_service);
  insert into private.staff_audit(actor_id,action,target_type,target_key) values(p_actor,'attendance:completed','program_visit',p_id::text);
  return p_id;
end; $$;

create function public.staff_void_visit(p_actor uuid,p_id uuid,p_reason text) returns boolean language plpgsql security invoker set search_path='' as $$
declare changed integer;
begin
  perform private.assert_staff(p_actor);
  if p_reason is null or p_reason not in ('duplicate','entry_error','did_not_attend') then raise exception 'reason required' using errcode='22023'; end if;
  update private.program_visits set state='void',void_reason=p_reason where id=p_id and state='completed';
  get diagnostics changed = row_count;
  if changed > 0 then insert into private.staff_audit(actor_id,action,target_type,target_key) values(p_actor,'attendance:void:'||p_reason,'program_visit',p_id::text); end if;
  return changed > 0;
end; $$;

create function public.staff_program_metrics(p_actor uuid,p_days integer default 90) returns jsonb language plpgsql security invoker set search_path='' as $$
declare first_day date; today date; output jsonb;
begin
  perform private.assert_staff(p_actor);
  if p_days is null or p_days not in (30,90,365) then raise exception 'invalid range' using errcode='22023'; end if;
  today := (now() at time zone 'America/New_York')::date; first_day:=today-(p_days-1);
  with visits as (select * from private.program_visits where state='completed' and visit_day between first_day and today), people as (select participant_id,count(*) n from visits group by participant_id)
  select jsonb_build_object('from',first_day,'to',today,'visits',(select count(*) from visits),'participants',(select count(*) from people),'repeat_participants',(select count(*) from people where n>=2),
    'pending',(select count(*) from private.form_reviews where status='submitted'),
    'pending_over_seven_days',(select count(*) from private.form_reviews r join private.signed_forms s on s.id=r.form_id where r.status='submitted' and s.created_at<now()-interval '7 days'),
    'median_review_hours',(select percentile_cont(0.5) within group(order by extract(epoch from (r.first_reviewed_at-s.created_at))/3600) from private.form_reviews r join private.signed_forms s on s.id=r.form_id where r.first_reviewed_at is not null and (s.created_at at time zone 'America/New_York')::date between first_day and today),
    'daily',coalesce((select jsonb_agg(jsonb_build_object('day',d.day::date,'visits',coalesce(v.n,0)) order by d.day) from generate_series(first_day::timestamp,today::timestamp,interval '1 day') d(day) left join (select visit_day,count(*) n from visits group by visit_day) v on v.visit_day=d.day::date),'[]'::jsonb),
    'services',coalesce((select jsonb_agg(jsonb_build_object('service',s.title,'visits',v.n) order by v.n desc,s.title) from (select service_slug,count(*) n from visits group by service_slug) v join public.services s on s.slug=v.service_slug),'[]'::jsonb),
    'candidates',coalesce((select jsonb_agg(jsonb_build_object('stage',t.status,'candidates',t.n) order by t.status) from (select r.status,count(*) n from private.form_reviews r join private.signed_forms s on s.id=r.form_id where s.kind='donation' and (s.created_at at time zone 'America/New_York')::date between first_day and today group by r.status) t),'[]'::jsonb)) into output;
  return output;
end; $$;

revoke all on function private.immutable_signed_form(), public.submit_signed_form(uuid,uuid,uuid,text,text,text,text,jsonb,text), public.read_signed_form(uuid,uuid,boolean), public.staff_form_queue(uuid,integer,text), public.staff_review_form(uuid,uuid,integer,text,uuid,jsonb,uuid), public.staff_record_visit(uuid,uuid,uuid,uuid,date,text,text), public.staff_void_visit(uuid,uuid,text), public.staff_program_metrics(uuid,integer) from public,anon,authenticated;
grant execute on function private.immutable_signed_form(), public.submit_signed_form(uuid,uuid,uuid,text,text,text,text,jsonb,text), public.read_signed_form(uuid,uuid,boolean), public.staff_form_queue(uuid,integer,text), public.staff_review_form(uuid,uuid,integer,text,uuid,jsonb,uuid), public.staff_record_visit(uuid,uuid,uuid,uuid,date,text,text), public.staff_void_visit(uuid,uuid,text), public.staff_program_metrics(uuid,integer) to service_role;
