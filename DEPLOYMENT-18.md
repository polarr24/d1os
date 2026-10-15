# Release 18 deployment handoff

Status: verified downloadable build; not pushed/deployed to GitHub Pages.

Prior GitHub write failed: Resource not accessible by integration. The owner must fix repository permissions before an authorized retry. No alternate credential/API/browser route bypasses that denial. The existing hosted app does not include this patch automatically.

Deploy root index.html, sw.js, manifest.webmanifest, manifest.json, icon.svg, icon-180.png and icon-512.png together. Include src/, build.py, documentation and tests for maintenance. Never publish athlete backups, medical records, source footage, storage dumps or private screenshots. Included generated test clips are synthetic, not athlete footage.

After authorized deployment:

- Export current records and retain originals outside the app.
- Reopen the same HTTPS origin; verify 18.0.0 and the offline check.
- Verify Adaptive Build, a reviewed prescription in a future session, phase/recovery holds and source-set history.
- Verify Replay decoding, exact-source practice, storage persistence and download on the actual iPhone/Safari.
- Confirm JSON backup includes source identities, not video binaries. Moving devices requires original clips.
- Close/reopen offline and confirm records remain. Keep the prior commit/root files for rollback.

Schema 14 and local keys are preserved. Do not clear site data to force an update. Changing origin starts a separate local record; import is a deliberate merge, not synchronization.
