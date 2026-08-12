import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          maptiler: ["@maptiler/sdk"],
          supabase: ["@supabase/supabase-js"],
          vendor: ["react", "react-dom", "react-router-dom"],
        },
      },
    },
  },
});
