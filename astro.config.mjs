import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import node from "@astrojs/node";

// M2VPRODUCTION — production Astro config.
// SSG by default (per Phase A spec); only the /api/* form endpoints run server-side.
// See Phase A: "Why Astro" for the rationale behind this stack choice.
//
// output: "hybrid" — every page is static-prerendered UNLESS it opts out with
// `export const prerender = false` (used only by src/pages/api/*.ts). This requires an
// adapter to run the non-prerendered routes; @astrojs/node (standalone mode) is used
// here as a host-agnostic default that runs anywhere Node runs. If deploying to
// Vercel/Netlify/Cloudflare instead, swap this for their respective official adapter —
// see DEPLOYMENT.md for exact steps. Nothing else in the codebase depends on which
// adapter is used, since all endpoint logic lives in src/lib/*.ts, not in this config.
export default defineConfig({
  site: "https://www.m2vproduction.co.tz", // TODO: confirm final production domain before launch
  output: "hybrid",
  adapter: node({ mode: "standalone" }),
  integrations: [
    mdx(),
    // Astro's own @astrojs/sitemap integration is disabled in favor of a hand-written
    // src/pages/sitemap.xml.ts so we control priority/changefreq per the Phase 3/G specs
    // exactly. Re-enable this if the custom implementation is ever retired.
    // sitemap(),
  ],
  build: {
    inlineStylesheets: "auto",
  },
  vite: {
    css: {
      devSourcemap: true,
    },
  },
});
