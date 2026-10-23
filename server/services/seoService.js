// ========================================================================
// SEO, Sitemaps, RSS Feeds & Prerendering Service — Phase 4
// Generates search-engine compliant XML sitemaps, RSS 2.0 dispatches,
// robots.txt, and crawler meta tag injection for article pages.
// ========================================================================

import { query } from '../config/database.js';
import articleService from './articleService.js';

const escapeXml = (unsafe = '') => {
  if (typeof unsafe !== 'string') return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

export const seoService = {
  /**
   * Generate standard XML sitemap for eligible published articles & categories.
   * Excludes drafts, scheduled articles, and expired articles.
   */
  async generateSitemapXml(baseUrl = 'https://news-platform-chi-lovat.vercel.app') {
    const cleanBase = baseUrl.replace(/\/+$/, '');

    // 1. Fetch active categories
    const categories = await query(
      `SELECT slug, updated_at FROM categories WHERE is_active = 1 ORDER BY display_order ASC`
    );

    // 2. Fetch published eligible articles
    const articles = await query(
      `SELECT a.slug, a.title, a.language, a.publication_time, a.updated_at
       FROM articles a
       WHERE a.status = 'published'
         AND (a.publication_time IS NULL OR a.publication_time <= NOW())
         AND (a.expiry_time IS NULL OR a.expiry_time > NOW())
       ORDER BY a.publication_time DESC
       LIMIT 5000`
    );

    const nowIso = new Date().toISOString();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n`;

    // Static core routes
    const coreRoutes = [
      { path: '/', priority: '1.0', changefreq: 'always' },
      { path: '/videos', priority: '0.8', changefreq: 'daily' },
      { path: '/advertise', priority: '0.8', changefreq: 'weekly' },
      { path: '/about', priority: '0.5', changefreq: 'monthly' },
      { path: '/contact', priority: '0.5', changefreq: 'monthly' },
      { path: '/policies', priority: '0.5', changefreq: 'monthly' },
      { path: '/privacy-policy', priority: '0.3', changefreq: 'yearly' },
      { path: '/terms', priority: '0.3', changefreq: 'yearly' }
    ];

    for (const r of coreRoutes) {
      xml += `  <url>\n`;
      xml += `    <loc>${cleanBase}${r.path}</loc>\n`;
      xml += `    <lastmod>${nowIso}</lastmod>\n`;
      xml += `    <changefreq>${r.changefreq}</changefreq>\n`;
      xml += `    <priority>${r.priority}</priority>\n`;
      xml += `  </url>\n`;
    }

    // Category routes
    for (const cat of categories) {
      const catMod = cat.updated_at ? new Date(cat.updated_at).toISOString() : nowIso;
      xml += `  <url>\n`;
      xml += `    <loc>${cleanBase}/category/${encodeURIComponent(cat.slug)}</loc>\n`;
      xml += `    <lastmod>${catMod}</lastmod>\n`;
      xml += `    <changefreq>hourly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    }

    // Eligible published articles
    const twoDaysAgo = Date.now() - 48 * 3600 * 1000;
    for (const art of articles) {
      const pubDate = art.publication_time ? new Date(art.publication_time) : new Date();
      const lastMod = art.updated_at ? new Date(art.updated_at).toISOString() : pubDate.toISOString();
      const isRecent = pubDate.getTime() >= twoDaysAgo;

      xml += `  <url>\n`;
      xml += `    <loc>${cleanBase}/article/${encodeURIComponent(art.slug)}</loc>\n`;
      xml += `    <lastmod>${lastMod}</lastmod>\n`;
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>0.9</priority>\n`;

      // Google News sitemap tags for fresh journalism (<48 hours old)
      if (isRecent) {
        xml += `    <news:news>\n`;
        xml += `      <news:publication>\n`;
        xml += `        <news:name>JANTA JOURNAL</news:name>\n`;
        xml += `        <news:language>${art.language || 'en'}</news:language>\n`;
        xml += `      </news:publication>\n`;
        xml += `      <news:publication_date>${pubDate.toISOString()}</news:publication_date>\n`;
        xml += `      <news:title>${escapeXml(art.title)}</news:title>\n`;
        xml += `    </news:news>\n`;
      }

      xml += `  </url>\n`;
    }

    xml += `</urlset>`;
    return xml;
  },

  /**
   * Generate RSS 2.0 XML feed of the latest published eligible articles.
   */
  async generateRssXml(baseUrl = 'https://news-platform-chi-lovat.vercel.app') {
    const cleanBase = baseUrl.replace(/\/+$/, '');

    const articles = await query(
      `SELECT a.id, a.title, a.slug, a.short_description, a.featured_image, a.language,
              a.publication_time, c.name as category_name, u.full_name as author_name
       FROM articles a
       LEFT JOIN categories c ON a.category_id = c.id
       LEFT JOIN users u ON a.author_id = u.id
       WHERE a.status = 'published'
         AND (a.publication_time IS NULL OR a.publication_time <= NOW())
         AND (a.expiry_time IS NULL OR a.expiry_time > NOW())
       ORDER BY a.publication_time DESC
       LIMIT 30`
    );

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/" xmlns:dc="http://purl.org/dc/elements/1.1/">\n`;
    xml += `  <channel>\n`;
    xml += `    <title>JANTA JOURNAL</title>\n`;
    xml += `    <link>${cleanBase}</link>\n`;
    xml += `    <description>Independent National Daily of Record — Strategic Affairs, Economy, Science and Public Conscience</description>\n`;
    xml += `    <language>en-in</language>\n`;
    xml += `    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>\n`;
    xml += `    <atom:link href="${cleanBase}/rss.xml" rel="self" type="application/rss+xml" />\n`;

    for (const art of articles) {
      const pubDate = art.publication_time ? new Date(art.publication_time).toUTCString() : new Date().toUTCString();
      const articleUrl = `${cleanBase}/article/${encodeURIComponent(art.slug)}`;

      xml += `    <item>\n`;
      xml += `      <title>${escapeXml(art.title)}</title>\n`;
      xml += `      <link>${articleUrl}</link>\n`;
      xml += `      <guid isPermaLink="true">${articleUrl}</guid>\n`;
      xml += `      <pubDate>${pubDate}</pubDate>\n`;
      xml += `      <dc:creator>${escapeXml(art.author_name || 'Chronicle Editorial Bureau')}</dc:creator>\n`;
      if (art.category_name) {
        xml += `      <category>${escapeXml(art.category_name)}</category>\n`;
      }
      xml += `      <description>${escapeXml(art.short_description)}</description>\n`;
      if (art.featured_image) {
        xml += `      <enclosure url="${escapeXml(art.featured_image)}" type="image/jpeg" />\n`;
        xml += `      <media:content url="${escapeXml(art.featured_image)}" medium="image" />\n`;
      }
      xml += `    </item>\n`;
    }

    xml += `  </channel>\n`;
    xml += `</rss>`;
    return xml;
  },

  /**
   * Return standard robots.txt.
   */
  getRobotsTxt(baseUrl = 'https://news-platform-chi-lovat.vercel.app') {
    const cleanBase = baseUrl.replace(/\/+$/, '');
    return `# JANTA JOURNAL Robots Exclusion Standard
User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/
Disallow: /api/

Sitemap: ${cleanBase}/sitemap.xml
`;
  },

  /**
   * Prerender article metadata, Open Graph, Twitter cards, and JSON-LD structured data into index.html
   */
  async prerenderArticleHtml(slug, baseUrl = 'https://news-platform-chi-lovat.vercel.app', baseHtml = '') {
    const cleanBase = baseUrl.replace(/\/+$/, '');

    try {
      const article = await articleService.getArticleBySlug(slug, null, {});
      if (!article) return { notFound: true };

      const title = article.meta_title || `${article.title} — JANTA JOURNAL`;
      const description = article.meta_description || article.short_description || '';
      const canonical = article.canonical_url || `${cleanBase}/article/${article.slug}`;
      const ogImage = article.og_image || article.featured_image || `${cleanBase}/og-default.jpg`;
      const publishedTime = article.publication_time ? new Date(article.publication_time).toISOString() : new Date().toISOString();
      const modifiedTime = article.updated_at ? new Date(article.updated_at).toISOString() : publishedTime;
      const authorName = article.author_name || 'Chronicle Bureau';
      const section = article.category_name || 'National';

      // JSON-LD NewsArticle structured data
      const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': canonical
        },
        headline: article.title,
        description: description,
        image: [ogImage],
        datePublished: publishedTime,
        dateModified: modifiedTime,
        author: {
          '@type': 'Person',
          name: authorName,
          jobTitle: article.author_designation || 'Staff Correspondent'
        },
        publisher: {
          '@type': 'NewsMediaOrganization',
          name: 'JANTA JOURNAL',
          url: cleanBase,
          logo: {
            '@type': 'ImageObject',
            url: `${cleanBase}/masthead-logo.png`
          }
        },
        articleSection: section,
        inLanguage: article.language || 'en'
      };

      const metaTags = `
    <!-- Primary Metadata -->
    <title>${escapeXml(title)}</title>
    <meta name="description" content="${escapeXml(description)}" />
    ${article.meta_keywords ? `<meta name="keywords" content="${escapeXml(article.meta_keywords)}" />` : ''}
    <link rel="canonical" href="${escapeXml(canonical)}" />

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="JANTA JOURNAL" />
    <meta property="og:url" content="${escapeXml(canonical)}" />
    <meta property="og:title" content="${escapeXml(title)}" />
    <meta property="og:description" content="${escapeXml(description)}" />
    <meta property="og:image" content="${escapeXml(ogImage)}" />
    <meta property="article:published_time" content="${publishedTime}" />
    <meta property="article:modified_time" content="${modifiedTime}" />
    <meta property="article:section" content="${escapeXml(section)}" />
    <meta property="article:author" content="${escapeXml(authorName)}" />

    <!-- Twitter Cards -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${escapeXml(canonical)}" />
    <meta name="twitter:title" content="${escapeXml(title)}" />
    <meta name="twitter:description" content="${escapeXml(description)}" />
    <meta name="twitter:image" content="${escapeXml(ogImage)}" />

    <!-- Schema.org NewsArticle Structured Data -->
    <script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2)}
    </script>
`;

      // Inject into <head> of baseHtml
      let enriched = baseHtml;
      if (enriched.includes('<head>')) {
        // Strip existing default title if present
        enriched = enriched.replace(/<title>.*?<\/title>/i, '');
        enriched = enriched.replace('<head>', `<head>${metaTags}`);
      } else {
        enriched = `<!DOCTYPE html><html><head>${metaTags}</head><body><div id="root"></div></body></html>`;
      }

      return { notFound: false, html: enriched, article };
    } catch (err) {
      return { notFound: true, error: err.message };
    }
  }
};

export default seoService;
