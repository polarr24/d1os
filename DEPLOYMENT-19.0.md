# Deploy D1OS 19.0.0 APEX

Deploy the release’s `index.html`, `sw.js`, `manifest.webmanifest`, `manifest.json`, `icon.svg`, `icon-180.png` and `icon-512.png` together to the existing static app directory. Sources and test files are not required at runtime. Keep the same origin and base path when preserving athlete data.

Build with `python build.py`. The shell cache is `d1os-shell-19.0.0`; the worker verifies the matching HTML title. Older caches and all athlete storage are left intact. Schema 14, primary workspace keys, IndexedDB mirror, snapshots and journal recovery remain compatible.

Export athlete JSON before updating. After deployment, check the displayed version, offline status, a saved older record and all APEX views. Reload after worker activation if an old tab remains open. Install/run offline only after the matching shell is cached. Do not delete local data as an update procedure.

The ZIP is the reviewable release artifact. It has not been pushed to GitHub or published to the live host. The previously attempted GitHub integration lacked write access (HTTP 403); this release does not bypass that restriction.
