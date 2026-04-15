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

export const corsHeaders = (origin: string, allowedOrigin: string) => {
  const responseOrigin = origin === allowedOrigin ? origin : allowedOrigin;
  return {
    "access-control-allow-origin": responseOrigin,
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    vary: "Origin"
  };
};

export function optionsResponse(request: Request, env: WebhookAuthEnv) {
  const origin = request.headers.get("origin") ?? "";
  const allowedOrigin = env.WEBHOOK_ALLOWED_ORIGIN ?? "https://offer.spotonwebsites.com.au";
  return new Response(null, {
    status: 204,
    headers: corsHeaders(origin, allowedOrigin)
  });
}

export function corsFor(request: Request, env: WebhookAuthEnv) {
  const origin = request.headers.get("origin") ?? "";
  const allowedOrigin = env.WEBHOOK_ALLOWED_ORIGIN ?? "https://offer.spotonwebsites.com.au";
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
