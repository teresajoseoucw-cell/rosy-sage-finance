# Rosy Sage Finance V15 - Equity and Mutual Funds Position Cards

## Added
- **Equity & ETFs**: current position value, remaining invested cost, unrealized gain/loss, unrealized return percentage, holding count.
- **Mutual Funds**: identical metrics.
- Cards change when selecting Cherry, Chinju, or Combined.
- Interactive white portfolio history chart remains available.

## Calculation
For each actively held security, remaining cost is the FIFO cost of unsold shares/units from recorded purchases and opening positions. Current value is units times last saved price/NAV. Each asset-class return percentage is (current value - remaining cost) / remaining cost x 100. It does **not** include realized gains, dividends, taxes, or time weighting. It cannot be directly compared with Zerodha's XIRR. If a holding is unpriced, the group return is marked incomplete.

## Data integrity
This is a UI / derived-metric update only. No migrations, new sync collections, or changes to Google Sheets needed. Keep existing initial holdings and queued records. Do not reimport Cherry holdings. The Netlify function includes the prior portfolio sync-record allowlist fix.

## Deploy via GitHub browser
Back up / sync first. Upload only `finance-mobile-app/app.mjs`, `finance-mobile-app/portfolio-v15.mjs`, `finance-mobile-app/style.css`, and `finance-mobile-app/sw.js` to their existing paths; do not overwrite or reinitialize cloud data. New test file is optional for deployment. Confirm the final Netlify build and refresh the installed app. If pending sync records remain, ensure the server-side allowlist repair is deployed first.
