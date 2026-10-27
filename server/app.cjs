/**
 * JANTA JOURNAL News Platform — cPanel Phusion Passenger Bootstrap Bridge
 * 
 * WHY THIS FILE EXISTS:
 * cPanel's "Setup Node.js App" runs your application using Phusion Passenger.
 * Passenger boots applications using CommonJS require().
 * Because the backend uses modern ES Modules ("type": "module" in package.json),
 * requiring server.js directly throws "ERR_REQUIRE_ESM", causing Passenger to fail
 * with a "503 Service Unavailable" error.
 * 
 * This .cjs file serves as a CommonJS bridge: Passenger requires app.cjs, which
 * then dynamically imports the full ES Module Express app in server.js!
 */

(async () => {
  try {
    console.log('[cPanel Passenger Bridge] Booting JANTA JOURNAL API (ES Module)...');
    await import('./server.js');
    console.log('[cPanel Passenger Bridge] Server loaded successfully.');
  } catch (err) {
    console.error('================================================================');
    console.error('[cPanel Passenger Boot Error]: Server failed to initialize:');
    console.error(err);
    console.error('================================================================');
    process.exit(1);
  }
})();
