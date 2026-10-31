import React, { useState } from 'react';
import { MODES } from '../lib/assessment.js';

function ChoiceButton({ index, text, state, onPick, disabled }) {
  const letters = ['A', 'B', 'C', 'D'];
  const cls =
    state === 'correct'
      ? 'btn-success'
      : state === 'wrong'
        ? 'btn-error'
        : state === 'dim'
          ? 'btn-ghost opacity-50'
          : 'btn-outline';
  return (
    <button
      className={`btn ${cls} justify-start h-auto min-h-12 py-3 px-4 text-left normal-case text-sm sm:text-base font-medium`}
      disabled={disabled}
      onClick={() => onPick(index)}
    >
      <span className="badge badge-sm shrink-0">{letters[index] ?? index + 1}</span>
      <span className="whitespace-normal">{text}</span>
    </button>
  );
}

function NumericInput({ onSubmit, disabled }) {
  const [value, setValue] = useState('');
  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (value.trim() !== '') onSubmit(value.trim());
      }}
    >
      <input
        className="input input-bordered input-lg flex-1 text-center text-2xl font-semibold"
        placeholder="?"
        inputMode="decimal"
        value={value}
        disabled={disabled}
        onChange={(e) => setValue(e.target.value)}
        aria-label="Your numeric answer"
      />
      <button type="submit" className="btn btn-primary btn-lg" disabled={disabled || value.trim() === ''}>
        Check
      </button>
    </form>
  );
}

function FractionBars({ seed }) {
  // Decorative-but-instructive visual for puzzle/mcq flavor (deterministic per question).
  const bars = [
    { parts: 4, fill: (seed % 4) + 1, label: '1/4 each' },
    { parts: 3, fill: ((seed + 1) % 3) + 1, label: '1/3 each' },
  ];
  return (
    <div className="flex gap-6 justify-center py-1" aria-hidden="true">
      {bars.map((b, i) => (
        <div key={i} className="text-center">
          <div className="flex gap-1">
            {Array.from({ length: b.parts }).map((_, p) => (
              <div
                key={p}
                className={`w-8 h-8 rounded-md border-2 ${
                  p < b.fill ? 'bg-primary border-primary' : 'border-base-300 bg-base-200'
                }`}
              />
            ))}
          </div>
          <div className="text-xs text-base-content/50 mt-1">
            {b.fill}/{b.parts}
          </div>
        </div>
      ))}
    </div>
  );
}

export function QuestionCard({ item, roundLabel, answered, picked, onAnswer }) {
  const isStyle = item.card === 'style';
  const showVisual = !isStyle && item.question.kind === 'puzzle';
  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm">
      <div className="card-body gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="badge badge-primary badge-sm">{roundLabel}</span>
          {!isStyle && <span className="badge badge-outline badge-sm">{item.question.topic}</span>}
          {!isStyle && item.question.kind === 'puzzle' && (
            <span className="badge badge-accent badge-sm">🧩 puzzle</span>
          )}
          {isStyle && <span className="badge badge-secondary badge-sm">learning style</span>}
          {!isStyle && item.aiAuthored && (
            <span className="badge badge-ghost badge-sm" title="Authored live by the AI tutor">
              ✨ AI-authored
            </span>
          )}
        </div>

        <h3 className="text-lg sm:text-xl font-semibold leading-snug">{item.question.prompt}</h3>

        {showVisual && (
          <FractionBars seed={item.question.prompt.length + item.question.grade} />
        )}

        {item.question.kind === 'numeric' && !isStyle ? (
          <NumericInput onSubmit={onAnswer} disabled={answered} />
        ) : (
          <div className="grid gap-2">
            {item.question.choices.map((c, i) => {
              const text = isStyle ? c.text : c;
              let state = 'idle';
              if (answered) {
                if (isStyle) state = i === picked ? 'correct' : 'dim';
                else if (i === item.question.answerIndex) state = 'correct';
                else if (i === picked) state = 'wrong';
                else state = 'dim';
              }
              return (
                <ChoiceButton
                  key={i}
                  index={i}
                  text={text}
                  state={state}
                  disabled={answered}
                  onPick={onAnswer}
                />
              );
            })}
          </div>
        )}

        {answered && !isStyle && item.question.explanation && (
          <div className="alert alert-info text-sm">
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4m0-4h.01" />
            </svg>
            <span>
              <strong>Why: </strong>
              {item.question.explanation}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function ProgressRail({ mathDone, mathTotal, styleDone, styleTotal, streak, accuracy }) {
  const total = mathTotal + styleTotal;
  const done = mathDone + styleDone;
  const pct = Math.round((done / total) * 100);
  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm">
      <div className="card-body py-4 gap-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">Assessment progress</span>
          <span className="text-base-content/60">
            {done}/{total}
          </span>
        </div>
        <progress className="progress progress-primary w-full" value={pct} max="100" aria-label={`${pct}% complete`} />
        <div className="flex gap-2 flex-wrap text-xs">
          <span className="badge badge-outline">📐 Math {mathDone}/{mathTotal}</span>
          <span className="badge badge-outline">🎧 Style {styleDone}/{styleTotal}</span>
          {streak >= 2 && <span className="badge badge-warning">🔥 streak ×{streak}</span>}
          {accuracy != null && <span className="badge badge-ghost">{accuracy}% so far</span>}
        </div>
      </div>
    </div>
  );
}

export function StyleMeter({ ranked }) {
  const max = Math.max(1, ...ranked.map((r) => r.score));
  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm">
      <div className="card-body py-4 gap-2">
        <h4 className="font-semibold text-sm">How you learn best (live)</h4>
        {ranked.map(({ mode, score }) => (
          <div key={mode} className="flex items-center gap-2 text-xs">
            <span className="w-6 text-center" aria-hidden="true">{MODES[mode].icon}</span>
            <span className="w-24 truncate">{MODES[mode].label}</span>
            <div className="flex-1 h-2 rounded-full bg-base-300 overflow-hidden">
              <div
                className="h-full bg-secondary rounded-full transition-all"
                style={{ width: `${(score / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
