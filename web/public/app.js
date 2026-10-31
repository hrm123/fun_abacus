/* Main wiring: tabs, abacuses, quiz, badges, chat. */
(function () {
  "use strict";

  const store = {
    load(k, fb) {
      try { const v = JSON.parse(localStorage.getItem(k)); return v ?? fb; } catch { return fb; }
    },
    save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  };

  let history = store.load("abacusfun.history", []);
  let badges = new Set(store.load("abacusfun.badges", []));
  let level = 1, levelLabel = "Bead Explorer", streak = 0;
  let quiz = null; // {list, i, score, mix}

  window.AbacusFun = {
    get level() { return level; },
    record(entry) {
      history.push({ ...entry, at: Date.now() });
      history = history.slice(-60);
      store.save("abacusfun.history", history);
      if (entry.correct) { streak++; } else { streak = 0; }
      document.getElementById("streakCount").textContent = streak;
      awardCheck(entry);
      refreshLevel();
    },
  };

  // ---------- Tabs ----------
  document.querySelectorAll(".tabs button").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tabs button").forEach((b) => b.classList.remove("active"));
      document.querySelectorAll(".panel").forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById("tab-" + btn.dataset.tab).classList.add("active");
      if (btn.dataset.tab === "quiz") renderBadges();
    });
  });

  // ---------- Main abacus ----------
  const mainValue = document.getElementById("mainValue");
  const mainBreakdown = document.getElementById("mainBreakdown");
  const mainAbacus = window.Abacus.create(document.getElementById("mainAbacus"), {
    rods: 7,
    onChange(v, digits) {
      mainValue.textContent = v.toLocaleString();
      const parts = [];
      digits.forEach((d, i) => {
        if (d > 0) {
          const place = Math.pow(10, digits.length - 1 - i);
          parts.push(`${d}×${place.toLocaleString()}`);
        }
      });
      mainBreakdown.textContent = parts.length ? `(${parts.join(" + ")})` : "(cleared)";
    },
  });
  document.getElementById("rodCount").addEventListener("change", (e) => {
    mainAbacus.setRods(Number(e.target.value));
  });
  document.getElementById("resetAbacus").addEventListener("click", () => mainAbacus.reset());
  document.getElementById("randomAbacus").addEventListener("click", () => {
    const n = Math.floor(Math.random() * 9999);
    mainAbacus.setValue(n);
    say(`Mystery number ${n}. Can you read it rod by rod?`);
  });
  document.getElementById("readAloud").addEventListener("click", () => {
    speak(`The abacus shows ${mainAbacus.value}`);
  });

  // ---------- Learn mini abacus ----------
  const learnValue = document.getElementById("learnValue");
  const learnAbacus = window.Abacus.create(document.getElementById("learnAbacus"), {
    rods: 5,
    onChange(v) { learnValue.textContent = v.toLocaleString(); },
  });
  document.querySelectorAll("[data-demo]").forEach((b) => {
    b.addEventListener("click", () => learnAbacus.setValue(Number(b.dataset.demo)));
  });

  // ---------- Lessons ----------
  document.querySelectorAll("[data-lesson]").forEach((sec) => {
    window.AbacusLessons.renderLesson(sec.dataset.lesson, sec);
  });

  // ---------- Quiz ----------
  const OPKEY = { "+": "add", "-": "subtract", "×": "multiply", "÷": "divide" };
  function makeQuestion(mix) {
    const ops = mix === "all" ? ["+", "-", "×", "÷"] : [mix];
    const op = ops[Math.floor(Math.random() * ops.length)];
    return window.AbacusLessons.LESSONS[OPKEY[op]].makeQ(level);
  }

  const quizBox = document.getElementById("quizBox");
  const quizQ = document.getElementById("quizQ");
  const quizHint = document.getElementById("quizHint");
  const quizInput = document.getElementById("quizInput");
  const quizFeedback = document.getElementById("quizFeedback");
  const quizProgress = document.getElementById("quizProgress");

  document.getElementById("startQuiz").addEventListener("click", () => {
    const mix = document.getElementById("quizMix").value;
    quiz = { i: 0, score: 0, mix, current: null, total: 8 };
    quizBox.hidden = false;
    nextQuizQ();
  });

  function nextQuizQ() {
    quiz.current = makeQuestion(quiz.mix);
    quizQ.textContent = `Q${quiz.i + 1}/8: ${quiz.current.a} ${quiz.current.op} ${quiz.current.b} = ?`;
    quizHint.textContent = "";
    quizFeedback.textContent = "";
    quizInput.value = "";
    quizInput.focus();
    quizProgress.textContent = `Score ${quiz.score}/${quiz.i}`;
  }

  document.getElementById("quizForm").addEventListener("submit", (e) => {
    e.preventDefault();
    if (!quiz || !quiz.current) return;
    const gave = Number(quizInput.value);
    if (quizInput.value.trim() === "" || Number.isNaN(gave)) {
      quizFeedback.textContent = "Type a number first — even a guess counts!";
      return;
    }
    const ok = gave === quiz.current.answer;
    if (ok) quiz.score++;
    window.AbacusFun.record({ ...quiz.current, gave, correct: ok, digits: String(Math.max(quiz.current.a, quiz.current.b)).length });
    quiz.i++;
    quizProgress.textContent = `Score ${quiz.score}/${quiz.i}`;
    if (ok) {
      quizFeedback.textContent = `✅ Correct! ${quiz.current.a} ${quiz.current.op} ${quiz.current.b} = ${quiz.current.answer}`;
    } else {
      const L = window.AbacusLessons.LESSONS[OPKEY[quiz.current.op]];
      quizFeedback.textContent = `❌ The answer was ${quiz.current.answer}. ${L.hint(quiz.current)}`;
    }
    if (quiz.i >= quiz.total) {
      setTimeout(() => {
        quizQ.textContent = `Done! You scored ${quiz.score}/${quiz.total} 🎉`;
        quizHint.textContent = quiz.score >= 7 ? "Soroban Star material!" : quiz.score >= 5 ? "Solid! Try again to beat your score." : "Good effort — practice one operation, then retry.";
        quizFeedback.textContent = "";
        quiz.current = null;
      }, 1600);
    } else {
      setTimeout(nextQuizQ, 1900);
    }
  });

  document.getElementById("quizHintBtn").addEventListener("click", () => {
    if (!quiz || !quiz.current) return;
    const L = window.AbacusLessons.LESSONS[OPKEY[quiz.current.op]];
    quizHint.textContent = "🥁 " + L.hint(quiz.current);
  });

  // ---------- Badges ----------
  function awardCheck(entry) {
    const total = history.length;
    const correct = history.filter((h) => h.correct).length;
    const opsUsed = new Set(history.map((h) => h.op));
    if (correct >= 1) badges.add("First Win 🎈");
    if (streak >= 3) badges.add("Hot Streak x3 🔥");
    if (streak >= 5) badges.add("Blaze x5 ⚡");
    if (opsUsed.size >= 4) badges.add("All-Rounder 🌈");
    if (total >= 20) badges.add("Persistent Panda 🐼");
    if (level >= 4) badges.add("Place-Value Pro 🏅");
    store.save("abacusfun.badges", [...badges]);
    renderBadges();
  }
  function renderBadges() {
    const all = ["First Win 🎈", "Hot Streak x3 🔥", "Blaze x5 ⚡", "All-Rounder 🌈", "Persistent Panda 🐼", "Place-Value Pro 🏅"];
    document.getElementById("badges").innerHTML = all
      .map((b) => `<span class="badge ${badges.has(b) ? "won" : ""}">${badges.has(b) ? b : "🔒 " + b.replace(/ [^ ]+$/, "")}</span>`)
      .join("");
  }

  // ---------- Level ----------
  let levelTimer = null;
  async function refreshLevel() {
    clearTimeout(levelTimer);
    levelTimer = setTimeout(async () => {
      try {
        const r = await window.AbacusAI.level(history.slice(-20));
        level = r.level || 1;
        levelLabel = r.label || levelLabel;
        document.getElementById("levelBadge").textContent = `Level ${level} · ${levelLabel}`;
      } catch { /* keep local */ }
    }, 400);
  }

  // ---------- Chat ----------
  const chatLog = document.getElementById("chatLog");
  const chatForm = document.getElementById("chatForm");
  const chatInput = document.getElementById("chatInput");

  function bubble(text, who) {
    const d = document.createElement("div");
    d.className = "msg " + who;
    d.textContent = text;
    chatLog.appendChild(d);
    chatLog.scrollTop = chatLog.scrollHeight;
  }
  function say(text) { bubble(text, "abby"); }

  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;
    bubble(text, "me");
    chatInput.value = "";
    bubble("…", "abby");
    const thinking = chatLog.lastChild;
    try {
      const r = await window.AbacusAI.coach(text, {
        level, streak,
        question: quiz && quiz.current ? quiz.current : null,
        abacusValue: mainAbacus.value,
      });
      thinking.textContent = r.reply;
    } catch {
      thinking.textContent = "Oops, my beads got tangled. Try again!";
    }
  });
  document.querySelectorAll(".quick button").forEach((b) => {
    b.addEventListener("click", () => {
      chatInput.value = b.dataset.ask;
      chatForm.requestSubmit();
    });
  });

  // ---------- Misc ----------
  function speak(text) {
    try {
      if (!("speechSynthesis" in window)) return;
      speechSynthesis.cancel();
      speechSynthesis.speak(new SpeechSynthesisUtterance(text));
    } catch {}
  }

  document.getElementById("aboutBtn").addEventListener("click", () => {
    document.getElementById("aboutDialog").showModal();
  });

  // ---------- Boot ----------
  (async function boot() {
    document.getElementById("streakCount").textContent = streak;
    renderBadges();
    say("Hi, I'm Abby! Click beads to make numbers, then visit Add, Subtract, Multiply, Divide — or hit Quiz. Ask me for a hint anytime!");
    try {
      const s = await window.AbacusAI.status();
      document.getElementById("aiMode").textContent =
        s.ai_mode === "meta" ? `coach: Meta AI (${s.model})` : "coach: built-in (set META_API_KEY for Meta AI)";
      document.getElementById("coachStatus").textContent =
        s.ai_mode === "meta"
          ? "Meta AI connected — I adapt to your level!"
          : "Built-in coach active. Set META_API_KEY on the server for Meta Llama AI.";
    } catch {
      document.getElementById("aiMode").textContent = "coach: built-in";
    }
    refreshLevel();
  })();
})();
