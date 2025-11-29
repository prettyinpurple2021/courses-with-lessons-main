PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  rarity TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  achievement_id TEXT NOT NULL,
  unlocked_at INTEGER,
  UNIQUE (user_id, achievement_id),
  FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS recent_lessons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  lesson_title TEXT NOT NULL,
  course_title TEXT NOT NULL,
  completed_at INTEGER NOT NULL DEFAULT (unixepoch())
);

INSERT OR IGNORE INTO achievements (id, title, description, icon, rarity, created_at) VALUES
  ('first-steps', 'First Steps', 'Complete your first lesson', '👣', 'common', unixepoch()),
  ('course-starter', 'Course Starter', 'Enroll in your first course', '🎯', 'common', unixepoch()),
  ('dedicated-learner', 'Dedicated Learner', 'Complete 5 lessons in a row', '🔥', 'rare', unixepoch()),
  ('course-conqueror', 'Course Conqueror', 'Complete your first course', '🎓', 'epic', unixepoch()),
  ('perfect-score', 'Perfect Score', 'Score 100% on a final exam', '⭐', 'epic', unixepoch()),
  ('community-leader', 'Community Leader', 'Help 10 other students in the forum', '👑', 'legendary', unixepoch()),
  ('boss-commander', 'Boss Commander', 'Complete all 7 courses', '💎', 'legendary', unixepoch()),
  ('speed-demon', 'Speed Demon', 'Complete a course in under 2 weeks', '⚡', 'rare', unixepoch());

INSERT OR IGNORE INTO user_achievements (user_id, achievement_id, unlocked_at) VALUES
  ('demo-user', 'first-steps', unixepoch() - (7 * 24 * 60 * 60)),
  ('demo-user', 'course-starter', unixepoch() - (7 * 24 * 60 * 60)),
  ('demo-user', 'dedicated-learner', unixepoch() - (3 * 24 * 60 * 60));

INSERT OR IGNORE INTO recent_lessons (user_id, lesson_title, course_title, completed_at) VALUES
  ('demo-user', 'Lesson 4: Growth Systems', 'Course 3: Momentum Mechanics', unixepoch() - (2 * 24 * 60 * 60)),
  ('demo-user', 'Lesson 3: Offer Architecture', 'Course 2: Market Velocity', unixepoch() - (3 * 24 * 60 * 60)),
  ('demo-user', 'Lesson 2: Audience Mapping', 'Course 2: Market Velocity', unixepoch() - (5 * 24 * 60 * 60)),
  ('demo-user', 'Lesson 1: Vision Calibration', 'Course 1: Strategic Foundations', unixepoch() - (7 * 24 * 60 * 60)),
  ('demo-user', 'Workshop: Story Driver', 'Course 4: Conversion Orchestration', unixepoch() - (9 * 24 * 60 * 60)),
  ('demo-user', 'Sprint Review: KPI Deep Dive', 'Course 5: Systems Sovereignty', unixepoch() - (12 * 24 * 60 * 60));
