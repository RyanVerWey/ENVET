import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("@/lib/forms/server", () => ({ collectionEnabled: vi.fn() }));
vi.mock("@/lib/forms/crypto", () => ({
  encryptionReady: vi.fn(() => true),
  digest: vi.fn(() => "a".repeat(64)),
  encrypt: vi.fn(() => ({
    keyId: "synthetic",
    ciphertext: "encrypted test fixture",
    iv: "test",
    tag: "test",
  })),
}));
vi.mock("@/lib/community/security", async (original) => ({
  ...(await original<typeof import("@/lib/community/security")>()),
  rateKey: vi.fn(() => "b".repeat(64)),
}));
vi.mock("@/lib/community/supabase", () => ({
  currentUser: vi.fn(),
  staffUser: vi.fn(),
  serviceClient: vi.fn(),
}));
import { collectionEnabled } from "@/lib/forms/server";
import {
  currentUser,
  staffUser,
  serviceClient,
} from "@/lib/community/supabase";
import { POST as sign, GET as receipt } from "@/app/api/forms/route";
import { PATCH as review, GET as queue } from "@/app/api/team/forms/route";
import { POST as visit } from "@/app/api/team/visits/route";
import { GET as metrics } from "@/app/api/team/impact/route";
import {
  formVersion,
  liabilityInitials,
  guardianCertificationText,
  guardianCertificationVersion,
  formSource,
  electronicConsent,
  consentVersion,
} from "@/lib/forms/definition";
import { encrypt } from "@/lib/forms/crypto";
import { screeningFixture } from "./fixtures/pre-visit";
const signer = "11111111-1111-4111-8111-111111111111",
  id = "22222222-2222-4222-8222-222222222222";
const rpc = vi.fn();
const input = {
  kind: "donation",
  version: formVersion("donation"),
  requestId: id,
  fields: {
    ownerName: "Synthetic Owner",
    signedDate: "2026-10-09",
    phone: "540-555-0100",
    email: "test@example.test",
    address: "Synthetic address",
    cityStateZip: "Synthetic city VA 00000",
    barnName: "Synthetic horse",
    breed: "Synthetic breed",
    dobAge: "10 years",
    gender: "Gelding",
    colorMarkings: "Bay",
  },
  minor: false,
  riding: [],
  conditions: [],
  initials: {},
  guestSignature: { method: "typed", name: "Synthetic Owner" },
  guardianSignature: null,
  consent: true,
};
function request(
  path: string,
  value: unknown = input,
  origin = "http://127.0.0.1:3001",
  method = "POST",
) {
  return new Request(`http://127.0.0.1:3001${path}`, {
    method,
    headers: {
      origin,
      "content-type": "application/json",
      "sec-fetch-site": "same-origin",
    },
    body: JSON.stringify(value),
  });
}
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(collectionEnabled).mockReturnValue(true);
  vi.mocked(currentUser).mockResolvedValue({
    id: signer,
    email: "synthetic@example.test",
  } as Awaited<ReturnType<typeof currentUser>>);
  vi.mocked(staffUser).mockResolvedValue(null);
  vi.mocked(serviceClient).mockReturnValue({ rpc } as unknown as NonNullable<
    ReturnType<typeof serviceClient>
  >);
  rpc.mockResolvedValue({ data: id, error: null });
});
describe("signing and staff HTTP boundaries", () => {
  it("encrypts guest screening in the audited review channel, not signed evidence or metrics", async () => {
    vi.mocked(staffUser).mockResolvedValue({ id: signer } as Awaited<
      ReturnType<typeof staffUser>
    >);
    rpc
      .mockResolvedValueOnce({ data: { kind: "liability" }, error: null })
      .mockResolvedValueOnce({ data: true, error: null });
    const screening = screeningFixture();
    const response = await review(
      request(
        "/api/team/forms",
        {
          id,
          kind: "liability",
          status: "needs_followup",
          version: 1,
          participantId: null,
          evaluation: { notes: "Synthetic", ...screening },
        },
        undefined,
        "PATCH",
      ),
    );
    expect(response.status).toBe(200);
    expect(encrypt).toHaveBeenCalledWith(
      expect.objectContaining(screening),
      expect.stringMatching(new RegExp(`^${id}:[0-9a-f-]+:review:v1$`)),
    );
    expect(rpc).toHaveBeenCalledWith(
      "staff_review_form",
      expect.objectContaining({
        p_actor: signer,
        p_expected: 1,
        p_evaluation: expect.objectContaining({
          ciphertext: "encrypted test fixture",
        }),
      }),
    );
    expect(rpc.mock.calls.map(([name]) => name)).toEqual([
      "read_signed_form",
      "staff_review_form",
    ]);
    expect(response.headers.get("cache-control")).toContain("no-store");
  });
  it("rejects invalid screening before encrypting or writing", async () => {
    vi.mocked(staffUser).mockResolvedValue({ id: signer } as Awaited<
      ReturnType<typeof staffUser>
    >);
    rpc.mockResolvedValue({ data: { kind: "liability" }, error: null });
    const response = await review(
      request(
        "/api/team/forms",
        {
          id,
          kind: "liability",
          status: "reviewed",
          version: 1,
          participantId: null,
          evaluation: { ...screeningFixture(), pvAffiliation: "unrelated" },
        },
        undefined,
        "PATCH",
      ),
    );
    expect(response.status).toBe(400);
    expect(encrypt).not.toHaveBeenCalled();
    expect(rpc).toHaveBeenCalledTimes(1);
  });
  it("rejects cross-origin signing before auth/storage, and disabled signing before identity", async () => {
    expect(
      (await sign(request("/api/forms", input, "https://evil.test"))).status,
    ).toBe(403);
    expect(currentUser).not.toHaveBeenCalled();
    vi.mocked(collectionEnabled).mockReturnValue(false);
    expect((await sign(request("/api/forms"))).status).toBe(503);
    expect(currentUser).not.toHaveBeenCalled();
    expect(rpc).not.toHaveBeenCalled();
  });
  it("requires Google identity and denies caller-supplied actors/staff fields", async () => {
    vi.mocked(currentUser).mockResolvedValue(null);
    expect((await sign(request("/api/forms"))).status).toBe(401);
    expect(rpc).not.toHaveBeenCalled();
    vi.mocked(currentUser).mockResolvedValue({
      id: signer,
      email: "synthetic@example.test",
    } as Awaited<ReturnType<typeof currentUser>>);
    expect(
      (await sign(request("/api/forms", { ...input, actorId: id }))).status,
    ).toBe(400);
    expect(
      (
        await sign(
          request("/api/forms", {
            ...input,
            fields: { ...input.fields, accepted: true },
          }),
        )
      ).status,
    ).toBe(400);
    expect(rpc).not.toHaveBeenCalled();
  });
  it("records only server-derived actor and encrypted record, confirms only committed results", async () => {
    const response = await sign(request("/api/forms"));
    expect(response.status).toBe(201);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(await response.json()).toEqual({ submitted: true, id });
    expect(rpc).toHaveBeenCalledWith(
      "submit_signed_form",
      expect.objectContaining({
        p_actor: signer,
        p_request: id,
        p_record: expect.objectContaining({
          ciphertext: "encrypted test fixture",
        }),
      }),
    );
    rpc.mockResolvedValue({ data: null, error: { code: "P0002" } });
    const failed = await sign(request("/api/forms"));
    expect(failed.status).toBe(409);
    expect(await failed.json()).not.toHaveProperty("submitted");
    rpc.mockResolvedValue({ data: null, error: null });
    const unconfirmed = await sign(request("/api/forms"));
    expect(unconfirmed.status).toBe(503);
    expect(await unconfirmed.json()).not.toHaveProperty("submitted");
  });
  it("freezes guardian certification with child details and server-derived submitting-account attribution", async () => {
    const minor = {
      ...input,
      kind: "liability",
      version: formVersion("liability"),
      minor: true,
      guardianCertified: true,
      fields: {
        guestName: "Synthetic Child",
        minorAge: "12",
        guardianName: "Synthetic Guardian",
        signedDate: "2026-10-09",
        address: "Synthetic address",
        phone: "202-555-0100",
        email: "guardian@example.test",
        emergencyName: "Synthetic Emergency",
        emergencyPhone: "202-555-0199",
      },
      initials: {
        ...Object.fromEntries(liabilityInitials.map((i) => [`p${i}`, "SC"])),
        p24: {
          method: "drawn",
          strokes: [
            [
              [0.1, 0.2],
              [0.4, 0.7],
              [0.8, 0.2],
            ],
          ],
        },
        parent: "SG",
      },
      guestSignature: { method: "typed", name: "Synthetic Child" },
      guardianSignature: { method: "typed", name: "Synthetic Guardian" },
    };
    expect(
      (
        await sign(
          request("/api/forms", { ...minor, guardianCertified: false }),
        )
      ).status,
    ).toBe(400);
    expect(rpc).not.toHaveBeenCalled();
    expect((await sign(request("/api/forms", minor))).status).toBe(201);
    expect(encrypt).toHaveBeenCalledWith(
      expect.objectContaining({
        fields: expect.objectContaining({
          guestName: "Synthetic Child",
          minorAge: "12",
        }),
        guardianCertified: true,
        electronicConsent: { text: electronicConsent, version: consentVersion },
        source: formSource("liability"),
        initialAcknowledgements: expect.arrayContaining([
          {
            key: "p24",
            paragraphIndex: 24,
            text: formSource("liability").paragraphs[24],
            mark: {
              method: "drawn",
              strokes: [
                [
                  [0.1, 0.2],
                  [0.4, 0.7],
                  [0.8, 0.2],
                ],
              ],
            },
            signerRole: "guest",
            recordedAt: expect.any(String),
          },
          {
            key: "parent",
            paragraphIndex: 1,
            text: formSource("liability").paragraphs[1],
            mark: "SG",
            signerRole: "guardian",
            recordedAt: expect.any(String),
          },
        ]),
        guardianCertification: {
          text: guardianCertificationText,
          version: guardianCertificationVersion,
          certified: true,
        },
        signer: {
          id: signer,
          email: "synthetic@example.test",
          role: "guardian",
        },
      }),
      expect.stringMatching(/^liability:.*:signed:v1$/),
    );
  });
  it("rejects a staff review whose claimed kind differs from the stored form", async () => {
    vi.mocked(staffUser).mockResolvedValue({ id: signer } as Awaited<
      ReturnType<typeof staffUser>
    >);
    rpc.mockResolvedValue({ data: { kind: "liability" }, error: null });
    const response = await review(
      request(
        "/api/team/forms",
        {
          id,
          kind: "donation",
          status: "submitted",
          version: 1,
          participantId: null,
          evaluation: { notes: "Synthetic note" },
        },
        undefined,
        "PATCH",
      ),
    );
    expect(response.status).toBe(400);
    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith("read_signed_form", {
      p_actor: signer,
      p_id: id,
      p_staff: true,
    });
  });
  it("never returns another account's receipt or allows unapproved team reads/writes", async () => {
    rpc.mockResolvedValue({ data: null, error: null });
    expect(
      (
        await receipt(
          new Request(`http://127.0.0.1:3001/api/forms?id=${id}&actor=${id}`),
        )
      ).status,
    ).toBe(404);
    expect(rpc).toHaveBeenCalledWith("read_signed_form", {
      p_actor: signer,
      p_id: id,
      p_staff: false,
    });
    for (const response of [
      await queue(new Request("http://127.0.0.1:3001/api/team/forms")),
      await metrics(new Request("http://127.0.0.1:3001/api/team/impact")),
      await review(request("/api/team/forms", {}, undefined, "PATCH")),
      await visit(request("/api/team/visits", {})),
    ])
      expect(response.status).toBe(403);
  });
});
