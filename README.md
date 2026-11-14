# Rosy Sage Finance — simplified V15 investment dashboard

An in-place upgrade based on V15.2 with V14 finance features and existing Google Sheets synchronization preserved.

## Overview
- Three owner filters: Combined, Cherry, Chinju.
- Total current portfolio value, Stocks, Mutual Funds, value-history chart, asset allocation.
- Owner-scoped Zerodha Console tradebook CSV import (equity and mutual fund buys/sells; preview and duplicate detection).
- Month-end valuation CSV import, reconciliation against tradebook quantities, and dated snapshots for chart.
- Existing holdings and detailed transactions remain available via Holdings and Monthly Imports tabs; SIP and return complexity is not shown in the main portfolio UI.

## Getting started
1. BACK UP the existing app on **both** phones (JSON export) and confirm cloud synchronization.
2. Upgrade the **existing** GitHub repository and Netlify project. Do not create a new site or reinitialize the sheet.
3. Update both phones before editing portfolio records.
4. Under Invest → Cherry / Chinju → Holdings, add all opening holdings with symbol or ISIN and price; record historical opening BUY transactions with units and original cost, leaving bank-account link blank. Opening BUY must represent opening holdings before the earliest imported tradebook period. Do not duplicate earlier trades in imported tradebooks.
5. Each month, select the owner, click **1 · Import Zerodha tradebook**, review new trades and duplicates, and confirm only if all errors are resolved.
6. Download the **Valuation template** for that owner, fill `as_of`, `units`, `price`, `market_value` from the month-end holdings export, and select **2 · Import holdings valuation**. Confirm only when there are no mismatched units or missing holdings.
7. Repeat for the other owner **using the same valuation date**. Combined history shows dates only when both snapshots exist.

## Precise limitations
- Zerodha Console tradebook headers supported: `symbol`, `isin`, `trade_date`, `trade_type`, `quantity`, `price`, `trade_id`, `order_id`; alternate display names supported. It does not accept XLSX. Fund exports with different columns will need mapping after a real sample is provided.
- The tradebook does **not** provide current valuations for untouched holdings. The valuation template is required every month. A tradebook import alone does not refresh current prices.
- Unsupported F&O/derivatives and unmapped securities are rejected; no instruments are created silently.
- Zerodha tradebook amounts exclude transaction fees in this simplified workflow; gross cash flows are kept unlinked from bank accounts by default.
- Opening holdings require a verified opening BUY cost basis and unit count. An initial holdings statement alone cannot reconstruct trade history.
- Corporate actions and transfers require explicit adjustments before quantity reconciliation can pass. An illustrative or older snapshot is never called live.
- CSV statements may contain sensitive information. Import locally into the app; never commit them to public repository.

## Testing
`cd finance-mobile-app && node --test tests/*.test.mjs`

The sample preview is for UI inspection, not a substitute for validating the release on real iPhones and Google Sheets.

## Cherry opening-portfolio patch (13 November 2026)
The application now supports a one-time **Import opening portfolio CSV** control for Cherry or Chinju. Financial account balances are not affected. **The private Cherry CSV is intentionally excluded from this deployment ZIP:** distribute it separately to the phone through Files. See `CHERRY-OPENING-IMPORT-GUIDE.md`.

## Touch-enabled Investments chart

The white Investments dashboard now supports touching or dragging across recorded snapshot dates, with a readout of exact date, value and difference from the previous snapshot. The selector and 1M/6M/1Y/ALL filters remain unchanged. The graph supports keyboard arrows, Home and End when focused. A single opening snapshot is displayed as a point, not a fabricated trend. No changes to investment data or Google Sheets record schemas were required.

To deploy, update the existing repository, including `finance-mobile-app/app.mjs`, `style.css`, `index.html`, and `sw.js`. The preexisting Netlify function fix is retained. Preserve backups and queued sync events.


## Investments dashboard: equity and mutual funds returns
The white dashboard now includes Equity & ETFs and Mutual Funds cards, each showing position value, invested/remaining FIFO cost, unrealized gain/loss, return percentage and number of holdings. Percentage = (position value - remaining cost)/remaining cost x 100. Realized gains/dividends are excluded; missing prices show incomplete valuation. Chart touch interactions retained.


## Value visibility (privacy curtain)
Tap the eye/privacy button in the top header or choose **Plan → Settings → Display financial values**. This device-only preference visually masks currency amounts, percentages, chart graphics, and numeric edit fields. It does not modify stored financial records, portfolio holdings, or sync queue. It is for casual screen privacy, not encryption or protection from browser inspection, exports, screenshots taken while values are visible, or anyone with access to your unlocked device.
