const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

async function getProfile(req, res) {
  const userId = req.params.userId || req.user.id;
  try {
    const [rows] = await pool.execute(
      `SELECT id, username, email, role, avatar_url, bio, points, level, created_at FROM users WHERE id = ?`,
      [userId]
    );
    if (!rows.length) return res.status(404).json({ error: 'User not found' });

    const user = rows[0];

    const [[{ labs_solved }]] = await pool.execute(
      'SELECT COUNT(*) as labs_solved FROM lab_completions WHERE user_id = ?',
      [userId]
    );
    const [[{ courses_completed }]] = await pool.execute(
      'SELECT COUNT(*) as courses_completed FROM enrollments WHERE user_id = ? AND is_completed = 1',
      [userId]
    );
    const [achievements] = await pool.execute(
      `SELECT a.id, a.name, a.description, a.icon, a.badge_color, ua.earned_at
       FROM user_achievements ua JOIN achievements a ON ua.achievement_id = a.id
       WHERE ua.user_id = ?`,
      [userId]
    );
    const [recentActivity] = await pool.execute(
      `(SELECT 'lab' AS type, l.title, l.slug, lc.completed_at AS activity_at
        FROM lab_completions lc JOIN labs l ON lc.lab_id = l.id WHERE lc.user_id = ?
        ORDER BY lc.completed_at DESC LIMIT 5)
       UNION ALL
       (SELECT 'course' AS type, c.title, c.slug, e.enrolled_at AS activity_at
        FROM enrollments e JOIN courses c ON e.course_id = c.id WHERE e.user_id = ?
        ORDER BY e.enrolled_at DESC LIMIT 5)
       ORDER BY activity_at DESC LIMIT 10`,
      [userId, userId]
    );

    res.json({ ...user, labs_solved, courses_completed, achievements, recentActivity });
  } catch (err) {
    console.error('[User] Profile error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function updateProfile(req, res) {
  const userId = req.user.id;
  const { username, bio, avatar_url } = req.body;

  try {
    if (username) {
      const [existing] = await pool.execute(
        'SELECT id FROM users WHERE username = ? AND id != ?',
        [username, userId]
      );
      if (existing.length) return res.status(409).json({ error: 'Username already taken' });
    }

    await pool.execute(
      'UPDATE users SET username = COALESCE(?, username), bio = COALESCE(?, bio), avatar_url = COALESCE(?, avatar_url) WHERE id = ?',
      [username || null, bio || null, avatar_url || null, userId]
    );

    res.json({ message: 'Profile updated' });
  } catch (err) {
    console.error('[User] Update error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function changePassword(req, res) {
  const userId = req.user.id;
  const { current_password, new_password } = req.body;

  try {
    const [rows] = await pool.execute('SELECT password_hash FROM users WHERE id = ?', [userId]);
    if (!rows.length) return res.status(404).json({ error: 'User not found' });

    const valid = await bcrypt.compare(current_password, rows[0].password_hash);
    if (!valid) return res.status(401).json({ error: 'Current password incorrect' });

    const hash = await bcrypt.hash(new_password, 12);
    await pool.execute('UPDATE users SET password_hash = ? WHERE id = ?', [hash, userId]);
    await pool.execute('DELETE FROM refresh_tokens WHERE user_id = ?', [userId]);

    res.json({ message: 'Password changed. Please log in again.' });
  } catch (err) {
    console.error('[User] Password error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getNotifications(req, res) {
  const userId = req.user.id;
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
      [userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function markNotificationsRead(req, res) {
  const userId = req.user.id;
  await pool.execute('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [userId]);
  res.json({ message: 'Notifications marked as read' });
}

async function getDashboard(req, res) {
  const userId = req.user.id;
  try {
    const [[user]] = await pool.execute(
      'SELECT id, username, points, level, avatar_url FROM users WHERE id = ?',
      [userId]
    );
    const [[{ labs_solved }]] = await pool.execute(
      'SELECT COUNT(*) as labs_solved FROM lab_completions WHERE user_id = ?',
      [userId]
    );
    const [[{ courses_enrolled }]] = await pool.execute(
      'SELECT COUNT(*) as courses_enrolled FROM enrollments WHERE user_id = ?',
      [userId]
    );
    const [[{ courses_completed }]] = await pool.execute(
      'SELECT COUNT(*) as courses_completed FROM enrollments WHERE user_id = ? AND is_completed = 1',
      [userId]
    );
    const [[{ rank }]] = await pool.execute(
      'SELECT COUNT(*) + 1 as rank FROM users WHERE points > (SELECT points FROM users WHERE id = ?)',
      [userId]
    );

    const [inProgress] = await pool.execute(
      `SELECT c.id, c.title, c.slug, c.thumbnail_url, e.progress_percent
       FROM enrollments e JOIN courses c ON e.course_id = c.id
       WHERE e.user_id = ? AND e.is_completed = 0
       ORDER BY e.enrolled_at DESC LIMIT 3`,
      [userId]
    );

    const [recentLabs] = await pool.execute(
      `SELECT l.title, l.slug, l.difficulty, l.points, lc.completed_at
       FROM lab_completions lc JOIN labs l ON lc.lab_id = l.id
       WHERE lc.user_id = ?
       ORDER BY lc.completed_at DESC LIMIT 5`,
      [userId]
    );

    const [unread] = await pool.execute(
      'SELECT COUNT(*) as cnt FROM notifications WHERE user_id = ? AND is_read = 0',
      [userId]
    );

    res.json({
      user,
      stats: {
        labs_solved,
        courses_enrolled,
        courses_completed,
        rank,
        points: user.points,
        level: user.level,
        unread_notifications: unread[0].cnt,
      },
      inProgress,
      recentLabs,
    });
  } catch (err) {
    console.error('[User] Dashboard error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { getProfile, updateProfile, changePassword, getNotifications, markNotificationsRead, getDashboard };
