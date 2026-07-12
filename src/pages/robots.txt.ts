import type { APIRoute } from "astro";
import { siteMeta } from "@data/siteConfig";

// Hand-written so it can reference the dynamic sitemap.xml route and stay simple to
// audit — a static public/robots.txt would drift from the real route list over time.
export const GET: APIRoute = async () => {
  const body = `User-agent: *
Allow: /
Disallow: /api/

Sitemap: ${siteMeta.url}/sitemap.xml
`;

  return new Response(body, {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
