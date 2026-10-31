import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Navbar from './components/Navbar.jsx';
import ChatPanel from './components/ChatPanel.jsx';
import { QuestionCard, ProgressRail, StyleMeter } from './components/Workspace.jsx';
import CurriculumView from './components/CurriculumView.jsx';
import SettingsModal from './components/SettingsModal.jsx';
import {
  MATH_BANK,
  STYLE_BANK,
  MATH_ROUNDS,
  STYLE_ROUNDS,
  pickNextQuestion,
  checkAnswer,
  correctChoiceText,
  estimateLevel,
  detectStyles,
  buildCurriculum,
  cannedReply,
} from './lib/assessment.js';
import {
  loadSettings,
  saveSettings,
  activeProvider,
  testConnection,
  generateMathQuestion,
  feedbackOnAnswer,
  freeChat,
  curriculumNarrative,
} from './lib/ai.js';

const THEME_KEY = 'easymath-theme';
const DAY_THEME = 'emerald';
const NIGHT_THEME = 'night';

function useTheme() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem(THEME_KEY) || DAY_THEME;
    } catch {
      return DAY_THEME;
    }
  });
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);
  return [theme, () => setTheme((t) => (t === NIGHT_THEME ? DAY_THEME : NIGHT_THEME))];
}

export default function App() {
  const [theme, toggleTheme] = useTheme();
  const [settings, setSettings] = useState(loadSettings);
  const [providerUp, setProviderUp] = useState(null); // null = unknown, true/false = probed
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [phase, setPhase] = useState('welcome'); // welcome | assess | report
  const [grade, setGrade] = useState(6);
  const [stage, setStage] = useState('math'); // math | style
  const [item, setItem] = useState(null); // { card:'math'|'style', question, aiAuthored }
  const [answered, setAnswered] = useState(false);
  const [picked, setPicked] = useState(null);
  const [askedIds, setAskedIds] = useState(() => new Set());
  const [mathHistory, setMathHistory] = useState([]);
  const [styleHistory, setStyleHistory] = useState([]);
  const [styleIndex, setStyleIndex] = useState(0);
  const [streak, setStreak] = useState(0);
  const [loadingQ, setLoadingQ] = useState(false);

  const [messages, setMessages] = useState([
    {
      from: 'bot',
      text: "Hi! I'm Matty, your math coach. I'll ask you some fun math questions and puzzles to find your level, learn how YOU learn best, and then build your personal path to 8th-grade math. Ready when you are!",
    },
  ]);
  const [typing, setTyping] = useState(false);
  const [report, setReport] = useState(null);
  const [narrative, setNarrative] = useState('');
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  const provider = useMemo(() => {
    if (providerUp === false) return 'offline';
    return activeProvider(settings);
  }, [settings, providerUp]);

  const probe = useCallback(async (s) => {
    const result = await testConnection(s);
    setProviderUp(result.ok);
    return result;
  }, []);

  useEffect(() => {
    probe(loadSettings());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const say = useCallback((text) => {
    setMessages((m) => [...m, { from: 'bot', text }]);
  }, []);

  const updateSettings = (next) => {
    setSettings(next);
    saveSettings(next);
    setProviderUp(null);
  };

  const closeSettings = () => {
    setSettingsOpen(false);
    probe(settings);
  };

  // -- assessment flow ------------------------------------------------------

  const nextMathItem = useCallback(
    async (ids, history) => {
      setLoadingQ(true);
      const bankPick = pickNextQuestion(ids, history, grade);
      let finalPick = bankPick;
      let aiAuthored = false;
      // On even rounds, let the AI author a fresh variant on the same topic.
      if (bankPick && history.length % 2 === 1) {
        const aiQ = await generateMathQuestion(settings, {
          topic: bankPick.topic,
          grade: bankPick.grade,
          difficulty: ['easy', 'medium', 'hard'][bankPick.difficulty - 1] || 'medium',
          avoid: bankPick.prompt,
        });
        if (aiQ) {
          finalPick = {
            id: `ai-${Date.now()}`,
            grade: bankPick.grade,
            topic: bankPick.topic,
            difficulty: bankPick.difficulty,
            kind: 'mcq',
            ...aiQ,
          };
          aiAuthored = true;
        }
      }
      if (finalPick) {
        setAskedIds((prev) => new Set(prev).add(finalPick.id));
        setItem({ card: 'math', question: finalPick, aiAuthored });
        setAnswered(false);
        setPicked(null);
      }
      setLoadingQ(false);
      return finalPick;
    },
    [settings, grade]
  );

  const startAssessment = async () => {
    setPhase('assess');
    setStage('math');
    setAskedIds(new Set());
    setMathHistory([]);
    setStyleHistory([]);
    setStyleIndex(0);
    setStreak(0);
    setReport(null);
    setNarrative('');
    say(
      `Awesome — let's go! First, ${MATH_ROUNDS} quick math questions. They get easier or harder based on your answers, so just try your best. No grades here, only discovery!`
    );
    await nextMathItem(new Set(), []);
  };

  const beginStyleStage = (mathHist) => {
    setStage('style');
    const q = STYLE_BANK[0];
    setItem({ card: 'style', question: q, aiAuthored: false });
    setAnswered(false);
    setPicked(null);
    setStyleIndex(0);
    const level = estimateLevel(mathHist);
    say(
      `Math round complete — you're showing grade-${level.band} skills! Now ${STYLE_ROUNDS} quick questions about HOW you like to learn (pictures? games? hands-on tools like an abacus?). There are no wrong answers here.`
    );
  };

  const finishAssessment = async (mathHist, styleHist) => {
    const level = estimateLevel(mathHist);
    const ranked = detectStyles(styleHist);
    const curriculum = buildCurriculum(level, ranked);
    setReport({ level, rankedStyles: ranked, curriculum });
    setPhase('report');
    setTyping(true);
    const profile = {
      gradeBand: level.band,
      accuracy: level.accuracy,
      topModes: ranked.slice(0, 3).map((r) => r.mode),
      weeks: curriculum.totalWeeks,
    };
    const note = await curriculumNarrative(settings, profile);
    setTyping(false);
    if (note) setNarrative(note);
    say(
      `Your personal curriculum is ready! You're at grade-${level.band} level, you learn best through ${ranked
        .slice(0, 2)
        .map((r) => r.mode)
        .join(' + ')}, and your path to 8th-grade mastery is about ${curriculum.totalWeeks} weeks. Check the workspace!`
    );
  };

  const answerCurrent = async (choice) => {
    if (!item || answered) return;
    setAnswered(true);
    setPicked(choice);

    if (item.card === 'style') {
      const pickedChoice = item.question.choices[choice];
      const next = [...styleHistory, { question: item.question, picked: pickedChoice }];
      setStyleHistory(next);
      say(cannedReply('style'));
      return;
    }

    const correct = checkAnswer(item.question, choice);
    const next = [...mathHistory, { question: item.question, picked: choice, correct }];
    setMathHistory(next);
    setStreak((s) => (correct ? s + 1 : 0));

    setTyping(true);
    const aiFeedback = await feedbackOnAnswer(settings, {
      prompt: item.question.prompt,
      choices: item.question.choices ?? [],
      correctChoice: correctChoiceText(item.question),
      pickedChoice:
        item.question.kind === 'numeric' ? String(choice) : item.question.choices[choice],
      wasCorrect: correct,
    });
    setTyping(false);
    say(aiFeedback || cannedReply(correct ? 'correct' : 'incorrect'));
  };

  const advance = async () => {
    if (stage === 'math') {
      if (mathHistory.length >= MATH_ROUNDS) {
        beginStyleStage(mathHistory);
      } else {
        await nextMathItem(askedIds, mathHistory);
      }
      return;
    }
    // style stage
    if (styleHistory.length >= STYLE_ROUNDS) {
      await finishAssessment(mathHistory, styleHistory);
    } else {
      const q = STYLE_BANK[styleHistory.length];
      setStyleIndex(styleHistory.length);
      setItem({ card: 'style', question: q, aiAuthored: false });
      setAnswered(false);
      setPicked(null);
    }
  };

  // -- free chat ------------------------------------------------------------

  const offlineChatReply = (text) => {
    const t = text.toLowerCase();
    if (/(hint|help|stuck|don't know|dont know)/.test(t) && item && !answered && phase === 'assess') {
      if (item.card === 'style') return 'No hints needed here — just pick whatever sounds most like you!';
      return `Here's a nudge: re-read the question slowly and look for the key numbers. ${item.question.topic} problems like this usually need just one or two steps. Give it your best shot!`;
    }
    if (/(who are you|your name)/.test(t)) return "I'm Matty, your EasyMath coach! I help figure out your math level and how you learn best.";
    if (/(thank|thanks)/.test(t)) return "You're so welcome! Keep going — you're doing great.";
    if (/(bye|goodbye)/.test(t)) return 'Goodbye for now! Come back anytime to keep practicing.';
    if (phase === 'report') return 'Your curriculum is in the workspace! Want to retake the assessment, or ask me about any topic on your path?';
    if (phase === 'assess') return 'Good question! For now, focus on the card in the workspace — answer it and hit Next, and I\'ll keep guiding you.';
    return 'Hi! Press "Start assessment" in the workspace and we\'ll discover your math level and learning style together.';
  };

  const sendChat = async (text) => {
    setMessages((m) => [...m, { from: 'user', text }]);
    setTyping(true);
    const history = messagesRef.current
      .slice(-8)
      .map((m) => ({ role: m.from === 'bot' ? 'assistant' : 'user', content: m.text }));
    const context = `phase=${phase}, stage=${stage}, grade=${grade}, math answered=${mathHistory.length}/${MATH_ROUNDS}, style answered=${styleHistory.length}/${STYLE_ROUNDS}`;
    const reply = await freeChat(settings, history, text, context);
    setTyping(false);
    say(reply || offlineChatReply(text));
  };

  // -- derived ---------------------------------------------------------------

  const accuracy =
    mathHistory.length > 0
      ? Math.round((mathHistory.filter((h) => h.correct).length / mathHistory.length) * 100)
      : null;
  const liveStyles = useMemo(() => detectStyles(styleHistory), [styleHistory]);
  const roundLabel =
    stage === 'math'
      ? `Math ${Math.min(mathHistory.length + 1, MATH_ROUNDS)}/${MATH_ROUNDS}`
      : `Style ${Math.min(styleHistory.length + 1, STYLE_ROUNDS)}/${STYLE_ROUNDS}`;

  return (
    <div className="h-full flex flex-col bg-base-100">
      <Navbar
        theme={theme}
        onToggleTheme={toggleTheme}
        provider={provider}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <main className="flex-1 min-h-0 grid gap-3 p-3 sm:p-4 lg:grid-cols-5 max-w-7xl w-full mx-auto">
        {/* Working window */}
        <div className="lg:col-span-3 min-h-0 flex flex-col gap-3 overflow-y-auto workspace-scroll pr-0.5">
          {phase === 'welcome' && (
            <div className="card bg-base-200 border border-base-300 shadow-sm pattern-dots">
              <div className="card-body gap-4">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Discover your math level &amp; your learning superpower
                </h2>
                <p className="text-base-content/70 max-w-xl">
                  Answer a few questions and puzzles. Matty adapts to you, figures out whether
                  you learn fastest by seeing, hearing, playing, building, or drilling — then
                  builds your personal curriculum to 8th-grade mastery.
                </p>
                <ol className="steps steps-vertical sm:steps-horizontal w-full text-sm">
                  <li className="step step-primary">Math check</li>
                  <li className="step step-primary">Learning style</li>
                  <li className="step step-primary">Your curriculum</li>
                </ol>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm font-semibold">I&apos;m in grade:</span>
                  <div className="join" role="group" aria-label="Select your grade">
                    {[5, 6, 7, 8].map((g) => (
                      <button
                        key={g}
                        className={`btn join-item ${grade === g ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setGrade(g)}
                        aria-pressed={grade === g}
                      >
                        {g}th
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <button className="btn btn-primary btn-lg" onClick={startAssessment}>
                    Start assessment →
                  </button>
                </div>
                <p className="text-xs text-base-content/60">
                  AI: {provider === 'meta' ? 'Meta Llama API' : provider === 'ollama' ? 'local Ollama' : 'built-in offline engine'}
                  {providerUp === false && ' (model unreachable — offline engine active)'}. Change
                  it anytime in AI Settings.
                </p>
              </div>
            </div>
          )}

          {phase === 'assess' && (
            <>
              <ProgressRail
                mathDone={mathHistory.length}
                mathTotal={MATH_ROUNDS}
                styleDone={styleHistory.length}
                styleTotal={STYLE_ROUNDS}
                streak={streak}
                accuracy={accuracy}
              />
              {loadingQ || !item ? (
                <div className="card bg-base-100 border border-base-300 shadow-sm">
                  <div className="card-body items-center py-12 gap-3">
                    <span className="loading loading-spinner loading-lg text-primary" />
                    <p className="text-sm text-base-content/60">Matty is picking your next question…</p>
                  </div>
                </div>
              ) : (
                <>
                  <QuestionCard
                    item={item}
                    roundLabel={roundLabel}
                    answered={answered}
                    picked={picked}
                    onAnswer={answerCurrent}
                  />
                  {answered && (
                    <button className="btn btn-primary btn-lg w-full" onClick={advance}>
                      {stage === 'math' && mathHistory.length >= MATH_ROUNDS
                        ? 'See my math results →'
                        : stage === 'style' && styleHistory.length >= STYLE_ROUNDS
                          ? 'Build my curriculum →'
                          : 'Next →'}
                    </button>
                  )}
                </>
              )}
              {styleHistory.length > 0 && <StyleMeter ranked={liveStyles} />}
            </>
          )}

          {phase === 'report' && report && (
            <CurriculumView
              report={report}
              narrative={narrative}
              onRestart={() => {
                setPhase('welcome');
                say("Welcome back! Press Start whenever you'd like to take the assessment again.");
              }}
            />
          )}
        </div>

        {/* Chat window */}
        <div className="lg:col-span-2 min-h-[320px] lg:min-h-0 h-[46vh] lg:h-auto">
          <ChatPanel messages={messages} typing={typing} onSend={sendChat} />
        </div>
      </main>

      <SettingsModal
        open={settingsOpen}
        settings={settings}
        onChange={updateSettings}
        onClose={closeSettings}
      />
    </div>
  );
}
