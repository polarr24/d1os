# D1OS 21.0.0 deployment handoff

**Current state: review candidate only. Nothing was deployed by this task.** Public HTML fetched on October 17, 2026 remains 19.0.0 (590,080 bytes, SHA-256 `8ede47a5e691e7ef48b39cf1e2ba77432f46cab6839bd10164ea275111451648`). Source main baseline: `e815505d35d9bff367298eef138f6a131788bac9`.

Repository metadata reported push/admin permission. The actual rollback-branch write failed with `403 Resource not accessible by integration`; metadata is not proof of effective write access. No further write path bypassed this denial. Production browser gates are also unmet. The release must not be published merely because these ZIP files exist.

## Packages

- `D1OS-21.0.0-PWA-REVIEW-CANDIDATE.zip`: complete generated static shell, this handoff and release notes. It has no enabled AI endpoint. This is not an approval to deploy.
- `D1OS-21.0.0-SOURCE-AND-TESTS.zip`: editable source, build script, AI service, tests, reports, documentation, original historical archive and Git bundle.

After extracting the source package, rebuild and run current checks:

```sh
python build.py
npm test
npm run check
```

Node tests need no npm dependencies installed. The browser suite does. To reconstruct the exact Git history locally without GitHub access:

```sh
git clone D1OS-history.bundle d1os-history
cd d1os-history
git switch titan-21
python scripts/compare_inherited.py
python scripts/investigate_historical.py
```

The bundle contains the local Titan commit, baseline history and the `rollback-20.0-local` tag. Keep original history intact. ZIP packaging uses deterministic metadata; artifact hashes are in the accompanying package manifest and release-check report.

## Before publication

1. Export the athlete's existing browser data and preserve original videos separately. Never put the backup or footage in a public repository. Test migration on synthetic data and a private copy of real data on the owner's device with their involvement.
2. Complete `D1OS-BROWSER-TESTS-21.md`, including installed-iPhone offline/update checks and storage recovery. Retain actual results and repair regressions.
3. The static local app may remain AI-disabled. To advertise functioning AI, first complete `D1OS-AI-21.md`: guardian/operator review, authenticated service deployment, server secrets, rate/budget configuration, exact client endpoint, real model evaluations and human grounding/usefulness review. Rebuild and retest after changing configuration.
4. Verify actual authorized GitHub write access. Preserve a rollback branch/tag at the served baseline before publishing. If the integration still denies writes, an authorized repository administrator must repair access; do not substitute or expose credentials.
5. Review the source diff and commit. Check Pages settings for the actual publishing branch/directory; this task did not change those settings. The existing public static site uses root PWA files, but branch selection must be verified by the authorized operator.

## Authorized operator publication

After the gates pass, publish the complete shell together at the existing origin and path:

```text
index.html
sw.js
manifest.webmanifest
manifest.json
icon.svg
icon-180.png
icon-512.png
.nojekyll
```

Use the normal authorized Git workflow/Pages deployment for the repository. Do not upload the source archive, Git bundle, server secrets or athlete data as website assets. The AI service is deployed separately; GitHub Pages cannot run it.

Fetch the hosted HTML and worker, check version 21.0.0 and expected hashes, and wait for Pages to finish before declaring success. On the hosted site, verify navigation, old-record migration, source/outcome workflows, export/import, safety restrictions and a true offline relaunch. Verify the worker has the version-matched shell. Do not clear localStorage, IndexedDB or caches as an upgrade tactic.

## Rollback

The public known baseline is 19.0.0 at the full commit above. The recovered local 20.0 source is `d9da686` (tag `rollback-20.0-local`); it was not the live public baseline. Both are preserved in the bundle. Restore the selected full shell through a new reviewed rollback commit rather than rewriting remote history. Keep the current private data export and do not downgrade or wipe the athlete database. Verify unknown Titan event preservation in the rollback build using a copy before production use. Restoring code alone is not proof that a service-worker update or data rollback succeeded.

There is no deployed AI service to roll back today. For a future service deployment, revoke access at the server and clear the public endpoint in a rebuilt client if needed. Canceling a client request cannot erase data already processed by a provider.
