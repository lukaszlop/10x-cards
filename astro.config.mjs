// @ts-check
import { defineConfig } from "astro/config";

import node from "@astrojs/node";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [react(), sitemap()],
  server: {
    port: 4321, // Use consistent port with Playwright
    host: true, // Allow external connections for testing
  },
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-dom/client",
        "react-hook-form",
        "@hookform/resolvers",
        "@hookform/resolvers/zod",
        "zod",
        "lucide-react",
        "sonner",
        "clsx",
        "tailwind-merge",
        "class-variance-authority",
        "@radix-ui/react-alert-dialog",
        "@radix-ui/react-dialog",
        "@radix-ui/react-label",
        "@radix-ui/react-select",
        "@radix-ui/react-slot",
        "@radix-ui/react-switch",
        "@nanostores/react",
        "nanostores",
        "@supabase/supabase-js",
        "@supabase/ssr",
      ],
      exclude: ["astro:assets", "astro:content"],
    },
    ssr: {
      noExternal: ["@radix-ui/*", "sonner", "lucide-react"],
    },
  },
  adapter: node({
    mode: "standalone",
  }),
  experimental: { session: true },
});
