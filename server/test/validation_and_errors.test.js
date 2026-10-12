// ========================================================================
// Request Validation & Centralized Error Handling Suite
// ========================================================================

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

const BASE_URL = process.env.API_URL || 'http://localhost:5000/api/v1';

describe('Validation & Centralized Error Suite', () => {
  let editorToken = '';

  test('Setup - Authenticate editor', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'editor@bharatchronicle.com', password: 'Editorial@2026' })
    });
    const body = await res.json();
    assert.equal(res.status, 200);
    editorToken = body.data.token;
  });

  test('POST /articles - Zod validation rejects missing title and shortDescription with 400', async () => {
    const res = await fetch(`${BASE_URL}/articles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${editorToken}`
      },
      body: JSON.stringify({
        // Missing title & shortDescription
        articleBody: '<p>Some body content that has enough length.</p>',
        categoryId: 1
      })
    });

    const body = await res.json();
    assert.equal(res.status, 400);
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
    assert.ok(Array.isArray(body.error.details), 'Must include structured details array');
    const fields = body.error.details.map(d => d.field);
    assert.ok(fields.includes('title'), 'Title must be flagged in validation details');
    assert.ok(fields.includes('shortDescription'), 'shortDescription must be flagged');
  });

  test('POST /auth/login - Rejects malformed email string with 400', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'this-is-not-an-email',
        password: 'Password123'
      })
    });

    const body = await res.json();
    assert.equal(res.status, 400);
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
  });

  test('GET /unknown/route/path - Centralized 404 handler returns structured JSON', async () => {
    const res = await fetch('http://localhost:5000/api/v1/non-existent-subpath-404');
    const body = await res.json();

    assert.equal(res.status, 404);
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'NOT_FOUND');
    assert.ok(body.error.message.includes('not found'));
  });

  test('Security Check - Public responses never leak database passwords or internal secrets', async () => {
    const res = await fetch(`${BASE_URL}/articles/invalid-slug-probe-test-9999999`);
    const text = await res.text();

    assert.equal(text.includes('DB_PASSWORD'), false, 'Response must never leak DB_PASSWORD');
    assert.equal(text.includes('JWT_SECRET'), false, 'Response must never leak JWT_SECRET');
    assert.equal(text.includes('mysql://'), false, 'Response must never leak connection URI');
  });
});
