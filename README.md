# Wellness Ecosystem

One backend and one admin serve every app of the Wellness Ecosystem. Each app has its own Android client.

```
Wellness-System/
├── backend/              One backend for every app (Express + TypeScript + PostgreSQL, port 4500)
├── admin/                One admin UI for every app (Next.js 16, port 3000)
├── mobile/               The apps. Each Android project is in <App>/android/
│   ├── Foodvisor/        Meal and nutrition app (android/, design/, docs/, foods data)
│   ├── TalentBaby/       BabyGrow: baby growth and development (android/, ui/, docs/)
│   └── HeightIncrease/   Height records, posture and activity routines (android/, design/)
├── design-references/    Screenshots for future apps (DailyYoga, DownDog, FaceYoga, HairTry, Youcam Makeup)
└── docs/
    ├── Wellness_Ecosystem_2027_English.md   Portfolio strategy
    ├── Backend_Architecture.md              How the backend is organised
    ├── app-specs/                           Feature specs for candidate apps
    └── ecosystem-diagram/                   Generated app portfolio diagram
```

## Run locally

```bash
# 1. Backend
cd backend
npm install
npm run db:local && npm run seed && npm run dev      # http://localhost:4500/api-docs

# 2. Admin (in a second terminal)
cd admin
npm install
npm run dev                                          # http://localhost:3000, admin@wellness.local / Admin123!

# 3. An Android app: open mobile/<App>/android/ in Android Studio (the emulator reaches the backend at http://10.0.2.2:4500)
```

The legacy content imports are `npm run import:legacy:foodvisor`, `import:legacy:talentbaby` and `import:legacy:height`, all run from `backend/`.

## Where to change things

| To change | Go to |
| --- | --- |
| An API, a database table or an app module | `backend/` (read `backend/CLAUDE.md`) |
| An admin screen | `admin/` (read `admin/README.md`) |
| An Android screen | `mobile/<App>/android/` |
| App codes, categories, lifecycle | `backend/src/config/app-catalog.ts` |
| The portfolio diagram | `docs/ecosystem-diagram/build_wellness_ecosystem_svg.js` |
