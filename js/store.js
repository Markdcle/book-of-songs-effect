/* store.js — submission queue with offline resilience.
 *
 * Three layers of safety:
 * 1. Online  -> POST JSON to the Apps Script endpoint.
 * 2. Offline/failure -> localStorage queue; auto-flush on 'online' and on load.
 * 3. Last resort -> ?export in the URL shows a link to download the queue as JSON.
 */
(function () {
  "use strict";
  const QUEUE_KEY = "ftp_queue_v1";

  function readQueue() {
    try { return JSON.parse(localStorage.getItem(QUEUE_KEY)) || []; }
    catch (e) { return []; }
  }
  function writeQueue(q) {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
  }

  function uuid() {
    if (crypto.randomUUID) return crypto.randomUUID();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0, v = c === "x" ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // POST one payload. Returns true if the server almost certainly received it.
  async function send(payload) {
    const url = window.APP_CONFIG.ENDPOINT_URL;
    if (!url) return false;
    try {
      // text/plain keeps it a "simple request" -> no CORS preflight; Apps Script
      // still receives the raw JSON string in e.postData.contents.
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      });
      return resp.ok;
    } catch (e) {
      return false;
    }
  }

  async function flush(onProgress) {
    const q = readQueue();
    if (!q.length) return 0;
    const remaining = [];
    let sent = 0;
    for (const item of q) {
      const ok = await send({ ...item, offline_queued: true });
      if (ok) sent++; else remaining.push(item);
      if (onProgress) onProgress(sent, q.length);
    }
    writeQueue(remaining);
    updateQueueNote();
    return sent;
  }

  // Public: submit a response. Never throws; resolves to "online" | "queued".
  async function submit(data) {
    const payload = {
      ...data,
      uuid: uuid(),
      timestamp: new Date().toISOString(),
      offline_queued: false,
      user_agent: navigator.userAgent,
      page_lang: navigator.language || ""
    };
    if (await send(payload)) { updateQueueNote(); return "online"; }
    const q = readQueue();
    q.push(payload);
    writeQueue(q);
    updateQueueNote();
    return "queued";
  }

  function pendingCount() { return readQueue().length; }

  function updateQueueNote() {
    const el = document.getElementById("queue-note");
    if (!el) return;
    const n = pendingCount();
    if (n > 0) {
      el.hidden = false;
      el.textContent = `● ${n} response(s) saved on this device — they will sync automatically when online.`;
    } else {
      el.hidden = true;
    }
  }

  function exportQueue() {
    const q = readQueue();
    const blob = new Blob([JSON.stringify(q, null, 1)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `feel-the-poetry-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // Flush whenever we come back online, and once at startup.
  window.addEventListener("online", () => flush());
  document.addEventListener("DOMContentLoaded", () => {
    updateQueueNote();
    flush();
    if (location.search.includes("export")) {
      const bar = document.getElementById("export-bar");
      bar.hidden = false;
      document.getElementById("export-link").addEventListener("click", e => {
        e.preventDefault(); exportQueue();
      });
    }
  });

  window.Store = { submit, flush, pendingCount, exportQueue };
})();
