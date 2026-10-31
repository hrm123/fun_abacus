/**
 * Offline assessment engine: question banks, adaptive difficulty,
 * learning-style detection, and curriculum building.
 *
 * Works with zero configuration. When an LLM is reachable, App.jsx lets the
 * model author bonus questions and feedback — but scoring and leveling always
 * run through this module so results stay reliable.
 */

export const MATH_ROUNDS = 8;
export const STYLE_ROUNDS = 5;

export const MODES = {
  visual: {
    label: 'Visual',
    icon: '👁',
    blurb: 'learns fastest from pictures, diagrams, and color',
  },
  auditory: {
    label: 'Auditory',
    icon: '🎧',
    blurb: 'learns fastest from hearing and talking through ideas',
  },
  reading: {
    label: 'Reading & Notes',
    icon: '📝',
    blurb: 'learns fastest from written steps and worked examples',
  },
  kinesthetic: {
    label: 'Hands-on',
    icon: '🧱',
    blurb: 'learns fastest from touching, building, and moving (abacus, blocks)',
  },
  game: {
    label: 'Game-based',
    icon: '🎮',
    blurb: 'learns fastest from challenges, points, and playful stories',
  },
  memory: {
    label: 'Memory & Drill',
    icon: '🧠',
    blurb: 'learns fastest from repetition, flashcards, and patterns',
  },
};

// ---------------------------------------------------------------------------
// Math question bank (built-in fallback; LLM may author extras on top)
// grade: US grade the skill is taught in. difficulty: 1-3 within the bank.
// kind: 'mcq' | 'numeric' | 'puzzle'
// ---------------------------------------------------------------------------
export const MATH_BANK = [
  {
    id: 'g5-frac', grade: 5, topic: 'Fractions', difficulty: 1, kind: 'mcq',
    prompt: 'Which fraction is the largest?',
    choices: ['1/4', '1/3', '1/6', '1/8'],
    answerIndex: 1,
    explanation: 'With the same numerator, the smaller denominator wins: thirds are bigger than fourths, sixths, or eighths.',
  },
  {
    id: 'g5-dec', grade: 5, topic: 'Decimals', difficulty: 1, kind: 'mcq',
    prompt: 'What is 0.4 + 0.35?',
    choices: ['0.39', '0.75', '0.70', '0.075'],
    answerIndex: 1,
    explanation: '0.4 is 0.40, and 0.40 + 0.35 = 0.75.',
  },
  {
    id: 'g5-vol', grade: 5, topic: 'Volume', difficulty: 2, kind: 'puzzle',
    prompt: 'A box holds cubes in 3 layers. Each layer is 4 cubes long and 2 cubes wide. How many cubes fill the box?',
    choices: ['9', '14', '18', '24'],
    answerIndex: 3,
    explanation: 'Each layer has 4 × 2 = 8 cubes, and 3 layers give 3 × 8 = 24.',
  },
  {
    id: 'g6-ratio', grade: 6, topic: 'Ratios', difficulty: 1, kind: 'mcq',
    prompt: 'A recipe uses 2 cups of flour for every 3 cups of sugar. How much flour goes with 9 cups of sugar?',
    choices: ['4 cups', '5 cups', '6 cups', '11 cups'],
    answerIndex: 2,
    explanation: '9 is 3 × 3, so scale the flour too: 2 × 3 = 6 cups.',
  },
  {
    id: 'g6-neg', grade: 6, topic: 'Negative numbers', difficulty: 2, kind: 'mcq',
    prompt: 'The temperature is -4°C and falls 5 more degrees. What is it now?',
    choices: ['1°C', '-1°C', '-9°C', '9°C'],
    answerIndex: 2,
    explanation: '-4 − 5 moves further below zero: -9°C.',
  },
  {
    id: 'g6-expr', grade: 6, topic: 'Expressions', difficulty: 2, kind: 'numeric',
    prompt: 'If n = 7, what is the value of 3n − 5? (type the number)',
    numericAnswer: 16,
    explanation: '3 × 7 − 5 = 21 − 5 = 16.',
  },
  {
    id: 'g6-area', grade: 6, topic: 'Area', difficulty: 2, kind: 'puzzle',
    prompt: 'A triangle has base 10 cm and height 6 cm. What is its area?',
    choices: ['16 cm²', '30 cm²', '32 cm²', '60 cm²'],
    answerIndex: 1,
    explanation: 'Area = (base × height) ÷ 2 = (10 × 6) ÷ 2 = 30 cm².',
  },
  {
    id: 'g7-prop', grade: 7, topic: 'Proportions', difficulty: 2, kind: 'mcq',
    prompt: 'A car travels 150 miles in 3 hours at a steady speed. How far in 5 hours?',
    choices: ['200 miles', '230 miles', '250 miles', '300 miles'],
    answerIndex: 2,
    explanation: 'Speed is 150 ÷ 3 = 50 mph, so 5 × 50 = 250 miles.',
  },
  {
    id: 'g7-pct', grade: 7, topic: 'Percents', difficulty: 2, kind: 'numeric',
    prompt: 'A $40 game is 25% off. What is the sale price in dollars? (type the number)',
    numericAnswer: 30,
    explanation: '25% of $40 is $10, so $40 − $10 = $30.',
  },
  {
    id: 'g7-eq', grade: 7, topic: 'Equations', difficulty: 3, kind: 'mcq',
    prompt: 'Solve: 2x + 6 = 18. What is x?',
    choices: ['5', '6', '7', '12'],
    answerIndex: 1,
    explanation: 'Subtract 6: 2x = 12, then divide by 2: x = 6.',
  },
  {
    id: 'g7-prob', grade: 8, topic: 'Probability', difficulty: 2, kind: 'puzzle',
    prompt: 'A bag has 3 red and 2 blue marbles. You pick one without looking. What is P(red)?',
    choices: ['1/5', '2/5', '3/5', '3/2'],
    answerIndex: 2,
    explanation: '3 red out of 5 total marbles: 3/5.',
  },
  {
    id: 'g8-slope', grade: 8, topic: 'Slope', difficulty: 3, kind: 'mcq',
    prompt: 'A line passes through (0, 1) and (2, 7). What is its slope?',
    choices: ['2', '3', '4', '6'],
    answerIndex: 1,
    explanation: 'Slope = rise ÷ run = (7 − 1) ÷ (2 − 0) = 6 ÷ 2 = 3.',
  },
  {
    id: 'g8-sys', grade: 8, topic: 'Systems', difficulty: 3, kind: 'mcq',
    prompt: 'x + y = 10 and x − y = 4. What is x?',
    choices: ['3', '5', '7', '14'],
    answerIndex: 2,
    explanation: 'Add the equations: 2x = 14, so x = 7.',
  },
  {
    id: 'g8-pyth', grade: 8, topic: 'Pythagoras', difficulty: 3, kind: 'puzzle',
    prompt: 'A right triangle has legs 6 and 8. What is the hypotenuse?',
    choices: ['10', '12', '14', '48'],
    answerIndex: 0,
    explanation: '6² + 8² = 36 + 64 = 100, and √100 = 10.',
  },
  {
    id: 'g8-func', grade: 8, topic: 'Functions', difficulty: 3, kind: 'mcq',
    prompt: 'f(x) = 2x² − 3. What is f(3)?',
    choices: ['9', '15', '18', '33'],
    answerIndex: 1,
    explanation: 'f(3) = 2 × 9 − 3 = 18 − 3 = 15.',
  },
  {
    id: 'g5-fact', grade: 5, topic: 'Factors', difficulty: 1, kind: 'numeric',
    prompt: 'What is the greatest common factor of 12 and 18? (type the number)',
    numericAnswer: 6,
    explanation: 'Factors of 12: 1,2,3,4,6,12. Of 18: 1,2,3,6,9,18. Greatest shared: 6.',
  },
];

// ---------------------------------------------------------------------------
// Learning-style probe bank. Each choice awards points to one or two modes.
// ---------------------------------------------------------------------------
export const STYLE_BANK = [
  {
    id: 's1', prompt: 'Your teacher explains a brand-new idea. What helps you MOST?',
    choices: [
      { text: 'A colorful diagram or animation', modes: ['visual', 'visual'] },
      { text: 'Hearing it explained out loud', modes: ['auditory', 'auditory'] },
      { text: 'Reading steps I can re-read', modes: ['reading', 'reading'] },
      { text: 'Trying it with objects I can touch', modes: ['kinesthetic', 'kinesthetic'] },
    ],
  },
  {
    id: 's2', prompt: 'You need to memorize the times tables. You would…',
    choices: [
      { text: 'Turn it into a game with points and levels', modes: ['game', 'game'] },
      { text: 'Drill flashcards until it sticks', modes: ['memory', 'memory'] },
      { text: 'Chant them aloud like a song', modes: ['auditory', 'memory'] },
      { text: 'Draw a big colorful poster of them', modes: ['visual', 'reading'] },
    ],
  },
  {
    id: 's3', prompt: 'Which of these sounds like the most fun way to learn fractions?',
    choices: [
      { text: 'Slicing pretend pizzas and pies', modes: ['kinesthetic', 'game'] },
      { text: 'A storybook adventure with fraction heroes', modes: ['visual', 'reading'] },
      { text: 'A race-against-the-clock quiz app', modes: ['game', 'memory'] },
      { text: 'A podcast where kids talk through problems', modes: ['auditory', 'auditory'] },
    ],
  },
  {
    id: 's4', prompt: 'When you get stuck on homework, what do you do first?',
    choices: [
      { text: 'Sketch the problem out on paper', modes: ['visual', 'kinesthetic'] },
      { text: 'Ask someone to talk it through with me', modes: ['auditory', 'auditory'] },
      { text: 'Look up a worked example and copy the steps', modes: ['reading', 'memory'] },
      { text: 'Grab coins, blocks, or an abacus and act it out', modes: ['kinesthetic', 'kinesthetic'] },
    ],
  },
  {
    id: 's5', prompt: 'Pick the reward that would motivate you most:',
    choices: [
      { text: 'Unlocking badges and leaderboard spots', modes: ['game', 'game'] },
      { text: 'A perfect streak on daily drills', modes: ['memory', 'memory'] },
      { text: 'Making a beautiful notebook of my work', modes: ['reading', 'visual'] },
      { text: 'Teaching the idea to a friend out loud', modes: ['auditory', 'kinesthetic'] },
    ],
  },
];

// ---------------------------------------------------------------------------
// Adaptive math engine
// ---------------------------------------------------------------------------

/** Pick the next bank question: start near the student's grade, move up on success. */
export function pickNextQuestion(askedIds, history, startGrade = 6) {
  const remaining = MATH_BANK.filter((q) => !askedIds.has(q.id));
  if (remaining.length === 0) return null;

  let target = Math.min(8, Math.max(5, startGrade));
  if (history.length > 0) {
    const recent = history.slice(-3);
    const wins = recent.filter((h) => h.correct).length;
    const lastGrade = history[history.length - 1].question.grade;
    target = wins >= 2 ? lastGrade + 1 : wins === 0 ? lastGrade - 1 : lastGrade;
    target = Math.min(8, Math.max(5, target));
  }

  remaining.sort(
    (a, b) =>
      Math.abs(a.grade - target) - Math.abs(b.grade - target) ||
      a.difficulty - b.difficulty
  );
  // Slight variety: among equally close questions prefer an unseen topic.
  const seenTopics = new Set(history.map((h) => h.question.topic));
  const fresh = remaining.find((q) => !seenTopics.has(q.topic));
  return fresh && Math.abs(fresh.grade - target) <= 1 ? fresh : remaining[0];
}

export function checkAnswer(question, picked) {
  if (question.kind === 'numeric') {
    return Number(String(picked).trim()) === question.numericAnswer;
  }
  return picked === question.answerIndex;
}

export function correctChoiceText(question) {
  if (question.kind === 'numeric') return String(question.numericAnswer);
  return question.choices[question.answerIndex];
}

/** Estimated grade band + per-topic mastery from answer history. */
export function estimateLevel(history) {
  const topics = {};
  for (const h of history) {
    const t = (topics[h.question.topic] = topics[h.question.topic] || {
      correct: 0,
      total: 0,
      grade: h.question.grade,
    });
    t.total += 1;
    if (h.correct) t.correct += 1;
  }
  const scored = history.map((h) => (h.correct ? h.question.grade + 0.5 : h.question.grade - 1));
  const avg = scored.length ? scored.reduce((a, b) => a + b, 0) / scored.length : 5;
  const band = Math.min(8, Math.max(5, Math.round(avg)));
  const accuracy = history.length
    ? Math.round((history.filter((h) => h.correct).length / history.length) * 100)
    : 0;
  return { band, accuracy, topics };
}

/** Rank learning modes from style answers. */
export function detectStyles(styleHistory) {
  const scores = Object.fromEntries(Object.keys(MODES).map((m) => [m, 0]));
  for (const h of styleHistory) {
    for (const m of h.picked.modes) scores[m] = (scores[m] || 0) + 1;
  }
  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .map(([mode, score]) => ({ mode, score }));
}

// ---------------------------------------------------------------------------
// Curriculum builder: from current band to full 8th-grade mastery.
// Each unit names the delivery mode(s) matched to the student's top styles.
// ---------------------------------------------------------------------------

const UNITS = [
  { id: 'u1', grade: 5, title: 'Fractions, decimals & volume', topics: 'Equivalent fractions, decimal operations, volume of boxes', weeks: 3 },
  { id: 'u2', grade: 6, title: 'Ratios, negatives & expressions', topics: 'Ratios and unit rates, negative numbers, expressions with variables', weeks: 4 },
  { id: 'u3', grade: 7, title: 'Proportions, percents & equations', topics: 'Proportional reasoning, percents, one- and two-step equations', weeks: 4 },
  { id: 'u4', grade: 8, title: 'Linear thinking', topics: 'Slope, graphing lines, functions', weeks: 4 },
  { id: 'u5', grade: 8, title: 'Advanced 8th grade', topics: 'Systems of equations, Pythagoras, probability, exponents', weeks: 4 },
];

const MODE_ACTIVITIES = {
  visual: 'animated video lessons + color-coded diagram worksheets',
  auditory: 'listen-and-repeat mini-podcasts + explain-it-back loud practice',
  reading: 'step-by-step study notes + worked-example journals',
  kinesthetic: 'hands-on kits: abacus, fraction tiles, algebra blocks',
  game: 'leveled quest app with points, badges, and story missions',
  memory: 'spaced-repetition flashcards + daily 5-minute speed drills',
};

export function buildCurriculum(level, rankedStyles) {
  const top = rankedStyles.filter((s) => s.score > 0).slice(0, 2);
  const modes = top.length ? top.map((s) => s.mode) : ['visual', 'game'];
  const startGrade = Math.min(level.band, 8);
  const units = UNITS.filter((u) => u.grade >= startGrade || u.id === `u${startGrade - 4}`).map(
    (u, i) => ({
      ...u,
      phase: i === 0 ? 'Catch up & strengthen' : i === 1 ? 'Build forward' : 'Master',
      delivery: modes.map((m) => ({ mode: m, activity: MODE_ACTIVITIES[m] })),
    })
  );
  const totalWeeks = units.reduce((a, u) => a + u.weeks, 0);
  return { units, totalWeeks, modes };
}

export const CANNED_FEEDBACK = {
  correct: [
    'Nice work! You nailed the key idea there.',
    'Exactly right — your reasoning is spot on.',
    'Correct! You are thinking like a mathematician.',
  ],
  incorrect: [
    'Good effort — this one is tricky. Check the explanation in the workspace.',
    'Not quite, but the attempt counts. Read the worked explanation and you will get the next one.',
    'Close! Take a peek at the explanation — the pattern will click.',
  ],
  style: [
    'Noted! That tells me a lot about how you learn best.',
    'Great answer — I am building a picture of your learning style.',
    'Thanks! Every answer helps me personalize your path.',
  ],
};

export function cannedReply(kind) {
  const pool = CANNED_FEEDBACK[kind];
  return pool[Math.floor(Math.random() * pool.length)];
}
