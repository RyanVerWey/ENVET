-- Supabase's hosted default privileges grant service_role ALL on new tables.
-- Explicitly reset them; application deletion is recoverable trash only.
revoke all on public.animals,private.animal_photos from service_role;
grant select,insert,update on public.animals to service_role;
grant select,insert on private.animal_photos to service_role;
