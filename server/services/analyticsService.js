// ========================================================================
// Real Newsroom Telemetry & Analytics Service
// Queries real database records for publication counts, view events, and ads
// ========================================================================

import { query } from '../config/database.js';

export const analyticsService = {
  // Aggregate real operational statistics for the newsroom dashboard
  async getDashboardAnalytics() {
    // 1. Articles published today
    const [pubToday] = await query(
      `SELECT COUNT(*) as count FROM articles 
       WHERE status = 'published' AND DATE(publication_time) = CURDATE()`
    );

    // 2. Drafts pending review
    const [pending] = await query(
      `SELECT COUNT(*) as count FROM articles WHERE status = 'in_review'`
    );

    // 3. Scheduled embargoed stories
    const [scheduled] = await query(
      `SELECT COUNT(*) as count FROM articles WHERE status = 'scheduled'`
    );

    // 4. Total views across all published articles
    const [views] = await query(
      `SELECT COALESCE(SUM(view_count), 0) as total_views FROM articles`
    );

    // 5. Hourly views for last 24 hours
    const hourlyViews = await query(
      `SELECT DATE_FORMAT(view_hour, '%Y-%m-%d %H:00') as hour_utc,
              SUM(view_count) as views,
              SUM(device_mobile_count) as mobile,
              SUM(device_desktop_count) as desktop
       FROM article_views_hourly
       WHERE view_hour >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
       GROUP BY hour_utc
       ORDER BY hour_utc ASC`
    );

    // 6. Top 5 performing dispatches
    const topArticles = await query(
      `SELECT a.id, a.title, a.slug, a.view_count, a.reading_time_minutes, a.language,
              c.name as category_name, u.full_name as author_name
       FROM articles a
       LEFT JOIN categories c ON a.category_id = c.id
       LEFT JOIN users u ON a.author_id = u.id
       WHERE a.status = 'published'
       ORDER BY a.view_count DESC
       LIMIT 5`
    );

    // 7. Multilingual content distribution
    const languageCounts = await query(
      `SELECT language, COUNT(*) as count 
       FROM articles 
       WHERE status = 'published' 
       GROUP BY language`
    );

    // 8. Commercial campaign telemetry
    const [adMetrics] = await query(
      `SELECT COALESCE(SUM(impressions_count), 0) as total_impressions,
              COALESCE(SUM(clicks_count), 0) as total_clicks,
              COUNT(*) as active_campaigns
       FROM advertisements 
       WHERE is_active = 1`
    );

    const impressions = Number(adMetrics.total_impressions);
    const clicks = Number(adMetrics.total_clicks);
    const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : '0.00';

    // 9. Recent Newsroom Actions (from audit_logs)
    const recentAudit = await query(
      `SELECT a.id, a.action, a.entity_type, a.created_at, u.full_name as actor_name
       FROM audit_logs a
       LEFT JOIN users u ON a.user_id = u.id
       ORDER BY a.created_at DESC
       LIMIT 5`
    );

    return {
      overview: {
        articlesPublishedToday: pubToday.count,
        pendingReviewCount: pending.count,
        scheduledEmbargoCount: scheduled.count,
        totalArticleViews: views.total_views,
        activeAdCampaigns: adMetrics.active_campaigns,
        adCtrPercentage: `${ctr}%`
      },
      topArticles,
      hourlyViews,
      languageDistribution: languageCounts,
      recentActions: recentAudit
    };
  }
};

export default analyticsService;
