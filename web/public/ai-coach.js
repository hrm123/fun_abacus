/* Frontend client for the Abby coach + level APIs (Meta Llama via server, local fallback). */
(function () {
  "use strict";

  async function post(url, body) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
    return res.json();
  }

  async function status() {
    try {
      const res = await fetch("/api/status");
      return await res.json();
    } catch {
      return { ok: false, ai_mode: "local", model: "local" };
    }
  }

  async function coach(message, context) {
    return post("/api/coach", { message, context });
  }

  async function level(history) {
    return post("/api/level", { history });
  }

  window.AbacusAI = { status, coach, level };
})();
