# They Code It — Computer Academy Platform

Monorepo with two apps:

- `backend/` — Node.js + Express API (auth, courses, enrollments, student portal, admin portal)
- `frontend/` — React + Vite + Tailwind (public site, student portal, admin portal in one app)

## Quick start

### Backend
```
cd backend
npm install
node prisma/seed.js   # seeds demo data into data.json
npm run dev            # runs on http://localhost:4000
```

### Frontend
```
cd frontend
npm install
npm run dev             # runs on http://localhost:5173
```

## Demo logins (after seeding)
- Admin:   admin@theycodeit.com / Passw0rd!
- Student: student@theycodeit.com / Passw0rd!

## Deployment

The backend is a traditional long-running Express server (`app.listen`), so it needs
a host that keeps a Node process alive — Vercel's Hobby plan only runs serverless
functions and cannot run this backend unchanged. The split used here:

### Frontend → Vercel (free)
1. Import the repo into Vercel, set the project **Root Directory** to `frontend`.
2. Framework preset: Vite (auto-detected). Build command `npm run build`, output `dist`.
3. Set env vars: `VITE_API_URL` (your deployed backend's URL + `/api`), `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
4. `frontend/vercel.json` is already set up to rewrite all routes to `index.html`
   so React Router's client-side routes (e.g. `/admin/dashboard`) don't 404 on refresh.

### Backend → Render (free, commercial use allowed)
1. New Web Service on Render, root directory `backend`, build command `npm install`, start command `npm start`.
2. Set env vars from `backend/.env`: `SUPABASE_URL`, `SUPABASE_KEY`, `DATABASE_URL`, `JWT_SECRET`, `SUPABASE_ANON_KEY`.
3. Run `backend/supabase_schema.sql` in the Supabase SQL editor first if you haven't already.
4. Note: Render's free web services spin down after 15 minutes of inactivity and take
   30–60s to wake back up on the next request — fine for a small academy site, but
   worth knowing so a "slow" first login doesn't look like a bug.

See `ARCHITECTURE.md` for full system design, what's implemented, what's stubbed, and
what's left to build for production.
"# theycode-it" 
"# theycode-it" 
