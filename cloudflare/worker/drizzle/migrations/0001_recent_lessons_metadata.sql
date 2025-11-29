ALTER TABLE recent_lessons ADD COLUMN lesson_id TEXT;
ALTER TABLE recent_lessons ADD COLUMN course_id TEXT;
ALTER TABLE recent_lessons ADD COLUMN thumbnail_url TEXT;
ALTER TABLE recent_lessons ADD COLUMN progress INTEGER NOT NULL DEFAULT 0;

UPDATE recent_lessons
SET
  lesson_id = 'lesson-' || id,
  course_id = 'course-1',
  thumbnail_url = 'https://cdn.example.com/course-thumbnails/default.png',
  progress = CASE
    WHEN id = 1 THEN 85
    WHEN id = 2 THEN 100
    WHEN id = 3 THEN 100
    WHEN id = 4 THEN 60
    WHEN id = 5 THEN 40
    ELSE 50
  END
WHERE user_id = 'demo-user';
