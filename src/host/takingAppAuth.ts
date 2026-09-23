import {
  checkVaultName,
  prepareVaultName,
  requestSignInCode,
  verifySignInCodeHttp,
  type SignInAuth,
} from "@kaigilb/gilbplatformcode-signin/core";
import type { SignInServer } from "./signInServer";

/** A sign-in call was refused before anything was sent, because no usable server is set. */
export class SignInServerNotSetError extends Error {
  constructor(problem: string, productName: string) {
    super(`${productName} has no sign-in server (${problem}). Nothing was sent.`);
    this.name = "SignInServerNotSetError";
  }
}

export interface TakingAppAuthDeps {
  /** Public half of a fresh DPoP key, sent with verify-code. Injected in tests. */
  newDpopPublicJwk?: () => Promise<JsonWebKey>;
}

/**
 * This app's `auth` for the taken card. Every wire call is the taken unit's own headless
 * helper, bound to the server this app checked. Nothing here re-implements the wire.
 *
 * With no usable server: requestCode and verifyCode reject by name and send nothing;
 * prepareName and checkName resolve (the card needs checkName never to reject).
 *
 * This thin app holds nothing: the token verify-code returns is not kept, and no vault is
 * created here (completeNamedVault is host-owned and this host does not offer it).
 */
export function makeTakingAppAuth(
  server: SignInServer,
  productName: string,
  deps: TakingAppAuthDeps = {},
): SignInAuth {
  const newJwk = deps.newDpopPublicJwk ?? newEcDpopPublicJwk;
  const refuse = (): Promise<never> =>
    Promise.reject(new SignInServerNotSetError(server.ok ? "" : server.problem, productName));

  return {
    requestCode: (email, returnTo) =>
      server.ok ? requestSignInCode(server.origin, email, returnTo, productName) : refuse(),

    verifyCode: async (email, code, name) => {
      if (!server.ok) return refuse();
      const body = await verifySignInCodeHttp(
        server.origin,
        email,
        code,
        await newJwk(),
        name,
        productName,
      );
      return { needsVaultName: body.needsVaultName === true, suggestedName: body.suggestedName };
    },

    prepareName: (email) =>
      server.ok
        ? prepareVaultName(server.origin, email)
        : Promise.resolve({ isReturning: false, suggestedName: "" }),

    checkName: (name) =>
      server.ok
        ? checkVaultName(server.origin, name)
        : Promise.resolve({
            available: false,
            reserved: false,
            name,
            message: `No sign-in server (${server.problem}).`,
          }),

    completeNamedVault: () =>
      Promise.reject(
        new Error(
          `Creating a new vault is not part of ${productName}. Sign in with an account that already has a vault.`,
        ),
      ),
  };
}

/** A fresh ECDSA P-256 key per call. Only the public half leaves; the private key is not extractable. */
export async function newEcDpopPublicJwk(): Promise<JsonWebKey> {
  const pair = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, false, [
    "sign",
    "verify",
  ]);
  const { kty, crv, x, y } = await crypto.subtle.exportKey("jwk", pair.publicKey);
  return { kty, crv, x, y };
}
