import React from 'react';

function Logo() {
  return (
    <svg width="34" height="34" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="4" y="4" width="40" height="40" rx="10" className="fill-primary" />
      <path
        d="M30.5 13.5c-4.6 0-7.9 2.4-8.9 6.2-.3 1.2-.4 2.6-.4 4.3s.1 3.1.4 4.3c1 3.8 4.3 6.2 8.9 6.2 2.4 0 4.3-.7 5.6-1.9l-1.9-2.6c-.9.8-2.2 1.3-3.7 1.3-2.9 0-4.8-1.6-5.4-4.3h11.5l.4-1.6c.2-1 .3-2 .3-3.4s-.1-2.4-.3-3.4l-.4-1.6H25.1c.6-2.7 2.5-4.3 5.4-4.3 1.5 0 2.8.5 3.7 1.3l1.9-2.6c-1.3-1.2-3.2-1.9-5.6-1.9zM25 19.4h8.4c0 .5.1 1 .1 1.7s-.1 1.2-.1 1.7H25c0-.5-.1-1-.1-1.7s.1-1.2.1-1.7z"
        fill="white"
      />
      <circle cx="13.5" cy="15" r="2.4" fill="white" opacity="0.85" />
      <rect x="11.5" y="21" width="4" height="12" rx="2" fill="white" opacity="0.85" />
    </svg>
  );
}

const PROVIDER_META = {
  meta: { label: 'Meta API', cls: 'badge-primary' },
  ollama: { label: 'Ollama local', cls: 'badge-secondary' },
  offline: { label: 'Offline engine', cls: 'badge-ghost' },
};

export default function Navbar({ theme, onToggleTheme, provider, onOpenSettings }) {
  const meta = PROVIDER_META[provider] || PROVIDER_META.offline;
  return (
    <header className="navbar bg-base-200 border-b border-base-300 px-3 sm:px-5 min-h-0 py-2">
      <div className="flex items-center gap-2 sm:gap-3">
        <Logo />
        <div className="leading-tight">
          <h1 className="text-lg sm:text-xl font-bold tracking-tight">
            EasyMath <span className="font-normal text-base-content/70 text-sm sm:text-base">from EconoAI</span>
          </h1>
          <p className="text-xs text-base-content/60 hidden sm:block">
            Middle-school math assessment · grades 5–8
          </p>
        </div>
      </div>
      <div className="flex-1" />
      <span className={`badge ${meta.cls} badge-sm sm:badge-md mr-1 sm:mr-2`} title="Active AI provider">
        {meta.label}
      </span>
      <label className="swap swap-rotate btn btn-ghost btn-sm sm:btn-md btn-circle" title={`Switch to ${theme === 'night' ? 'day' : 'night'} mode`}>
        <input
          type="checkbox"
          checked={theme === 'night'}
          onChange={onToggleTheme}
          aria-label="Toggle day and night mode"
        />
        <svg className="swap-on fill-current w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M21.7 13.3A8.5 8.5 0 0 1 10.7 2.3 8.5 8.5 0 1 0 21.7 13.3z" />
        </svg>
        <svg className="swap-off fill-current w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0-15h0a1 1 0 0 0 1-1V.5a1 1 0 0 0-2 0V1a1 1 0 0 0 1 1zm0 22a1 1 0 0 0-1 1v.5a1 1 0 0 0 2 0V23a1 1 0 0 0-1-1zM1 12a1 1 0 0 0 1-1H1.5a1 1 0 0 0 0-2H1a1 1 0 0 0-1 1zm22 0a1 1 0 0 0-1 1h.5a1 1 0 0 0 0 2H23a1 1 0 0 0 1-1zM4.2 4.2a1 1 0 0 0 0 1.4l.4.4a1 1 0 0 0 1.4-1.4l-.4-.4a1 1 0 0 0-1.4 0zm13.4 13.4a1 1 0 0 0 0 1.4l.4.4a1 1 0 0 0 1.4-1.4l-.4-.4a1 1 0 0 0-1.4 0zm0-13.4a1 1 0 0 0-1.4 0l-.4.4a1 1 0 0 0 1.4 1.4l.4-.4a1 1 0 0 0 0-1.4zM6 17.6a1 1 0 0 0-1.4 0l-.4.4a1 1 0 0 0 1.4 1.4l.4-.4a1 1 0 0 0 0-1.4z" />
        </svg>
      </label>
      <button className="btn btn-ghost btn-sm sm:btn-md" onClick={onOpenSettings} title="AI provider settings">
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.9 2.9l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.9-2.9l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.9-2.9l.1.1a1.7 1.7 0 0 0 1.9.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.5h0a1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.9 2.9l-.1.1a1.7 1.7 0 0 0-.3 1.9v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.4 1z" />
        </svg>
        <span className="hidden sm:inline">AI Settings</span>
      </button>
    </header>
  );
}
