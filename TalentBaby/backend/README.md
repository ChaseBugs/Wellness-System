# Talent Baby Backend

Express.js + TypeScript backend for the Talent Baby application.

## Features

- RESTful API with Express.js
- PostgreSQL database
- JWT authentication
- Swagger API documentation
- Comprehensive logging with Winston
- Input validation
- Error handling middleware

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file (see `.env.example` for template)

3. Setup PostgreSQL database:
   ```bash
   createdb talent_baby_db
   psql -U postgres -d talent_baby_db -f database/schema.sql
   ```

4. Run development server:
   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev` - Start development server with nodemon
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## API Documentation

Access Swagger UI at: `http://localhost:3004/api-docs`

## Project Structure

```
backend/
├── src/
│   ├── app.ts              # Express app setup
│   ├── config/             # Configuration (database, etc.)
│   ├── controllers/        # Request handlers
│   ├── services/           # Business logic
│   ├── repositories/       # Data access layer
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   └── utils/              # Utility functions
├── database/
│   └── schema.sql          # Database schema
└── logs/                   # Application logs
```

## Environment Variables

- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 3004)
- `DB_HOST` - Database host
- `DB_PORT` - Database port
- `DB_NAME` - Database name
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password
- `JWT_SECRET` - JWT secret key
- `JWT_EXPIRES_IN` - JWT expiration (default: 7d)
- `LOG_LEVEL` - Logging level (default: info)
