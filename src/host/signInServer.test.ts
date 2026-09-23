import { describe, expect, it } from "vitest";
import { readSignInServer } from "./signInServer";

describe("readSignInServer — this app checks its sign-in server before using it", () => {
  it("reads an https origin and drops the trailing slash", () => {
    expect(readSignInServer("https://node-a.example.test/")).toEqual({
      ok: true,
      origin: "https://node-a.example.test",
    });
  });

  it("carries a different scheme, host and port through unchanged", () => {
    expect(readSignInServer("  http://node-b.example.test:8080  ")).toEqual({
      ok: true,
      origin: "http://node-b.example.test:8080",
    });
  });

  it("refuses an unset or blank value by name", () => {
    for (const raw of [undefined, "", "   "]) {
      expect(readSignInServer(raw)).toEqual({ ok: false, problem: "VITE_SIGNIN_ORIGIN is not set" });
    }
  });

  it("refuses text that is not a URL", () => {
    expect(readSignInServer("node-a.example.test")).toEqual({
      ok: false,
      problem: 'VITE_SIGNIN_ORIGIN is not a URL: "node-a.example.test"',
    });
  });

  it("refuses a scheme other than http or https", () => {
    expect(readSignInServer("ftp://node-a.example.test")).toEqual({
      ok: false,
      problem: "VITE_SIGNIN_ORIGIN must be http or https, not ftp:",
    });
  });

  it("refuses an origin that carries a path", () => {
    expect(readSignInServer("https://node-a.example.test/base")).toEqual({
      ok: false,
      problem:
        'VITE_SIGNIN_ORIGIN must be a bare origin such as https://example.test, not "https://node-a.example.test/base"',
    });
  });
});
