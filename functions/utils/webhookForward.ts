export type WebhookAuthEnv = {
  WEBHOOK_ALLOWED_ORIGIN?: string;
  /** Applied to all outbound webhook POSTs when both are set */
  LEAD_WEBHOOK_AUTH_HEADER?: string;
  LEAD_WEBHOOK_AUTH_VALUE?: string;
};

export const json = (body: unknown, status = 200, headers?: HeadersInit) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...(headers ?? {})
    }
  });

const DEFAULT_FUNNEL_ORIGIN = "https://website.spotonwebsites.com.au";

/** Same Pages project may answer on legacy offer.* and new website.* during DNS cutover. */
function sameFunnelHostname(requestHost: string, configuredHost: string): boolean {
  const stripWww = (h: string) => h.replace(/^www\./i, "").toLowerCase();
  const r = stripWww(requestHost);
  const c = stripWww(configuredHost);
  if (r === c) return true;
  const legacyPair = new Set(["offer.spotonwebsites.com.au", "website.spotonwebsites.com.au"]);
  return legacyPair.has(r) && legacyPair.has(c);
}

/** Hostnames that may POST to webhook proxies (apex/www pair, Pages previews, local dev). */
function corsAllowOrigin(requestOrigin: string, configured: string): string {
  const base = configured || DEFAULT_FUNNEL_ORIGIN;
  if (!requestOrigin) return base;
  if (requestOrigin === base) return requestOrigin;
  try {
    const req = new URL(requestOrigin);
    const cfg = new URL(base);
    if (req.origin === cfg.origin) return requestOrigin;
    if (
      sameFunnelHostname(req.hostname, cfg.hostname) &&
      req.protocol === cfg.protocol
    ) {
      return requestOrigin;
    }
    if (req.hostname.toLowerCase().endsWith(".pages.dev")) return requestOrigin;
    if (req.hostname === "localhost" || req.hostname === "127.0.0.1") return requestOrigin;
  } catch {
    /* ignore */
  }
  return base;
}

export const corsHeaders = (origin: string, allowedOrigin: string) => {
  const responseOrigin = corsAllowOrigin(origin, allowedOrigin);
  return {
    "access-control-allow-origin": responseOrigin,
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    vary: "Origin"
  };
};

export function optionsResponse(request: Request, env: WebhookAuthEnv) {
  const origin = request.headers.get("origin") ?? "";
  const allowedOrigin = env.WEBHOOK_ALLOWED_ORIGIN ?? DEFAULT_FUNNEL_ORIGIN;
  return new Response(null, {
    status: 204,
    headers: corsHeaders(origin, allowedOrigin)
  });
}

export function corsFor(request: Request, env: WebhookAuthEnv) {
  const origin = request.headers.get("origin") ?? "";
  const allowedOrigin = env.WEBHOOK_ALLOWED_ORIGIN ?? DEFAULT_FUNNEL_ORIGIN;
  return corsHeaders(origin, allowedOrigin);
}

export async function forwardJson(
  targetUrl: string,
  payload: Record<string, unknown>,
  env: WebhookAuthEnv
): Promise<Response> {
  const forwardHeaders = new Headers({
    "content-type": "application/json"
  });
  if (env.LEAD_WEBHOOK_AUTH_HEADER && env.LEAD_WEBHOOK_AUTH_VALUE) {
    forwardHeaders.set(env.LEAD_WEBHOOK_AUTH_HEADER, env.LEAD_WEBHOOK_AUTH_VALUE);
  }
  return fetch(targetUrl, {
    method: "POST",
    headers: forwardHeaders,
    body: JSON.stringify(payload)
  });
}
