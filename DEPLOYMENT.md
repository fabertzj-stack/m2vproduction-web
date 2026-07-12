# Deployment Guide

## 1. Environment setup

Requires Node 18.17+ (Astro 4 minimum) — Node 20 LTS recommended.

```bash
npm install
cp .env.example .env
```

Fill in `.env` with real values before the site can send form notifications or load
analytics. See the comments in `.env.example` for what each variable is for. Never
commit a real `.env` file — in production, set these as encrypted environment
variables on your hosting platform instead.

Minimum required for forms to actually deliver:

- `FORM_NOTIFICATION_EMAIL_TO` — a real, monitored inbox (confirm per Phase C item 11)
- `FORM_NOTIFICATION_EMAIL_FROM` — a verified sending address for your email provider
- `EMAIL_PROVIDER_API_KEY` — a Resend API key (see `src/lib/emailNotifier.ts` for why
  Resend was chosen as the default provider, and how to swap it for another provider)

Without these, forms still validate and accept submissions correctly — they just skip
sending the notification email and log a warning server-side. This is intentional: a
missing integration should never break the visitor-facing experience.

## 2. Build

```bash
npm run build
```

This runs `astro check && astro build` — type-checking first, then the production
build to `dist/`.

**Important — sandbox limitation disclosure:** this project was built in an
environment with no npm registry access, so `npm install`, `astro check` and
`astro build` have never actually been run against this code. Verification here used
a manual methodology instead: bracket-balance checks on every `.astro`/`.ts` file's
frontmatter and script blocks, `node --check` against TypeScript-annotation-stripped
copies of every inline script and API route, and YAML/JSON parsing for content and
config files. This catches most syntax errors but **cannot catch real TypeScript type
errors, Astro compiler errors, or Zod schema violations in content files.** Running
`npm install && npm run build` on a real machine is a required step before this can be
considered launch-ready — see the Final QA Report for the full list of what's
verified vs. what still needs a real build to confirm.

## 3. Test

```bash
npm run preview       # serve the production build locally
npm run test:a11y     # Playwright + axe-core accessibility tests (tests/a11y — not yet written, scaffold only)
npm run test:e2e      # Playwright end-to-end tests (tests/ — not yet written, scaffold only)
npm run lint:css      # stylelint
```

The `@playwright/test` and `@axe-core/playwright` dependencies and npm scripts are in
place, but no actual test files exist yet in this build — writing them is listed as a
pre-launch task below.

Manual testing still required before launch, since none of it can be done in this
sandbox:

- Real Lighthouse run (target: 95+ performance, and Core Web Vitals: LCP < 2.5s,
  CLS < 0.1, INP < 200ms) — cannot be measured without a real browser and network.
- Real screen reader pass (NVDA, JAWS, VoiceOver) — automated tools (axe) catch a
  meaningful subset of accessibility issues but not all of them.
- Cross-browser check (Chrome, Safari, Firefox, Edge) and real mobile device testing.
- Manual keyboard-only walkthrough of every form and the mobile nav.

## 4. Production deployment

This project targets `output: "hybrid"` with the `@astrojs/node` adapter in
"standalone" mode (see `astro.config.mjs`) — every page is static except `/api/*`,
which needs a running Node process to handle requests.

**Option A — Node hosting (Railway, Render, Fly.io, a VPS, etc.):**
```bash
npm run build
node ./dist/server/entry.mjs
```
Set `PORT` and `HOST` env vars per your host's requirements (see `@astrojs/node` docs).

**Option B — Vercel/Netlify/Cloudflare:** swap `@astrojs/node` for the platform's
official Astro adapter (`@astrojs/vercel`, `@astrojs/netlify`, `@astrojs/cloudflare`)
in `astro.config.mjs`. Nothing else in the codebase needs to change — every route's
actual logic lives in `src/lib/*.ts` and the page files themselves, not in the adapter
config. This is a deliberate architecture choice so the hosting platform can be
decided later without a rewrite.

### Security headers

Two layers, because most pages are static and only `/api/*` runs through the Node
process at request time:

1. **`src/middleware.ts`** — sets `X-Content-Type-Options`, `Referrer-Policy` and
   `X-Frame-Options` on every response this Node process actually handles. In
   `output: "hybrid"`, that's the `/api/*` routes only — Astro middleware does not run
   for prerendered static pages, since those are just files served by the host.
2. **`public/_headers`** — Netlify/Cloudflare Pages read this file automatically and
   apply the full header set (including CSP, HSTS and Permissions-Policy) to every
   static route. If deploying elsewhere, replicate the same headers from that file at
   the host layer:
   - **Vercel:** add a `headers` array to `vercel.json`.
   - **nginx / a VPS:** `add_header` directives in the server block.
   - **Cloudflare (non-Pages, e.g. a Worker in front of another origin):** a
     Transform Rule or Worker script setting response headers.

The CSP in `public/_headers` uses `script-src 'self'` with no `'unsafe-inline'` — this
works because Astro bundles every component `<script>` block into an external,
same-origin file by default (script hoisting), rather than emitting inline
`<script>` tags. If a future change adds `is:inline` to any script, or a third-party
snippet that must run inline, the CSP will need a nonce or hash added alongside it —
don't loosen it to `'unsafe-inline'` as the default fix.

### DNS / domain

`siteMeta.url` in `src/data/siteConfig.ts` and `site` in `astro.config.mjs` both
currently point at `https://www.m2vproduction.co.tz` marked TODO — confirm this is the
real production domain before launch, since it's baked into canonical URLs, Open
Graph tags, the sitemap, and the RSS feed.

### Pre-launch checklist (see also `M2VPRODUCTION_PhaseI_Launch_Checklist.docx`)

- [ ] Run `npm install && npm run build` on a real machine — resolve any TypeScript/Astro errors surfaced
- [ ] Populate `public/favicons/` and `public/og/` with real brand assets (see Phase B)
- [ ] Replace every `/TODO-...` image path in content collections with real assets
- [ ] Resolve every item in `M2VPRODUCTION_PhaseC_Missing_Information_Audit.docx` and flip the corresponding `verified` flags in `siteConfig.ts` / content collections
- [ ] Set real environment variables on the hosting platform (never commit `.env`)
- [ ] Confirm production domain and update `siteMeta.url` / `astro.config.mjs` `site` if different
- [ ] Legal review of `src/pages/legal/*.astro` — currently structural drafts, not attorney-reviewed
- [ ] Run Lighthouse, axe DevTools, and real screen reader/keyboard testing
- [ ] Confirm analytics IDs (GA4/GTM/Meta Pixel/LinkedIn) and verify they only load after cookie consent
- [ ] Point `RATE_LIMIT_*` at a shared store (Upstash Redis or similar) if deploying to a multi-instance serverless host — see `src/lib/rateLimit.ts`
- [ ] Submit `sitemap.xml` to Google Search Console and Bing Webmaster Tools
