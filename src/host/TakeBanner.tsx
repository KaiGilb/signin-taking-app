import type { SignInServer } from "./signInServer";
import type { TakeSource } from "./takeSource";

/**
 * Build-on (this app's own): a banner inside the taken card, through the card's `banner` slot.
 * It says where this copy came from and which sign-in server it will use — or, loudly, that
 * none is set.
 */
export function TakeBanner({ source, server }: { source: TakeSource; server: SignInServer }) {
  const sourceUrl = `${source.repo}/tree/${source.sha}/${source.path}`;
  return (
    <div className="take-banner" data-testid="take-banner">
      <p>
        This card is this app&apos;s own copy of <code>{source.path}</code>, taken from{" "}
        <a href={sourceUrl}>GilbPlatformCode</a> at <code>{source.sha.slice(0, 9)}</code>.
      </p>
      {server.ok ? (
        <p data-testid="take-banner-server">
          Sign-in server: <code>{server.origin}</code>
        </p>
      ) : (
        <p role="status" className="take-banner-warn" data-testid="take-banner-no-server">
          No sign-in server is set ({server.problem}). Sending a code will fail until one is set.
        </p>
      )}
    </div>
  );
}
