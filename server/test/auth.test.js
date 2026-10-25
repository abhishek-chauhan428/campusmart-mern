const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const http = require('http');
const app = require('../src/app');
const User = require('../src/models/User');
const { connectDB, disconnectDB } = require('../src/config/db');

describe('Authentication & User Model Suite', () => {
  let server;
  let port;
  let baseUrl;

  before(async () => {
    process.env.NODE_ENV = 'test';
    await connectDB();
    await User.deleteMany({});

    server = http.createServer(app);
    await new Promise((resolve) => {
      server.listen(0, () => {
        port = server.address().port;
        baseUrl = `http://localhost:${port}/api/auth`;
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await disconnectDB();
  });

  let userToken;

  it('1. should register a new student user successfully', async () => {
    const res = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Rahul Sharma',
        email: 'rahul@campus.edu',
        password: 'password123',
        college: 'Engineering Institute of Tech',
      }),
    });

    const data = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(data.success, true);
    assert.ok(data.token);
    assert.strictEqual(data.user.email, 'rahul@campus.edu');
    assert.strictEqual(data.user.passwordHash, undefined); // passwordHash must never be exposed
    assert.strictEqual(data.user.role, 'user');
    userToken = data.token;
  });

  it('2. should reject duplicate email registration with 409 Conflict', async () => {
    const res = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Rahul Duplicate',
        email: 'rahul@campus.edu',
        password: 'password123',
        college: 'Engineering Institute of Tech',
      }),
    });

    const data = await res.json();
    assert.strictEqual(res.status, 409);
    assert.strictEqual(data.success, false);
    assert.ok(data.message.includes('already exists'));
  });

  it('3. should reject invalid input with 400 Bad Request', async () => {
    const res = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'R',
        email: 'invalid-email',
        password: '123',
        college: '',
      }),
    });

    const data = await res.json();
    assert.strictEqual(res.status, 400);
    assert.strictEqual(data.success, false);
    assert.ok(Array.isArray(data.errors));
  });

  it('4. should log in successfully with valid credentials', async () => {
    const res = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'rahul@campus.edu',
        password: 'password123',
      }),
    });

    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(data.token);
    assert.strictEqual(data.user.email, 'rahul@campus.edu');
    assert.strictEqual(data.user.passwordHash, undefined);
  });

  it('5. should reject login with invalid password with generic 401', async () => {
    const res = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'rahul@campus.edu',
        password: 'wrongpassword',
      }),
    });

    const data = await res.json();
    assert.strictEqual(res.status, 401);
    assert.strictEqual(data.success, false);
    assert.strictEqual(data.message, 'Invalid email or password');
  });

  it('6. should reject login with non-existent email with generic 401', async () => {
    const res = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'doesnotexist@campus.edu',
        password: 'password123',
      }),
    });

    const data = await res.json();
    assert.strictEqual(res.status, 401);
    assert.strictEqual(data.success, false);
    assert.strictEqual(data.message, 'Invalid email or password');
  });

  it('7. should fetch current user profile via GET /api/auth/me with Bearer token', async () => {
    const res = await fetch(`${baseUrl}/me`, {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });

    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.user.email, 'rahul@campus.edu');
    assert.strictEqual(data.user.name, 'Rahul Sharma');
  });

  it('8. should reject access to /api/auth/me without token (401)', async () => {
    const res = await fetch(`${baseUrl}/me`);
    const data = await res.json();
    assert.strictEqual(res.status, 401);
    assert.strictEqual(data.success, false);
  });

  it('9. should reject banned users with 403 Forbidden', async () => {
    await User.updateOne({ email: 'rahul@campus.edu' }, { isBanned: true });

    // Try login
    const loginRes = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'rahul@campus.edu',
        password: 'password123',
      }),
    });
    assert.strictEqual(loginRes.status, 403);

    // Try protected route
    const meRes = await fetch(`${baseUrl}/me`, {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });
    assert.strictEqual(meRes.status, 403);
  });
});
