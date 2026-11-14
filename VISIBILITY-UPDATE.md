# Rosy Sage V15 — Value visibility control

This version adds a display-only privacy control. Tap the new privacy icon in the header or visit Plan > Settings > Display financial values to choose Visible or Hidden. It is stored in localStorage per device and does not change the financial database, cloud synchronization, transaction history, or investment calculations.

The curtain masks currency-formatted amounts and percentages, visually suppresses charts and comparison bars, and blurs numeric inputs in editing dialogs while hidden. It does not encrypt data, remove the underlying data from the DOM, or prevent exports, access through developer tools, or disclosure when the screen is visible. Show values again before taking screenshots containing figures you intend to share.

Deployment: replace the existing `finance-mobile-app` files in the same GitHub repository with this version, including the new `privacy.js`; preserve the `netlify` folder, environment variables, existing site URL, and Google Sheet. Back up and synchronize both phones first. Do not reinitialize the cloud or reimport opening holdings.
