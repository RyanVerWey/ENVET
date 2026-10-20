import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@supabase/ssr", () => ({ createServerClient: vi.fn() }));
import { createServerClient } from "@supabase/ssr";
import { proxy } from "@/proxy";
import { domainDestination, managementUrl, portalOrigin } from "@/lib/domains";
import { oauthRequestOrigin } from "@/lib/community/config";
import { sameOrigin } from "@/lib/community/security";

vi.mock("server-only", () => ({}));

describe("explicit public/management domain split", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_PORTAL_URL", "https://portal.envet.org");
    vi.stubEnv("AUTH_REDIRECT_ORIGIN", "https://envet.org");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "public");
    vi.mocked(createServerClient).mockReset();
    vi.mocked(createServerClient).mockReturnValue({
      auth: { getClaims: vi.fn().mockResolvedValue({ data: null }) },
    } as never);
  });
  afterEach(() => vi.unstubAllEnvs());

  it("requires exact opt-in and keeps local/preview workspaces local", () => {
    expect(managementUrl()).toBe("https://portal.envet.org/team");
    for (const origin of [
      "http://localhost:3001",
      "http://127.0.0.1:3001",
      "https://preview.vercel.app",
      "https://envet.org.evil.example",
      "https://envet.org:444",
    ])
      expect(domainDestination(`${origin}/team`)).toBeNull();
    for (const value of [
      "",
      "https://evil.example",
      "http://portal.envet.org",
      "https://portal.envet.org:444",
      "https://portal.envet.org/",
    ]) {
      vi.stubEnv("NEXT_PUBLIC_PORTAL_URL", value);
      expect(portalOrigin()).toBeNull();
      expect(managementUrl()).toBe("/team");
      expect(domainDestination("https://envet.org/team")).toBeNull();
    }
  });

  it("preserves management deep links and never loops", () => {
    for (const path of ["/team", "/team/animals", "/team/forms?page=2"]) {
      const destination = domainDestination(`https://envet.org${path}`);
      expect(destination).toBe(`https://portal.envet.org${path}`);
      expect(domainDestination(destination!)).toBeNull();
    }
    expect(domainDestination("https://envet.org/teammate")).toBeNull();
    expect(domainDestination("https://portal.envet.org/?from=bookmark")).toBe(
      "https://portal.envet.org/team?from=bookmark",
    );
    expect(domainDestination("https://portal.envet.org//evil.example")).toBe(
      "https://envet.org//evil.example",
    );
    expect(
      domainDestination(
        "https://envet.org/team?tab=animals&code=synthetic&access_token=synthetic&token_hash=synthetic#fragment",
      ),
    ).toBe("https://portal.envet.org/team?tab=animals");
  });

  it("canonicalizes marketing/discovery and keeps portal APIs/auth/assets local", () => {
    for (const path of [
      "/about",
      "/blog/first-visit-to-envet?share=1",
      "/forms/liability",
      "/sitemap.xml",
      "/feed.xml",
    ])
      expect(domainDestination(`https://portal.envet.org${path}`)).toBe(
        `https://envet.org${path}`,
      );
    for (const path of [
      "/auth/sign-in?next=/team",
      "/auth/callback?code=not-a-real-code",
      "/auth/sign-out",
      "/account",
      "/api/team/animals",
      "/api/account/session",
      "/_next/static/chunk.js",
      "/images/envet-logo.jpg",
      "/icon.svg",
      "/robots.txt",
    ])
      expect(domainDestination(`https://portal.envet.org${path}`)).toBeNull();
  });

  it("only redirects safe navigation; does not replay submitted bodies", async () => {
    const read = await proxy(
      new NextRequest("https://envet.org/team/forms?page=2"),
    );
    expect(read.status).toBe(308);
    expect(read.headers.get("location")).toBe(
      "https://portal.envet.org/team/forms?page=2",
    );
    expect(createServerClient).not.toHaveBeenCalled();
    const write = await proxy(
      new NextRequest("https://envet.org/team/forms", { method: "POST" }),
    );
    expect(write.status).toBe(409);
    expect(write.headers.get("location")).toBeNull();
    expect(write.headers.get("cache-control")).toContain("no-store");
  });

  it("portal robots deny all; public marketing never touches session state", async () => {
    const robots = await proxy(
      new NextRequest("https://portal.envet.org/robots.txt"),
    );
    expect(await robots.text()).toBe("User-agent: *\nDisallow: /\n");
    expect(robots.headers.get("x-robots-tag")).toContain("noindex");
    expect(createServerClient).not.toHaveBeenCalled();
    const publicPage = await proxy(new NextRequest("https://envet.org/about"));
    expect(publicPage.headers.get("cache-control")).toBeNull();
    expect(createServerClient).not.toHaveBeenCalled();
    const team = await proxy(new NextRequest("https://portal.envet.org/team"));
    expect(team.headers.get("cache-control")).toContain("no-store");
    expect(team.headers.get("x-robots-tag")).toContain("noindex");
    expect(createServerClient).toHaveBeenCalledOnce();
    const cookieOptions =
      vi.mocked(createServerClient).mock.calls[0][2]!.cookieOptions!;
    expect(cookieOptions).toMatchObject({
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
    });
    expect(cookieOptions).not.toHaveProperty("domain");
  });

  it.each([
    "/api/unknown-not-found",
    "/auth/sign-out",
    "/auth/unknown-not-found",
  ])(
    "keeps noindex/no-store on private namespaces including denied/unknown route %s",
    async (path) => {
      const response = await proxy(
        new NextRequest(`https://portal.envet.org${path}`),
      );
      expect(response.headers.get("x-robots-tag")).toBe("noindex, nofollow");
      expect(response.headers.get("cache-control")).toContain("no-store");
      // Configuration failures must not weaken namespace response headers.
      vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
      const unavailable = await proxy(
        new NextRequest(`https://portal.envet.org${path}`),
      );
      expect(unavailable.headers.get("x-robots-tag")).toBe("noindex, nofollow");
      expect(unavailable.headers.get("cache-control")).toContain("no-store");
    },
  );

  it("accepts exactly two configured production callback origins, not sibling wildcards", () => {
    for (const origin of ["https://envet.org", "https://portal.envet.org"])
      expect(
        oauthRequestOrigin(
          `${origin}/auth/callback`,
          "evil.example",
          "https://envet.org",
        ),
      ).toBe(origin);
    for (const origin of [
      "https://envet.info",
      "https://www.envet.org",
      "https://portal.envet.org.evil.example",
      "https://portal.envet.org:444",
      "http://portal.envet.org",
      "http://localhost:3001",
    ])
      expect(
        oauthRequestOrigin(
          `${origin}/auth/callback`,
          null,
          "https://envet.org",
        ),
      ).toBeNull();
    expect(
      oauthRequestOrigin(
        "https://portal.envet.org/auth/callback",
        null,
        "https://envet.info",
      ),
    ).toBeNull();
    vi.stubEnv("NEXT_PUBLIC_PORTAL_URL", "");
    expect(
      oauthRequestOrigin(
        "https://portal.envet.org/auth/callback",
        null,
        "https://envet.org",
      ),
    ).toBeNull();
  });

  it("retains same-origin CSRF enforcement even for sibling domains", () => {
    const request = (origin: string, fetchSite: string) =>
      new Request("https://portal.envet.org/api/team/content", {
        method: "POST",
        headers: { origin, "sec-fetch-site": fetchSite },
      });
    expect(sameOrigin(request("https://portal.envet.org", "same-origin"))).toBe(
      true,
    );
    expect(sameOrigin(request("https://envet.org", "same-site"))).toBe(false);
    expect(sameOrigin(request("https://envet.org", "same-origin"))).toBe(false);
  });
});
