# D1OS

An offline-capable football development app for an in-season freshman RB/LB. The daily loop is: prepare one correction, use it in team football, capture what happened, review the evidence, and retest.

## Run locally

Serve this directory with a static HTTP server, for example:

```sh
python -m http.server 8000
```

Open `http://localhost:8000`. There is no build step or required paid API. Existing cloud sync remains optional.

## Test

```sh
npm ci
npx playwright install chromium
npm test
```

The tests start their own local server. `D1_BROWSER_EXECUTABLE` can select an existing Chromium executable. `D1_BACKUP_PATH` can opt into local verification of a real backup; never commit an athlete backup or account configuration.

## Architecture

| File | Responsibility |
| --- | --- |
| `src/curriculum.js` | Position skills, conservative session suggestions, football knowledge checks |
| `src/development.js` | Pure evidence, gap, workload, daily plan, validation, and analytics projections |
| `performance.js` | The five active views and transactional logging workflows |
| `performance.css` | Responsive visual system and accessible interaction states |
| `index.html` | Existing athlete context, v7 storage/migration/sync compatibility, boot and recovery gates |
| `sw.js` | Versioned, offline application shell |
| `tests/` | Model and browser regression tests |

Read [the v12 product and data review](docs/V12-REBUILD.md) for decisions, preservation guarantees, and verification limits.
