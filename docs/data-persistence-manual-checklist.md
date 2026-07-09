# CoopKeeper Data Persistence Manual Verification Checklist

Purpose: prove data safety for persistence, sync, and backup/restore behavior.

## Preconditions
- Run the app in development mode.
- Ensure Firestore config is available in `.env.local` for cloud scenarios.
- Open the app and note baseline counts for each data type.

## Scenario 1: Add one record for each feature
Steps:
1. Add one egg entry.
2. Add one farm task.
3. Add one expense entry.
4. Add one feed log entry.
5. Add one cleaning log entry.
6. Add one hen profile.
7. Add one weight entry (for that hen).
8. Add one health record (for that hen).
Expected:
- Each new entry appears immediately in its section and reflected summary counts.
Status:
- [ ] Pass
- [ ] Fail

## Scenario 2: Refresh persistence
Steps:
1. Refresh the page once (hard refresh).
2. Verify all entries from Scenario 1 remain.
Expected:
- No data loss after refresh.
Status:
- [ ] Pass
- [ ] Fail

## Scenario 3: Restart persistence
Steps:
1. Stop the dev server.
2. Start the dev server again.
3. Reload app and verify all entries from Scenario 1 remain.
Expected:
- No data loss after app restart.
Status:
- [ ] Pass
- [ ] Fail

## Scenario 4: Firestore unavailable fallback safety
Steps:
1. Stop app.
2. Temporarily break Firestore config (for example, clear `NEXT_PUBLIC_FIREBASE_API_KEY` locally).
3. Start app.
4. Add at least one new local entry.
5. Refresh page.
6. Restore original env config.
Expected:
- Local writes still persist in localStorage.
- App does not crash.
- Sync warning may appear, but data remains local.
Status:
- [ ] Pass
- [ ] Fail

## Scenario 5: Stale localStorage does not clobber newer Firestore
Steps:
1. With working Firestore, ensure cloud has newer data than local cache.
2. Manually set a stale `coopkeeper-data` localStorage snapshot in browser devtools.
3. Reload app.
Expected:
- Remote cloud state is loaded safely.
- Stale cache does not overwrite newer cloud records on startup.
Status:
- [ ] Pass
- [ ] Fail

## Scenario 6: Backup export and import
Steps:
1. Export a backup from Backup & Restore panel.
2. Confirm JSON includes required fields: `schemaVersion`, `appVersion`, `exportedAt`, `source`, `data`.
3. Import a valid backup file.
4. Confirm restore preview appears with counts.
Expected:
- Export file downloads correctly.
- Valid import is accepted and preview renders.
Status:
- [ ] Pass
- [ ] Fail

## Scenario 7: Pre-restore backup is created
Steps:
1. Start a restore from valid backup.
2. Confirm restore dialog.
3. Observe automatic pre-restore backup download.
Expected:
- Pre-restore backup file is downloaded before restore completes.
Status:
- [ ] Pass
- [ ] Fail

## Scenario 8: Collision-resistant IDs for new records
Steps:
1. Add several new entries across features.
2. Inspect their IDs in localStorage `coopkeeper-data`.
Expected:
- New IDs are UUID-like or random-string based, not plain `Date.now()` timestamps.
Status:
- [ ] Pass
- [ ] Fail

## Scenario 9: Avoid full-document overwrite on simple updates
Steps:
1. Run targeted updates (for example add a single egg entry).
2. Inspect Firestore writes through logs or emulator/network traces.
Expected:
- Section-level merge writes are used where possible.
- Unrelated top-level sections are not fully replaced.
Status:
- [ ] Pass
- [ ] Fail

## Scenario 10: Startup does not perform unintended writes
Steps:
1. Load app with no user actions.
2. Observe logs/network traffic.
Expected:
- No unintended broad write on startup.
- Bootstrap reads remote safely before queued writes are flushed.
Status:
- [ ] Pass
- [ ] Fail

## Quick Automated Safety Guard
Run:

```bash
node scripts/data-safety-regression.mjs
```

Expected:
- Script prints only PASS lines and exits successfully.
