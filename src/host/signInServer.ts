/**
 * Build-on (this app's own; not in the taken unit): check the sign-in server this app is
 * configured to use, before anything is sent to it.
 *
 * The taken card never picks a server; its host injects one. This app reads it from
 * VITE_SIGNIN_ORIGIN and has no default. A missing or malformed value is reported by name —
 * on the card's banner and by every sign-in call — instead of falling back to some host.
 *
 * Only a bare origin is accepted. The taken helpers append `/base/auth/...` to it, so a value
 * that carries a path would send every request to the wrong route.
 */
export type SignInServer = { ok: true; origin: string } | { ok: false; problem: string };

export function readSignInServer(raw: string | undefined): SignInServer {
  const value = (raw ?? "").trim();
  if (!value) return { ok: false, problem: "VITE_SIGNIN_ORIGIN is not set" };

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return { ok: false, problem: `VITE_SIGNIN_ORIGIN is not a URL: "${value}"` };
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return { ok: false, problem: `VITE_SIGNIN_ORIGIN must be http or https, not ${url.protocol}` };
  }
  if (url.pathname !== "/" || url.search || url.hash || url.username || url.password) {
    return {
      ok: false,
      problem: `VITE_SIGNIN_ORIGIN must be a bare origin such as https://example.test, not "${value}"`,
    };
  }
  return { ok: true, origin: url.origin };
}
