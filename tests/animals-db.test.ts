import { readFileSync, readdirSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { beforeAll, afterAll, it, expect } from "vitest";
import { blankAnimal } from "@/lib/community/animals";
let db: PGlite;
const staff = "11111111-1111-4111-8111-111111111111",
  member = "22222222-2222-4222-8222-222222222222";
const portrait = "44444444-4444-4444-8444-444444444444.webp";
const draft = {
  ...blankAnimal,
  slug: "synthetic-animal",
  name: "Synthetic Animal",
  summary: "Not real farm content. Isolated verification only.",
};
beforeAll(async () => {
  db = new PGlite();
  await db.exec(
    `create role anon;create role authenticated;create role service_role bypassrls;alter default privileges grant all on tables to service_role;create schema auth;create table auth.users(id uuid primary key);insert into auth.users values('${staff}'),('${member}');create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);`,
  );
  for (const suffix of [
    "_community_workspace.sql",
    "_animal_staff_profiles.sql",
    "_animal_write_privileges.sql",
  ]) {
    const file = readdirSync("supabase/migrations").find((f) =>
      f.endsWith(suffix),
    )!;
    await db.exec(readFileSync(`supabase/migrations/${file}`, "utf8"));
  }
  await db.exec(
    `insert into private.staff_members(user_id) values('${staff}');set role service_role;`,
  );
});
afterAll(async () => db?.close());
const save = (bio = draft, version: number | null = null, actor = staff) =>
  db.query("select public.staff_save_animal($1,$2::jsonb,$3)", [
    actor,
    JSON.stringify(bio),
    version,
  ]);
it("removes inherited server hard-delete and portrait rewrite privileges", async () => {
  for (const table of ["public.animals", "private.animal_photos"]) {
    for (const privilege of ["DELETE", "TRUNCATE", "TRIGGER", "REFERENCES"]) {
      const result = await db.query(
        "select has_table_privilege('service_role',$1,$2) as allowed",
        [table, privilege],
      );
      expect(result.rows).toEqual([{ allowed: false }]);
    }
  }
  expect(
    (
      await db.query(
        "select has_table_privilege('service_role','private.animal_photos','UPDATE') as allowed",
      )
    ).rows,
  ).toEqual([{ allowed: false }]);
});
it("requires current staff, valid species and complete approved publication data", async () => {
  await expect(save(draft, null, member)).rejects.toMatchObject({
    code: "42501",
  });
  await expect(
    save({ ...draft, species: "bird" } as never),
  ).rejects.toMatchObject({ code: "23514" });
  await expect(save({ ...draft, state: "published" })).rejects.toMatchObject({
    code: "22023",
  });
  await save();
  await db.exec("set role anon");
  expect((await db.query("select slug from public.animals")).rows).toEqual([]);
  await expect(
    db.query("select * from private.animal_photos"),
  ).rejects.toMatchObject({ code: "42501" });
  await expect(save()).rejects.toMatchObject({ code: "42501" });
  await db.exec("set role service_role");
});
it("publishes, rejects stale edits, hides trashed cards and restores only as draft", async () => {
  await db.query("select public.staff_register_animal_photo($1,$2)", [
    staff,
    portrait,
  ]);
  const published = {
    ...draft,
    state: "published" as const,
    photo: portrait,
    photoAlt: "Synthetic portrait",
    story: "Synthetic story",
    visitTips: "Ask staff before approaching.",
  };
  await save(published, 1);
  await expect(save(published, 1)).rejects.toMatchObject({ code: "P0002" });
  await db.exec("set role anon");
  expect((await db.query("select slug from public.animals")).rows).toHaveLength(
    1,
  );
  await db.exec("set role service_role");
  await db.query("select public.staff_trash_animal($1,$2,2,false)", [
    staff,
    draft.slug,
  ]);
  await db.exec("set role authenticated");
  expect((await db.query("select slug from public.animals")).rows).toEqual([]);
  await expect(
    db.query("update public.animals set state='published'"),
  ).rejects.toMatchObject({ code: "42501" });
  await db.exec("set role service_role");
  await db.query("select public.staff_trash_animal($1,$2,3,true)", [
    staff,
    draft.slug,
  ]);
  expect(
    (await db.query("select state,version from public.animals")).rows,
  ).toEqual([{ state: "draft", version: 4 }]);
  await db.exec(
    `reset role;delete from private.staff_members where user_id='${staff}';set role service_role;`,
  );
  await expect(save(draft, 4)).rejects.toMatchObject({ code: "42501" });
});
