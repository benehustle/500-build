export type PaymentTier = "deposit" | "progress" | "final";

const TIER_DEFAULTS: Record<PaymentTier, { amountCents: number; description: string }> = {
  deposit: { amountCents: 10000, description: "Website build deposit" },
  progress: {
    amountCents: 60000,
    description: "Website build — progress payment (first draft approval)"
  },
  final: {
    amountCents: 29700,
    description: "Website build — final payment (go live)"
  }
};

export function parseTier(raw: string | undefined | null): PaymentTier {
  const s = (raw ?? "").trim().toLowerCase();
  if (s === "progress") return "progress";
  if (s === "final") return "final";
  return "deposit";
}

export function getStripeTierDetails(
  tier: PaymentTier,
  env: { STRIPE_AMOUNT_CENTS?: string; STRIPE_DESCRIPTION?: string }
): { amountCents: number; description: string } {
  const defaults = TIER_DEFAULTS[tier];
  if (tier !== "deposit") {
    return defaults;
  }
  const fromEnv = Number.parseInt(env.STRIPE_AMOUNT_CENTS ?? "", 10);
  const amountCents =
    Number.isFinite(fromEnv) && fromEnv > 0 ? fromEnv : defaults.amountCents;
  const desc = env.STRIPE_DESCRIPTION?.trim();
  const description = desc && desc.length > 0 ? desc : defaults.description;
  return { amountCents, description };
}
