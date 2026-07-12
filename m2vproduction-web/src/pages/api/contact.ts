import type { APIRoute } from "astro";
import { validateContact, isHoneypotTriggered } from "@lib/validation";
import { isRateLimited, getClientIdentifier } from "@lib/rateLimit";
import { sendFormNotification } from "@lib/emailNotifier";

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

  const result = validateContact(data);
  if (!result.valid) {
    return new Response(JSON.stringify({ errors: result.errors }), {
      status: 422,
      headers: { "Content-Type": "application/json" },
    });
  }

  const notification = await sendFormNotification({
    subject: `New Contact Message — ${data.subject && data.subject.trim().length > 0 ? data.subject : "General enquiry"}`,
    formName: "Contact",
    fields: data,
  });

  return new Response(JSON.stringify({ ok: true, notified: notification.sent }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
