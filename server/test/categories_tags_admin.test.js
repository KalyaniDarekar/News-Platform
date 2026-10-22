// ========================================================================
// Categories, Tags, Media, Settings, Audit & Analytics Suite
// ========================================================================

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

const BASE_URL = process.env.API_URL || 'http://localhost:5000/api/v1';

describe('Admin Capabilities & Taxonomy Suite', () => {
  let adminToken = '';
  let editorToken = '';

  test('Setup - Obtain Admin & Editor tokens', async () => {
    const adminRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'SuperAdmin', password: 'Admin@123' })
    });
    const adminBody = await adminRes.json();
    assert.equal(adminRes.status, 200);
    adminToken = adminBody.data.token;

    const edRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'Editor', password: 'Editor@123' })
    });
    const edBody = await edRes.json();
    assert.equal(edRes.status, 200);
    editorToken = edBody.data.token;
  });

  test('GET /categories - Returns all categories with live article counts', async () => {
    const res = await fetch(`${BASE_URL}/categories`);
    const body = await res.json();

    assert.equal(res.status, 200);
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length >= 8, 'Should have at least 8 seeded categories');

    const national = body.data.find(c => c.slug === 'national');
    assert.ok(national);
    assert.ok(typeof national.article_count === 'number');
  });

  test('POST /categories - Editor can create a new category', async () => {
    const uniqueSlug = `test-cat-${Date.now()}`;
    const res = await fetch(`${BASE_URL}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${editorToken}` },
      body: JSON.stringify({
        name: `Automated Category ${Date.now()}`,
        slug: uniqueSlug,
        description: 'Category created during automated backend testing',
        colorBadge: '#2563EB',
        displayOrder: 99
      })
    });

    const body = await res.json();
    assert.equal(res.status, 201);
    assert.equal(body.success, true);
    assert.equal(body.data.slug, uniqueSlug);
  });

  test('GET /tags - Returns tags list with usage counts', async () => {
    const res = await fetch(`${BASE_URL}/tags`);
    const body = await res.json();

    assert.equal(res.status, 200);
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length >= 1);
  });

  test('GET /analytics/dashboard - Returns real database metrics and activity', async () => {
    const res = await fetch(`${BASE_URL}/analytics/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    const body = await res.json();
    assert.equal(res.status, 200);
    assert.equal(body.success, true);
    assert.ok(body.data.overview, 'Overview statistics present');
    assert.ok(typeof body.data.overview.totalArticleViews === 'number' || typeof body.data.overview.totalArticleViews === 'string');
    assert.ok(Array.isArray(body.data.topArticles), 'Top articles array present');
    assert.ok(Array.isArray(body.data.recentActions), 'Recent actions present');
  });

  test('GET /audit-logs - Admin can inspect newsroom audit history', async () => {
    const res = await fetch(`${BASE_URL}/audit-logs?limit=10`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    const body = await res.json();
    assert.equal(res.status, 200);
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length >= 1, 'Must contain logged actions from earlier tests');
    assert.ok(body.data[0].action);
    assert.ok(body.data[0].created_at);
  });

  test('GET /settings - Retrieve site settings', async () => {
    const res = await fetch(`${BASE_URL}/settings`);
    const body = await res.json();

    assert.equal(res.status, 200);
    assert.equal(body.success, true);
    assert.ok(body.data.settings && (body.data.settings['site.name'] || body.data.settings.site_name));
  });

  test('GET /ads/placements - Retrieve ad placement slots', async () => {
    const res = await fetch(`${BASE_URL}/ads/placements`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const body = await res.json();

    assert.equal(res.status, 200);
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length >= 1);
  });
});
