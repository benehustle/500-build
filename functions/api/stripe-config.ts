interface Env {
  STRIPE_PUBLISHABLE_KEY: string;
  STRIPE_AMOUNT_CENTS?: string;
  STRIPE_CURRENCY?: string;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  if (!env.STRIPE_PUBLISHABLE_KEY) {
    return json(
      { error: "Missing STRIPE_PUBLISHABLE_KEY secret on Pages project." },
      500
    );
  }

  const amountCents = Number.parseInt(env.STRIPE_AMOUNT_CENTS ?? "10000", 10);
  const safeAmount = Number.isFinite(amountCents) && amountCents > 0 ? amountCents : 10000;

  return json({
    publishableKey: env.STRIPE_PUBLISHABLE_KEY,
    amountCents: safeAmount,
    currency: (env.STRIPE_CURRENCY ?? "aud").toLowerCase()
  });
};
