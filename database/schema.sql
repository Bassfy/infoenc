-- InfoEnc Academy - Cybersecurity Learning Platform
-- MySQL Schema

CREATE DATABASE IF NOT EXISTS infoenc_academy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE infoenc_academy;

-- Users
CREATE TABLE users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('student','instructor','admin') DEFAULT 'student',
  avatar_url VARCHAR(500),
  bio TEXT,
  points INT UNSIGNED DEFAULT 0,
  level INT UNSIGNED DEFAULT 1,
  email_verified BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(255),
  reset_token VARCHAR(255),
  reset_token_expires DATETIME,
  last_login DATETIME,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Refresh tokens
CREATE TABLE refresh_tokens (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  token VARCHAR(500) UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Categories
CREATE TABLE categories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  color VARCHAR(20) DEFAULT '#00ff88',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Courses
CREATE TABLE courses (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  short_description VARCHAR(500),
  category_id INT UNSIGNED,
  instructor_id INT UNSIGNED NOT NULL,
  thumbnail_url VARCHAR(500),
  difficulty ENUM('beginner','intermediate','advanced','expert') DEFAULT 'beginner',
  duration_minutes INT UNSIGNED DEFAULT 0,
  price DECIMAL(10,2) DEFAULT 0.00,
  is_free BOOLEAN DEFAULT TRUE,
  is_published BOOLEAN DEFAULT FALSE,
  enrolled_count INT UNSIGNED DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.00,
  rating_count INT UNSIGNED DEFAULT 0,
  tags JSON,
  requirements JSON,
  what_you_learn JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Modules (sections within a course)
CREATE TABLE modules (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  course_id INT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INT UNSIGNED DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Lessons
CREATE TABLE lessons (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  module_id INT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  content LONGTEXT,
  video_url VARCHAR(500),
  video_duration_seconds INT UNSIGNED DEFAULT 0,
  lesson_type ENUM('video','text','quiz','lab') DEFAULT 'video',
  order_index INT UNSIGNED DEFAULT 0,
  is_preview BOOLEAN DEFAULT FALSE,
  resources JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
);

-- Enrollments
CREATE TABLE enrollments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  course_id INT UNSIGNED NOT NULL,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  progress_percent TINYINT UNSIGNED DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  UNIQUE KEY unique_enrollment (user_id, course_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Lesson Progress
CREATE TABLE lesson_progress (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  lesson_id INT UNSIGNED NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  watch_seconds INT UNSIGNED DEFAULT 0,
  completed_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_progress (user_id, lesson_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

-- Hacking Labs
CREATE TABLE labs (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  short_description VARCHAR(500),
  category_id INT UNSIGNED,
  difficulty ENUM('easy','medium','hard','insane') DEFAULT 'easy',
  points INT UNSIGNED DEFAULT 100,
  flag VARCHAR(255),
  flag_format VARCHAR(100) DEFAULT 'FLAG{...}',
  lab_type ENUM('web','network','crypto','forensics','reversing','pwn','osint','steganography','misc') DEFAULT 'misc',
  docker_image VARCHAR(255),
  docker_port INT UNSIGNED,
  hints JSON,
  tools_needed JSON,
  writeup_url VARCHAR(500),
  is_published BOOLEAN DEFAULT FALSE,
  solve_count INT UNSIGNED DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Lab Submissions
CREATE TABLE lab_submissions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  lab_id INT UNSIGNED NOT NULL,
  submitted_flag VARCHAR(255) NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  points_earned INT UNSIGNED DEFAULT 0,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (lab_id) REFERENCES labs(id) ON DELETE CASCADE
);

-- Lab Completions (one per user/lab)
CREATE TABLE lab_completions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  lab_id INT UNSIGNED NOT NULL,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  points_earned INT UNSIGNED DEFAULT 0,
  UNIQUE KEY unique_completion (user_id, lab_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (lab_id) REFERENCES labs(id) ON DELETE CASCADE
);

-- Quizzes
CREATE TABLE quizzes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  lesson_id INT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL,
  pass_score TINYINT UNSIGNED DEFAULT 70,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

-- Quiz Questions
CREATE TABLE quiz_questions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  quiz_id INT UNSIGNED NOT NULL,
  question TEXT NOT NULL,
  question_type ENUM('single','multiple','text') DEFAULT 'single',
  options JSON,
  correct_answer JSON,
  explanation TEXT,
  points INT UNSIGNED DEFAULT 10,
  order_index INT UNSIGNED DEFAULT 0,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- Quiz Attempts
CREATE TABLE quiz_attempts (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  quiz_id INT UNSIGNED NOT NULL,
  answers JSON,
  score TINYINT UNSIGNED DEFAULT 0,
  passed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- Certificates
CREATE TABLE certificates (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  course_id INT UNSIGNED,
  certificate_number VARCHAR(100) UNIQUE NOT NULL,
  issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL
);

-- Achievements
CREATE TABLE achievements (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  badge_color VARCHAR(20),
  points INT UNSIGNED DEFAULT 0,
  condition_type VARCHAR(50),
  condition_value INT UNSIGNED,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Achievements
CREATE TABLE user_achievements (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  achievement_id INT UNSIGNED NOT NULL,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_achievement (user_id, achievement_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE
);

-- Forum Posts
CREATE TABLE forum_posts (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  course_id INT UNSIGNED,
  lab_id INT UNSIGNED,
  title VARCHAR(255),
  content TEXT NOT NULL,
  parent_id INT UNSIGNED,
  is_pinned BOOLEAN DEFAULT FALSE,
  upvotes INT UNSIGNED DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (lab_id) REFERENCES labs(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES forum_posts(id) ON DELETE CASCADE
);

-- Notifications
CREATE TABLE notifications (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_courses_category ON courses(category_id);
CREATE INDEX idx_courses_instructor ON courses(instructor_id);
CREATE INDEX idx_enrollments_user ON enrollments(user_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_lesson_progress_user ON lesson_progress(user_id);
CREATE INDEX idx_lab_completions_user ON lab_completions(user_id);
CREATE INDEX idx_users_points ON users(points DESC);

-- Seed: Categories
INSERT INTO categories (name, slug, description, icon, color) VALUES
('Web Security', 'web-security', 'XSS, SQL Injection, CSRF, and web application attacks', 'globe', '#00ff88'),
('Network Security', 'network-security', 'Packet analysis, network protocols, and intrusion detection', 'network', '#0088ff'),
('Cryptography', 'cryptography', 'Encryption, hashing, and cryptographic attacks', 'lock', '#ff8800'),
('Malware Analysis', 'malware-analysis', 'Reverse engineering and malware behavior analysis', 'bug', '#ff0044'),
('Forensics', 'forensics', 'Digital forensics, log analysis, and evidence recovery', 'search', '#8800ff'),
('Penetration Testing', 'penetration-testing', 'Ethical hacking, exploitation, and post-exploitation', 'shield', '#ff0088'),
('OSINT', 'osint', 'Open source intelligence gathering and reconnaissance', 'eye', '#00ffff'),
('Cloud Security', 'cloud-security', 'AWS, GCP, Azure security misconfigurations and attacks', 'cloud', '#ffff00');

-- Seed: Achievements
INSERT INTO achievements (name, description, icon, badge_color, points, condition_type, condition_value) VALUES
('First Blood', 'Complete your first lab challenge', 'trophy', '#ff4444', 50, 'labs_completed', 1),
('Course Completer', 'Complete your first course', 'graduation-cap', '#4444ff', 100, 'courses_completed', 1),
('Hacker Elite', 'Complete 10 lab challenges', 'skull', '#ff8800', 200, 'labs_completed', 10),
('Knowledge Seeker', 'Enroll in 5 courses', 'book', '#00ff88', 50, 'courses_enrolled', 5),
('CTF Champion', 'Earn 1000 points total', 'crown', '#ffff00', 500, 'total_points', 1000),
('Speed Runner', 'Complete a lab in under 30 minutes', 'zap', '#00ffff', 75, 'fast_solve', 30),
('Veteran', 'Complete 50 lessons', 'star', '#ff44ff', 150, 'lessons_completed', 50);
