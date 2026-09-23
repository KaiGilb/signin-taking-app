import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@kaigilb/gilbplatformcode-signin/signin.css";
import "./app.css";
import { App } from "./App";
import { makeTakingApp } from "./host/takingApp";
import { TAKE_SOURCE } from "./host/takeSource";

// Built once, at module scope, so `app` and `auth` keep one identity for the page's life.
const { server, app, auth } = makeTakingApp(
  import.meta.env.VITE_SIGNIN_ORIGIN,
  () => window.location.href,
);

const root = document.getElementById("root");
if (!root) throw new Error("index.html has no #root element");

createRoot(root).render(
  <StrictMode>
    <App app={app} auth={auth} server={server} source={TAKE_SOURCE} />
  </StrictMode>,
);
