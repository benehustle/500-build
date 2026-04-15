import { corsFor, forwardJson, json, optionsResponse } from "../utils/webhookForward";

interface Env {
  PAYMENT_COMPLETED_WEBHOOK_URL: string;
  WEBHOOK_ALLOWED_ORIGIN?: string;
  LEAD_WEBHOOK_AUTH_HEADER?: string;
  LEAD_WEBHOOK_AUTH_VALUE?: string;
}

type Body = {
  leadEmail?: string;
  email?: string;
  customerEmail?: string;
};

export const onRequestOptions: PagesFunction<Env> = async ({ request, env }) =>
  optionsResponse(request, env);

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const cHeaders = corsFor(request, env);

  if (!env.PAYMENT_COMPLETED_WEBHOOK_URL) {
    return json({ error: "Missing PAYMENT_COMPLETED_WEBHOOK_URL secret on Pages project." }, 500, cHeaders);
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return json({ error: "Invalid JSON payload." }, 400, cHeaders);
  }

  const email = (body.leadEmail || body.email || body.customerEmail || "").trim();
  if (!email) {
    return json({ error: "leadEmail (or email) is required." }, 400, cHeaders);
  }

  const payload = {
    formType: "Payment Completed",
    event: "payment_completed",
    timestamp: new Date().toISOString(),
    leadEmail: email
  };

  const forwardRes = await forwardJson(env.PAYMENT_COMPLETED_WEBHOOK_URL, payload, env);

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
