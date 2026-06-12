const { pool } = require('../config/database');

async function listCourses(req, res) {
  const { category, difficulty, search, page = 1, limit = 12 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let where = ['c.is_published = 1'];
  const params = [];

  if (category) { where.push('cat.slug = ?'); params.push(category); }
  if (difficulty) { where.push('c.difficulty = ?'); params.push(difficulty); }
  if (search) {
    where.push('(c.title LIKE ? OR c.short_description LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  try {
    const [courses] = await pool.execute(
      `SELECT c.id, c.title, c.slug, c.short_description, c.thumbnail_url,
              c.difficulty, c.duration_minutes, c.enrolled_count, c.rating,
              c.is_free, c.price,
              cat.name AS category_name, cat.color AS category_color,
              u.username AS instructor_name, u.avatar_url AS instructor_avatar
       FROM courses c
       LEFT JOIN categories cat ON c.category_id = cat.id
       LEFT JOIN users u ON c.instructor_id = u.id
       ${whereClause}
       ORDER BY c.enrolled_count DESC
       LIMIT ${parseInt(limit)} OFFSET ${offset}`,
      params
    );

    const [[{ total }]] = await pool.execute(
      `SELECT COUNT(*) as total FROM courses c
       LEFT JOIN categories cat ON c.category_id = cat.id
       ${whereClause}`,
      params
    );

    res.json({ courses, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error('[Courses] List error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getCourse(req, res) {
  const { slug } = req.params;
  const userId = req.user?.id;

  try {
    const [rows] = await pool.execute(
      `SELECT c.*, cat.name AS category_name, cat.color AS category_color,
              u.username AS instructor_name, u.avatar_url AS instructor_avatar, u.bio AS instructor_bio
       FROM courses c
       LEFT JOIN categories cat ON c.category_id = cat.id
       LEFT JOIN users u ON c.instructor_id = u.id
       WHERE c.slug = ? AND c.is_published = 1`,
      [slug]
    );
    if (!rows.length) return res.status(404).json({ error: 'Course not found' });

    const course = rows[0];

    const [modules] = await pool.execute(
      `SELECT m.id, m.title, m.description, m.order_index,
              JSON_ARRAYAGG(
                JSON_OBJECT('id', l.id, 'title', l.title, 'lesson_type', l.lesson_type,
                            'video_duration_seconds', l.video_duration_seconds,
                            'is_preview', l.is_preview, 'order_index', l.order_index)
              ) AS lessons
       FROM modules m
       LEFT JOIN lessons l ON l.module_id = m.id
       WHERE m.course_id = ?
       GROUP BY m.id
       ORDER BY m.order_index`,
      [course.id]
    );

    let enrollment = null;
    if (userId) {
      const [enroll] = await pool.execute(
        'SELECT progress_percent, is_completed FROM enrollments WHERE user_id = ? AND course_id = ?',
        [userId, course.id]
      );
      enrollment = enroll[0] || null;
    }

    res.json({ ...course, modules, enrollment });
  } catch (err) {
    console.error('[Courses] Get error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function enroll(req, res) {
  const { courseId } = req.params;
  const userId = req.user.id;

  try {
    const [courses] = await pool.execute(
      'SELECT id, is_published FROM courses WHERE id = ?',
      [courseId]
    );
    if (!courses.length || !courses[0].is_published) {
      return res.status(404).json({ error: 'Course not found' });
    }

    await pool.execute(
      'INSERT IGNORE INTO enrollments (user_id, course_id) VALUES (?, ?)',
      [userId, courseId]
    );

    await pool.execute(
      'UPDATE courses SET enrolled_count = enrolled_count + 1 WHERE id = ?',
      [courseId]
    );

    res.json({ message: 'Enrolled successfully' });
  } catch (err) {
    console.error('[Courses] Enroll error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getLesson(req, res) {
  const { lessonId } = req.params;
  const userId = req.user.id;

  try {
    const [rows] = await pool.execute(
      `SELECT l.*, m.course_id
       FROM lessons l
       JOIN modules m ON l.module_id = m.id
       WHERE l.id = ?`,
      [lessonId]
    );
    if (!rows.length) return res.status(404).json({ error: 'Lesson not found' });

    const lesson = rows[0];

    const [enroll] = await pool.execute(
      'SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?',
      [userId, lesson.course_id]
    );

    if (!enroll.length && !lesson.is_preview) {
      return res.status(403).json({ error: 'Enroll in this course to access this lesson' });
    }

    const [progress] = await pool.execute(
      'SELECT is_completed, watch_seconds FROM lesson_progress WHERE user_id = ? AND lesson_id = ?',
      [userId, lesson.id]
    );

    res.json({ ...lesson, progress: progress[0] || null });
  } catch (err) {
    console.error('[Courses] Lesson error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function markLessonComplete(req, res) {
  const { lessonId } = req.params;
  const userId = req.user.id;

  try {
    await pool.execute(
      `INSERT INTO lesson_progress (user_id, lesson_id, is_completed, completed_at)
       VALUES (?, ?, 1, NOW())
       ON DUPLICATE KEY UPDATE is_completed = 1, completed_at = NOW()`,
      [userId, lessonId]
    );

    const [lessonRow] = await pool.execute(
      'SELECT m.course_id FROM lessons l JOIN modules m ON l.module_id = m.id WHERE l.id = ?',
      [lessonId]
    );
    if (lessonRow.length) {
      const courseId = lessonRow[0].course_id;
      const [[{ total }]] = await pool.execute(
        `SELECT COUNT(*) as total FROM lessons l JOIN modules m ON l.module_id = m.id WHERE m.course_id = ?`,
        [courseId]
      );
      const [[{ done }]] = await pool.execute(
        `SELECT COUNT(*) as done FROM lesson_progress lp
         JOIN lessons l ON lp.lesson_id = l.id
         JOIN modules m ON l.module_id = m.id
         WHERE m.course_id = ? AND lp.user_id = ? AND lp.is_completed = 1`,
        [courseId, userId]
      );
      const progress = Math.round((done / total) * 100);
      await pool.execute(
        `UPDATE enrollments SET progress_percent = ?, is_completed = ?
         WHERE user_id = ? AND course_id = ?`,
        [progress, progress >= 100, userId, courseId]
      );
    }

    res.json({ message: 'Lesson marked complete' });
  } catch (err) {
    console.error('[Courses] Complete error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getCategories(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT c.*, COUNT(co.id) AS course_count
       FROM categories c
       LEFT JOIN courses co ON co.category_id = c.id AND co.is_published = 1
       GROUP BY c.id
       ORDER BY c.name`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getMyCourses(req, res) {
  const userId = req.user.id;
  try {
    const [rows] = await pool.execute(
      `SELECT c.id, c.title, c.slug, c.thumbnail_url, c.difficulty,
              e.progress_percent, e.is_completed, e.enrolled_at
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       WHERE e.user_id = ?
       ORDER BY e.enrolled_at DESC`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { listCourses, getCourse, enroll, getLesson, markLessonComplete, getCategories, getMyCourses };
