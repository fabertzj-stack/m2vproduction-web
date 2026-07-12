# Deployment Guide

## 1. Deploy to Vercel (the intended path)

1. Push this repository to GitHub (create a new repo, or upload the files directly
   through GitHub's web UI if you'd rather not use git locally).
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. Vercel reads `vercel.json` and detects Astro automatically — no build settings to
   fill in. Click **Deploy**.

The first deploy will succeed and the site will be live — with placeholder content
and every unverified fact clearly marked (see README.md "Content Rules"), not with
real client-ready content. From then on:

- Every push to `main` triggers a new production deploy automatically.
- Every pull request gets its own preview deployment with a unique URL — useful for
  reviewing content or copy changes before merging.
- `.github/workflows/ci.yml` runs in parallel on GitHub (type-check + build) as an
  independent safety net — it does not control the Vercel deploy, Vercel builds the
  project itself using the same `npm run build` command.

### Environment variables (set in Vercel, not in this repo)

In the Vercel project: **Settings → Environment Variables**. Copy every key from
`.env.example` and fill in real values — most importantly, for the contact forms to
actually deliver:

- `FORM_NOTIFICATION_EMAIL_TO` — a real, monitored inbox (confirm per Phase C item 11)
- `FORM_NOTIFICATION_EMAIL_FROM` — a verified sending address for your email provider
- `EMAIL_PROVIDER_API_KEY` — a Resend API key (see `src/lib/emailNotifier.ts` for why
  Resend was chosen as the default provider, and how to swap it for another provider)

Without these, forms still validate and accept submissions correctly — they just skip
sending the notification email and log a warning server-side. This is intentional: a
missing integration should never break the visitor-facing experience. Analytics
variables (`PUBLIC_GA4_MEASUREMENT_ID` etc.) can stay as placeholders until real
tracking IDs exist — they're gated behind cookie consent and unused until then.

### Custom domain

Once the production domain is confirmed, add it under **Settings → Domains** in
Vercel, and update `siteMeta.url` in `src/data/siteConfig.ts` and `site` in
`astro.config.mjs` to match — both are currently marked TODO and pointed at
`https://www.m2vproduction.co.tz`. This value is baked into canonical URLs, Open
Graph tags, the sitemap, and the RSS feed, so it should be correct before launch.

## 2. Local development

Requires Node 18.17+ (Astro 4 minimum) — Node 20 LTS recommended (matches
`.github/workflows/ci.yml` and `package.json`'s `engines` field).

```bash
npm install
cp .env.example .env
npm run dev
```

## 3. Build

```bash
npm run build
```

This runs `astro check && astro build` — type-checking first, then the production
build (via the `@astrojs/vercel` adapter) to `.vercel/output/`.

**Important — sandbox limitation disclosure:** this project was built in an
environment with no npm registry access, so `npm install`, `astro check` and
`astro build` have never actually been run against this code inside that session. In
place of a real compile, every file was verified using a manual methodology: bracket-
balance checks on every `.astro`/`.ts` file's frontmatter and script blocks, `node
--check` against TypeScript-annotation-stripped copies of every inline script and API
route, YAML/JSON parsing for content and config files, and a full import-resolution
and internal-link sweep across the codebase (all passed). This catches most syntax
errors but **cannot catch real TypeScript type errors, Astro compiler errors, or Zod
schema violations in content files.** The first real build will happen either in
GitHub Actions CI or in Vercel's own build step — check both for errors after the
first push, and treat that as the actual verification gate before considering this
launch-ready.

## 4. Test

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
  CLS < 0.1, INP < 200ms) — run this against the live Vercel preview URL once deployed.
- Real screen reader pass (NVDA, JAWS, VoiceOver) — automated tools (axe) catch a
  meaningful subset of accessibility issues but not all of them.
- Cross-browser check (Chrome, Safari, Firefox, Edge) and real mobile device testing.
- Manual keyboard-only walkthrough of every form and the mobile nav.

## 5. Security headers

Two layers, because most pages are static and only `/api/*` runs through a serverless
function at request time:

1. **`src/middleware.ts`** — sets `X-Content-Type-Options`, `Referrer-Policy` and
   `X-Frame-Options` on every response the Vercel serverless function actually
   handles. In `output: "hybrid"`, that's the `/api/*` routes only — Astro middleware
   does not run for prerendered static pages, since those are served directly from
   Vercel's edge network as files.
2. **`vercel.json`** — its `headers` array applies the full header set (including CSP,
   HSTS and Permissions-Policy) to every route Vercel serves, static or not. This is
   the authoritative set for this deployment target.

`public/_headers` (Netlify/Cloudflare Pages format) carries the same header set for
portability, in case this project is ever moved off Vercel — see "Deploying elsewhere"
below. It has no effect on Vercel itself.

The CSP uses `script-src 'self'` with no `'unsafe-inline'` — this works because Astro
bundles every component `<script>` block into an external, same-origin file by
default (script hoisting), rather than emitting inline `<script>` tags. If a future
change adds `is:inline` to any script, or a third-party snippet that must run inline,
the CSP will need a nonce or hash added alongside it — don't loosen it to
`'unsafe-inline'` as the default fix.

## 6. Deploying elsewhere instead of Vercel

Swap `@astrojs/vercel` in `astro.config.mjs` for the target platform's official Astro
adapter — `@astrojs/netlify`, `@astrojs/cloudflare`, or `@astrojs/node` for a plain
Node host/VPS. Nothing else in the codebase needs to change: every route's actual
logic lives in `src/lib/*.ts` and the page files themselves, not in the adapter
config. Replicate the headers from `public/_headers` (already in the right format for
Netlify/Cloudflare Pages) or `vercel.json` at whatever layer the new platform expects
(e.g. `add_header` directives for nginx).

## 7. Pre-launch checklist (see also `M2VPRODUCTION_PhaseI_Launch_Checklist.docx`)

- [ ] Push to GitHub, import to Vercel, click Deploy — confirm the first build actually succeeds and resolve any TypeScript/Astro errors surfaced
- [ ] Populate `public/favicons/` and `public/og/` with real brand assets (see Phase B)
- [ ] Replace every `/TODO-...` image path in content collections with real assets
- [ ] Resolve every item in `M2VPRODUCTION_PhaseC_Missing_Information_Audit.docx` and flip the corresponding `verified` flags in `siteConfig.ts` / content collections
- [ ] Set real environment variables in Vercel (never commit `.env`)
- [ ] Confirm production domain, add it in Vercel, and update `siteMeta.url` / `astro.config.mjs` `site` if different
- [ ] Legal review of `src/pages/legal/*.astro` — currently structural drafts, not attorney-reviewed
- [ ] Run Lighthouse, axe DevTools, and real screen reader/keyboard testing against the live Vercel URL
- [ ] Confirm analytics IDs (GA4/GTM/Meta Pixel/LinkedIn) and verify they only load after cookie consent
- [ ] Point `RATE_LIMIT_*` at a shared store (Upstash Redis, available directly via the Vercel Marketplace) — Vercel serverless functions are multi-instance, so the in-memory limiter in `src/lib/rateLimit.ts` won't enforce a true global limit as-is
- [ ] Submit `sitemap.xml` to Google Search Console and Bing Webmaster Tools
