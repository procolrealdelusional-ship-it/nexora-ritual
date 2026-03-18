// offlineQueue.js - localStorage-based offline event queue

const QUEUE_KEY = "nexoraLogQueue";

function getQueue() {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveQueue(queue) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

window.enqueueLog = function (payload) {
  const queue = getQueue();
  queue.push({ ...payload, queuedAt: Date.now() });
  saveQueue(queue);
};

window.flushLogs = async function (baseUrl) {
  const queue = getQueue();
  if (queue.length === 0) return;

  try {
    const res = await fetch(`${baseUrl}/api/nexora/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ events: queue }),
    });

    if (res.ok) {
      saveQueue([]);
      console.log(`[NeXora] Flushed ${queue.length} queued events`);
    }
  } catch (err) {
    console.warn("[NeXora] Flush failed, will retry later", err);
  }
};

// Auto-flush when coming back online
window.addEventListener("online", () => {
  if (window.__NEXORA_BASE_URL) {
    window.flushLogs(window.__NEXORA_BASE_URL);
  }
});
