# D1OS 19.0.0 · APEX

This release implements six systems inferred from the mission’s objectives. The submitted specification ended before its six upgrade descriptions, so this document defines the implemented scope explicitly.

| System | Working behavior | Boundary |
|---|---|---|
| Performance evidence | Eight personal target rows; attach actual test/lift events to result-sheet and witness references; strict goal comparisons; flying-metres conversion; source-change invalidation; current versus historical evidence | No universal D1 standards, authenticated witness, measured fibre type or probability of recruitment. |
| Academics | Source-referenced transcript-unit ledger, one allocation per credit, reported approval, passed/completed versus planned credits, duplicate-content exclusions, credit-weighted unweighted GPA, prospective counselor-reviewed 10/7 snapshot | Domestic 0.5/1.0-credit planning estimate; no NCAA certification or automatic best-16 selection. |
| Development horizon | Dated 24-month view, eight changing three-month emphases, coach-review criteria, junior-year goal date, direct links to the existing actual-set Adaptive Build runner | Months never advance load or imply a guaranteed adaptation. The school-year deadline can precede month 24. |
| Multisport coordination | Football/wrestling/track/off-season handoff; lead coach, replacement work, combined week, parent review, and review within 14 days; central runner holds for overdue reviews/calendar changes | Handoff records never add workouts. Organized sport needs an actual recorded practice calendar. Existing readiness and symptom decisions remain authoritative. |
| Tactical evidence | Sport-specific first-answer coach-key agreement and illustrative Wilson intervals from original-source Replay cards; later rehearsals retain the first-answer baseline | Familiar film is not field accuracy, neural reaction time or a verified 350-ms decision. Selected/correlated concepts limit interval interpretation. |
| Recruiting preparation | Editable evidence milestones, deadlines, private dossier preview and text download, opt-in academic/film summaries, current NCAA reference links | No outreach is sent. Full-game film, witnesses, source references, school fit and official eligibility remain externally reviewed. |

## Architecture and data integrity

`apex.js` is a pure UMD logic module. `apex-ui.js` uses the existing UI and persistence functions. Both are inlined by `build.py`. The runtime remains zero-dependency and makes no external research or telemetry requests. References open only when the user chooses a link.

Schema 14 and workspace storage keys are retained. New `apex-*` events preserve prior history. UI writes use unique event IDs and revision ordinals for deterministic same-timestamp updates. Read models validate payloads and ignore unsupported or future evidence. A prospective academic snapshot stores the selected course records, rather than looking up their later mutable grades.

Release merge fix: untouched placeholder facts cannot supersede actual older facts because the new release has a later build date. Explicit, source-labeled later retractions still supersede older reports. Schema-13 fact mappings also preserve valid older facts. Conflicting originals remain available in the existing conflict/archive model.

Existing state hashing is deterministic, noncryptographic comparison machinery; it is not authentication or adversarial tamper protection. Replay’s SHA-256 checks bind media bytes. Local storage and exports are not encrypted. User-entered references do not establish independent verification.

## Academic interpretation

Current NCAA Division I guidance specifies 16 approved core credits in the distribution 4 English, 3 math (Algebra I or higher), 2 science, 1 extra English/math/science, 2 social science and 4 extra approved core units. The 10/7 progression is before semester seven, not the beginning of junior year. The official minimum core GPA is 2.3; 3.0 is the athlete’s separate goal.

Each credited transcript unit must have one distinct ID. Repeated material must share a content/term ID. Duplicate selected content is excluded until the counselor resolves it. A passed completed unit contributes only to its selected bucket. Planned/in-progress, unapproved/unknown, failed, duplicate and future units do not earn completed credits in this model. Planned grades are not used. A GPA with fewer than 16 selected credits is a partial planning average, not an eligibility finding.

Exactly 16 passed credits with the required distribution and a resolved school-lab context are needed for this model’s completed-selection flag. A science lab year is checked if the school context reports one is offered. Semester, approval, lab and completion statements remain user reports. Weighting, repeated-course exceptions, more granular credits, international records, early high-school credits, changed schools, on-time graduation and post-graduation exceptions require counselor and NCAA review. The model deliberately does not invent grades for future courses or optimize an official best-16 determination.

A snapshot requires exactly 10 selected completed reported-approved credits, at least 7 English/math/science, a reported counselor review and an entered semester before seven. It cannot establish that an official deadline was met; no late prospective snapshot is accepted. Once stored, its grades stay in the planning selection. If corrections are needed, preserve the record and consult the counselor; this app cannot overrule an official locked selection.

Sources checked October 11, 2026:

- [NCAA Division I initial eligibility](https://www.ncaa.org/eligibility-center/initial-eligibility-requirements/division-i/)
- [NCAA Division I/II course worksheet linked by the current NCAA page](https://s3.amazonaws.com/fs.ncaa.org/Docs/eligibility_center/DI_and_DII_Worksheet.pdf)
- [NCAA high-school approved-course portal](https://web3.ncaa.org/hsportal/exec/hsAction)
- [NCAA recruiting resources](https://www.ncaa.org/eligibility-center/recruiting/)

The recruiting page states that communication rules vary by sport/division. This release does not hard-code a blanket junior-year contact authorization from an old proposal or calendar. Verify the current applicable rules with institutional compliance before outreach.

## Medical and performance boundaries

Symptom holds persist across APEX navigation and physical runners. A school/film review can be performed while physical work is held. A target, calendar milestone or handoff never clears shin pain. Persistent or worsening symptoms need adult/professional review; actual return follows the clinician’s plan. The app does not measure bone recovery or predict compartment syndrome.

Growth and changing coordination trigger coach review rather than automatic escalation. Neck bridges, additional collision challenges and concussion-protection claims are not programmed. Hamstring/adductor/calf competence is not reduced to an unvalidated universal ratio. Neck isometrics require qualified age-appropriate instruction.

The existing HELIX evidence library remains available with its study-level distinctions and no dosing, cycling, sourcing, drug pilots, enhancement rankings or stacks. APEX adds no treatment recommendations. Recruitment, varsity selection, injury absence and muscle/speed gains cannot be guaranteed by software.

## Product rules versus established findings

The 42-day target evidence review flag, 14-day handoff review, month-by-month roadmap and milestone priorities are explicit product/coaching choices. They are not biological expiry times or validated predictors. Actual single-rep load/bodyweight ratios require a prior actual weight within seven days; estimated 1RM never passes these personal targets. An exceeded target is still an entered result, not an authenticated combine outcome.

The sprint/jump targets are the athlete’s aspirational numbers, not published FBS/FCS selection thresholds. Flying 10 metres uses exactly `10 / recorded_seconds`; flying yards are not substituted. An electronic target cannot be passed by an entered hand-timed result. Latest linked measurement date is used rather than selecting the fastest historical result.

## Privacy

Default dossiers omit athlete identity fields, contacts, medical records, individual course titles/grades and source video bytes. Academic planning totals/GPA and film learning summaries require opt-in. Task titles, protocols, witness and source references may still identify people; review the actual preview before sharing. The app does not send it anywhere.

The release ZIP contains blank app sources, synthetic test fixtures, reproducible tests and result summaries. It excludes browser screenshots, athlete backups, raw browser data and private library-transfer files.
