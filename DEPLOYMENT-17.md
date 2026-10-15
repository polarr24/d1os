# Release 17 deployment handoff

Status: downloadable build. Not yet deployed to GitHub Pages.

The previously attempted GitHub write failed with `Resource not accessible by integration`. No alternate credential or API path is used to bypass that denial. Repository write permission must be fixed by the account owner before a new push is attempted.

Deploy these root files together: `index.html`, `sw.js`, `manifest.webmanifest`, `manifest.json`, `icon.svg`, `icon-180.png`, `icon-512.png`.

For a maintained repository, include the `src/` modules, `build.py`, documentation and tests. Do not commit athlete backups, local storage dumps, private video or QA screenshots containing athlete records.

After an authorized deployment:

- Export a backup from the installed app before updating.
- Reopen the same HTTPS origin and check the displayed **17.0.0** version.
- Run the app’s offline check, close/reopen and confirm records are retained.
- Verify the ASCEND Intelligence link from Today/Lab/Ascend.
- Confirm example data never appears in the athlete event history.
- Check local video decoding and download behavior on the actual iPhone/Safari.

Keep prior deployment files/commit available for rollback. This release keeps schema 14 and the existing local record keys; it does not reset the athlete record.
