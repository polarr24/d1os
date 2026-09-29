# D1OS 14.1 — physiology, training and journey audit

Completed September 26, 2026. Audited the shipped v14.0 implementation, its protocol/research/testing documents, actual v13.4 source fixture, current athlete brief and relevant primary/official evidence. This is a software and evidence audit, not a physical examination, observed movement assessment or systematic review. Fixes below are implemented in v14.1; remaining uncertainties are explicit.

## Main finding

The app needed a better connection between training stress, execution quality and the next decision. The basic low-volume in-season direction is defensible. Its exact weekend split is not proven optimal for Zayden, and it should not become a year-round development program by inertia.

At age 15, the strongest useful system is one that helps you remain available, learn your position, practice with intent, recover, maintain or gradually develop physical qualities, keep school options open, and review real progress with coaches. More gym volume, more supplements or a larger estimated max cannot substitute for those relationships. No app can promise Division I recruitment.

## Consequential findings and fixes

| Priority | Finding in v14.0 | Why it matters | Implemented correction |
|---|---|---|---|
| High | The engine mainly counted team practice, even when other training occurred | PE, pickup, outside lifting and another sport still draw on recovery | Actual dated activity log; hard outside work contributes to the 48-hour hold; moderate extra work reduces lifting volume and holds additional max sprints |
| High | A hard or technically deteriorating lifting session could be followed by another optional session | The calendar alone cannot establish recovery | Near-failure sets or recorded technique deterioration hold optional work; deteriorating technique ends the current runner |
| High | Logging a sprint did not fully close the extra sprint window | One day could accumulate repeated app-approved doses | Recorded acceleration/high-speed exposure closes additional maximal sprint recommendations; lower lifting also closes a subsequent sprint window |
| High | No explicit illness check or recurring focal-pain question | Some overuse pain precedes loss of performance; illness changes exercise decisions [AAPFULL, BURNOUT] | Illness holds exercise; new injury or recurring focal pain routes to an activity hold and adult/professional review |
| High | A percentage of a reported best could open directly into working sets | Reported strength does not demonstrate experience, familiarity, equipment setup or today's technique | Supervised warm-up/familiarity confirmation before runner; optional training-experience record; working load remains adjustable |
| High | No meaningful progression workflow | Fixed weights can become stale; automatic increases can be inappropriate in season | Compare two complete sessions on distinct days with the same load, target reps, at least 3 RIR and steady technique; invite a coach decision, never automatically add weight |
| High | A flat weight trend automatically increased a heuristic calorie estimate | Flat weight does not measure energy needs or diagnose under-fueling | Show actual complete-day intake average; offer a parent/dietitian snack discussion when coverage is adequate; do not change the displayed estimate automatically |
| Medium | A green day could coexist with repeated recovery concerns | Persistent low energy/appetite or high stress needs context beyond one readiness score | Three distinct concern days in seven trigger a recovery conversation; explicitly not a REDs or burnout diagnosis |
| Medium | A seven-day activity sequence could still open optional lifting | Regular rest matters across all organized activity [BURNOUT] | Six preceding days with actual logged activity hold the next optional session; missing logs are not inferred rest |
| Medium | Reduced readiness could override “no equipment” | A bodyweight request could resolve to a normal short barbell session | Equipment mode takes precedence; substitute IDs stay distinct from barbell performance series |
| Medium | “Progress” largely meant logging completed work | The app needs to connect observations to a changed behavior | Daily close, weekly focus, measurement, coach question, school action and next review date; current focus appears on Today |
| Medium | College path was mostly an open notes field | Freshman course choices can affect later eligibility [NCAA] | Current official requirements, counselor follow-up, actual answer/status and deadline; no invented transcript or eligibility decision |
| Medium | A future-dated professional follow-up could clear a present app hold | Future documentation cannot establish current authorization | Resolution must be dated after the symptom and no later than the evaluation date; same-day clearance remains blocked |

The 48-hour hold, six-day rule, two-session review and three-concern-day trigger are transparent implementation choices. They are not individual recovery measurements or diagnostic thresholds.

## Workout audit: what is sound, what is conditional

| Component | Current dose / behavior | Judgment and limitation |
|---|---|---|
| Team practice | Mon–Wed, 150 minutes; no added default gym | Correctly treated as substantial work. Actual intensity, contact and sprint contents remain unknown until logged; duration is not intensity |
| Saturday upper | Bench 3×5; supported row 2×8; dead bug 2×6/side | A conservative maintenance exposure, conditional on recovery and supervision. The initial bench suggestion is 70% of a reported best, not 70% of a verified 1RM |
| Sunday lower | Trap bar 2×4; split squat 2×6/side; calf raise 2×10 | One main lower lift avoids doubling heavy squat and deadlift work. Load/technique tolerance must be observed. A squat may replace, not supplement, the main lift |
| Consecutive weekend split | Upper then lower when all gates pass | Dividing body regions does not eliminate whole-body fatigue. If Monday practice suffers, coach review should consider consolidating or reducing weekend work; the app does not invent a replacement full-body plan |
| Intensity and effort | 3–4 good reps left; no grinders | Useful low-fatigue intent. RIR is a learned self-report, not an objective instrument. Warm-up and coach observation override the suggested number |
| Acceleration | Optional fresh 4×10 yd, 2–3 minutes rest | Reasonable small coaching dose, not a trial-proven optimal prescription. Team/game exposure may already be enough. Mechanics and conditioning remain separate |
| Power | Sprint quality and existing sport exposure; no forced jump block | The program is not a complete power-development block. Adding new hard plyometrics during this game week is not justified by the information available |
| Hamstrings / adductors / calves | Hinge, controlled unilateral work and familiar ankle work | A trap-bar lift is not a complete knee-flexor, eccentric or reactive-strength program. Future dedicated work requires assessment, familiarization and season placement; no guaranteed injury prevention claim |
| Aerobic/repeated-effort demands | Football practice and games, actual outside load recorded | A two-way role includes repeated efforts. No evidence supplied establishes a separate conditioning deficit; extra gassers are not the default answer |
| Deload/taper | Game-relative windows and readiness holds | Appropriate conservative logic, with no claim that 48/72/96 hours are universal physiological constants |

The AAP's general resistance-development guidance emphasizes qualified supervision, training competence and appropriate progression; it is not evidence for this exact split [AAPFULL]. The once-weekly maintenance study used adult professional soccer players [MAINT]. It supports considering a smaller dose, but cannot prove that all of Zayden's qualities will be maintained. Actual comparable performance and recovery must answer that question.

## Physiology details that materially change decisions

**Growth and maturation.** Age, height and a gym number do not establish biological maturity or tissue tolerance. Do not infer growth-plate status, “advanced genetics,” a need to bulk rapidly, or adult training capacity. Recurrent localized bone/joint/tendon pain, night pain, swelling or altered gait deserves assessment. Clinical history and a sports physical are not independently documented here [AAPFULL, BURNOUT].

**Energy availability.** Growth and recovery need food even on rest days. Persistent fatigue, low appetite, recurrent injury/illness or unexpected weight loss warrant discussion with a parent and appropriate sports-health professional. These signs have many causes; the app cannot diagnose REDs, iron deficiency or a hormone problem. The IOC consensus includes male athletes, while the evidence base is uneven [REDS]. No laboratory panel or supplement dose is prescribed.

**Sleep and stress.** Record actual sleep; the adolescent reference remains 8–10 hours per 24 hours [SLEEP]. School demands, travel, late screens, schedule pressure and stress can limit recovery without a change in lifting capacity. The new weekly view shows sleep observations and reported recovery concerns, not a fabricated recovery percentage.

**Skill transfer.** Strength can support football actions; it cannot identify a ball carrier, choose a running lane or protect possession by itself. Diaz's ball-security and speed feedback plus the remembered MLB miss remain the immediate priorities. Error type, observation source, repeatable drill conditions and a coach's correction are more useful than generic effort points.

**Rest across sports.** Wrestling and track can be valuable experiences, but they still contribute load. The AAP recommends regular weekly rest and time away from each sport during the year [BURNOUT]. A planned transition is needed; the app must not run three independent programs simultaneously. The current build is specifically an in-season football decision aid.

**Supplements.** Food, sleep and training retain priority. No new creatine, magnesium or vitamin dose was added. Historical drafts do not establish actual use or a clinically reviewed regimen. Exact products, quantities, tolerance, parent awareness and professional directions remain missing until entered [CREATINE, MG, D].

## Football-development blind spots that remain real

Ball security, acceleration and carrier recognition are priorities, not a complete RB/MLB curriculum. Pass protection, receiving, run-scheme reads, reactive change of direction, coverage technique, block destruction and tackling require coach-led evaluation in the school's actual system. The app provides generic concepts and a coach-question/review route; it cannot establish assignment correctness from text.

Before adding a new drill category, use the weekly review to record: the actual coach-observed problem, one correction, the setting in which it will be practiced, and what observation would demonstrate improvement. No fabricated film access or opponent scheme is needed to begin a memory-based review.

Recruiting also needs accurate film, performance context, academics and later verified contact with programs. Current NCAA guidance is a planning reference, not an offer standard or a guarantee for the Class of 2030. The new academic workflow records a real question and follow-up rather than estimating eligibility.

## How the next few weeks should teach the system

1. Log the work that happened, including PE and outside sessions; avoid duplicate entries.
2. Use the daily readiness and warm-up gates honestly. Recovery is a valid completed decision.
3. Keep test conditions fixed. A changed timing method starts a new series.
4. Review the same ball-security drill and carrier-recognition question with a coach.
5. Review weekly: practice quality, sleep, recurring discomfort, food access, school progress and actual working sets. Keep, reduce or change one focus with a stated reason.

This is a review process, not a requirement to collect every possible metric daily. The app should earn a place in your routine by improving decisions, not by demanding more logging.

## What I disagreed with from the previous build and why

I disagreed with a schedule-based lift window being treated as sufficient permission to train when outside activity, illness, movement familiarity and recent set quality were not part of that decision. I also disagreed with automatic calorie additions to a rough estimate: the measured trend belongs alongside actual intake and growth context.

I disagreed with “keep working” without a structured review of whether the work transfers. Completed sets are not the same as better football. D1OS now asks for an observation, a coach question and a next decision. The objective is to become a better, available student-athlete; an app cannot guarantee a recruiting outcome.

## Five largest remaining weaknesses

1. No observed movement assessment, standardized sprint baseline or confirmed game film.
2. Workload/readiness thresholds remain conservative heuristics, not measured physiology.
3. Growth, food access, complete intake and professional supplement review are not established.
4. This is an in-season system; wrestling, track and off-season development need actual calendars and coach coordination.
5. No physical-iPhone/Safari validation or hosted deployment; local backups and transfer remain manual.

See RESEARCH.md for source URLs, evidence tiers and verification limits; PROTOCOL.md for the current rules; TESTLOG.md for executed tests. Unknowns are not evidence of a deficit, and passing software tests does not establish clinical or athletic effectiveness.
