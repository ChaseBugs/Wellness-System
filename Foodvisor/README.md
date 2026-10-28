# Foodvisor Platform

This workspace contains a Foodvisor-style backend and admin panel based on the supplied mobile screenshots and public app references.

## Structure

- `design/` contains the provided mobile reference screenshots.
- `backend/` contains the Express.js, TypeScript, and MongoDB REST API.
- `web-admin/` contains the Next.js and TypeScript admin panel.

## Setup

```bash
npm run install:all
cp backend/.env.example backend/.env
cp web-admin/.env.example web-admin/.env.local
docker compose up -d mongo
npm run seed
```

## Run

```bash
npm run dev:backend
npm run dev:admin
```

The API defaults to `http://localhost:4000/api`; the admin defaults to `http://localhost:3000`.

## API Resources

- `GET /api/health`
- `GET /api/dashboard`
- CRUD routes for `/api/foods`, `/api/recipes`, `/api/activities`, `/api/users`, `/api/meal-logs`, `/api/weight-entries`, and `/api/programs`

Seeded records include `doctor_verified: false` for medical review workflows.
