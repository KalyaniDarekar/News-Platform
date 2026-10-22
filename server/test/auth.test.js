// ========================================================================
// Authentication & Role-Based Access Control Tests
// ========================================================================

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

const BASE_URL = process.env.API_URL || 'http://localhost:5000/api/v1';

describe('Admin Authentication & RBAC Suite', () => {
  let adminToken = '';
  let reporterToken = '';

  test('POST /auth/login - Super Admin login succeeds with valid credentials', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'SuperAdmin',
        password: 'Admin@123'
      })
    });

    const body = await res.json();
    assert.equal(res.status, 200, `Expected 200, got ${res.status}: ${JSON.stringify(body)}`);
    assert.equal(body.success, true);
    assert.ok(body.data.token, 'Token must be present in login response');
    assert.equal(body.data.user.username, 'SuperAdmin');
    assert.equal(body.data.user.role, 'super_admin');
    assert.ok(Array.isArray(body.data.permissions), 'Permissions must be returned as array');

    adminToken = body.data.token;
  });

  test('POST /auth/login - Fails with incorrect password', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'SuperAdmin',
        password: 'WrongPassword999!'
      })
    });

    const body = await res.json();
    assert.equal(res.status, 401);
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'INVALID_CREDENTIALS');
  });

  test('POST /auth/login - Fails with non-existent user email', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'NonExistentUser',
        password: 'Admin@123'
      })
    });

    const body = await res.json();
    assert.equal(res.status, 401);
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'INVALID_CREDENTIALS');
  });

  test('GET /auth/me - Returns current user info when valid Bearer token provided', async () => {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    const body = await res.json();
    assert.equal(res.status, 200);
    assert.equal(body.success, true);
    assert.equal(body.data.username, 'SuperAdmin');
    assert.equal(body.data.role, 'super_admin');
  });

  test('GET /auth/me - Rejects request with 401 when token is missing', async () => {
    const res = await fetch(`${BASE_URL}/auth/me`);
    const body = await res.json();
    assert.equal(res.status, 401);
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'UNAUTHORIZED');
  });

  test('GET /auth/me - Rejects request with 401 when token is malformed', async () => {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: 'Bearer this-is-not-a-valid-jwt-token' }
    });
    const body = await res.json();
    assert.equal(res.status, 401);
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'INVALID_TOKEN');
  });

  test('POST /auth/login - Reporter login succeeds', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'Reporter',
        password: 'Reporter@123'
      })
    });

    const body = await res.json();
    assert.equal(res.status, 200);
    assert.equal(body.data.user.role, 'reporter');
    reporterToken = body.data.token;
  });

  test('GET /auth/users - Super Admin can list users, Reporter is denied (403 Forbidden)', async () => {
    // 1. Reporter attempt -> should fail with 403
    const reporterRes = await fetch(`${BASE_URL}/auth/users`, {
      headers: { Authorization: `Bearer ${reporterToken}` }
    });
    const reporterBody = await reporterRes.json();
    assert.equal(reporterRes.status, 403, 'Reporter must not access user list');
    assert.equal(reporterBody.error.code, 'FORBIDDEN_ROLE');

    // 2. Super Admin attempt -> should succeed
    const adminRes = await fetch(`${BASE_URL}/auth/users`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const adminBody = await adminRes.json();
    assert.equal(adminRes.status, 200);
    assert.equal(adminBody.success, true);
    assert.ok(Array.isArray(adminBody.data), 'Users list must be returned');
    assert.ok(adminBody.data.length >= 3, 'Must contain at least seed users');
  });

  test('POST /auth/logout - Logout succeeds and logs event', async () => {
    const res = await fetch(`${BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      }
    });

    const body = await res.json();
    assert.equal(res.status, 200);
    assert.equal(body.success, true);
  });
});
