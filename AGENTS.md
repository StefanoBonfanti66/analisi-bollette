# Agent rules

- Read PROJECT_AI_NOTES.md before doing major work.
- Prefer small diffs.
- Ask before touching secrets, .env, deployment, infra, auth, billing.
- Follow existing code style.
- Update PROJECT_AI_NOTES.md at meaningful checkpoints.

## Current Focus (2026-05-21)

**Completato:**
- Refactor device_id → user_id (Supabase Auth), AuthProvider, LoginPage, RLS su auth.uid()
- Company branding: logo navbar, favicon, footer ZetaBytesNexus
- Tips dinamiche da AI (colonna tips jsonb)
- Rimosse sezioni rotte (report annuali, guide approfondimento)
- Fix "device_id NOT NULL" su Supabase
- Commit e push su main (4133b80)
- UPDATE SQL: associate 3 bollette orfane a bonfantistefano4@gmail.com
- Security hardening: rimosso RLS permissiva Allow all access, abilitata leaked password protection
- Deploy su Vercel: https://analisi-bollette.vercel.app (frontend + API funzionanti)

**In corso:**
- (nessuno)

**Da fare dopo:**
- Sostituire dati placeholder footer (P.IVA, tel, email)

**Prossimo step concreto:**
Nessun passo bloccante. Scegli nuova funzionalità o finalizza placeholder footer.
