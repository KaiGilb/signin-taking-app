import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Port 5261 is this app's row in the central dev-port map (web block 2).
// Pinned here with strictPort. Start with `npm run dev`; never pass --port.
export default defineConfig({
  plugins: [react()],
  server: { port: 5261, strictPort: true },
  preview: { port: 5261, strictPort: true },
});
