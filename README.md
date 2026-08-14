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

See `ARCHITECTURE.md` in this repo (or the copy shared in chat) for full system design,
what's implemented, what's stubbed, and what's left to build for production.
"# theycode-it" 
"# theycode-it" 
