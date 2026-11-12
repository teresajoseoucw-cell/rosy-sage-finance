# Rosy Sage Finance V11 — Google Sheets two-phone sync

Read **DEPLOYMENT-GUIDE.md** first.

Project structure:
- `finance-mobile-app/` — mobile PWA (same original financial UI, reports, ledger, backups, local-first storage)
- `finance-mobile-app/sync-core.mjs` — deterministic record-level operations
- `finance-mobile-app/sync-client.mjs` — offline queue, periodic sync and cloud reload
- `netlify/functions/sync.mjs` — authenticated Google Sheets API server endpoint
- `netlify.toml` — Netlify frontend and function deployment configuration

**Do not upload the app's private finance JSON or Google service-account credential files.**

The original app documentation, financial calculation conventions and limitations remain in `finance-mobile-app/README.md`. This project requires Netlify Functions and cannot be deployed correctly as a static-only folder.

V12: explicit transaction edit controls, faster incremental polling, cache/formatter optimizations. See finance-mobile-app/README.md.

V12: explicit transaction edit controls, faster incremental polling, cache/formatter optimizations. See finance-mobile-app/README.md.

V13: side-by-side interactive category and subcategory spending charts; private real-data preview generated separately.
