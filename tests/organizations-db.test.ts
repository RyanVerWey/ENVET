import { readFileSync, readdirSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { beforeAll, afterAll, it, expect } from "vitest";
import { blankOrganization } from "@/lib/community/organizations";
let db: PGlite;
const staff = "11111111-1111-4111-8111-111111111111",
  member = "22222222-2222-4222-8222-222222222222";
const draft = {
  ...blankOrganization,
  slug: "synthetic-organization",
  name: "Synthetic Organization",
  href: "https://example.org/",
};
beforeAll(async () => {
  db = new PGlite();
  await db.exec(
    `create role anon;create role authenticated;create role service_role bypassrls;alter default privileges grant all on tables to service_role;create schema auth;create table auth.users(id uuid primary key);insert into auth.users values('${staff}'),('${member}');`,
  );
  for (const suffix of [
    "_community_workspace.sql",
    "_contributing_organizations.sql",
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
const save = (entry = draft, version: number | null = null, actor = staff) =>
  db.query("select public.staff_save_organization($1,$2::jsonb,$3)", [
    actor,
    JSON.stringify(entry),
    version,
  ]);
it("removes inherited hard-delete privileges and denies member writes or RPC calls", async () => {
  for (const role of ["anon", "authenticated", "service_role"]) {
    for (const privilege of ["DELETE", "TRUNCATE", "TRIGGER", "REFERENCES"])
      expect(
        (
          await db.query(
            "select has_table_privilege($1,'public.contributing_organizations',$2) as allowed",
            [role, privilege],
          )
        ).rows,
      ).toEqual([{ allowed: false }]);
  }
  await expect(save(draft, null, member)).rejects.toMatchObject({
    code: "42501",
  });
  await db.exec("set role authenticated");
  await expect(save()).rejects.toMatchObject({ code: "42501" });
  await expect(
    db.query(
      "insert into public.contributing_organizations(slug,name) values('bad','Bad')",
    ),
  ).rejects.toMatchObject({ code: "42501" });
  await db.exec("set role service_role");
});
it("constrains links and order independently of application validation", async () => {
  for (const href of [
    "javascript:alert(1)",
    "http://example.org",
    "https://user@example.org/",
    "https://localhost/",
    "https://example.org/\nfoo",
  ])
    await expect(save({ ...draft, href })).rejects.toMatchObject({
      code: "23514",
    });
  await expect(save({ ...draft, sort_order: -1 })).rejects.toMatchObject({
    code: "22023",
  });
  await save();
  await db.exec("set role anon");
  expect(
    (await db.query("select slug from public.contributing_organizations")).rows,
  ).toEqual([]);
  await db.exec("set role service_role");
});
it("publishes, guards stale versions, removes and restores only as draft with audit evidence", async () => {
  await save({ ...draft, state: "published" }, 1);
  await expect(save(draft, 1)).rejects.toMatchObject({ code: "P0002" });
  await db.exec("set role anon");
  expect(
    (await db.query("select slug from public.contributing_organizations")).rows,
  ).toHaveLength(1);
  await db.exec("set role service_role");
  await db.query("select public.staff_remove_organization($1,$2,2,false)", [
    staff,
    draft.slug,
  ]);
  await db.exec("set role authenticated");
  expect(
    (await db.query("select slug from public.contributing_organizations")).rows,
  ).toEqual([]);
  await db.exec("set role service_role");
  await expect(save(draft, 3)).rejects.toMatchObject({ code: "P0002" });
  await db.query("select public.staff_remove_organization($1,$2,3,true)", [
    staff,
    draft.slug,
  ]);
  expect(
    (
      await db.query(
        "select state,version,deleted_at from public.contributing_organizations",
      )
    ).rows,
  ).toEqual([{ state: "draft", version: 4, deleted_at: null }]);
  expect(
    (
      await db.query(
        "select action from private.staff_audit where target_type='organization' order by id",
      )
    ).rows,
  ).toEqual([
    { action: "save" },
    { action: "save" },
    { action: "remove" },
    { action: "restore" },
  ]);
  await db.exec(
    `reset role;delete from private.staff_members where user_id='${staff}';set role service_role;`,
  );
  await expect(save(draft, 4)).rejects.toMatchObject({ code: "42501" });
});
