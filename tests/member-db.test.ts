import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, expect, it } from "vitest";
const member = "22222222-2222-4222-8222-222222222222",
  other = "33333333-3333-4333-8333-333333333333",
  id = "44444444-4444-4444-8444-444444444444";
let db: PGlite;
beforeAll(async () => {
  db = new PGlite();
  await db.exec(
    `create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);insert into auth.users values('${member}'),('${other}');`,
  );
  for (const file of readdirSync(join(process.cwd(), "supabase/migrations"))
    .filter((name) => name.endsWith(".sql"))
    .sort())
    await db.exec(
      readFileSync(join(process.cwd(), "supabase/migrations", file), "utf8"),
    );
  await db.exec("set role service_role");
});
afterAll(async () => db?.close());
async function save(actor = member, version = 0, checks = ["pants"]) {
  return db.query<{ record: { version: number; checked: string[] } }>(
    "select public.member_save_preparation($1,$2,$3::text[],'pre-visit-2026-10-09-v1',$4) record",
    [actor, version, checks, "a".repeat(64)],
  );
}
it("persists personal checks, confirms identical retry and rejects stale overwrites", async () => {
  expect((await save()).rows[0].record).toMatchObject({
    version: 1,
    checked: ["pants"],
  });
  expect((await save()).rows[0].record.version).toBe(1);
  await expect(save(member, 0, ["shoes"])).rejects.toMatchObject({
    code: "P0002",
  });
  expect(
    (await save(member, 1, ["pants", "shoes"])).rows[0].record.version,
  ).toBe(2);
  const result = await db.query<{
    record: { checked: string[]; version: number };
  }>("select public.member_get_preparation($1) record", [other]);
  expect(result.rows[0].record).toMatchObject({ version: 0, checked: [] });
});
it("rejects arbitrary data and denies browser roles direct reads or RPC execution", async () => {
  await expect(save(other, 0, ["medical-history"])).rejects.toMatchObject({
    code: "22023",
  });
  await expect(save(other, 0, ["pants", "pants"])).rejects.toMatchObject({
    code: "22023",
  });
  for (const role of ["anon", "authenticated"]) {
    await db.exec(`set role ${role}`);
    await expect(
      db.query("select * from private.member_preparation"),
    ).rejects.toMatchObject({ code: "42501" });
    await expect(
      db.query("select public.member_get_preparation($1)", [member]),
    ).rejects.toMatchObject({ code: "42501" });
    await expect(
      db.query("select public.member_form_history($1)", [member]),
    ).rejects.toMatchObject({ code: "42501" });
    await expect(save()).rejects.toMatchObject({ code: "42501" });
  }
  await db.exec("set role service_role");
});
it("lists only own minimal receipts, without names, signatures, ciphertext or staff review", async () => {
  await db.query(
    "select public.submit_signed_form($1,$2,$1,'liability','liability-synthetic-test-version',$3,$3,$4::jsonb,$3)",
    [
      id,
      member,
      "b".repeat(64),
      JSON.stringify({
        keyId: "synthetic",
        iv: "synthetic",
        tag: "synthetic",
        ciphertext: "synthetic",
      }),
    ],
  );
  const own = await db.query<{
    record: { records: Record<string, unknown>[]; more: boolean };
  }>("select public.member_form_history($1) record", [member]);
  expect(own.rows[0].record.records).toHaveLength(1);
  expect(Object.keys(own.rows[0].record.records[0]).sort()).toEqual([
    "created_at",
    "id",
    "kind",
  ]);
  expect(own.rows[0].record.more).toBe(false);
  const someoneElse = await db.query<{ record: { records: unknown[] } }>(
    "select public.member_form_history($1) record",
    [other],
  );
  expect(someoneElse.rows[0].record.records).toEqual([]);
  await expect(
    db.query("select public.member_form_history($1,-1)", [member]),
  ).rejects.toMatchObject({ code: "22023" });
  await expect(
    db.query("select public.member_form_history(null)"),
  ).rejects.toMatchObject({ code: "42501" });
});
