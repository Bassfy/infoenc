const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_in_prod';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_change_in_prod';

function signAccessToken(userId, role) {
  return jwt.sign(
    { userId, role },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
}

function signRefreshToken(userId) {
  return jwt.sign(
    { userId },
    JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
}

let pool;
function getPool() {
  if (!pool) {
    try {
      pool = require('../config/database').pool;
    } catch {
      pool = null;
    }
  }
  return pool;
}

async function register(req, res) {
  const { email, password, firstName, lastName, phone } = req.body;
  const db = getPool();

  try {
    if (db) {
      const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
      if (existing.rows.length) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      const hash = await bcrypt.hash(password, 12);
      const verifyToken = uuidv4();

      const result = await db.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, phone, email_verify_token)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, first_name, last_name, role`,
        [email, hash, firstName, lastName, phone || null, verifyToken]
      );

      const user = result.rows[0];
      const refreshToken = signRefreshToken(user.id);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await db.query(
        'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
        [user.id, refreshToken, expiresAt]
      );

      return res.status(201).json({
        message: 'Account created successfully',
        accessToken: signAccessToken(user.id, user.role),
        refreshToken,
        user: { id: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name, role: user.role },
      });
    }

    // No DB — return mock response for development
    const mockUser = { id: uuidv4(), email, firstName, lastName, role: 'customer' };
    return res.status(201).json({
      message: 'Account created (development mode)',
      accessToken: signAccessToken(mockUser.id, 'customer'),
      refreshToken: signRefreshToken(mockUser.id),
      user: mockUser,
    });
  } catch (err) {
    console.error('[Auth] Register error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function login(req, res) {
  const { email, password } = req.body;
  const db = getPool();

  try {
    if (db) {
      const result = await db.query(
        'SELECT id, email, password_hash, first_name, last_name, role FROM users WHERE email = $1',
        [email]
      );

      if (!result.rows.length) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const user = result.rows[0];
      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      await db.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);

      const refreshToken = signRefreshToken(user.id);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await db.query(
        'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
        [user.id, refreshToken, expiresAt]
      );

      return res.json({
        accessToken: signAccessToken(user.id, user.role),
        refreshToken,
        user: { id: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name, role: user.role },
      });
    }

    // Development mock — accept any credentials
    const mockUser = { id: uuidv4(), email, firstName: 'Dev', lastName: 'User', role: 'customer' };
    return res.json({
      accessToken: signAccessToken(mockUser.id, 'customer'),
      refreshToken: signRefreshToken(mockUser.id),
      user: mockUser,
    });
  } catch (err) {
    console.error('[Auth] Login error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function refresh(req, res) {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const db = getPool();

    if (db) {
      const result = await db.query(
        'SELECT * FROM refresh_tokens WHERE token = $1 AND user_id = $2 AND expires_at > NOW()',
        [refreshToken, decoded.userId]
      );
      if (!result.rows.length) {
        return res.status(401).json({ error: 'Invalid or expired refresh token' });
      }

      const userResult = await db.query('SELECT id, role FROM users WHERE id = $1', [decoded.userId]);
      if (!userResult.rows.length) {
        return res.status(401).json({ error: 'User not found' });
      }

      await db.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);

      const user = userResult.rows[0];
      const newRefreshToken = signRefreshToken(user.id);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await db.query(
        'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
        [user.id, newRefreshToken, expiresAt]
      );

      return res.json({
        accessToken: signAccessToken(user.id, user.role),
        refreshToken: newRefreshToken,
      });
    }

    res.json({
      accessToken: signAccessToken(decoded.userId, 'customer'),
      refreshToken: signRefreshToken(decoded.userId),
    });
  } catch {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
}

async function logout(req, res) {
  const { refreshToken } = req.body;
  const db = getPool();
  if (refreshToken && db) {
    await db.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]).catch(() => {});
  }
  res.json({ message: 'Logged out successfully' });
}

async function me(req, res) {
  const db = getPool();
  if (db) {
    const result = await db.query(
      'SELECT id, email, first_name, last_name, phone, avatar, role, created_at FROM users WHERE id = $1',
      [req.user.userId]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
    const u = result.rows[0];
    return res.json({ id: u.id, email: u.email, firstName: u.first_name, lastName: u.last_name, phone: u.phone, avatar: u.avatar, role: u.role, createdAt: u.created_at });
  }
  res.json({ id: req.user.userId, role: req.user.role });
}

module.exports = { register, login, refresh, logout, me };
