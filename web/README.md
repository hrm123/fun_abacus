# Abacus Fun — Soroban Math for 6th Graders

A friendly, hands-on website that teaches **addition, subtraction, multiplication, and division**
with an interactive **Soroban abacus**. Built for students who find abstract teaching hard —
every idea is touchable: slide beads, see place values, and get coached bead-by-bead.

Includes **Abby**, an AI coach powered by **Meta's Llama API** when a key is configured,
with a built-in fallback coach otherwise.

## Run it

```sh
npm install
npm start
```

Open **http://localhost:3000** in a browser.

## Enable Meta AI (optional)

1. Get a key at **https://llama.developer.meta.com** (Llama API).
2. Set it and restart:

```sh
# PowerShell
$env:META_API_KEY="your-key-here"
npm start
```

Optional: `META_MODEL` (default `Llama-4-Scout-17B-16E-Instruct`),
`META_BASE_URL` (default `https://api.llama.com/compat/v1`), `PORT`.

Without a key the site fully works with the built-in coach and heuristic levels 1–5.

## What's inside

- `public/index.html` — page shell (tabs: Abacus, How it works, Add/Subtract/Multiply/Divide, Quiz)
- `public/abacus.js` — clickable Soroban component (1 heaven bead = 5, 4 earth beads = 1)
- `public/lessons.js` — kid-friendly lessons, step demos, practice + hints per operation
- `public/ai-coach.js` — frontend client for coach/level APIs
- `public/app.js` — tabs, quiz arcade, streaks, badges, chat, level updates
- `server.js` — Express server + `/api/status`, `/api/level`, `/api/coach` (Meta Llama with fallback)

## How the abacus works

- Each rod is one digit (ones, tens, hundreds… right to left).
- Top (heaven) bead touching the beam = **5**. Each bottom (earth) bead touching = **1**.
- Click a bead to slide it. Friends of 5 and 10 let you add/subtract when a rod looks full.
