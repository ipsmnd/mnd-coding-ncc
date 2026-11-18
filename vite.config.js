import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" makes the build work from any folder, any static host and inside the Android app.
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: { outDir: "dist", chunkSizeWarningLimit: 1500 }
});
