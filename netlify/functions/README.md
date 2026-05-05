# Netlify Functions — Y.E.T. Compassion

## `campaign-progress.js`

Powers the live progress tracker on `/campaigns/2026.html` by totalling Stripe
payments that have been tagged with `metadata.campaign = "2026"`.

### One-time setup

1. **Create a restricted Stripe API key.**
   In Stripe Dashboard → Developers → API keys → "Create restricted key".
   Required permissions (read-only):
   - `PaymentIntents` → `Read`
   - `Charges` → `Read` (optional, useful for debugging)

2. **Add the key to Netlify.**
   Netlify Dashboard → Site settings → Environment variables → "Add a variable":
   - Key: `STRIPE_SECRET_KEY`
   - Value: the restricted key from step 1
   - Scopes: Functions

3. **(Optional) Override the campaign window.**
   By default the function counts payments created in calendar year `2026`. To
   override, set:
   - `CAMPAIGN_START_ISO` (e.g. `2026-02-01T00:00:00Z`)
   - `CAMPAIGN_END_ISO`   (e.g. `2026-12-15T23:59:59Z`)

### Tagging your Stripe Payment Links

For each Payment Link that should count toward the 2026 campaign:

1. Stripe Dashboard → Payment Links → click the link → "Edit".
2. Scroll to **Metadata** → "Add metadata".
3. Add `campaign` = `2026`.
4. Save.

For **subscriptions** (monthly partners), Stripe copies the subscription's
metadata onto each invoice's PaymentIntent at creation time, so the same field
on the recurring Payment Link is enough.

### Verifying it works

After deploy:

```bash
curl https://www.yetcompassion.org/.netlify/functions/campaign-progress?campaign=2026
```

Expected JSON:

```json
{
  "raised": 12345,
  "donors": 87,
  "asOf": "2026-05-04T12:00:00.000Z",
  "campaign": "2026",
  "currency": "USD"
}
```

If `raised` is `0` after a successful test donation, double-check that the
Payment Link's metadata actually contains `campaign=2026` (Stripe → Payments →
click the payment → "Metadata" panel).
