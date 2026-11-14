# Integration architecture and invariants

## Persistent local and cloud state
The original `rosy-sage-finance-v1` browser storage key and `rosy-sage-cloud-sync-v1` sync settings are preserved. Existing arrays and IDs remain unchanged. Three additional list collections are introduced: `wealthItems`, `wealthSnapshots`, and `smsInbox`, accepted by BOTH `sync-core.mjs` and Netlify `sync.mjs`. `backup.mjs` exports the new lists with full-backup.json. Older backups remain valid because blank collections default to [] on load. No destructive schema migration runs on startup.

## Household wealth
`wealthItems` is a dated independent financial asset register with owner Cherry, Chinju, Joint or Unassigned; current amount; source; and history. `wealthSnapshots` holds historical total-asset observations independently of ledger transactions. This module intentionally does not mutate bank balances, expenses, portfolio snapshots, liabilities, or the existing Net Worth calculation. Existing actual portfolio investments remain in the existing Investments section. Imported historic stock/MF entries must NOT be double counted.

## Portfolio imports
The supplied Chinju private CSV is consumed by the ORIGINAL `parseOpeningPortfolioCsv()` validation and preview, not a new parallel holdings model. It uses deterministic opening IDs, rejects any pre-existing portfolio owner holdings, and generates initial trades without bank debits. It must be confirmed exactly once. The investment total is not a synchronized date match to Cherry (13 versus 14 November 2026).

## SMS suggestion flow
Optional authenticated Netlify `POST /api/sms-intake` -> parses conservatively -> checks an existing SMS item key in `Events` -> appends a single `item/smsInbox/<fingerprint>` journal event -> normal sync on both phones -> Activity review queue -> explicit ledger approval. A deterministic transaction ID based on the SMS ID prevents double counting of the same alert in the transaction list. Replayed PENDING events cannot overwrite a previously APPROVED/DISMISSED SMS record. Reject OTPs, reversals, unsupported amounts. Do not put existing cloud sync key in Shortcuts. No raw SMS body is persisted to the Sheet, only limited fields. Google Sheet journal is not a transactional database; concurrent-intake race validation is still required before broad automatic forwarding.

## Rollback
If a deploy misbehaves, use Netlify to publish the previously recorded good deploy. **Do not reset device storage, wipe the Events Sheet, disconnect/reinitialize cloud, or re-import opening positions.** Retain pre-upgrade JSON exports. If new records were posted during the bad deploy, reconcile their event IDs across both phones before any rollback.
