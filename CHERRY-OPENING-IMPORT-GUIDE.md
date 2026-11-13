# Rosy Sage V15 | Cherry opening portfolio import

## What this upgrade adds
A one-time **Import opening portfolio CSV** control in **Invest > Cherry > Holdings**. It creates all opening holdings and their bookkeeping BUY positions, without linked bank accounts, and stores an opening snapshot. It will not overwrite an owner with any existing holdings.

## Private holdings file — distribute separately, do not put in GitHub
`Cherry_V15_Initial_Bulk_Import.csv` is a **private** CSV. It contains 60 Zerodha holdings belonging to Cherry as of 2026-11-13. Market value from the source report is **INR 1,830,468.93** (28 stock/ETF; 32 mutual funds). Stock value INR 502,839.91; mutual fund value INR 1,327,629.02. Every row was validated by the new importer, no errors.

## Deployment
1. Ensure both iPhones have synchronized. Export JSON backups. Do not initialize the cloud again.
2. Update the **existing** private GitHub repository in the browser: replace files inside `finance-mobile-app`, plus existing `netlify/functions` and `netlify.toml` if changed. Keep the folder layout. Do **not** upload the private CSV to GitHub.
3. Wait for Netlify's final production deployment to publish. Refresh the same site on both iPhones.
4. Open Rosy Sage on the primary phone. Select **Invest > Cherry > Holdings > Import opening portfolio CSV**.
5. Select the separate private file `Cherry_V15_Initial_Bulk_Import.csv` from Files. Review the 60 entries and total **INR 1,830,468.93**. Confirm only once.
6. Tap **Sync now**. Check the Cherry dashboard, bank balances, and existing expense records. On second phone tap Sync now / Load from cloud (NOT Initialize).
7. Import Chinju only after receiving Chinju's own Zerodha holdings report and preparing the matching private CSV.

## Critical reconciliation rules
- Each BUY dated 2026-11-13 is an **opening position for software bookkeeping**, not a new bank payment or proof of historical purchase date.
- Do not import trades **on or before** 2026-11-13 again. Monthly tradebooks start **after** the opening cut-off, or the units will be double-counted.
- Zerodha's market value is captured as a source-reported, dated snapshot. The live holding aggregation may differ by INR 0.01 due to rounding of individual displayed prices/NAVs. Use the source snapshot for month-end value comparison.
- Individual opening cost is estimated from quantity x displayed Zerodha average cost, not full historical transaction lots. The original Zerodha report's invested amount (INR 1,611,882.25) differs from this rounded-price method, especially for mutual funds, and should not be asserted as exact portfolio cost basis.
- This import does NOT modify Cash, Bank, Cards, spending, or actual transactions outside portfolioHoldings, portfolioTrades and portfolioSnapshots.
- Import is blocked if Cherry already has holdings in this app. If you previously entered any manually, **do not delete them without a verified backup and reconciliation**.
