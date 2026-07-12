import { defineMiddleware } from "astro:middleware";

/**
 * middleware.ts — applies security headers to every response this process actually
 * handles at runtime. In "hybrid" output, that means the on-demand /api/* routes
 * ONLY — prerendered pages are static files served directly by Vercel's edge network
 * and never pass through this middleware, so this is a complement to (not a
 * replacement for) `vercel.json`'s headers array, which covers the static routes.
 * See DEPLOYMENT.md "Security headers" for the full picture.
 *
 * This still matters even though it's "only" the API routes: those are the endpoints
 * that accept POST bodies from the public internet, so getting X-Content-Type-Options
 * and Referrer-Policy right on them specifically is worthwhile on its own.
 */
export const onRequest = defineMiddleware(async (_context, next) => {
  const response = await next();

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Frame-Options", "DENY");

  return response;
});
