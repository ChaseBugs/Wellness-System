# Height Increase Web Admin

Next.js admin panel for the Height Increase backend.

## Setup

```bash
cd web-admin
npm install
copy .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

Default seeded admin:

- Email: `admin@height.local`
- Password: `Admin123!`

## Screens

- Dashboard with totals, workout trend chart, content mix chart, user status chart, and report activity chart
- CRUD tables for users, exercises, training plans, articles, banners, notifications, goals, logs, and settings
- Detail pages for every record
- Forms include `doctor_verified` and `setup` where the backend model supports those fields
