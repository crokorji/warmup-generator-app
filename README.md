# Coach-X Warm-Up Generator

A Vercel-ready Next.js app that generates context-driven warm-ups using the Coach-X model:

- Prepare
- Position
- Access
- Integrate
- Express

## Environment variable

Add this in Vercel:

- `OPENAI_API_KEY`

The app works without the API key using the built-in rules engine. With the key added, it also returns a short AI-written rationale.

## Browser-only deploy flow

1. Create a new GitHub repo.
2. Upload the contents of this folder to the repo.
3. Import the repo into Vercel.
4. Add `OPENAI_API_KEY` in Vercel Project Settings → Environment Variables.
5. Deploy.
