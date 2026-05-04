// ─── Simulator playback engine ──────────────────────────────────────────
// Linear playback with skip-to-next-phase. Events fire as the sim clock
// crosses their timestamps. Project rows light up briefly on activity.

(function () {
  const data = window.SIM_DATA;
  if (!data) {
    console.error("Simulator data missing.");
    return;
  }

  // Convert "HH:MM" → minutes since midnight
  const toMin = (t) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  const toClock = (m) => {
    const h = Math.floor(m / 60), mm = Math.floor(m % 60);
    return String(h).padStart(2, "0") + ":" + String(mm).padStart(2, "0");
  };

  const SESSION_START = toMin(data.session.start);
  const SESSION_END   = toMin(data.session.end);
  const SESSION_LEN   = SESSION_END - SESSION_START; // sim minutes
  const PHASES = data.phases.map(p => ({
    ...p,
    startMin: toMin(p.start),
    endMin: toMin(p.end),
  }));
  const EVENTS = data.events.map((e, i) => ({
    ...e,
    idx: i,
    timeMin: toMin(e.time),
  })).sort((a, b) => a.timeMin - b.timeMin);
  const PROJECTS = data.projects;

  // ─── State ─────────────────────────────────────────────────────────────
  let simMin = SESSION_START;
  let firedIdx = -1;       // last event index that has fired
  let playing = false;
  let lastTickReal = 0;
  const SIM_MIN_PER_REAL_SEC = 1.2; // 1.2 sim min per real sec → ~158s for full session
  const PROJECT_LIGHT_MS = 4500;
  const projectTimers = {};

  // ─── DOM refs ──────────────────────────────────────────────────────────
  const elTime  = document.getElementById("sim-time");
  const elPhase = document.getElementById("sim-phase-label");
  const elPhaseLine = document.getElementById("sim-phaseline");
  const elProjectList = document.getElementById("sim-project-list");
  const elStream = document.getElementById("sim-stream");
  const btnPlay = document.getElementById("btn-play");
  const btnSkip = document.getElementById("btn-skip");
  const btnReset = document.getElementById("btn-reset");

  // ─── Build phase line ──────────────────────────────────────────────────
  PHASES.forEach((p, i) => {
    const span = (p.endMin - p.startMin);
    const pct = (span / SESSION_LEN) * 100;
    const seg = document.createElement("div");
    seg.className = "sim-phaseseg";
    seg.dataset.phase = p.id;
    seg.style.flex = `${span} ${span} 0`;
    seg.innerHTML = `
      <div class="sim-phaseseg-inner"></div>
      <div class="sim-phaseseg-label">${p.label}</div>
      <div class="sim-phaseseg-time">${p.start}</div>
    `;
    elPhaseLine.appendChild(seg);
  });

  // ─── Build project list ────────────────────────────────────────────────
  PROJECTS.forEach(p => {
    const li = document.createElement("li");
    li.className = "sim-project";
    li.dataset.id = p.id;
    li.innerHTML = `
      <div class="sim-project-row">
        <span class="sim-project-dot"></span>
        <span class="sim-project-name">${p.label}</span>
      </div>
      <div class="sim-project-students">${p.students.join(" · ")}</div>
    `;
    elProjectList.appendChild(li);
  });

  // ─── Phase helpers ─────────────────────────────────────────────────────
  function currentPhase() {
    for (const p of PHASES) {
      if (simMin >= p.startMin && simMin < p.endMin) return p;
    }
    return PHASES[PHASES.length - 1]; // wrap or final
  }
  function highlightCurrentPhase() {
    const cur = currentPhase();
    elPhaseLine.querySelectorAll(".sim-phaseseg").forEach(seg => {
      seg.classList.toggle("is-current", seg.dataset.phase === cur.id);
      const pIdx = PHASES.findIndex(x => x.id === seg.dataset.phase);
      const cIdx = PHASES.findIndex(x => x.id === cur.id);
      seg.classList.toggle("is-past", pIdx < cIdx);
    });
    elPhase.textContent = cur.label.toUpperCase();
  }

  // ─── Project lighting ──────────────────────────────────────────────────
  function lightProject(id) {
    const li = elProjectList.querySelector(`[data-id="${id}"]`);
    if (!li) return;
    li.classList.add("is-active");
    if (projectTimers[id]) clearTimeout(projectTimers[id]);
    projectTimers[id] = setTimeout(() => {
      li.classList.remove("is-active");
      delete projectTimers[id];
    }, PROJECT_LIGHT_MS);
  }

  // ─── Event rendering ───────────────────────────────────────────────────
  function targetLabel(targetId) {
    if (!targetId) return "";
    const proj = PROJECTS.find(p => p.id === targetId);
    if (proj) return proj.label;
    if (targetId === "instructor") return "Instructor";
    if (targetId === "peer") return "Friend (peer)";
    return targetId;
  }
  function fireEvent(ev) {
    const li = document.createElement("li");
    li.className = "sim-event";
    const badge = ev.routing === "ambient" ? "ambient"
                : ev.routing === "broadcast" ? "broadcast"
                : "directed";
    const arrow = ev.routing === "directed" ? ` &rarr; <strong>${targetLabel(ev.target)}</strong>` : "";
    li.innerHTML = `
      <div class="sim-event-head">
        <span class="sim-event-time">${ev.time}</span>
        <span class="badge badge-${badge}">${badge.toUpperCase()}${ev.routing === "directed" ? " &rarr;" : ""}</span>
        <span class="sim-event-source">${ev.source}<span class="sim-event-type">.${ev.type}</span></span>
      </div>
      <div class="sim-event-summary">${ev.summary}${arrow}</div>
    `;
    // Auto-scroll inside the stream only (never the window) — and only if
    // the user was already near the bottom, so they can scroll up to read
    // past events without being yanked back.
    const wasNearBottom = (elStream.scrollHeight - elStream.scrollTop - elStream.clientHeight) < 80;
    elStream.appendChild(li);
    // Light source and target
    lightProject(ev.source);
    if (ev.target) lightProject(ev.target);
    if (wasNearBottom) {
      elStream.scrollTop = elStream.scrollHeight;
    }
  }

  // ─── Tick ──────────────────────────────────────────────────────────────
  function setSimMin(m, fastForwardEvents = true) {
    simMin = Math.max(SESSION_START, Math.min(SESSION_END, m));
    elTime.textContent = toClock(simMin);
    highlightCurrentPhase();
    if (fastForwardEvents) {
      // Fire all events up to and including current sim time that haven't fired
      while (firedIdx + 1 < EVENTS.length && EVENTS[firedIdx + 1].timeMin <= simMin) {
        firedIdx++;
        fireEvent(EVENTS[firedIdx]);
      }
    }
    if (simMin >= SESSION_END) stop();
  }
  function tick(now) {
    if (!playing) return;
    const dtSec = (now - lastTickReal) / 1000;
    lastTickReal = now;
    setSimMin(simMin + dtSec * SIM_MIN_PER_REAL_SEC);
    if (playing) requestAnimationFrame(tick);
  }
  function lockControlsToTop() {
    const controls = document.querySelector(".sim-controls");
    if (!controls) return;
    const rect = controls.getBoundingClientRect();
    // If control bar is below the viewport top, scroll the window so it sticks.
    // (If it's already pinned at top, rect.top === 0 and we do nothing.)
    if (rect.top > 0) {
      window.scrollTo({
        top: window.scrollY + rect.top,
        behavior: "smooth",
      });
    }
  }
  function play() {
    if (simMin >= SESSION_END) return;
    playing = true;
    btnPlay.textContent = "Pause";
    btnPlay.classList.add("is-playing");
    lastTickReal = performance.now();
    lockControlsToTop();
    requestAnimationFrame(tick);
  }
  function stop() {
    playing = false;
    btnPlay.textContent = simMin >= SESSION_END ? "Done" : "Play";
    btnPlay.classList.remove("is-playing");
  }
  function reset() {
    stop();
    simMin = SESSION_START;
    firedIdx = -1;
    elStream.innerHTML = "";
    btnPlay.textContent = "Play";
    btnPlay.disabled = false;
    Object.keys(projectTimers).forEach(id => clearTimeout(projectTimers[id]));
    elProjectList.querySelectorAll(".sim-project.is-active").forEach(li => li.classList.remove("is-active"));
    setSimMin(SESSION_START, false);
  }
  function skipPhase() {
    const cur = currentPhase();
    const next = PHASES.find(p => p.startMin > cur.startMin);
    if (!next) {
      setSimMin(SESSION_END);
      stop();
      return;
    }
    setSimMin(next.startMin);
    if (!playing) {
      // fire events at the new mark even when paused
      // (setSimMin already does this when fastForwardEvents=true)
    }
  }

  // ─── Tabs (mobile only) ────────────────────────────────────────────────
  const tabs = document.querySelectorAll(".sim-tab");
  const panels = document.querySelectorAll(".sim-tabpanel");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.tab;
      tabs.forEach(t => {
        const active = t.dataset.tab === target;
        t.classList.toggle("is-active", active);
        t.setAttribute("aria-selected", active ? "true" : "false");
      });
      panels.forEach(p => {
        p.classList.toggle("is-active", p.dataset.tab === target);
      });
    });
  });

  // ─── Wiring ────────────────────────────────────────────────────────────
  btnPlay.addEventListener("click", () => { playing ? stop() : play(); });
  btnSkip.addEventListener("click", skipPhase);
  btnReset.addEventListener("click", reset);
  // Click a phase segment to jump there
  elPhaseLine.addEventListener("click", (e) => {
    const seg = e.target.closest(".sim-phaseseg");
    if (!seg) return;
    const p = PHASES.find(x => x.id === seg.dataset.phase);
    if (p) setSimMin(p.startMin);
  });

  // Init
  reset();
})();
