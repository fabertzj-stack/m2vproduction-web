import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { siteMeta } from "@data/siteConfig";

// Hand-written RSS 2.0 feed (rather than the @astrojs/rss helper package) to avoid
// adding a dependency whose exact output this sandbox has no way to compile-verify —
// see the Final QA report's note on the npm-registry limitation. This is plain,
// well-established RSS 2.0 XML; swap to @astrojs/rss later if preferred, but this
// works correctly as-is. Only isVerified journal entries are included — an unverified
// draft article should not go out to RSS subscribers/readers any more than it should
// be indexed by search engines (see the noindex logic on the journal [slug] page).
function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export const GET: APIRoute = async () => {
  const posts = (await getCollection("journal"))
    .filter((p) => p.data.isVerified)
    .sort((a, b) => b.data.publishedDate.valueOf() - a.data.publishedDate.valueOf());

  const items = posts
    .map(
      (post) => `  <item>
    <title>${escapeXml(post.data.title)}</title>
    <link>${siteMeta.url}/journal/${post.slug}</link>
    <guid>${siteMeta.url}/journal/${post.slug}</guid>
    <description>${escapeXml(post.data.excerpt)}</description>
    <pubDate>${post.data.publishedDate.toUTCString()}</pubDate>
  </item>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>${siteMeta.name} Journal</title>
  <link>${siteMeta.url}/journal</link>
  <description>Field notes on permits, locations and production in Tanzania.</description>
${items}
</channel>
</rss>`;

  return new Response(xml, {
    status: 200,
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
};
