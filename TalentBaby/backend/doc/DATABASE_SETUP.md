# Database Setup Guide

## Prerequisites
- PostgreSQL installed and running
- PostgreSQL user credentials

## Setup Steps

### 1. Update .env file
Edit the `.env` file in the backend directory and set your PostgreSQL password:

```env
DB_PASSWORD=your_postgres_password
```

### 2. Create Database Manually (Option 1)

Using PostgreSQL command line:
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE talent_baby_db;

# Exit psql
\q

# Run schema
psql -U postgres -d talent_baby_db -f database/schema.sql
```

### 3. Run Setup Script (Option 2)

After updating .env with your password:
```bash
npx ts-node scripts/setup-database.ts
```

### 4. Verify Database

Check if database was created:
```bash
psql -U postgres -c "\l" | grep talent_baby_db
```

## Troubleshooting

### Error: "client password must be a string"
- Make sure `DB_PASSWORD` in `.env` is set to your actual PostgreSQL password
- If PostgreSQL has no password, try setting it to an empty string: `DB_PASSWORD=""`

### Error: "database does not exist"
- Run the setup script or create the database manually

### Error: "connection refused"
- Make sure PostgreSQL is running
- Check `DB_HOST` and `DB_PORT` in `.env`
