# TREASURE HUNT 2.0

**SCAN. SOLVE. SEARCH. CONQUER.**

A QR-based, 5-round treasure hunt web app for a college technical symposium.
Teams scan a public starting QR code, solve a challenge, get a hint, physically
find the next hidden QR code, and repeat until the treasure is unlocked.

- **Frontend:** React + Vite (dark neon "tech-hunt" UI)
- **Backend:** Node.js + Express (all game logic and security checks live here)
- **Database:** Supabase (PostgreSQL)

Every rule from the spec — no future QR reveals, no re-rolled questions on
refresh, no client-side score/round trust, server-based timers, race-safe
unique challenge assignment — is enforced in the **backend**, not the
frontend. The frontend only ever renders what the server says is true.

---

## 1. What's inside

```
treasure-hunt-2.0/
├── backend/          Express API — all game/security logic
├── frontend/          React + Vite participant + admin UI
├── database/
│   ├── schema.sql     Run this first in Supabase
│   └── seed.sql        Sample rounds/challenges/teams — run second
└── README.md          You are here
```

## 2. Prerequisites

- Node.js 18+ and npm
- A free [Supabase](https://supabase.com) project
- (For deployment) free accounts on [Vercel](https://vercel.com) and
  [Render](https://render.com)

## 3. Set up the database (Supabase)

1. Create a new Supabase project.
2. Open **SQL Editor → New query**, paste the contents of
   `database/schema.sql`, and run it.
3. Run `database/seed.sql` the same way. This adds the 5 rounds, a small
   pool of sample challenges per round, and 3 sample teams (`ALPHA01`,
   `OMEGA02`, `TITAN03`) so you can test end-to-end immediately. Delete or
   replace them from the Admin Panel once you're ready for the real event.
4. From **Project Settings → API**, note down your **Project URL**,
   **anon public key**, and **service_role key** (keep the service role key
   secret — it belongs only in the backend's `.env`, never in the frontend).

## 4. Run the backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env: fill in SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, a long random
# JWT_SECRET, and (once you know it) PUBLIC_FRONTEND_URL

npm run create-admin -- you@yourcollege.edu "a-strong-password"
npm run dev
```

The API listens on `http://localhost:4000` by default. Visit
`http://localhost:4000/api/health` to confirm it's running.

> There is no public admin sign-up route on purpose — `npm run create-admin`
> is the only way to create an organizer account, and you run it locally
> with your own Supabase credentials.

## 5. Run the frontend

```bash
cd frontend
npm install
cp .env.example .env
# edit .env: set VITE_API_URL to your backend URL (http://localhost:4000 for now)

npm run dev
```

Visit `http://localhost:5173`. Log in to the admin panel at `/admin/login`
with the email/password you created above.

## 6. First-time walkthrough

1. **Admin → Overview**: confirm teams/challenges loaded from the seed data.
2. **Admin → Teams**: add your real teams (one at a time, or paste a list
   into Bulk Import as `TEAMCODE, Team Name` — one per line).
3. **Admin → Challenges**: review/replace the sample riddles, quizzes, and
   puzzles per round. Add enough per round so teams don't all get the same
   question (the backend randomly assigns one per team and never repeats
   one for the same team).
4. **Admin → QR Checkpoints**: this is where you get your physical QR
   codes.
   - Checkpoint **#1** stays on a projector/TV — open **Projector Display**
     (top of the sidebar) on the machine connected to the screen. It shows
     a big scannable QR code and nothing else.
   - Checkpoints **#2–#5**: click **Download PNG** on each, print them, and
     physically hide them. Use the location/hint note fields to remember
     where you put each one — participants never see this list.
   - If a printed code is ever compromised, hit **Regenerate** to issue a
     fresh token and reprint it.
5. **Admin → Settings**: set the event name, tagline, date, and default
   wrong-answer penalty.
6. When you're ready to start the event, go to **Overview → Start Event**.
   **Pause Event** freezes every participant's screen instantly (useful for
   announcements); **Resume** (same button) continues it; **End Event**
   closes the hunt.
7. Share the public leaderboard at `/leaderboard` (no login needed) if you
   want to project it separately from the admin panel.

## 7. How the core rules are enforced

- **No future QR reveals** — the API never returns a QR token, URL, or
  checkpoint number to a participant; only the hint text for the round
  they just solved.
- **No re-rolled questions on refresh** — each team's challenge assignment
  is a row in `team_challenges`. It's created once per round and read back
  identically on every request until it's marked completed.
- **Race-condition safety** — a unique database index on
  `(team_id, round_id) WHERE status = 'ASSIGNED'` means two near-simultaneous
  requests from the same team can't create two different assignments; the
  loser just reads back the winner's row.
- **No round-skipping / no trusting the client** — every request carries a
  team session token, and the backend always re-reads the team's
  `current_round` from the database before deciding what to do. Scanning
  checkpoint N is only accepted if N equals the team's `current_round + 1`
  **and** the current round's challenge is already marked completed.
- **No score tampering** — all scoring math (`+points` on correct,
  `-penalty` on wrong) happens server-side inside the answer-submission
  endpoint. The frontend only ever displays numbers the server sent it.
- **Server-based timing** — elapsed time and completion time are computed
  from `started_at` / `completed_at` timestamps stored in Postgres, not
  from the participant's device clock.

## 8. Manually testing the 10 scenarios from the brief

With the seed data loaded and two browser profiles (or one normal + one
incognito window) logged in as `ALPHA01` and `OMEGA02`:

1. Scan (or paste) checkpoint #1's URL as Team Alpha → challenge appears.
2. Do the same as Team Omega → likely a different challenge (pool has 2–3
   per round).
3. Refresh Team Alpha's tab → same challenge, same attempts count.
4. Submit a wrong answer → error shown, challenge stays, score drops by the
   penalty.
5. Submit the right answer → "Round complete", hint revealed.
6. Try scanning checkpoint #4's URL as Team Alpha before finishing round 3 →
   rejected with "Complete your current round before scanning this code."
7. Scan checkpoint #2 after finishing round 1 → accepted, new challenge.
8. Repeat through checkpoint #5 and its challenge → "Treasure Unlocked"
   screen with score, time, and rank.
9. Have two team browser tabs hit the same "enter this round" moment at
   once (e.g. two rapid refreshes) → both end up with the exact same
   assignment, no duplicate/conflicting rows.
10. Open the browser console on a participant tab and try calling
    `fetch('/api/challenge/answer', ...)` with a fabricated body, or edit
    `localStorage` to change the team's cached round — the next server
    response still reflects the real `current_round` in the database, so
    nothing is actually skipped.

## 9. Deploying (all free-tier friendly)

**Database:** already on Supabase from step 3.

**Backend → Render**
1. Push this project to a GitHub repo.
2. Render → New → Web Service → connect the repo, set **Root Directory** to
   `backend`.
3. Build command: `npm install`. Start command: `npm start`.
4. Add every variable from `backend/.env.example` under Render's
   Environment settings, using your real Supabase keys. Set
   `PUBLIC_FRONTEND_URL` and `FRONTEND_ORIGIN` to your Vercel URL once you
   have it (step below) — you can come back and update these after.
5. Deploy. Note the resulting URL, e.g. `https://treasure-hunt-api.onrender.com`.

**Frontend → Vercel**
1. Vercel → New Project → import the same repo, set **Root Directory** to
   `frontend`.
2. Framework preset: Vite. Build command `npm run build`, output directory
   `dist` (Vercel usually detects these automatically).
3. Add environment variable `VITE_API_URL` = your Render backend URL.
4. Deploy. Note the resulting URL, e.g. `https://treasure-hunt-2026.vercel.app`.
5. Go back to Render and update `PUBLIC_FRONTEND_URL` and `FRONTEND_ORIGIN`
   to that Vercel URL, then redeploy the backend so QR codes point to the
   live frontend and CORS allows it.

Run `npm run create-admin -- you@yourcollege.edu "password"` once more
locally (pointed at the same Supabase project via your local `.env`) if you
haven't already created your organizer login.

## 10. A note on this build

This was generated end-to-end in one pass — every backend route, database
table, and frontend screen described in the brief is implemented, and the
whole codebase was statically checked (syntax-checked file by file and
bundled through esbuild to confirm every import/require resolves
correctly) since this sandboxed environment has no network access to run
`npm install` or connect to a live Supabase project. That means the code is
structurally sound, but it hasn't been exercised against a real running
Postgres database or real QR scans yet. Please run through section 8's
checklist once you've deployed it, and treat the first live test as a
normal rehearsal before event day.
#   t r e a s u r e _ h u n t  
 