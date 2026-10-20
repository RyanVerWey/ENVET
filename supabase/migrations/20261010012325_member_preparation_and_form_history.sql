-- Personal preparation is not eligibility, staff screening or actual attendance.
set lock_timeout = '5s';
set statement_timeout = '30s';
create table private.member_preparation (
  user_id uuid primary key references auth.users(id) on delete cascade,
  checked text[] not null default '{}' check (cardinality(checked) <= 10 and checked <@ array['connection','purpose','pants','shoes','shirt','layers','weather','helmets','gloves','protection']::text[]),
  checklist_version text not null,
  version integer not null default 1 check (version > 0),
  updated_at timestamptz not null default now()
);
alter table private.member_preparation enable row level security;
revoke all on private.member_preparation from public, anon, authenticated;
grant select, insert, update on private.member_preparation to service_role;
create index signed_forms_signer_history on private.signed_forms(signer_id, created_at desc, id desc);

create function public.member_form_history(p_actor uuid, p_page integer default 0)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare output jsonb;
begin
  if p_actor is null then raise exception 'access denied' using errcode='42501'; end if;
  if p_page < 0 or p_page > 100 or p_page is null then raise exception 'invalid page' using errcode='22023'; end if;
  select jsonb_build_object('records',coalesce(jsonb_agg(to_jsonb(t) order by t.created_at desc,t.id desc),'[]'::jsonb)) into output
  from (select id,kind,created_at from private.signed_forms where signer_id=p_actor order by created_at desc,id desc limit 20 offset p_page*20) t;
  return output || jsonb_build_object('more',exists(select 1 from private.signed_forms where signer_id=p_actor order by created_at desc,id desc offset (p_page+1)*20 limit 1));
end; $$;

create function public.member_get_preparation(p_actor uuid)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare output jsonb;
begin
  if p_actor is null then raise exception 'access denied' using errcode='42501'; end if;
  select jsonb_build_object('checked',checked,'checklistVersion',checklist_version,'version',version,'updatedAt',updated_at) into output from private.member_preparation where user_id=p_actor;
  return coalesce(output,jsonb_build_object('checked','[]'::jsonb,'checklistVersion','pre-visit-2026-10-09-v1','version',0,'updatedAt',null));
end; $$;

create function public.member_save_preparation(p_actor uuid,p_expected integer,p_checked text[],p_checklist_version text,p_rate_key text)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare prior private.member_preparation%rowtype;
begin
  if p_actor is null then raise exception 'access denied' using errcode='42501'; end if;
  if p_expected is null or p_expected < 0 or p_checked is null or p_checklist_version is distinct from 'pre-visit-2026-10-09-v1' or cardinality(p_checked)>10 or array_position(p_checked,null) is not null or not(p_checked <@ array['connection','purpose','pants','shoes','shirt','layers','weather','helmets','gloves','protection']::text[]) or cardinality(p_checked) <> (select count(distinct k) from unnest(p_checked) k) then raise exception 'invalid preparation' using errcode='22023'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('member-preparation:'||p_actor::text,0));
  select * into prior from private.member_preparation where user_id=p_actor;
  -- A retry after a lost response can confirm the already committed checks.
  if prior.version=p_expected+1 and prior.checked=p_checked and prior.checklist_version=p_checklist_version then return public.member_get_preparation(p_actor); end if;
  if coalesce(prior.version,0)<>p_expected then raise exception 'preparation changed' using errcode='P0002'; end if;
  perform private.take_rate('member-preparation',p_rate_key,60,3600);
  insert into private.member_preparation(user_id,checked,checklist_version,version) values(p_actor,p_checked,p_checklist_version,p_expected+1)
    on conflict(user_id) do update set checked=excluded.checked,checklist_version=excluded.checklist_version,version=excluded.version,updated_at=now();
  return public.member_get_preparation(p_actor);
end; $$;
revoke all on function public.member_form_history(uuid,integer),public.member_get_preparation(uuid),public.member_save_preparation(uuid,integer,text[],text,text) from public,anon,authenticated;
grant execute on function public.member_form_history(uuid,integer),public.member_get_preparation(uuid),public.member_save_preparation(uuid,integer,text[],text,text) to service_role;
