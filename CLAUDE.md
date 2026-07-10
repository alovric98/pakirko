# Pakirko — upute za Claude Code

Ovo je Next.js web aplikacija za popise pakiranja za putovanja (PWA, mobile-first).

## Prije bilo kojeg taska
- Pročitaj `docs/PRD.md` i `docs/arhitektura.md` u cijelosti prije nego išta napraviš.
- Radi ISKLJUČIVO fazu koju ti eksplicitno zadam u promptu (vidi sekciju "Faze implementacije" u arhitektura.md).
- Ne diraj datoteke ili funkcionalnost izvan te faze, čak i ako ti se čini praktično usput riješiti nešto drugo.
- Prije pisanja koda, u Plan modu jasno opiši: što ćeš napraviti, koje datoteke diraš, i kako testiramo uspjeh. Čekaj moje odobrenje prije nego počneš pisati kod.
- Ako naiđeš na nejasnoću ili proturječnost u zahtjevima, stani i pitaj — ne pretpostavljaj.

## Jezik
- Sučelje aplikacije (tekst koji vidi korisnik): hrvatski.
- Komunikacija sa mnom u chatu: hrvatski.
- Kod, komentari u kodu, nazivi varijabli/funkcija: engleski (standard).

## Tech stack (odobreno)
- Next.js (App Router) + React + TypeScript
- Tailwind CSS
- localStorage kroz apstrahirani storage sloj (`lib/storage.ts`)
- Deploy: Vercel