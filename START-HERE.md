# Start here — D1OS 14.1.1

## Open the app

The included index.html is the tested v14.1.1 core. See DEPLOYMENT.md for hosting verification. Desktop opening works, but iOS Files preview is not a reliable installation method.

**index.html is the complete core application.** Its JavaScript, styling, research summaries and coaching content are embedded. It does not need a CDN, login or internet API. Open it in a normal JavaScript-capable browser. A file preview inside a chat app or iOS Files may not execute JavaScript or allow reliable saving.

After publication is confirmed, open **https://polarr24.github.io/d1os/** in Safari, then More/Share → Add to Home Screen. Enable “Open as Web App” if shown. This is the existing site, so use the same Safari profile/address to retain access to your device's history. The header should then read **v14.1.1**. If an older cached screen appears after publication, let it load online, close and reopen it, then refresh once. Do not clear website data or delete your saved record to update the app.

The service worker caches the shell after a successful online visit. Reopen once, then test airplane-mode launch before depending on it at practice. If hosting the package elsewhere, keep index.html, sw.js, manifest.webmanifest and icons together; a different origin cannot see your existing browser record. [Apple’s installation guide](https://support.apple.com/guide/iphone/open-as-web-app-iphea86e5236/ios) was checked for these directions; this is not an iPhone test claim.

On a development PC, unpack the ZIP and run:

```bash
python -m http.server 8000 --directory d1os-v14.1
```

Then open `http://localhost:8000/index.html`. If running from inside the extracted folder, omit `--directory d1os-v14.1`. A phone’s HTTP LAN address is not a secure context and generally cannot install the service worker; use HTTPS for the phone.

## First use

1. Today gives the actual Pacific date, next reported game, training decision, priority and next food action.
2. Complete today’s check-in, including illness, focal pain and recent extra activity. This changes optional training; it does not clear symptoms.
3. Field contains ball security, speed, MLB, film/memory review and game week.
4. Train has practice/extra-activity logs, the seven-day board, working-load review, a supervised warm-up check, session runner and repeatable tests.
5. Lab explains anatomy, decisions and evidence. Path holds schedules, unknowns, safety, weekly review, school follow-up and data controls. Today’s actions includes a short day review; no streak penalties.

Use Aa for larger text and the sun button for sunlight Field Mode. Both save locally. The coach brief downloads a text file for you to review and choose whether to share; D1OS sends it to nobody. No notifications, HealthKit, Hudl login, automatic stat verification or background rest alarms are promised.

## Protect your record

- Path → Export JSON after important sessions, before changing builds, and regularly during the season. Confirm the file actually appears in Files/Downloads.
- Use the same browser and origin/address. A different hostname, protocol or browser has separate storage.
- Do not clear website data, use private browsing for your main record, or delete the old build before exporting.
- “LOCAL + COPY” means the last local write and secondary IndexedDB copy were read back. It does not guarantee permanent retention; iOS/browser storage can be evicted.
- “Saving unavailable” means do not trust persistence. Panic export contains pending entries as well as the available stored copies.

## Bring old data forward

An existing same-origin v14.0 record upgrades through the unchanged `d1os_v14` key and schema; facts retain their original confirmation times. The actual v14.0 seed and populated synthetic records were regression-tested for retention. Existing same-origin `d1os_v13` records are also detected. v13 facts are migrated conservatively, using the prompt’s September 25 facts over older assumptions; newer dated facts can win. The original state and unmapped fields are archived. Older backup formats are retained in full without promoting unverified old schedule/clearance fields.

The previous public site's `d1os_v7` record and `d1os-mirror` IndexedDB state/last-known-good snapshot are detected automatically. Their original bytes are archived, with an explicit message that old history is not yet mapped into current charts. Original keys/databases are not modified or deleted. Cloud-sync credentials are neither read nor exported. Very large histories can exceed browser quotas; if saving fails, use Panic export before closing. This compatibility path was tested with synthetic records matching the actual older storage schema, not with your private browser database.

For a JSON file, Path → Import → choose the file → inspect the preview → Commit. Preview does not mutate the record. Duplicate event IDs are merged deterministically. Changed versions remain in archives/conflicts. The full event archive is visible in Path and JSON export.

Migration was tested against the **actual attached v13.4 core’s seed state**, plus synthetic events and backups. No private browser database or the athlete’s separate historical backup was attached. The build does not claim complete semantic migration of unseen versions.

## Recover a problem

1. Stop relying on new logs if saving fails.
2. Use Panic export before closing. This downloads the working state, unsaved pending state and available original raw copies.
3. If primary JSON is unreadable but a snapshot/mirror is valid, the app recovers that copy and archives unreadable bytes. The original v13 storage keys are not deleted.
4. If all copies are unreadable, the app enters recovery mode rather than overwriting them with an empty record. Import a valid backup with preview. A recovery-package download is requested before replacing that working record; confirm the download yourself.
5. Keep damaged exports. They may contain recoverable content even when the app cannot parse them.

## Privacy boundary

No analytics, trackers, account, cloud sync or athlete-data endpoint. Runtime requests are limited to the same-origin static shell/cache. The existing GitHub repository/site is public: personalized starting facts embedded in the app are public, but new check-ins, workout logs, notes and exports stay in your browser unless you choose to share them. Publishing the app does not upload your browser history. Research links are user-initiated external navigation. Film URLs are stored as text and never automatically loaded. Your exported JSON contains personal information; choose where you share it.

## Platform verification limits

Tested in headless Chromium at a 402×874 viewport, including large text, Field Mode, offline reload and storage faults. **Not verified on a physical iPhone 17, iOS Safari, iOS standalone mode or an iOS simulator.** Real keyboard/safe-area behavior, background suspension, download UI and long-term storage retention require a device check. Core single-file opening on desktop was also tested; iOS file previews are not a supported installation route.
