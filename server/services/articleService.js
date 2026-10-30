// ========================================================================
// News Article Service — Phase 3
// Complete editorial lifecycle: drafting, revisions, scheduling, publishing,
// expiry enforcement, soft-delete (archive), slug generation, multilingual
// support (English/Marathi/Hindi), and view telemetry.
//
// Phase 3 changes:
//   - createArticle: added expiry_time, alt_text, youtube_url
//   - updateArticle: added expiry_time, alt_text, youtube_url; handles
//                    'expired' → 'published' (republish) transition
//   - deleteArticle: soft-archive instead of hard DELETE
//   - processScheduledAndExpiringArticles: uses 'expired' status (not
//     'archived'), adds per-article audit log entries, idempotent design
//   - listArticles: 'expired' is now a valid admin status filter
//   - getArticleById: new method for admin edit-page load by numeric ID
// ========================================================================

import { query, withTransaction } from '../config/database.js';
import auditService from './auditService.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Calculate estimated reading time in minutes. */
const calculateReadingTime = (text = '') => {
  const words = text.replace(/<[^>]*>/g, '').trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
};

/** Convert date string or Date object to MySQL DATETIME format (YYYY-MM-DD HH:MM:SS) */
const toMySqlDateTime = (val) => {
  if (!val) return null;
  const d = val instanceof Date ? val : new Date(val);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 19).replace('T', ' ');
};

/**
 * Parse a YouTube / short-link URL and return a canonical embed URL.
 * Returns null if the URL is not a recognisable YouTube link.
 */
const normaliseYouTubeUrl = (raw = '') => {
  if (!raw || !raw.trim()) return null;
  try {
    const url = new URL(raw.trim());
    // Standard watch URL: https://www.youtube.com/watch?v=ID
    if (url.hostname.includes('youtube.com') && url.searchParams.get('v')) {
      return `https://www.youtube.com/embed/${url.searchParams.get('v')}`;
    }
    // Short link: https://youtu.be/ID
    if (url.hostname === 'youtu.be') {
      return `https://www.youtube.com/embed${url.pathname}`;
    }
    // Already an embed URL — return as-is
    if (url.pathname.startsWith('/embed/')) {
      return raw.trim();
    }
  } catch {
    // Invalid URL — ignore
  }
  return null;
};

/** Normalise and ensure slug uniqueness across the articles table. */
export const generateUniqueSlug = async (title, currentId = null) => {
  let baseSlug = title
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '') // Unicode-aware (supports Devanagari)
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 200);

  if (!baseSlug) {
    baseSlug = `article-${Date.now()}`;
  }

  let uniqueSlug = baseSlug;
  let counter = 1;

  while (true) {
    const params = [uniqueSlug];
    let sql = `SELECT id FROM articles WHERE slug = ?`;
    if (currentId) {
      sql += ` AND id != ?`;
      params.push(currentId);
    }
    sql += ` LIMIT 1`;

    const existing = await query(sql, params);
    if (existing.length === 0) {
      return uniqueSlug;
    }
    counter += 1;
    uniqueSlug = `${baseSlug}-${counter}`;
  }
};

// ---------------------------------------------------------------------------
// Core SELECT fragment shared across list / detail queries
// ---------------------------------------------------------------------------
const ARTICLE_SELECT = `
  a.id, a.title, a.slug, a.kicker, a.short_description, a.featured_image,
  a.image_caption, a.alt_text, a.youtube_url,
  a.status, a.priority, a.is_featured, a.is_breaking, a.is_sponsored, a.sponsor_client, a.sponsor_placement_code,
  a.reading_time_minutes, a.view_count, a.language,
  a.scheduled_publication_time, a.publication_time, a.expiry_time,
  a.meta_title, a.meta_description, a.meta_keywords, a.canonical_url, a.og_image,
  a.created_at, a.updated_at,
  c.id as category_id, c.name as category_name, c.slug as category_slug, c.color_badge as category_color,
  u.id as author_id, u.full_name as author_name, u.avatar_url as author_avatar, u.designation as author_designation
`;

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export const articleService = {

  // -------------------------------------------------------------------------
  // LIST articles with filtering, searching, and pagination
  // -------------------------------------------------------------------------
  async listArticles({
    status = null,
    category = null,
    tag = null,
    language = null,
    authorId = null,
    isBreaking = null,
    isFeatured = null,
    hasVideo = null,
    search = null,
    sort = 'latest',
    page = 1,
    limit = 20
  } = {}, currentUser = null) {

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const params = [];
    let whereClause = 'WHERE 1=1';

    // ---- Visibility rules ----
    if (!currentUser) {
      // Anonymous public: published only, not yet expired, not embargoed (with 5-minute buffer for clock differences)
      whereClause +=
        " AND a.status = 'published'" +
        ' AND (a.publication_time IS NULL OR a.publication_time <= DATE_ADD(UTC_TIMESTAMP(), INTERVAL 5 MINUTE))' +
        ' AND (a.expiry_time IS NULL OR a.expiry_time > UTC_TIMESTAMP())';
    } else {
      // Authenticated staff: can filter by any status
      const validStatuses = ['draft', 'in_review', 'scheduled', 'published', 'expired', 'archived', 'all'];
      if (status && status !== 'all' && validStatuses.includes(status)) {
        whereClause += ' AND a.status = ?';
        params.push(status);
      }
      // Reporters only see their own articles unless editor/super_admin
      if (currentUser.role === 'reporter') {
        whereClause += ' AND a.author_id = ?';
        params.push(currentUser.id);
      }
    }

    // ---- Optional filters ----
    if (category) {
      if (isNaN(category)) {
        whereClause += ' AND c.slug = ?';
        params.push(category);
      } else {
        whereClause += ' AND a.category_id = ?';
        params.push(parseInt(category, 10));
      }
    }

    if (language) {
      whereClause += ' AND a.language = ?';
      params.push(language);
    }

    if (authorId) {
      whereClause += ' AND a.author_id = ?';
      params.push(parseInt(authorId, 10));
    }

    if (isBreaking !== null && isBreaking !== undefined) {
      whereClause += ' AND a.is_breaking = ?';
      params.push(isBreaking === 'true' || isBreaking === 1 || isBreaking === true ? 1 : 0);
    }

    if (isFeatured !== null && isFeatured !== undefined) {
      whereClause += ' AND a.is_featured = ?';
      params.push(isFeatured === 'true' || isFeatured === 1 || isFeatured === true ? 1 : 0);
    }

    if (hasVideo !== null && hasVideo !== undefined) {
      if (hasVideo === 'true' || hasVideo === 1 || hasVideo === true) {
        whereClause += " AND a.youtube_url IS NOT NULL AND a.youtube_url != ''";
      }
    }

    if (tag) {
      whereClause +=
        ' AND EXISTS (SELECT 1 FROM article_tags at JOIN tags t ON at.tag_id = t.id' +
        ' WHERE at.article_id = a.id AND t.slug = ?)';
      params.push(tag);
    }

    if (search && search.trim()) {
      whereClause += ' AND (a.title LIKE ? OR a.short_description LIKE ? OR a.kicker LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    // ---- Sorting ----
    let orderBy = 'COALESCE(a.publication_time, a.created_at) DESC, a.created_at DESC';
    if (status === 'in_review') {
      orderBy = 'a.updated_at DESC, a.created_at DESC';
    } else if (sort === 'priority') {
      orderBy = 'a.priority DESC, COALESCE(a.publication_time, a.created_at) DESC';
    } else if (sort === 'views') {
      orderBy = 'a.view_count DESC';
    } else if (sort === 'oldest') {
      orderBy = 'a.created_at ASC';
    }

    // ---- Count ----
    const countRows = await query(
      `SELECT COUNT(*) as total
       FROM articles a
       LEFT JOIN categories c ON a.category_id = c.id
       ${whereClause}`,
      params
    );
    const total = countRows[0].total;

    // ---- Data ----
    const articles = await query(
      `SELECT ${ARTICLE_SELECT}
       FROM articles a
       LEFT JOIN categories c ON a.category_id = c.id
       LEFT JOIN users u ON a.author_id = u.id
       ${whereClause}
       ORDER BY ${orderBy}
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit, 10), parseInt(offset, 10)]
    );

    return {
      data: articles,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(total / parseInt(limit, 10))
      }
    };
  },

  // -------------------------------------------------------------------------
  // GET single article by SLUG (public + staff preview)
  // -------------------------------------------------------------------------
  async getArticleBySlug(slug, currentUser = null, reqMetadata = {}) {
    const articles = await query(
      `SELECT a.*,
              c.id as category_id, c.name as category_name, c.slug as category_slug, c.color_badge as category_color,
              u.id as author_id, u.full_name as author_name, u.avatar_url as author_avatar,
              u.designation as author_designation, u.bio as author_bio
       FROM articles a
       LEFT JOIN categories c ON a.category_id = c.id
       LEFT JOIN users u ON a.author_id = u.id
       WHERE a.slug = ? LIMIT 1`,
      [slug]
    );

    if (articles.length === 0) {
      const error = new Error(`Article with slug '${slug}' was not found`);
      error.statusCode = 404;
      error.code = 'ARTICLE_NOT_FOUND';
      throw error;
    }

    const article = articles[0];

    // ---- Access control ----
    if (article.status !== 'published') {
      if (!currentUser) {
        const error = new Error('This dispatch is not found or no longer available');
        error.statusCode = 404;
        error.code = 'ARTICLE_NOT_FOUND';
        throw error;
      }
      // Reporters can only preview their own unpublished drafts
      if (currentUser.role === 'reporter' && article.author_id !== currentUser.id) {
        const error = new Error('You do not have permission to view this unpublished draft');
        error.statusCode = 403;
        error.code = 'FORBIDDEN_DRAFT';
        throw error;
      }
    }

    // Public: also block expired articles (belt-and-suspenders beyond WHERE status='published')
    if (!currentUser && article.expiry_time && new Date(article.expiry_time) <= new Date()) {
      const error = new Error('This article has expired and is no longer publicly available');
      error.statusCode = 404;
      error.code = 'ARTICLE_EXPIRED';
      throw error;
    }

    // ---- Eager load: tags ----
    const tags = await query(
      `SELECT t.id, t.name, t.slug
       FROM tags t
       JOIN article_tags at ON t.id = at.tag_id
       WHERE at.article_id = ?`,
      [article.id]
    );
    article.tags = tags;

    // ---- Eager load: multimedia embeds ----
    const multimedia = await query(
      `SELECT id, media_type, embed_url, duration_seconds, thumbnail_url, transcript
       FROM article_multimedia
       WHERE article_id = ?`,
      [article.id]
    );
    article.multimedia = multimedia;

    // ---- View telemetry (async, non-blocking) ----
    if (article.status === 'published' && !currentUser) {
      this.recordViewTelemetry(article.id, reqMetadata).catch((err) => {
        console.warn('[Telemetry Warning] View count update skipped:', err.message);
      });
    }

    return article;
  },

  // -------------------------------------------------------------------------
  // GET related articles for a given article (by slug or numeric ID)
  // -------------------------------------------------------------------------
  async getRelatedArticles(slugOrId, limit = 4) {
    let articleId = null;
    let categoryId = null;

    if (!isNaN(slugOrId)) {
      articleId = parseInt(slugOrId, 10);
    }

    const currentRows = await query(
      `SELECT id, category_id FROM articles WHERE ${articleId ? 'id = ?' : 'slug = ?'} LIMIT 1`,
      [articleId || slugOrId]
    );

    if (currentRows.length > 0) {
      articleId = currentRows[0].id;
      categoryId = currentRows[0].category_id;
    }

    const whereParts = [
      "a.status = 'published'",
      '(a.publication_time IS NULL OR a.publication_time <= DATE_ADD(UTC_TIMESTAMP(), INTERVAL 5 MINUTE))',
      '(a.expiry_time IS NULL OR a.expiry_time > UTC_TIMESTAMP())'
    ];
    const params = [];

    if (articleId) {
      whereParts.push('a.id != ?');
      params.push(articleId);
    }
    if (categoryId) {
      whereParts.push('a.category_id = ?');
      params.push(categoryId);
    }

    let articles = await query(
      `SELECT ${ARTICLE_SELECT}
       FROM articles a
       LEFT JOIN categories c ON a.category_id = c.id
       LEFT JOIN users u ON a.author_id = u.id
       WHERE ${whereParts.join(' AND ')}
       ORDER BY a.publication_time DESC
       LIMIT ?`,
      [...params, parseInt(limit, 10)]
    );

    // If fewer than limit found in same category, backfill with other published stories
    if (articles.length < limit) {
      const remaining = limit - articles.length;
      const excludeIds = [articleId, ...articles.map(a => a.id)].filter(Boolean);
      let backfillSql = `SELECT ${ARTICLE_SELECT}
         FROM articles a
         LEFT JOIN categories c ON a.category_id = c.id
         LEFT JOIN users u ON a.author_id = u.id
         WHERE a.status = 'published'
           AND (a.publication_time IS NULL OR a.publication_time <= DATE_ADD(UTC_TIMESTAMP(), INTERVAL 5 MINUTE))
           AND (a.expiry_time IS NULL OR a.expiry_time > UTC_TIMESTAMP())`;
      const backfillParams = [];
      if (excludeIds.length > 0) {
        backfillSql += ` AND a.id NOT IN (${excludeIds.map(() => '?').join(',')})`;
        backfillParams.push(...excludeIds);
      }
      backfillSql += ` ORDER BY a.publication_time DESC LIMIT ?`;
      backfillParams.push(parseInt(remaining, 10));

      const backfillRows = await query(backfillSql, backfillParams);
      articles = [...articles, ...backfillRows];
    }

    return articles;
  },

  // -------------------------------------------------------------------------
  // GET single article by NUMERIC ID (admin edit page)
  // -------------------------------------------------------------------------
  async getArticleById(articleId, currentUser = null) {
    const articles = await query(
      `SELECT a.*,
              c.id as category_id, c.name as category_name, c.slug as category_slug, c.color_badge as category_color,
              u.id as author_id, u.full_name as author_name, u.avatar_url as author_avatar,
              u.designation as author_designation, u.bio as author_bio
       FROM articles a
       LEFT JOIN categories c ON a.category_id = c.id
       LEFT JOIN users u ON a.author_id = u.id
       WHERE a.id = ? LIMIT 1`,
      [parseInt(articleId, 10)]
    );

    if (articles.length === 0) {
      const error = new Error(`Article #${articleId} was not found`);
      error.statusCode = 404;
      error.code = 'ARTICLE_NOT_FOUND';
      throw error;
    }

    const article = articles[0];

    // Reporters can only load their own articles
    if (currentUser && currentUser.role === 'reporter' && article.author_id !== currentUser.id) {
      const error = new Error('You do not have permission to edit this article');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    // Attach tags
    const tags = await query(
      `SELECT t.id, t.name, t.slug
       FROM tags t
       JOIN article_tags at ON t.id = at.tag_id
       WHERE at.article_id = ?`,
      [article.id]
    );
    article.tags = tags;

    // Attach multimedia embeds
    const multimedia = await query(
      `SELECT id, media_type, embed_url, duration_seconds, thumbnail_url, transcript
       FROM article_multimedia
       WHERE article_id = ?`,
      [article.id]
    );
    article.multimedia = multimedia;

    return article;
  },

  // -------------------------------------------------------------------------
  // Record hourly aggregated view count (telemetry)
  // -------------------------------------------------------------------------
  async recordViewTelemetry(articleId, { isMobile = false } = {}) {
    // 1. Increment total article view count
    await query(`UPDATE articles SET view_count = view_count + 1 WHERE id = ?`, [articleId]);

    // 2. Aggregate into current hour bucket
    const currentHourUtc = new Date();
    currentHourUtc.setMinutes(0, 0, 0);
    const hourStr = currentHourUtc.toISOString().slice(0, 19).replace('T', ' ');

    await query(
      `INSERT INTO article_views_hourly (article_id, view_hour, view_count, device_mobile_count, device_desktop_count)
       VALUES (?, ?, 1, ?, ?)
       ON DUPLICATE KEY UPDATE
         view_count = view_count + 1,
         device_mobile_count = device_mobile_count + VALUES(device_mobile_count),
         device_desktop_count = device_desktop_count + VALUES(device_desktop_count)`,
      [articleId, hourStr, isMobile ? 1 : 0, isMobile ? 0 : 1]
    );
  },

  // -------------------------------------------------------------------------
  // CREATE article (Draft / In-Review / Published)
  // -------------------------------------------------------------------------
  async createArticle(data, currentUser, ipAddress) {
    const authorId = typeof currentUser === 'object' && currentUser !== null ? currentUser.id : currentUser;
    const userRole = typeof currentUser === 'object' && currentUser !== null ? currentUser.role : null;

    const {
      title,
      slug: customSlug = null,
      kicker = null,
      shortDescription,
      articleBody,
      featuredImage = null,
      imageCaption = null,
      altText = null,              // ← Phase 3
      youtubeUrl = null,           // ← Phase 3
      categoryId,
      status = 'draft',
      priority = 0,
      isFeatured = false,
      isBreaking = false,
      isSponsored = false,
      sponsorClient = null,
      sponsorPlacementCode = 'marquee_top',
      language = 'en',
      scheduledPublicationTime = null,
      expiryTime = null,           // ← Phase 3
      tags = [],
      metaTitle = null,
      metaDescription = null,
      metaKeywords = null,
      canonicalUrl = null,
      ogImage = null
    } = data;

    // ---- Enforce role-based permissions ----
    // Only editor and super_admin can directly publish or schedule articles
    if (userRole === 'reporter' && (data.status === 'published' || data.status === 'scheduled')) {
      const error = new Error('Staff reporters do not have permission to publish or schedule articles directly. Please save as draft or submit for editorial review.');
      error.statusCode = 403;
      error.code = 'FORBIDDEN_PUBLISH';
      throw error;
    }

    // ---- Validate status transition ----
    const allowedStatuses = ['draft', 'in_review', 'scheduled', 'published'];
    let safeStatus = allowedStatuses.includes(status) ? status : 'draft';
    if (userRole === 'reporter' && safeStatus !== 'in_review') {
      safeStatus = 'draft';
    }

    // ---- Validate expiry is in the future ----
    let safeExpiryTime = expiryTime;
    if (safeExpiryTime) {
      const expDate = new Date(safeExpiryTime);
      if (isNaN(expDate.getTime()) || expDate <= new Date()) {
        if (safeStatus === 'published') {
          // If editor or super_admin directly creates and publishes, do not let an expired timestamp instantly hide the story
          safeExpiryTime = null;
        } else {
          const error = new Error('Expiry time must be a valid future date/time (UTC)');
          error.statusCode = 400;
          error.code = 'INVALID_EXPIRY';
          throw error;
        }
      }
    }

    // ---- Ensure category exists ----
    const categories = await query(`SELECT id FROM categories WHERE id = ? LIMIT 1`, [categoryId]);
    if (categories.length === 0) {
      const error = new Error('Referenced category does not exist');
      error.statusCode = 400;
      error.code = 'INVALID_CATEGORY';
      throw error;
    }

    // ---- Generate unique slug ----
    const finalSlug = customSlug
      ? await generateUniqueSlug(customSlug)
      : await generateUniqueSlug(title);

    const readingTime = calculateReadingTime(articleBody);
    const publicationTime = safeStatus === 'published' ? new Date() : null;
    const embedUrl = normaliseYouTubeUrl(youtubeUrl);

    // ---- Transaction: article + tags + revision + audit ----
    return await withTransaction(async (conn) => {
      const [artResult] = await conn.query(
        `INSERT INTO articles (
           title, slug, kicker, short_description, article_body,
           featured_image, image_caption, alt_text, youtube_url,
           author_id, category_id, status, priority,
           is_featured, is_breaking, is_sponsored, sponsor_client, sponsor_placement_code,
           reading_time_minutes, language,
           scheduled_publication_time, publication_time, expiry_time,
           meta_title, meta_description, meta_keywords, canonical_url, og_image
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          title, finalSlug, kicker, shortDescription, articleBody,
          featuredImage, imageCaption, altText, embedUrl,
          authorId, categoryId, safeStatus, priority,
          isFeatured ? 1 : 0, isBreaking ? 1 : 0, isSponsored ? 1 : 0, sponsorClient, sponsorPlacementCode || "marquee_top",
          readingTime, language,
          toMySqlDateTime(scheduledPublicationTime), toMySqlDateTime(publicationTime), toMySqlDateTime(safeExpiryTime),
          metaTitle || title,
          metaDescription || shortDescription.slice(0, 300),
          metaKeywords, canonicalUrl, ogImage || featuredImage
        ]
      );

      const articleId = artResult.insertId;

      // ---- Attach tags ----
      if (Array.isArray(tags) && tags.length > 0) {
        for (const tagItem of tags) {
          let tagId;
          if (typeof tagItem === 'number') {
            tagId = tagItem;
          } else if (typeof tagItem === 'string' && tagItem.trim()) {
            const tagSlug = tagItem.toLowerCase().trim().replace(/\s+/g, '-');
            const [tRows] = await conn.query(`SELECT id FROM tags WHERE slug = ? LIMIT 1`, [tagSlug]);
            if (tRows.length > 0) {
              tagId = tRows[0].id;
            } else {
              const [newT] = await conn.query(`INSERT INTO tags (name, slug) VALUES (?, ?)`, [tagItem.trim(), tagSlug]);
              tagId = newT.insertId;
            }
          }
          if (tagId) {
            await conn.query(`INSERT IGNORE INTO article_tags (article_id, tag_id) VALUES (?, ?)`, [articleId, tagId]);
          }
        }
      }

      // ---- Insert YouTube embed into article_multimedia ----
      if (embedUrl) {
        await conn.query(
          `INSERT INTO article_multimedia (article_id, media_type, embed_url) VALUES (?, 'youtube', ?)`,
          [articleId, embedUrl]
        );
      }

      // ---- Initial revision ----
      await conn.query(
        `INSERT INTO article_revisions
           (article_id, revision_number, title, short_description, article_body, edited_by, revision_notes)
         VALUES (?, 1, ?, ?, ?, ?, 'Initial submission')`,
        [articleId, title, shortDescription, articleBody, authorId]
      );

      // ---- Audit log ----
      await conn.query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
         VALUES (?, 'ARTICLE_CREATE', 'article', ?, ?, ?)`,
        [
          authorId,
          articleId,
          JSON.stringify({ title, slug: finalSlug, status: safeStatus, categoryId, expiryTime }),
          ipAddress
        ]
      );

      // Sync with commercial advertisements inventory
      if (isSponsored) {
        await syncSponsoredArticleAd(articleId, finalSlug, title, sponsorClient, sponsorPlacementCode, featuredImage, safeStatus, priority, safeExpiryTime, conn);
      }

      return {
        id: articleId,
        title,
        slug: finalSlug,
        status: safeStatus,
        readingTimeMinutes: readingTime,
        message: 'Article created successfully'
      };
    });
  },

  // -------------------------------------------------------------------------
  // UPDATE article with full field support and revision tracking
  // -------------------------------------------------------------------------
  async updateArticle(articleId, updateData, currentUser, ipAddress) {
    const articles = await query(`SELECT * FROM articles WHERE id = ? LIMIT 1`, [articleId]);
    if (articles.length === 0) {
      const error = new Error('Article not found');
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    const current = articles[0];

    // ---- Authorization ----
    if (currentUser.role === 'reporter' && current.author_id !== currentUser.id) {
      const error = new Error('Reporters are only permitted to update their own articles');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    // ---- Merge fields (updateData wins over current row) ----
    const title            = updateData.title            !== undefined ? updateData.title            : current.title;
    const shortDescription = updateData.shortDescription !== undefined ? updateData.shortDescription : current.short_description;
    const articleBody      = updateData.articleBody      !== undefined ? updateData.articleBody      : current.article_body;
    const kicker           = updateData.kicker           !== undefined ? updateData.kicker           : current.kicker;
    const featuredImage    = updateData.featuredImage    !== undefined ? updateData.featuredImage    : current.featured_image;
    const imageCaption     = updateData.imageCaption     !== undefined ? updateData.imageCaption     : current.image_caption;
    const altText          = updateData.altText          !== undefined ? updateData.altText          : current.alt_text;     // ← Phase 3
    const categoryId       = updateData.categoryId       !== undefined ? updateData.categoryId       : current.category_id;
    const priority         = updateData.priority         !== undefined ? updateData.priority         : current.priority;
    const isFeatured       = updateData.isFeatured       !== undefined ? (updateData.isFeatured ? 1 : 0) : current.is_featured;
    const isBreaking       = updateData.isBreaking       !== undefined ? (updateData.isBreaking ? 1 : 0) : current.is_breaking;
    const isSponsored      = updateData.isSponsored      !== undefined ? (updateData.isSponsored ? 1 : 0) : current.is_sponsored;
    const sponsorClient    = updateData.sponsorClient    !== undefined ? updateData.sponsorClient    : current.sponsor_client;
    const sponsorPlacementCode = updateData.sponsorPlacementCode !== undefined ? updateData.sponsorPlacementCode : (current.sponsor_placement_code || 'marquee_top');
    const language         = updateData.language         !== undefined ? updateData.language         : current.language;
    const scheduledTime    = updateData.scheduledPublicationTime !== undefined ? updateData.scheduledPublicationTime : current.scheduled_publication_time;
    const metaTitle        = updateData.metaTitle        !== undefined ? updateData.metaTitle        : current.meta_title;
    const metaDescription  = updateData.metaDescription  !== undefined ? updateData.metaDescription  : current.meta_description;
    const metaKeywords     = updateData.metaKeywords     !== undefined ? updateData.metaKeywords     : current.meta_keywords;
    const canonicalUrl     = updateData.canonicalUrl     !== undefined ? updateData.canonicalUrl     : current.canonical_url;
    const ogImage          = updateData.ogImage          !== undefined ? updateData.ogImage          : current.og_image;

    // ---- Expiry time — Phase 3 ----
    let expiryTime = current.expiry_time; // preserve existing by default
    if (updateData.expiryTime !== undefined) {
      if (updateData.expiryTime === null || updateData.expiryTime === '') {
        expiryTime = null; // editor cleared the expiry
      } else {
        const expDate = new Date(updateData.expiryTime);
        if (isNaN(expDate.getTime())) {
          const error = new Error('expiryTime must be a valid ISO 8601 date string');
          error.statusCode = 400;
          error.code = 'INVALID_EXPIRY';
          throw error;
        }
        expiryTime = updateData.expiryTime;
      }
    }

    // ---- YouTube URL — Phase 3 ----
    let youtubeUrl = current.youtube_url;
    if (updateData.youtubeUrl !== undefined) {
      youtubeUrl = normaliseYouTubeUrl(updateData.youtubeUrl);
    }

    // ---- Status transition logic ----
    const allowedStatuses = ['draft', 'in_review', 'scheduled', 'published', 'expired', 'archived'];
    let newStatus = updateData.status !== undefined ? updateData.status : current.status;
    if (!allowedStatuses.includes(newStatus)) newStatus = current.status;

    // Staff reporters cannot directly publish or schedule articles
    if (currentUser.role === 'reporter' && (updateData.status === 'published' || updateData.status === 'scheduled')) {
      const error = new Error('Staff reporters do not have permission to publish or schedule articles directly. Please submit for editorial review.');
      error.statusCode = 403;
      error.code = 'FORBIDDEN_PUBLISH';
      throw error;
    }

    // Reporters cannot directly set published or scheduled status
    if (currentUser.role === 'reporter' && (newStatus === 'published' || newStatus === 'scheduled')) {
      newStatus = 'in_review';
    }

    // ---- Publication timestamp ----
    let publicationTime = current.publication_time;
    if (newStatus === 'published' && (!publicationTime || current.status !== 'published')) {
      publicationTime = new Date(); // first-time publish or ensure published article has a valid timestamp
    }

    // When an article is being published / approved live:
    if (newStatus === 'published') {
      if (updateData.expiryTime === undefined) {
        // Quick publish/approval: if current expiry has already passed or article was expired/in_review, clear it
        if (current.expiry_time && new Date(current.expiry_time) <= new Date()) {
          expiryTime = null;
        }
        if (current.status === 'expired') {
          expiryTime = null;
        }
      } else if (expiryTime && new Date(expiryTime) <= new Date()) {
        // If an explicit expiry date is passed but is in the past, clear it rather than immediately killing the published story
        expiryTime = null;
      }
    }

    // ---- Slug ----
    let slug = current.slug;
    if (updateData.slug && updateData.slug !== current.slug) {
      slug = await generateUniqueSlug(updateData.slug, articleId);
    }

    const readingTime = calculateReadingTime(articleBody);
    const contentChanged =
      title !== current.title ||
      articleBody !== current.article_body ||
      shortDescription !== current.short_description;

    return await withTransaction(async (conn) => {
      await conn.query(
        `UPDATE articles SET
           title = ?, slug = ?, kicker = ?, short_description = ?, article_body = ?,
           featured_image = ?, image_caption = ?, alt_text = ?, youtube_url = ?,
           category_id = ?, status = ?, priority = ?,
           is_featured = ?, is_breaking = ?, is_sponsored = ?, sponsor_client = ?, sponsor_placement_code = ?,
           reading_time_minutes = ?, language = ?,
           scheduled_publication_time = ?, publication_time = ?, expiry_time = ?,
           meta_title = ?, meta_description = ?, meta_keywords = ?, canonical_url = ?, og_image = ?
         WHERE id = ?`,
        [
          title, slug, kicker, shortDescription, articleBody,
          featuredImage, imageCaption, altText, youtubeUrl,
          categoryId, newStatus, priority,
          isFeatured, isBreaking, isSponsored, sponsorClient, sponsorPlacementCode,
          readingTime, language,
          toMySqlDateTime(scheduledTime), toMySqlDateTime(publicationTime), toMySqlDateTime(expiryTime),
          metaTitle, metaDescription, metaKeywords, canonicalUrl, ogImage,
          articleId
        ]
      );

      // ---- Tags update ----
      if (Array.isArray(updateData.tags)) {
        await conn.query(`DELETE FROM article_tags WHERE article_id = ?`, [articleId]);
      await conn.query(`UPDATE advertisements SET is_active = 0 WHERE article_id = ?`, [articleId]).catch(() => {});
        for (const tagItem of updateData.tags) {
          let tagId = null;
          if (typeof tagItem === 'number') {
            tagId = tagItem;
          } else if (typeof tagItem === 'string' && tagItem.trim()) {
            const tagSlug = tagItem.toLowerCase().trim().replace(/\s+/g, '-');
            const [tRows] = await conn.query(`SELECT id FROM tags WHERE slug = ? LIMIT 1`, [tagSlug]);
            if (tRows.length > 0) {
              tagId = tRows[0].id;
            } else {
              const [newT] = await conn.query(`INSERT INTO tags (name, slug) VALUES (?, ?)`, [tagItem.trim(), tagSlug]);
              tagId = newT.insertId;
            }
          }
          if (tagId) {
            await conn.query(`INSERT IGNORE INTO article_tags (article_id, tag_id) VALUES (?, ?)`, [articleId, tagId]);
          }
        }
      }

      // ---- YouTube embed sync ----
      if (updateData.youtubeUrl !== undefined) {
        // Remove old youtube entry for this article then re-insert if URL provided
        await conn.query(
          `DELETE FROM article_multimedia WHERE article_id = ? AND media_type = 'youtube'`,
          [articleId]
        );
        if (youtubeUrl) {
          await conn.query(
            `INSERT INTO article_multimedia (article_id, media_type, embed_url) VALUES (?, 'youtube', ?)`,
            [articleId, youtubeUrl]
          );
        }
      }

      // ---- Revision snapshot (only when content changed) ----
      if (contentChanged) {
        const [revRows] = await conn.query(
          `SELECT MAX(revision_number) as max_rev FROM article_revisions WHERE article_id = ?`,
          [articleId]
        );
        const nextRev = (revRows[0].max_rev || 0) + 1;

        await conn.query(
          `INSERT INTO article_revisions
             (article_id, revision_number, title, short_description, article_body, edited_by, revision_notes)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            articleId, nextRev, title, shortDescription, articleBody, currentUser.id,
            updateData.revisionNotes || `Revision #${nextRev} saved by ${currentUser.full_name}`
          ]
        );
      }

      // ---- Audit log ----
      let auditAction = 'ARTICLE_UPDATE';
      if (current.status === 'in_review' && newStatus === 'published') {
        auditAction = 'ARTICLE_APPROVED';
      } else if (current.status !== 'published' && newStatus === 'published') {
        auditAction = 'ARTICLE_PUBLISH';
      } else if (current.status === 'in_review' && newStatus === 'draft') {
        auditAction = 'ARTICLE_RETURNED_TO_DRAFT';
      } else if (newStatus === 'in_review' && current.status !== 'in_review') {
        auditAction = 'ARTICLE_SUBMIT_REVIEW';
      }

      await conn.query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
         VALUES (?, ?, 'article', ?, ?, ?)`,
        [
          currentUser.id,
          auditAction,
          articleId,
          JSON.stringify({
            status: newStatus,
            prevStatus: current.status,
            slug,
            expiryTime,
            contentChanged,
            revisionCreated: contentChanged,
            approvedBy: (current.status === 'in_review' && newStatus === 'published') ? {
              id: currentUser.id,
              name: currentUser.full_name,
              role: currentUser.role
            } : undefined
          }),
          ipAddress
        ]
      );

      // Sync with commercial advertisements inventory
      await syncSponsoredArticleAd(articleId, slug, title, sponsorClient, sponsorPlacementCode, featuredImage, newStatus, priority, expiryTime, conn);

      return {
        id: articleId,
        title,
        slug,
        status: newStatus,
        expiryTime,
        message: 'Article updated successfully'
      };
    });
  },

  // -------------------------------------------------------------------------
  // SOFT DELETE — archive rather than hard-delete to preserve metrics
  // -------------------------------------------------------------------------
  async deleteArticle(articleId, currentUser, ipAddress) {
    const articles = await query(
      `SELECT id, title, slug, status FROM articles WHERE id = ? LIMIT 1`,
      [articleId]
    );
    if (articles.length === 0) {
      const error = new Error('Article not found');
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    const article = articles[0];

    // Only editors and super_admins can archive; reporters cannot delete
    if (currentUser.role === 'reporter') {
      const error = new Error('Reporters are not permitted to delete or archive articles');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    // Soft archive — preserve article, revisions, and metrics
    await query(
      `UPDATE articles SET status = 'archived', is_breaking = 0, is_featured = 0 WHERE id = ?`,
      [articleId]
    );

    await auditService.logAction({
      userId: currentUser.id,
      action: 'ARTICLE_ARCHIVE',
      entityType: 'article',
      entityId: articleId,
      details: { title: article.title, slug: article.slug, prevStatus: article.status },
      ipAddress
    });

    return {
      success: true,
      message: `Article #${articleId} archived successfully (soft delete — data preserved)`
    };
  },

  // -------------------------------------------------------------------------
  // Get revision history for an article
  // -------------------------------------------------------------------------
  async getArticleRevisions(articleId) {
    const revisions = await query(
      `SELECT r.id, r.revision_number, r.title, r.short_description, r.revision_notes, r.created_at,
              u.full_name as editor_name, u.role as editor_role
       FROM article_revisions r
       LEFT JOIN users u ON r.edited_by = u.id
       WHERE r.article_id = ?
       ORDER BY r.revision_number DESC`,
      [articleId]
    );
    return revisions;
  },

  // -------------------------------------------------------------------------
  // CRON PROCESSOR — triggered by cPanel cron job or POST /api/v1/articles/cron/publish
  //
  // Design guarantees:
  //   • Idempotent: WHERE conditions prevent double-transitions
  //   • Atomic per-article: status flips are individual UPDATEs not a bulk swap
  //   • Audit: each auto-action is logged with action='SYSTEM_CRON_...'
  //   • Expiry enforced in query layer too (belt-and-suspenders with WHERE in listArticles)
  // -------------------------------------------------------------------------
  async processScheduledAndExpiringArticles() {
    const now = new Date();
    const nowStr = now.toISOString();

    // ---- 1. Publish articles whose scheduled time has arrived ----
    //         Only transitions from 'scheduled' → 'published'
    //         Idempotent: already-published articles are untouched
    const toPublish = await query(
      `SELECT id, title, slug FROM articles
       WHERE status = 'scheduled'
         AND scheduled_publication_time IS NOT NULL
         AND scheduled_publication_time <= UTC_TIMESTAMP()`,
      []
    );

    let publishedCount = 0;
    for (const art of toPublish) {
      await query(
        `UPDATE articles
         SET status = 'published', publication_time = UTC_TIMESTAMP()
         WHERE id = ? AND status = 'scheduled'`,   // re-check status for safety
        [art.id]
      );
      publishedCount++;

      // Audit each auto-published article
      await query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
         VALUES (NULL, 'SYSTEM_CRON_PUBLISHED', 'article', ?, ?)`,
        [
          art.id,
          JSON.stringify({ title: art.title, slug: art.slug, timestamp: nowStr })
        ]
      );
    }

    // ---- 2. Expire articles whose expiry_time has passed ----
    //         Only transitions from 'published' → 'expired'
    //         Does NOT touch 'archived' or already-'expired' articles
    //         'expired' is intentionally distinct from 'archived':
    //           expired = time-based removal (can be republished)
    //           archived = editorial removal (deliberate)
    const toExpire = await query(
      `SELECT id, title, slug FROM articles
       WHERE status = 'published'
         AND expiry_time IS NOT NULL
         AND expiry_time <= UTC_TIMESTAMP()`,
      []
    );

    let expiredCount = 0;
    for (const art of toExpire) {
      await query(
        `UPDATE articles
         SET status = 'expired', is_breaking = 0, is_featured = 0
         WHERE id = ? AND status = 'published'`,   // re-check for idempotency
        [art.id]
      );
      expiredCount++;

      // Audit each auto-expired article
      await query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
         VALUES (NULL, 'SYSTEM_CRON_EXPIRED', 'article', ?, ?)`,
        [
          art.id,
          JSON.stringify({ title: art.title, slug: art.slug, timestamp: nowStr })
        ]
      );
    }

    // ---- 3. Deactivate commercial advertisements whose end_date has passed ----
    let expiredAdsCount = 0;
    try {
      const expiredAds = await query(
        `SELECT id, title, client_name, end_date FROM advertisements
         WHERE is_active = 1
           AND end_date < CURRENT_DATE`,
        []
      );
      for (const ad of (expiredAds || [])) {
        await query(
          `UPDATE advertisements SET is_active = 0 WHERE id = ? AND is_active = 1`,
          [ad.id]
        );
        expiredAdsCount++;
      }
    } catch (adErr) {
      console.warn('[Cron] Ad expiry check notice:', adErr.message);
    }

    return {
      publishedCount,
      expiredCount,
      expiredAdsCount,
      archivedCount: expiredCount,
      timestamp: nowStr,
      message: `Cron run complete: ${publishedCount} published, ${expiredCount} expired, ${expiredAdsCount} ads retired`
    };
  },

  // -------------------------------------------------------------------------
  // GET SCHEDULED & EXPIRY OVERVIEW (Articles + Commercial Ads)
  // Dedicated endpoint for Admin Scheduled & Expiry Management Desk
  // -------------------------------------------------------------------------
  async getScheduledAndExpiryOverview() {
    // 1. Scheduled Articles (embargoed releases pending publication)
    const scheduledArticles = await query(
      `SELECT a.id, a.title, a.slug, a.status, a.scheduled_publication_time, a.expiry_time,
              a.publication_time, a.is_sponsored, a.sponsor_client, a.priority, a.created_at,
              c.name AS category_name, c.color_badge AS category_color,
              u.full_name AS author_name
       FROM articles a
       LEFT JOIN categories c ON a.category_id = c.id
       LEFT JOIN users u ON a.author_id = u.id
       WHERE a.status = 'scheduled'
          OR (a.scheduled_publication_time IS NOT NULL AND a.scheduled_publication_time > UTC_TIMESTAMP() AND a.status != 'archived')
       ORDER BY a.scheduled_publication_time ASC, a.created_at DESC`
    );

    // 2. Active Expiring Articles (published stories currently ticking down to auto-expiry)
    const expiringArticles = await query(
      `SELECT a.id, a.title, a.slug, a.status, a.publication_time, a.expiry_time,
              a.is_sponsored, a.sponsor_client, a.priority, a.created_at,
              c.name AS category_name, c.color_badge AS category_color,
              u.full_name AS author_name
       FROM articles a
       LEFT JOIN categories c ON a.category_id = c.id
       LEFT JOIN users u ON a.author_id = u.id
       WHERE a.status = 'published'
         AND a.expiry_time IS NOT NULL
       ORDER BY a.expiry_time ASC`
    );

    // 3. Expired Articles Archive (retired dispatches)
    const expiredArticles = await query(
      `SELECT a.id, a.title, a.slug, a.status, a.publication_time, a.expiry_time, a.updated_at,
              a.is_sponsored, a.sponsor_client, a.priority, a.created_at,
              c.name AS category_name, c.color_badge AS category_color,
              u.full_name AS author_name
       FROM articles a
       LEFT JOIN categories c ON a.category_id = c.id
       LEFT JOIN users u ON a.author_id = u.id
       WHERE a.status = 'expired'
          OR (a.expiry_time IS NOT NULL AND a.expiry_time <= UTC_TIMESTAMP() AND a.status NOT IN ('published', 'draft'))
       ORDER BY a.expiry_time DESC, a.updated_at DESC
       LIMIT 60`
    );

    // 4. Commercial Advertisements (scheduled, active, and expired flights)
    let adCampaigns = [];
    try {
      adCampaigns = await query(
        `SELECT a.id, a.title, a.client_name, a.ad_type, a.banner_image_url, a.target_url,
                a.start_date, a.end_date, a.is_active, a.priority, a.article_id,
                a.impressions_count, a.clicks_count,
                p.name AS placement_name, p.placement_code, p.dimensions
         FROM advertisements a
         LEFT JOIN ad_placements p ON a.placement_id = p.id
         ORDER BY a.end_date ASC, a.priority DESC`
      );
    } catch (adQueryErr) {
      console.warn('[Scheduled] Ad query notice:', adQueryErr.message);
      adCampaigns = [];
    }

    return {
      scheduledArticles: scheduledArticles || [],
      expiringArticles: expiringArticles || [],
      expiredArticles: expiredArticles || [],
      adCampaigns: adCampaigns || [],
      serverTimeUtc: new Date().toISOString()
    };
  }
};

export default articleService;

/**
 * Synchronize a sponsored article with the commercial advertisement inventory.
 * Automatically inserts/updates/deactivates the ad flight in the selected placement slot.
 */
export async function syncSponsoredArticleAd(articleId, slug, title, sponsorClient, sponsorPlacementCode, featuredImage, status, priority, expiryTime, conn = null) {
  try {
    const runQuery = async (sql, params = []) => {
      if (conn && conn.query) {
        const [rows] = await conn.query(sql, params);
        return rows;
      }
      return await query(sql, params);
    };

    const artRows = await runQuery(
      `SELECT is_sponsored, sponsor_client, sponsor_placement_code FROM articles WHERE id = ? LIMIT 1`,
      [articleId]
    );

    const isSponsored = artRows && artRows[0] ? Boolean(artRows[0].is_sponsored) : false;

    if (!isSponsored) {
      // Deactivate any existing linked advertisement
      await runQuery(`UPDATE advertisements SET is_active = 0 WHERE article_id = ?`, [articleId]).catch(() => {});
      return;
    }

    const code = sponsorPlacementCode || (artRows && artRows[0] ? artRows[0].sponsor_placement_code : 'marquee_top') || 'marquee_top';
    const client = sponsorClient || (artRows && artRows[0] ? artRows[0].sponsor_client : 'Sponsored Partner') || 'Sponsored Partner';

    const plcRows = await runQuery(`SELECT id, placement_code FROM ad_placements WHERE placement_code = ? LIMIT 1`, [code]);
    const placementId = plcRows && plcRows[0] ? plcRows[0].id : 2; // fallback to marquee_top (id 2)

    const isMarquee = code.startsWith('marquee_');
    const adType = isMarquee ? 'text' : (featuredImage ? 'image' : 'text');
    const bannerUrl = featuredImage || null;
    const targetUrl = `/article/${slug}`;
    const isActive = status === 'published' ? 1 : 0;
    const prio = parseInt(priority, 10) || 5;
    const startDate = new Date().toISOString().split('T')[0];
    const endDate = expiryTime ? (typeof expiryTime === 'string' ? expiryTime.split('T')[0] : expiryTime.toISOString().split('T')[0]) : '2099-12-31';

    const existing = await runQuery(`SELECT id FROM advertisements WHERE article_id = ? LIMIT 1`, [articleId]);

    if (existing && existing.length > 0) {
      await runQuery(
        `UPDATE advertisements SET
           placement_id = ?,
           title = ?,
           client_name = ?,
           ad_type = ?,
           banner_image_url = ?,
           target_url = ?,
           start_date = ?,
           end_date = ?,
           priority = ?,
           is_active = ?
         WHERE id = ?`,
        [placementId, title, client, adType, bannerUrl, targetUrl, startDate, endDate, prio, isActive, existing[0].id]
      );
    } else {
      await runQuery(
        `INSERT INTO advertisements (
           placement_id, title, client_name, ad_type, banner_image_url,
           target_url, start_date, end_date, priority, is_active, article_id
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [placementId, title, client, adType, bannerUrl, targetUrl, startDate, endDate, prio, isActive, articleId]
      );
    }
  } catch (err) {
    console.warn('[syncSponsoredArticleAd Warning]', err.message);
  }
}
