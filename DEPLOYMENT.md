# D1OS 14.1.1 — launch record

Target: https://polarr24.github.io/d1os/ — existing public GitHub Pages site, same origin and path.

Prepared September 28, 2026. Local release checks: 243 passed, zero failed. See TESTLOG.md and machine-readable results under tests/.

Changes from the audited v14.1 package are limited to legacy-store discovery/preservation, a version-scoped offline cache with activation after successful installation, existing-site icon/manifest compatibility, updated release labeling and launch documentation. Actual old `d1os_v7`/`d1os-mirror` storage names were verified from the repository's previous index.html. Old user storage is never deleted. No browser exports or cloud credentials were uploaded to the repository.

The September 28 connector upload was rejected with HTTP 403 before any repository change. On September 29 the user authorized browser publishing and completed sign-in as the repository owner. This upload uses that authorized browser session. A successful repository commit alone is not a successful deployment; the Pages build and live shell must be checked after upload. The release remains exactly the 140,761-byte app tested in TESTLOG.md.

Physical iPhone/iOS Safari verification remains unperformed. Do not clear site data if an older cached screen appears; complete an online visit and reopen/refresh, checking the version in the header.
