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
   - **Application root**: `news-platform/server` (or directory where server code resides).
   - **Application URL**: `api.yourdomain.com` or `yourdomain.com/api`.
   - **Application startup file**: `server.js`.
3. In the Application configuration screen:
   - Add **Environment Variables**:
     ```env
     NODE_ENV=production
     PORT=3000
     CLIENT_URL=https://yourdomain.com
     DB_HOST=localhost
     DB_PORT=3306
     DB_NAME=cpuser_chronicle_db
     DB_USER=cpuser_newsadmin
     DB_PASSWORD=YourSecurePasswordHere
     JWT_SECRET=production_random_sha256_string_here
     ```
4. Click **Create** or **Save**.
5. Click **Run NPM Install** in the cPanel interface, or open the cPanel Terminal and run:
   ```bash
   cd news-platform/server
   npm install --production
   ```

---

## 4. Step 3: Frontend Build & Asset Deployment

1. On your local machine or CI/CD:
   ```bash
   npm run client:build
   ```
2. The generated production output will be in `client/dist`.
3. Options to serve:
   - **Option A (Highest Performance — Recommended)**:
     Upload the contents of `client/dist/` directly into your cPanel `public_html/`. Add an `.htaccess` rewrite rule for React Router:
     ```apache
     <IfModule mod_rewrite.c>
       RewriteEngine On
       RewriteBase /
       RewriteRule ^index\.html$ - [L]
       RewriteCond %{REQUEST_FILENAME} !-f
       RewriteCond %{REQUEST_FILENAME} !-d
       RewriteRule . /index.html [L]
     </IfModule>
     ```
   - **Option B (Unified Express Server)**:
     Let Express serve `client/dist/` directly (as preconfigured in `server/server.js`).

---

## 5. Step 4: Scheduled News & Expiry Automation (Cron)

In cPanel, open **Cron Jobs** and configure a 5-minute task to check for scheduled article releases:
```bash
*/5 * * * * curl -s https://yourdomain.com/api/articles/cron/publish > /dev/null 2>&1
```

---

## 6. Security & Performance Best Practices

1. **Enable HTTPS / SSL**: Install free AutoSSL or Let's Encrypt via cPanel SSL/TLS Manager.
2. **Cloudflare CDN Integration**: Cache static images, fonts, and CSS bundles with a 1-year max-age.
3. **HTTP/2 & Brotli**: Automatically enabled when behind LiteSpeed or modern Apache on cPanel.
