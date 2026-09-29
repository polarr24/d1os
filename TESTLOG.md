# D1OS 14.1.1 — actual build test log

Final local run: September 28, 2026. All suites were rerun on the current built app. Deployment smoke checks are reported separately in DEPLOYMENT.md.

## Result

| Suite | Checks | Passing | Failing |
|---|---:|---:|---:|
| Pure state / engine / math | 84 | 84 | 0 |
| Physiology-decision and upgrade regressions | 33 | 33 | 0 |
| Browser workflows / UI / storage / offline | 75 | 75 | 0 |
| New journey workflows / warm-up / progression | 26 | 26 | 0 |
| Release content / relationships / performance | 8 | 8 | 0 |
| Older-site migration / cache upgrade / launch | 17 | 17 | 0 |
| **Total** | **243** | **243** | **0** |

These are the checks executed on this build, not totals copied from v13.4. A named check may contain several assertions. Counts do not imply exhaustive safety, clinical validation or full accessibility conformance.

Tested application: index.html, 140,761 bytes.
SHA-256: `6d8550893711ace3ac49ecec896ea57b064e3006cdd8d2ae8ee59681b5441ada`.

Raw results: tests/core-results.json, tests/audit-results.json, tests/ui-results.json, tests/journey-ui-results.json, tests/release-results.json, tests/deployment-results.json. Executable tests and the exact legacy source fixture are included.

## Runtime and viewport

- Linux headless Chromium 153.0.8010.0, driven by Playwright; Node 24.19.0 and Python static server.
- 402×874 CSS pixels, Pacific timezone; deterministic Friday/Saturday dates for reproducible workflows.
- Today, Field, Train, Lab, Path at normal text, 20px root text and sunlight Field Mode: 15 destination/mode checks.
- Nineteen supporting screens and all five Field tabs opened.
- Empty, populated, stale, corrupt, recovered and save-denied states exercised.
- Additional 402×600 reduced viewport check confirmed a check-in submit control could be scrolled above the fixed navigation. This is **not an actual iOS keyboard test**.
- Fourteen final screenshots saved: five destinations, game week, runner, large type, Field Mode, daily execution, weekly review, progression, college path and preflight. Six new audit pages also passed normal/large-text overflow, label and control-size checks.
- No detected horizontal overflow in tested states. Visible main controls checked at least 44px; runner controls checked at least 56px.
- Label/button accessible-name checks and final-control/nav overlap checks passed. Screen-reader navigation and full WCAG audit remain untested.

## State and storage coverage

Actual attached v13.4 core seed was evaluated and migrated, not approximated from screenshots. Original raw object, supplement fields and synthetic legacy events were retained. Current brief overruled older height assumptions. No athlete browser database was supplied, so semantic migration of every historical record is not claimed.

Checks covered missing state, malformed shape, invalid fixture, missing settings/required facts, malformed metadata, duplicate events, event revision archive, stale/unknown/estimated/reported/verified facts, future clocks, timestamp conflicts and newer-record merges. Offset-aware timestamp ordering and newer UI settings were regression-tested.

Browser tests covered local read-back, reload persistence, exports, rejected malformed import, mutation-free import preview, committed merge, corruption recovery, unreadable-byte retention, legacy detection, denied writes and offline writes. IndexedDB mirror operation was exercised in the browser. Every possible transaction interruption/quota/concurrency schedule was not simulated. No long-term retention guarantee is made.

Identical ball logs do not duplicate. Session targets/completions persist; resumed sets and equipment substitutions survive reload. A pain branch stops the runner and creates an activity hold.

## New audit regressions

- Old check-ins missing illness/extra-load review cannot authorize optional lifting. Illness overrides game day; recurring focal pain creates a persistent hold.
- Hard outside work suppresses gym/sprints; moderate work reduces volume and holds maximal sprints. Backfilled activity uses occurrence time; future activity is rejected/excluded.
- Low-RIR or deteriorating-technique sets hold later optional work. Deterioration is saved before rerender and ends the current session.
- Logged maximal/high-speed exposure and earlier lower lifting close the extra sprint window; mechanics remains separate.
- Six preceding actual training days protect a rest day; missed practice does not count. Recovery concern flags count distinct dates.
- Two complete, comparable sessions on distinct days can prompt a coach progression discussion. Incomplete, changed-load, unknown-technique and low-RIR sets do not pass. “5+” RIR parses correctly.
- Warm-up/familiarity confirmation gates the runner. A recorded coach working load changes the suggestion without changing a max.
- Amber plus no equipment stays bodyweight; substitute IDs remain separate from barbell progression.
- Future professional follow-up cannot resolve a present symptom.
- Flat weight with adequate intake coverage prompts review without automatically changing calories. Partial or invalid food logs do not establish coverage. Substantial actual outside activity changes the food reference.
- Weekly focus becomes a Today action. Daily close is idempotent; school follow-up persists; coach brief downloads actual shared-state text without sending it.
- Actual v14.0 seed upgrades with no changes outside the version field; populated synthetic v14 records and original fact timestamps are retained. No private athlete database was supplied.

## Training and relationship coverage

- Friday recovery; Saturday upper; Sunday lower; Monday and Tuesday practice; Wednesday pregame; Thursday game.
- Fresh, unknown, amber and red readiness; current injury and supervision gates.
- Brutal/heavy practice; missed practice without automatic make-up; team sprint exposure prevents duplicate speed.
- Moved Sunday/Tuesday game, confirmed bye versus missing fixture, two close fixtures, stale practice/game, tentative/cancelled fixtures.
- Symptoms override game/training; same-day hold cannot be cleared by a same-day follow-up.
- Ball error/coach feedback changes Today’s cue.
- Changing kickoff through the actual form changes the training decision and meal clock.
- Changed squat input changes the alternative load; no old fixed 295-lb recommendation remains.
- Expired coach priorities no longer appear as a current actionable cue.
- Atlas evidence controls resolve to real source entries.
- Nutrition responds to actual practice duration/missed practice and adequate three-week trend coverage.
- Tests with different timing/surface/protocol metadata remain separate series.

## Math

Unit conversion, self-strength ratios, conventional e1RM calculation and invalid inputs, one-rep handling, percentage rounding, plate-pair math, dates, Pacific/DST boundaries, countdowns, nutrition bands and sweat-rate arithmetic passed. Correct arithmetic does not validate self-entered measurements or adolescent applicability of a formula.

## Performance

Measured on this Linux browser, not on an iPhone:

- Initial load plus storage-ready wait samples are recorded in tests/ui-results.json.
- Idle main-thread TaskDuration during a measured 2-second window: 2.062 ms.
- Reported JavaScript heap: 3,154,496 bytes.
- Synchronous render samples: Today 3 ms; Field 1 ms; Train 6 ms; Lab below 1-ms sample resolution; Path 1 ms.

These are small smoke-test samples, not battery, thermal, frame-paint or field benchmarks. The rest interval runs only in the visible runner and stops after the rest/visibility transition. No ongoing background polling was added.

## Offline and network audit

A same-origin service worker installed, cached the shell, then the browser was set offline. Reload and record writes succeeded. Standalone desktop file opening also succeeded without a server.

Observed HTTP origins in the UI suites: only `http://127.0.0.1:8765` and `http://127.0.0.1:8766`; the deployment compatibility suite uses `http://127.0.0.1:8877`. Requests included index, service worker, root, manifest and local icons. Both page and service-worker context requests were observed in the offline scenario. No athlete-data transmission, third-party runtime request, analytics or font CDN was observed. User-initiated external evidence links were not activated for this origin audit.

CSP blocks external script/frame/API dependencies. No TODO/lorem/HTML placeholder content or third-party script/font imports were found in the release HTML. Historical opponents occur as seed/report data and historical copy, not decision-function conditions.

## Issues found and fixed during this audit build

Initial browser run: three failed assertions. Two resume tests incorrectly repeated preflight after the warm-up was already saved; another checked substitution before its asynchronous save completed. Tests now respect persistent warm-up state and await the completed action. A release selector matched both the new activity button and the submit button; it now checks the actual primary submit control.

Code review found and fixed the no-equipment/amber precedence error, loss of the selected technique value after rerender, parsing of “5+” RIR, same-day sessions masquerading as progression, and future-dated symptom resolution. Dedicated regressions cover each. Final rerun: zero failures.

The v14.0 data-recovery, timestamp, e1RM, substitution-resume, source-control and dynamic-load fixes remain covered by rerun regressions. Earlier test totals were not reused.

## Remaining untested platform behavior

### September 28 launch compatibility fixes

The actual public v12 source used `d1os_v7` and IndexedDB `d1os-mirror`, which v14.1 did not discover. v14.1.1 detects those specific stores, retains original bytes in archives, leaves original stores intact and excludes sync credentials. Synthetic old records, corrupt-primary/valid-snapshot recovery, duplicate reloads, unchanged current athlete facts and export boundaries passed. This is preservation, not complete semantic conversion of unseen history.

The old site used a cache-first service worker. The new worker reads only its own release cache, activates after its shell is fully cached and leaves old caches untouched. An actively controlled old-cache fixture was upgraded, then the new app opened and saved offline, including a query-string launch.

The first deployment test run had one overly strict assertion comparing a running clock to exactly 78.000000 hours. It was changed to a 36-second tolerance; all 17 checks then passed. One initial core-suite invocation used the wrong working directory and was rerun from tests/. Neither was an application failure. Final full-suite results: 243 passed, zero failed.

### Still untested

Physical iPhone 17, iOS Safari/WebKit, standalone PWA install, actual safe-area insets, touch/keyboard interaction, device sleep/background resume, real download/share UI, storage eviction over weeks, very large imported histories and multi-device workflows. No iPhone-verification claim is made.

## Reproduce

From the unpacked project:

```bash
python3 build.py
npm install --no-save playwright
npx playwright install chromium
cd tests
node core.test.cjs
node audit.test.cjs
node ui.test.cjs
node journey-ui.test.cjs
node release.test.cjs
node deployment.test.cjs
```

The browser tests accept `CHROMIUM_PATH` for an existing compatible executable. Python and Node/Playwright are development/test dependencies only; they are not needed by the offline app. The legacy HTML under tests/fixtures is an immutable test input, not the app to open.
