import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { encrypt, decrypt } from "@/lib/forms/crypto";
import { screeningFixture } from "./fixtures/pre-visit";
const staff = "11111111-1111-4111-8111-111111111111",
  member = "22222222-2222-4222-8222-222222222222",
  other = "33333333-3333-4333-8333-333333333333",
  form = "44444444-4444-4444-8444-444444444444",
  horse = "55555555-5555-4555-8555-555555555555",
  key = "a".repeat(64),
  record = {
    keyId: "test",
    iv: "synthetic",
    tag: "synthetic",
    ciphertext: "synthetic test-only ciphertext",
  };
let db: PGlite;
beforeAll(async () => {
  db = new PGlite();
  await db.exec(
    `create role anon; create role authenticated; create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);insert into auth.users values('${staff}'),('${member}'),('${other}');`,
  );
  for (const suffix of [
    "community_workspace.sql",
    "community_foreign_key_indexes.sql",
    "protected_signed_forms.sql",
  ]) {
    const file = readdirSync(join(process.cwd(), "supabase/migrations")).find(
      (f) => f.endsWith(suffix),
    );
    if (!file) throw new Error("Migration missing");
    await db.exec(
      readFileSync(join(process.cwd(), "supabase/migrations", file), "utf8"),
    );
  }
  await db.exec(
    `insert into private.staff_members(user_id) values('${staff}');`,
  );
  await db.exec("set role service_role");
  await db.query(
    "select public.staff_save_content($1,'service','farm-visit','Farm visit','Test-only synthetic service description','', 'published',null)",
    [staff],
  );
});
afterAll(async () => db?.close());
async function submit(
  id: string,
  kind = "liability",
  request = id,
  fingerprint = key,
) {
  return db.query<{ id: string }>(
    "select public.submit_signed_form($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9) id",
    [
      id,
      member,
      request,
      kind,
      `${kind}-test-source-version`,
      fingerprint,
      key,
      JSON.stringify(record),
      key,
    ],
  );
}
describe("private signed evidence, reviews and attendance in isolated Postgres", () => {
  it("commits one immutable record and review, replays without duplication, rejects changed replay", async () => {
    expect((await submit(form)).rows[0].id).toBe(form);
    expect((await submit(other, "liability", form)).rows[0].id).toBe(form);
    await expect(
      submit(other, "liability", form, "b".repeat(64)),
    ).rejects.toMatchObject({ code: "P0002" });
    const count = await db.query<{ n: number }>(
      "select count(*)::int n from private.signed_forms",
    );
    expect(count.rows[0].n).toBe(1);
    await expect(
      db.query("update private.signed_forms set kind='donation' where id=$1", [
        form,
      ]),
    ).rejects.toMatchObject({ code: "42501" });
  });
  it("denies direct anon/member access and all new RPC execution", async () => {
    for (const role of ["anon", "authenticated"]) {
      await db.exec(`set role ${role}`);
      await expect(
        db.query("select * from private.signed_forms"),
      ).rejects.toMatchObject({ code: "42501" });
      await expect(
        db.query("select public.read_signed_form($1,$2,false)", [member, form]),
      ).rejects.toMatchObject({ code: "42501" });
      await expect(
        db.query("select public.staff_program_metrics($1)", [staff]),
      ).rejects.toMatchObject({ code: "42501" });
    }
    await db.exec("set role service_role");
  });
  it("returns receipts only to signer or current staff and audits explicit staff reads", async () => {
    expect(
      (
        await db.query<{ r: unknown }>(
          "select public.read_signed_form($1,$2,false) r",
          [other, form],
        )
      ).rows[0].r,
    ).toBeNull();
    expect(
      (
        await db.query<{ r: unknown }>(
          "select public.read_signed_form($1,$2,false) r",
          [member, form],
        )
      ).rows[0].r,
    ).not.toBeNull();
    await expect(
      db.query("select public.read_signed_form($1,$2,true)", [other, form]),
    ).rejects.toMatchObject({ code: "42501" });
    expect(
      (
        await db.query<{ r: unknown }>(
          "select public.read_signed_form($1,$2,true) r",
          [staff, form],
        )
      ).rows[0].r,
    ).not.toBeNull();
    expect(
      (
        await db.query<{ n: number }>(
          "select count(*)::int n from private.staff_audit where action='read'",
        )
      ).rows[0].n,
    ).toBe(1);
  });
  it("reviews with version checks and keeps candidate outcomes distinct from guest records", async () => {
    await expect(
      db.query(
        "select public.staff_review_form($1,$2,1,'accepted',$3,$4::jsonb,null)",
        [staff, form, other, JSON.stringify(record)],
      ),
    ).rejects.toMatchObject({ code: "22023" });
    await db.query(
      "select public.staff_review_form($1,$2,1,'reviewed',$3,$4::jsonb,null)",
      [staff, form, other, JSON.stringify(record)],
    );
    await expect(
      db.query(
        "select public.staff_review_form($1,$2,1,'reviewed',$3,$4::jsonb,null)",
        [staff, form, member, JSON.stringify(record)],
      ),
    ).rejects.toMatchObject({ code: "P0002" });
    await submit(horse, "donation");
    await db.query(
      "select public.staff_review_form($1,$2,1,'trial',$3,$4::jsonb,null)",
      [staff, horse, member, JSON.stringify(record)],
    );
  });
  it("counts no visits from waivers or horse applications; attendance is explicit and duplicate-safe", async () => {
    const before = await db.query<{
      m: { visits: number; participants: number };
    }>("select public.staff_program_metrics($1,90) m", [staff]);
    expect(before.rows[0].m.visits).toBe(0);
    expect(before.rows[0].m.participants).toBe(0);
    const day = (
      await db.query<{ d: string }>(
        "select ((now() at time zone 'America/New_York')::date)::text d",
      )
    ).rows[0].d;
    await db.query(
      "select public.staff_record_visit($1,$2,$3,$4,$5,'morning','farm-visit')",
      [staff, member, member, form, day],
    );
    expect(
      (
        await db.query<{ id: string }>(
          "select public.staff_record_visit($1,$2,$3,$4,$5,'morning','farm-visit') id",
          [staff, other, member, form, day],
        )
      ).rows[0].id,
    ).toBe(member);
    await expect(
      db.query(
        "select public.staff_record_visit($1,$2,$3,$4,$5,'morning','farm-visit')",
        [staff, other, other, form, day],
      ),
    ).rejects.toMatchObject({ code: "23505" });
    await db.query(
      "select public.staff_record_visit($1,$2,$3,$4,$5,'afternoon','farm-visit')",
      [staff, other, other, form, day],
    );
    const after = await db.query<{
      m: {
        visits: number;
        participants: number;
        repeat_participants: number;
        daily: unknown[];
      };
    }>("select public.staff_program_metrics($1,90) m", [staff]);
    expect(after.rows[0].m).toMatchObject({
      visits: 2,
      participants: 1,
      repeat_participants: 1,
    });
    expect(after.rows[0].m.daily).toHaveLength(90);
    expect(JSON.stringify(after.rows[0].m)).not.toMatch(
      /protected_record|ciphertext|signer_id|participant_id|@|signature/,
    );
  });
  it("voids instead of erasing mistaken visits and removes them from aggregate totals", async () => {
    await db.query("select public.staff_void_visit($1,$2,'entry_error')", [
      staff,
      other,
    ]);
    const metrics = await db.query<{
      m: { visits: number; repeat_participants: number };
    }>("select public.staff_program_metrics($1,90) m", [staff]);
    expect(metrics.rows[0].m).toMatchObject({
      visits: 1,
      repeat_participants: 0,
    });
    expect(
      (
        await db.query<{ n: number }>(
          "select count(*)::int n from private.program_visits",
        )
      ).rows[0].n,
    ).toBe(2);
    await expect(
      db.query(
        "select public.staff_record_visit($1,$2,$3,$4,'2099-01-01','future','farm-visit')",
        [staff, horse, horse, form],
      ),
    ).rejects.toMatchObject({ code: "22023" });
  });
  it("requires a published service for new attendance while preserving earlier nonce replay after archival", async () => {
    const day = (
      await db.query<{ d: string }>(
        "select ((now() at time zone 'America/New_York')::date)::text d",
      )
    ).rows[0].d;
    for (const state of ["draft", "archived"]) {
      await db.query(
        "select public.staff_save_content($1,'service',$2,'Unpublished','Test-only service description','',$3,null)",
        [staff, `${state}-service`, state],
      );
      await expect(
        db.query(
          "select public.staff_record_visit($1,$2,$3,$4,$5,'unpublished',$6)",
          [staff, horse, horse, form, day, `${state}-service`],
        ),
      ).rejects.toMatchObject({ code: "22023" });
    }
    await db.query(
      "select public.staff_save_content($1,'service','farm-visit','Farm visit','Test-only synthetic service description','', 'archived',1)",
      [staff],
    );
    expect(
      (
        await db.query<{ id: string }>(
          "select public.staff_record_visit($1,$2,$3,$4,$5,'morning','farm-visit') id",
          [staff, horse, member, form, day],
        )
      ).rows[0].id,
    ).toBe(member);
    await expect(
      db.query(
        "select public.staff_record_visit($1,$2,$3,$4,$5,'new-archived','farm-visit')",
        [staff, horse, horse, form, day],
      ),
    ).rejects.toMatchObject({ code: "22023" });
    expect(
      (
        await db.query<{ n: number }>(
          "select count(*)::int n from private.program_visits",
        )
      ).rows[0].n,
    ).toBe(2);
  });
  it("uses a common per-form guard before identity invariants and forbids relinking attendance history", async () => {
    const definitions = await db.query<{ name: string; body: string }>(
      "select proname name, pg_get_functiondef(oid) body from pg_proc where proname in ('staff_review_form','staff_record_visit')",
    );
    for (const entry of definitions.rows) {
      const lock = entry.body.indexOf("hashtextextended('signed-form:'");
      expect(lock).toBeGreaterThan(-1);
      const invariant = entry.body.indexOf(
        entry.name === "staff_review_form"
          ? "exists(select 1 from private.program_visits"
          : "select participant_id into participant",
      );
      expect(invariant).toBeGreaterThan(lock);
    }
    const original = (
      await db.query<{ id: string }>(
        "select participant_id id from private.form_participants where form_id=$1",
        [form],
      )
    ).rows[0].id;
    await db.exec("reset role");
    await db.query(
      "insert into private.form_participants(form_id,participant_id) values($1,$2)",
      [horse, other],
    );
    await db.exec("set role service_role");
    await expect(
      db.query(
        "select public.staff_review_form($1,$2,2,'reviewed',$3,$4::jsonb,$5)",
        [staff, form, horse, JSON.stringify(record), other],
      ),
    ).rejects.toMatchObject({ code: "P0002" });
    expect(
      (
        await db.query<{ id: string }>(
          "select participant_id id from private.form_participants where form_id=$1",
          [form],
        )
      ).rows[0].id,
    ).toBe(original);
  });
  it("stores screening as private encrypted review evidence without changing signed content or counting another visit", async () => {
    const event = "66666666-6666-4666-8666-666666666666";
    vi.stubEnv(
      "FORM_ENCRYPTION_KEYS",
      JSON.stringify({ synthetic: Buffer.alloc(32, 7).toString("base64") }),
    );
    vi.stubEnv("FORM_ACTIVE_KEY_ID", "synthetic");
    try {
      const screening = screeningFixture();
      const context = `${form}:${event}:review:v1`;
      const box = encrypt(screening, context);
      await db.query(
        "select public.staff_review_form($1,$2,2,'reviewed',$3,$4::jsonb,null)",
        [staff, form, event, JSON.stringify(box)],
      );
      const staffRecord = (
        await db.query<{
          r: {
            evaluation: { protected_evaluation: typeof box };
            protected_record: typeof record;
          };
        }>("select public.read_signed_form($1,$2,true) r", [staff, form])
      ).rows[0].r;
      expect(staffRecord.protected_record).toEqual(record);
      expect(JSON.stringify(staffRecord.evaluation)).not.toContain(
        "family_veteran",
      );
      expect(
        decrypt(staffRecord.evaluation.protected_evaluation, context),
      ).toEqual(screening);
      const own = (
        await db.query<{ r: { evaluation: unknown } }>(
          "select public.read_signed_form($1,$2,false) r",
          [member, form],
        )
      ).rows[0].r;
      expect(own.evaluation).toBeNull();
      const metrics = (
        await db.query<{ m: { visits: number } }>(
          "select public.staff_program_metrics($1,90) m",
          [staff],
        )
      ).rows[0].m;
      expect(metrics.visits).toBe(1);
      expect(JSON.stringify(metrics)).not.toMatch(
        /pvAffiliation|family_veteran|pvEligibility/,
      );
    } finally {
      vi.unstubAllEnvs();
    }
  });
  it("preserves evidence after Google account removal, never grants ordinary staff deletion, rechecks revoked staff", async () => {
    await db.exec("reset role");
    await db.query("delete from auth.users where id=$1", [member]);
    expect(
      (
        await db.query<{ n: number }>(
          "select count(*)::int n from private.signed_forms",
        )
      ).rows[0].n,
    ).toBe(2);
    await db.exec("set role service_role");
    await expect(
      db.query("delete from private.signed_forms where id=$1", [form]),
    ).rejects.toMatchObject({ code: "42501" });
    await db.query("delete from private.staff_members where user_id=$1", [
      staff,
    ]);
    await expect(
      db.query("select public.staff_form_queue($1)", [staff]),
    ).rejects.toMatchObject({ code: "42501" });
    await expect(
      db.query("select public.staff_program_metrics($1)", [staff]),
    ).rejects.toMatchObject({ code: "42501" });
  });
});
