import type { SignInApp, SignInAuth } from "@kaigilb/gilbplatformcode-signin/core";
import { readSignInServer, type SignInServer } from "./signInServer";
import { makeTakingAppAuth } from "./takingAppAuth";

export const PRODUCT_NAME = "Sign-in Taking App";

/**
 * This app's words and wiring for the taken card. Built once at start-up so `app` and `auth`
 * keep one identity for the life of the page (the card resets its name field when `auth`
 * changes identity).
 */
export function makeTakingApp(
  rawOrigin: string | undefined,
  returnTo: () => string,
): { server: SignInServer; app: SignInApp; auth: SignInAuth } {
  const server = readSignInServer(rawOrigin);
  const app: SignInApp = {
    id: "signintakingapp",
    productName: PRODUCT_NAME,
    title: "Sign in to the Taking App",
    origin: server.ok ? server.origin : "",
    returnTo,
  };
  return { server, app, auth: makeTakingAppAuth(server, PRODUCT_NAME) };
}
