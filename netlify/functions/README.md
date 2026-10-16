# Netlify Functions — Y.E.T. Compassion

## `campaign-progress.js`

Powers the live progress tracker on `/campaigns/2026.html`. It totals Stripe
gifts made through the campaign's Payment Links: completed one-time Checkout
Sessions plus paid subscription invoices (first month and every renewal).

> Stripe copies metadata typed on a Payment Link to the **Checkout Session**,
> not to the PaymentIntent, and monthly renewals carry it on the **Invoice**.
> That is why this function reads Checkout Sessions and Invoices.

### One-time setup

1. **Create a restricted Stripe API key** (live mode).
   Stripe Dashboard → Developers → API keys → "Create restricted key".
   Set these to `Read`, leave everything else `None`:
   - `Checkout Sessions`
   - `Invoices`

2. **Add the key to Netlify.**
   Netlify → Site configuration → Environment variables → "Add a variable":
   - Key: `STRIPE_SECRET_KEY`, value: the restricted key (`rk_live_...`),
     scope: Functions.

3. **Choose which gifts count** (set one of these the same way):
   - `CAMPAIGN_COUNT_ALL` = `true` — every Stripe gift in the campaign window
     counts. Simplest, since every campaign button goes to the Donate page.
   - `CAMPAIGN_PAYMENT_LINKS` = `plink_...,plink_...` — only gifts through
     these Payment Links count.
   - Or tag a Payment Link with metadata `campaign` = `2026` (Payment Links →
     the link → Edit → Metadata). Works for one-time and monthly links.

4. **Optional:**
   - `CAMPAIGN_OFFLINE_TOTAL` (dollars) and `CAMPAIGN_OFFLINE_DONORS` — gifts
     received outside Stripe (checks, cash, Zelle), added to the total.
   - `CAMPAIGN_START_ISO` / `CAMPAIGN_END_ISO` — campaign window; default is
     calendar year 2026.

5. **Redeploy** (Deploys → Trigger deploy → Deploy site). Netlify only hands
   new environment variable values to functions on the next deploy.

### Verifying it works

```bash
curl https://www.yetcompassion.org/.netlify/functions/campaign-progress?campaign=2026
```

Expected JSON:

```json
{ "raised": 242.45, "donors": 3, "asOf": "2026-10-16T12:00:00.000Z",
  "campaign": "2026", "currency": "USD" }
```

If it returns `{"error": ...}` with status 503, the page keeps showing its
fallback total (`FALLBACK_RAISED` in `campaigns/2026.qmd`). Netlify →
Logs → Functions → `campaign-progress` shows the Stripe error.
