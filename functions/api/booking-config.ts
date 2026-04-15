interface Env {
  GHL_BOOKING_URL?: string;
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
  const bookingUrl = (env.GHL_BOOKING_URL ?? "").trim();
  return json({ bookingUrl });
};
