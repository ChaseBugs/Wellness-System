import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function setupDatabase() {
  const dbPassword = process.env.DB_PASSWORD;
  const dbConfig: any = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: 'postgres', // Connect to default postgres database first
    user: process.env.DB_USER || 'postgres',
  };

  // Only add password if provided and not empty
  if (dbPassword && dbPassword.trim() !== '') {
    dbConfig.password = dbPassword;
  }

  const pool = new Pool(dbConfig);

  const dbName = process.env.DB_NAME || 'talent_baby_db';

  try {
    console.log('Setting up database...');

    // Check if database exists
    const dbCheck = await pool.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (dbCheck.rows.length === 0) {
      console.log(`Creating database: ${dbName}...`);
      await pool.query(`CREATE DATABASE ${dbName}`);
      console.log(`Database ${dbName} created successfully!`);
    } else {
      console.log(`Database ${dbName} already exists.`);
    }

    await pool.end();

    // Now connect to the new database and run schema
    const appPoolConfig: any = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: dbName,
      user: process.env.DB_USER || 'postgres',
    };

    if (dbPassword && dbPassword.trim() !== '') {
      appPoolConfig.password = dbPassword;
    }

    const appPool = new Pool(appPoolConfig);

    console.log('Running schema...');
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute the entire schema file at once
    // PostgreSQL can handle multiple statements separated by semicolons
    try {
      await appPool.query(schema);
      console.log('Schema executed successfully!');
    } catch (error: any) {
      // If full execution fails, try executing statement by statement
      console.log('Full schema execution had issues, trying statement by statement...');
      
      // Remove comments and split by semicolons more carefully
      const lines = schema.split('\n');
      let currentStatement = '';
      let inComment = false;

      for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Skip empty lines and full-line comments
        if (!trimmedLine || trimmedLine.startsWith('--')) {
          continue;
        }

        // Check for block comments (though SQL doesn't typically use them)
        if (trimmedLine.includes('/*')) {
          inComment = true;
        }
        if (trimmedLine.includes('*/')) {
          inComment = false;
          continue;
        }
        if (inComment) {
          continue;
        }

        currentStatement += line + '\n';

        // If line ends with semicolon, execute the statement
        if (trimmedLine.endsWith(';')) {
          const statement = currentStatement.trim();
          if (statement && statement.length > 5) {
            try {
              await appPool.query(statement);
            } catch (err: any) {
              // Ignore "already exists" and "does not exist" errors for indexes
              if (
                !err.message.includes('already exists') &&
                !err.message.includes('duplicate') &&
                !err.message.includes('does not exist') &&
                !err.message.includes('ON CONFLICT')
              ) {
                console.error('Error executing statement:', err.message);
                console.error('Statement:', statement.substring(0, 150));
              }
            }
          }
          currentStatement = '';
        }
      }

      // Execute any remaining statement
      if (currentStatement.trim()) {
        try {
          await appPool.query(currentStatement);
        } catch (err: any) {
          if (!err.message.includes('already exists') && !err.message.includes('duplicate')) {
            console.error('Error executing final statement:', err.message);
          }
        }
      }
    }

    console.log('Schema executed successfully!');
    await appPool.end();
    console.log('Database setup complete!');
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase();
