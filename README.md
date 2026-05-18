# Triathlon Starter

Starter repository personale per avviare rapidamente nuovi progetti web con una base moderna già pronta.

## Quando usarlo
Usa questo repository quando vuoi iniziare un nuovo progetto con:
- React 19
- TypeScript
- Vite
- TailwindCSS
- Supabase
- Vercel

## Struttura
- `app/` → applicazione frontend
- `.env.example` → variabili ambiente di esempio
- `AGENTS.md` → istruzioni operative per sessioni AI/OpenCode
- `PROJECT_AI_NOTES.md` → note progetto

## Setup

```bash
cd app
cp ../.env.example .env
npm install
npm run dev
```

## Checklist nuovo progetto
- Rinominare la repo GitHub
- Aggiornare `app/package.json`
- Configurare Supabase
- Configurare Vercel
- Aggiornare `.env`
- Personalizzare `AGENTS.md`
- Aggiornare `PROJECT_AI_NOTES.md`

## Convenzioni
- Branch `main` protetto
- Usare feature branch e PR
- Aprire una sessione con `opencode` e seguire `AGENTS.md`