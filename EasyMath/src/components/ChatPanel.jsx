import React, { useEffect, useRef, useState } from 'react';

function Avatar({ from }) {
  if (from === 'bot') {
    return (
      <div className="avatar placeholder">
        <div className="bg-primary text-primary-content rounded-full w-9">
          <span className="text-lg font-bold">M</span>
        </div>
      </div>
    );
  }
  return (
    <div className="avatar placeholder">
      <div className="bg-neutral text-neutral-content rounded-full w-9">
        <span className="text-sm">You</span>
      </div>
    </div>
  );
}

export default function ChatPanel({ messages, typing, onSend }) {
  const [draft, setDraft] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, typing]);

  const submit = (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    onSend(text);
  };

  return (
    <section className="flex flex-col h-full bg-base-100 border border-base-300 rounded-xl overflow-hidden" aria-label="Chat with Matty the tutor">
      <div className="px-4 py-2.5 bg-base-200 border-b border-base-300 flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-60" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success" />
        </span>
        <h2 className="font-semibold text-sm">Matty · your math coach</h2>
      </div>

      <div className="chat-scroll flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {messages.map((m, i) => (
          <div key={i} className={`chat ${m.from === 'bot' ? 'chat-start' : 'chat-end'}`}>
            <Avatar from={m.from} />
            <div
              className={`chat-bubble text-sm leading-relaxed ${
                m.from === 'bot' ? 'chat-bubble-primary' : ''
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {typing && (
          <div className="chat chat-start">
            <Avatar from="bot" />
            <div className="chat-bubble chat-bubble-primary text-sm">
              <span className="loading loading-dots loading-sm" aria-label="Matty is typing" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={submit} className="p-3 border-t border-base-300 bg-base-200 flex gap-2">
        <input
          className="input input-bordered input-sm sm:input-md flex-1"
          placeholder="Ask Matty anything about math…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          aria-label="Message Matty"
        />
        <button type="submit" className="btn btn-primary btn-sm sm:btn-md" disabled={!draft.trim()}>
          Send
        </button>
      </form>
    </section>
  );
}
