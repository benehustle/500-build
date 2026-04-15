interface Env {
  LEAD_WEBHOOK_URL: string;
  LEAD_WEBHOOK_AUTH_HEADER?: string;
  LEAD_WEBHOOK_AUTH_VALUE?: string;
  WEBHOOK_ALLOWED_ORIGIN?: string;
}

type LeadWebhookPayload = Record<string, unknown>;

const json = (body: unknown, status = 200, headers?: HeadersInit) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...(headers ?? {})
    }
  });

const corsHeaders = (origin: string, allowedOrigin: string) => {
  const responseOrigin = origin === allowedOrigin ? origin : allowedOrigin;
  return {
    "access-control-allow-origin": responseOrigin,
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    vary: "Origin"
  };
};

export const onRequestOptions: PagesFunction<Env> = async ({ request, env }) => {
  const origin = request.headers.get("origin") ?? "";
  const allowedOrigin = env.WEBHOOK_ALLOWED_ORIGIN ?? "https://offer.spotonwebsites.com.au";
  return new Response(null, {
    status: 204,
    headers: corsHeaders(origin, allowedOrigin)
  });
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const origin = request.headers.get("origin") ?? "";
  const allowedOrigin = env.WEBHOOK_ALLOWED_ORIGIN ?? "https://offer.spotonwebsites.com.au";
  const cHeaders = corsHeaders(origin, allowedOrigin);

  if (!env.LEAD_WEBHOOK_URL) {
    return json({ error: "Missing LEAD_WEBHOOK_URL secret." }, 500, cHeaders);
  }

  let payload: LeadWebhookPayload;
  try {
    payload = (await request.json()) as LeadWebhookPayload;
  } catch {
    return json({ error: "Invalid JSON payload." }, 400, cHeaders);
  }

  const forwardHeaders = new Headers({
    "content-type": "application/json"
  });

  if (env.LEAD_WEBHOOK_AUTH_HEADER && env.LEAD_WEBHOOK_AUTH_VALUE) {
    forwardHeaders.set(env.LEAD_WEBHOOK_AUTH_HEADER, env.LEAD_WEBHOOK_AUTH_VALUE);
  }

  const forwardRes = await fetch(env.LEAD_WEBHOOK_URL, {
    method: "POST",
    headers: forwardHeaders,
    body: JSON.stringify(payload)
  });

  if (!forwardRes.ok) {
    const text = await forwardRes.text();
    return json(
      {
        error: "Upstream webhook returned an error.",
        upstreamStatus: forwardRes.status,
        upstreamBody: text.slice(0, 500)
      },
      502,
      cHeaders
    );
  }

  return json({ ok: true }, 200, cHeaders);
};
