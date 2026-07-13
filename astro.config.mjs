import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import vercel from "@astrojs/vercel";

// M2VPRODUCTION — production Astro config.
//
// UPGRADE HISTORY (read this before touching versions again):
// This project was upgraded from Astro 4 + @astrojs/vercel 7.x to Astro 5 +
// @astrojs/vercel 8.x specifically to fix a real Vercel deploy failure:
// "The following Serverless Functions contain an invalid runtime: - _render
// (nodejs18.x)". @astrojs/vercel 7.8.0 hardcodes nodejs18.x into the function
// it generates regardless of package.json's engines field or Vercel's
// dashboard "Node.js Version" setting (both were tried and confirmed to have
// no effect) — Vercel has since fully retired nodejs18.x as a supported
// runtime. @astrojs/vercel 8.x does not have this problem, but it requires
// astro ^5.0.0 as a peer dependency, which is why this project is no longer
// on Astro 4. @astrojs/mdx was bumped to ^4.0.0 alongside it since Astro 5
// moved MDX/JSX handling into the mdx integration itself — older mdx
// versions are not compatible with Astro 5.
//
// Because of that peer requirement, DO NOT downgrade @astrojs/vercel below
// 8.x without also downgrading astro below 5.x, and vice versa.
//
// The unified `import vercel from "@astrojs/vercel"` (no /serverless or
// /static subpath) is correct for 8.x — the subpath-only export map was a
// 7.x-era quirk that no longer applies.
//
// output: "static" — in Astro 5, "hybrid" and "static" were merged into a
// single "static" mode that behaves like the old hybrid: every page is
// static-prerendered UNLESS it opts out with `export const prerender = false`
// (used only by src/pages/api/*.ts, which still need to run on-demand as
// Vercel serverless functions). There is no "hybrid" value anymore — do not
// re-add it, Astro 5 will fail to parse the config if you do.
//
// legacy.collections: true — this project's content collections
// (src/content/config.ts) use the old Astro 2.0-era `defineCollection({type,
// schema})` API without a `loader`. Astro 5 introduces a new Content Layer
// API and can auto-emulate the old behavior, but this flag pins the old,
// well-understood behavior explicitly rather than relying on the emulation
// layer's edge cases (e.g. non-deterministic collection sort order). None of
// this project's pages use Astro.glob(), image().refine(), or getEntry()
// with a static key, so migrating to the new Content Layer API later, if
// ever desired, should be low-risk — but there is no need to do it now.
//
// Adapter: @astrojs/vercel — chosen because this project deploys to Vercel via its
// GitHub integration (push to GitHub, import the repo on vercel.com, click Deploy —
// no separate CD pipeline needed, see DEPLOYMENT.md). It auto-detects Astro, builds
// static routes as static assets and the /api/* routes as serverless functions with
// zero extra config beyond this adapter line. If deploying elsewhere instead, swap
// this for @astrojs/node, @astrojs/netlify or @astrojs/cloudflare — nothing else in
// the codebase depends on which adapter is used, since all endpoint logic lives in
// src/lib/*.ts, not in this config. See DEPLOYMENT.md for exact per-platform steps.
//
// @astrojs/sitemap is intentionally NOT installed or imported — this project uses a
// hand-written src/pages/sitemap.xml.ts instead so priority/changefreq are controlled
// exactly per the Phase 3/G specs. To use the official integration instead: run
// `npm install @astrojs/sitemap`, `import sitemap from "@astrojs/sitemap";`, add
// `sitemap()` to the `integrations` array below, and delete src/pages/sitemap.xml.ts.
export default defineConfig({
  site: "https://www.m2vproduction.co.tz", // TODO: confirm final production domain before launch
  output: "static",
  adapter: vercel(),
  legacy: {
    collections: true,
  },
  integrations: [mdx()],
  build: {
    inlineStylesheets: "auto",
  },
  vite: {
    css: {
      devSourcemap: true,
    },
  },
});
