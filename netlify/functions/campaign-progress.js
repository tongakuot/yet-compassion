// ═══════════════════════════════════════════════════════════
// campaign-progress.js — Y.E.T. Compassion
// Returns live Stripe totals for a campaign (e.g. 2026).
//
// Why Checkout Sessions and Invoices (not PaymentIntents):
//   Metadata typed on a Payment Link in the Stripe Dashboard is copied to the
//   Checkout Session it creates, NOT to the PaymentIntent. Monthly renewals
//   carry the subscription's metadata on the Invoice
//   (parent.subscription_details.metadata), also not on the PaymentIntent.
//   So we total:
//     1. completed one-time Checkout Sessions, and
//     2. paid subscription Invoices (first month + every renewal).
//
// A gift counts toward the campaign when ANY of these is true:
//   - CAMPAIGN_COUNT_ALL = "true"  (every Stripe gift in the campaign window)
//   - its Payment Link id is listed in CAMPAIGN_PAYMENT_LINKS
//   - the Payment Link has metadata campaign = <campaign id>
//
// Required Netlify env vars:
//   STRIPE_SECRET_KEY       — restricted key, read-only on
//                             Checkout Sessions + Invoices
//
// Optional env vars:
//   CAMPAIGN_COUNT_ALL      — "true" to count every Stripe gift in the window
//   CAMPAIGN_PAYMENT_LINKS  — comma-separated plink_... ids to count
//   CAMPAIGN_START_ISO      — start of window (default <campaign>-01-01)
//   CAMPAIGN_END_ISO        — end of window   (default <campaign>-12-31)
//   CAMPAIGN_OFFLINE_TOTAL  — dollars received outside Stripe (checks, cash)
//   CAMPAIGN_OFFLINE_DONORS — number of donors behind that offline total
//
// Response shape:
//   { raised: 12345.67, donors: 87, asOf: "2026-05-04T12:00:00.000Z",
//     campaign: "2026", currency: "USD" }
//   On failure the response has status 503 and an `error` field, and the
//   page keeps showing its fallback total instead of $0.
// ═══════════════════════════════════════════════════════════

const STRIPE_API = 'https://api.stripe.com/v1';
const PAGE_LIMIT = 25; // hard cap per list (≤2,500 objects) to keep latency reasonable

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

// Iterate every object of a Stripe list endpoint (newest first).
async function listAll(path, params, key, onItem) {
  let starting_after;
  for (let pages = 0; pages < PAGE_LIMIT; pages++) {
    const query = { limit: 100, ...params };
    if (starting_after) query.starting_after = starting_after;
    const page = await stripeGet(path, query, key);
    for (const item of page.data) onItem(item);
    if (!page.has_more || page.data.length === 0) return;
    starting_after = page.data[page.data.length - 1].id;
  }
}

function idOf(ref) {
  return ref && typeof ref === 'object' ? ref.id : ref;
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

  // Failures are 503 + no-store so the page falls back to its manual total
  // and the edge cache never pins a broken $0.
  function failure(message) {
    return {
      statusCode: 503,
      headers: { ...headers, 'Cache-Control': 'no-store' },
      body: JSON.stringify({ campaign, error: message }),
    };
  }

  if (!key) return failure('STRIPE_SECRET_KEY not configured');

  const countAll = String(process.env.CAMPAIGN_COUNT_ALL || '').toLowerCase() === 'true';
  const links = new Set(
    String(process.env.CAMPAIGN_PAYMENT_LINKS || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  );
  const startIso = process.env.CAMPAIGN_START_ISO || `${campaign}-01-01T00:00:00Z`;
  const endIso   = process.env.CAMPAIGN_END_ISO   || `${campaign}-12-31T23:59:59Z`;
  const created = {
    'created[gte]': Math.floor(new Date(startIso).getTime() / 1000),
    'created[lte]': Math.floor(new Date(endIso).getTime() / 1000),
  };

  const matches = (metadata, paymentLink) =>
    countAll ||
    (metadata && metadata.campaign === campaign) ||
    (paymentLink && links.has(paymentLink));

  try {
    let cents = 0;
    const donorIds = new Set();
    const campaignSubs = new Set();

    const addDonor = (customer, email, fallbackId) => {
      donorIds.add(idOf(customer) || (email && email.toLowerCase()) || fallbackId);
    };

    // 1. Checkout Sessions — one-time gifts, and which subscriptions belong
    //    to the campaign (sessions carry the Payment Link id + its metadata).
    await listAll('/checkout/sessions', { status: 'complete', ...created }, key, (s) => {
      if (!matches(s.metadata, idOf(s.payment_link))) return;
      if (s.mode === 'subscription') {
        if (s.subscription) campaignSubs.add(idOf(s.subscription));
        return; // counted through its invoices below
      }
      if (s.mode !== 'payment' || s.payment_status !== 'paid') return;
      cents += s.amount_total || 0;
      addDonor(s.customer, s.customer_details && s.customer_details.email, s.id);
    });

    // 2. Paid subscription invoices — first month and every renewal.
    await listAll('/invoices', { status: 'paid', ...created }, key, (inv) => {
      // Newer API versions nest subscription info under `parent`; older ones
      // put it at the top level. Support both.
      const details =
        (inv.parent && inv.parent.subscription_details) || inv.subscription_details || {};
      const subId = idOf(details.subscription) || idOf(inv.subscription);
      if (!subId) return; // not a subscription invoice
      const counted =
        campaignSubs.has(subId) ||
        countAll ||
        (details.metadata && details.metadata.campaign === campaign);
      if (!counted) return;
      cents += inv.amount_paid || 0;
      addDonor(inv.customer, inv.customer_email, subId);
    });

    const offline = Number(process.env.CAMPAIGN_OFFLINE_TOTAL) || 0;
    const offlineDonors = parseInt(process.env.CAMPAIGN_OFFLINE_DONORS, 10) || 0;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        raised: Math.round(cents + offline * 100) / 100, // cents → dollars
        donors: donorIds.size + offlineDonors,
        asOf: new Date().toISOString(),
        campaign,
        currency: 'USD',
      }),
    };
  } catch (err) {
    // Never break the donor-facing page; log the detail for Netlify's function log.
    console.error('campaign-progress:', err);
    return failure('Stripe request failed');
  }
};
