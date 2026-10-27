# The Bharat Chronicle — cPanel & Node.js Deployment Guide

This guide details the exact steps to deploy **The Bharat Chronicle** on a shared hosting or VPS environment running **cPanel** with **Node.js Selector (Phusion Passenger)** and **MySQL**.

---

## 1. Architecture Overview on cPanel

A commercial news platform on cPanel runs in a high-efficiency dual or unified model:

```
[ Visitor / CDN (Cloudflare) ]
          │
          ▼
   [ cPanel Apache / LiteSpeed Web Server ]
   ┌──────────────────────┴──────────────────────┐
   ▼                                             ▼
Static Frontend (/public_html or dist)      Node.js App (Passenger)
- HTML5, CSS bundles, Vite JS              - Express API (/api/*)
- Media uploads & cached news assets       - MySQL Connection Pool (3306)
```

---

## 2. Step 1: MySQL Database Setup in cPanel

1. Log into your cPanel account.
2. Under **Databases**, open **MySQL Database Wizard**:
   - **Step 1: Database Name**: e.g., `cpuser_chronicle_db`
   - **Step 2: Database User**: e.g., `cpuser_newsadmin` with a strong password.
   - **Step 3: Privileges**: Check **ALL PRIVILEGES** and confirm.
3. Open **phpMyAdmin** from cPanel:
   - Select your new database.
   - Go to the **Import** tab.
   - Upload and execute `server/database/schema.sql`.
   - Next, upload and execute `server/database/seed.sql` to populate initial categories and editorial roles.

---

## 3. Step 2: Configure the Node.js Application in cPanel

1. In cPanel, find **Software** ➔ **Setup Node.js App**.
2. Click **Create Application**:
   - **Node.js version**: Choose `18.x`, `20.x`, or `22.x` (LTS recommended).
   - **Application mode**: `Production`.
   - **Application root**: `server` (or directory where server code resides, e.g. `news-platform/server` or `api`).
   - **Application URL**: `api.jantajournal.in` (recommended) or `jantajournal.in/api`.
   - **Application startup file**: `app.cjs` *(CRITICAL: Must be `app.cjs`, NOT `server.js`! cPanel Phusion Passenger uses CommonJS `require()`. `app.cjs` bridges Passenger directly to the ES Module server without crashing with `ERR_REQUIRE_ESM`)*.
3. In the Application configuration screen:
   - Add **Environment Variables** (or maintain `server/.env` directly):
     ```env
     NODE_ENV=production
     PORT=3000
     CLIENT_URL=https://jantajournal.in
     DB_HOST=localhost
     DB_PORT=3306
     DB_NAME=jantajou_info
     DB_USER=jantajou_sanskar
     DB_PASSWORD=YourDatabasePassword
     JWT_SECRET=your_long_random_jwt_secret_here
     ```
4. Click **Create** or **Save**.
5. Click **Run NPM Install** in the cPanel interface, or open the cPanel Terminal and run:
   ```bash
   cd server
   npm install --production
   ```
6. Click **Restart** to boot the Node.js service.

---

## 4. Step 3: Frontend Build & Asset Deployment

1. On your local machine:
   ```bash
   npm run client:build
   ```
   Or create both ready-to-upload zip archives automatically:
   ```bash
   npm run pack:cpanel
   ```
   This generates:
   - `client/dist.zip` — Ready to upload directly to cPanel `public_html/`.
   - `server.zip` — Ready to upload to your cPanel Node.js application directory.

2. **Deploying to `public_html/`**:
   - Open cPanel **File Manager**.
   - Navigate into `public_html/`.
   - Upload `client/dist.zip` and **Extract** its contents.
   - **IMPORTANT (Avoid 404 on refresh)**: Ensure the `.htaccess` file is present in `public_html/`.
     - In cPanel File Manager, click **Settings** (top right gear icon) ➔ check **Show Hidden Files (dotfiles)** ➔ click **Save**.
     - Verify that `.htaccess` exists in `public_html/`.
   - Here is the complete, battle-tested `.htaccess` required for React Router on Apache / LiteSpeed:

   ```apache
   # Apache / LiteSpeed .htaccess for React Router Single Page Application (SPA)
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /

     # CRITICAL: Disable MultiViews so Apache mod_negotiation does not 404 on /admin or /category/*
     Options -MultiViews
     Options -Indexes

     # If the requested resource is an existing file or directory, serve it directly
     RewriteCond %{REQUEST_FILENAME} -f [OR]
     RewriteCond %{REQUEST_FILENAME} -d
     RewriteRule ^ - [L]

     # Route all other URLs to index.html for client-side React Router
     RewriteRule ^ index.html [L]
   </IfModule>
   ```

---

## 5. Troubleshooting Common cPanel Issues

### Issue A: 404 Not Found on Page Refresh (`/admin`, `/admin/login`, `/tech`, etc.)
- **Cause**: React Router handles routing in the browser. When a user hits refresh, Apache looks on the server disk for a physical file named `/admin` or `/admin/index.html`. Finding none, Apache serves a 404 error.
- **Fix**:
  1. Open cPanel File Manager ➔ click **Settings** (top right) ➔ check **Show Hidden Files (dotfiles)**.
  2. Verify that `.htaccess` exists directly inside `public_html/`.
  3. Ensure `Options -MultiViews` is present in `.htaccess` (without this, Apache tries content negotiation before rewriting and returns 404).

### Issue B: 503 Service Unavailable on Backend Server URL
- **Cause 1 (`ERR_REQUIRE_ESM`)**: Phusion Passenger boots applications using CommonJS `require()`. In Node ES Modules (`"type": "module"`), `require('server.js')` throws a fatal error on startup, causing Passenger to show `503 Service Unavailable`.
  - **Fix**: In cPanel **Setup Node.js App**, change **Application startup file** to `app.cjs`. Click **Save** and **Restart**.
- **Cause 2 (Node Version / `node:sqlite`)**: Node versions < 22.5.0 do not support native `node:sqlite`.
  - **Fix**: Our updated code safely handles `node:sqlite` dynamically so the server never crashes on Node 18.x or 20.x LTS.
- **Cause 3 (Missing Dependencies)**: `node_modules` was not installed on the Linux server.
  - **Fix**: Go to cPanel **Setup Node.js App** and click **Run NPM Install**, or run `npm install --production` via cPanel terminal.
- **Cause 4 (MySQL User Privileges)**: MySQL database user was created but not linked to the database with privileges.
  - **Fix**: In cPanel ➔ **MySQL Databases** ➔ scroll to **Add User to Database** ➔ select User & Database ➔ click **Add** ➔ check **ALL PRIVILEGES** ➔ click **Make Changes**.

---

## 6. Step 4: Scheduled News & Expiry Automation (Cron)

In cPanel, open **Cron Jobs** and configure a 5-minute task to check for scheduled article releases:
```bash
*/5 * * * * curl -s https://api.jantajournal.in/api/articles/cron/publish > /dev/null 2>&1
```

---

## 7. Security & Performance Best Practices

1. **Enable HTTPS / SSL**: Install free AutoSSL or Let's Encrypt via cPanel SSL/TLS Manager.
2. **Cloudflare CDN Integration**: Cache static images, fonts, and CSS bundles with a 1-year max-age.
3. **HTTP/2 & Brotli**: Automatically enabled when behind LiteSpeed or modern Apache on cPanel.

