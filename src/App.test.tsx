import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { App } from "./App";
import { makeTakingApp } from "./host/takingApp";
import { TAKE_SOURCE } from "./host/takeSource";

const RETURN_TO = () => "https://app.example.test/";

function render(rawOrigin: string | undefined): string {
  const { server, app, auth } = makeTakingApp(rawOrigin, RETURN_TO);
  return renderToStaticMarkup(<App app={app} auth={auth} server={server} source={TAKE_SOURCE} />);
}

describe("App — the taken card with this app's build-on", () => {
  it("renders the taken card with this app's own title", () => {
    const html = render("https://node-a.example.test");
    expect(html).toContain('data-testid="sign-in-card"');
    expect(html).toContain('data-app="signintakingapp"');
    expect(html).toContain("Sign in to the Taking App");
  });

  it("puts the banner inside the card body, naming the source SHA and the server", () => {
    const html = render("https://node-a.example.test");
    const body = html.indexOf('class="gilb-signin-body"');
    const banner = html.indexOf('data-testid="take-banner"');
    expect(body).toBeGreaterThan(-1);
    expect(banner).toBeGreaterThan(body);
    expect(html).toContain("<code>72e579a38</code>");
    expect(html).toContain(
      'href="https://github.com/KaiGilb/GilbPlatformCode/tree/72e579a38fb7b40e66832b57f74e34cffcef49e9/units/signin"',
    );
    expect(html).toContain('data-testid="take-banner-server">Sign-in server: <code>https://node-a.example.test</code>');
  });

  it("names a different server when a different one is set", () => {
    expect(render("http://node-b.example.test:8080")).toContain(
      "Sign-in server: <code>http://node-b.example.test:8080</code>",
    );
  });

  it("says on the card that no server is set, and shows no server line", () => {
    const html = render(undefined);
    expect(html).toContain('data-testid="take-banner-no-server"');
    expect(html).toContain("No sign-in server is set (VITE_SIGNIN_ORIGIN is not set).");
    expect(html).not.toContain('data-testid="take-banner-server"');
  });
});
