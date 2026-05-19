# Agent rules

- Read PROJECT_AI_NOTES.md before doing major work.
- Prefer small diffs.
- Ask before touching secrets, .env, deployment, infra, auth, billing.
- Follow existing code style.
- Update PROJECT_AI_NOTES.md at meaningful checkpoints.

## Current Focus (2026-05-19)

**Completato:**
- Rimosso device_id dalla logica app sostituito con user_id (Supabase Auth)
- AuthProvider + LoginPage con email/password Supabase Auth
- RLS policy basata su auth.uid() invece che device_id
- Company branding: logo nel navbar, favicon, footer ZetaBytesNexus
- Tips dinamiche da AI salvate su Supabase (colonna tips jsonb)
- Rimosse sezioni non funzionanti (report annuali, guide approfondimento)
- Fix errore "device_id NOT NULL" eseguendo SQL su Supabase

**Manca:**
- Committare e pushare le modifiche locali (auth, branding, tips, ecc.)
- Associare vecchi record bills (user_id = null) all'utente corrente
- Deploy su Vercel (auto-deploy da GitHub main)
- Sostituire dati placeholder footer (P.IVA, tel, email)

**Prossimo step concreto:**
Committare le modifiche locali e pushare su main.
