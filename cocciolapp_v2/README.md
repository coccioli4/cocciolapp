# CocciolApp V2

Web app PWA per Famiglia Coccioli: Gianluca + Silvia, Marco, casa, veicoli, spese, promemoria, manutenzioni, documenti e sync live.

## Funzioni incluse nella V2

- UI mobile-first stile Apple
- Home dashboard
- Promemoria con priorità e assegnazione
- Agenda/calendario
- Casa: Volvo XC40, MP3 300, caldaia, climatizzatori, filtri
- Area Marco
- Tracker spese con categorie personalizzabili
- Pagata da: Gianluca, Silvia, Famiglia
- Lista spesa condivisa
- Inbox familiare
- Schema Supabase con RLS e realtime
- Predisposizione PWA installabile su iPhone/Android

## Avvio locale

```bash
npm install
npm run dev
```

Apri:

```txt
http://localhost:3000
```

## Collegamento Supabase

1. Crea progetto su Supabase.
2. Apri SQL Editor.
3. Incolla `supabase/schema.sql` ed esegui.
4. Copia `.env.example` in `.env.local`.
5. Inserisci:

```txt
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

6. Riavvia:

```bash
npm run dev
```

## Deploy Vercel

1. Carica il progetto su GitHub.
2. Importa repository su Vercel.
3. Aggiungi le variabili ambiente.
4. Deploy.

## Nota

La UI attuale usa dati demo. Il prossimo step è collegare ogni schermata alle tabelle Supabase.
