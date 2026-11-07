# Rosy Sage Finance — Financial Health Redesign (V1 + V2 + Categories)

**Demo:** After hosting the folder, open `/preview.html` to explore an interactive app with sample finances. This demo has a separate browser storage key and does not overwrite production financial records.

**Main app:** Open `/` (or `/index.html`). If you have an earlier version, export a JSON backup before uploading this release. Production retains the original `rosy-sage-finance-v1` data key.

## New essential workflow

1. Go to **Plan → Categories**. Inspect or change the subcategory-to-parent-category mapping and default Need / Want / Savings classification. Seed subcategories come from SETUP in the supplied workbook. Suggested budget allocations can be changed, especially for ambiguous spending.
2. Go to **Wealth → Accounts**. Create banks, wallets and cards. Enter a credit card's **existing outstanding amount** as opening balance.
3. Tap **+** or **Activity → Transaction**. Select a subcategory; parent category and 50/30/20 group populate automatically. Choose the paying bank account or credit card, amount, date, spender and note.
4. For **credit card repayments**, enter a **Transfer** from the bank to the credit card. This reduces both your bank balance and credit card dues without double counting a second expense.
5. Look at **Overview** for Needs/Wants/Savings amounts, % of income, target headroom or overspend, cash balances and card dues. Filter by month.
6. In **Reports → Subcategories**, see the category/subcategory breakdown; **Reports → 50/30/20** shows targets and unclassified entries.
7. Save **CSV ZIP backups** or **JSON restore backups** from **Plan → Settings**. Backups are manual and unencrypted; protect files.

**Important financial limitations:** The 50/30/20 group is the financial behavior tag; the parent category is the type of expenditure (Bills, Expenses, Savings, Subscriptions, Debts, Income). A transfer between two accounts is not new income, spending or savings. Savings contributions are counted toward the Savings allocation when recorded as Savings transactions; a general account transfer is excluded. Historical records from older versions may have missing subcategories/account assignments; review them before trusting financial-health totals. No bank integration or two-phone sync is included. Credit card ledger assumes no automatic interest accrual or fees; record those separately. Never count the same card charge again when paying the statement.

# Rosy Sage Finance — combined V1 + V2 mobile web app (PWA)

A responsive, private, offline-capable personal finance app designed from the financial concepts in **Ultimate Annual Budget Rosy Sage 3.0 - Main.xlsx**.

## Start immediately on a computer

1. Unzip this project.
2. Install Python 3 if needed.
3. Open Terminal / Command Prompt inside the `finance-mobile-app` folder.
4. Run `python -m http.server 8000` (Windows alternative: `py -m http.server 8000`).
5. Open `http://localhost:8000`.
6. The same project works on a phone after HTTPS hosting (instructions below).

Do not double-click index.html directly; the JavaScript modules require an HTTP(S) server.

## Deploy free via Netlify (recommended)

1. Create an account at https://app.netlify.com/.
2. Open https://app.netlify.com/drop.
3. Unzip the project file on your computer.
4. Drag the **finance-mobile-app folder** (not the ZIP) onto Netlify Drop.
5. Netlify publishes a URL ending in `netlify.app` with HTTPS.
6. Open that URL on the phone. On Android Chrome, open menu > **Install app** or **Add to Home screen**. On iPhone Safari, tap **Share > Add to Home Screen > Add**.
7. Add bank accounts, recurring items and transactions. Export a backup from **Plan > Settings** after entering substantial data.

Netlify static hosting does not store your personal finance data. Entries are stored *only in the browser on each device*. Opening the website on a second device will not show the first device's data. Transfer via encrypted/offline handling of JSON backup. Do not email unencrypted backup files containing personal finance data.

## Deploy free via GitHub Pages (alternative)

1. Create a GitHub repository (can be private; check current GitHub Pages rules for your plan).
2. Upload the *contents* of `finance-mobile-app` at the repository root.
3. Go to **Settings > Pages**. Select **Deploy from a branch**, `main`, root `/`.
4. After deployment, open your `https://<username>.github.io/<repo>/` site and install as above.
5. When publishing updates, upload changed files and change the cache name in `sw.js` to force a refreshed offline bundle.

## What to enter first

1. **Wealth > Accounts**: opening balances, account names and types.
2. **Activity > Recurring payment** or **Plan > Recurring**: salary, rent, EMIs, subscriptions, scheduled savings etc.
3. **Activity > Transaction**: spending, income, transfers and savings allocations. For transfers choose `Transfer`, a source account and a destination account; they affect balances, not income/spending.
4. **Budget > Set budget**: monthly amounts for Income, Bills, Expenses, Savings, Subscriptions, Debts.
5. **Wealth**: optionally add sinking funds, debts, assets and investment scenarios.
6. **Plan > Annual totals / Calendar / No-spend days**: view the generated insights.

## Key accounting conventions

- All input amounts are denominated in chosen currency and stored as numeric amounts. Computation converts them into integer minor currency units to limit floating point accumulation.
- Actual totals include manually recorded transactions and **paid** recurring occurrences. Unpaid occurrences appear as upcoming, and do not count as actual spending or income.
- Annual and monthly **spending** includes Bills + Expenses + Subscriptions + Debts. **Outflow** additionally includes Savings. `Available = Income - Outflow`.
- Fund contribution tracker is a standalone tracker, mirroring the workbook's standalone module. Add a separate bank transaction if you want the actual account balance to change.
- Debt calculator is an illustrative amortization simulation using annual interest / 12, monthly minimums and an optional extra payment, priority by avalanche/snowball.
- Investment scenarios use nominal monthly compounding based on entered estimated APR/ROI; they do not fetch prices or show live investments.
- The no-spend calculation uses calendar days with no recorded completed expense, bill, subscription or debt payment.

## Combined edition: reporting additions

The bottom navigation now includes six sections: Overview, Activity, Budget, Wealth, **Reports**, Plan. The Reports subviews are:

- **Cash flow**: 12-month income, spending and savings chart, monthly net flow, monthly reconciliation table.
- **Categories**: monthly donut and precise category budget vs completed transactions, with an editor for category budget amounts.
- **By person**: spending attribution to the "Spender / earner" field on recorded transactions and recurring rules.
- **Paychecks**: user-entered paycheck plans, allocations by line item, and remaining to allocate. This is a planning layer, not duplicate accounting entries.
- **Net worth history**: monthly end-of-period snapshots with a chart of asset, liability and net value. This deliberately does not infer historical values from today's assets.
- **50/30/20**: month-level actuals versus guideline targets, with an explicit unclassified amount.

The existing Plan > Settings CSV ZIP export includes the three new collections (`categoryBudgets.csv`, `paychecks.csv`, `netWorthSnapshots.csv`) and a full restorable JSON backup. Existing V1 JSON can be imported, and the application intentionally retains the V1 localStorage key to preserve same-origin entries on update. Export backups **before** deployment regardless.

## Workbook coverage and limitations

Workbook tabs represented: SETUP; BANK ACCOUNTS; RECURRING; PAYMENTS; VARIABLE; DASHBOARD; ANNUAL TOTALS; CALENDAR; JAN through DEC; PAYCHECK (monthly income representation); 503020; DISTRIBUTION (spending breakdown); SINKING FUNDS; DEBT CALCULATOR; NET WORTH; INVESTMENT; CHALLENGE.

This is a **combined functional implementation, not a verified one-to-one reproduction of every spreadsheet formula or chart**. The source workbook includes hundreds of thousands of formulas, legacy helper tables, custom charts and spreadsheet-specific logic. In particular, this app does not yet implement all workbook-specific zero-based carryover rules, per-paycheck transaction reconciliation, historical account balance backfills, date/amount overrides for individual recurring occurrences, bank-feed reconciliation, lender-specific amortization schedules, advanced standalone challenge logic, or automatic import/migration of XLSX historical entries. Category budgets, paycheck planning, person-wise spending, and historical net-worth snapshots are implemented as generalized equivalents, not necessarily exact spreadsheet formula replicas. The app also does not sync devices, connect to banks, or provide login/encryption-at-rest.

**Do not use this version as a sole financial record** before independently validating it against your historical workbook and maintaining backups. It is not reasonable to guarantee bug-free behaviour for every case; the test suite covers a selection of core financial invariants.

## Test calculations

Requires Node.js 20+:

```
node --test tests/*.test.mjs
```

## Security and retention

- Everything runs in the browser. There is no cloud API or analytics SDK.
- Data persists in `localStorage`, which is not encrypted and may be readable by anyone with unlocked access to the device/profile. Avoid a shared device.
- There is no automatic backup, multi-user synchronization or recovery after device loss. Export a JSON backup regularly and safeguard it.
- Avoid deploying this project under a third-party domain you do not control.
- A production-grade cross-device product would require authentication, encrypted storage, managed backups and reconciliation tests.

## Architecture

- `index.html` HTML shell and navigation
- `style.css` responsive visual language
- `app.mjs` inputs, views, local persistence and SVG charts
- `analytics.mjs` unified v2 reporting calculations and reconciliations
- `engine.mjs` finance computations
- `sw.js` cache for offline use after initial installation
- `manifest.webmanifest` installation metadata
- `tests/engine.test.mjs` model regression tests

## Updates

Edit source code, then redeploy the folder. Increment the service-worker cache name (`rosy-sage-combined-v3` -> `rosy-sage-combined-v4`) when releasing changes. Existing data will normally remain in browser storage if you keep the exact same domain and app origin, but **always export a backup before updates**.

## CSV backups (v1.1)

Under **Plan > Settings**, select **Download all CSVs** to download a ZIP with one CSV per data collection, `settings.csv`, explanatory README, and `full-backup.json`. This preserves an importable JSON restore file alongside spreadsheet-friendly CSV exports. Alternatively choose **Export one CSV** for an individual data table. CSVs reflect the **raw stored entries**, not every derived dashboard calculation or expanded future recurring occurrence.

Back up at least monthly and immediately before changing phones, clearing browsing data, or redeploying. The app does **not** automatically back up on a schedule. CSV exports are **not encrypted** and CSV files **cannot currently be re-imported**; restore with the JSON file included inside the ZIP. When redeploying, keep the exact same website origin to retain localStorage; export first regardless.

## V5 — payment sources, monthly allocation controls and native date selection

- The transaction **Paid from** and **Received into** selectors contain the screenshot-provided choices: Bank Cherry, Bank Chinju - HDFC, Wallets, Parents, Cashback Transfer, Sodexo, Bank Chinju - SIB, X5053, X0005, X4007, X3185, and Cash. These are pre-created in Accounts with **zero opening balance**; screenshot balances are NOT imported. Edit balances in **Wealth → Accounts** to match reality. To avoid duplication, existing records with matching names are preserved.
- Use **Overview → Edit limits**, **Budget → Edit monthly limits**, or **Plan → Settings → Edit limits** to customize Needs, Wants and Savings proportions for any month. Percentages must add to exactly 100; default is 50/30/20 when a month has no override. Stored in `allocationTargets`, included in CSV ZIP and JSON backups. These settings affect targets, not transaction classifications.
- Dates use the browser's native calendar control (`input type=date`) for transaction dates, recurring start/end, paycheck and contribution dates; month-only records use `input type=month`. On iPhone Safari, the operating system chooses how the picker appears.
- For a bank-to-card payment, record a Transfer from bank to card to avoid recording the credit-card expense twice. No automatic cloud sync between iPhones.
- Back up your old app as JSON before deployment; upgrade keeps the same production localStorage key `rosy-sage-finance-v1`. Never replace another iPhone's records without first exporting its data.


## V6 preview and performance repair

- Corrected the standalone preview to use the complete production DOM, including the monthly allocation editor.
- Added a self-contained `rosy-sage-interactive-preview-v6.html` (outside this app folder), requiring no web server, remote library or network connection to render.
- Preview records use `rosy-sage-finance-preview-v6`, separate from production `rosy-sage-finance-v1`.
- Updated offline service worker to v6 and network-first caching with offline fallback, preventing persistent stale application assets after deployment.
- Reduced investment projection calculations from repeated full-series runs to linear-time monthly updates.
- To update an already installed iPhone PWA: first export JSON, redeploy to the existing Netlify site, open Safari on the same URL, refresh, then close/reopen the Home Screen app.
- This release is a static PWA with local-only browser data. Never use concurrent devices expecting live synchronization.


## V7 improvements

- Activity shows Category -> Subcategory -> Individual transactions, with per-level totals and back navigation.
- Monthly allocation editor now accepts decimal percentages, checks for a 100% total, verifies local-storage persistence, and displays a saved confirmation.
- When changing the month in the allocation editor, the stored targets for that specific month are loaded.
- Service worker updated to v7; application storage remains `rosy-sage-finance-v1` to preserve installed data.
- Preview uses an isolated key and shows example Food transactions for drill-down testing.
- The two iPhones remain independent (no cloud synchronization). Export JSON before updating.


## V7 improvements

- Activity shows Category -> Subcategory -> Individual transactions, with per-level totals and back navigation.
- Monthly allocation editor now accepts decimal percentages, checks for a 100% total, verifies local-storage persistence, and displays a saved confirmation.
- When changing the month in the allocation editor, the stored targets for that specific month are loaded.
- Service worker updated to v7; application storage remains `rosy-sage-finance-v1` to preserve installed data.
- Preview uses an isolated key and shows example Food transactions for drill-down testing.
- The two iPhones remain independent (no cloud synchronization). Export JSON before updating.


## V7 improvements

- Activity shows Category -> Subcategory -> Individual transactions, with per-level totals and back navigation.
- Monthly allocation editor now accepts decimal percentages, checks for a 100% total, verifies local-storage persistence, and displays a saved confirmation.
- When changing the month in the allocation editor, the stored targets for that specific month are loaded.
- Service worker updated to v7; application storage remains `rosy-sage-finance-v1` to preserve installed data.
- Preview uses an isolated key and shows example Food transactions for drill-down testing.
- The two iPhones remain independent (no cloud synchronization). Export JSON before updating.


## V7 improvements

- Activity shows Category -> Subcategory -> Individual transactions, with per-level totals and back navigation.
- Monthly allocation editor now accepts decimal percentages, checks for a 100% total, verifies local-storage persistence, and displays a saved confirmation.
- When changing the month in the allocation editor, the stored targets for that specific month are loaded.
- Service worker updated to v7; application storage remains `rosy-sage-finance-v1` to preserve installed data.
- Preview uses an isolated key and shows example Food transactions for drill-down testing.
- The two iPhones remain independent (no cloud synchronization). Export JSON before updating.


## V8 improvements

- Activity shows Category -> Subcategory -> Individual transactions, with per-level totals and back navigation.
- Monthly allocation editor now accepts decimal percentages, checks for a 100% total, verifies local-storage persistence, and displays a saved confirmation.
- When changing the month in the allocation editor, the stored targets for that specific month are loaded.
- Service worker updated to v8; application storage remains `rosy-sage-finance-v1` to preserve installed data.
- Preview uses an isolated key and shows example Food transactions for drill-down testing.
- The two iPhones remain independent (no cloud synchronization). Export JSON before updating.


## V8 improvements

- Activity shows Category -> Subcategory -> Individual transactions, with per-level totals and back navigation.
- Monthly allocation editor now accepts decimal percentages, checks for a 100% total, verifies local-storage persistence, and displays a saved confirmation.
- When changing the month in the allocation editor, the stored targets for that specific month are loaded.
- Service worker updated to v8; application storage remains `rosy-sage-finance-v1` to preserve installed data.
- Preview uses an isolated key and shows example Food transactions for drill-down testing.
- The two iPhones remain independent (no cloud synchronization). Export JSON before updating.


## V8 — Account and credit-card statements

Open **Wealth → Accounts**, tap an account or card name, and see a reconciliation panel with starting balance, deposits (card repayments), withdrawals (card charges), undated adjustments and closing balance. The statement includes a date-range picker, chronological transactions with running balances, and a **Download CSV** action. **Edit** remains a separate button beside each account.

- Credit-card balances represent **amount owed**, not available cash. A card repayment is a transfer from a bank to the card; it is not a new expense.
- The statement starts from the account's configured opening balance and undated adjustment, and includes transactions in the **selected calendar year**. Date filters inside the year carry forward preceding movements into the displayed period's opening balance.
- **Important:** Account opening balances are not automatically rolled forward from earlier years. If accounts have history spanning multiple years, establish the opening balance for the reporting period carefully before relying on the balance-sheet view. The statement is not a bank-synced statement.
- The screenshot's figures are an example of the desired report structure, not values inserted into your app.
- CSV is export only; use JSON to restore the full database.


## V8 improvements

- Activity shows Category -> Subcategory -> Individual transactions, with per-level totals and back navigation.
- Monthly allocation editor now accepts decimal percentages, checks for a 100% total, verifies local-storage persistence, and displays a saved confirmation.
- When changing the month in the allocation editor, the stored targets for that specific month are loaded.
- Service worker updated to v8; application storage remains `rosy-sage-finance-v1` to preserve installed data.
- Preview uses an isolated key and shows example Food transactions for drill-down testing.
- The two iPhones remain independent (no cloud synchronization). Export JSON before updating.


## V9 improvements

- Activity shows Category -> Subcategory -> Individual transactions, with per-level totals and back navigation.
- Monthly allocation editor now accepts decimal percentages, checks for a 100% total, verifies local-storage persistence, and displays a saved confirmation.
- When changing the month in the allocation editor, the stored targets for that specific month are loaded.
- Service worker updated to v9; application storage remains `rosy-sage-finance-v1` to preserve installed data.
- Preview uses an isolated key and shows example Food transactions for drill-down testing.
- The two iPhones remain independent (no cloud synchronization). Export JSON before updating.

## V9 — Monthly target editor repair

- Open **Overview** and expand **Set monthly Needs / Wants / Savings limits** immediately below the allocation cards. All three values are editable without opening a dialog.
- The Save button updates the selected month's targets, verifies the saved values, refreshes all three allocation indicators, and shows a confirmation banner.
- The previous **Edit limits** dialog remains available, and both entry points use the same save function.
- Custom targets are keyed by `YYYY-MM`. Switching between months shows the relevant stored targets or the default 50/30/20 if none were saved.
- The downloadable preview uses a separate data key and does not change production financial records. Browser storage may behave differently when a standalone HTML is opened locally rather than published to HTTPS. For long-term use, deploy the PWA.
- Existing production records remain under the `rosy-sage-finance-v1` key; do not clear browser data when updating. Export a JSON backup first.


## V9 improvements

- Activity shows Category -> Subcategory -> Individual transactions, with per-level totals and back navigation.
- Monthly allocation editor now accepts decimal percentages, checks for a 100% total, verifies local-storage persistence, and displays a saved confirmation.
- When changing the month in the allocation editor, the stored targets for that specific month are loaded.
- Service worker updated to v9; application storage remains `rosy-sage-finance-v1` to preserve installed data.
- Preview uses an isolated key and shows example Food transactions for drill-down testing.
- The two iPhones remain independent (no cloud synchronization). Export JSON before updating.


## November 2026 real-workbook migration package
The **public deployment ZIP contains no user's financial data**. The separate PRIVATE JSON backup was extracted from a user's latest workbook. Do not publish that JSON, the reconciliation report, or the private HTML preview to Netlify or GitHub. After Netlify installation, open **Plan → Settings → Import backup** on each phone and select the PRIVATE JSON, after backing up any existing records. Imported historical account bridges are described in the report and require review against statements.


## November 2026 real-workbook migration package
The **public deployment ZIP contains no user's financial data**. The separate PRIVATE JSON backup was extracted from a user's latest workbook. Do not publish that JSON, the reconciliation report, or the private HTML preview to Netlify or GitHub. After Netlify installation, open **Plan → Settings → Import backup** on each phone and select the PRIVATE JSON, after backing up any existing records. Imported historical account bridges are described in the report and require review against statements.

---

## V11 Google Sheets sync update

**Supersedes the earlier 'no cloud sync' statements in this file.** See the repository-root `DEPLOYMENT-GUIDE.md` for instructions and current security model. V11 supports a private Google Sheet as an append-only change log, with a Netlify Function and shared sync secret, automatic syncing while open, local offline queue, two-iPhone initial import, and explicit connection controls under Plan → Settings.


## V12 — Corrections, speed, and sync integrity
- In **Activity**, drill into Category → Subcategory → Individual entries. Tap **Edit** on a manual entry (also available under Recent transactions). Correct date, amount, subcategory, description, spender and source/destination account, then **Save changes**. The same transaction ID is preserved. Scheduled occurrences are managed using their recurring rule, not edited as standalone transactions.
- Corrected entries change account statements, budgets, charts and Needs/Wants/Savings immediately, while creating a record-level Google Sheets event if sync is connected.
- Monthly allocation overrides now also notify the cloud sync queue.
- Financial computations reuse same-year expanded transactions within a render and invalidate that cache after writes. Currency formatters are reused.
- Cloud polling now uses an incremental Google Sheets cursor after initial replay. If a write reply was lost, the next pull checks event IDs before retrying queued writes.
- **Unchanged storage key:** `rosy-sage-finance-v1`. Imported V10 real finances are never embedded in the public app. Data is preserved on the same origin/device when updating, but always export a private JSON before redeployment.
- The public standalone HTML preview contains only fabricated examples; the separately named PRIVATE HTML preview embeds real financial data and **must never be uploaded to Netlify or GitHub**.
- **Limitations:** iPhone browser tests and live Netlify/Google authorization have not been run in this environment; changes to the same record on both phones before synchronization still resolve last-event-wins. A full financial reconciliation remains necessary for account bridge adjustments.


## V12 — Corrections, speed, and sync integrity
- In **Activity**, drill into Category → Subcategory → Individual entries. Tap **Edit** on a manual entry (also available under Recent transactions). Correct date, amount, subcategory, description, spender and source/destination account, then **Save changes**. The same transaction ID is preserved. Scheduled occurrences are managed using their recurring rule, not edited as standalone transactions.
- Corrected entries change account statements, budgets, charts and Needs/Wants/Savings immediately, while creating a record-level Google Sheets event if sync is connected.
- Monthly allocation overrides now also notify the cloud sync queue.
- Financial computations reuse same-year expanded transactions within a render and invalidate that cache after writes. Currency formatters are reused.
- Cloud polling now uses an incremental Google Sheets cursor after initial replay. If a write reply was lost, the next pull checks event IDs before retrying queued writes.
- **Unchanged storage key:** `rosy-sage-finance-v1`. Imported V10 real finances are never embedded in the public app. Data is preserved on the same origin/device when updating, but always export a private JSON before redeployment.
- The public standalone HTML preview contains only fabricated examples; the separately named PRIVATE HTML preview embeds real financial data and **must never be uploaded to Netlify or GitHub**.
- **Limitations:** iPhone browser tests and live Netlify/Google authorization have not been run in this environment; changes to the same record on both phones before synchronization still resolve last-event-wins. A full financial reconciliation remains necessary for account bridge adjustments.


### V13 — Dual spending pie charts
- Overview and Reports → Categories display category and subcategory pies side by side at desktop widths, stacked on iPhones.
- Hover with a mouse or tap a slice/legend item to see the full subcategory name, INR value and percentage.
- Both use the same reporting period and transaction rows; they exclude income and account-to-account transfers, and include recorded savings allocations as outflows.
- No changes to existing transaction data formats, storage keys, migration records, Netlify service or sync protocol.
- The separate PRIVATE preview includes real financial records and must never be deployed publicly.
