import { afterEach, describe, expect, it } from "vitest";
import { makeTakingAppAuth, newEcDpopPublicJwk, SignInServerNotSetError } from "./takingAppAuth";

// fetch is the only thing replaced: it is the collaborator. The wire helpers under the
// host auth are the taken unit's real code.
const ORIGIN_A = "https://node-a.example.test";
const ORIGIN_B = "https://node-b.example.test";
const EMAIL = "person@example.test";
const RETURN_TO = "https://app.example.test/after";
const NOT_SET = { ok: false as const, problem: "VITE_SIGNIN_ORIGIN is not set" };
const JWK = { kty: "EC", crv: "P-256", x: "x-literal", y: "y-literal" };

type Call = { url: string; body: unknown };
const realFetch = globalThis.fetch;

function stubFetch(responses: Response[]): Call[] {
  const calls: Call[] = [];
  let i = 0;
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push({ url: String(input), body: init?.body ? JSON.parse(String(init.body)) : undefined });
    const next = responses[i++];
    if (!next) throw new Error(`unexpected fetch ${String(input)}`);
    return next;
  }) as typeof fetch;
  return calls;
}

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

afterEach(() => {
  globalThis.fetch = realFetch;
});

describe("makeTakingAppAuth — the host auth this app builds from the taken helpers", () => {
  it("sends the code request to server A when A is configured", async () => {
    const calls = stubFetch([new Response(null, { status: 204 })]);
    await makeTakingAppAuth({ ok: true, origin: ORIGIN_A }, "Taking App").requestCode(EMAIL, RETURN_TO);
    expect(calls).toEqual([
      {
        url: "https://node-a.example.test/base/auth/email/request-code",
        body: { email: EMAIL, return_to: RETURN_TO },
      },
    ]);
  });

  it("sends the code request to server B when B is configured", async () => {
    const calls = stubFetch([new Response(null, { status: 204 })]);
    await makeTakingAppAuth({ ok: true, origin: ORIGIN_B }, "Taking App").requestCode(EMAIL, RETURN_TO);
    expect(calls.map((c) => c.url)).toEqual(["https://node-b.example.test/base/auth/email/request-code"]);
  });

  it("sends nothing and names the problem when no server is set", async () => {
    const calls = stubFetch([]);
    const auth = makeTakingAppAuth(NOT_SET, "Taking App");
    await expect(auth.requestCode(EMAIL, RETURN_TO)).rejects.toThrow(SignInServerNotSetError);
    await expect(auth.requestCode(EMAIL, RETURN_TO)).rejects.toThrow(
      "Taking App has no sign-in server (VITE_SIGNIN_ORIGIN is not set). Nothing was sent.",
    );
    await expect(auth.verifyCode(EMAIL, "123456")).rejects.toThrow(SignInServerNotSetError);
    expect(calls).toEqual([]);
  });

  it("verify sends the fresh public key and passes on the server's vault-name answer", async () => {
    const calls = stubFetch([json(200, { token: "t-1", needsVaultName: true, suggestedName: "lisa" })]);
    const auth = makeTakingAppAuth({ ok: true, origin: ORIGIN_A }, "Taking App", {
      newDpopPublicJwk: async () => JWK,
    });
    expect(await auth.verifyCode(EMAIL, "123456")).toEqual({ needsVaultName: true, suggestedName: "lisa" });
    expect(calls).toEqual([
      {
        url: "https://node-a.example.test/base/auth/email/verify-code",
        body: { email: EMAIL, code: "123456", dpopJwk: JWK },
      },
    ]);
  });

  it("verify reads a plain success as signed in, with no vault name needed", async () => {
    stubFetch([json(200, { token: "t-2" })]);
    const auth = makeTakingAppAuth({ ok: true, origin: ORIGIN_A }, "Taking App", {
      newDpopPublicJwk: async () => JWK,
    });
    expect(await auth.verifyCode(EMAIL, "654321")).toEqual({
      needsVaultName: false,
      suggestedName: undefined,
    });
  });

  it("sends verify, name-prep and name-check to server B when B is configured", async () => {
    const calls = stubFetch([
      json(200, { token: "t-3" }),
      json(200, { isReturning: false, suggestedName: "lisa", webIdDomain: "b.example.test" }),
      json(200, { available: true, reserved: false, name: "lisa" }),
    ]);
    const auth = makeTakingAppAuth({ ok: true, origin: ORIGIN_B }, "Taking App", {
      newDpopPublicJwk: async () => JWK,
    });
    await auth.verifyCode(EMAIL, "123456");
    expect(await auth.prepareName(EMAIL)).toEqual({
      isReturning: false,
      suggestedName: "lisa",
      webIdDomain: "b.example.test",
      address: undefined,
    });
    expect(await auth.checkName("lisa")).toEqual({
      available: true,
      reserved: false,
      name: "lisa",
      address: undefined,
      message: undefined,
    });
    expect(calls.map((c) => c.url)).toEqual([
      "https://node-b.example.test/base/auth/email/verify-code",
      "https://node-b.example.test/onboard/api/name-prep",
      "https://node-b.example.test/onboard/api/check-name",
    ]);
  });

  it("prepareName resolves without asking anyone when no server is set", async () => {
    const calls = stubFetch([]);
    await expect(makeTakingAppAuth(NOT_SET, "Taking App").prepareName(EMAIL)).resolves.toEqual({
      isReturning: false,
      suggestedName: "",
    });
    expect(calls).toEqual([]);
  });

  it("checkName resolves, never rejects, when no server is set", async () => {
    const calls = stubFetch([]);
    await expect(makeTakingAppAuth(NOT_SET, "Taking App").checkName("lisa")).resolves.toEqual({
      available: false,
      reserved: false,
      name: "lisa",
      message: "No sign-in server (VITE_SIGNIN_ORIGIN is not set).",
    });
    expect(calls).toEqual([]);
  });

  it("refuses to create a vault, by name", async () => {
    await expect(
      makeTakingAppAuth({ ok: true, origin: ORIGIN_A }, "Taking App").completeNamedVault("lisa"),
    ).rejects.toThrow(
      "Creating a new vault is not part of Taking App. Sign in with an account that already has a vault.",
    );
  });
});

describe("newEcDpopPublicJwk — the default key", () => {
  it("exports only the public half of a fresh P-256 key", async () => {
    const a = await newEcDpopPublicJwk();
    const b = await newEcDpopPublicJwk();
    expect(a.kty).toBe("EC");
    expect(a.crv).toBe("P-256");
    expect(typeof a.x).toBe("string");
    expect(typeof a.y).toBe("string");
    expect("d" in a).toBe(false);
    expect(a.x).not.toBe(b.x);
  });
});
