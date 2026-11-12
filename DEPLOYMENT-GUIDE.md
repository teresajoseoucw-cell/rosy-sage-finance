# Rosy Sage Finance V11 — Two-iPhone Google Sheets sync deployment

## What this release does

- Preserves V10 transactions, charts, category/subcategory logic, account/card ledgers and exports.
- Uses a **private Google Sheet** as an **append-only event database**. The sheet stores changes rather than a single overwritten copy of the database.
- A Netlify Function is the only component that holds Google service-account credentials. The public website does not contain the account key, Sheet ID or financial records.
- The two iPhones share one **private sync key** entered in Plan → Settings. The same sync key must be configured on Netlify.
- Changes are queued immediately and uploaded shortly after saving; when the app is open, it checks the cloud around once per minute and also checks when brought back into the foreground or restored online.
- Offline edits are retained locally and queued for delivery. **There is no guaranteed background synchronization while the iPhone app is closed or iOS suspends it.**

## A. Prepare Google Cloud and the Sheet (computer)

1. Open https://console.cloud.google.com/ and create a project, for example `rosy-sage-finance`.
2. In **APIs & Services → Library**, enable **Google Sheets API**.
3. Open **IAM & Admin → Service Accounts**. Choose **Create Service Account**. No broad Google Cloud roles are required simply to edit a Sheet shared with the service-account email.
4. Open that service account → **Keys → Add Key → Create new key → JSON**. Download the JSON file and keep it secure; it contains a private key. Your Google Cloud organization may block key creation by policy.
5. Open https://sheets.google.com/ and create a **new, dedicated** private spreadsheet called `Rosy Sage Sync Database`. Do not use the large original budget workbook for this operation log.
6. Rename its first tab **exactly `Events`** (capital E). In row 1, enter these five column headings, one per cell: `event_id`, `timestamp`, `device_id`, `record_key`, `payload_json`.
7. Copy the spreadsheet ID from its URL: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`.
8. Press **Share**, add the service account's email address ending in `.iam.gserviceaccount.com`, and grant **Editor** permission. Keep the Sheet restricted. Do not enable 'Anyone with the link'.

## B. Prepare three Netlify environment variables

You will enter the following **in Netlify UI**, not in app source or GitHub:

- `GOOGLE_SPREADSHEET_ID`: the spreadsheet ID copied in step A7.
- `GOOGLE_SERVICE_ACCOUNT_JSON_BASE64`: the *base64 of the entire downloaded JSON key file*.
- `ROSY_SYNC_SECRET`: a new random string at least 32 characters long. This is the shared secret to enter on both phones.

To create the base64 string on **Windows PowerShell** (replace path):

```powershell
[Convert]::ToBase64String([System.IO.File]::ReadAllBytes('C:\Users\YourName\Downloads\service-account-key.json'))
```

To create a strong sync key if Node.js is installed:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Alternatively use an offline password generator for a long random secret. Save it in a password manager. Never put either secret in `index.html`, JavaScript source, a Google Sheet cell or a public repository.

## C. Deploy the app **and server function** to Netlify

**Important: the old instruction to upload only `finance-mobile-app/` to Netlify Drop is no longer sufficient.** That uploads the frontend only and omits the Google Sheets function. Use Git-based deployment for reliable function packaging.

1. Download and unzip `rosy-sage-finance-v11-google-sheets-sync.zip`.
2. Create a **private GitHub repository** at https://github.com/new (for example `rosy-sage-finance`). Upload the contents of the extracted top-level project folder, *preserving* the three top-level entries `finance-mobile-app/`, `netlify/`, and `netlify.toml`. **Do not upload** the personal financial JSON, the original XLSX, or Google service account credentials.
3. Sign in to https://app.netlify.com/ and choose **Add new project → Import an existing project → GitHub**. Authorize the private repository.
4. Set **Base directory** blank (repo root), **Build command** blank (no build needed), **Publish directory** `finance-mobile-app`. The `netlify.toml` configures the function source under `netlify/functions`.
5. Configure the three environment variables in Netlify **Project configuration → Environment variables**. Make them available to Functions. Add them before the production deployment or redeploy after saving them.
6. Deploy. Copy the published HTTPS URL, ideally under the same Netlify site/domain you used previously if preserving existing locally stored records.
7. Verify the UI opens at the site URL. The sync endpoint at `/api/sync` without a secret should return an **unauthorized** response, not a normal financial data response. If it returns 404, the Netlify Function was not deployed; check the Functions tab and build settings.

## D. Connect iPhone 1 — the primary starting database

1. On iPhone 1, open the Netlify HTTPS link in **Safari**.
2. Tap **Share → Add to Home Screen** (choose **Open as Web App** if offered), then **Add**.
3. Open the app. In **Plan → Settings**, first choose **Export backup** to save existing phone data, if any.
4. If the phone is empty and you want the uploaded Excel data as your starting point, download `rosy-sage-PRIVATE-data-and-reconciliation.zip` from the earlier V10 delivery in your private chat and extract `rosy-sage-private-starting-data.json`. In **Plan → Settings → Import backup**, select this JSON. Confirm its transactions and accounts are visible.
5. Go to **Plan → Settings → Google Sheets cloud synchronization**. Paste `ROSY_SYNC_SECRET` in the key field, then press **Save sync key**.
6. Tap **Initialize cloud from this device** **once**. Confirm. The app uploads a small initialization record and then individual records in batches to respect Google Sheets cell-size limits. Leave the app open until the status shows **Synced**.
7. Tap **Sync now** and verify a **Synced** status. Open the Sheet to confirm that `Events` has an additional data row. The row payload contains your personal finances and should not be shared.

## E. Connect iPhone 2

1. Open the **same Netlify HTTPS URL** in Safari on iPhone 2 and use **Add to Home Screen**.
2. Open **Plan → Settings → Google Sheets cloud synchronization**.
3. Paste the **same** `ROSY_SYNC_SECRET`, press **Save sync key**, then choose **Load from cloud**.
4. Confirm replacing local records (make a JSON backup first if there is any existing data). Do **not** press Initialize on phone 2.
5. Verify exact matching bank balances, individual transactions and the month-specific Needs/Wants/Savings percentages.
6. Add a small test transaction on phone 1, open phone 2 and select **Sync now**; confirm it appears there. Reverse the test with a second transaction from phone 2. Delete the test entries once verified.

## F. Day-to-day operation

- Saving a transaction creates a local change instantly; the app attempts cloud upload after about 1.5 seconds.
- Every ~60 seconds **while open**, on reconnect, and on re-entering the app, it checks for changes from the other phone.
- An offline change stays on the device and is queued; check the app's cloud status after reconnecting. If an app is closed/suspended, it cannot be guaranteed to sync in the background.
- **Concurrent edits of different records merge.** Concurrent edits of the *same* record use the latest appended update in the Sheet; the immutable Events log preserves the edit history for audit, but the app does not yet offer conflict-resolution UI.
- Keep both phones on the same URL/origin. The app retains V10's existing localStorage key for compatibility.
- This is a small-family system, not a bank-grade database or transactional ledger. Google Sheets API quotas, cloud errors and Netlify availability can affect synchronization.
- **Keep exporting a JSON backup occasionally**, particularly before updates. Google Sheets is a sync store, not a substitute for independent versioned backups. For protection, use Google Sheets **File → Version history** and save a periodic copy of the Sheet as well.
- The Sheet's Events tab is a technical database log, not a formatted financial dashboard. The app remains the interface for financial reports and charts.

## G. Privacy and security

- Keep the spreadsheet restricted to your Google account and its service account.
- The service-account private key stays in Netlify environment variables, never in downloadable app files.
- The shared sync key is stored on each device in browser storage and is **not encrypted** there. Protect both phones with a passcode and do not share the key.
- Cloud data is protected in transit by HTTPS. This design does **not** provide end-to-end encryption or per-person Google login. Anyone who obtains the shared sync key and app API URL can access the shared financial data.
- If a phone/key is compromised, change `ROSY_SYNC_SECRET` in Netlify, redeploy, and enter the new key on both phones. If the service-account key is compromised, revoke/delete it in Google Cloud and replace the Netlify setting.
- Do not upload your personal backup file or spreadsheet exports to GitHub or Netlify.

## Troubleshooting

| Symptom | Action |
|---|---|
| Sync endpoint returns 404 | Deploy project root through Git with `netlify/functions/sync.mjs`; frontend-only Drop will not install the function. |
| Invalid sync key (401) | Check exact key in Netlify and on the phone; redeploy after environment-variable changes. |
| Google Sheets request failed | Enable Google Sheets API, verify spreadsheet ID, service-account sharing, and exact tab name `Events`. Review Netlify Functions logs. |
| Sync stays pending | Check connectivity, reopen the app, tap Sync now. Do not clear local app storage before pending changes upload. |
| Phone 2 has different data | Check same URL, same key and “Load from cloud”. Do not reinitialize. |
| UI seems to show an old version | Open the site in Safari, reload, close/reopen Home Screen app; the service worker version is `v11`. |
| App says locally saved but no cloud | Look for `Synced` status. Browser save is not the same as Google Sheets confirmation. |

## Testing

Run locally inside `finance-mobile-app` (Node 20+):

```bash
node --test tests/*.test.mjs
```

45 tests passed in the generation environment, including mocked HTTP authorization and append/read API tests. **Real Google auth and actual iPhone network syncing were not tested** because your Google Sheet and Netlify environment do not exist in this workspace. Validate the two-device round trip before relying on it.


## Updating from V11 to V12
1. On **both iPhones**, open Plan → Settings and export a current JSON backup. Allow each phone to complete a cloud sync before updating.
2. Deploy **only** the updated public V12 project to the *same* Netlify site, keeping the domain unchanged. Do not replace the Google Sheet, environment variables, or account data.
3. Open the Netlify URL in Safari and hard-refresh. Reopen the Home Screen app. Check the Edit control in Activity → category → subcategory → entry.
4. Correct a single test transaction and tap Save changes. Confirm its original ID is preserved in a JSON export, its account statement changes, and that the second phone receives the correction after Sync now.
5. Change one month's Needs/Wants/Savings targets, sync, and verify on the second phone. Return them to the intended percentages.
6. The separate public HTML preview uses illustrative records. The PRIVATE real-data preview and JSON backup must remain strictly private.


## Updating from V11 to V12
1. On **both iPhones**, open Plan → Settings and export a current JSON backup. Allow each phone to complete a cloud sync before updating.
2. Deploy **only** the updated public V12 project to the *same* Netlify site, keeping the domain unchanged. Do not replace the Google Sheet, environment variables, or account data.
3. Open the Netlify URL in Safari and hard-refresh. Reopen the Home Screen app. Check the Edit control in Activity → category → subcategory → entry.
4. Correct a single test transaction and tap Save changes. Confirm its original ID is preserved in a JSON export, its account statement changes, and that the second phone receives the correction after Sync now.
5. Change one month's Needs/Wants/Savings targets, sync, and verify on the second phone. Return them to the intended percentages.
6. The separate public HTML preview uses illustrative records. The PRIVATE real-data preview and JSON backup must remain strictly private.


## V14 update (same database and cloud credentials)

1. On both phones, check sync status and export an independent JSON backup before deployment.
2. Replace application source in the same private GitHub repository with V14; preserve the existing Netlify site URL, private Google Sheet, Netlify environment variables and `netlify.toml`. Do not upload the private preview or historical JSON.
3. Wait for the updated Netlify deployment, open Safari and reload the existing URL, then reopen the Home Screen app.
4. Verify an existing transaction can be switched to 'No classification'; its amount remains in spending totals and appears as Unassigned in allocation reporting.
5. Check Overview Current Balance = cash and bank − total card outstanding. A negative result means card dues exceed cash and bank.
6. In Activity, switch between By category and By date. Date-wise entries can be expanded and edited.
7. Record an external/untracked transfer with 'Received into' set and 'Paid from' blank. The destination increases, and no source account is debited. An expense may also have a blank Paid from: its spending is counted without changing a specific account.
8. Confirm the edited record and balance changes reach the other phone through Sync now.


## V14 update (same database and cloud credentials)

1. On both phones, check sync status and export an independent JSON backup before deployment.
2. Replace application source in the same private GitHub repository with V14; preserve the existing Netlify site URL, private Google Sheet, Netlify environment variables and `netlify.toml`. Do not upload the private preview or historical JSON.
3. Wait for the updated Netlify deployment, open Safari and reload the existing URL, then reopen the Home Screen app.
4. Verify an existing transaction can be switched to 'No classification'; its amount remains in spending totals and appears as Unassigned in allocation reporting.
5. Check Overview Current Balance = cash and bank − total card outstanding. A negative result means card dues exceed cash and bank.
6. In Activity, switch between By category and By date. Date-wise entries can be expanded and edited.
7. Record an external/untracked transfer with 'Received into' set and 'Paid from' blank. The destination increases, and no source account is debited. An expense may also have a blank Paid from: its spending is counted without changing a specific account.
8. Confirm the edited record and balance changes reach the other phone through Sync now.
