# Foodvisor

Foodvisor's Android app, its mobile reference screens and its foods data. The backend and the admin
are part of the Wellness Platform:

| Part | Where |
| --- | --- |
| Backend API | `backend/` (repo root) (`/api/v1/apps/foodvisor`, port 4500) |
| Admin | `admin/` (repo root) (section `/foodvisor`, port 3000) |
| Android app | `android/` (see `android/README.md`) |
| Mobile design screens | `design/` |
| Foods dump | `foods.js` / `foods.7z`, imported with `npm run import:legacy:foodvisor` in the platform backend |

## Run

```bash
# backend
cd ../../backend
npm run db:local && npm run seed && npm run import:legacy:foodvisor && npm run dev
# admin
cd ../admin && npm run dev     # http://localhost:3000/foodvisor (admin@wellness.local / Admin123!)
```

The legacy Express/MongoDB backend and the standalone admin were removed after the migration; they
remain in git history.
