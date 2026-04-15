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
  const pk = (env.STRIPE_PUBLISHABLE_KEY ?? "").trim();
  if (!pk) {
    return json(
      {
        error: "Missing STRIPE_PUBLISHABLE_KEY on this deployment.",
        hints: [
          "In Workers & Pages → your project → Settings → Variables and secrets, add STRIPE_PUBLISHABLE_KEY (Production, and Preview if you test branch/preview URLs).",
          "After adding or changing secrets, open Deployments → Production → Retry deployment (or push a new commit) so the live Worker picks up bindings.",
          "Confirm the name is exactly STRIPE_PUBLISHABLE_KEY (no spaces)."
        ]
      },
      500
    );
  }

  const amountCents = Number.parseInt(env.STRIPE_AMOUNT_CENTS ?? "10000", 10);
  const safeAmount = Number.isFinite(amountCents) && amountCents > 0 ? amountCents : 10000;

  return json({
    publishableKey: pk,
    amountCents: safeAmount,
    currency: (env.STRIPE_CURRENCY ?? "aud").toLowerCase()
  });
};
