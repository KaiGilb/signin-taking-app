# The take

`./signin` is this app's own copy of the GilbPlatformCode sign-in unit.

| | |
|---|---|
| Found in | The GilbPlatformCode chooser, record `Signin` (vault `7.Project/Active/GilbPlatformCode/03Execution/Chooser/Signin.md`, vault `origin/main` `7e4e4c708`). Type `t:AuthenticationAccount` (Suggested). |
| Pointer | clone `https://github.com/KaiGilb/GilbPlatformCode.git`, path `units/signin` |
| Taken at | `72e579a38fb7b40e66832b57f74e34cffcef49e9` (the SHA the chooser's verification run measured) |
| Taken on | 2026-09-24 |
| How | `scripts/take-signin.sh` — clone at the pinned SHA, copy `units/signin` into `./signin`. `package-lock.json` stays behind (this app's root lock file governs). |
| Take path used | Clone and copy. Package-install of a packed tarball is the other path; it stays open. |

## Not bound to the source

- `package.json` has no GitHub URL, no `file:../gilb-signin`, no git submodule.
- The app resolves `@kaigilb/gilbplatformcode-signin` to `./signin` through an npm workspace in this repo.
- Install, build, test and run never read the grab home. Only `scripts/take-signin.sh` does, and only when you run it.

## What this app changed

The first commit on this branch is the copy, byte-identical to the source.
The build-on is host-side and lives in `src/host/` and `src/App.tsx`. See the README.

Check the copy against its source at any time:

```sh
scripts/take-signin.sh --diff
```

Exit 0 means the copy is unchanged. Exit 1 lists what this app has changed in its copy.
