import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/forms/server", () => ({ collectionEnabled: vi.fn() }));
vi.mock("@/lib/community/config", () => ({ communityConfig: vi.fn() }));
vi.mock("@/lib/community/supabase", () => ({ currentUser: vi.fn() }));

import SigningPage from "@/app/forms/[kind]/page";
import { SigningRoom } from "@/components/forms/signing-room";
import { collectionEnabled } from "@/lib/forms/server";
import { communityConfig } from "@/lib/community/config";
import { currentUser } from "@/lib/community/supabase";

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(collectionEnabled).mockReturnValue(false);
  vi.mocked(communityConfig).mockReturnValue(null);
});

describe("guided signing routes", () => {
  it.each(["liability", "donation"])(
    "keeps %s interactive without authorizing a submission",
    async (kind) => {
      const page = await SigningPage({ params: Promise.resolve({ kind }) });
      expect(page.type).toBe(SigningRoom);
      expect(page.props).toEqual({ kind, enabled: false, signedIn: false });
      expect(currentUser).not.toHaveBeenCalled();
    },
  );

  it("does not fabricate a signed-in user when collection is enabled", async () => {
    vi.mocked(collectionEnabled).mockReturnValue(true);
    const page = await SigningPage({
      params: Promise.resolve({ kind: "liability" }),
    });
    expect(page.props).toEqual({
      kind: "liability",
      enabled: true,
      signedIn: false,
    });
  });

  it("rejects unknown form routes", async () => {
    await expect(
      SigningPage({ params: Promise.resolve({ kind: "unknown" }) }),
    ).rejects.toThrow();
  });
});
