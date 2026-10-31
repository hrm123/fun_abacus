import React, { useState } from 'react';
import { testConnection } from '../lib/ai.js';

export default function SettingsModal({ open, settings, onChange, onClose }) {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  if (!open) return null;

  const set = (key) => (e) => onChange({ ...settings, [key]: e.target.value });

  const runTest = async () => {
    setTesting(true);
    setTestResult(null);
    const result = await testConnection(settings);
    setTestResult(result);
    setTesting(false);
  };

  return (
    <div className="modal modal-open" role="dialog" aria-label="AI provider settings">
      <div className="modal-box max-w-lg">
        <h3 className="font-bold text-lg">AI provider settings</h3>
        <p className="text-sm text-base-content/70 mt-1">
          Add a Meta API key to use Meta-hosted Llama models. With no key, EasyMath talks to a
          local Ollama server instead — and the built-in offline engine always keeps the
          assessment working.
        </p>

        <div className="form-control mt-4">
          <label className="label" htmlFor="meta-key">
            <span className="label-text font-semibold">Meta API key</span>
          </label>
          <input
            id="meta-key"
            type="password"
            className="input input-bordered"
            placeholder="sk-… (leave empty to use Ollama)"
            value={settings.metaApiKey}
            onChange={set('metaApiKey')}
            autoComplete="off"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-3 mt-3">
          <div className="form-control">
            <label className="label" htmlFor="meta-endpoint">
              <span className="label-text">Meta endpoint</span>
            </label>
            <input
              id="meta-endpoint"
              className="input input-bordered input-sm"
              value={settings.metaEndpoint}
              onChange={set('metaEndpoint')}
            />
          </div>
          <div className="form-control">
            <label className="label" htmlFor="meta-model">
              <span className="label-text">Meta model</span>
            </label>
            <input
              id="meta-model"
              className="input input-bordered input-sm"
              value={settings.metaModel}
              onChange={set('metaModel')}
            />
          </div>
          <div className="form-control">
            <label className="label" htmlFor="ollama-url">
              <span className="label-text">Ollama URL</span>
            </label>
            <input
              id="ollama-url"
              className="input input-bordered input-sm"
              value={settings.ollamaUrl}
              onChange={set('ollamaUrl')}
            />
          </div>
          <div className="form-control">
            <label className="label" htmlFor="ollama-model">
              <span className="label-text">Ollama model</span>
            </label>
            <input
              id="ollama-model"
              className="input input-bordered input-sm"
              placeholder="e.g. gemma2, llama3.1"
              value={settings.ollamaModel}
              onChange={set('ollamaModel')}
            />
          </div>
        </div>

        <div className="mt-3 text-xs text-base-content/60">
          Local setup: install Ollama, then run <kbd className="kbd kbd-xs">ollama pull gemma2</kbd> and{' '}
          <kbd className="kbd kbd-xs">ollama serve</kbd>.
        </div>

        {testResult && (
          <div className={`alert mt-3 text-sm ${testResult.ok ? 'alert-success' : 'alert-warning'}`}>
            <span>
              {testResult.ok
                ? `Connected via ${testResult.provider === 'meta' ? 'Meta API' : 'Ollama'}.`
                : `Could not reach ${testResult.provider === 'meta' ? 'Meta API' : 'Ollama'}: ${testResult.error} — offline engine will be used.`}
            </span>
          </div>
        )}

        <div className="modal-action">
          <button className="btn btn-ghost" onClick={runTest} disabled={testing}>
            {testing ? <span className="loading loading-spinner loading-sm" /> : 'Test connection'}
          </button>
          <button className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
}
