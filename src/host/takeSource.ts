/** Where this app's copy of the sign-in unit came from. A record for the banner; nothing fetches it. */
export interface TakeSource {
  repo: string;
  path: string;
  sha: string;
  takenOn: string;
}

export const TAKE_SOURCE: TakeSource = {
  repo: "https://github.com/KaiGilb/GilbPlatformCode",
  path: "units/signin",
  sha: "72e579a38fb7b40e66832b57f74e34cffcef49e9",
  takenOn: "2026-09-24",
};
