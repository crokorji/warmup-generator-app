# Coach-X Warm-Up Generator

A Next.js web app for generating context-driven warm-ups using the layered coaching model:

- Prepare
- Position
- Access
- Integrate
- Express

The app lets a user enter:
- warm-up time
- training goal
- session focus
- readiness
- pain / threat level
- training experience
- movement restrictions or stability needs
- free-text context notes

It then returns:
- a structured warm-up
- the reasoning behind each layer
- a decision log
- an optional AI rationale from OpenAI
- a coach-facing flowchart for the decision tree

## Stack

- Next.js (App Router)
- React
- TypeScript
- OpenAI JavaScript SDK
- Vercel-ready deployment

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000

## Environment variables

Create `.env.local`:

```bash
OPENAI_API_KEY=your_key_here
```

If `OPENAI_API_KEY` is not set, the app still works using the built-in rule-based generator and simply skips the AI narrative.

## Deploy to Vercel

1. Push this folder to GitHub
2. Import the repo into Vercel
3. Add `OPENAI_API_KEY` in Project Settings → Environment Variables
4. Deploy

## Core behaviour

The `/api/generate` route:
1. validates user input with Zod
2. generates a rules-based warm-up plan
3. optionally calls OpenAI Responses API for a concise explanation
4. returns both to the client

## Suggested next features

- save favourite warm-ups
- generate ramp sets for the first lift
- movement-screen profile presets
- coach notes per drill
- printable session card
- client mode vs coach mode
