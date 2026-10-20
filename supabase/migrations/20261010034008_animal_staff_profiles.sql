-- Public farm staff profiles; no invented animals or new account grants.
create table public.animals (
  slug text primary key check (char_length(slug) <= 100 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (char_length(btrim(name)) between 2 and 100),
  species text not null check (species in ('horse','dog','cat')),
  nickname text not null default '' check (char_length(nickname) <= 100),
  role text not null default '' check (char_length(role) <= 100),
  summary text not null check (char_length(btrim(summary)) between 10 and 700),
  story text not null default '' check (char_length(story) <= 4000),
  personality text not null default '' check (char_length(personality) <= 300),
  favorites text not null default '' check (char_length(favorites) <= 300),
  "visitTips" text not null default '' check (char_length("visitTips") <= 700),
  photo text not null default '' check (photo = '' or photo ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.webp$'),
  "photoAlt" text not null default '' check (char_length("photoAlt") <= 250 and (photo = '' or "photoAlt" <> '')),
  state text not null default 'draft' check (state in ('draft','published','archived')),
  version integer not null default 1 check (version > 0),
  deleted_at timestamptz,
  updated_at timestamptz not null default now()
);
-- Preserve any legacy horse content as unpublished profiles for portrait review.
insert into public.animals(slug,name,species,summary,story)
  select slug,name,'horse',summary,details from public.horses;
alter table public.animals enable row level security;
revoke all on public.animals from public, anon, authenticated;
grant select on public.animals to anon, authenticated;
grant select,insert,update on public.animals to service_role;
create policy animals_public_read on public.animals for select to anon, authenticated
  using (state = 'published' and deleted_at is null);
create index animals_published_species_name on public.animals(species,name,slug)
  where state='published' and deleted_at is null;
create index animals_photo_public on public.animals(photo) where state='published' and deleted_at is null;

create table private.animal_photos (
  path text primary key check (path ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.webp$'),
  created_by uuid not null,
  permission_confirmed_at timestamptz not null default now()
);
alter table private.animal_photos enable row level security;
revoke all on private.animal_photos from public,anon,authenticated;
grant select,insert on private.animal_photos to service_role;

create function public.staff_register_animal_photo(p_actor uuid, p_path text)
returns void language plpgsql security invoker set search_path='' as $$
begin
  perform private.assert_staff(p_actor);
  perform private.take_rate('animal-photo',repeat(md5(p_actor::text),2),30,3600);
  insert into private.animal_photos(path,created_by) values(p_path,p_actor);
  insert into private.staff_audit(actor_id,action,target_type,target_key)
    values(p_actor,'photo_permission_confirmed','animal_photo',p_path);
end;
$$;

create function public.staff_save_animal(p_actor uuid, p_bio jsonb, p_expected integer)
returns integer language plpgsql security invoker set search_path='' as $$
declare saved integer;
begin
  perform private.assert_staff(p_actor);
  perform private.take_rate('animal-save',repeat(md5(p_actor::text),2),120,3600);
  if p_bio is null or jsonb_typeof(p_bio) <> 'object' or p_expected < 1 or
    not (p_bio ?& array['slug','name','species','nickname','role','summary','story','personality','favorites','visitTips','photo','photoAlt','state']) or
    exists(select 1 from jsonb_each(p_bio) t where jsonb_typeof(t.value) <> 'string') then
    raise exception 'invalid bio' using errcode='22023';
  end if;
  if (p_bio->>'photo') <> '' and not exists(select 1 from private.animal_photos where path=p_bio->>'photo') then
    raise exception 'unknown portrait' using errcode='22023';
  end if;
  if p_bio->>'state'='published' and (p_bio->>'photo'='' or btrim(p_bio->>'story')='' or btrim(p_bio->>'visitTips')='') then
    raise exception 'complete portrait story and visit tips before publishing' using errcode='22023';
  end if;
  if p_expected is null then
    insert into public.animals(slug,name,species,nickname,role,summary,story,personality,favorites,"visitTips",photo,"photoAlt",state)
      values(p_bio->>'slug',p_bio->>'name',p_bio->>'species',p_bio->>'nickname',p_bio->>'role',p_bio->>'summary',p_bio->>'story',p_bio->>'personality',p_bio->>'favorites',p_bio->>'visitTips',p_bio->>'photo',p_bio->>'photoAlt',p_bio->>'state') returning version into saved;
  else
    update public.animals set name=p_bio->>'name',species=p_bio->>'species',nickname=p_bio->>'nickname',role=p_bio->>'role',summary=p_bio->>'summary',story=p_bio->>'story',personality=p_bio->>'personality',favorites=p_bio->>'favorites',"visitTips"=p_bio->>'visitTips',photo=p_bio->>'photo',"photoAlt"=p_bio->>'photoAlt',state=p_bio->>'state',version=version+1,updated_at=now()
      where slug=p_bio->>'slug' and version=p_expected and deleted_at is null returning version into saved;
  end if;
  if saved is null then raise exception 'profile changed' using errcode='P0002'; end if;
  insert into private.staff_audit(actor_id,action,target_type,target_key) values(p_actor,'save','animal',p_bio->>'slug');
  return saved;
end;
$$;

create function public.staff_trash_animal(p_actor uuid,p_slug text,p_expected integer,p_restore boolean)
returns integer language plpgsql security invoker set search_path='' as $$
declare saved integer;
begin
  perform private.assert_staff(p_actor);
  if p_expected is null or p_expected < 1 or p_restore is null then raise exception 'invalid version' using errcode='22023'; end if;
  update public.animals set deleted_at=case when p_restore then null else now() end,state='draft',version=version+1,updated_at=now()
    where slug=p_slug and version=p_expected and ((p_restore and deleted_at is not null) or (not p_restore and deleted_at is null)) returning version into saved;
  if saved is null then raise exception 'profile changed' using errcode='P0002'; end if;
  insert into private.staff_audit(actor_id,action,target_type,target_key) values(p_actor,case when p_restore then 'restore' else 'trash' end,'animal',p_slug);
  return saved;
end;
$$;
revoke all on function public.staff_register_animal_photo(uuid,text),public.staff_save_animal(uuid,jsonb,integer),public.staff_trash_animal(uuid,text,integer,boolean) from public,anon,authenticated;
grant execute on function public.staff_register_animal_photo(uuid,text),public.staff_save_animal(uuid,jsonb,integer),public.staff_trash_animal(uuid,text,integer,boolean) to service_role;

-- Private bucket. No new Storage policies or public downloads: application serves
-- only a published profile's portrait, or a freshly authorized manager preview.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
  values('animal-portraits','animal-portraits',false,3000000,array['image/webp'])
  on conflict(id) do nothing;
