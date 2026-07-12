import type { APIRoute } from "astro";
import { validateFixingEnquiry, isHoneypotTriggered } from "@lib/validation";
import { isRateLimited, getClientIdentifier } from "@lib/rateLimit";
import { sendFormNotification } from "@lib/emailNotifier";

// This route is on-demand (server-rendered), not prerendered — required for any route
// that reads request bodies / has side effects. See astro.config.mjs: output "hybrid"
// prerenders everything EXCEPT routes that opt out with this flag.
export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  let data: Record<string, string>;
  try {
    data = await request.json();
  } catch {
    return new Response(JSON.stringify({ message: "Invalid request body." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Honeypot check first — return a generic success-shaped response to bots without
  // doing any real work, rather than telling them exactly why they were rejected.
  if (isHoneypotTriggered(data)) {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const identifier = getClientIdentifier(request);
  if (isRateLimited(identifier)) {
    return new Response(
      JSON.stringify({ message: "Too many requests. Please try again shortly." }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  const result = validateFixingEnquiry(data);
  if (!result.valid) {
    return new Response(JSON.stringify({ errors: result.errors }), {
      status: 422,
      headers: { "Content-Type": "application/json" },
    });
  }

  const notification = await sendFormNotification({
    subject: `New Fixing Enquiry — ${data.location ?? "location tbd"} — ${data.dates ?? "dates tbd"}`,
    formName: "Fixing Enquiry",
    fields: data,
  });

  // Note: a failed notification email (e.g. provider not yet configured) does NOT fail
  // the request for the end user — their submission was validated and accepted. The
  // failure is logged server-side (see emailNotifier.ts) so it can be caught in
  // monitoring, but the user experience must not depend on an unconfigured integration.
  return new Response(JSON.stringify({ ok: true, notified: notification.sent }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
