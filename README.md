# D1OS 19.0.0 · APEX

Local-first athlete development PWA. APEX connects personal performance evidence, course planning, a 24-month roadmap, multisport handoffs, film-learning evidence and a private recruiting dossier.

Start with `START-HERE.md`. Review `APEX-ARCHITECTURE.md` for exact behavior and limitations. `QA-19.0.md` records release checks; `DEPLOYMENT-19.0.md` explains hosting and upgrades.

Runtime: one inlined `index.html`, local PWA shell files, zero external runtime dependencies. Schema 14 remains compatible with prior records. `src/` contains the modular source; `python build.py` regenerates the deployment bundle. Tests use Node and, for browser suites, Playwright/Chromium; test dependencies are not included in the runtime.

Targets are personal goals, source references are user-entered, and course/GPA outputs are planning estimates. This app does not provide NCAA certification, medical clearance, PED protocols or recruiting probabilities. Preserve symptom holds and the coached team plan.

Deployment status: packaged locally; no GitHub write or hosted deployment is claimed for this release.
