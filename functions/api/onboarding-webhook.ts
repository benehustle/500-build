import { corsFor, forwardJson, json, optionsResponse } from "../utils/webhookForward";

interface Env {
  ONBOARDING_WEBHOOK_URL: string;
  WEBHOOK_ALLOWED_ORIGIN?: string;
  LEAD_WEBHOOK_AUTH_HEADER?: string;
  LEAD_WEBHOOK_AUTH_VALUE?: string;
}

type Payload = Record<string, unknown>;

export const onRequestOptions: PagesFunction<Env> = async ({ request, env }) =>
  optionsResponse(request, env);

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const cHeaders = corsFor(request, env);

  if (!env.ONBOARDING_WEBHOOK_URL) {
    return json({ error: "Missing ONBOARDING_WEBHOOK_URL secret on Pages project." }, 500, cHeaders);
  }

  let payload: Payload;
  try {
    payload = (await request.json()) as Payload;
  } catch {
    return json({ error: "Invalid JSON payload." }, 400, cHeaders);
  }

  const forwardRes = await forwardJson(env.ONBOARDING_WEBHOOK_URL, payload, env);

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
