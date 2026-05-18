# Project: EnergiaAnalytica

## Obiettivo
- Scopo: App web mobile-friendly per analizzare bollette luce e gas tramite upload PDF, con analisi IA (Google Gemini), dashboard consumi, confronto mercato e suggerimenti risparmio.
- Stato attuale: Integrazione Supabase completata. `tsc` e `vite build` OK. App pronta per test con PDF.
- Risultato atteso della sessione: Integrare Supabase (client, hook CRUD, migration), fix errori TS, verificare build.

## Stack e vincoli
- Frontend: React 19 + TypeScript + Vite + TailwindCSS 4 + Recharts + Lucide + Motion
- Backend: Express + Google Gemini AI (@google/genai)
- Dati: Supabase (Postgres) — tabella `bills` con RLS device-based
- Infra: Vercel (da configurare per serverless API)
- Vincoli tecnici: GEMINI_API_KEY, GROQ_API_KEY, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY

## Decisioni prese
- [2026-05-18] Integrata app EnergiaAnalytica nel template Triathlon Starter
- [2026-05-18] Scelto Express + Vite middleware mode per sviluppo locale (API IA server-side)
- [2026-05-18] Implementato multi-provider AI: Gemini (PDF diretto) → OpenAI-compatibile (testo estratto da PDF) → Groq fallback
- [2026-05-18] Aggiunto supporto Groq (Llama 3, Mixtral) come fallback gratuito via GROQ_API_KEY
- [2026-05-18] Reintegrato Supabase come database persistence con client `lib/supabase.ts` e hook `hooks/useBills.ts`
- [2026-05-18] Progetto Supabase: `energia-analytica` (eu-west-1, Healthy). Tabella `bills` con RLS policy aperta per device-based access.

## Lavoro svolto
- File creati: server.ts, .env.example, src/types.ts, src/lib/gemini.ts, src/lib/supabase.ts, src/lib/utils.ts, src/lib/pdf-extract.ts, src/hooks/useBills.ts, src/components/dashboard/* (6), src/components/bills/BillManager.tsx, src/components/Tips.tsx
- File modificati: package.json, vite.config.ts, tsconfig.json, index.html, src/main.tsx, src/App.tsx, src/index.css, .gitignore
- File eliminati: src/supabaseClient.ts (rimpiazzato da lib/supabase.ts)

## TODO aperti
1. Testare analisi con un PDF di bolletta reale (`npm run dev` nel terminale)
2. Adattare per deploy Vercel (API route serverless)

## Problemi aperti
- Nessuno al momento. `tsc --noEmit` e `vite build` passano.

## File toccati
- app/package.json, app/vite.config.ts, app/tsconfig.json, app/index.html, app/server.ts
- app/.env, app/.env.example, .gitignore
- app/src/* (main.tsx, App.tsx, index.css, types.ts, vite-env.d.ts)
- app/src/lib/* (gemini.ts, supabase.ts, utils.ts, pdf-extract.ts, toast.tsx)
- app/src/hooks/*, app/src/components/*
- Supabase: progetto `energia-analytica`, tabella `public.bills`

## Miglioramenti implementati (18/05/2026)
### Nuovo file
- `app/src/lib/toast.tsx` — Sistema di notifiche toast (success/error/info/warning) con contesto React + animazioni Motion

### Modifiche
- **App.tsx**: Wrapped con ToastProvider; loading spinner da `useBills()`; skeleton durante fetch dati
- **BillManager.tsx**: Toast invece di alert(); campo di ricerca/filtro bollette; dialogo conferma eliminazione; countdown rate limit (429) con timer visivo
- **Dashboard.tsx**: Empty state professionale quando nessuna bolletta; nuovo grafico "Confronto Annuale" (YearOverYearChart) visibile con ≥2 anni di dati
- **Tips.tsx**: Empty state completo con placeholder cards quando nessuna bolletta

### Nuovo componente
- `app/src/components/dashboard/YearOverYearChart.tsx` — Confronto consumi mese per mese tra anni diversi (bar chart)

## Prossimo step suggerito
- Lanciare `npm run dev` e testare upload PDF reale. Oppure deploy su Vercel.
