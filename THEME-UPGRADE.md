# Rosy Sage V15 — Appearance Toggle Upgrade

## What changed
- A moon/sun button in the top-right header immediately switches Light ↔ Dark.
- Plan → Settings → Appearance offers Light, Dark, or System (match device setting).
- Preference is stored only on this device under a separate localStorage key, not in the financial database or cloud sync event stream. Each iPhone can choose its own appearance.
- The existing default white/light style is preserved until you choose otherwise.
- New service worker cache identifier updates installed app styling after deployment.

## Upgrade on existing GitHub/Netlify site
1. Sync both iPhones, export secure JSON backups, and verify queued changes reach 0 before uploading.
2. Extract the ZIP on a Windows laptop. In your **existing GitHub repository**, open the existing `finance-mobile-app` folder and upload the *files inside* that folder. Ensure `theme.js` is added at `finance-mobile-app/theme.js`. Replace corresponding existing `index.html`, `app.mjs`, `style.css`, and `sw.js`, plus unchanged files as needed.
3. Retain `netlify/functions/sync.mjs` and `netlify.toml` in their existing paths. No changes to credentials or Google Sheet are required.
4. Commit to your existing production branch and confirm the new Netlify deployment shows Published.
5. Refresh the existing site URL in Safari and reopen the Home Screen app. Do not uninstall or clear website data.
6. Test the moon/sun button, Settings → Appearance, and your existing account, expense, and Cherry portfolio data on both phones. Never reinitialize the cloud or reimport Cherry's holdings.

## Verification
Automated application tests pass; runtime browser testing was blocked by the environment. Test on your own device before relying on the updated UI.
