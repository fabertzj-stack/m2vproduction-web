import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import vercel from "@astrojs/vercel/serverless";

// NOTE on the vercel import path: the version pinned in package.json is
// "@astrojs/vercel": "^7.8.0" (peerDependencies: astro ^4.2.0). At that major version the
// package's exports map does NOT provide a working default export at the package root —
// "." only maps to a types stub (types.d.ts), with no `import`/`default` condition backing
// it. The actual runtime adapters only exist at the "/serverless" and "/static" subpaths
// (dist/serverless/adapter.js and dist/static/adapter.js respectively). The unified
// `import vercel from "@astrojs/vercel"` root-import form only became valid in a LATER
// major of the adapter that requires Astro 5 as a peer — which this project is not on
// (astro is pinned to ^4.15.0, one major behind). Importing the bare package root here
// caused Astro to fail resolving this config file entirely at build time ("[astro] Unable
// to load your Astro config"), since Node/Vite couldn't find a module behind that export
// condition. "/serverless" (not "/static") is correct here specifically because output
// below is "hybrid": src/pages/api/*.ts opt out of prerendering and need to run as actual
// Vercel serverless functions, which only the serverless adapter provides.
//
// NOTE: @astrojs/sitemap is intentionally NOT imported here even though it's listed in
// package.json. `astro check` treats an imported-but-unused binding as a warning
// (TS6133), and since this integration is disabled in favor of the hand-written
// src/pages/sitemap.xml.ts below, importing it just to leave it unused was dead code.
// To re-enable the official integration instead: `import sitemap from
// "@astrojs/sitemap";`, add `sitemap()` to the `integrations` array below, and delete
// src/pages/sitemap.xml.ts.

// M2VPRODUCTION — production Astro config.
// SSG by default (per Phase A spec); only the /api/* form endpoints run server-side.
// See Phase A: "Why Astro" for the rationale behind this stack choice.
//
// output: "hybrid" — every page is static-prerendered UNLESS it opts out with
// `export const prerender = false` (used only by src/pages/api/*.ts). This requires an
// adapter to run the non-prerendered routes.
//
// Adapter: @astrojs/vercel/serverless — chosen because this project deploys to Vercel via its
// GitHub integration (push to GitHub, import the repo on vercel.com, click Deploy —
// no separate CD pipeline needed, see DEPLOYMENT.md). It auto-detects Astro, builds
// static routes as static assets and the /api/* routes as serverless functions with
// zero extra config beyond this adapter line. If deploying elsewhere instead, swap
// this for @astrojs/node, @astrojs/netlify or @astrojs/cloudflare — nothing else in
// the codebase depends on which adapter is used, since all endpoint logic lives in
// src/lib/*.ts, not in this config. See DEPLOYMENT.md for exact per-platform steps.
export default defineConfig({
  site: "https://www.m2vproduction.co.tz", // TODO: confirm final production domain before launch
  output: "hybrid",
  adapter: vercel(),
  integrations: [
    mdx(),
    // Astro's own @astrojs/sitemap integration is disabled in favor of a hand-written
    // src/pages/sitemap.xml.ts so we control priority/changefreq per the Phase 3/G specs
    // exactly. See the import comment above for how to re-enable it instead.
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
