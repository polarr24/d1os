/* D1OS 12 — one loop: prepare, execute, observe, correct, retest.
   Storage compatibility lives in the original engine; all active product views live here. */
(() => {
  "use strict";
  const VERSION = "12.0",
    M = D1Engine,
    K = D1Catalog.skills,
    LESSONS = D1Catalog.lessons;
  const $ = (s) => document.querySelector(s),
    E = (v) => esc(String(v ?? "")),
    today = () => todayISO();
  const rows = (type, d = today()) => M.rows(S, type, d),
    latest = (type, d = today()) => M.latest(S, type, d);
  const catalog = (id) => K.find((k) => k.id === M.skillId(id)) || K[0];
  const schedule = () => levelSchedule(S).games;
  const plan = () =>
    M.plan(S, K, today(), schedule(), clearanceRead(S, today()).clear);
  const short = (d) =>
    M.validDate(d)
      ? new Date(d + "T12:00").toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      : "Date unknown";
  const full = (d) =>
    new Date(d + "T12:00").toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  let role = "RB",
    filmFilter = "all",
    seasonDate = null,
    focusReturn = null,
    resetTimer = null,
    resetStart = 0,
    resetComplete = false,
    currentLesson = null,
    lessonAnswered = false,
    pendingImport = null,
    importOrigin = null;
  function icon(name) {
    const p = {
      today: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
      development: "M4 19l6-7 4 3 6-11M14 4h6v6",
      film: "M3 5h18v14H3zM3 9h18M7 5v4M13 5v4M10 12l5 2-5 3z",
      season: "M5 5h14v15H5zM8 3v4M16 3v4M5 10h14",
      progress: "M4 20V4M4 20h16M8 16v-4M13 16V8M18 16V5",
      arrow: "M5 12h14M14 7l5 5-5 5",
      plus: "M12 5v14M5 12h14",
      check: "M5 12l4 4L19 6",
      chevron: "M9 5l7 7-7 7",
      settings:
        "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8M12 2v3M12 19v3M2 12h3M19 12h3",
      play: "M8 4l12 8-12 8z",
    };
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${p[name] || p.arrow}"/></svg>`;
  }
  function button(label, action, kind = "", attrs = "") {
    return `<button type="button" class="p-btn ${kind}" data-action="${E(action)}" ${attrs}>${label}</button>`;
  }
  function badge(text, kind = "") {
    return `<span class="p-tag ${kind}">${E(text)}</span>`;
  }
  function heading(eyebrow, title, desc, action = "") {
    return `<div class="p-top"><div><div class="p-eyebrow">${E(eyebrow)}</div><h1 tabindex="-1">${E(title)}</h1>${desc ? `<p>${E(desc)}</p>` : ""}</div>${action}</div>`;
  }
  const panel = (title, html, cls = "") =>
    `<section class="p-panel ${cls}">${title ? `<h2>${title}</h2>` : ""}${html}</section>`;
  const empty = (title, body, action = "") =>
    `<div class="p-empty"><h3>${E(title)}</h3><p>${E(body)}</p>${action}</div>`;
  const actions = (html) => `<div class="p-actions">${html}</div>`;
  const section = (title, right = "") =>
    `<div class="p-section"><h2>${title}</h2>${right}</div>`;
  const paint = (id, html) => {
    $("#v-" + id).innerHTML = `<div class="p-page">${html}</div>`;
  };
  function safeURL(value) {
    try {
      const u = new URL(value);
      return ["https:", "http:"].includes(u.protocol) ? u.href : null;
    } catch {
      return null;
    }
  }
  function counts() {
    return Object.fromEntries(
      ["events", "metrics", "lifts", "coach", "clips", "games", "notes"].map(
        (k) => [k, (S[k] || []).length],
      ),
    );
  }
  function record(type, meta, d = today()) {
    M.validateEvent(type, meta);
    if (!M.validDate(d)) throw Error("Choose a valid date.");
    const stamp =
      (S.events || []).reduce(
        (n, e) => Math.max(n, Number(e.t) || 0),
        Date.now(),
      ) + 1;
    return { id: uid(), t: stamp, d, type, meta: { schema: 1, ...meta } };
  }
  function transact(fn, message) {
    if (writeBlocked()) {
      toast(
        "Resolve data recovery before logging. Your stored history is protected.",
      );
      return false;
    }
    const before = structuredClone(S),
      lwwBefore = structuredClone(_lww);
    try {
      fn();
      if (!save())
        throw Error(
          "Not saved. Free storage or export your record, then try again.",
        );
    } catch (e) {
      S = before;
      _lww = lwwBefore;
      showError(e.message);
      return false;
    }
    if (message) toast(message);
    return true;
  }
  function append(type, meta, d = today()) {
    return transact(() => S.events.push(record(type, meta, d)));
  }
  function showError(message) {
    const el = $("#p-form-error");
    if (el) {
      el.textContent = message;
      el.hidden = false;
      el.focus();
    } else toast(message);
  }
  function rememberPlan() {
    const p = plan();
    S.events.push(
      record("daily_plan", {
        tasks: p.tasks
          .filter((t) => t.kind !== "Optional")
          .map((t) => ({ key: t.key, title: t.title })),
        skill: p.skill.id,
        mode: p.mode,
      }),
    );
  }
  function header() {
    $("#hdrCd").innerHTML =
      `<span class="p-device"><i class="${navigator.onLine ? "" : "offline"}"></i>${navigator.onLine ? "Saved on this device" : "Offline · can still log"}</span>${button(icon("plus") + "<span>Log a rep</span>", "capture:practice", "small")}`;
    $(".hud-brand").innerHTML =
      `<div class="bw">D1<span>OS</span><sup>12</sup></div><div class="bs">${E(S.profile.name || "Athlete")}<br><span>${E(levelMeta(S).label)} · ${E(S.profile.pos || "RB / LB")}</span></div>`;
  }
  function taskRow(t, index) {
    return `<div class="p-task ${t.done ? "is-done" : ""}"><span class="p-task-number">${t.done ? icon("check") : String(index + 1).padStart(2, "0")}</span><div><span class="p-mini">${E(t.kind)} · ${t.minutes} MIN</span><h3>${E(t.title)}</h3><p>${E(t.detail)}</p></div>${button(t.done ? "Review" : icon("arrow"), t.action, "quiet icon-button", `aria-label="${t.done ? "Review" : "Open"} ${E(t.title)}"`)}</div>`;
  }
  function gapRow(g) {
    return `<button class="p-gap-row" data-action="gap:${g.skill.id}"><span class="p-position">${g.skill.pos}</span><span><b>${E(g.skill.name)}</b><small>${E(g.reason)}</small></span><span class="p-gap-state">${badge(g.status, g.demonstrated ? "green" : g.errors.length ? "amber" : "")}${icon("chevron")}</span></button>`;
  }
  function gameCard(g) {
    return panel(
      "",
      `<div class="p-eyebrow">${rows("postgame").some((e) => e.meta.game === g?.d) ? "Captured" : "Next"} ${E(levelMeta(S).label)} game</div><div class="p-matchup"><span>BASIC</span><small>${g?.home ? "VS" : "AT"}</small><span>${E(g?.opp || "TO CONFIRM").toUpperCase()}</span></div><p>${g ? E(full(g.d)) : "No upcoming fixture on file."}</p><div class="p-game-meta">${badge(g ? (g.home ? "Home" : "Away") : "Schedule")}${badge(g?.time || "Kickoff unconfirmed")}</div>${actions(button("Open game week", "next-game", "quiet"))}`,
      "p-next-game",
    );
  }
  function roleSummary() {
    const r = latest("athlete_role")?.meta || {
      rb: "Starting",
      lb: "Starting",
    };
    return `${String(r.rb).startsWith("Not playing") ? "RB inactive" : r.rb + " RB"} · ${String(r.lb).startsWith("Not playing") ? "LB inactive" : r.lb + " LB"}`;
  }
  function renderToday() {
    const p = plan(),
      c = p.c,
      g = p.game;
    if (p.mode === "game") {
      paint(
        "today",
        heading(
          "Game day · " + short(today()),
          "One snap. One job.",
          "Keep the plan small.",
        ) +
          gameDay(g) +
          actions(
            button("Update check-in", "checkin", "quiet") +
              button("Capture the game", "postgame", "quiet"),
          ),
      );
      return;
    }
    const latestEvidence = M.evidence(S, today()).at(-1),
      isDone = p.complete;
    const lead =
      p.mode === "check"
        ? "Set the right dose."
        : p.mode === "support"
          ? "Tell your trainer first."
          : p.mode === "recovery"
            ? "Recover. Keep the lesson."
            : isDone
              ? "Take it to the field."
              : p.skill.name;
    const desc =
      p.mode === "check" || p.mode === "support" || p.mode === "recovery"
        ? p.reason
        : p.gap.reason;
    const prepAction =
      p.mode === "check"
        ? "checkin"
        : p.mode === "support"
          ? "capture:self"
          : "session:" + p.skill.id;
    const needed = M.gaps(S, K, today())
      .filter((x) => x.ev.length || x.skill.priority >= 3)
      .slice(0, 3);
    paint(
      "today",
      heading(
        full(today()),
        "Make the next rep better.",
        roleSummary() + " · In-season development",
        badge(
          clearanceRead(S).clear ? "Season cleared" : "Confirm availability",
          clearanceRead(S).clear ? "green" : "amber",
        ),
      ) +
        `<div class="p-context"><span>${badge(p.label, p.mode === "walk" ? "amber" : "")} ${c ? `${c.sleep}h sleep · ${E(c.energy)} energy · ${E(c.soreness)} soreness` : p.mode === "support" ? "Physical work paused." : p.mode === "recovery" ? "Recovery and review only." : "Your extra workload is not set yet."}</span>${button(c ? "Update" : "Check in", "checkin", "text")}</div>` +
        `<div class="p-grid"><div class="p-stack"><section class="p-panel p-hero"><div class="p-eyebrow">Highest-value next step</div><h2>${E(lead)}</h2><p>${E(desc)}</p><div class="p-cue">${E(p.gap.cue)}</div>${p.mode === "skill" ? `<div class="p-meta">${E(p.skill.dose)}</div>` : ""}${actions(button(p.mode === "check" ? "30-second check-in" : p.mode === "support" ? "Capture the concern" : isDone ? "Review your session" : "Open today’s work", prepAction, "primary") + button("Why this focus?", "gap:" + p.skill.id, "quiet"))}</section>
 ${panel("Your plan", `<div class="p-plan">${p.tasks.map(taskRow).join("")}</div><div class="p-inline-note">${E(p.reason)}</div>${p.mode === "support" ? "" : `<details class="p-disclosure"><summary>Optional · 3-minute film question</summary><p>${E(p.skill.test)}</p><p>Pause before the result. Name the assignment, then check what the rep actually shows.</p>${actions(button("Record the film observation", "capture:practice-film", "text"))}</details>`}`)}
 </div><div class="p-stack">${gameCard(g)}${panel("Play with a clear job.", `<p>Before the snap: alignment, assignment, first key. After a mistake: one exhale, one correction, next call.</p>${actions(button("60-second reset", "reset", "quiet") + button("My assignments", "assignment", "text"))}${c?.nerves === "high" ? '<p class="p-inline-note">You reported high nerves. Try the reset before reviewing your opening job.</p>' : ""}`)}
 ${panel("Close the loop", latestEvidence ? `<span class="p-mini">${E(short(latestEvidence.d))} · ${E(latestEvidence.source.replace(/-/g, " "))}</span><p class="p-quote">“${E(latestEvidence.note)}”</p>${actions(button("View correction", "gap:" + latestEvidence.skill, "text"))}` : empty("Your first evidence matters.", "After practice, keep one moment: what happened and what you will try next.", button("Log a practice rep", "capture:practice", "quiet")))}
 </div></div>${section("What is holding you back?", button("Open Development", "nav:development", "text"))}<div class="p-surface-list">${needed.map(gapRow).join("")}</div>`,
    );
  }
  function renderDevelopment() {
    const ranked = M.gaps(S, K, today()),
      list = ranked.filter((g) => g.skill.pos === role);
    const groups = [...new Set(list.map((g) => g.skill.group))];
    paint(
      "development",
      heading(
        "Development",
        "Find the gap. Close it.",
        "The work changes when the evidence changes.",
        button("Log coach feedback", "capture:coach", "primary"),
      ) +
        `<div class="p-tabs" aria-label="Position">${["RB", "LB"].map((r) => button(r === "RB" ? "Running back" : "Linebacker", "role:" + r, role === r ? "selected" : "", `aria-pressed="${role === r}"`)).join("")}</div>` +
        `<div class="p-grid"><div class="p-stack">${panel("Priority correction", `<div class="p-row">${badge(role)}${badge(list[0].status, "amber")}</div><h3 class="p-feature-title">${E(list[0].skill.name)}</h3><p>${E(list[0].reason)}</p><div class="p-cue">${E(list[0].cue)}</div>${actions(button("Open correction", "gap:" + list[0].skill.id, "primary"))}`, "p-accent-panel")}
 ${groups
   .map((group) =>
     panel(
       E(group),
       list
         .filter((g) => g.skill.group === group)
         .map(gapRow)
         .join(""),
     ),
   )
   .join("")}</div><div class="p-stack">${panel(
   "Football IQ",
   `<p>Learn one idea. Retrieve it before you see the answer.</p><div class="p-list">${LESSONS.filter(
     (l) =>
       catalog(l.skill).pos === role || l.id === "film" || l.id === "nerves",
   )
     .map((l) => {
       const hist = rows("knowledge_attempt").filter(
           (e) => e.meta.lesson === l.id,
         ),
         ok = hist.at(-1)?.meta.correct;
       return button(
         `<span>${E(l.title)}<small>${hist.length ? (ok ? "Last answer correct · revisit it" : "Needs another look") : "2-minute lesson"}</small></span>${icon("chevron")}`,
         "lesson:" + l.id,
         "row-button",
       );
     })
     .join("")}</div>`,
 )}
 ${panel("Your team rules", `<p>Save the actual key, landmark, or protection rule your coach teaches. Unknown rules stay questions.</p>${actions(button("Open assignments", "assignment", "quiet"))}`)}
 ${panel("How priorities work", `<p>Recent coach and film corrections carry more weight than self-ratings. Repeated errors and higher impact raise priority. Feedback older than six weeks becomes a retest question.</p><p>Successful observed reps on separate days can move a correction to maintenance. Repetition totals alone cannot.</p>${actions(button("See your evidence", "nav:film", "text"))}`)}
 </div></div>`,
    );
  }
  function gapDialog(id) {
    const g = M.gaps(S, K, today()).find((x) => x.skill.id === id);
    if (!g) return;
    openDialog(
      g.skill.name,
      `${g.skill.pos} · ${g.priority} priority`,
      `${badge(g.status, g.demonstrated ? "green" : "amber")}<p class="p-lead">${E(g.reason)}</p><h3>Why it matters</h3><p>${E(g.skill.why)}</p><div class="p-cue">${E(g.cue)}</div><div class="p-detail-grid"><div><span class="p-mini">CURRENT INTERVENTION</span><p>${E(g.demonstrated ? "Maintenance: review the cue and test it in scheduled team reps." : g.skill.dose)}</p></div><div><span class="p-mini">RECENT TREND</span><p>${E(g.trend)}</p></div></div><h3>Next test</h3><p>${E(g.skill.test)}</p>${actions(button("Open correction session", "session:" + id, "primary") + button("Record the retest", "retest:" + id, "quiet"))}<h3 class="p-space">Evidence trail</h3>${g.ev.length ? g.ev.slice().reverse().slice(0, 12).map(evidenceCard).join("") : empty("No assessed rep yet.", "This is a starting focus, not a measured weakness. Log a practice rep or coach correction.")}`,
    );
  }
  function evidenceCard(e) {
    const url = safeURL(e.url);
    return `<article class="p-evidence"><div class="p-row"><span class="p-mini">${E(short(e.d))} · ${E(e.source.replace(/-/g, " "))}${e.timestamp ? " · " + E(e.timestamp) : ""}</span>${badge(e.outcome, e.outcome === "success" ? "green" : e.outcome === "error" ? "amber" : "")}</div><h3>${E(catalog(e.skill).name)}</h3><p>${E(e.note)}</p>${e.correction ? `<p class="p-next"><b>Next rep:</b> ${E(e.correction)}</p>` : ""}<div class="p-row p-space-sm"><span class="p-mini">${E(e.classification || "Observation")} ${e.impact ? "· " + E(e.impact) + " impact" : ""}</span><div class="p-inline-actions">${url ? `<a class="p-link" href="${E(url)}" target="_blank" rel="noopener noreferrer">Open film ↗</a>` : ""}${button("Edit", "edit:" + e.id, "text small")}</div></div></article>`;
  }
  function renderFilm() {
    const ev = M.evidence(S, today()).filter(
      (e) =>
        filmFilter === "all" ||
        (filmFilter === "film" && e.source.includes("film")) ||
        (filmFilter === "coach" && e.source === "coach") ||
        (filmFilter === "practice" &&
          ["practice", "game", "self"].includes(e.source)),
    );
    const all = M.evidence(S, today()),
      classified = new Set(all.map((e) => e.legacyRef).filter(Boolean));
    const inbox = [
      ...(S.coach || []).map((e) => ({ ...e, from: "coach", note: e.text })),
      ...(S.clips || []).map((e) => ({ ...e, from: "clip" })),
    ].filter((e) => !classified.has(e.from + ":" + e.id));
    const scouts = rows("opponent_study").slice().reverse();
    paint(
      "film",
      heading(
        "Film & feedback",
        "Turn a rep into a correction.",
        "Watch the decision. Name the error. Give the next rep a job.",
        button(icon("plus") + " Add film", "capture:practice-film", "primary"),
      ) +
        `<div class="p-grid"><div class="p-stack">${panel("Review one moment", `<ol class="p-review-steps"><li><b>Pause</b><span>What was your assignment?</span></li><li><b>Watch</b><span>What did you actually do?</span></li><li><b>Correct</b><span>What changes next rep?</span></li></ol>${actions(button("Self-scout / practice film", "capture:practice-film", "quiet") + button("Study opponent", "scout", "quiet"))}`)}
 <div><div class="p-tabs" aria-label="Evidence filter">${[
   ["all", "All"],
   ["film", "Film"],
   ["coach", "Coach"],
   ["practice", "Field"],
 ]
   .map(([id, label]) =>
     button(
       label,
       "film-filter:" + id,
       filmFilter === id ? "selected" : "",
       `aria-pressed="${filmFilter === id}"`,
     ),
   )
   .join(
     "",
   )}</div>${ev.length ? ev.slice().reverse().map(evidenceCard).join("") : empty("Your next rep starts here.", "Add a film timestamp, a coach correction, or a successful practice rep. It will feed Development and the next daily plan.", button("Capture a moment", "capture:practice-film", "primary"))}</div></div>
 <div class="p-stack">${panel(
   "Opponent notebook",
   scouts.length
     ? scouts
         .slice(0, 5)
         .map(
           (e) =>
             `<div class="p-evidence"><span class="p-mini">${E(e.meta.opponent)} · ${E(short(e.d))}</span><p>${E(e.meta.note)}</p><p class="p-next">${E(e.meta.question || "Bring this observation to your coach.")}</p><small>${E(e.meta.sample || "Sample size not recorded")} · observation, not a guaranteed tendency</small></div>`,
         )
         .join("") + actions(button("Add study note", "scout", "text"))
     : empty(
         "Study a question, not highlights.",
         "Chart a formation, down-and-distance, and what happened. Save the sample size.",
         button("Add opponent note", "scout", "quiet"),
       ),
 )}
 ${panel(
   "Bring older notes into the loop",
   `<p>${inbox.length} untagged coach / film notes. Tag a skill yourself so the app does not guess what the correction meant.</p><div class="p-list">${inbox
     .slice(-6)
     .reverse()
     .map((e) =>
       button(
         `<span>${E((e.note || "Saved note").slice(0, 120))}<small>${E(short(e.d))} · ${e.from === "coach" ? "Coach note" : "Film moment"}</small></span>`,
         "classify:" + e.from + ":" + e.id,
         "row-button",
       ),
     )
     .join("")}</div>`,
 )}
 ${panel("What counts as progress?", `<p>A clean drill rep is preparation. Successful team or film reps test transfer. Repeated observations on separate days are stronger than one good clip.</p>${actions(button("Inspect your gaps", "nav:development", "text"))}`)}
 </div></div>`,
    );
  }
  function gameDay(g) {
    const cfg =
      rows("game_details")
        .filter((e) => e.meta.game === g?.d)
        .at(-1)?.meta || {};
    const checks = [
      "Equipment packed",
      "Arrival confirmed with coach",
      "RB assignment reviewed",
      "LB assignment reviewed",
      "Normal fueling / hydration routine",
    ];
    const checked = Object.fromEntries(
      rows("game_prep")
        .filter((e) => e.meta.game === g?.d)
        .map((e) => [e.meta.item, e.meta.done]),
    );
    const positions = M.activePositions(S, today()),
      cues = positions.map((pos) =>
        M.gaps(S, K, today()).find((g) => g.skill.pos === pos),
      );
    return `<section class="p-panel p-game-day"><div class="p-eyebrow">${E(levelMeta(S).label)} · ${g?.home ? "Home" : "Away"}</div><h2>Basic ${g?.home ? "vs" : "at"} ${E(g?.opp || "opponent to confirm")}</h2><div class="p-game-meta">${badge(g?.time || "Kickoff unconfirmed")}${badge(cfg.arrival ? "Arrive " + cfg.arrival : "Arrival unconfirmed")}</div>${cfg.location ? `<p>${E(cfg.location)}</p>` : ""}<div class="p-game-jobs">${cues.map((g) => `<div><span class="p-position">${g.skill.pos}</span><h3>${g.skill.pos === "RB" ? "Hear the call. Secure the ball." : "Align. Communicate. Read."}</h3><p>${E(g.cue)}</p></div>`).join("")}</div><div class="p-cue">Exhale. Name your job. Next snap.</div>${actions(button("60-second reset", "reset", "primary") + button("Opening assignments", "assignment", "quiet"))}</section>${panel("Before you leave", `${g ? checks.map((t, i) => ((!positions.includes("RB") && i === 2) || (!positions.includes("LB") && i === 3) ? "" : `<label class="p-check"><input type="checkbox" data-prep="${i}" data-game="${E(g.d)}" ${checked[i] ? "checked" : ""}><span>${t}</span></label>`)).join("") : "<p>Confirm the game before setting preparation tasks.</p>"}${actions(button("Set arrival / location", "game-details", "text"))}`)}`;
  }
  function renderSeason() {
    const p = plan(),
      games = schedule(),
      g = games.find((x) => x.d === seasonDate) || p.game || games.at(-1),
      out = g ? M.age(today(), g.d) : null;
    const pg = rows("postgame")
      .filter((e) => e.meta.game === g?.d || e.d === g?.d)
      .at(-1);
    const prep =
      pg && out <= 0
        ? "Review & recover"
        : out === 0
          ? "Game day"
          : out === 1
            ? "Day before"
            : out != null && out < 0
              ? "Review & recover"
              : out != null && out <= 3
                ? "Verify your assignments"
                : "Prepare the week";
    paint(
      "season",
      heading(
        "Season · " + new Date().getFullYear(),
        prep,
        `${levelMeta(S).label} · ${roleSummary()}`,
        button("Update schedule", "fixture", "quiet"),
      ) +
        `<div class="p-season-strip">${games.map((x) => `<button data-action="game:${x.d}" class="${g?.d === x.d ? "selected" : ""}" aria-pressed="${g?.d === x.d}"><span>${E(short(x.d))}</span><b>${E(x.opp)}</b><small>${x.home ? "Home" : "Away"}${x.d === today() ? " · Today" : ""}</small></button>`).join("")}</div>` +
        `<div class="p-grid"><div class="p-stack">${out === 0 && !pg ? gameDay(g) + actions(button("Capture / update postgame", "postgame", "quiet")) : panel("", `<div class="p-eyebrow">${out <= 0 ? "Review this game" : out === 1 ? "Tomorrow" : out == null ? "Schedule to confirm" : out + " days out"}</div><div class="p-matchup"><span>BASIC</span><small>${g?.home ? "VS" : "AT"}</small><span>${E(g?.opp || "UNCONFIRMED").toUpperCase()}</span></div><p>${g ? E(full(g.d)) : ""}</p><div class="p-game-meta">${badge(g?.time || "Kickoff unconfirmed")}${badge(g?.home ? "Home" : "Away")}</div>${actions(button(out <= 0 ? "Capture / update postgame" : "Open game-day essentials", out <= 0 ? "postgame" : "gameplan", "primary") + button("Arrival details", "game-details", "quiet"))}`, "p-accent-panel")}
 ${panel("Game-week rhythm", `<ol class="p-timeline"><li><b>Early week · learn</b><p>One correction. One opponent question. Short controlled technique around team practice.</p></li><li><b>48–72 hours · verify</b><p>Explain your base calls. Check the uncertain assignment with your coach.</p></li><li><b>Day before · simplify</b><p>Mental rehearsal, equipment, arrival, normal meals, and your sleep routine. No added hard work.</p></li><li><b>Game day · execute</b><p>Follow the team warm-up. Use your cue and next-play reset.</p></li><li><b>After · capture and review</b><p>Keep the remembered moments now. Use film later to confirm what happened.</p></li></ol>`)}
 ${pg ? panel("Postgame record", `<div class="p-row"><h3>${pg.meta.ours == null || pg.meta.theirs == null ? "Score not entered" : pg.meta.ours + " – " + pg.meta.theirs}</h3>${badge(pg.meta.played === "no" ? "Did not play" : "Played")}</div><p>${E(pg.meta.success || "No successful moment noted.")}</p><p class="p-next">${E(pg.meta.correction || "No correction noted.")}</p><p class="p-mini">${pg.meta.snaps == null ? "Snaps unknown" : pg.meta.snaps + " snaps"} · confidence ${pg.meta.confidence || "unknown"}</p>${actions(button("Review the film", "capture:game-film", "primary") + button("Edit postgame", "postgame", "quiet"))}`) : ""}</div>
 <div class="p-stack">${panel("Your week, your constraints", `<p>${E(latest("week_rhythm")?.meta.text || "School calendar previously listed weekday practice, 3:00–5:45pm. Confirm the current team instructions before planning around it.")}</p>${actions(button("Update weekly rhythm", "rhythm", "quiet"))}`)}${panel(
   "Opponent questions",
   rows("opponent_study")
     .filter((e) => e.meta.opponent === g?.opp)
     .map(
       (e) =>
         `<div class="p-evidence"><p>${E(e.meta.note)}</p><p class="p-next">${E(e.meta.question)}</p></div>`,
     )
     .join("") ||
     empty(
       "No scout notes yet.",
       "Watch for a specific formation or play. A small sample is a question for your coach.",
       button("Study opponent", "scout", "quiet"),
     ),
 )}
 ${panel("Schedule source", `<p>School-calendar entries and previously saved freshman fixtures. This is a partial schedule, not a live feed.</p><p class="p-source">Earlier project check: Sep 18, 2026. Combined JV/B event windows do not confirm the freshman kickoff.</p><a class="p-link" href="https://www.basicacademy.org/apps/events/view_calendar.jsp?id=0" target="_blank" rel="noopener">Open school calendar ↗</a>${g?.source ? `<p class="p-source">Your correction: ${E(g.source)}</p>` : ""}`)}
 ${panel("Availability", `<p>${clearanceRead(S).clear ? "Season clearance reported active. New pain or restrictions still go to your trainer." : "Confirm the current clearance or restriction with your school."}</p>${actions(button("Update athlete profile", "profile", "quiet"))}`)}</div></div>`,
    );
    const strip = $(".p-season-strip"),
      selected = strip?.querySelector(".selected");
    if (selected)
      strip.scrollLeft =
        selected.offsetLeft -
        strip.offsetLeft -
        (strip.clientWidth - selected.offsetWidth) / 2;
  }
  function gameHistory() {
    const games = [
      ...new Map(rows("postgame").map((e) => [e.meta.game, e])).values(),
    ].reverse();
    return games.length
      ? panel(
          "Game execution",
          `<p>Numbers you logged. Blank stats remain unknown.</p><div class="p-table-wrap"><table><thead><tr><th>Game</th><th>RB</th><th>LB / assignments</th></tr></thead><tbody>${games.map((e) => `<tr><th>${E(e.meta.opponent)}<br><small>${E(short(e.d))}${e.meta.played === "no" ? " · Did not play" : ""}</small></th><td>${E(e.meta.car ?? "—")} carries<br>${E(e.meta.yds ?? "—")} yards</td><td>${E(e.meta.tkl ?? "—")} tackles<br>${E(e.meta.missed ?? "—")} missed jobs</td></tr>`).join("")}</tbody></table></div>`,
        )
      : "";
  }
  function renderProgress() {
    const a = M.analytics(S, K, today()),
      ready = rows("daily_ready").filter((e) => M.age(e.d, today()) < 7),
      dedupReady = [...new Map(ready.map((e) => [e.d, e])).values()];
    const gaps = M.gaps(S, K, today()),
      back = latest("backup_export"),
      imp = latest("backup_import"),
      ct = counts();
    const avg = dedupReady.length
      ? (
          dedupReady.reduce((n, e) => n + e.meta.sleep, 0) / dedupReady.length
        ).toFixed(1)
      : "—";
    paint(
      "progress",
      heading(
        "Progress",
        "Show the work. Test the change.",
        "Observed football behavior comes before gym numbers.",
        button("Log training / metric", "performance-log", "quiet"),
      ) +
        `<div class="p-three"><div class="p-stat"><span>Planned work · 7 days</span><strong>${a.assigned ? a.completed + "/" + a.assigned : "—"}</strong><small>${a.days} days with a saved plan</small></div><div class="p-stat"><span>Repeated corrections · 6 weeks</span><strong>${a.repeat.length}</strong><small>Worth another targeted test</small></div><div class="p-stat"><span>Average sleep · 7 days</span><strong>${avg}<em>${dedupReady.length ? " h" : ""}</em></strong><small>${dedupReady.length} check-ins · self-reported</small></div></div>` +
        `<div class="p-grid p-space"><div class="p-stack">${panel("What changed in your evidence?", a.comparisons.length ? `<p>Recent 14 days compared with the previous 14. Counts describe logged observations, not error rates across all snaps.</p><div class="p-table-wrap"><table><thead><tr><th>Skill</th><th>Previous</th><th>Recent</th></tr></thead><tbody>${a.comparisons.map((x) => `<tr><th>${E(x.skill.name)}</th><td>${x.previous.filter((e) => e.outcome === "error").length} corrections<br><small>${x.previous.length} observations</small></td><td>${x.current.filter((e) => e.outcome === "error").length} corrections<br><small>${x.current.length} observations</small></td></tr>`).join("")}</tbody></table></div>` : empty("A baseline starts with one rep.", "Log a few practice or film observations. Comparisons appear when there is evidence to compare.", button("Log evidence", "capture:practice", "quiet")))}
 ${panel(
   "Corrections to keep testing",
   gaps
     .filter((g) => g.ev.length)
     .slice(0, 6)
     .map(gapRow)
     .join("") || "<p>Your tagged feedback will appear here.</p>",
 )}
 ${gameHistory()}${panel(
   "Training and measurements",
   `<p>Your team program comes first. Log work actually completed; D1OS does not add heavy in-season sessions.</p><div class="p-metric-list">${[
     "wt",
     "sleep",
     "energy",
   ]
     .map((key) => {
       const m = (S.metrics || [])
         .filter((m) => m.key === key && m.d <= today())
         .sort(M.order)
         .at(-1);
       return `<div><span>${{ wt: "Bodyweight", sleep: "Sleep", energy: "Energy" }[key]}</span><b>${m ? E(m.val) + (key === "wt" ? " lb" : key === "sleep" ? " h" : " / 5") : "—"}</b><small>${m ? E(short(m.d)) : "No measurement"}</small></div>`;
     })
     .join(
       "",
     )}</div>${actions(button("Log completed work", "performance-log", "quiet") + button("Full record", "history", "text"))}`,
 )}
 </div><div class="p-stack">${panel(
   "Confidence from evidence",
   `${
     M.evidence(S, today())
       .filter((e) => e.outcome === "success")
       .slice(-3)
       .reverse()
       .map(
         (e) =>
           `<div class="p-evidence"><span class="p-mini">${E(short(e.d))} · ${E(e.source)}</span><p>${E(e.note)}</p></div>`,
       )
       .join("") ||
     "<p>Keep successful decisions as well as mistakes. Specific moments give you something real to recall before kickoff.</p>"
   }${actions(button("Save a successful rep", "success", "quiet"))}`,
 )}
 ${panel("Your record is yours.", `<div class="p-data-row"><span>Backup format</span><b>v7 · Development schema 1</b></div><div class="p-data-row"><span>Records on device</span><b>${Object.values(ct).reduce((n, v) => n + v, 0)}</b></div><div class="p-data-row"><span>Last export requested</span><b>${back ? E(short(back.d)) : "Not recorded"}</b></div><div class="p-data-row"><span>Last import</span><b>${imp ? E(short(imp.d)) : "None this version"}</b></div><div class="p-data-row"><span>Migration status</span><b>${imp ? "Compatible history merged" : "No import pending"}</b></div><p class="p-source">An export starts a download. Keep the file somewhere you can recover if this device is lost.</p>${actions(button("Export backup", "export", "primary") + button("Import backup", "import", "quiet"))}${actions(button("Sync & recovery", "data", "text"))}<input id="p-import" type="file" accept="application/json,.json" hidden>`)}
 ${panel("Athlete & season", `<p>${E(S.profile.name)} · Class of ${E(S.profile.classOf)}<br>${E(levelMeta(S).label)} · ${E(S.profile.pos)}</p>${actions(button("Edit profile", "profile", "quiet") + button("Assignments", "assignment", "text"))}`)}
 </div></div>`,
    );
  }
  function closeDialog() {
    if (resetTimer) {
      clearInterval(resetTimer);
      resetTimer = null;
    }
    const el = $("#p-dialog");
    if (el) {
      el.close();
      el.remove();
    }
    if (focusReturn?.isConnected) focusReturn.focus();
  }
  function openDialog(title, eyebrow, content) {
    closeDialog();
    focusReturn = document.activeElement;
    const el = document.createElement("dialog");
    el.id = "p-dialog";
    el.className = "p-dialog";
    el.setAttribute("aria-labelledby", "p-dialog-title");
    el.innerHTML = `<header><div><div class="p-eyebrow">${E(eyebrow)}</div><h2 id="p-dialog-title">${E(title)}</h2></div>${button("×", "close", "close-button", 'aria-label="Close dialog"')}</header><div class="p-dialog-content"><p id="p-form-error" class="p-alert" role="alert" tabindex="-1" hidden></p>${content}</div>`;
    el.addEventListener("cancel", (e) => {
      e.preventDefault();
      closeDialog();
    });
    document.body.append(el);
    el.showModal();
  }
  function input(
    name,
    label,
    {
      type = "text",
      value = "",
      attrs = "",
      placeholder = "",
      required = false,
    } = {},
  ) {
    return `<label for="p-${name}">${label}</label><input id="p-${name}" name="${name}" type="${type}" value="${E(value)}" placeholder="${E(placeholder)}" ${attrs} ${required ? "required" : ""}>`;
  }
  function select(name, label, options, value = "", required = true) {
    return `<label for="p-${name}">${label}</label><select id="p-${name}" name="${name}" ${required ? "required" : ""}>${options
      .map((o) => {
        const [v, t] = Array.isArray(o) ? o : [o, o];
        return `<option value="${E(v)}" ${String(v) === String(value) ? "selected" : ""}>${E(t)}</option>`;
      })
      .join("")}</select>`;
  }
  function textarea(
    name,
    label,
    value = "",
    placeholder = "",
    required = false,
  ) {
    return `<label for="p-${name}">${label}</label><textarea id="p-${name}" name="${name}" maxlength="2000" placeholder="${E(placeholder)}" ${required ? "required" : ""}>${E(value)}</textarea>`;
  }
  function form(id, body, label = "Save") {
    return `<form id="p-${id}-form">${body}${actions(`<button class="p-btn primary" type="submit">${label}</button>`)}</form>`;
  }
  function dateInput(value = today()) {
    return input("date", "Date of the rep", {
      type: "date",
      value,
      attrs: `max="${today()}"`,
      required: true,
    });
  }
  function checkinDialog() {
    const c = M.readiness(S, today()) || {};
    openDialog(
      "How are you arriving?",
      "30-second check-in",
      form(
        "ready",
        input("sleep", "Sleep last night · hours", {
          type: "number",
          value: c.sleep ?? "",
          attrs: 'min="0" max="16" step="0.5" inputmode="decimal"',
          placeholder: "8.5",
          required: true,
        }) +
          `<div class="p-formrow"><div>${select(
            "energy",
            "Energy",
            [
              ["", "Choose…"],
              ["good", "Good"],
              ["okay", "Okay"],
              ["low", "Low"],
            ],
            c.energy,
          )}</div><div>${select(
            "soreness",
            "Soreness",
            [
              ["", "Choose…"],
              ["low", "Low"],
              ["some", "Some"],
              ["high", "High"],
            ],
            c.soreness,
          )}</div></div>` +
          select(
            "pain",
            "Pain or new injury concern?",
            [
              ["", "Choose…"],
              ["no", "No"],
              ["yes", "Yes — tell my trainer"],
            ],
            c.pain,
          ) +
          select(
            "load",
            "Team workload today",
            [
              ["", "Choose…"],
              ["normal", "Normal practice"],
              ["light", "Walk-through / light"],
              ["hard", "Hard practice or game"],
              ["none", "No practice / recovery"],
              ["unknown", "Not sure yet"],
            ],
            c.load,
          ) +
          select(
            "nerves",
            "Nerves right now",
            [
              ["", "Choose…"],
              ["calm", "Calm"],
              ["some", "Some, I can focus"],
              ["high", "High, I want a reset"],
            ],
            c.nerves,
          ),
        "Save & set today’s plan",
      ),
    );
  }
  function captureDialog(source = "practice", seed = {}) {
    const edit =
        seed.id && M.evidence(S, today()).some((e) => e.id === seed.id),
      k = seed.skill || plan().skill.id;
    openDialog(
      edit
        ? "Correct the observation."
        : source === "coach"
          ? "Keep your coach’s words."
          : "What happened on the rep?",
      edit ? "Evidence revision" : "Evidence → correction → retest",
      form(
        "evidence",
        `<input name="target" type="hidden" value="${edit ? E(seed.id) : ""}"><input name="legacyRef" type="hidden" value="${E(seed.legacyRef || "")}">${dateInput(seed.d || today())}<div class="p-formrow"><div>${select(
          "source",
          "Source",
          [
            ["practice", "Practice observation"],
            ["coach", "Coach feedback"],
            ["practice-film", "Practice film"],
            ["game-film", "Game film"],
            ["game", "Game memory"],
            ["self", "Self-assessment"],
          ],
          seed.source || source,
        )}</div><div>${select(
          "skill",
          "Skill",
          K.filter((k) => k.id !== "mental-reset").map((k) => [
            k.id,
            k.pos + " · " + k.name,
          ]),
          k,
        )}</div></div><div class="p-formrow"><div>${select(
          "outcome",
          "What does this show?",
          [
            ["", "Choose what the rep showed…"],
            ["error", "Needs correction"],
            ["success", "Successful execution"],
            ["question", "Assignment unclear"],
          ],
          seed.outcome ?? "error",
        )}</div><div>${select(
          "impact",
          "Impact",
          [
            ["medium", "Medium — affects execution"],
            ["high", "High — assignment / ball / scoring risk"],
            ["low", "Low — refinement"],
          ],
          seed.impact || "medium",
        )}</div></div>${select(
          "classification",
          "Which part of the rep?",
          [
            ["unclassified", "Not classified yet"],
            ["technique", "Technique"],
            ["assignment", "Assignment"],
            ["recognition", "Recognition / key"],
            ["decision", "Decision"],
            ["physical", "Physical loss"],
            ["execution", "Successful execution"],
          ],
          seed.classification || "technique",
        )}${textarea("note", "Observation", seed.note || "", "What did the rep show? Be specific.", true)}${textarea("correction", "Next rep / coach cue (optional)", seed.correction || "", "One action you can repeat.")}
 <details class="p-disclosure" ${source.includes("film") ? "open" : ""}><summary>Film reference & confidence</summary>${input("session", "Opponent / session", { value: seed.session || "", attrs: 'maxlength="100"' })}<div class="p-formrow"><div>${input("timestamp", "Timestamp / play number", { value: seed.timestamp || "", placeholder: "00:42 / play 12", attrs: 'maxlength="50"' })}</div><div>${input("confidence", "Assignment confidence · 1–5 (optional)", { type: "number", value: seed.confidence ?? "", attrs: 'min="1" max="5" step="1" inputmode="numeric"' })}</div></div>${input("url", "Film link (optional)", { type: "url", value: seed.url || "", placeholder: "https://…", attrs: 'maxlength="2000"' })}<p class="p-source">D1OS stores your notes and a link. It does not automatically watch or grade the video.</p></details>`,
        edit ? "Save corrected observation" : "Save & update development",
      ),
    );
  }
  function diagram(kind) {
    if (!["gaps", "cut", "angle"].includes(kind)) return "";
    if (kind === "gaps")
      return `<svg class="p-svg" viewBox="0 0 420 115" role="img" aria-label="Offensive line: A gaps beside center, B between guard and tackle, C outside tackle"><path d="M20 80h380" stroke="currentColor" opacity=".25"/>${["T", "G", "C", "G", "T"].map((x, i) => `<rect x="${100 + i * 45}" y="64" width="26" height="28" rx="4" fill="#33413c"/><text x="${113 + i * 45}" y="83" text-anchor="middle" fill="#eef4f0" font-size="13">${x}</text>`).join("")}${["C", "B", "A", "A", "B", "C"].map((x, i) => `<text x="${90 + i * 45}" y="44" text-anchor="middle" fill="#edbb75" font-size="15">${x}</text>`).join("")}</svg>`;
    return `<svg class="p-svg" viewBox="0 0 420 155" role="img" aria-label="${kind === "angle" ? "Inside pursuit path to a meeting point ahead of a runner; confirm your leverage with coach" : "Controlled approach to a landmark, then an exit"}"><path d="M25 45h370M25 90h370M25 135h370" stroke="#ffffff15"/>${kind === "angle" ? '<path d="M290 128L290 28" stroke="#bdd5c5" stroke-width="2" stroke-dasharray="6 6"/><path d="M120 128L285 36" stroke="#edbb75" stroke-width="3"/><circle cx="290" cy="128" r="9" fill="#bdd5c5"/>' : '<path d="M130 127L180 78L300 35" stroke="#edbb75" stroke-width="3" fill="none"/><path d="M180 94V61" stroke="#bdd5c5" stroke-width="2"/>'}<circle cx="${kind === "angle" ? 120 : 130}" cy="128" r="10" fill="#edbb75"/><text x="25" y="23" fill="#afbbb3" font-family="sans-serif" font-size="11">${kind === "angle" ? "TRACK → CLOSE SPACE · NO CONTACT" : "APPROACH → CONTROL → EXIT"}</text></svg>`;
  }
  function sessionDialog(id) {
    const k = catalog(id),
      p = plan(),
      limited = p.mode !== "skill",
      gap = M.gaps(S, K, today()).find((g) => g.skill.id === k.id),
      maintenance = gap?.demonstrated;
    const completed = M.reps(S, today()).filter(
      (e) => e.d === today() && e.meta.skill === k.id,
    );
    if (completed.length) {
      openDialog(
        k.name,
        "Preparation saved",
        `<div class="p-cue">${E(gap?.cue || k.cue)}</div><p>You have prepared this correction today. Carry the cue into scheduled team reps and capture what actually transfers.</p>${completed.map((e) => `<div class="p-data-row"><span>${E(e.meta.mode || "Session")} · ${E(e.meta.evidence || "Self-review")}</span><b>${e.meta.clean} clean / ${e.meta.attempts} attempts</b></div>${e.meta.note ? `<p>${E(e.meta.note)}</p>` : ""}`).join("")}${actions(button("Capture the team rep", "capture:practice", "primary") + button("Done", "close", "quiet"))}`,
      );
      return;
    }
    openDialog(
      k.name,
      `${k.pos} · ${limited ? 2 : k.minutes} minutes`,
      `${diagram(k.diagram)}<div class="p-cue">${E(gap?.cue || k.cue)}</div>${limited ? `<p class="p-alert">${E(p.reason)} Use mental rehearsal${p.mode === "support" ? " only" : ", or a slow walk-through if comfortable"}. No added contact or hard repetitions.</p>` : ""}${maintenance ? '<p class="p-inline-note">Maintenance: recall the cue and use scheduled team reps to keep checking it. No added corrective volume.</p>' : ""}<h3>Set up</h3><p>${E(k.setup)}</p><p class="p-source">Short practice suggestions. Your coaches set team workload and supervise all contact.</p><ol class="p-instructions">${(limited ? [`Name the call and responsibility. ${k.ask}`, p.mode === "support" ? "Picture the first two steps three times. Keep it mental and tell your trainer about the concern." : "Picture or slowly walk the first two steps three times. Stop and ask your coach about uncertainty."] : k.steps).map((x) => `<li>${E(x)}</li>`).join("")}</ol><h3>What counts as clean?</h3><p>${E(k.check)}</p><details class="p-disclosure"><summary>If the rep breaks down</summary><p>${E(k.mistake)}</p><p>${E(k.ask)}</p></details>${form(
        "reps",
        `<input name="skill" type="hidden" value="${k.id}">${select("mode", "What did you rehearse?", limited ? [["mental", "Mental rehearsal"], ...(p.mode === "support" ? [] : [["walk", "Slow walk-through"]])] : [["walk", "Slow walk-through"], ["technique", "Controlled technique"], ["mental", "Mental rehearsal"], ...(k.contact ? [["team", "Coach-led team period"]] : [])])}<div class="p-formrow"><div>${input("attempts", "Attempts", { type: "number", value: limited || k.contact ? 3 : 6, attrs: 'min="1" max="50" step="1" inputmode="numeric"', required: true })}</div><div>${input("clean", "Clean reps", { type: "number", attrs: 'min="0" max="50" step="1" inputmode="numeric"', required: true })}</div></div>${select(
          "provenance",
          "Who checked them?",
          [
            ["self", "Me — self-review"],
            ["video", "I reviewed video"],
            ["coach", "My coach"],
            ["partner", "Training partner"],
          ],
        )}${textarea("note", "One note (optional)", "", "What should transfer into practice?")}`,
        "Save session",
      )}`,
    );
  }
  function assignmentDialog() {
    const by = new Map();
    for (const e of rows("assignment")) by.set(e.meta.key, e.meta);
    const existing = Array.from(by.values());
    openDialog(
      "Know the call.",
      "Team assignments",
      `<p>Say your alignment, key, and responsibility before revealing the saved rule. Only your team’s call decides your job.</p><div class="p-list">${existing.map((x) => `<details class="p-assignment"><summary><b>${E(x.position)} · ${E(x.name)}</b><small>${E(x.source)}</small></summary><p><b>Alignment:</b> ${E(x.alignment)}</p><p><b>Key / landmark:</b> ${E(x.keyRule)}</p><p><b>Responsibility:</b> ${E(x.job)}</p><p><b>Question:</b> ${E(x.question || "None saved")}</p>${actions(button("Edit", "assignment-edit:" + x.key, "text"))}</details>`).join("") || empty("No confirmed assignment saved.", "Bring one call to your coach: “Where do I align, what is my key, and what is my job?”")}</div>${actions(button("Add team assignment", "assignment-new", "primary") + button(M.taskState(S, today(), "assignment") ? "Reviewed today ✓" : "I reviewed today’s install", "assignment-done", "quiet"))}<details class="p-disclosure"><summary>Earlier saved playbook (${PLAYBOOK.filter((p) => p.cat === "coach").length} team concepts)</summary><p>Historical notes. Confirm that these still match the current install.</p>${PLAYBOOK.filter(
        (p) => p.cat === "coach",
      )
        .map(
          (p) =>
            `<details class="p-assignment"><summary>${E(p.name)}</summary><p>${E(p.formation)}</p><p>${E(p.job)}</p></details>`,
        )
        .join("")}</details>`,
    );
  }
  function assignmentForm(key) {
    const x =
      rows("assignment")
        .filter((e) => e.meta.key === key)
        .at(-1)?.meta || {};
    openDialog(
      "Save the team rule.",
      "Assignment",
      form(
        "assignment",
        `<input name="key" type="hidden" value="${E(x.key || uid())}">${select("position", "Position", ["RB", "LB"], x.position || role)}${input("name", "Call / concept", { value: x.name || "", attrs: 'maxlength="120"', required: true })}${input("alignment", "Alignment", { value: x.alignment || "", attrs: 'maxlength="250"', required: true })}${input("keyRule", "Key / landmark", { value: x.keyRule || "", attrs: 'maxlength="250"', required: true })}${textarea("job", "Responsibility", x.job || "", "Use your coach’s terminology.", true)}${input("source", "Source", { value: x.source || "", placeholder: "Position coach / current team playbook", attrs: 'maxlength="150"', required: true })}${textarea("question", "Still uncertain about…", x.question || "")}`,
        "Save assignment",
      ),
    );
  }
  function selectedGame() {
    return (
      (curView === "season" && schedule().find((g) => g.d === seasonDate)) ||
      plan().game ||
      schedule().at(-1)
    );
  }
  function postgameDialog() {
    const g = selectedGame(),
      x =
        rows("postgame")
          .filter((e) => e.meta.game === g?.d)
          .at(-1)?.meta || {},
      date = g?.d <= today() ? g.d : today();
    openDialog(
      "Capture it while it is fresh.",
      "Postgame · unknown stats stay blank",
      form(
        "postgame",
        `${input("date", "Game date", { type: "date", value: date, attrs: `max="${today()}"`, required: true })}${input("opponent", "Opponent", { value: x.opponent || g?.opp || "", attrs: 'maxlength="100"', required: true })}${select(
          "played",
          "Did you play?",
          [
            ["yes", "Yes"],
            ["no", "No — did not play"],
          ],
          x.played || "yes",
        )}<div class="p-formrow"><div>${input("ours", "Basic score", { type: "number", value: x.ours ?? "", attrs: 'min="0" max="999" step="1"' })}</div><div>${input("theirs", "Opponent score", { type: "number", value: x.theirs ?? "", attrs: 'min="0" max="999" step="1"' })}</div></div>${select(
          "confidence",
          "Assignment confidence",
          [
            ["", "Not rated"],
            ["1", "1 — mostly unsure"],
            ["2", "2"],
            ["3", "3 — mixed"],
            ["4", "4"],
            ["5", "5 — clear"],
          ],
          x.confidence || "",
          false,
        )}${textarea("success", "A decision that worked", x.success || "", "One moment to remember.")}${textarea("correction", "A moment to review", x.correction || "", "What needs film or a coach answer?")}${select(
          "skill",
          "Skill for the correction",
          K.filter((k) => k.id !== "mental-reset").map((k) => [
            k.id,
            k.pos + " · " + k.name,
          ]),
          x.skill || plan().skill.id,
        )}${textarea("coach", "Coach comments", x.coach || "")}${select(
          "condition",
          "Physical condition",
          [
            ["okay", "No new concern"],
            ["sore", "Sore / tired"],
            ["pain", "Pain or injury concern — tell trainer"],
          ],
          x.condition || "okay",
        )}<details class="p-disclosure"><summary>Known stats (optional)</summary><div class="p-formrow">${[
          ["snaps", "Snaps"],
          ["car", "Carries"],
          ["yds", "Rush yards"],
          ["td", "Touchdowns"],
          ["tkl", "Tackles"],
          ["missed", "Missed assignments"],
          ["fumbles", "Ball-security errors"],
        ]
          .map(
            ([key, label]) =>
              `<div>${input(key, label, { type: "number", value: x[key] ?? "", attrs: `min="${key === "yds" ? -99 : 0}" max="999" step="1" inputmode="numeric"` })}</div>`,
          )
          .join("")}</div></details>`,
        "Save postgame",
      ),
    );
    updatePlayingFields();
  }
  function fixtureDialog() {
    const g = selectedGame();
    openDialog(
      "Use the coach’s latest schedule.",
      "Fixture correction",
      form(
        "fixture",
        select(
          "original",
          "Fixture to update",
          [
            ["", "Add a game"],
            ...schedule().map((x) => [x.d, short(x.d) + " · " + x.opp]),
          ],
          g?.d || "",
          false,
        ) +
          input("date", "Date", {
            type: "date",
            value: g?.d || today(),
            required: true,
          }) +
          input("opponent", "Opponent", {
            value: g?.opp || "",
            required: true,
            attrs: 'maxlength="100"',
          }) +
          select(
            "venue",
            "Venue",
            [
              ["home", "Home"],
              ["away", "Away"],
            ],
            g?.home === false ? "away" : "home",
          ) +
          input("time", "Confirmed kickoff (optional)", {
            type: "time",
            value: /^\d\d:\d\d$/.test(g?.time || "") ? g.time : "",
          }) +
          input("source", "Who confirmed the change?", {
            required: true,
            attrs: 'maxlength="150"',
            placeholder: "Coach / team message / school calendar",
          }),
        "Save fixture",
      ),
    );
  }
  function gameDetailsDialog() {
    const g = selectedGame();
    if (!g) {
      fixtureDialog();
      return;
    }
    const x =
      rows("game_details")
        .filter((e) => e.meta.game === g.d)
        .at(-1)?.meta || {};
    openDialog(
      g.opp,
      "Arrival plan",
      form(
        "game-details",
        `<input name="game" type="hidden" value="${g.d}">${input("arrival", "Coach-confirmed arrival", { type: "time", value: x.arrival || "", required: true })}${input("location", "Where to meet", { value: x.location || "", required: true, attrs: 'maxlength="150"' })}${input("source", "Confirmed by", { value: x.source || "", required: true, attrs: 'maxlength="150"' })}`,
        "Save arrival plan",
      ),
    );
  }
  function scoutDialog() {
    openDialog(
      "Watch with a question.",
      "Opponent study",
      form(
        "scout",
        input("opponent", "Opponent", {
          value: selectedGame()?.opp || "",
          attrs: 'maxlength="100"',
          required: true,
        }) +
          input("sample", "Sample observed", {
            placeholder: "5 first-down snaps from one game",
            attrs: 'maxlength="200"',
            required: true,
          }) +
          textarea(
            "note",
            "Formation, situation, what happened",
            "",
            "What did the opponent do?",
            true,
          ) +
          textarea(
            "question",
            "Question for your coach",
            "",
            "What would this change in our assignment?",
            true,
          ) +
          input("url", "Film link (optional)", {
            type: "url",
            attrs: 'maxlength="2000"',
          }),
        "Save scout note",
      ),
    );
  }
  function profileDialog() {
    const p = S.profile,
      x = latest("athlete_role")?.meta || {};
    openDialog(
      "Your football context.",
      "Athlete profile",
      form(
        "profile",
        input("name", "Name", {
          value: p.name,
          required: true,
          attrs: 'maxlength="60"',
        }) +
          input("classOf", "Graduation year", {
            type: "number",
            value: p.classOf,
            attrs: 'min="2026" max="2040"',
            required: true,
          }) +
          select(
            "level",
            "Team level",
            [
              ["fresh", "Freshman"],
              ["jv", "JV"],
              ["varsity", "Varsity"],
            ],
            level(S),
          ) +
          select(
            "rb",
            "RB role",
            ["Starting", "Rotating", "Learning", "Not playing RB"],
            x.rb || "Starting",
          ) +
          select(
            "lb",
            "LB role",
            ["Starting", "Rotating", "Learning", "Not playing LB"],
            x.lb || "Starting",
          ) +
          select(
            "availability",
            "Current availability",
            [
              ["unchanged", "Keep recorded status"],
              ["cleared", "Cleared for this season"],
              ["not yet", "Not cleared / new restriction"],
            ],
            "unchanged",
          ) +
          input("source", "Source if availability changes", {
            placeholder: "Trainer / school / coach confirmation",
            attrs: 'maxlength="150"',
          }),
        "Save profile",
      ),
    );
  }
  function performanceDialog() {
    openDialog(
      "Log work already completed.",
      "Strength & recovery",
      `<p>Use your team’s program. A log is not a prescription to add more work.</p>${form(
        "performance",
        dateInput() +
          select("kind", "Record type", [
            ["lift", "Completed lift"],
            ["wt", "Bodyweight · lb"],
            ["sleep", "Sleep · hours"],
            ["energy", "Energy · 1–5"],
          ]) +
          input("exercise", "Exercise (for a lift)", {
            placeholder: "Team squat session",
            attrs: 'maxlength="100"',
          }) +
          input("value", "Weight / measurement", {
            type: "number",
            required: true,
            attrs: 'min="0" max="1500" step="0.1" inputmode="decimal"',
          }) +
          input("reps", "Reps (for a lift)", {
            type: "number",
            attrs: 'min="1" max="100" step="1" inputmode="numeric"',
          }) +
          input("sets", "Sets (for a lift)", {
            type: "number",
            value: 1,
            attrs: 'min="1" max="20" step="1" inputmode="numeric"',
          }) +
          textarea(
            "note",
            "Context (optional)",
            "",
            "Team session, technique, or measurement method.",
          ),
        "Save completed work",
      )}`,
    );
  }
  function resetDialog() {
    resetComplete = false;
    resetStart = 0;
    openDialog(
      "You only need the next job.",
      "60-second reset",
      `<p>Breathe comfortably. Relax your jaw and shoulders. No forced breaths or breath holds.</p><div class="p-breath"><b id="p-breath-word">Ready</b><span id="p-breath-time">60 seconds</span></div><div class="p-cue">Alignment. Assignment. First key.</div><p>Picture your first two steps. After a mistake, use the same reset and carry one correction into the next call.</p>${actions(button("Start reset", "reset-start", "primary") + button("Done — save reset", "reset-save", "quiet", 'id="p-reset-save" disabled'))}`,
    );
  }
  function startReset() {
    if (resetTimer) return;
    resetStart = Date.now();
    $('[data-action="reset-start"]').disabled = true;
    function tick() {
      const t = Math.min(60, Math.floor((Date.now() - resetStart) / 1000));
      if (!$("#p-breath-word")) return;
      $("#p-breath-word").textContent =
        t >= 60 ? "Name your job" : t % 10 < 4 ? "Easy inhale" : "Easy exhale";
      $("#p-breath-time").textContent =
        t >= 60 ? "One cue. Next snap." : 60 - t + " seconds";
      if (t >= 60) {
        clearInterval(resetTimer);
        resetTimer = null;
        resetComplete = true;
        $("#p-reset-save").disabled = false;
      }
    }
    tick();
    resetTimer = setInterval(tick, 250);
  }
  function lessonDialog(id) {
    currentLesson = LESSONS.find((l) => l.id === id);
    lessonAnswered = false;
    const l = currentLesson;
    if (!l) return;
    openDialog(
      l.title,
      "Football IQ · learn, then retrieve",
      `${l.diagram ? diagram(l.diagram) : ""}<p class="p-lead">${E(l.body)}</p><h3>${E(l.question)}</h3><div class="p-answers">${l.options.map((o, i) => button(`<span>${String.fromCharCode(65 + i)}</span>${E(o)}`, "answer:" + i, "answer")).join("")}</div><div id="p-lesson-feedback" aria-live="polite"></div>`,
    );
  }
  function validBackup(p) {
    if (
      p?.app !== "d1os" ||
      p.data?.v !== 7 ||
      !p.data.profile ||
      Array.isArray(p.data.profile) ||
      typeof p.data.profile !== "object"
    )
      throw Error("Choose a D1OS v7 backup. This file was not applied.");
    const s = p.data,
      object = (x) => x && typeof x === "object" && !Array.isArray(x);
    for (const k of [
      "events",
      "metrics",
      "lifts",
      "coach",
      "notes",
      "clips",
      "depth",
      "games",
      "body",
      "recs",
      "pipeline",
      "reviews",
      "opp",
      "core",
      "cal",
      "pushLog",
    ])
      if (
        s[k] !== undefined &&
        (!Array.isArray(s[k]) || s[k].some((x) => !object(x)))
      )
        throw Error("Invalid " + k + " records.");
    for (const k of [
      "settings",
      "prs",
      "params",
      "checkins",
      "sessions",
      "meta",
    ])
      if (s[k] !== undefined && !object(s[k]))
        throw Error("Invalid " + k + " data.");
    for (const e of s.events || []) {
      if (typeof e.type !== "string" || !M.validDate(e.d))
        throw Error("Invalid event date or type.");
      if (
        [
          "development_evidence",
          "evidence_revision",
          "evidence_void",
          "daily_ready",
          "daily_plan",
          "task_state",
          "skill_rep",
          "postgame",
          "assignment",
          "opponent_study",
          "week_rhythm",
          "game_details",
          "game_prep",
          "athlete_role",
          "knowledge_attempt",
          "mental_reset",
        ].includes(e.type)
      ) {
        M.validateEvent(e.type, e.meta);
        const skill =
          e.type === "evidence_revision" ? e.meta.value.skill : e.meta.skill;
        if (
          ["development_evidence", "evidence_revision", "skill_rep"].includes(
            e.type,
          ) &&
          !K.some((k) => k.id === M.skillId(skill))
        )
          throw Error("This record contains an unsupported development skill.");
        if (e.meta.schema > 1)
          throw Error("This development record needs a newer version of D1OS.");
      }
    }
    for (const m of s.metrics || [])
      if (
        typeof m.key !== "string" ||
        m.val === null ||
        m.val === "" ||
        !Number.isFinite(Number(m.val)) ||
        !M.validDate(m.d)
      )
        throw Error("Invalid measurement.");
    for (const [d, v] of Object.entries(s.checkins || {}))
      if (!M.validDate(d) || !Array.isArray(v))
        throw Error("Invalid daily check-in.");
    for (const [d, v] of Object.entries(s.sessions || {}))
      if (!M.validDate(d) || !Array.isArray(v))
        throw Error("Invalid training session.");
    // Reject prototype-shaped payloads before any key-based merge.
    JSON.stringify(p, (key, value) => {
      if (["__proto__", "constructor", "prototype"].includes(key))
        throw Error("Unsupported property in backup.");
      return value;
    });
    return s;
  }
  function downloadRecord(label = "backup") {
    const payload = {
      app: "d1os",
      v: 7,
      productVersion: VERSION,
      developmentSchema: 1,
      exported: today(),
      data: structuredClone(S),
    };
    const a = document.createElement("a"),
      url = URL.createObjectURL(
        new Blob([JSON.stringify(payload, null, 2)], {
          type: "application/json",
        }),
      );
    a.href = url;
    a.download = `d1os-${label}-${today()}.json`;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    return payload;
  }
  function exportBackup() {
    try {
      downloadRecord();
      append("backup_export", { version: 7, counts: counts() });
      toast("Download started. Keep the backup file in Files.");
      if (curView === "progress") renderProgress();
    } catch (e) {
      showError("Backup download could not start: " + e.message);
    }
  }
  async function importBackup(file) {
    try {
      if (file.size > 10 * 1024 * 1024)
        throw Error("This file is too large for an app backup (10 MB limit).");
      const p = JSON.parse(await file.text()),
        s = validBackup(p);
      mergeStates(structuredClone(S), migrate(structuredClone(s)));
      pendingImport = structuredClone(s);
      importOrigin = p.exported || "Unknown";
      openDialog(
        "Merge your saved history.",
        "Import preview",
        `<div class="p-data-row"><span>Backup date</span><b>${E(importOrigin)}</b></div><div class="p-data-row"><span>Format</span><b>v7 → compatible</b></div><div class="p-data-row"><span>Events / measurements</span><b>${s.events?.length || 0} / ${s.metrics?.length || 0}</b></div><p class="p-lead">Keeps newer entries and merges history by record identity. Your current record downloads before the merge. Historical height-unit repair remains traceable in the record.</p>${actions(button("Merge backup", "merge-confirm", "primary") + button("Cancel", "close", "quiet"))}`,
      );
    } catch (e) {
      pendingImport = null;
      showError("Import not applied: " + e.message);
    }
  }
  function mergeBackup() {
    if (!pendingImport) return;
    try {
      downloadRecord("before-import");
      const incoming = structuredClone(pendingImport);
      if (
        transact(() => {
          S = mergeStates(structuredClone(S), migrate(incoming));
          S.events.push(
            record("backup_import", {
              exported: importOrigin,
              migration: "v7 compatible; history merged",
              counts: counts(),
            }),
          );
        }, "Backup merged. Your history is preserved.")
      ) {
        pendingImport = null;
        closeDialog();
        go("progress");
      }
    } catch (e) {
      showError(e.message);
    }
  }
  function storageDialog() {
    openDialog(
      "Sync & recovery",
      "Your existing account and storage",
      `<div id="syncStat">${syncCardHTML()}</div><div id="p-storage" class="p-space">${durabilityCardHTML()}</div>`,
    );
  }
  function refreshStorage() {
    if ($("#p-storage")) $("#p-storage").innerHTML = durabilityCardHTML();
  }
  function historyDialog() {
    const entries = [
      ...(S.lifts || []).map((x) => ({
        ...x,
        kind: "Lift",
        text: `${x.ex} · ${x.wt} lb × ${x.reps}${x.sets ? " × " + x.sets + " sets" : ""}`,
      })),
      ...(S.metrics || []).map((x) => ({
        ...x,
        kind: "Metric",
        text: `${x.key}: ${x.val}`,
      })),
      ...(S.notes || []).map((x) => ({ ...x, kind: "Note" })),
      ...(S.games || []).map((x) => ({
        ...x,
        kind: "Game",
        text: `${x.opp} · ${x.played === false ? "Did not play" : "Game record"} · ${x.yds ?? "Unknown"} rushing yards`,
      })),
    ]
      .sort(M.order)
      .reverse();
    openDialog(
      "Your earlier work is still here.",
      "Training & notes",
      `<p>${entries.length} entries. Your most recent 100 appear below; the full record is included in every backup.</p>${
        entries
          .slice(0, 100)
          .map(
            (x) =>
              `<div class="p-evidence"><span class="p-mini">${E(short(x.d))} · ${E(x.kind)}</span><p>${E(x.text || x.note || "Saved entry")}</p></div>`,
          )
          .join("") ||
        empty("No training recorded yet.", "Log completed work from Progress.")
      }`,
    );
  }
  function submit(e) {
    const f = e.target;
    if (!f.id?.startsWith("p-")) return;
    e.preventDefault();
    const d = Object.fromEntries(new FormData(f));
    try {
      if (
        d.date &&
        (!M.validDate(d.date) ||
          (!["p-fixture-form"].includes(f.id) && d.date > today()))
      )
        throw Error(
          "Use a valid date, no later than today for a completed rep.",
        );
      const requiredText = (v, name) => {
        if (!v?.trim()) throw Error("Add " + name + ".");
        return v.trim();
      };
      let message = "Saved.";
      const ok = transact(() => {
        if (f.id === "p-ready-form") {
          d.sleep = Number(d.sleep);
          S.events.push(record("daily_ready", d));
          pushMetric({
            d: today(),
            key: "sleep",
            val: d.sleep,
            src: "daily-checkin",
          });
          pushMetric({
            d: today(),
            key: "energy",
            val: { low: 1, okay: 3, good: 5 }[d.energy],
            src: "daily-checkin",
          });
          rememberPlan();
          message = "Check-in saved. Today’s dose is updated.";
        } else if (f.id === "p-evidence-form") {
          const url = d.url?.trim() ? safeURL(d.url) : "";
          if (d.url?.trim() && !url)
            throw Error("Use an http or https film link.");
          if (!K.some((k) => k.id === d.skill))
            throw Error("Choose a supported skill.");
          const meta = {
            skill: d.skill,
            source: d.source,
            outcome: d.outcome,
            impact: d.impact,
            classification: d.classification,
            note: requiredText(d.note, "one specific observation"),
            correction: d.correction.trim(),
            session: d.session.trim(),
            timestamp: d.timestamp.trim(),
            url: url || "",
            legacyRef: d.legacyRef || "",
            confidence: d.confidence ? Number(d.confidence) : null,
          };
          if (
            meta.confidence != null &&
            (!Number.isInteger(meta.confidence) ||
              meta.confidence < 1 ||
              meta.confidence > 5)
          )
            throw Error("Confidence must be 1–5 or blank.");
          M.validateEvent("development_evidence", meta);
          if (d.target)
            S.events.push(
              record("evidence_revision", {
                target: d.target,
                repDate: d.date,
                value: meta,
              }),
            );
          else S.events.push(record("development_evidence", meta, d.date));
          if (d.source === "practice" && !practiceLogged(S, d.date))
            S.events.push(record("practice", { fromEvidence: true }, d.date));
          if (M.readiness(S, today())) rememberPlan();
          message = "Evidence saved. Your next correction is updated.";
        } else if (f.id === "p-reps-form") {
          const p = plan();
          if (p.mode === "support" && d.mode !== "mental")
            throw Error("Use mental rehearsal and talk to your trainer.");
          if (p.mode !== "skill" && !["mental", "walk"].includes(d.mode))
            throw Error("Today’s plan limits extra work to rehearsal.");
          S.events.push(
            record("skill_rep", {
              skill: d.skill,
              attempts: Number(d.attempts),
              clean: Number(d.clean),
              mode: d.mode,
              evidence: d.provenance,
              note: d.note.trim(),
            }),
          );
          message = "Session saved. Test the cue in a team rep.";
        } else if (f.id === "p-assignment-form") {
          ["name", "alignment", "keyRule", "job", "source"].forEach(
            (k) => (d[k] = requiredText(d[k], k)),
          );
          S.events.push(record("assignment", d));
          message = "Team rule saved.";
        } else if (f.id === "p-postgame-form") {
          for (const key of [
            "ours",
            "theirs",
            "snaps",
            "car",
            "yds",
            "td",
            "tkl",
            "missed",
            "fumbles",
          ])
            d[key] = d[key] === "" ? null : Number(d[key]);
          d.game = d.date;
          d.opponent = requiredText(d.opponent, "the opponent");
          if (d.played === "no")
            for (const key of [
              "snaps",
              "car",
              "yds",
              "td",
              "tkl",
              "missed",
              "fumbles",
            ])
              d[key] = null;
          const old = rows("postgame")
            .filter((e) => e.meta.game === d.game)
            .at(-1);
          S.events.push(record("postgame", d, d.date));
          // A revision replaces derived evidence using tombstones; the old memory remains in history.
          if (old)
            for (const ev of rows("development_evidence"))
              if (ev.meta.postgame === d.game)
                S.events.push(record("evidence_void", { target: ev.id }));
          if (d.played === "yes" && d.correction.trim())
            S.events.push(
              record(
                "development_evidence",
                {
                  skill: d.skill,
                  source: "game",
                  outcome: "error",
                  impact: "medium",
                  classification: "unclassified",
                  note: d.correction.trim(),
                  correction: "",
                  postgame: d.game,
                },
                d.date,
              ),
            );
          message = "Postgame captured. Film will test the memory.";
        } else if (f.id === "p-fixture-form") {
          if (schedule().some((g) => g.d === d.date && g.d !== d.original))
            throw Error(
              "That date already has a game. Select it to correct the fixture.",
            );
          S.events.push(
            record("fixture_override", {
              original: d.original || d.date,
              date: d.date,
              opp: requiredText(d.opponent, "an opponent"),
              home: d.venue === "home",
              time: d.time || null,
              source: requiredText(d.source, "the confirming source"),
              lvl: level(S),
            }),
          );
          seasonDate = d.date;
          message = "Fixture updated. Preparation uses the corrected date.";
        } else if (f.id === "p-game-details-form") {
          S.events.push(record("game_details", d));
          message = "Arrival plan saved.";
        } else if (f.id === "p-scout-form") {
          if (d.url && !safeURL(d.url))
            throw Error("Use an http or https film link.");
          S.events.push(record("opponent_study", d));
          message = "Opponent question saved.";
        } else if (f.id === "p-rhythm-form") {
          S.events.push(
            record("week_rhythm", { text: requiredText(d.text, "your week") }),
          );
          message = "Weekly rhythm updated.";
        } else if (f.id === "p-profile-form") {
          S.profile = {
            ...S.profile,
            name: requiredText(d.name, "your name"),
            classOf: Number(d.classOf),
          };
          S.settings.level = d.level;
          S.events.push(record("athlete_role", { rb: d.rb, lb: d.lb }));
          if (d.availability !== "unchanged") {
            requiredText(d.source, "who confirmed availability");
            S.events.push(
              record("clear", {
                k: "cleared",
                v: d.availability === "cleared" ? "yes" : "not yet",
                source: d.source,
              }),
            );
          }
          message = "Athlete context updated.";
        } else if (f.id === "p-performance-form") {
          const v = Number(d.value);
          if (!Number.isFinite(v) || v <= 0)
            throw Error("Enter a valid measurement.");
          if (d.kind === "lift") {
            if (
              !Number.isInteger(Number(d.reps)) ||
              Number(d.reps) < 1 ||
              Number(d.reps) > 100 ||
              !Number.isInteger(Number(d.sets)) ||
              Number(d.sets) < 1 ||
              Number(d.sets) > 20
            )
              throw Error("Enter valid sets and reps.");
            S.lifts.push({
              id: uid(),
              d: d.date,
              t: Date.now(),
              ex: requiredText(d.exercise, "the exercise"),
              wt: v,
              reps: Number(d.reps),
              sets: Number(d.sets),
              note: d.note,
            });
          } else {
            if (
              (d.kind === "sleep" && v > 16) ||
              (d.kind === "energy" && (v > 5 || !Number.isInteger(v))) ||
              (d.kind === "wt" && (v < 50 || v > 500))
            )
              throw Error("Check the value and units.");
            pushMetric({
              d: d.date,
              key: d.kind,
              val: v,
              src: "manual",
              cond: d.note,
            });
          }
          message = "Completed work logged.";
        } else throw Error("This form could not be saved.");
      });
      if (ok) {
        closeDialog();
        RENDER[curView]();
        toast(message);
      }
    } catch (err) {
      showError(err.message);
    }
  }
  function action(e) {
    const el = e.target.closest("[data-action]");
    if (!el) return;
    e.preventDefault();
    const a = el.dataset.action;
    if (a.startsWith("nav:")) {
      closeDialog();
      go(a.slice(4));
      return;
    }
    if (a.startsWith("role:")) {
      role = a.slice(5);
      renderDevelopment();
      return;
    }
    if (a.startsWith("film-filter:")) {
      filmFilter = a.slice(12);
      renderFilm();
      return;
    }
    if (a.startsWith("game:")) {
      seasonDate = a.slice(5);
      renderSeason();
      return;
    }
    if (a.startsWith("gap:")) return gapDialog(a.slice(4));
    if (a.startsWith("session:")) return sessionDialog(a.slice(8));
    if (a.startsWith("capture:")) return captureDialog(a.slice(8));
    if (a.startsWith("retest:"))
      return captureDialog("practice-film", {
        skill: a.slice(7),
        outcome: "",
        correction: "Retest: " + catalog(a.slice(7)).test,
      });
    if (a.startsWith("edit:")) {
      const ev = M.evidence(S, today()).find((e) => e.id === a.slice(5));
      if (ev) return captureDialog(ev.source, ev);
      return;
    }
    if (a.startsWith("classify:")) {
      const [, from, id] = a.split(":");
      const row = (from === "coach" ? S.coach : S.clips).find(
        (e) => e.id === id,
      );
      if (row)
        captureDialog(from === "coach" ? "coach" : "practice-film", {
          d: row.d,
          note: row.text || row.note,
          url: row.url || "",
          legacyRef: from + ":" + id,
          outcome: "question",
        });
      return;
    }
    if (a.startsWith("assignment-edit:")) return assignmentForm(a.slice(16));
    if (a.startsWith("lesson:")) return lessonDialog(a.slice(7));
    if (a.startsWith("answer:")) {
      if (!currentLesson || lessonAnswered) return;
      const correct = Number(a.slice(7)) === currentLesson.answer;
      if (
        append("knowledge_attempt", {
          lesson: currentLesson.id,
          correct,
          answer: Number(a.slice(7)),
        })
      ) {
        lessonAnswered = true;
        document
          .querySelectorAll(".p-answer, .p-answers button")
          .forEach((b) => (b.disabled = true));
        $("#p-lesson-feedback").innerHTML =
          `<div class="p-feedback ${correct ? "correct" : ""}"><b>${correct ? "Correct." : "Use this distinction."}</b><p>${E(currentLesson.explain)}</p>${actions(button("Try the related skill", "session:" + currentLesson.skill, "quiet") + button("Done", "close", "text"))}</div>`;
      }
      return;
    }
    const map = {
      "next-game": () => {
        seasonDate = plan().game?.d || null;
        go("season");
      },
      close: closeDialog,
      checkin: checkinDialog,
      success: () => captureDialog("practice", { outcome: "success" }),
      assignment: assignmentDialog,
      "assignment-new": () => assignmentForm(),
      "assignment-done": () => {
        if (append("task_state", { key: "assignment", done: true })) {
          closeDialog();
          RENDER[curView]();
          toast("Install review recorded.");
        }
      },
      postgame: postgameDialog,
      fixture: fixtureDialog,
      "game-details": gameDetailsDialog,
      scout: scoutDialog,
      profile: profileDialog,
      "performance-log": performanceDialog,
      reset: resetDialog,
      "reset-start": startReset,
      "reset-save": () => {
        if (resetComplete && append("mental_reset", { seconds: 60 })) {
          closeDialog();
          toast("Reset saved. One job, next snap.");
        }
      },
      gameplan: () =>
        openDialog(
          "Your game-day essentials.",
          "Prepare the next snap",
          gameDay(selectedGame()) +
            actions(button("Postgame capture", "postgame", "quiet")),
        ),
      rhythm: () =>
        openDialog(
          "Plan around the team.",
          "Weekly rhythm",
          form(
            "rhythm",
            textarea(
              "text",
              "School, practice, team lifts, other constraints",
              latest("week_rhythm")?.meta.text || "",
              "Example: school until…, practice Mon–Wed…, team lift…",
              true,
            ),
            "Save weekly rhythm",
          ),
        ),
      export: exportBackup,
      import: () => {
        let f = $("#p-import");
        if (!f) {
          f = document.createElement("input");
          f.type = "file";
          f.id = "p-import";
          f.accept = ".json";
          f.hidden = true;
          document.body.append(f);
        }
        f.click();
      },
      "merge-confirm": mergeBackup,
      history: historyDialog,
      data: storageDialog,
    };
    map[a]?.();
  }
  function updatePlayingFields() {
    const no = $("#p-played")?.value === "no";
    for (const key of [
      "snaps",
      "car",
      "yds",
      "td",
      "tkl",
      "missed",
      "fumbles",
    ]) {
      const el = $("#p-" + key);
      if (el) {
        el.disabled = no;
        if (no) el.value = "";
      }
    }
  }
  function change(e) {
    const t = e.target;
    if (t.id === "p-played") updatePlayingFields();
    if (t.matches("[data-prep]")) {
      if (
        !append("game_prep", {
          game: t.dataset.game,
          item: Number(t.dataset.prep),
          done: t.checked,
        })
      )
        t.checked = !t.checked;
    }
    if (t.id === "p-import" && t.files?.[0]) {
      const file = t.files[0];
      t.value = "";
      importBackup(file);
    }
  }
  function install() {
    document.body.classList.add("v12");
    const aliases = {
      skills: "development",
      week: "season",
      train: "progress",
      track: "progress",
      push: "film",
      path: "season",
      plan: "season",
    };
    for (const key of Object.keys(VIEW_ALIAS)) delete VIEW_ALIAS[key];
    Object.assign(VIEW_ALIAS, aliases);
    for (const id of ["development", "film", "season", "progress"])
      if (!$("#v-" + id)) {
        const el = document.createElement("section");
        el.id = "v-" + id;
        el.className = "view";
        document.querySelector("main").append(el);
      }
    Object.assign(RENDER, {
      today: renderToday,
      development: renderDevelopment,
      film: renderFilm,
      season: renderSeason,
      progress: renderProgress,
    });
    for (const [key, value] of Object.entries(aliases))
      RENDER[key] = () => go(value);
    go = function (v, pop = false) {
      v = VIEW_ALIAS[v] || v;
      if (!["today", "development", "film", "season", "progress"].includes(v))
        v = "today";
      curView = v;
      document
        .querySelectorAll(".view")
        .forEach((x) => x.classList.toggle("on", x.id === "v-" + v));
      RENDER[v]();
      header();
      document.querySelectorAll("#nav [data-v]").forEach((b) => {
        const selected = b.dataset.v === v;
        b.classList.toggle("on", selected);
        if (selected) b.setAttribute("aria-current", "page");
        else b.removeAttribute("aria-current");
      });
      if (!pop) history.pushState({ v }, "", "#" + v);
      window.scrollTo(0, 0);
    };
    const routes = [
      ["today", "Today"],
      ["development", "Develop"],
      ["film", "Film"],
      ["season", "Season"],
      ["progress", "Progress"],
    ];
    $("#nav").innerHTML =
      `<div class="p-nav-brand">D1<span>OS</span><small>PREPARE TO PLAY.</small></div><div class="p-nav-items">${routes.map(([v, l]) => `<button data-v="${v}" data-action="nav:${v}" aria-label="${v === "development" ? "Development" : l}">${icon(v)}<span>${l}</span></button>`).join("")}</div><div class="p-nav-footer"><span>EVERY REP HAS A JOB.</span><small>Basic Wolves · ${E(S.profile.classOf)}</small></div>`;
    $("#hdr .hudwrap > button")?.remove();
    navInit = () => {
      if (_navReady) return;
      _navReady = true;
      window.addEventListener("popstate", () => {
        closeDialog();
        go(location.hash.slice(1), true);
      });
    };
    snapRefresh = () =>
      idbSnapList((ks) => {
        _snapList = ks;
        refreshStorage();
      });
    restoreArm = (k) => {
      _pendRestore = _pendRestore === k ? null : k;
      refreshStorage();
    };
    const oldRestore = restoreGo;
    restoreGo = (k) => {
      oldRestore(k);
      refreshStorage();
    };
    renderHdr = header;
    rToday = () => RENDER[curView]?.();
    rTrain = rTrack = renderProgress;
    rPath = rPlan = renderSeason;
    rPush = renderFilm;
    introMaybe = () => {};
    runCounters = () => {};
    badgeSync = () => {
      try {
        navigator.clearAppBadge?.();
      } catch {}
    };
    importS = importBackup;
    exportS = exportBackup;
    const originalBoot = bootD1;
    bootD1 = function () {
      const hash = location.hash.slice(1);
      originalBoot();
      if (!writeBlocked() && !_wm && !location.search.includes("a="))
        go(VIEW_ALIAS[hash] || hash || "today", true);
    };
    deepLink = function () {
      const a = new URLSearchParams(location.search).get("a");
      if (a === "game") {
        go("season");
        postgameDialog();
      } else if (a === "practice") {
        go("today");
        captureDialog("practice");
      } else if (a === "lift" || a === "quick") {
        go("progress");
        performanceDialog();
      }
    };
    curView = "today";
    document.addEventListener("click", action);
    document.addEventListener("change", change);
    document.addEventListener("submit", submit);
    let lastDay = today();
    document.addEventListener("visibilitychange", () => {
      if (
        document.visibilityState === "visible" &&
        !writeBlocked() &&
        lastDay !== today()
      ) {
        lastDay = today();
        closeDialog();
        RENDER[curView]();
      }
    });
    window.addEventListener("hashchange", () => {
      if (!writeBlocked()) go(location.hash.slice(1), true);
    });
    header();
  }
  window.D1 = {
    version: VERSION,
    skills: K,
    engine: M,
    model: {
      plan,
      validateBackup: validBackup,
      nextGame: (s, d = today()) =>
        levelSchedule(s).games.find((g) => g.d >= d) || null,
      prescription: (s, d = today()) =>
        M.plan(s, K, d, levelSchedule(s).games, clearanceRead(s, d).clear),
    },
    transact,
    record,
    trainHeader: () => "",
    render: () => RENDER[curView]?.(),
  };
  install();
})();
