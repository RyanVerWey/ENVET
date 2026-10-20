-- Manager-controlled public acknowledgements. Existing staff authorization stays unchanged.
create table public.contributing_organizations (
  slug text primary key check (char_length(slug) <= 100 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (char_length(btrim(name)) between 2 and 150 and name !~ '[[:cntrl:]]'),
  href text not null default '' check (char_length(href) <= 2048 and (href='' or
    href ~ '^https://[A-Za-z0-9]([A-Za-z0-9.-]*[A-Za-z0-9])?\.[A-Za-z]{2,}([/?#][^[:space:]\\]*)?$')),
  description text not null default '' check (char_length(description) <= 500),
  sort_order integer not null default 10 check (sort_order between 0 and 9999),
  state text not null default 'draft' check (state in ('draft','published')),
  version integer not null default 1 check (version > 0),
  deleted_at timestamptz,
  updated_at timestamptz not null default now()
);
alter table public.contributing_organizations enable row level security;
-- Reset hosted inherited service_role ALL defaults as well as public defaults.
revoke all on public.contributing_organizations from public,anon,authenticated,service_role;
grant select on public.contributing_organizations to anon,authenticated;
grant select,insert,update on public.contributing_organizations to service_role;
create policy organizations_public_read on public.contributing_organizations for select to anon,authenticated
  using (state='published' and deleted_at is null);
create index organizations_public_order on public.contributing_organizations(sort_order,name,slug)
  where state='published' and deleted_at is null;

create function public.staff_save_organization(p_actor uuid,p_entry jsonb,p_expected integer)
returns integer language plpgsql security invoker set search_path='' as $$
declare saved integer;
begin
  perform private.assert_staff(p_actor);
  perform private.take_rate('organization-write',repeat(md5(p_actor::text),2),120,3600);
  if p_entry is null or jsonb_typeof(p_entry)<>'object' or p_expected<1 or
    not (p_entry ?& array['slug','name','href','description','sort_order','state']) or
    exists(select 1 from jsonb_each(p_entry) t where t.key<>'sort_order' and jsonb_typeof(t.value)<>'string') or
    jsonb_typeof(p_entry->'sort_order')<>'number' or (p_entry->>'sort_order') !~ '^[0-9]{1,4}$' then
    raise exception 'invalid organization' using errcode='22023';
  end if;
  if p_expected is null then
    insert into public.contributing_organizations(slug,name,href,description,sort_order,state)
      values(p_entry->>'slug',btrim(p_entry->>'name'),p_entry->>'href',p_entry->>'description',(p_entry->>'sort_order')::integer,p_entry->>'state')
      returning version into saved;
  else
    update public.contributing_organizations set name=btrim(p_entry->>'name'),href=p_entry->>'href',description=p_entry->>'description',
      sort_order=(p_entry->>'sort_order')::integer,state=p_entry->>'state',version=version+1,updated_at=now()
      where slug=p_entry->>'slug' and version=p_expected and deleted_at is null returning version into saved;
  end if;
  if saved is null then raise exception 'organization changed' using errcode='P0002'; end if;
  insert into private.staff_audit(actor_id,action,target_type,target_key) values(p_actor,'save','organization',p_entry->>'slug');
  return saved;
end;
$$;
create function public.staff_remove_organization(p_actor uuid,p_slug text,p_expected integer,p_restore boolean)
returns integer language plpgsql security invoker set search_path='' as $$
declare saved integer;
begin
  perform private.assert_staff(p_actor);
  perform private.take_rate('organization-write',repeat(md5(p_actor::text),2),120,3600);
  if p_expected is null or p_expected<1 or p_restore is null then raise exception 'invalid version' using errcode='22023'; end if;
  update public.contributing_organizations set deleted_at=case when p_restore then null else now() end,
    state='draft',version=version+1,updated_at=now()
    where slug=p_slug and version=p_expected and ((p_restore and deleted_at is not null) or (not p_restore and deleted_at is null))
    returning version into saved;
  if saved is null then raise exception 'organization changed' using errcode='P0002'; end if;
  insert into private.staff_audit(actor_id,action,target_type,target_key)
    values(p_actor,case when p_restore then 'restore' else 'remove' end,'organization',p_slug);
  return saved;
end;
$$;
revoke all on function public.staff_save_organization(uuid,jsonb,integer),public.staff_remove_organization(uuid,text,integer,boolean) from public,anon,authenticated;
grant execute on function public.staff_save_organization(uuid,jsonb,integer),public.staff_remove_organization(uuid,text,integer,boolean) to service_role;
