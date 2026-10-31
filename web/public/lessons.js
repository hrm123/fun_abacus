/* Lesson content + step demos + practice generators for each operation. */
(function () {
  "use strict";

  const LESSONS = {
    add: {
      title: "Addition on the Soroban",
      intro: "Addition is just sliding beads toward the beam. Start from the left rod, add right. When a rod is full, trade up using friends of 5 and 10.",
      points: [
        "<b>Direct add:</b> enough free beads? Just slide them. 3 + 2 → push 2 more earth beads up.",
        "<b>Friends of 5:</b> adding 4 but only 1 bead free? Add 5 (heaven down), take 1 away. Because 4 = 5 − 1.",
        "<b>Friends of 10:</b> adding 7 but rod is full? Add 10 (next rod left +1), take 3 away. Because 7 = 10 − 3.",
      ],
      demo: {
        label: "Watch: 47 + 28",
        steps: [
          { value: 0, text: "Start cleared: 0." },
          { value: 47, text: "Set 47: tens rod shows 4, ones rod shows 7." },
          { value: 67, text: "Add the tens of 28 first: 4 tens + 2 tens = 6 tens → 67." },
          { value: 75, text: "Add 8 ones with friends of 10: +10, −2 → ones rod goes 7 → 5. Carry makes 75." },
        ],
      },
      makeQ: (level) => {
        const max = level >= 4 ? 999 : level >= 3 ? 199 : level >= 2 ? 99 : 20;
        const a = 2 + Math.floor(Math.random() * max);
        const b = 1 + Math.floor(Math.random() * Math.min(max, level >= 3 ? 199 : 50));
        return { a, b, op: "+", answer: a + b };
      },
      hint: (q) => `Set ${q.a}. Add ${q.b} left-to-right. Stuck on a rod? Ask: do I need friends of 5 (makes 5) or friends of 10 (makes 10)?`,
    },
    subtract: {
      title: "Subtraction on the Soroban",
      intro: "Subtraction slides beads away from the beam. If a rod doesn't have enough, borrow from the left neighbor and give back the friend.",
      points: [
        "<b>Direct take:</b> enough beads on the beam? Slide them away. 8 − 3 → slide 3 earth beads down.",
        "<b>Borrow 5:</b> 7 − 4? Take 5 (heaven up), give 1 back. Because −4 = −5 + 1.",
        "<b>Borrow 10:</b> 52 − 8? Take 10 (left rod −1), give 2 back. Because −8 = −10 + 2.",
      ],
      demo: {
        label: "Watch: 83 − 27",
        steps: [
          { value: 0, text: "Start cleared: 0." },
          { value: 83, text: "Set 83: 8 tens, 3 ones." },
          { value: 63, text: "Subtract tens of 27: 8 tens − 2 tens = 6 tens → 63." },
          { value: 56, text: "Subtract 7 ones with borrow: −10, +3 → 63 → 56. Answer 56!" },
        ],
      },
      makeQ: (level) => {
        const max = level >= 4 ? 999 : level >= 3 ? 199 : level >= 2 ? 99 : 20;
        const a = 5 + Math.floor(Math.random() * max);
        const b = 1 + Math.floor(Math.random() * Math.min(a - 1, 99));
        return { a, b, op: "-", answer: a - b };
      },
      hint: (q) => `Set ${q.a}. Take ${q.b} away. Not enough beads? Borrow 10 from the left rod and give back ${10 - (q.b % 10 || 10) === 10 ? "the friend" : "the friend (" + ((10 - (q.b % 10)) % 10) + ")"}.`,
    },
    multiply: {
      title: "Multiplication = speedy adding",
      intro: "On the abacus, multiplication is repeated addition with smart rod-jumping. For 6th grade, master 2-digit × 1-digit, then grow.",
      points: [
        "<b>Groups:</b> 23 × 3 means three groups of 23. Add 23 three times and watch rods grow.",
        "<b>Split it:</b> 23 × 3 = (20 × 3) + (3 × 3) = 60 + 9. Do tens rod first, ones rod second.",
        "<b>Place it:</b> multiplying by tens? Shift one rod left. 23 × 30 = 23 × 3, then ×10.",
      ],
      demo: {
        label: "Watch: 23 × 3",
        steps: [
          { value: 0, text: "Start cleared." },
          { value: 23, text: "First group of 23 → 23." },
          { value: 46, text: "Second group: +23 → 46." },
          { value: 69, text: "Third group: +23 → 69. So 23 × 3 = 69!" },
        ],
      },
      makeQ: (level) => {
        if (level <= 1) {
          const a = 2 + Math.floor(Math.random() * 8), b = 2 + Math.floor(Math.random() * 5);
          return { a, b, op: "×", answer: a * b };
        }
        if (level <= 3) {
          const a = 11 + Math.floor(Math.random() * 20), b = 2 + Math.floor(Math.random() * 6);
          return { a, b, op: "×", answer: a * b };
        }
        const a = 12 + Math.floor(Math.random() * 40), b = 3 + Math.floor(Math.random() * 9);
        return { a, b, op: "×", answer: a * b };
      },
      hint: (q) => `Split ${q.a} × ${q.b}: do (${Math.floor(q.a / 10) * 10} × ${q.b}) on the tens side, then (${q.a % 10} × ${q.b}) on the ones side, and add them.`,
    },
    divide: {
      title: "Division = fair sharing",
      intro: "Division deals beads into equal groups. Ask: how many groups of the divisor fit? Deal, count, and the leftover is the remainder.",
      points: [
        "<b>Share:</b> 48 ÷ 4 → deal 48 into 4 equal piles. Each pile gets 12.",
        "<b>Subtract-count:</b> how many 6s fit in 54? Keep subtracting 6 on the abacus and count: 9 times!",
        "<b>Leftovers:</b> 50 ÷ 6 = 8 remainder 2. The 2 beads left can't make another group of 6.",
      ],
      demo: {
        label: "Watch: 48 ÷ 4",
        steps: [
          { value: 48, text: "Set 48 to share." },
          { value: 36, text: "Deal 4 to each of… wait, easier: share tens first. 4 tens ÷ 4 = 1 ten each → 12 each so far." },
          { value: 12, text: "Now share 8 ones ÷ 4 = 2 each." },
          { value: 12, text: "Each group holds 12. So 48 ÷ 4 = 12!" },
        ],
      },
      makeQ: (level) => {
        const b = 2 + Math.floor(Math.random() * (level >= 3 ? 9 : 6));
        const ans = 2 + Math.floor(Math.random() * (level >= 3 ? 25 : 12));
        return { a: b * ans, b, op: "÷", answer: ans };
      },
      hint: (q) => `Ask: how many ${q.b}s fit in ${q.a}? Subtract ${q.b} again and again on the abacus, counting each subtraction.`,
    },
  };

  function renderLesson(key, section) {
    const L = LESSONS[key];
    section.innerHTML = `
      <h2>${L.title}</h2>
      <p class="lede">${L.intro}</p>
      <div class="steps"><ol>${L.points.map((p) => `<li>${p}</li>`).join("")}</ol></div>
      <h3>${L.demo.label}</h3>
      <div id="demo-${key}"></div>
      <p class="readout">Demo value: <b id="demo-${key}-value">0</b></p>
      <p id="demo-${key}-text" class="lede"></p>
      <div class="step-viewer">
        <button class="btn ghost" id="demo-${key}-prev">← Back</button>
        <span id="demo-${key}-pos" class="muted"></span>
        <button class="btn" id="demo-${key}-next">Next →</button>
      </div>
      <h3>Try one yourself</h3>
      <div class="practice-row">
        <span id="pq-${key}" class="big-q">—</span>
        <input id="pa-${key}" inputmode="numeric" autocomplete="off" placeholder="answer" style="width:140px;font-size:1.2rem" />
        <button class="btn" id="pc-${key}">Check</button>
        <button class="btn ghost" id="pn-${key}">New</button>
        <button class="btn ghost" id="ph-${key}">Abacus hint</button>
      </div>
      <p id="pf-${key}" aria-live="polite"></p>
    `;

    const ab = window.Abacus.create(document.getElementById(`demo-${key}`), { rods: 5 });
    let idx = 0;
    const valEl = document.getElementById(`demo-${key}-value`);
    const txtEl = document.getElementById(`demo-${key}-text`);
    const posEl = document.getElementById(`demo-${key}-pos`);
    function show(i) {
      idx = Math.min(L.demo.steps.length - 1, Math.max(0, i));
      ab.setValue(L.demo.steps[idx].value);
      valEl.textContent = L.demo.steps[idx].value;
      txtEl.textContent = `Step ${idx + 1}/${L.demo.steps.length}: ${L.demo.steps[idx].text}`;
      posEl.textContent = `step ${idx + 1} of ${L.demo.steps.length}`;
    }
    document.getElementById(`demo-${key}-prev`).addEventListener("click", () => show(idx - 1));
    document.getElementById(`demo-${key}-next`).addEventListener("click", () => show(idx + 1));
    show(0);

    let current = null;
    const qEl = document.getElementById(`pq-${key}`);
    const aEl = document.getElementById(`pa-${key}`);
    const fEl = document.getElementById(`pf-${key}`);
    function fresh() {
      current = L.makeQ(window.AbacusFun ? window.AbacusFun.level : 1);
      qEl.textContent = `${current.a} ${current.op} ${current.b} = ?`;
      aEl.value = "";
      fEl.textContent = "";
    }
    document.getElementById(`pn-${key}`).addEventListener("click", fresh);
    document.getElementById(`ph-${key}`).addEventListener("click", () => {
      if (current) fEl.textContent = "🥁 " + L.hint(current);
    });
    document.getElementById(`pc-${key}`).addEventListener("click", () => {
      if (!current) return;
      const gave = Number(aEl.value);
      const ok = gave === current.answer;
      fEl.textContent = ok
        ? `✅ Yes! ${current.a} ${current.op} ${current.b} = ${current.answer}. New one?`
        : `🤔 Not yet — ${L.hint(current)}`;
      if (window.AbacusFun) window.AbacusFun.record({ ...current, gave, correct: ok, digits: String(Math.max(current.a, current.b)).length });
      if (ok) setTimeout(fresh, 1400);
    });
    fresh();
  }

  window.AbacusLessons = { LESSONS, renderLesson };
})();
