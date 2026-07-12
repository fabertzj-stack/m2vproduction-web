import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { siteMeta } from "@data/siteConfig";

// Hand-written sitemap (rather than @astrojs/sitemap) so priority/changefreq are set
// deliberately per Phase A/G, and so unverified content-collection entries (isVerified
// false — same pages that render noindex, see PageLayout/BaseLayout `noindex` prop) are
// excluded here too. A URL that's noindex in <head> but still listed in the sitemap
// sends crawlers a contradictory signal — this keeps the two in sync from one source.
// This route IS prerendered (the default in "hybrid" output) since it only needs
// build-time Content Collection data, not per-request data.

interface SitemapEntry {
  path: string;
  changefreq: "daily" | "weekly" | "monthly" | "yearly";
  priority: number;
}

const staticEntries: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: 1.0 },
  { path: "/film-fixing-tanzania", changefreq: "weekly", priority: 0.95 },
  { path: "/film-production", changefreq: "monthly", priority: 0.85 },
  { path: "/corporate-media", changefreq: "monthly", priority: 0.85 },
  { path: "/portfolio", changefreq: "weekly", priority: 0.8 },
  { path: "/about", changefreq: "monthly", priority: 0.6 },
  { path: "/equipment", changefreq: "monthly", priority: 0.6 },
  { path: "/clients", changefreq: "monthly", priority: 0.5 },
  { path: "/contact", changefreq: "monthly", priority: 0.7 },
  { path: "/faq", changefreq: "monthly", priority: 0.5 },
  { path: "/journal", changefreq: "weekly", priority: 0.6 },
  { path: "/legal/privacy-policy", changefreq: "yearly", priority: 0.2 },
  { path: "/legal/cookie-policy", changefreq: "yearly", priority: 0.2 },
  { path: "/legal/terms", changefreq: "yearly", priority: 0.2 },
  { path: "/legal/accessibility-statement", changefreq: "yearly", priority: 0.2 },
];

export const GET: APIRoute = async () => {
  const projects = await getCollection("projects");
  const journal = await getCollection("journal");

  const dynamicEntries: SitemapEntry[] = [
    ...projects
      .filter((p) => p.data.isVerified)
      .map((p) => ({ path: `/portfolio/${p.slug}`, changefreq: "monthly" as const, priority: 0.65 })),
    ...journal
      .filter((p) => p.data.isVerified)
      .map((p) => ({ path: `/journal/${p.slug}`, changefreq: "monthly" as const, priority: 0.55 })),
  ];

  const allEntries = [...staticEntries, ...dynamicEntries];

  const urlsXml = allEntries
    .map(
      (entry) => `  <url>
    <loc>${siteMeta.url}${entry.path}</loc>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority.toFixed(1)}</priority>
  </url>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXml}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
