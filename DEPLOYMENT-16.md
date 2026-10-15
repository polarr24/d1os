# Deployment · version 16

The generated `index.html`, both manifests, icons, and `sw.js` belong at the same deployment path. Source modules and `build.py` are included for reproducibility. The service-worker shell cache is `d1os-shell-16.0.0`; athlete records use their existing local keys and are not a part of the shell cache.

Before updating, export a local data backup. After deployment, reopen the app online and verify version 16.0.0 appears. An already-open older tab can remain on its prior page until reloaded. Do not clear site data to force an update unless you have exported and verified the data you need.

The test suite checks offline query-string launch and saving, old-worker replacement, valid-record preservation, and corrupt-storage recovery in Chromium. It does not establish physical iPhone/Safari behavior. GitHub commit success and GitHub Pages deployment success are separate checks.
