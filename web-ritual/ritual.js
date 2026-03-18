// ritual.js - NeXora Ritual Engine (web client)

const BASE_URL = "https://nexora-ritual-worker.YOUR_ACCOUNT.workers.dev";
window.__NEXORA_BASE_URL = BASE_URL;

const MILESTONES = [5, 10, 20, 30, 45];
const LOW_INTERNET_MILESTONES = [10, 30, 60];
const RITUAL_DURATION = 60;

function getUserId() {
  let id = localStorage.getItem("nexoraUserId");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("nexoraUserId", id);
  }
  return id;
}

function logEvent(eventType, data = {}) {
  const payload = {
    userId: getUserId(),
    eventType,
    timestamp: Date.now(),
    ...data,
  };

  if (!navigator.onLine) {
    window.enqueueLog(payload);
    return;
  }

  fetch(`${BASE_URL}/api/nexora/log`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => window.enqueueLog(payload));
}

async function startRitual() {
  const btn = document.getElementById("start-btn");
  const timerEl = document.getElementById("timer");
  const npcEl = document.getElementById("npc-text");
  const orbEl = document.getElementById("timer-orb");
  const resultEl = document.getElementById("result");

  btn.disabled = true;
  resultEl.textContent = "";

  // Fetch prompt
  let sessionId, lowInternetMode = false;
  try {
    const res = await fetch(`${BASE_URL}/api/prompt?userId=${getUserId()}`);
    const data = await res.json();
    npcEl.textContent = data.npcText;
    sessionId = data.sessionId;
    lowInternetMode = data.lowInternetMode;
  } catch {
    npcEl.textContent = "Offline mode. Begin your ritual.";
    sessionId = crypto.randomUUID();
  }

  const milestones = lowInternetMode ? LOW_INTERNET_MILESTONES : MILESTONES;
  const hitMilestones = new Set();

  logEvent("ritual_start", { sessionId });
  orbEl.classList.add("active");

  let secondsLeft = RITUAL_DURATION;
  timerEl.textContent = secondsLeft;

  const interval = setInterval(() => {
    secondsLeft--;
    timerEl.textContent = secondsLeft;

    const elapsed = RITUAL_DURATION - secondsLeft;
    if (milestones.includes(elapsed) && !hitMilestones.has(elapsed)) {
      hitMilestones.add(elapsed);
      logEvent("milestone", { sessionId, elapsed });
    }

    if (secondsLeft <= 0) {
      clearInterval(interval);
      onRitualEnd(sessionId, resultEl, btn, orbEl);
    }
  }, 1000);
}

async function onRitualEnd(sessionId, resultEl, btn, orbEl) {
  logEvent("ritual_complete", { sessionId });
  orbEl.classList.remove("active");

  // Flush any queued offline logs
  await window.flushLogs(BASE_URL);

  // Fetch stats
  try {
    const res = await fetch(`${BASE_URL}/api/nexora/stats?userId=${getUserId()}`);
    const stats = await res.json();
    resultEl.innerHTML = `Shield +${stats.shieldDelta}% | Streak: ${stats.streak} days | Belt: ${stats.belt}`;
  } catch {
    resultEl.textContent = "Done for today. See you next time.";
  }

  btn.disabled = false;
  btn.textContent = "Ritual Again";
}

// Wire up
document.getElementById("start-btn").addEventListener("click", startRitual);
