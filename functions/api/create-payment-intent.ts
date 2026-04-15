import { getStripeTierDetails, parseTier, type PaymentTier } from "../utils/stripeTiers";

interface Env {
  STRIPE_SECRET_KEY: string;
  STRIPE_AMOUNT_CENTS?: string;
  STRIPE_CURRENCY?: string;
  STRIPE_DESCRIPTION?: string;
}

type CreateIntentBody = {
  customerName?: string;
  customerEmail?: string;
  tier?: PaymentTier | string;
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  if (!env.STRIPE_SECRET_KEY) {
    return json({ error: "Missing STRIPE_SECRET_KEY secret on Pages project." }, 500);
  }

  let payload: CreateIntentBody = {};
  try {
    payload = (await request.json()) as CreateIntentBody;
  } catch {
    return json({ error: "Invalid JSON payload." }, 400);
  }

  const tier = parseTier(typeof payload.tier === "string" ? payload.tier : undefined);
  const { amountCents, description } = getStripeTierDetails(tier, env);
  const safeAmount = Number.isFinite(amountCents) && amountCents > 0 ? amountCents : 10000;
  const currency = (env.STRIPE_CURRENCY ?? "aud").toLowerCase();

  const body = new URLSearchParams();
  body.set("amount", String(safeAmount));
  body.set("currency", currency);
  body.set("description", description);
  body.set("automatic_payment_methods[enabled]", "true");
  body.set("metadata[source]", "landing-pages-payment");
  body.set("metadata[payment_tier]", tier);

  if (payload.customerName?.trim()) {
    body.set("metadata[customer_name]", payload.customerName.trim());
  }

  if (payload.customerEmail?.trim()) {
    body.set("receipt_email", payload.customerEmail.trim());
    body.set("metadata[customer_email]", payload.customerEmail.trim());
  }

  const stripeRes = await fetch("https://api.stripe.com/v1/payment_intents", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      "content-type": "application/x-www-form-urlencoded"
    },
    body: body.toString()
  });

  const stripeData = (await stripeRes.json()) as {
    id?: string;
    client_secret?: string;
    error?: { message?: string };
  };

  if (!stripeRes.ok || !stripeData.client_secret) {
    return json(
      {
        error: stripeData.error?.message ?? "Stripe could not create a payment intent."
      },
      502
    );
  }

  return json({
    clientSecret: stripeData.client_secret,
    paymentIntentId: stripeData.id
  });
};

export const onRequestOptions: PagesFunction = async () =>
  new Response(null, {
    status: 204,
    headers: {
      allow: "POST, OPTIONS"
    }
  });
