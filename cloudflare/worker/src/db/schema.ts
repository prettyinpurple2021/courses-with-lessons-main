import { sqliteTable, text, integer, uniqueIndex, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const achievements = sqliteTable('achievements', {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    icon: text('icon').notNull(),
    rarity: text('rarity').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
        .notNull()
        .default(sql`(unixepoch())`),
});

export const userAchievements = sqliteTable(
    'user_achievements',
    {
        id: integer('id').primaryKey({ autoIncrement: true }),
        userId: text('user_id').notNull(),
        achievementId: text('achievement_id')
            .references(() => achievements.id, { onDelete: 'cascade' })
            .notNull(),
        unlockedAt: integer('unlocked_at', { mode: 'timestamp' }),
    },
    (table) => ({
        userAchievementUnique: uniqueIndex('user_achievement_unique').on(
            table.userId,
            table.achievementId,
        ),
    }),
);

export const recentLessons = sqliteTable('recent_lessons', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: text('user_id').notNull(),
    lessonId: text('lesson_id'),
    lessonTitle: text('lesson_title').notNull(),
    courseId: text('course_id'),
    courseTitle: text('course_title').notNull(),
    thumbnailUrl: text('thumbnail_url'),
    progress: integer('progress').notNull().default(0),
    completedAt: integer('completed_at', { mode: 'timestamp' })
        .notNull()
        .default(sql`(unixepoch())`),
});

export const courses = sqliteTable(
    'courses',
    {
        id: text('id').primaryKey(),
        courseNumber: integer('course_number').notNull().unique(),
        title: text('title').notNull(),
        description: text('description').notNull(),
        thumbnail: text('thumbnail').notNull(),
        published: integer('published', { mode: 'boolean' }).notNull().default(true),
        createdAt: integer('created_at', { mode: 'timestamp' })
            .notNull()
            .default(sql`(unixepoch())`),
        updatedAt: integer('updated_at', { mode: 'timestamp' })
            .notNull()
            .default(sql`(unixepoch())`),
    },
    (table) => ({
        courseNumberIdx: index('courses_course_number_idx').on(table.courseNumber),
        publishedIdx: index('courses_published_idx').on(table.published),
    }),
);

export const lessons = sqliteTable(
    'lessons',
    {
        id: text('id').primaryKey(),
        courseId: text('course_id')
            .references(() => courses.id, { onDelete: 'cascade' })
            .notNull(),
        lessonNumber: integer('lesson_number').notNull(),
        title: text('title').notNull(),
        description: text('description').notNull(),
        youtubeVideoId: text('youtube_video_id').notNull(),
        duration: integer('duration').notNull(),
    },
    (table) => ({
        courseLessonUnique: uniqueIndex('lessons_course_lesson_unique').on(
            table.courseId,
            table.lessonNumber,
        ),
        courseIdx: index('lessons_course_idx').on(table.courseId),
    }),
);

export const finalProjects = sqliteTable('final_projects', {
    id: text('id').primaryKey(),
    courseId: text('course_id')
        .references(() => courses.id, { onDelete: 'cascade' })
        .notNull()
        .unique(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    instructions: text('instructions'),
});

export const finalProjectSubmissions = sqliteTable(
    'final_project_submissions',
    {
        id: text('id').primaryKey(),
        userId: text('user_id').notNull(),
        projectId: text('project_id')
            .references(() => finalProjects.id, { onDelete: 'cascade' })
            .notNull(),
        status: text('status').notNull(),
        submittedAt: integer('submitted_at', { mode: 'timestamp' })
            .notNull()
            .default(sql`(unixepoch())`),
    },
    (table) => ({
        userProjectUnique: uniqueIndex('final_project_submission_unique').on(
            table.userId,
            table.projectId,
        ),
    }),
);

export const finalExams = sqliteTable('final_exams', {
    id: text('id').primaryKey(),
    courseId: text('course_id')
        .references(() => courses.id, { onDelete: 'cascade' })
        .notNull()
        .unique(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    timeLimit: integer('time_limit').notNull(),
    passingScore: integer('passing_score').notNull(),
});

export const finalExamResults = sqliteTable(
    'final_exam_results',
    {
        id: text('id').primaryKey(),
        userId: text('user_id').notNull(),
        examId: text('exam_id')
            .references(() => finalExams.id, { onDelete: 'cascade' })
            .notNull(),
        score: integer('score'),
        passed: integer('passed', { mode: 'boolean' }).notNull().default(false),
        submittedAt: integer('submitted_at', { mode: 'timestamp' })
            .notNull()
            .default(sql`(unixepoch())`),
    },
    (table) => ({
        userExamUnique: uniqueIndex('final_exam_results_user_exam_unique').on(
            table.userId,
            table.examId,
        ),
    }),
);

export const enrollments = sqliteTable(
    'enrollments',
    {
        id: text('id').primaryKey(),
        userId: text('user_id').notNull(),
        courseId: text('course_id')
            .references(() => courses.id, { onDelete: 'cascade' })
            .notNull(),
        enrolledAt: integer('enrolled_at', { mode: 'timestamp' })
            .notNull()
            .default(sql`(unixepoch())`),
        completedAt: integer('completed_at', { mode: 'timestamp' }),
        currentLesson: integer('current_lesson').notNull().default(1),
        unlockedCourses: integer('unlocked_courses').notNull().default(1),
    },
    (table) => ({
        userCourseUnique: uniqueIndex('enrollments_user_course_unique').on(
            table.userId,
            table.courseId,
        ),
        userIdx: index('enrollments_user_idx').on(table.userId),
        courseIdx: index('enrollments_course_idx').on(table.courseId),
    }),
);

export const lessonProgress = sqliteTable(
    'lesson_progress',
    {
        id: text('id').primaryKey(),
        userId: text('user_id').notNull(),
        lessonId: text('lesson_id')
            .references(() => lessons.id, { onDelete: 'cascade' })
            .notNull(),
        completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
        completedAt: integer('completed_at', { mode: 'timestamp' }),
        updatedAt: integer('updated_at', { mode: 'timestamp' })
            .notNull()
            .default(sql`(unixepoch())`),
    },
    (table) => ({
        userLessonUnique: uniqueIndex('lesson_progress_user_lesson_unique').on(
            table.userId,
            table.lessonId,
        ),
    }),
);
