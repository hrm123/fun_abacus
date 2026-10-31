import React from 'react';
import { MODES } from '../lib/assessment.js';

export default function CurriculumView({ report, narrative, onRestart }) {
  const { level, rankedStyles, curriculum } = report;
  const topStyles = rankedStyles.filter((s) => s.score > 0).slice(0, 3);
  return (
    <div className="space-y-4">
      <div className="card bg-primary text-primary-content shadow-sm">
        <div className="card-body gap-2">
          <h3 className="card-title text-xl">🎓 Your personalized path to 8th-grade math</h3>
          <p className="text-sm opacity-90">
            Starting level: <strong>grade {level.band}</strong> · {level.accuracy}% assessment
            accuracy · <strong>{curriculum.totalWeeks} weeks</strong> to mastery
          </p>
          {narrative && <p className="text-sm leading-relaxed opacity-90 mt-1">{narrative}</p>}
        </div>
      </div>

      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body gap-2">
          <h4 className="font-semibold">Your learning superpowers</h4>
          <div className="flex gap-2 flex-wrap">
            {topStyles.map(({ mode }) => (
              <span key={mode} className="badge badge-secondary badge-lg gap-1">
                {MODES[mode].icon} {MODES[mode].label}
              </span>
            ))}
          </div>
          <p className="text-sm text-base-content/70">
            You {MODES[topStyles[0]?.mode ?? 'game'].blurb}
            {topStyles[1] ? `, and also ${MODES[topStyles[1].mode].blurb}.` : '.'} Every unit
            below is delivered in these modes.
          </p>
        </div>
      </div>

      <ol className="space-y-3">
        {curriculum.units.map((u, i) => (
          <li key={u.id} className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="badge badge-primary">Unit {i + 1}</span>
                <span className="badge badge-outline">Grade {u.grade}</span>
                <span className="badge badge-ghost">{u.weeks} weeks</span>
                <span className="badge badge-accent">{u.phase}</span>
              </div>
              <h4 className="font-bold text-lg">{u.title}</h4>
              <p className="text-sm text-base-content/70">{u.topics}</p>
              <div className="divider my-1 text-xs">Delivered as</div>
              <ul className="space-y-1">
                {u.delivery.map((d) => (
                  <li key={d.mode} className="flex gap-2 items-start text-sm">
                    <span aria-hidden="true">{MODES[d.mode].icon}</span>
                    <span>
                      <strong>{MODES[d.mode].label}:</strong> {d.activity}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>

      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body gap-2">
          <h4 className="font-semibold">Topic check from your assessment</h4>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(level.topics).map(([topic, t]) => (
              <span
                key={topic}
                className={`badge ${t.correct === t.total ? 'badge-success' : 'badge-warning'}`}
                title={`${t.correct}/${t.total} correct`}
              >
                {topic}: {t.correct}/{t.total}
              </span>
            ))}
          </div>
        </div>
      </div>

      <button className="btn btn-outline w-full" onClick={onRestart}>
        ↻ Retake the assessment
      </button>
    </div>
  );
}
