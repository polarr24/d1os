# D1OS 14.1.1 — Zayden / Field Operations

Application address: **https://polarr24.github.io/d1os/**. Look for **v14.1.1** in the app header. See DEPLOYMENT.md for hosting verification and TESTLOG.md for the executed release checks.

In iPhone Safari: Share → Add to Home Screen. Look for v14.1.1. If the old cached version opens, allow an online visit, close/reopen and refresh once. Do not clear website data to update.

Start with Today → daily check-in. The current reported team schedule is Monday–Wednesday, 3:15–5:45 PM Pacific; the app does not stack a gym session after practice. Next athlete-confirmed fixture: October 1, 2026, 4 PM Pacific, Palo Verde. The app uses the actual date and later dated updates take precedence.

[Download the complete v14.1.1 bundle](D1OS-14.1.1-complete.zip), including editable source, reproducible tests and screenshots.

The application runs locally without external runtime dependencies or analytics. Browser-entered records are not uploaded. The repository is public, including the personalized starting facts embedded in the application. Back up through Path → Export JSON.

- [Start / install / backup / recovery](START-HERE.md)
- [Current protocol](PROTOCOL.md)
- [Research evidence and limitations](RESEARCH.md)
- [Physiology and product audit](AUDIT.md)
- [Executed tests](TESTLOG.md)
- [Launch verification](DEPLOYMENT.md)
- [Remaining gaps](GAPS.md)
- [Build report](BUILD-REPORT.md)

index.html is the complete core app. sw.js and the manifests/icons support hosted offline installation. src/ plus build.py reproduce the HTML. Run tests from tests/, following TESTLOG.md. Historical HTML in tests/fixtures is not the application to open.

Legacy repository support scripts and files are retained but are not loaded by this version. Older browser records are preserved without pretending their fields have all been converted to current charts. No guaranteed college outcome, medical clearance, precise fatigue prediction or actual-iPhone verification is claimed.
