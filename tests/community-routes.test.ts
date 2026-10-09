import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/community/config", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("@/lib/community/config")>();
  return { ...original, dataConfig: vi.fn(), communityConfig: vi.fn() };
});
vi.mock("@/lib/community/supabase", () => ({
  staffUser: vi.fn(),
  serviceClient: vi.fn(),
  userClient: vi.fn(),
}));

import { communityConfig, dataConfig } from "@/lib/community/config";
import { staffUser, userClient } from "@/lib/community/supabase";
import { POST as submitInquiry } from "@/app/api/inquiries/route";
import { POST as saveContent } from "@/app/api/team/content/route";
import { GET as loadTeam } from "@/app/api/team/route";
import { GET as startGoogle } from "@/app/auth/sign-in/route";
import { GET as finishGoogle } from "@/app/auth/callback/route";

const request = (url: string, origin: string) =>
  new NextRequest(url, {
    method: "POST",
    headers: {
      origin,
      "content-type": "application/json",
      "sec-fetch-site": "same-origin",
    },
    body: JSON.stringify({
      name: "Sam",
      email: "sam@example.com",
      serviceInterest: "Visit",
      consent: true,
    }),
  });

describe("HTTP route fail-closed states", () => {
  beforeEach(() => {
    vi.mocked(dataConfig).mockReset();
    vi.mocked(staffUser).mockReset();
    vi.mocked(communityConfig).mockReset();
    vi.mocked(userClient).mockReset();
  });

  it("rejects cross-origin inquiry writes before any service access", async () => {
    const response = await submitInquiry(
      request("http://127.0.0.1:3001/api/inquiries", "https://other.example"),
    );
    expect(response.status).toBe(403);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(dataConfig).not.toHaveBeenCalled();
  });

  it("exposes an explicit missing-configuration response for inquiry writes", async () => {
    vi.mocked(dataConfig).mockReturnValue(null);
    const response = await submitInquiry(
      request("http://127.0.0.1:3001/api/inquiries", "http://127.0.0.1:3001"),
    );
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({
      error: expect.stringContaining("not available"),
    });
  });

  it("denies team reads and writes without current staff membership", async () => {
    vi.mocked(dataConfig).mockReturnValue({
      url: "https://example.supabase.co",
      publishableKey: "public",
      origin: "http://127.0.0.1:3001",
      secret: "secret",
      pepper: "p".repeat(32),
    });
    vi.mocked(staffUser).mockResolvedValue(null);
    const read = await loadTeam(
      new NextRequest("http://127.0.0.1:3001/api/team"),
    );
    const write = await saveContent(
      request(
        "http://127.0.0.1:3001/api/team/content",
        "http://127.0.0.1:3001",
      ),
    );
    expect(read.status).toBe(403);
    expect(write.status).toBe(403);
    expect(await read.json()).toEqual({ error: "Team access denied." });
  });

  it("accepts NextRequest localhost normalization only for same-port loopback OAuth", async () => {
    vi.mocked(communityConfig).mockReturnValue({
      url: "https://example.supabase.co",
      publishableKey: "public",
      origin: "http://127.0.0.1:3001",
    });
    const signInWithOAuth = vi.fn().mockResolvedValue({
      data: { url: "https://example.supabase.co/auth/v1/authorize" },
      error: null,
    });
    const exchangeCodeForSession = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(userClient).mockResolvedValue({
      auth: { signInWithOAuth, exchangeCodeForSession },
    } as never);
    const start = await startGoogle(
      new NextRequest("http://127.0.0.1:3001/auth/sign-in?next=/team"),
    );
    expect(start.status).toBe(307);
    expect(signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: { redirectTo: "http://127.0.0.1:3001/auth/callback" },
    });
    expect(start.cookies.get("envet-auth-next")?.value).toBe("/team");
    const finish = await finishGoogle(
      new NextRequest("http://127.0.0.1:3001/auth/callback?code=one-time", {
        headers: { cookie: "envet-auth-next=%2Fteam" },
      }),
    );
    expect(exchangeCodeForSession).toHaveBeenCalledWith("one-time");
    expect(finish.headers.get("location")).toBe("http://127.0.0.1:3001/team");
    expect(finish.cookies.get("envet-auth-next")?.maxAge).toBe(0);
  });
});
