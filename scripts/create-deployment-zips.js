/**
 * Deployment Packaging Script for cPanel
 * Generates:
 * 1. client/dist.zip - Contains files directly at root (including .htaccess) for extraction straight into public_html
 * 2. server.zip - Contains all server files + app.cjs bridge, ready for cPanel Node.js App
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('📦 Starting deployment package creation for cPanel...\n');

// 1. Pack Client dist (with .htaccess at the root of the zip)
const distDir = path.join(rootDir, 'client', 'dist');
const clientZip = path.join(rootDir, 'client', 'dist.zip');

if (fs.existsSync(distDir)) {
  console.log('1️⃣ Packaging frontend client (client/dist.zip)...');
  // Ensure .htaccess exists in dist
  const publicHtaccess = path.join(rootDir, 'client', 'public', '.htaccess');
  const distHtaccess = path.join(distDir, '.htaccess');
  if (fs.existsSync(publicHtaccess)) {
    fs.copyFileSync(publicHtaccess, distHtaccess);
  }

  // Remove old zip if present
  if (fs.existsSync(clientZip)) fs.unlinkSync(clientZip);

  // Use powershell Compress-Archive to archive dist contents directly to zip root
  const psCmd = `powershell -Command "Get-ChildItem -Force -Path '${distDir}\\*' | Compress-Archive -DestinationPath '${clientZip}' -Force"`;
  try {
    execSync(psCmd, { stdio: 'inherit' });
    console.log(`   ✓ client/dist.zip created successfully (${(fs.statSync(clientZip).size / 1024).toFixed(1)} KB)`);
  } catch (err) {
    console.warn('   ⚠️ PowerShell Compress-Archive error:', err.message);
  }
} else {
  console.warn('   ⚠️ client/dist directory not found. Run "npm run client:build" first.');
}

// 2. Pack Server (excluding node_modules, data/sqlite, and .git for clean Linux install)
const serverDir = path.join(rootDir, 'server');
const serverZip = path.join(rootDir, 'server.zip');

console.log('\n2️⃣ Packaging backend server (server.zip)...');
// Remove old zip if present
if (fs.existsSync(serverZip)) fs.unlinkSync(serverZip);

// Copy .htaccess into root and docs for easy reference
const rootHtaccess = path.join(rootDir, '.htaccess');
if (fs.existsSync(path.join(rootDir, 'client', 'public', '.htaccess'))) {
  fs.copyFileSync(path.join(rootDir, 'client', 'public', '.htaccess'), rootHtaccess);
}

// Create clean server zip using PowerShell Compress-Archive excluding node_modules
const psServerCmd = `powershell -Command "$files = Get-ChildItem -Force -Path '${serverDir}' -Exclude 'node_modules', '*.sqlite', '*.sqlite-journal'; Compress-Archive -Path $files.FullName -DestinationPath '${serverZip}' -Force"`;
try {
  execSync(psServerCmd, { stdio: 'inherit' });
  console.log(`   ✓ server.zip created successfully (${(fs.statSync(serverZip).size / 1024).toFixed(1)} KB)`);
} catch (err) {
  console.warn('   ⚠️ PowerShell Compress-Archive for server error:', err.message);
}

console.log('\n✨ Deployment packages ready for cPanel upload!');
