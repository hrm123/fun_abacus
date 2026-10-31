import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

const META_BASE_URL =
  process.env.META_BASE_URL || "https://api.llama.com/compat/v1";
const META_MODEL =
  process.env.META_MODEL || "Llama-4-Scout-17B-16E-Instruct";
const META_API_KEY = process.env.META_API_KEY || "";

app.use(express.json({ limit: "256kb" }));
app.use(express.static(path.join(__dirname, "public")));

function aiMode() {
  return META_API_KEY ? "meta" : "local";
}

// ---------- Local fallback brain (works with no API key) ----------
const CHEERS = [
  "Nice sliding! Your beads are dancing.",
  "Boom! That rod is glowing.",
  "Sweet moves, abacus star!",
  "You cracked it — high five from Abby!",
  "Beads up! That was smooth thinking.",
];

const TRY_AGAIN = [
  "Almost! Count the beads touching the beam again.",
  "Good try — check each rod's heaven bead (worth 5) plus earth beads.",
  "So close! Read rods right-to-left: ones, tens, hundreds.",
  "Hmm, slide slowly and recount. You've got this!",
];

function localLevel(history) {
  if (!Array.isArray(history) || history.length === 0) {
    return { level: 1, label: "Bead Explorer", next: "Start with 1-digit addition." };
  }
  const recent = history.slice(-12);
  const acc = recent.filter((h) => h.correct).length / recent.length;
  const hard = recent.filter((h) => (h.digits || 1) >= 2).length;
  let level = 1;
  if (acc >= 0.9 && recent.length >= 8 && hard >= 4) level = 5;
  else if (acc >= 0.8 && recent.length >= 6 && hard >= 2) level = 4;
  else if (acc >= 0.7 && recent.length >= 4) level = 3;
  else if (acc >= 0.5 || recent.length >= 3) level = 2;
  const labels = {
    1: "Bead Explorer",
    2: "Rod Runner",
    3: "Complement Captain",
    4: "Place-Value Pro",
    5: "Soroban Star",
  };
  return { level, label: labels[level], accuracy: Math.round(acc * 100) };
}

function localCoachReply({ studentText, context }) {
  const q = context?.question;
  let hint = "";
  if (q && typeof q.a === "number") {
    const op = q.op;
    if (op === "+") {
      hint = `Try it on the abacus: set ${q.a}, then add ${q.b} one rod at a time. If a rod is full, use friends of 10 (like 7 needs 3 more to make 10).`;
    } else if (op === "-") {
      hint = `Set ${q.a} first. Take away ${q.b} slowly — if you need more beads, borrow 10 and give back the friend.`;
    } else if (op === "×") {
      hint = `Think of ${q.a} × ${q.b} as ${q.b} groups of ${q.a}. Add ${q.a} on the abacus ${q.b} times and watch it grow!`;
    } else if (op === "÷") {
      hint = `Share ${q.a} into ${q.b} equal groups. Deal beads one group at a time — how many in each group?`;
    }
  }
  const lower = (studentText || "").toLowerCase();
  if (lower.includes("hint")) {
    return hint || "Slide beads toward the beam to count them. Heaven bead = 5, each earth bead = 1!";
  }
  if (lower.includes("help") || lower.includes("stuck") || lower.includes("hard")) {
    return `${TRY_AGAIN[Math.floor(Math.random() * TRY_AGAIN.length)]} ${hint}`.trim();
  }
  if (lower.includes("thank") || lower.includes("yay") || lower.includes("easy")) {
    return `${CHEERS[Math.floor(Math.random() * CHEERS.length)]} Want a trickier one?`;
  }
  if (hint && Math.random() < 0.6) return `${CHEERS[Math.floor(Math.random() * CHEERS.length)]} ${hint}`;
  return "I'm Abby the Abacus! Ask me for a hint, or tell me what you tried and I'll coach you bead by bead.";
}

async function callMetaChat(messages) {
  const res = await fetch(`${META_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${META_API_KEY}`,
    },
    body: JSON.stringify({
      model: META_MODEL,
      messages,
      max_tokens: 300,
      temperature: 0.7,
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Meta API ${res.status}: ${text.slice(0, 300)}`);
  }
  const data = await res.json();
  const content =
    data?.choices?.[0]?.message?.content ||
    data?.choices?.[0]?.text ||
    "";
  return String(content).trim();
}

const COACH_SYSTEM = `You are Abby, a fun encouraging Soroban abacus tutor for 6th graders who find normal math class confusing.
Rules: keep replies under 80 words. Be warm, playful, never shame mistakes. Always connect hints to the physical abacus: heaven bead = 5, earth beads = 1 each, rods are place values. Prefer guiding questions over giving the answer. Use simple words. No emoji overload (max 1).`;

app.get("/api/status", (req, res) => {
  res.json({ ok: true, ai_mode: aiMode(), model: META_MODEL });
});

app.post("/api/level", async (req, res) => {
  const history = Array.isArray(req.body?.history) ? req.body.history : [];
  const local = localLevel(history);
  if (!META_API_KEY) return res.json({ ...local, ai_mode: "local" });
  try {
    const summary = history
      .slice(-12)
      .map((h) => `${h.a}${h.op}${h.b}=${h.gave} (${h.correct ? "right" : "wrong"})`)
      .join("; ");
    const reply = await callMetaChat([
      {
        role: "system",
        content:
          "You assess a 6th grader's abacus math level. Reply with ONLY JSON: {\"level\": 1-5, \"label\": short fun title, \"next\": one short suggestion}.",
      },
      { role: "user", content: `Recent answers: ${summary || "none yet"}` },
    ]);
    const m = reply.match(/\{[\s\S]*\}/);
    if (m) {
      const parsed = JSON.parse(m[0]);
      return res.json({ ...local, ...parsed, ai_mode: "meta" });
    }
    return res.json({ ...local, ai_mode: "meta" });
  } catch (err) {
    return res.json({ ...local, ai_mode: "local", note: String(err.message || err) });
  }
});

app.post("/api/coach", async (req, res) => {
  const studentText = String(req.body?.message || "").slice(0, 1000);
  const context = req.body?.context || {};
  if (!studentText.trim()) {
    return res.json({
      reply: "Hi! I'm Abby. Set a number on the abacus, then ask me anything!",
      ai_mode: aiMode(),
    });
  }
  if (!META_API_KEY) {
    return res.json({ reply: localCoachReply({ studentText, context }), ai_mode: "local" });
  }
  try {
    const ctx = context?.question
      ? `Current problem: ${context.question.a} ${context.question.op} ${context.question.b}. Student level: ${context.level || 1}. Streak: ${context.streak || 0}.`
      : `Student level: ${context.level || 1}.`;
    const reply = await callMetaChat([
      { role: "system", content: COACH_SYSTEM },
      { role: "user", content: `${ctx}\nStudent says: ${studentText}` },
    ]);
    res.json({ reply: reply || localCoachReply({ studentText, context }), ai_mode: "meta" });
  } catch (err) {
    res.json({
      reply: localCoachReply({ studentText, context }),
      ai_mode: "local",
      note: "Meta API unreachable, used local coach.",
    });
  }
});

const HOST = process.env.HOST || "127.0.0.1";
app.listen(PORT, HOST, () => {
  console.log(`Abacus Fun running at http://${HOST}:${PORT} (ai_mode=${aiMode()})`);
});
