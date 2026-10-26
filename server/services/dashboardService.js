// ========================================================================
// Newsroom Dashboard Service — Phase 3
//
// Provides real-time editorial metrics for the admin dashboard:
//   • Article status counts (published, draft, scheduled, in_review, expired, archived)
//   • Expiring-soon count (next 24 h) and expiring-next-7-days table
//   • Total cumulative view count
//   • Today's publication count
//   • Recent activity feed from audit_logs
//   • Upcoming scheduled publication table
// ========================================================================

import { query } from '../config/database.js';

export const dashboardService = {

  // -----------------------------------------------------------------------
  // Main stats object — one round-trip per parallel Promise.all
  // -----------------------------------------------------------------------
  async getStats() {
    try {
      const [
        statusCounts,
        expiringSoonRow,
        totalViewsRow,
        todayPublishedRow,
        expiringArticles,
        scheduledArticles,
        recentActivity,
        topArticles,
        inReviewArticlesRow,
        enquiryCountsRow,
        recentEnquiriesRow
      ] = await Promise.all([

        // 1. Count per status
        query(`
          SELECT
            COALESCE(SUM(status = 'published' AND (expiry_time IS NULL OR expiry_time > NOW())), 0) AS published,
            COALESCE(SUM(status = 'draft'),     0) AS draft,
            COALESCE(SUM(status = 'scheduled'), 0) AS scheduled,
            COALESCE(SUM(status = 'in_review'), 0) AS in_review,
            COALESCE(SUM(status = 'expired'),   0) AS expired,
            COALESCE(SUM(status = 'archived'),  0) AS archived,
            COUNT(*)                                AS total
          FROM articles
        `),

        // 2. Expiring within the next 24 hours
        query(`
          SELECT COUNT(*) AS count
          FROM articles
          WHERE status = 'published'
            AND expiry_time IS NOT NULL
            AND expiry_time > NOW()
            AND expiry_time <= DATE_ADD(NOW(), INTERVAL 24 HOUR)
        `),

        // 3. Cumulative view count
        query(`SELECT COALESCE(SUM(view_count), 0) AS total_views FROM articles`),

        // 4. Articles published today
        query(`
          SELECT COUNT(*) AS count
          FROM articles
          WHERE status = 'published'
            AND DATE(publication_time) = CURDATE()
        `),

        // 5. Articles expiring in the next 7 days
        query(`
          SELECT id, title, slug, expiry_time, status
          FROM articles
          WHERE status = 'published'
            AND expiry_time IS NOT NULL
            AND expiry_time > NOW()
            AND expiry_time <= DATE_ADD(NOW(), INTERVAL 7 DAY)
          ORDER BY expiry_time ASC
          LIMIT 10
        `),

        // 6. Upcoming scheduled articles
        query(`
          SELECT
            a.id, a.title, a.slug,
            a.scheduled_publication_time, a.expiry_time,
            c.name AS category_name,
            u.full_name AS author_name
          FROM articles a
          LEFT JOIN categories c ON a.category_id = c.id
          LEFT JOIN users u ON a.author_id = u.id
          WHERE a.status = 'scheduled'
            AND a.scheduled_publication_time IS NOT NULL
            AND a.scheduled_publication_time > NOW()
          ORDER BY a.scheduled_publication_time ASC
          LIMIT 10
        `),

        // 7. Recent editorial activity
        query(`
          SELECT
            al.id, al.action, al.entity_type, al.entity_id,
            al.details, al.ip_address, al.created_at,
            u.full_name AS actor_name,
            u.role      AS actor_role
          FROM audit_logs al
          LEFT JOIN users u ON al.user_id = u.id
          ORDER BY al.created_at DESC
          LIMIT 15
        `),

        // 8. Top-5 articles by view count
        query(`
          SELECT
            a.id, a.title, a.slug, a.view_count,
            a.reading_time_minutes, a.publication_time,
            c.name AS category_name,
            u.full_name AS author_name
          FROM articles a
          LEFT JOIN categories c ON a.category_id = c.id
          LEFT JOIN users u ON a.author_id = u.id
          WHERE a.status = 'published'
            AND (a.expiry_time IS NULL OR a.expiry_time > NOW())
          ORDER BY a.view_count DESC
          LIMIT 5
        `),

        // 9. Articles awaiting editorial review
        query(`
          SELECT
            a.id, a.title, a.slug, a.updated_at, a.created_at,
            c.name AS category_name,
            u.full_name AS author_name
          FROM articles a
          LEFT JOIN categories c ON a.category_id = c.id
          LEFT JOIN users u ON a.author_id = u.id
          WHERE a.status = 'in_review'
          ORDER BY a.updated_at DESC, a.created_at DESC
          LIMIT 10
        `),

        // 10. Advertiser enquiries counts
        query(`
          SELECT
            COALESCE(SUM(status = 'new'), 0) AS new_enquiries,
            COUNT(*) AS total_enquiries
          FROM advertiser_enquiries
        `).catch(() => [{ new_enquiries: 0, total_enquiries: 0 }]),

        // 11. Recent advertiser enquiries
        query(`
          SELECT
            id, company_name, contact_name, email, phone,
            budget_range, preferred_placements, status, created_at
          FROM advertiser_enquiries
          ORDER BY created_at DESC
          LIMIT 6
        `).catch(() => [])
      ]);

      const sc = statusCounts[0];
      const expiringSoon = Number(expiringSoonRow[0]?.count || 0);
      const totalViews = Number(totalViewsRow[0]?.total_views || 0);
      const publishedToday = Number(todayPublishedRow[0]?.count || 0);
      const inReviewArticles = inReviewArticlesRow || [];
      const newEnquiries = Number(enquiryCountsRow?.[0]?.new_enquiries || 0);
      const totalEnquiries = Number(enquiryCountsRow?.[0]?.total_enquiries || 0);
      const recentEnquiries = (recentEnquiriesRow || []).map(r => {
        let placements = [];
        try {
          placements = typeof r.preferred_placements === 'string' ? JSON.parse(r.preferred_placements) : (r.preferred_placements || []);
        } catch {
          placements = [];
        }
        return { ...r, preferred_placements: placements };
      });

      const counts = {
        published:        Number(sc.published),
        draft:            Number(sc.draft),
        scheduled:        Number(sc.scheduled),
        in_review:        Number(sc.in_review),
        expired:          Number(sc.expired),
        archived:         Number(sc.archived),
        total:            Number(sc.total),
        new_enquiries:    newEnquiries,
        total_enquiries:  totalEnquiries,
        expiringSoon,
        publishedToday
      };

      return {
        // Dual property keys (both camelCase and snake_case) for seamless UI rendering
        counts,
        new_enquiries_count:   newEnquiries,
        total_enquiries_count: totalEnquiries,
        recent_enquiries:      recentEnquiries,
        expiring_soon_24h:     expiringSoon,
        expiringSoon,
        total_views:           totalViews,
        totalViews,
        published_today:       publishedToday,
        publishedToday,
        expiring_next_7_days:  expiringArticles,
        expiringArticles,
        upcoming_scheduled:    scheduledArticles,
        scheduledArticles,
        in_review_articles:    inReviewArticles,
        inReviewArticles,
        recent_activity:       recentActivity,
        recentActivity,
        top_articles:          topArticles,
        topArticles
      };
    } catch (err) {
      console.warn('[Dashboard] Database query notice:', err.message);

      // Safe fallback data on operational notice
      return {
        counts: {
          published: 0,
          draft: 0,
          scheduled: 0,
          in_review: 0,
          expired: 0,
          archived: 0,
          total: 0,
          expiringSoon: 0,
          publishedToday: 0
        },
        expiring_soon_24h: 0,
        expiringSoon: 0,
        total_views: 0,
        totalViews: 0,
        published_today: 0,
        publishedToday: 0,
        expiring_next_7_days: [],
        expiringArticles: [],
        upcoming_scheduled: [],
        scheduledArticles: [],
        in_review_articles: [],
        inReviewArticles: [],
        recent_activity: [],
        recentActivity: [],
        top_articles: [],
        topArticles: []
      };
    }
  },

  // -----------------------------------------------------------------------
  // Lightweight ping-style stats for polling
  // -----------------------------------------------------------------------
  async getQuickCounts() {
    try {
      const [articleRows, enquiryRows] = await Promise.all([
        query(`
          SELECT
            COALESCE(SUM(status = 'published' AND (expiry_time IS NULL OR expiry_time > NOW())), 0) AS published,
            COALESCE(SUM(status = 'draft'),     0) AS draft,
            COALESCE(SUM(status = 'scheduled'), 0) AS scheduled,
            COALESCE(SUM(status = 'in_review'), 0) AS in_review,
            COALESCE(SUM(status = 'expired'),   0) AS expired,
            COALESCE(SUM(status = 'archived'),  0) AS archived,
            COUNT(*)                                AS total,
            COALESCE(SUM(
              status = 'published'
              AND expiry_time IS NOT NULL
              AND expiry_time > NOW()
              AND expiry_time <= DATE_ADD(NOW(), INTERVAL 24 HOUR)
            ), 0) AS expiring_soon,
            COALESCE(SUM(view_count), 0) AS total_views
          FROM articles
        `),
        query(`
          SELECT
            COALESCE(SUM(status = 'new'), 0) AS new_enquiries,
            COUNT(*) AS total_enquiries
          FROM advertiser_enquiries
        `).catch(() => [{ new_enquiries: 0, total_enquiries: 0 }])
      ]);

      const row = articleRows[0] || {};
      const eqRow = enquiryRows?.[0] || {};

      return {
        published:        Number(row.published || 0),
        draft:            Number(row.draft || 0),
        scheduled:        Number(row.scheduled || 0),
        in_review:        Number(row.in_review || 0),
        expired:          Number(row.expired || 0),
        archived:         Number(row.archived || 0),
        total:            Number(row.total || 0),
        new_enquiries:    Number(eqRow.new_enquiries || 0),
        total_enquiries:  Number(eqRow.total_enquiries || 0),
        expiringSoon:     Number(row.expiring_soon || 0),
        totalViews:       Number(row.total_views || 0)
      };
    } catch (err) {
      console.error('[Dashboard Quick Counts Error]', err);
      return {
        published: 0,
        draft: 0,
        scheduled: 0,
        in_review: 0,
        expired: 0,
        archived: 0,
        total: 0,
        expiringSoon: 0,
        totalViews: 0
      };
    }
  }
};

export default dashboardService;
