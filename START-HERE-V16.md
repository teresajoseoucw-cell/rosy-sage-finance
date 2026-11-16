# Rosy Sage Finance V16 — Integrated Release Candidate

**Purpose:** This is the existing V15 production-code application with the V16 immersive visual design applied. It is **not** the standalone design prototype. `finance-mobile-app/` contains the real transaction, budget, account, Wealth and investment modules; `netlify/functions/` contains the existing synchronization and SMS intake functions.

## What changed

- New immersive Home screen, dark default for new installations (existing saved appearance preference is respected).
- Home uses real Cash + Bank − Credit Card Outstanding from the existing ledger, with separate cash/bank and card due labels.
- Swipe or use previous/next to see actual non-card accounts in a layered wallet layout; tap its arrow to reach account details.
- Weekly and spending trend tiles, with a tappable detailed category view; underlying category and subcategory reports remain intact.
- V16 dark design extended across Activity, Budget, Wealth, Investments, Reports and Plan. Light mode remains available.
- Existing account/budget entries, expense/income/transfer editor, recurring records, category mapping, CSV backups, portfolio and SMS functions are retained.
- Included the V15 repair for historical household wealth JSON uploads: visible validation, an explicit Import button, copy/paste fallback and duplicate-import blocking.
- Reused existing Google Sheets collections, Netlify functions, environment-variable names and storage keys. No automatic data migration or portfolio import runs at startup.

## Deployment decision

**Before deployment:** synchronize both iPhones (0 queued) and export backups from each. If the wealth import is still unresolved, verify whether any existing records are already saved before attempting another import.

1. Download and extract the full ZIP on Windows.
2. Open the current PRIVATE GitHub repository. Create a `v16-release` branch from the currently deployed branch.
3. Upload the files preserving paths: `finance-mobile-app/*`, `netlify/functions/*`, and `netlify.toml`. Do not accidentally nest a duplicate folder. Only replace matching app code; don't upload personal imports.
4. Let Netlify build a deploy preview. Do not change the production URL, `ROSY_SYNC_SECRET`, Google credentials, or spreadsheet ID.
5. On the preview: verify Activity → Add Expense, edit/delete, accounts and balances, Cherry and Chinju investments (only if previously imported into the live data), Wealth, and SMS pending review.
6. Verify cloud sync: a transaction added on test device reaches another device exactly once, then revert the test entry. Test offline queue recovery before promoting.
7. When verified, merge to the existing production branch and let the EXISTING Netlify site deploy. Open the existing Home Screen PWA on each iPhone. Avoid uninstalling, clearing Safari storage, or initializing the cloud.
8. Check 0 pending sync events after installation and compare key balances with pre-upgrade backups.

**Never** reimport Cherry's opening 60 holdings. Chinju's opening CSV is separate, and must be imported only once if absent. Never reimport wealth history when wealthItems/wealthSnapshots are already populated.

## Release qualification

100 existing automated tests passed and app.mjs parsed successfully. An iPhone/Netlify browser smoke test could not run in the isolated environment (local browser requests were blocked). This is a **staging/deployment candidate**, not a claim that the live two-phone configuration has been verified. Do not update production until the above checks pass.

## Data safety

- No secrets, SMS examples containing real account data, or private CSV/JSON imports are bundled.
- The existing storage key, collection names, ledger engine and cloud sync algorithm are unchanged.
- Appearance and value-masking preferences remain device-local.
- Household historical records and investment snapshots are never automatically inserted or overwritten by this release.
- A Netlify `sms-intake` webhook still requires its own secret and duplicate-safe staging; avoid enabling broad unattended SMS until the known multi-device concurrency limitation is addressed.
