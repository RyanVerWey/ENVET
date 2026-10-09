import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const staff = "11111111-1111-4111-8111-111111111111";
const member = "22222222-2222-4222-8222-222222222222";
const stranger = "33333333-3333-4333-8333-333333333333";
const key = "a".repeat(64);
let db: PGlite;

beforeAll(async () => {
  db = new PGlite();
  await db.exec(`
    create role anon;
    create role authenticated;
    create role service_role bypassrls;
    create schema auth;
    create table auth.users(id uuid primary key);
    insert into auth.users values ('${staff}'), ('${member}'), ('${stranger}');
  `);
  const migration = readdirSync(
    join(process.cwd(), "supabase", "migrations"),
  ).find((file) => file.endsWith("_community_workspace.sql"));
  if (!migration) throw new Error("Community migration missing");
  await db.exec(
    readFileSync(
      join(process.cwd(), "supabase", "migrations", migration),
      "utf8",
    ),
  );
  await db.query("insert into private.staff_members(user_id) values ($1)", [
    staff,
  ]);
});

afterAll(async () => {
  await db?.close();
});

describe("community migration boundaries in isolated Postgres", () => {
  it("passes the post-migration RLS and grant audit", async () => {
    await db.exec(
      readFileSync(
        join(process.cwd(), "supabase", "tests", "community_security.sql"),
        "utf8",
      ),
    );
  });

  it("keeps private records and mutation RPCs away from anon and members", async () => {
    await db.exec("set role service_role");
    await db.query(
      "select public.staff_save_content($1,'horse','horse-one','Horse One','A grounded public summary','', 'published', null)",
      [staff],
    );
    await db.query(
      "select public.staff_save_content($1,'horse','horse-two','Horse Two','A private draft summary','', 'draft', null)",
      [staff],
    );
    await db.exec("reset role");

    await db.exec("set role anon");
    try {
      await expect(
        db.query("select * from private.inquiries"),
      ).rejects.toMatchObject({ code: "42501" });
      await expect(
        db.query("select * from public.comments"),
      ).rejects.toMatchObject({ code: "42501" });
      await expect(
        db.query(
          "select public.submit_inquiry('Sam','sam@example.com',null,'Visit','',true,$1,$2)",
          [key, key],
        ),
      ).rejects.toMatchObject({ code: "42501" });
      const horses = await db.query<{ slug: string }>(
        "select slug from public.horses order by slug",
      );
      expect(horses.rows.map((horse) => horse.slug)).toEqual(["horse-one"]);
      await expect(
        db.query("select public.staff_dashboard($1)", [staff]),
      ).rejects.toMatchObject({ code: "42501" });
    } finally {
      await db.exec("reset role");
    }

    await db.exec("set role authenticated");
    try {
      await expect(
        db.query("insert into private.staff_members(user_id) values ($1)", [
          stranger,
        ]),
      ).rejects.toMatchObject({ code: "42501" });
      await expect(
        db.query(
          "insert into public.article_likes(article_slug,user_id) values ('first-visit-to-envet',$1)",
          [member],
        ),
      ).rejects.toMatchObject({ code: "42501" });
      await expect(
        db.query(
          "select public.staff_save_content($1,'horse','evil','Evil','A public summary','', 'published', null)",
          [member],
        ),
      ).rejects.toMatchObject({ code: "42501" });
      await expect(
        db.query("select public.staff_dashboard($1)", [stranger]),
      ).rejects.toMatchObject({ code: "42501" });
    } finally {
      await db.exec("reset role");
    }
  });

  it("publishes valid comments immediately but keeps author deletion and staff hiding separate", async () => {
    await db.exec("set role service_role");
    try {
      const created = await db.query<{ id: string }>(
        "select public.create_comment('first-visit-to-envet',$1,'A helpful note',$2) as id",
        [member, "c".repeat(64)],
      );
      const id = created.rows[0].id;
      const published = await db.query<{ state: string }>(
        "select state from public.comments where id=$1",
        [id],
      );
      expect(published.rows[0].state).toBe("published");
      const wrongAuthor = await db.query<{ removed: boolean }>(
        "select public.remove_comment($1,$2) as removed",
        [id, stranger],
      );
      expect(wrongAuthor.rows[0].removed).toBe(false);
      const stillPublished = await db.query<{ state: string }>(
        "select state from public.comments where id=$1",
        [id],
      );
      expect(stillPublished.rows[0].state).toBe("published");
      const hidden = await db.query<{ hidden: boolean }>(
        "select public.staff_hide_comment($1,$2) as hidden",
        [staff, id],
      );
      expect(hidden.rows[0].hidden).toBe(true);
      const afterHide = await db.query<{ state: string }>(
        "select state from public.comments where id=$1",
        [id],
      );
      expect(afterHide.rows[0].state).toBe("hidden");
    } finally {
      await db.exec("reset role");
    }
  });

  it("hides draft and archived services and rejects stale staff edits without overwrite", async () => {
    await db.exec("set role service_role");
    try {
      await db.query(
        "select public.staff_save_content($1,'service','draft-service','Draft Service','A useful private summary','', 'draft', null)",
        [staff],
      );
      await db.query(
        "select public.staff_save_content($1,'service','archived-service','Archived Service','A retired public summary','', 'published', null)",
        [staff],
      );
      await db.query(
        "select public.staff_save_content($1,'service','archived-service','Archived Service','A retired public summary','', 'archived', 1)",
        [staff],
      );
      await db.query(
        "select public.staff_save_content($1,'service','active-service','Active Service','A current public summary','', 'published', null)",
        [staff],
      );
      await expect(
        db.query(
          "select public.staff_save_content($1,'service','active-service','Stale title','A stale public summary','', 'published', 0)",
          [staff],
        ),
      ).rejects.toMatchObject({
        code: "P0002",
        message: "content changed; reload before saving",
      });
      const current = await db.query<{ title: string; version: number }>(
        "select title,version from public.services where slug='active-service'",
      );
      expect(current.rows[0]).toMatchObject({
        title: "Active Service",
        version: 1,
      });
    } finally {
      await db.exec("reset role");
    }
    await db.exec("set role anon");
    try {
      const services = await db.query<{ slug: string }>(
        "select slug from public.services order by slug",
      );
      expect(services.rows.map((service) => service.slug)).toEqual([
        "active-service",
      ]);
    } finally {
      await db.exec("reset role");
    }
  });

  it("rejects inquiry writes without contact or explicit consent at the database boundary", async () => {
    await db.exec("set role service_role");
    try {
      await expect(
        db.query(
          "select public.submit_inquiry('Sam',null,null,'Visit','',true,$1,$2)",
          ["d".repeat(64), "e".repeat(64)],
        ),
      ).rejects.toMatchObject({ code: "23514" });
      await expect(
        db.query(
          "select public.submit_inquiry('Sam','sam@example.com',null,'Visit','',false,$1,$2)",
          ["d".repeat(64), "e".repeat(64)],
        ),
      ).rejects.toMatchObject({
        code: "22023",
        message: "contact permission required",
      });
    } finally {
      await db.exec("reset role");
    }
  });

  it("pages older retained inquiries and reports exactly 30 UTC dates", async () => {
    await db.exec("set role service_role");
    await db.exec("begin");
    try {
      await db.exec(`
        insert into private.inquiries(name,email,service_interest,consent_at)
        select 'Visitor ' || n, 'visitor' || n || '@example.com', 'Visit', now()
        from generate_series(1,101) as n;
        insert into private.daily_page_counts(day,path,views) values
          ((now() at time zone 'UTC')::date - 29, '/included', 1),
          ((now() at time zone 'UTC')::date - 30, '/excluded', 1);
      `);
      const page0 = await db.query<{
        entries: number;
        more: boolean;
        included: boolean;
        excluded: boolean;
      }>(
        `
        select jsonb_array_length(d->'inquiries') as entries,
          (d->>'more_inquiries')::boolean as more,
          d->'pages' @> '[{"path":"/included"}]'::jsonb as included,
          d->'pages' @> '[{"path":"/excluded"}]'::jsonb as excluded
        from (select public.staff_dashboard($1,0) as d) x`,
        [staff],
      );
      expect(page0.rows[0]).toMatchObject({
        entries: 100,
        more: true,
        included: true,
        excluded: false,
      });
      const page1 = await db.query<{ entries: number; more: boolean }>(
        `
        select jsonb_array_length(d->'inquiries') as entries,
          (d->>'more_inquiries')::boolean as more
        from (select public.staff_dashboard($1,1) as d) x`,
        [staff],
      );
      expect(page1.rows[0]).toMatchObject({ entries: 1, more: false });
    } finally {
      await db.exec("rollback");
      await db.exec("reset role");
    }
  });

  it("keeps a reported older comment actionable independently of the comments page", async () => {
    await db.exec("set role service_role");
    await db.exec("begin");
    try {
      await db.query(
        `
        insert into public.comments(article_slug,author_id,body,created_at)
        select 'first-visit-to-envet',$1,'Moderation target ' || n,
               now() - make_interval(secs => 102 - n)
        from generate_series(1,101) as n`,
        [member],
      );
      const oldest = await db.query<{ id: string }>(
        "select id from public.comments where body='Moderation target 1'",
        [],
      );
      const id = oldest.rows[0].id;
      await db.query(
        "insert into public.comment_reports(comment_id,reporter_id,reason) values ($1,$2,'privacy')",
        [id, stranger],
      );
      const dashboard = await db.query<{
        shown: boolean;
        body: string;
        state: string;
        slug: string;
      }>(
        `
        with d as (select public.staff_dashboard($1,0) as data)
        select exists(select 1 from jsonb_array_elements(data->'comments') c where c->>'id'=$2) as shown,
               data->'reports'->0->>'body' as body,
               data->'reports'->0->>'state' as state,
               data->'reports'->0->>'article_slug' as slug
        from d`,
        [staff, id],
      );
      expect(dashboard.rows[0]).toMatchObject({
        shown: false,
        body: "Moderation target 1",
        state: "published",
        slug: "first-visit-to-envet",
      });
      await db.query("select public.staff_hide_comment($1,$2)", [staff, id]);
      const after = await db.query<{ state: string }>(
        "select data->'reports'->0->>'state' as state from (select public.staff_dashboard($1,0) as data) d",
        [staff],
      );
      expect(after.rows[0].state).toBe("hidden");
    } finally {
      await db.exec("rollback");
      await db.exec("reset role");
    }
  });

  it("enforces staff revocation, unique likes, comment limits, and manual inquiry deletion", async () => {
    await db.exec("set role service_role");
    try {
      await db.query(
        "select public.add_article_like('first-visit-to-envet',$1,$2)",
        [member, key],
      );
      await db.query(
        "select public.add_article_like('first-visit-to-envet',$1,$2)",
        [member, key],
      );
      const likes = await db.query<{ count: number }>(
        "select count(*)::int as count from public.article_likes",
      );
      expect(likes.rows[0].count).toBe(1);

      for (let i = 0; i < 5; i++)
        await db.query(
          "select public.create_comment('first-visit-to-envet',$1,$2,$3)",
          [member, `Plain comment ${i}`, key],
        );
      await expect(
        db.query(
          "select public.create_comment('first-visit-to-envet',$1,'Sixth comment',$2)",
          [member, key],
        ),
      ).rejects.toThrow(/rate limited/);

      const inquiry = await db.query<{ id: string }>(
        "select public.submit_inquiry('Sam','sam@example.com',null,'Visit','Please call',true,$1,$2) as id",
        [key, "b".repeat(64)],
      );
      const id = inquiry.rows[0].id;
      await db.query("select public.staff_set_inquiry_status($1,$2,'closed')", [
        staff,
        id,
      ]);
      const closed = await db.query<{ status: string }>(
        "select status from private.inquiries where id=$1",
        [id],
      );
      expect(closed.rows[0].status).toBe("closed");
      await db.query("select public.staff_delete_inquiry($1,$2)", [staff, id]);
      const remaining = await db.query(
        "select id from private.inquiries where id=$1",
        [id],
      );
      expect(remaining.rows).toHaveLength(0);

      await db.query("delete from private.staff_members where user_id=$1", [
        staff,
      ]);
      await expect(
        db.query(
          "select public.staff_save_content($1,'horse','horse-three','Horse Three','A public summary','', 'published', null)",
          [staff],
        ),
      ).rejects.toMatchObject({
        code: "42501",
        message: "staff access denied",
      });
      await expect(
        db.query("select public.staff_delete_inquiry($1,$2)", [staff, id]),
      ).rejects.toMatchObject({
        code: "42501",
        message: "staff access denied",
      });
      await expect(
        db.query("select public.staff_dashboard($1)", [staff]),
      ).rejects.toMatchObject({
        code: "42501",
        message: "staff access denied",
      });
    } finally {
      await db.exec("reset role");
    }
  });
});
