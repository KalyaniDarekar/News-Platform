// ========================================================================
// The Bharat Chronicle — Database Migration & Seeding Runner
// Supports command line execution on local machines and cPanel terminals
// Usage: node database/migrate.js [--seed]
// ========================================================================

import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true,
  charset: 'utf8mb4'
};

const DB_NAME = process.env.DB_NAME || 'bharat_chronicle_db';

export async function runMigrations({ shouldSeed = true } = {}) {
  console.log(`=======================================================`);
  console.log(`🚀 Starting Bharat Chronicle Database Migration`);
  console.log(`Target: ${dbConfig.host}:${dbConfig.port} | Database: ${DB_NAME}`);
  console.log(`=======================================================`);

  let connection;
  try {
    // 1. Initial connection without database selection to ensure DB exists
    connection = await mysql.createConnection(dbConfig);
    console.log(`✓ Connected to MySQL server successfully.`);

    // 2. Create database if not exists with utf8mb4 encoding
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    console.log(`✓ Database \`${DB_NAME}\` verified / created.`);

    await connection.query(`USE \`${DB_NAME}\`;`);

    // 3. Execute schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      console.log(`Executing schema.sql (${schemaSql.length} bytes)...`);
      await connection.query(schemaSql);
      console.log(`✓ All schema tables, foreign keys, and indexes created successfully.`);
    } else {
      throw new Error(`schema.sql not found at ${schemaPath}`);
    }

    // 4. Optionally execute seed.sql
    if (shouldSeed) {
      const seedPath = path.join(__dirname, 'seed.sql');
      if (fs.existsSync(seedPath)) {
        const seedSql = fs.readFileSync(seedPath, 'utf8');
        console.log(`Executing seed.sql (${seedSql.length} bytes)...`);
        await connection.query(seedSql);
        console.log(`✓ Seed data (staff, multilingual news, permissions, ads, settings) populated.`);
      }
    }

    // 5. Verify created tables
    const [tables] = await connection.query(`SHOW TABLES;`);
    console.log(`\n📋 Verified ${tables.length} tables in \`${DB_NAME}\`:`);
    tables.forEach((t) => {
      const tableName = Object.values(t)[0];
      console.log(`   - ${tableName}`);
    });

    console.log(`\n🎉 Migration completed successfully! Database is ready for production.`);
    return { success: true, tableCount: tables.length };
  } catch (error) {
    console.error(`❌ Migration failed:`, error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Direct execution from CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const shouldSeed = !process.argv.includes('--no-seed');
  runMigrations({ shouldSeed })
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
