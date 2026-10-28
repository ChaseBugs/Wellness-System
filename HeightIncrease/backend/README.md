# Height Increase Backend

Express + MongoDB backend with an admin panel for the Height Increase mobile app screens in this folder.

## Features

- JWT auth for mobile users and admins
- Admin dashboard served at `/admin`
- CRUD APIs for exercises, training plans, articles, banners, notifications, users, goals, and daily logs
- Mobile APIs for home feed, workouts, reports, profile, and content
- MongoDB seed data matching the current app concepts: workout plans, nutrition/sleep cards, reports, update modal, and progress logs

## Setup

```bash
cd backend
npm install
copy .env.example .env
npm run seed
npm run dev
```

Open:

- Admin panel: `http://localhost:5000/admin`
- Next.js admin panel: `http://localhost:3000`
- API health: `http://localhost:5000/api/health`

Default seeded admin:

- Email: `admin@height.local`
- Password: `Admin123!`

## Main API Routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/mobile/home`
- `GET /api/mobile/exercises`
- `GET /api/mobile/training-plans`
- `GET /api/mobile/articles`
- `GET /api/mobile/reports`
- `POST /api/mobile/logs`
- `GET /api/admin/stats`
- `GET|POST|PATCH|DELETE /api/admin/exercises`
- `GET|POST|PATCH|DELETE /api/admin/training-plans`
- `GET|POST|PATCH|DELETE /api/admin/articles`
- `GET|POST|PATCH|DELETE /api/admin/banners`
- `GET|POST|PATCH|DELETE /api/admin/notifications`

Admin routes require an admin JWT. The admin panel handles login and stores the token in browser local storage.

## Next.js Admin Panel

The `../web-admin` folder contains the Next.js admin panel with dashboard charts, detailed record pages, and CRUD forms.

```bash
cd ../web-admin
npm install
copy .env.example .env.local
npm run dev
```
