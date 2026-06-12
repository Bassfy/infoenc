const { pool } = require('../config/database');

async function listLabs(req, res) {
  const { category, difficulty, lab_type, search, page = 1, limit = 12 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const userId = req.user?.id;

  let where = ['l.is_published = 1'];
  const params = [];

  if (category) { where.push('cat.slug = ?'); params.push(category); }
  if (difficulty) { where.push('l.difficulty = ?'); params.push(difficulty); }
  if (lab_type) { where.push('l.lab_type = ?'); params.push(lab_type); }
  if (search) {
    where.push('(l.title LIKE ? OR l.short_description LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  const whereClause = `WHERE ${where.join(' AND ')}`;

  try {
    const [labs] = await pool.execute(
      `SELECT l.id, l.title, l.slug, l.short_description, l.difficulty,
              l.points, l.lab_type, l.solve_count, l.flag_format,
              cat.name AS category_name, cat.color AS category_color
       FROM labs l
       LEFT JOIN categories cat ON l.category_id = cat.id
       ${whereClause}
       ORDER BY l.points ASC
       LIMIT ${parseInt(limit)} OFFSET ${offset}`,
      params
    );

    let completedLabIds = new Set();
    if (userId) {
      const [completed] = await pool.execute(
        'SELECT lab_id FROM lab_completions WHERE user_id = ?',
        [userId]
      );
      completedLabIds = new Set(completed.map(r => r.lab_id));
    }

    const labsWithStatus = labs.map(lab => ({
      ...lab,
      is_solved: completedLabIds.has(lab.id),
    }));

    const [[{ total }]] = await pool.execute(
      `SELECT COUNT(*) as total FROM labs l
       LEFT JOIN categories cat ON l.category_id = cat.id
       ${whereClause}`,
      params
    );

    res.json({ labs: labsWithStatus, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error('[Labs] List error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getLab(req, res) {
  const { slug } = req.params;
  const userId = req.user?.id;

  try {
    const [rows] = await pool.execute(
      `SELECT l.*, cat.name AS category_name, cat.color AS category_color
       FROM labs l
       LEFT JOIN categories cat ON l.category_id = cat.id
       WHERE l.slug = ? AND l.is_published = 1`,
      [slug]
    );
    if (!rows.length) return res.status(404).json({ error: 'Lab not found' });

    const lab = { ...rows[0], flag: undefined };

    let completion = null;
    let attempts = 0;
    if (userId) {
      const [comp] = await pool.execute(
        'SELECT completed_at, points_earned FROM lab_completions WHERE user_id = ? AND lab_id = ?',
        [userId, lab.id]
      );
      completion = comp[0] || null;

      const [[{ cnt }]] = await pool.execute(
        'SELECT COUNT(*) as cnt FROM lab_submissions WHERE user_id = ? AND lab_id = ?',
        [userId, lab.id]
      );
      attempts = cnt;
    }

    res.json({ ...lab, completion, attempts });
  } catch (err) {
    console.error('[Labs] Get error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function submitFlag(req, res) {
  const { slug } = req.params;
  const { flag } = req.body;
  const userId = req.user.id;

  if (!flag || typeof flag !== 'string') {
    return res.status(400).json({ error: 'Flag is required' });
  }

  try {
    const [rows] = await pool.execute(
      'SELECT id, flag, points, title FROM labs WHERE slug = ? AND is_published = 1',
      [slug]
    );
    if (!rows.length) return res.status(404).json({ error: 'Lab not found' });

    const lab = rows[0];

    const [alreadySolved] = await pool.execute(
      'SELECT id FROM lab_completions WHERE user_id = ? AND lab_id = ?',
      [userId, lab.id]
    );
    if (alreadySolved.length) {
      return res.json({ correct: true, message: 'Already solved', already_solved: true });
    }

    const isCorrect = flag.trim() === lab.flag.trim();

    await pool.execute(
      'INSERT INTO lab_submissions (user_id, lab_id, submitted_flag, is_correct, points_earned) VALUES (?, ?, ?, ?, ?)',
      [userId, lab.id, flag.trim(), isCorrect, isCorrect ? lab.points : 0]
    );

    if (isCorrect) {
      await pool.execute(
        'INSERT IGNORE INTO lab_completions (user_id, lab_id, points_earned) VALUES (?, ?, ?)',
        [userId, lab.id, lab.points]
      );
      await pool.execute(
        'UPDATE labs SET solve_count = solve_count + 1 WHERE id = ?',
        [lab.id]
      );
      await pool.execute(
        'UPDATE users SET points = points + ?, level = GREATEST(1, FLOOR((points + ?) / 500) + 1) WHERE id = ?',
        [lab.points, lab.points, userId]
      );

      await checkAchievements(userId);

      return res.json({
        correct: true,
        message: `Correct flag! You earned ${lab.points} points`,
        points_earned: lab.points,
      });
    }

    res.json({ correct: false, message: 'Incorrect flag. Try again!' });
  } catch (err) {
    console.error('[Labs] Submit error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function checkAchievements(userId) {
  const [[{ labs_count }]] = await pool.execute(
    'SELECT COUNT(*) as labs_count FROM lab_completions WHERE user_id = ?',
    [userId]
  );
  const [[{ points }]] = await pool.execute(
    'SELECT points FROM users WHERE id = ?',
    [userId]
  );

  const [achievements] = await pool.execute(
    `SELECT a.* FROM achievements a
     WHERE a.condition_type = 'labs_completed' AND a.condition_value <= ?
       AND a.id NOT IN (SELECT achievement_id FROM user_achievements WHERE user_id = ?)`,
    [labs_count, userId]
  );

  for (const ach of achievements) {
    await pool.execute(
      'INSERT IGNORE INTO user_achievements (user_id, achievement_id) VALUES (?, ?)',
      [userId, ach.id]
    );
    await pool.execute(
      'INSERT INTO notifications (user_id, type, title, message) VALUES (?, ?, ?, ?)',
      [userId, 'achievement', `Achievement Unlocked: ${ach.name}`, ach.description]
    );
  }
}

async function getLeaderboard(req, res) {
  const { period = 'all', limit = 20 } = req.query;
  try {
    let query;
    if (period === 'week') {
      query = `SELECT u.id, u.username, u.avatar_url, u.level,
                      SUM(lc.points_earned) AS period_points,
                      COUNT(lc.id) AS labs_solved
               FROM lab_completions lc
               JOIN users u ON lc.user_id = u.id
               WHERE lc.completed_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
               GROUP BY u.id
               ORDER BY period_points DESC
               LIMIT ${parseInt(limit)}`;
    } else {
      query = `SELECT id, username, avatar_url, level, points,
                      (SELECT COUNT(*) FROM lab_completions WHERE user_id = users.id) AS labs_solved,
                      (SELECT COUNT(*) FROM enrollments WHERE user_id = users.id AND is_completed = 1) AS courses_completed
               FROM users
               WHERE is_active = 1
               ORDER BY points DESC
               LIMIT ${parseInt(limit)}`;
    }

    const [rows] = await pool.execute(query);
    res.json(rows);
  } catch (err) {
    console.error('[Labs] Leaderboard error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getHint(req, res) {
  const { slug } = req.params;
  const { index } = req.query;
  const userId = req.user.id;

  try {
    const [rows] = await pool.execute(
      'SELECT hints, points FROM labs WHERE slug = ? AND is_published = 1',
      [slug]
    );
    if (!rows.length) return res.status(404).json({ error: 'Lab not found' });

    const hints = rows[0].hints || [];
    const hintIndex = parseInt(index) || 0;

    if (hintIndex >= hints.length) {
      return res.status(404).json({ error: 'Hint not found' });
    }

    const hintCost = Math.floor(rows[0].points * 0.1);
    res.json({ hint: hints[hintIndex], cost: hintCost });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { listLabs, getLab, submitFlag, getLeaderboard, getHint };
