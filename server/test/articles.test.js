// ========================================================================
// News Articles End-to-End Suite (Database, Slugs, Multilingual, Revisions)
// ========================================================================

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

const BASE_URL = process.env.API_URL || 'http://localhost:5000/api/v1';

describe('News Articles & Multilingual Publishing Suite', () => {
  let editorToken = '';
  let reporterToken = '';
  let createdArticleId = null;
  let marathiArticleSlug = '';

  // Setup: Authenticate editor and reporter
  test('Setup - Obtain Editor & Reporter JWT tokens', async () => {
    // Editor login
    const edRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'editor@bharatchronicle.com', password: 'Editorial@2026' })
    });
    const edBody = await edRes.json();
    assert.equal(edRes.status, 200);
    editorToken = edBody.data.token;

    // Reporter login
    const repRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'reporter@bharatchronicle.com', password: 'Editorial@2026' })
    });
    const repBody = await repRes.json();
    assert.equal(repRes.status, 200);
    reporterToken = repBody.data.token;
  });

  test('GET /articles - Public visitor can list published stories with pagination', async () => {
    const res = await fetch(`${BASE_URL}/articles?page=1&limit=5`);
    const body = await res.json();

    assert.equal(res.status, 200);
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data), 'Articles array must be returned');
    assert.ok(body.pagination.total >= 1, 'Total count must be >= 1 from seed data');
    assert.equal(body.pagination.page, 1);
    assert.equal(body.pagination.limit, 5);

    // Verify presence of required fields in returned articles
    const first = body.data[0];
    assert.ok(first.id);
    assert.ok(first.title);
    assert.ok(first.slug);
    assert.ok(first.category_name);
    assert.ok(first.author_name);
    assert.equal(first.status, 'published');
  });

  test('GET /articles/:slug - Retrieve single article detail with attached tags', async () => {
    const res = await fetch(`${BASE_URL}/articles/inside-indias-multibillion-dollar-silicon-fab-buildout`);
    const body = await res.json();

    assert.equal(res.status, 200);
    assert.equal(body.success, true);
    assert.equal(body.data.slug, 'inside-indias-multibillion-dollar-silicon-fab-buildout');
    assert.ok(body.data.article_body, 'Full article body must be returned');
    assert.ok(Array.isArray(body.data.tags), 'Tags array must be returned');
  });

  test('POST /articles - Editor creates new article with tags and SEO metadata', async () => {
    const testArticle = {
      title: 'Automated Test: Renewable Grid Storage Expansion Across Southern India',
      kicker: 'Power Transition',
      shortDescription: 'Grid-scale battery infrastructure will support solar power dispatch during peak evening loads.',
      articleBody: '<p>A major breakthrough in Southern India grid resilience was announced today with the commissioning of battery storage facilities.</p>',
      featuredImage: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'Energy storage plant substation grid transmission lines',
      categoryId: 6, // Climate & Environment
      tags: ['Green Energy', 'Power Grid', 'Infrastructure'],
      status: 'published',
      priority: 8,
      isFeatured: true,
      isBreaking: false,
      language: 'en',
      metaTitle: 'Renewable Grid Storage Expansion - Bharat Chronicle',
      metaDescription: 'Grid-scale battery infrastructure commissioned across southern states.',
      metaKeywords: 'renewable energy, battery storage, power grid'
    };

    const res = await fetch(`${BASE_URL}/articles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${editorToken}`
      },
      body: JSON.stringify(testArticle)
    });

    const body = await res.json();
    assert.equal(res.status, 201, `Creation failed: ${JSON.stringify(body)}`);
    assert.equal(body.success, true);
    assert.ok(body.data.id, 'Created article must have an id');
    assert.ok(body.data.slug, 'Slug must be generated');
    assert.equal(body.data.status, 'published');

    createdArticleId = body.data.id;
  });

  test('POST /articles - Duplicate slug handling automatically creates unique numbered slug', async () => {
    const timestamp = Date.now();
    const baseTitle = `Automated Collision Test ${timestamp} Renewable Grid Storage`;

    // Create first article
    const firstRes = await fetch(`${BASE_URL}/articles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${editorToken}` },
      body: JSON.stringify({
        title: baseTitle,
        shortDescription: 'First article report on grid resilience.',
        articleBody: '<p>First article body content describing battery installations.</p>',
        categoryId: 6,
        status: 'draft'
      })
    });
    const firstBody = await firstRes.json();
    assert.equal(firstRes.status, 201);

    // Create second article with identical title
    const secondRes = await fetch(`${BASE_URL}/articles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${editorToken}` },
      body: JSON.stringify({
        title: baseTitle,
        shortDescription: 'Duplicate article report on grid resilience.',
        articleBody: '<p>Second article body content describing battery installations.</p>',
        categoryId: 6,
        status: 'draft'
      })
    });

    const secondBody = await secondRes.json();
    assert.equal(secondRes.status, 201);
    assert.equal(secondBody.data.slug, `${firstBody.data.slug}-2`, `Second slug should append -2 suffix`);
  });

  test('POST /articles - Multilingual Marathi (मराठी) article creation & Unicode retrieval', async () => {
    const marathiTitle = 'महाराष्ट्रात नव्या सौर ऊर्जा प्रकल्पांची घोषणा: ५ हजार मेगावॅट क्षमतेचे उद्दिष्ट';
    const marathiDesc = 'राज्य सरकारने विदर्भ आणि मराठवाड्यात विकेंद्रित सौर ऊर्जा प्रकल्पांना मंजुरी दिली आहे.';
    const marathiBody = '<p>महाराष्ट्र शासनाने ऊर्जा क्षेत्रातील स्वावलंबनासाठी नवी घोषणा केली आहे. विदर्भ आणि मराठवाडा भागात मोठ्या प्रमाणावर सौर ऊर्जा पार्क उभारले जातील.</p>';

    const res = await fetch(`${BASE_URL}/articles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${editorToken}`
      },
      body: JSON.stringify({
        title: marathiTitle,
        shortDescription: marathiDesc,
        articleBody: marathiBody,
        categoryId: 6,
        language: 'mr',
        status: 'published'
      })
    });

    const body = await res.json();
    assert.equal(res.status, 201);
    assert.equal(body.success, true);
    marathiArticleSlug = body.data.slug;

    // Now retrieve it by slug and verify Unicode Marathi text is completely intact
    const getRes = await fetch(`${BASE_URL}/articles/${encodeURIComponent(marathiArticleSlug)}`);
    const getBody = await getRes.json();

    assert.equal(getRes.status, 200);
    assert.equal(getBody.data.title, marathiTitle);
    assert.equal(getBody.data.short_description, marathiDesc);
    assert.equal(getBody.data.language, 'mr');
  });

  test('PUT /articles/:id - Updating article records revision in article_revisions', async () => {
    assert.ok(createdArticleId, 'Article ID must be set from creation test');

    const updatePayload = {
      title: 'Automated Test: Renewable Grid Storage Expansion Across Southern India [UPDATED]',
      shortDescription: 'Updated: Additional 500MW capacity approved by Central Electricity Authority.',
      articleBody: '<p>Central Electricity Authority has cleared second phase battery installations.</p>',
      revisionNotes: 'Updated with CEA approval numbers'
    };

    const res = await fetch(`${BASE_URL}/articles/${createdArticleId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${editorToken}`
      },
      body: JSON.stringify(updatePayload)
    });

    const body = await res.json();
    assert.equal(res.status, 200);
    assert.equal(body.success, true);

    // Verify revisions endpoint returns the initial and second revision
    const revRes = await fetch(`${BASE_URL}/articles/${createdArticleId}/revisions`, {
      headers: { Authorization: `Bearer ${editorToken}` }
    });
    const revBody = await revRes.json();

    assert.equal(revRes.status, 200);
    assert.ok(Array.isArray(revBody.data), 'Revisions must be array');
    assert.ok(revBody.data.length >= 2, `Expected at least 2 revisions, got ${revBody.data.length}`);
    assert.equal(revBody.data[0].revision_number, 2);
  });

  test('POST /articles - Rejects invalid category foreign key with 400', async () => {
    const invalidArticle = {
      title: 'Testing Invalid Foreign Key Reference',
      shortDescription: 'This should fail gracefully on missing category.',
      articleBody: '<p>This is a sufficiently detailed article body paragraph designed to satisfy schema length validation rules.</p>',
      categoryId: 99999, // Non-existent category ID
      status: 'draft'
    };

    const res = await fetch(`${BASE_URL}/articles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${editorToken}`
      },
      body: JSON.stringify(invalidArticle)
    });

    const body = await res.json();
    assert.equal(res.status, 400);
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'INVALID_CATEGORY');
  });

  test('POST /articles/cron/publish - cPanel cron runner publishes scheduled articles', async () => {
    const res = await fetch(`${BASE_URL}/articles/cron/publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${editorToken}`
      }
    });

    const body = await res.json();
    assert.equal(res.status, 200);
    assert.equal(body.success, true);
    assert.ok(typeof body.data.publishedCount === 'number');
    assert.ok(typeof body.data.archivedCount === 'number');
  });
});
