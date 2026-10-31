# EasyMath from EconoAI

A middle-school math assessment website (grades 5–8). It measures a student's
current math skill level, discovers how they learn fastest (visual, auditory,
reading, hands-on, game-based, or memory/drill), and generates a personalized
curriculum — with a delivery mode per unit — from their current level to full
8th-grade mastery.

Built with **React + Vite + Tailwind CSS + daisyUI**.

## Layout

- **Top navbar** — logo, "EasyMath from EconoAI" title, AI provider badge,
  day/night theme toggle, AI Settings button.
- **Working window** (left) — interactive assessment: multiple-choice, numeric,
  and puzzle questions, live progress, learning-style meter, final curriculum.
- **Chat window** (right) — conversation with Matty, the AI math coach.

## AI providers

| Priority | Provider | When |
|---|---|---|
| 1 | Meta Llama API | A Meta API key is entered in AI Settings |
| 2 | Local Ollama | No key — talks to Ollama on `localhost:11434` |
| 3 | Offline engine | Neither reachable — built-in question bank & curriculum |

The AI authors bonus questions, gives feedback on answers, chats freely, and
writes the personalized curriculum narrative. Scoring and leveling always run
through the local engine so results stay reliable.

### Using local Ollama

```sh
ollama pull gemma2   # or llama3.1, etc.
ollama serve
```

Then open AI Settings and set the Ollama model name to match. The dev server
proxies `/ollama` → `localhost:11434` to avoid CORS issues.

## Run it

```sh
npm install
npm run dev
```

Open http://localhost:5173 in a browser.

```sh
npm run build   # production build into dist/
npm run preview # serve the production build
```

## Day / night mode

Toggle the sun/moon button in the navbar. Day mode uses the daisyUI `emerald`
theme, night mode uses `night`. The choice persists in localStorage.
