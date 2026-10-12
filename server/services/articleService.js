// ========================================================================
// News Article Service
// Complete editorial lifecycle: drafting, revisions, scheduling, publishing,
// slug generation, multilingual support (English/Marathi/Hindi), and view telemetry.
// ========================================================================

import { query, withTransaction } from '../config/database.js';
import auditService from './auditService.js';

// Helper to calculate reading time in minutes
const calculateReadingTime = (text = '') => {
  const words = text.replace(/<[^>]*>/g, '').trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
};

// Helper to normalize and ensure slug uniqueness
export const generateUniqueSlug = async (title, currentId = null) => {
  let baseSlug = title
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '') // Unicode-aware clean (supports Devanagari)
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

export const articleService = {
  // List articles with filtering, searching, and pagination
  async listArticles({
    status = null,
    category = null,
    tag = null,
    language = null,
    authorId = null,
    isBreaking = null,
    isFeatured = null,
    search = null,
    sort = 'latest',
    page = 1,
    limit = 20
  } = {}, currentUser = null) {
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const params = [];
    let whereClause = 'WHERE 1=1';

    // Status filter: Public anonymous visitors can strictly view published articles
    if (!currentUser) {
      whereClause += " AND a.status = 'published' AND (a.publication_time IS NULL OR a.publication_time <= NOW()) AND (a.expiry_time IS NULL OR a.expiry_time > NOW())";
    } else {
      if (status && status !== 'all') {
        whereClause += ' AND a.status = ?';
        params.push(status);
      }
    }

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

    if (tag) {
      whereClause += ' AND EXISTS (SELECT 1 FROM article_tags at JOIN tags t ON at.tag_id = t.id WHERE at.article_id = a.id AND t.slug = ?)';
      params.push(tag);
    }

    if (search && search.trim()) {
      whereClause += ' AND (a.title LIKE ? OR a.short_description LIKE ? OR a.kicker LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    // Determine sorting
    let orderBy = 'a.publication_time DESC, a.created_at DESC';
    if (sort === 'priority') {
      orderBy = 'a.priority DESC, a.publication_time DESC';
    } else if (sort === 'views') {
      orderBy = 'a.view_count DESC';
    } else if (sort === 'oldest') {
      orderBy = 'a.created_at ASC';
    }

    // Count query
    const countRows = await query(
      `SELECT COUNT(*) as total 
       FROM articles a 
       LEFT JOIN categories c ON a.category_id = c.id
       ${whereClause}`,
      params
    );
    const total = countRows[0].total;

    // Data query
    const articles = await query(
      `SELECT a.id, a.title, a.slug, a.kicker, a.short_description, a.featured_image, a.image_caption,
              a.status, a.priority, a.is_featured, a.is_breaking, a.is_sponsored, a.sponsor_client,
              a.reading_time_minutes, a.view_count, a.language, a.scheduled_publication_time, 
              a.publication_time, a.expiry_time, a.created_at, a.updated_at,
              c.id as category_id, c.name as category_name, c.slug as category_slug, c.color_badge as category_color,
              u.id as author_id, u.full_name as author_name, u.avatar_url as author_avatar, u.designation as author_designation
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
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  // Get single article by slug with attached tags and multimedia embeds
  async getArticleBySlug(slug, currentUser = null, reqMetadata = {}) {
    const articles = await query(
      `SELECT a.*,
              c.id as category_id, c.name as category_name, c.slug as category_slug, c.color_badge as category_color,
              u.id as author_id, u.full_name as author_name, u.avatar_url as author_avatar, u.designation as author_designation, u.bio as author_bio
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

    // Access control: Only published stories are public
    if (article.status !== 'published') {
      if (!currentUser) {
        const error = new Error('This dispatch is not currently published');
        error.statusCode = 403;
        error.code = 'ARTICLE_UNPUBLISHED';
        throw error;
      }
      // Reporters can only preview their own unpublished drafts unless editor or super_admin
      if (currentUser.role === 'reporter' && article.author_id !== currentUser.id) {
        const error = new Error('You do not have permission to view this unpublished draft');
        error.statusCode = 403;
        error.code = 'FORBIDDEN_DRAFT';
        throw error;
      }
    }

    // Load attached tags
    const tags = await query(
      `SELECT t.id, t.name, t.slug 
       FROM tags t 
       JOIN article_tags at ON t.id = at.tag_id 
       WHERE at.article_id = ?`,
      [article.id]
    );
    article.tags = tags;

    // Load multimedia embeds
    const multimedia = await query(
      `SELECT id, media_type, embed_url, duration_seconds, thumbnail_url, transcript 
       FROM article_multimedia 
       WHERE article_id = ?`,
      [article.id]
    );
    article.multimedia = multimedia;

    // Increment view metrics asynchronously for published dispatches
    if (article.status === 'published' && !currentUser) {
      this.recordViewTelemetry(article.id, reqMetadata).catch((err) => {
        console.warn('[Telemetry Warning] View count update skipped:', err.message);
      });
    }

    return article;
  },

  // Record hourly aggregated view count
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

  // Create article (Draft, In-Review, or Published)
  async createArticle(data, authorId, ipAddress) {
    const {
      title,
      slug: customSlug = null,
      kicker = null,
      shortDescription,
      articleBody,
      featuredImage = null,
      imageCaption = null,
      categoryId,
      status = 'draft',
      priority = 0,
      isFeatured = false,
      isBreaking = false,
      isSponsored = false,
      sponsorClient = null,
      language = 'en',
      scheduledPublicationTime = null,
      tags = [],
      metaTitle = null,
      metaDescription = null,
      metaKeywords = null,
      canonicalUrl = null,
      ogImage = null
    } = data;

    // Ensure category exists
    const categories = await query(`SELECT id FROM categories WHERE id = ? LIMIT 1`, [categoryId]);
    if (categories.length === 0) {
      const error = new Error('Referenced category does not exist');
      error.statusCode = 400;
      error.code = 'INVALID_CATEGORY';
      throw error;
    }

    // Generate or verify unique slug
    const finalSlug = customSlug 
      ? await generateUniqueSlug(customSlug) 
      : await generateUniqueSlug(title);

    const readingTime = calculateReadingTime(articleBody);
    const publicationTime = status === 'published' ? new Date() : null;

    // Wrap article, tags, revision, and audit log in ACID transaction
    return await withTransaction(async (conn) => {
      const [artResult] = await conn.query(
        `INSERT INTO articles (
           title, slug, kicker, short_description, article_body, featured_image, image_caption,
           author_id, category_id, status, priority, is_featured, is_breaking, is_sponsored, sponsor_client,
           reading_time_minutes, language, scheduled_publication_time, publication_time,
           meta_title, meta_description, meta_keywords, canonical_url, og_image
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          title, finalSlug, kicker, shortDescription, articleBody, featuredImage, imageCaption,
          authorId, categoryId, status, priority, isFeatured ? 1 : 0, isBreaking ? 1 : 0,
          isSponsored ? 1 : 0, sponsorClient, readingTime, language, scheduledPublicationTime,
          publicationTime, metaTitle || title, metaDescription || shortDescription.slice(0, 300),
          metaKeywords, canonicalUrl, ogImage || featuredImage
        ]
      );

      const articleId = artResult.insertId;

      // Attach tags if provided
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

      // Record initial revision
      await conn.query(
        `INSERT INTO article_revisions (article_id, revision_number, title, short_description, article_body, edited_by, revision_notes)
         VALUES (?, 1, ?, ?, ?, ?, 'Initial submission')`,
        [articleId, title, shortDescription, articleBody, authorId]
      );

      // Record audit log
      await conn.query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
         VALUES (?, 'ARTICLE_CREATE', 'article', ?, ?, ?)`,
        [
          authorId,
          articleId,
          JSON.stringify({ title, slug: finalSlug, status, categoryId }),
          ipAddress
        ]
      );

      return {
        id: articleId,
        title,
        slug: finalSlug,
        status,
        readingTimeMinutes: readingTime,
        message: 'Article created successfully'
      };
    });
  },

  // Update article with revision tracking
  async updateArticle(articleId, updateData, currentUser, ipAddress) {
    const articles = await query(`SELECT * FROM articles WHERE id = ? LIMIT 1`, [articleId]);
    if (articles.length === 0) {
      const error = new Error('Article not found');
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    const current = articles[0];

    // Authorization: Reporters can only update their own drafts
    if (currentUser.role === 'reporter' && current.author_id !== currentUser.id) {
      const error = new Error('Reporters are only permitted to update their own articles');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    const title = updateData.title !== undefined ? updateData.title : current.title;
    const shortDescription = updateData.shortDescription !== undefined ? updateData.shortDescription : current.short_description;
    const articleBody = updateData.articleBody !== undefined ? updateData.articleBody : current.article_body;
    const kicker = updateData.kicker !== undefined ? updateData.kicker : current.kicker;
    const featuredImage = updateData.featuredImage !== undefined ? updateData.featuredImage : current.featured_image;
    const imageCaption = updateData.imageCaption !== undefined ? updateData.imageCaption : current.image_caption;
    const categoryId = updateData.categoryId !== undefined ? updateData.categoryId : current.category_id;
    const status = updateData.status !== undefined ? updateData.status : current.status;
    const priority = updateData.priority !== undefined ? updateData.priority : current.priority;
    const isFeatured = updateData.isFeatured !== undefined ? (updateData.isFeatured ? 1 : 0) : current.is_featured;
    const isBreaking = updateData.isBreaking !== undefined ? (updateData.isBreaking ? 1 : 0) : current.is_breaking;
    const isSponsored = updateData.isSponsored !== undefined ? (updateData.isSponsored ? 1 : 0) : current.is_sponsored;
    const sponsorClient = updateData.sponsorClient !== undefined ? updateData.sponsorClient : current.sponsor_client;
    const language = updateData.language !== undefined ? updateData.language : current.language;
    const scheduledTime = updateData.scheduledPublicationTime !== undefined ? updateData.scheduledPublicationTime : current.scheduled_publication_time;
    const metaTitle = updateData.metaTitle !== undefined ? updateData.metaTitle : current.meta_title;
    const metaDescription = updateData.metaDescription !== undefined ? updateData.metaDescription : current.meta_description;

    // Check slug change
    let slug = current.slug;
    if (updateData.slug && updateData.slug !== current.slug) {
      slug = await generateUniqueSlug(updateData.slug, articleId);
    }

    // Publication timestamp transition
    let publicationTime = current.publication_time;
    if (status === 'published' && current.status !== 'published') {
      publicationTime = new Date();
    }

    const readingTime = calculateReadingTime(articleBody);
    const contentChanged = title !== current.title || articleBody !== current.article_body || shortDescription !== current.short_description;

    return await withTransaction(async (conn) => {
      await conn.query(
        `UPDATE articles SET
           title = ?, slug = ?, kicker = ?, short_description = ?, article_body = ?,
           featured_image = ?, image_caption = ?, category_id = ?, status = ?,
           priority = ?, is_featured = ?, is_breaking = ?, is_sponsored = ?, sponsor_client = ?,
           reading_time_minutes = ?, language = ?, scheduled_publication_time = ?, publication_time = ?,
           meta_title = ?, meta_description = ?
         WHERE id = ?`,
        [
          title, slug, kicker, shortDescription, articleBody, featuredImage, imageCaption,
          categoryId, status, priority, isFeatured, isBreaking, isSponsored, sponsorClient,
          readingTime, language, scheduledTime, publicationTime, metaTitle, metaDescription,
          articleId
        ]
      );

      // Handle tags update if provided
      if (Array.isArray(updateData.tags)) {
        await conn.query(`DELETE FROM article_tags WHERE article_id = ?`, [articleId]);
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

      // If content changed, record a new revision
      if (contentChanged) {
        const [revRows] = await conn.query(
          `SELECT MAX(revision_number) as max_rev FROM article_revisions WHERE article_id = ?`,
          [articleId]
        );
        const nextRev = (revRows[0].max_rev || 0) + 1;

        await conn.query(
          `INSERT INTO article_revisions (article_id, revision_number, title, short_description, article_body, edited_by, revision_notes)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            articleId,
            nextRev,
            title,
            shortDescription,
            articleBody,
            currentUser.id,
            updateData.revisionNotes || `Revision #${nextRev} saved by ${currentUser.full_name}`
          ]
        );
      }

      // Audit log
      await conn.query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
         VALUES (?, 'ARTICLE_UPDATE', 'article', ?, ?, ?)`,
        [
          currentUser.id,
          articleId,
          JSON.stringify({ status, slug, contentChanged, revisionCreated: contentChanged }),
          ipAddress
        ]
      );

      return {
        id: articleId,
        title,
        slug,
        status,
        message: 'Article updated successfully'
      };
    });
  },

  // Delete / Archive article
  async deleteArticle(articleId, currentUser, ipAddress) {
    const articles = await query(`SELECT title, slug FROM articles WHERE id = ? LIMIT 1`, [articleId]);
    if (articles.length === 0) {
      const error = new Error('Article not found');
      error.statusCode = 404;
      throw error;
    }

    await query(`DELETE FROM articles WHERE id = ?`, [articleId]);

    await auditService.logAction({
      userId: currentUser.id,
      action: 'ARTICLE_DELETE',
      entityType: 'article',
      entityId: articleId,
      details: { title: articles[0].title, slug: articles[0].slug },
      ipAddress
    });

    return { success: true, message: `Article #${articleId} deleted successfully` };
  },

  // Get revision history for article
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

  // Automated publish runner for scheduled & expired news (triggered by cPanel cron)
  async processScheduledAndExpiringArticles() {
    // 1. Publish scheduled articles whose time has arrived
    const publishResult = await query(
      `UPDATE articles 
       SET status = 'published', publication_time = NOW() 
       WHERE status = 'scheduled' AND scheduled_publication_time <= NOW()`
    );

    // 2. Archive articles past their expiration time
    const archiveResult = await query(
      `UPDATE articles 
       SET status = 'archived' 
       WHERE status = 'published' AND expiry_time IS NOT NULL AND expiry_time <= NOW()`
    );

    return {
      publishedCount: publishResult.affectedRows || 0,
      archivedCount: archiveResult.affectedRows || 0,
      timestamp: new Date().toISOString()
    };
  }
};

export default articleService;
