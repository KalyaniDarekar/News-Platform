# Phase 3: Automated Publication & Expiry Setup Guide (cPanel & Production)

This guide documents the automated background worker for **The Bharat Chronicle** digital news platform.

---

## 1. How the Expiry & Embargo System Works

The newsroom platform features dual-layer enforcement:

1. **Instant SQL WHERE Protection (Immediate)**
   All public queries (`listArticles`, `getArticleBySlug`, search, RSS) include:
   ```sql
   WHERE status = 'published'
     AND (publication_time IS NULL OR publication_time <= NOW())
     AND (expiry_time IS NULL OR expiry_time > NOW())
   ```
   Even if the cron has not yet run, expired stories are **immediately hidden** from readers once their `expiry_time` passes.

2. **Automated Cron Processor (State Reconciliation & Cleanup)**
   The background script transitions database statuses and logs audit trails:
   - `scheduled` → `published`: Where `scheduled_publication_time <= NOW()`
   - `published` → `expired`: Where `expiry_time <= NOW()`
   - Clears `is_breaking` and `is_featured` flags on expiration
   - Records immutable entries in `audit_logs` for reporting compliance

---

## 2. cPanel Cron Job Configuration

### Step 1: Open cPanel Cron Manager
1. Log into your hosting **cPanel**.
2. Scroll to the **Advanced** section.
3. Click **Cron Jobs**.

### Step 2: Set Frequency
Select **Common Settings** → **Once Per Minute (* * * * *)** or **Every 5 Minutes (*/5 * * * *)**:

| Field | Value | Meaning |
|---|---|---|
| **Minute** | `*` (or `*/5`) | Every 1 (or 5) minutes |
| **Hour** | `*` | Every hour |
| **Day** | `*` | Every day |
| **Month** | `*` | Every month |
| **Weekday** | `*` | Every day of the week |

### Step 3: Enter Cron Command

Replace `/home/yourusername/` with your actual cPanel home directory path:

```bash
/usr/local/bin/node /home/yourusername/News-Platform/server/cron/expiry-processor.js >> /home/yourusername/logs/cron.log 2>&1
```

*Note: Verify the Node.js path on your server by running `which node` in cPanel Terminal or SSH.*

---

## 3. Alternative: HTTP Webhook Trigger (Protected Endpoint)

If your host restricts CLI execution or uses an external uptime monitor (e.g., UptimeRobot, cron-job.org), trigger the endpoint via HTTP POST:

```bash
curl -X POST https://yourdomain.com/api/v1/articles/cron/publish \
  -H "X-Cron-Secret: YOUR_SECRET_KEY_HERE"
```

Configure `CRON_SECRET` in your `.env` file to protect this endpoint.

---

## 4. Timezone Reference

- **MySQL Database Storage**: Always UTC (`NOW()` and ISO 8601 strings).
- **cPanel Server Clock**: Standard UTC.
- **Editorial Newsroom Display**: Indian Standard Time (`IST` = `UTC+5:30`).
- The Admin UI automatically converts datetime pickers between local IST input and UTC payload.

---

## 5. Verification & Testing

To test the script locally or on the server:

```bash
cd server
node cron/expiry-processor.js
```

Sample expected output:
```
[2026-10-13T00:30:00.000Z] ==========================================
[2026-10-13T00:30:00.000Z] [CRON START] Newsroom Expiry & Embargo Runner
[2026-10-13T00:30:00.038Z] [CRON COMPLETE] Successfully processed in 38ms
[2026-10-13T00:30:00.038Z]   -> Articles Published : 0
[2026-10-13T00:30:00.038Z]   -> Articles Expired   : 0
[2026-10-13T00:30:00.040Z] [CRON EXIT] MySQL pool closed.
```
