# Validation evidence — Rosy Sage V15 integration RC1

- All existing application tests retained (expense ledger, V14 behavior, backup, investments, cloud journal, privacy, theme).
- New tests cover SMS parser and OTP/reversal rejection, deterministic duplicate keys, guarded opening imports, isolated wealth/SMS sync records, prevention of reopening approved messages, new Netlify SMS endpoint auth and retry idempotency.
- `node --check` passed for `app.mjs`, `sms-v16.mjs`, `sync.mjs`, `sms-intake.mjs`.
- Full suite `node --test tests/*.test.mjs`: **100 passed; 0 failed**.
- Chinju source dry run: 21 holdings / 21 initial BUYs, 0 validation errors. Equity ₹1,64,778.75 + mutual funds ₹7,82,749.08 = ₹9,47,527.83.
- Wealth historical seed: 17 assets; 8 immutable dated historical total snapshots. The detailed totals differ by 11 paise from the displayed rounded spreadsheet subtotal (₹71,08,333.89 vs ₹71,08,334).
- Chromium headless end-to-end test was attempted but timed out before producing a document. Browser / iOS manual QA remains an explicit release gate.
- No production Netlify deployment, Google Sheets modification, SMS ingestion or real phone app update was made by generating this package.
