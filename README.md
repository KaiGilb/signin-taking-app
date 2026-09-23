# signin-taking-app

A thin taking app for the GilbPlatformCode library (Cycle004, step GPC004.5).

It holds its **own copy** of the library's sign-in unit and builds on it. The copy came from
the grab home, `https://github.com/KaiGilb/GilbPlatformCode`, path `units/signin`, at
`72e579a38`. After the take, nothing here reads the grab home again. See [TAKE.md](TAKE.md).

## Run it

```sh
git clone https://github.com/KaiGilb/signin-taking-app.git
cd signin-taking-app
npm install
npm run dev
```

Open http://localhost:5261/ (port 5261 is this app's row in the dev-port map).

## What to look at

1. **The copy.** `signin/` is the unit, byte-identical to its source. The first commit on the
   take branch is only that copy. `scripts/take-signin.sh --diff` says whether it still matches.
2. **The build-on** (this app's own, host-side, not a second login):
   - The card carries this app's title, *Sign in to the Taking App*, and this app's colour.
   - A banner inside the card says where the copy came from (with a link to the source at
     that SHA) and which sign-in server the app will use.
   - The app checks its sign-in server before sending anything. With no server set, the
     banner says so, and **Send Code to Email** shows *"Sign-in Taking App has no sign-in
     server (VITE_SIGNIN_ORIGIN is not set). Nothing was sent."*
   - Code: `src/host/` and `src/App.tsx`.
3. **Not bound to the source.** `package.json` has no GitHub URL and no `file:../`. The
   unit's package name resolves to `./signin` through an npm workspace in this repo.

## Check it

```sh
npm run verify
```

That runs, in order: the unit's own tests, typecheck and host-agnostic check on this app's
copy, then this app's typecheck and tests.

## What this app does not do

- It does not sign anyone in against a live server. No server is set by default.
  `VITE_SIGNIN_ORIGIN=https://… npm run dev` points it at one, but that path is untested,
  and a real server may refuse requests from `localhost:5261`.
- It keeps no token and stores nothing of its own. The only browser storage is the unit's
  own 15-minute pending-email entry, written after a code is sent.
- It does not create vaults. A new account that needs a vault name gets a plain refusal.
