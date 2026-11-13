# V15 Simplified — upgrade existing Rosy Sage installation

1. On each phone, tap **Sync now**, confirm status, then **Export backup** and save JSON locally. Do not proceed with unsynced records.
2. Download and extract the ZIP on Windows. Edit the *existing* private GitHub repository: replace the `finance-mobile-app/` and `netlify/` files and `netlify.toml`, preserving exactly those relative paths. Do not commit personal finance CSVs or private demo HTML.
3. Push to the branch currently connected to the existing Netlify site. In Netlify Deploys, confirm the updated version is published. Do not create a new Netlify site, regenerate keys, or change service-account credentials.
4. Refresh the existing iPhone Home Screen app and confirm new Invest view. Repeat on the second iPhone before recording portfolio activity.
5. Do not select **Initialize cloud from this device** after upgrade; the cloud is already initialized. Verify **Sync now** on each device.
6. First establish initial holdings for Cherry and Chinju under Invest → Holdings. Each requires a holding (symbol or ISIN) and opening BUY transaction with existing units and cost as at the opening date, **without** linking a bank account. Otherwise CSV reconciliation cannot know which shares already existed.
7. For each month: import owner-specific Zerodha Console tradebook CSV (equity and MF reports if relevant), resolve preview errors and confirm; then create a valuation CSV from the template and upload it at the month end. Repeat for the other owner on the same date. The chart adds only verified dated snapshots.
8. Confirm quantity totals and portfolio value against each person's Zerodha holdings. Verify two dates to see the plot.

Cautions: (a) Zerodha export columns can vary by segment/version; review the preview, (b) derivatives and unmapped holdings are not supported, (c) tradebook updates units but does not supply latest price/NAV for all holdings, (d) charges/corporate actions need separate reconciliation, (e) the sample preview is not a production app.
