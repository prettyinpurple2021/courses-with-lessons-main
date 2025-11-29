PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  course_number INTEGER NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  thumbnail TEXT NOT NULL,
  published INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS lessons (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL,
  lesson_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  youtube_video_id TEXT NOT NULL,
  duration INTEGER NOT NULL,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS final_projects (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  instructions TEXT,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS final_project_submissions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  status TEXT NOT NULL,
  submitted_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (project_id) REFERENCES final_projects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS final_exams (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  time_limit INTEGER NOT NULL,
  passing_score INTEGER NOT NULL,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS final_exam_results (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  exam_id TEXT NOT NULL,
  score INTEGER,
  passed INTEGER NOT NULL DEFAULT 0,
  submitted_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (exam_id) REFERENCES final_exams(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS enrollments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  enrolled_at INTEGER NOT NULL DEFAULT (unixepoch()),
  completed_at INTEGER,
  current_lesson INTEGER NOT NULL DEFAULT 1,
  unlocked_courses INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS lesson_progress (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  completed INTEGER NOT NULL DEFAULT 0,
  completed_at INTEGER,
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS courses_course_number_idx ON courses(course_number);
CREATE INDEX IF NOT EXISTS courses_published_idx ON courses(published);
CREATE UNIQUE INDEX IF NOT EXISTS lessons_course_lesson_unique ON lessons(course_id, lesson_number);
CREATE INDEX IF NOT EXISTS lessons_course_idx ON lessons(course_id);
CREATE UNIQUE INDEX IF NOT EXISTS final_project_submission_unique ON final_project_submissions(user_id, project_id);
CREATE UNIQUE INDEX IF NOT EXISTS final_exams_course_unique ON final_exams(course_id);
CREATE UNIQUE INDEX IF NOT EXISTS final_exam_results_user_exam_unique ON final_exam_results(user_id, exam_id);
CREATE UNIQUE INDEX IF NOT EXISTS enrollments_user_course_unique ON enrollments(user_id, course_id);
CREATE INDEX IF NOT EXISTS enrollments_user_idx ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS enrollments_course_idx ON enrollments(course_id);
CREATE UNIQUE INDEX IF NOT EXISTS lesson_progress_user_lesson_unique ON lesson_progress(user_id, lesson_id);

INSERT OR IGNORE INTO courses (id, course_number, title, description, thumbnail, published, created_at, updated_at) VALUES
  ('course-1', 1, 'Foundation: Business Fundamentals', 'Master the core principles of business strategy, planning, and execution.', '/images/course-1.jpg', 1, unixepoch(), unixepoch()),
  ('course-2', 2, 'Marketing Mastery', 'Learn to create compelling marketing strategies that drive results.', '/images/course-2.jpg', 1, unixepoch(), unixepoch()),
  ('course-3', 3, 'Financial Intelligence', 'Develop financial literacy and money management skills for your business.', '/images/course-3.jpg', 1, unixepoch(), unixepoch()),
  ('course-4', 4, 'Sales & Conversion', 'Master the art of selling and converting prospects into loyal customers.', '/images/course-4.jpg', 1, unixepoch(), unixepoch()),
  ('course-5', 5, 'Operations & Systems', 'Build efficient systems and processes to scale your business.', '/images/course-5.jpg', 1, unixepoch(), unixepoch()),
  ('course-6', 6, 'Leadership & Team Building', 'Develop leadership skills and learn to build high-performing teams.', '/images/course-6.jpg', 1, unixepoch(), unixepoch()),
  ('course-7', 7, 'Growth & Scaling', 'Learn strategies to scale your business to new heights.', '/images/course-7.jpg', 1, unixepoch(), unixepoch());

INSERT OR IGNORE INTO lessons (id, course_id, lesson_number, title, description, youtube_video_id, duration) VALUES
  ('course-1-lesson-1', 'course-1', 1, 'Lesson 1: Strategic Foundations', 'Establish the vision, mission, and goals for sustainable growth.', 'dQw4w9WgXcQ', 1800),
  ('course-1-lesson-2', 'course-1', 2, 'Lesson 2: Market Positioning', 'Define your target audience and unique value proposition.', 'dQw4w9WgXcQ', 1825),
  ('course-1-lesson-3', 'course-1', 3, 'Lesson 3: Offer Design', 'Craft irresistible offers aligned with customer needs.', 'dQw4w9WgXcQ', 1770),
  ('course-1-lesson-4', 'course-1', 4, 'Lesson 4: Execution Planning', 'Translate strategy into actionable execution roadmaps.', 'dQw4w9WgXcQ', 1860),
  ('course-2-lesson-1', 'course-2', 1, 'Lesson 1: Brand Story Framework', 'Build a compelling brand narrative that connects.', 'dQw4w9WgXcQ', 1750),
  ('course-2-lesson-2', 'course-2', 2, 'Lesson 2: Acquisition Flywheels', 'Design acquisition systems that scale predictably.', 'dQw4w9WgXcQ', 1880),
  ('course-2-lesson-3', 'course-2', 3, 'Lesson 3: Conversion Optimization', 'Optimize funnels and messaging for higher conversions.', 'dQw4w9WgXcQ', 1905),
  ('course-2-lesson-4', 'course-2', 4, 'Lesson 4: Retention Ecosystems', 'Create retention loops that keep customers engaged.', 'dQw4w9WgXcQ', 1855),
  ('course-3-lesson-1', 'course-3', 1, 'Lesson 1: Financial Dashboards', 'Set up financial dashboards to monitor performance.', 'dQw4w9WgXcQ', 1810),
  ('course-3-lesson-2', 'course-3', 2, 'Lesson 2: Cash Flow Mechanics', 'Manage cash flow to maintain organizational health.', 'dQw4w9WgXcQ', 1890),
  ('course-3-lesson-3', 'course-3', 3, 'Lesson 3: Profitability Levers', 'Identify levers that enhance profitability.', 'dQw4w9WgXcQ', 1765),
  ('course-3-lesson-4', 'course-3', 4, 'Lesson 4: Forecasting Systems', 'Forecast and plan for predictable scaling.', 'dQw4w9WgXcQ', 1835),
  ('course-4-lesson-1', 'course-4', 1, 'Lesson 1: Sales Psychology', 'Understand buyer behavior to increase conversions.', 'dQw4w9WgXcQ', 1775),
  ('course-4-lesson-2', 'course-4', 2, 'Lesson 2: Offer Sequencing', 'Sequence offers for maximum lifetime value.', 'dQw4w9WgXcQ', 1865),
  ('course-4-lesson-3', 'course-4', 3, 'Lesson 3: Sales Operations', 'Build a repeatable and scalable sales process.', 'dQw4w9WgXcQ', 1915),
  ('course-4-lesson-4', 'course-4', 4, 'Lesson 4: Pipeline Reviews', 'Run data-driven pipeline reviews to stay on track.', 'dQw4w9WgXcQ', 1820),
  ('course-5-lesson-1', 'course-5', 1, 'Lesson 1: Systems Thinking', 'Adopt systems thinking to scale operations.', 'dQw4w9WgXcQ', 1790),
  ('course-5-lesson-2', 'course-5', 2, 'Lesson 2: Process Automation', 'Automate key processes for efficiency.', 'dQw4w9WgXcQ', 1870),
  ('course-5-lesson-3', 'course-5', 3, 'Lesson 3: Quality Assurance', 'Embed quality assurance in every workflow.', 'dQw4w9WgXcQ', 1735),
  ('course-5-lesson-4', 'course-5', 4, 'Lesson 4: Scaling Playbooks', 'Build playbooks that keep teams aligned.', 'dQw4w9WgXcQ', 1885),
  ('course-6-lesson-1', 'course-6', 1, 'Lesson 1: Leadership DNA', 'Define the leadership DNA for your organization.', 'dQw4w9WgXcQ', 1760),
  ('course-6-lesson-2', 'course-6', 2, 'Lesson 2: Team Dynamics', 'Foster team dynamics that unlock performance.', 'dQw4w9WgXcQ', 1845),
  ('course-6-lesson-3', 'course-6', 3, 'Lesson 3: Delegation Frameworks', 'Design delegation frameworks that empower teams.', 'dQw4w9WgXcQ', 1920),
  ('course-6-lesson-4', 'course-6', 4, 'Lesson 4: Culture Systems', 'Build culture systems that scale with your team.', 'dQw4w9WgXcQ', 1805),
  ('course-7-lesson-1', 'course-7', 1, 'Lesson 1: Scale Models', 'Evaluate scale models for expansion.', 'dQw4w9WgXcQ', 1825),
  ('course-7-lesson-2', 'course-7', 2, 'Lesson 2: Capital Strategy', 'Plan capital needs for rapid expansion.', 'dQw4w9WgXcQ', 1885),
  ('course-7-lesson-3', 'course-7', 3, 'Lesson 3: Global Expansion', 'Explore global expansion playbooks.', 'dQw4w9WgXcQ', 1795),
  ('course-7-lesson-4', 'course-7', 4, 'Lesson 4: Risk Management', 'Mitigate risk while scaling aggressively.', 'dQw4w9WgXcQ', 1860);

INSERT OR IGNORE INTO final_projects (id, course_id, title, description, instructions) VALUES
  ('course-1-final-project', 'course-1', 'Foundation Blueprint Project', 'Synthesize course insights into a strategic business foundation.', 'Follow the step-by-step plan to complete your capstone project.'),
  ('course-2-final-project', 'course-2', 'Marketing Velocity Lab', 'Design a multi-channel marketing campaign with measurable milestones.', 'Create the campaign brief, activation roadmap, and performance metrics.'),
  ('course-3-final-project', 'course-3', 'Financial Control Center', 'Build an integrated financial control dashboard.', 'Deliver the dashboard layout, reporting cadence, and narrative summary.'),
  ('course-4-final-project', 'course-4', 'Conversion Accelerator', 'Prototype a high-converting sales experience across the funnel.', 'Outline the funnel, scripts, and conversion checkpoints.'),
  ('course-5-final-project', 'course-5', 'Operational Playbook', 'Document the operating system for a critical business function.', 'Map the process, automation logic, and QA measures.'),
  ('course-6-final-project', 'course-6', 'Leadership Scaling Suite', 'Create a leadership development path for your organization.', 'Define leadership principles, rituals, and talent progression.'),
  ('course-7-final-project', 'course-7', 'Scaling Strategy Thesis', 'Produce a scale thesis with growth and risk mitigation strategies.', 'Summarize growth roadmap, capital plan, and risk mitigations.');

INSERT OR IGNORE INTO final_exams (id, course_id, title, description, time_limit, passing_score) VALUES
  ('course-1-final-exam', 'course-1', 'Foundation Mastery Exam', 'Validate mastery of foundational business strategy concepts.', 60, 70),
  ('course-2-final-exam', 'course-2', 'Marketing Execution Exam', 'Assess marketing execution strategy and analytics fluency.', 60, 70),
  ('course-3-final-exam', 'course-3', 'Financial Acumen Exam', 'Evaluate command of financial intelligence and planning.', 60, 70),
  ('course-4-final-exam', 'course-4', 'Sales Dynamics Exam', 'Measure proficiency across sales operations and psychology.', 60, 70),
  ('course-5-final-exam', 'course-5', 'Operations Systems Exam', 'Confirm ability to operationalize scalable systems.', 60, 70),
  ('course-6-final-exam', 'course-6', 'Leadership Impact Exam', 'Review leadership principles and team scaling tactics.', 60, 70),
  ('course-7-final-exam', 'course-7', 'Growth Strategy Exam', 'Test knowledge of aggressive yet sustainable scaling.', 60, 70);

INSERT OR IGNORE INTO enrollments (id, user_id, course_id, enrolled_at, completed_at, current_lesson, unlocked_courses) VALUES
  ('enroll-course-1-demo-user', 'demo-user', 'course-1', unixepoch() - (60 * 24 * 60 * 60), unixepoch() - (15 * 24 * 60 * 60), 4, 3),
  ('enroll-course-2-demo-user', 'demo-user', 'course-2', unixepoch() - (30 * 24 * 60 * 60), NULL, 2, 3);

INSERT OR IGNORE INTO lesson_progress (id, user_id, lesson_id, completed, completed_at, updated_at) VALUES
  ('progress-demo-course-1-lesson-1', 'demo-user', 'course-1-lesson-1', 1, unixepoch() - (35 * 24 * 60 * 60), unixepoch()),
  ('progress-demo-course-1-lesson-2', 'demo-user', 'course-1-lesson-2', 1, unixepoch() - (32 * 24 * 60 * 60), unixepoch()),
  ('progress-demo-course-1-lesson-3', 'demo-user', 'course-1-lesson-3', 1, unixepoch() - (28 * 24 * 60 * 60), unixepoch()),
  ('progress-demo-course-1-lesson-4', 'demo-user', 'course-1-lesson-4', 1, unixepoch() - (21 * 24 * 60 * 60), unixepoch()),
  ('progress-demo-course-2-lesson-1', 'demo-user', 'course-2-lesson-1', 1, unixepoch() - (12 * 24 * 60 * 60), unixepoch()),
  ('progress-demo-course-2-lesson-2', 'demo-user', 'course-2-lesson-2', 1, unixepoch() - (9 * 24 * 60 * 60), unixepoch());

INSERT OR IGNORE INTO final_project_submissions (id, user_id, project_id, status, submitted_at) VALUES
  ('course-1-project-demo', 'demo-user', 'course-1-final-project', 'approved', unixepoch() - (18 * 24 * 60 * 60));

INSERT OR IGNORE INTO final_exam_results (id, user_id, exam_id, score, passed, submitted_at) VALUES
  ('course-1-exam-demo', 'demo-user', 'course-1-final-exam', 92, 1, unixepoch() - (18 * 24 * 60 * 60));
