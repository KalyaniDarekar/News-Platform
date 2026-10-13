#!/usr/bin/env node
// ========================================================================
// The Bharat Chronicle — Standalone Newsroom Expiry & Embargo Processor
// Phase 3 — Production Cron Job Script
//
// Designed to run via cPanel cron / crontab every 1-5 minutes:
//   * * * * * /usr/local/bin/node /path/to/server/cron/expiry-processor.js >> /path/to/cron.log 2>&1
//
// Guaranteed Idempotent:
//   • Only transitions 'scheduled' -> 'published' where scheduled_time <= NOW()
//   • Only transitions 'published' -> 'expired' where expiry_time <= NOW()
//   • Running multiple times within the same minute is completely safe.
//   • Closes MySQL pool cleanly before exiting.
// ========================================================================

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env relative to server root
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

import { articleService } from '../services/articleService.js';
import pool from '../config/database.js';

async function main() {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();

  console.log(`[${timestamp}] ==========================================`);
  console.log(`[${timestamp}] [CRON START] Newsroom Expiry & Embargo Runner`);

  try {
    const result = await articleService.processScheduledAndExpiringArticles();
    const durationMs = Date.now() - startTime;

    console.log(`[${timestamp}] [CRON COMPLETE] Successfully processed in ${durationMs}ms`);
    console.log(`[${timestamp}]   -> Articles Published : ${result.publishedCount}`);
    console.log(`[${timestamp}]   -> Articles Expired   : ${result.expiredCount}`);
  } catch (err) {
    console.error(`[${timestamp}] [CRON ERROR] Expiry processing failed:`, err);
    process.exitCode = 1;
  } finally {
    // Gracefully drain pool connections so the CLI process exits immediately
    try {
      await pool.end();
      console.log(`[${timestamp}] [CRON EXIT] MySQL pool closed.`);
    } catch (closeErr) {
      console.warn(`[${timestamp}] [CRON WARNING] Pool drain notice:`, closeErr.message);
    }
  }
}

main();
