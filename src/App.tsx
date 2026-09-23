import { useCallback, useState } from "react";
import { SignInCard, type SignInApp, type SignInAuth } from "@kaigilb/gilbplatformcode-signin";
import { TakeBanner } from "./host/TakeBanner";
import type { SignInServer } from "./host/signInServer";
import type { TakeSource } from "./host/takeSource";

export function App({
  app,
  auth,
  server,
  source,
}: {
  app: SignInApp;
  auth: SignInAuth;
  server: SignInServer;
  source: TakeSource;
}) {
  const [signedIn, setSignedIn] = useState(false);
  const onSignedIn = useCallback(() => setSignedIn(true), []);

  return (
    <main className="take-shell">
      {signedIn ? (
        <section className="take-done" data-testid="take-signed-in">
          <h1>Signed in</h1>
          <p>
            {server.ok ? server.origin : "The server"} accepted the code. This thin app keeps no
            token and stores nothing.
          </p>
        </section>
      ) : (
        <SignInCard
          app={app}
          auth={auth}
          onSignedIn={onSignedIn}
          banner={<TakeBanner source={source} server={server} />}
        />
      )}
    </main>
  );
}
