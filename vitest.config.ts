import { defineConfig } from "vitest/config";

// This app's own tests only. The taken unit's tests run with the unit's own
// config and command: `npm run unit:test`.
export default defineConfig({
  esbuild: { jsx: "automatic" },
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
