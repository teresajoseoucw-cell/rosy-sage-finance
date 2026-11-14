# Rosy Sage V15 | Production integration candidate (RC1)

## Before changing the current deployment — mandatory
1. On EACH iPhone, open existing V15 > Plan > Settings > Google Sheets cloud sync > Sync now.
2. Verify **zero pending operations**. If the earlier 121-event Cherry queue is not cleared, STOP. Do not reinitialize cloud, clear Safari storage or re-import Cherry.
3. Export a full JSON backup on BOTH phones. Keep the copies outside the app, separately.
4. Record the current GitHub commit and Netlify production deploy ID, and verify both phones show consistent transactions.
5. Test the ZIP on a GitHub testing branch/Netlify deploy preview first. No financial data files belong in GitHub.

## Upload application (Windows + GitHub browser)
1. Download and unzip `Rosy_Sage_V15_Production_Integration_RC1.zip` on Windows.
2. Open your EXISTING private GitHub repository. Do not create another repo, Netlify site, database, or Google Sheet.
3. Upload the contents of `finance-mobile-app/` to the existing `finance-mobile-app/` directory (same paths, no nested folder).
4. Upload the contents of `netlify/functions/` to the existing `netlify/functions/` directory. The package includes the existing `sync.mjs` plus the new `sms-intake.mjs`.
5. Retain the root `netlify.toml` configuration (the included file is unchanged).
6. Commit to a test branch. Inspect the Netlify Deploy Preview and verify the application loads. A service-worker cache revision is included.
7. After validation, merge the test branch into the original Netlify-connected production branch, checking the new deploy completes successfully.

## Do not modify or reset
- `ROSY_SYNC_SECRET`, `GOOGLE_SPREADSHEET_ID`, `GOOGLE_SERVICE_ACCOUNT_JSON_BASE64`
- The existing Events worksheet or its journal entries
- Local finance storage, sync queue, existing transactions, banks/cards or Cherry's holdings
- Existing Netlify site URL and Home Screen installs

## First-use data imports (use ONE primary phone, then sync other phone)
**Chinju**: Invest > select Chinju > Holdings > Import opening portfolio CSV > select the separately supplied PRIVATE `Rosy_Sage_Chinju_Opening_Holdings_One_Time_Import_PRIVATE.csv` > verify 21 holdings and ₹9,47,527.83 > confirm once. Do not select Cherry. The import creates 21 holdings + opening BUY transactions and one valuation; opening BUYs MUST NOT debit a tracked bank account. Before confirming, check that Chinju has no previously imported holdings.

**Wealth**: Wealth > Household > Asset register > Import historical wealth tracker > select PRIVATE `Rosy_Sage_Wealth_History_One_Time_Import_PRIVATE.json` > confirm 17 assets and 8 historical snapshots. This is separate from the net-worth computation. Bank and market asset values from 24 October must NOT be added to bank balances / investment portfolios again. Import once on one device only.

After each one-time import, verify sync queue=0; use Sync now on the second phone. Check ownership and totals before further transactions.

## Using daily features
- Daily expense/income/transfer: unchanged from prior V15 in Activity and Add Transaction form.
- Households: Wealth > Household > owner selector > Asset register / History / Update. Enter latest TOTAL value and statement date; the previous valuation stays in that asset's history. The register does not create income/expense entries.
- SMS: Activity > SMS Inbox. Paste alert or configure Shortcut webhook. All alerts remain Pending until user approval. Confirm amount, date, type, category, source/destination account. Review duplicate warnings before approval. Never share OTPs.
- Appearance and eye/privacy toggle: retained from prior V15.

## Optional Apple Shortcuts capture
1. In existing Netlify site, configure a NEW `ROSY_SMS_INGEST_KEY` (at least 32 random characters). Do NOT reuse `ROSY_SYNC_SECRET`.
2. Trigger a Netlify deploy to ensure the function receives the environment variable.
3. In iPhone Shortcuts > Automation > Message, configure an eligible incoming bank sender. iOS action and 'Run Immediately' availability vary by version and account settings.
4. Use `Get Contents of URL` to POST JSON to `https://<EXISTING-NETLIFY-DOMAIN>/api/sms-intake`, with header `x-rosy-sms-key: <YOUR-SEPARATE-SMS-KEY>` and body keys `sender`, `text`, optionally `receivedAt` (ISO 8601). Map message content from the Shortcuts input; do not type real account secrets or sync keys into the Shortcut.
5. Trigger one TEST alert, check it appears ONLY in Activity > SMS Inbox after cloud sync, then review/approve and confirm one ledger transaction on both devices.
6. Test a duplicate SMS and a card-bill/transfer alert before broadening senders. Review the caveats below.

## Release-gate / limitations
- Test suite: see `TEST-RESULTS.md`; static JavaScript syntax and unit-level sync/API tests passed.
- **Not yet live-validated on your real Netlify site, Google Sheet and both iPhones.** A headless browser smoke test was blocked by the runtime. Do not call a deployment proven merely because a ZIP and tests exist.
- SMS ingestion is a separately authenticated, optional **pilot**: Google Sheets append is not an atomic database transaction. Exact retries are checked and idempotent IDs prevent duplicate ledger entries in replay, but simultaneous webhooks/dual-device approvals still require live concurrency validation. Start with manual SMS review before enabling automatic forwarding.
- SMS sender wording differs by bank; parsing is conservative and unsupported messages are rejected. Transfer, refund and failed/reversed alerts need user review; no automatic expense classification is reliable enough for silent posting.
- Wealth Register is an auditable dated register. It is deliberately not summed into the existing Net Worth calculation, to avoid bank/portfolio double-counting until source-to-asset reconciliation is configured.
- Private Chinju and Wealth import files are **not included** in the public application ZIP. Do not commit them to GitHub.
