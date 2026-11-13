# Rosy Sage Finance V15 synchronization hotfix

**Problem:** App reports `Offline / sync error: Invalid operation • 121 queued` after initial portfolio import.

**Root cause:** Netlify `netlify/functions/sync.mjs` was missing four portfolio collections accepted by the browser sync-core: `portfolioHoldings`, `portfolioTrades`, `portfolioSips`, `portfolioSnapshots`.

**Fix:** This package adds all four collection types to the server allowlist. No data migration or key changes.

## Safest browser-based deployment

1. Keep the existing iPhone installation and local storage intact. Do **not** remove the app or clear its browser data.
2. On your Windows laptop, open the existing GitHub repository connected to Netlify.
3. Browse to `netlify/functions`. Select `sync.mjs` and click the pencil (Edit this file).
4. Find the `const COLLECTIONS=new Set([...])` line and insert `portfolioHoldings`,`portfolioTrades`,`portfolioSips`,`portfolioSnapshots` after `investments`. Alternatively replace the whole `sync.mjs` with the copy from the ZIP using GitHub's upload feature inside `netlify/functions`.
5. Commit to the branch already used by Netlify.
6. Wait for the final Netlify production deployment to show **Published**. Do not reconfigure Netlify environment variables.
7. On iPhone containing Cherry's imported portfolio, open the app and select **Sync now**. Keep it open while uploading.
8. Confirm the queued count falls to zero, then open the Google Sheet `Events` tab and verify that new rows appear. Check the portfolio and bank totals.
9. Only after iPhone 1 sync succeeds, update/reopen the second iPhone, then **Sync now**.

**Never** select `Initialize cloud from this device` again, never reimport Cherry's file just because the queue is nonzero, and never copy private financial CSV or JSON files into GitHub.

The sync queue is on the device, not in the server source ZIP; upgrading the server cannot delete it.
