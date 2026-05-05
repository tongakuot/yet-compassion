// ═══════════════════════════════════════════════════════════
// campaign-progress.js — Y.E.T. Compassion
// Returns live Stripe totals for a tagged campaign (e.g. 2026).
//
// Tagging convention:
//   - On every campaign Payment Link / Checkout Session, set
//     metadata.campaign = "2026" (or whichever campaign id).
//   - Recurring (subscription) gifts: each invoice's payment_intent
//     inherits the subscription metadata at create time.
//
// Required Netlify env vars:
//   STRIPE_SECRET_KEY     — Stripe restricted/secret API key
//                           (read-only on charges + payment_intents)
//
// Optional env vars:
//   CAMPAIGN_START_ISO    — ISO date to start counting (default 2026-01-01)
//   CAMPAIGN_END_ISO      — ISO date to stop counting  (default 2026-12-31)
//
// Response shape:
//   { raised: 12345, donors: 87, asOf: "2026-05-04T12:00:00.000Z",
//     campaign: "2026", currency: "USD" }
// ═══════════════════════════════════════════════════════════

const STRIPE_API = 'https://api.stripe.com/v1';

// Plain HTTPS — no Stripe SDK needed; keeps the function tiny + cold-start fast.
async function stripeGet(path, params, key) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${STRIPE_API}${path}?${qs}`, {
    headers: { Authorization: `Bearer ${key}` },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Stripe ${res.status}: ${body}`);
  }
  return res.json();
}

exports.handler = async function (event) {
  const key = process.env.STRIPE_SECRET_KEY;
  const campaign = (event.queryStringParameters && event.queryStringParameters.campaign) || '2026';

  // CORS / cache headers — public response, cache 10 min at the edge.
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'public, max-age=60, s-maxage=600, stale-while-revalidate=86400',
    'Access-Control-Allow-Origin': '*',
  };

  // Graceful fallback: if the key isn't configured yet, return zeros so the
  // page renders correctly without leaking error details to donors.
  if (!key) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        raised: 0,
        donors: 0,
        asOf: new Date().toISOString(),
        campaign,
        currency: 'USD',
        note: 'STRIPE_SECRET_KEY not configured; showing zeros.',
      }),
    };
  }

  const startIso = process.env.CAMPAIGN_START_ISO || `${campaign}-01-01T00:00:00Z`;
  const endIso   = process.env.CAMPAIGN_END_ISO   || `${campaign}-12-31T23:59:59Z`;
  const created = {
    'created[gte]': Math.floor(new Date(startIso).getTime() / 1000),
    'created[lte]': Math.floor(new Date(endIso).getTime() / 1000),
  };

  try {
    let raised = 0;
    const donorIds = new Set();
    let starting_after;
    let pages = 0;
    const PAGE_LIMIT = 25; // hard cap to keep cold-start latency reasonable (≤2,500 PIs)

    // Pull successful PaymentIntents in the campaign window, then filter by metadata.
    // (Stripe doesn't index metadata for searching without their /v1/search API,
    // which is rate-limited; iterating + filtering is more reliable for nonprofit
    // volume.)
    while (pages < PAGE_LIMIT) {
      const params = { limit: 100, ...created };
      if (starting_after) params.starting_after = starting_after;

      const page = await stripeGet('/payment_intents', params, key);
      for (const pi of page.data) {
        if (pi.status !== 'succeeded') continue;
        const tag = pi.metadata && pi.metadata.campaign;
        if (tag !== campaign) continue;
        raised += (pi.amount_received || 0);
        if (pi.customer) donorIds.add(pi.customer);
        else if (pi.receipt_email) donorIds.add(pi.receipt_email);
        else donorIds.add(pi.id); // anonymous one-off — count as 1 donor
      }
      if (!page.has_more) break;
      starting_after = page.data[page.data.length - 1].id;
      pages++;
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        raised: Math.round(raised / 100), // cents → dollars
        donors: donorIds.size,
        asOf: new Date().toISOString(),
        campaign,
        currency: 'USD',
      }),
    };
  } catch (err) {
    // Never break the donor-facing page — return zeros and a debug note.
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        raised: 0,
        donors: 0,
        asOf: new Date().toISOString(),
        campaign,
        currency: 'USD',
        error: String(err.message || err),
      }),
    };
  }
};
