import { Hono } from 'hono';
import type { Context } from 'hono';
import { and, asc, desc, eq, inArray, lt, sql } from 'drizzle-orm';
import type { AppEnv } from '../types.js';
import { getDb, type Database } from '../db/client.js';
import {
    courses,
    lessons,
    enrollments,
    finalProjects,
    finalProjectSubmissions,
    finalExams,
    finalExamResults,
    lessonProgress,
} from '../db/schema.js';

export const coursesRouter = new Hono<AppEnv>();

coursesRouter.use('*', async (c, next) => {
    const requestId = crypto.randomUUID();
    const headerUserId = c.req.header('x-user-id');
    c.set('requestId', requestId);
    c.set('userId', headerUserId?.trim() || 'demo-user');
    await next();
});

const ensureDatabase = (c: Context<AppEnv>) => {
    if (!c.env.DB) {
        throw new Error('Database binding DB is not configured');
    }
    return getDb(c.env.DB);
};

const calculateCourseProgress = async (
    db: Database,
    userId: string,
    courseId: string,
): Promise<number> => {

    const lessonRows = await db
        .select({ id: lessons.id })
        .from(lessons)
        .where(eq(lessons.courseId, courseId));

    const lessonIds = lessonRows.map((row) => row.id);
    let totalItems = lessonIds.length;
    let completedItems = 0;

    if (lessonIds.length > 0) {
        const completedLessonRows = await db
            .select({ count: sql<number>`count(*)` })
            .from(lessonProgress)
            .where(
                and(
                    eq(lessonProgress.userId, userId),
                    inArray(lessonProgress.lessonId, lessonIds),
                    eq(lessonProgress.completed, true),
                ),
            );

        completedItems += Number(completedLessonRows[0]?.count ?? 0);
    }

    const [project] = await db
        .select({ id: finalProjects.id })
        .from(finalProjects)
        .where(eq(finalProjects.courseId, courseId))
        .limit(1);

    if (project) {
        totalItems += 1;
        const [submission] = await db
            .select({ status: finalProjectSubmissions.status })
            .from(finalProjectSubmissions)
            .where(
                and(
                    eq(finalProjectSubmissions.userId, userId),
                    eq(finalProjectSubmissions.projectId, project.id),
                ),
            )
            .limit(1);

        if (submission?.status === 'approved') {
            completedItems += 1;
        }
    }

    const [exam] = await db
        .select({ id: finalExams.id })
        .from(finalExams)
        .where(eq(finalExams.courseId, courseId))
        .limit(1);

    if (exam) {
        totalItems += 1;
        const [result] = await db
            .select({ passed: finalExamResults.passed })
            .from(finalExamResults)
            .where(
                and(
                    eq(finalExamResults.userId, userId),
                    eq(finalExamResults.examId, exam.id),
                    eq(finalExamResults.passed, true),
                ),
            )
            .limit(1);

        if (result) {
            completedItems += 1;
        }
    }

    if (totalItems === 0) {
        return 0;
    }

    return Math.round((completedItems / totalItems) * 100);
};

const isCourseCompleted = async (
    db: Database,
    userId: string,
    courseId: string,
): Promise<boolean> => {

    const lessonRows = await db
        .select({ id: lessons.id })
        .from(lessons)
        .where(eq(lessons.courseId, courseId));

    const lessonIds = lessonRows.map((row) => row.id);

    if (lessonIds.length > 0) {
        const completedLessonRows = await db
            .select({ count: sql<number>`count(*)` })
            .from(lessonProgress)
            .where(
                and(
                    eq(lessonProgress.userId, userId),
                    inArray(lessonProgress.lessonId, lessonIds),
                    eq(lessonProgress.completed, true),
                ),
            );

        if (Number(completedLessonRows[0]?.count ?? 0) !== lessonIds.length) {
            return false;
        }
    }

    const [project] = await db
        .select({ id: finalProjects.id })
        .from(finalProjects)
        .where(eq(finalProjects.courseId, courseId))
        .limit(1);

    if (project) {
        const [submission] = await db
            .select({ status: finalProjectSubmissions.status })
            .from(finalProjectSubmissions)
            .where(
                and(
                    eq(finalProjectSubmissions.userId, userId),
                    eq(finalProjectSubmissions.projectId, project.id),
                ),
            )
            .limit(1);

        if (submission?.status !== 'approved') {
            return false;
        }
    }

    const [exam] = await db
        .select({ id: finalExams.id })
        .from(finalExams)
        .where(eq(finalExams.courseId, courseId))
        .limit(1);

    if (exam) {
        const [result] = await db
            .select({ passed: finalExamResults.passed })
            .from(finalExamResults)
            .where(
                and(
                    eq(finalExamResults.userId, userId),
                    eq(finalExamResults.examId, exam.id),
                    eq(finalExamResults.passed, true),
                ),
            )
            .limit(1);

        if (!result) {
            return false;
        }
    }

    return true;
};

const getPrerequisiteCourseTitle = async (db: Database, courseNumber: number) => {
    if (courseNumber <= 1) {
        return null;
    }

    const [row] = await db
        .select({ title: courses.title })
        .from(courses)
        .where(eq(courses.courseNumber, courseNumber - 1))
        .limit(1);

    return row?.title ?? null;
};

coursesRouter.get('/', async (c) => {
    const db = ensureDatabase(c);
    const userId = c.var.userId;

    const courseRows = await db
        .select({
            id: courses.id,
            courseNumber: courses.courseNumber,
            title: courses.title,
            description: courses.description,
            thumbnail: courses.thumbnail,
            published: courses.published,
            lessonCount: sql<number>`(select count(*) from lessons where lessons.course_id = ${courses.id})`,
        })
        .from(courses)
        .where(eq(courses.published, true))
        .orderBy(asc(courses.courseNumber));

    const enrollmentRows = await db
        .select({
            id: enrollments.id,
            courseId: enrollments.courseId,
            completedAt: enrollments.completedAt,
            unlockedCourses: enrollments.unlockedCourses,
        })
        .from(enrollments)
        .where(eq(enrollments.userId, userId));

    const highestUnlocked = enrollmentRows.reduce<number>((max, row) => {
        return row.unlockedCourses && row.unlockedCourses > max ? row.unlockedCourses : max;
    }, 1);

    const enrollmentMap = new Map<string, (typeof enrollmentRows)[number]>(
        enrollmentRows.map((row) => [row.courseId, row]),
    );

    const payload = await Promise.all(
        courseRows.map(async (row) => {
            const enrollment = enrollmentMap.get(row.id);
            const isEnrolled = Boolean(enrollment);
            const isCompleted = Boolean(enrollment?.completedAt);
            const isLocked = (row.courseNumber ?? 0) > highestUnlocked;
            const lessonCount = Number(row.lessonCount ?? 0);

            const coursePayload: {
                id: string;
                courseNumber: number;
                title: string;
                description: string;
                thumbnail: string;
                published: boolean;
                isLocked: boolean;
                isEnrolled: boolean;
                isCompleted: boolean;
                progress?: number;
                lessonCount: number;
            } = {
                id: row.id,
                courseNumber: row.courseNumber ?? 0,
                title: row.title,
                description: row.description,
                thumbnail: row.thumbnail,
                published: Boolean(row.published),
                isLocked,
                isEnrolled,
                isCompleted,
                lessonCount,
            };

            if (isEnrolled) {
                coursePayload.progress = await calculateCourseProgress(db, userId, row.id);
            }

            return coursePayload;
        }),
    );

    return c.json({
        success: true,
        data: payload,
    });
});

coursesRouter.get('/:id', async (c) => {
    const db = ensureDatabase(c);
    const userId = c.var.userId;
    const { id } = c.req.param();

    const [courseRow] = await db
        .select({
            id: courses.id,
            courseNumber: courses.courseNumber,
            title: courses.title,
            description: courses.description,
            thumbnail: courses.thumbnail,
            published: courses.published,
        })
        .from(courses)
        .where(eq(courses.id, id))
        .limit(1);

    if (!courseRow) {
        return c.json(
            {
                success: false,
                error: { message: 'Course not found' },
            },
            404,
        );
    }

    const enrollmentRows = await db
        .select({
            courseId: enrollments.courseId,
            completedAt: enrollments.completedAt,
            unlockedCourses: enrollments.unlockedCourses,
        })
        .from(enrollments)
        .where(eq(enrollments.userId, userId));

    const highestUnlocked = enrollmentRows.reduce<number>((max, row) => {
        return row.unlockedCourses && row.unlockedCourses > max ? row.unlockedCourses : max;
    }, 1);

    const enrollment = enrollmentRows.find((row) => row.courseId === courseRow.id);
    const isEnrolled = Boolean(enrollment);
    const isCompleted = Boolean(enrollment?.completedAt);
    const isLocked = (courseRow.courseNumber ?? 0) > highestUnlocked;

    const lessonRows = await db
        .select({
            id: lessons.id,
            lessonNumber: lessons.lessonNumber,
            title: lessons.title,
            description: lessons.description,
            youtubeVideoId: lessons.youtubeVideoId,
            duration: lessons.duration,
        })
        .from(lessons)
        .where(eq(lessons.courseId, courseRow.id))
        .orderBy(asc(lessons.lessonNumber));

    const [projectRow] = await db
        .select({
            id: finalProjects.id,
            title: finalProjects.title,
            description: finalProjects.description,
        })
        .from(finalProjects)
        .where(eq(finalProjects.courseId, courseRow.id))
        .limit(1);

    const [examRow] = await db
        .select({
            id: finalExams.id,
            title: finalExams.title,
            description: finalExams.description,
            timeLimit: finalExams.timeLimit,
            passingScore: finalExams.passingScore,
        })
        .from(finalExams)
        .where(eq(finalExams.courseId, courseRow.id))
        .limit(1);

    const coursePayload: {
        id: string;
        courseNumber: number;
        title: string;
        description: string;
        thumbnail: string;
        published: boolean;
        isLocked: boolean;
        isEnrolled: boolean;
        isCompleted: boolean;
        progress?: number;
        lessonCount: number;
        lessons: Array<{
            id: string;
            lessonNumber: number;
            title: string;
            description: string;
            youtubeVideoId: string;
            duration: number;
        }>;
        finalProject: { id: string; title: string; description: string } | null;
        finalExam:
        | { id: string; title: string; description: string; timeLimit: number; passingScore: number }
        | null;
    } = {
        id: courseRow.id,
        courseNumber: courseRow.courseNumber ?? 0,
        title: courseRow.title,
        description: courseRow.description,
        thumbnail: courseRow.thumbnail,
        published: Boolean(courseRow.published),
        isLocked,
        isEnrolled,
        isCompleted,
        lessonCount: lessonRows.length,
        lessons: lessonRows.map((lesson) => ({
            id: lesson.id,
            lessonNumber: lesson.lessonNumber ?? 0,
            title: lesson.title,
            description: lesson.description,
            youtubeVideoId: lesson.youtubeVideoId,
            duration: lesson.duration ?? 0,
        })),
        finalProject: projectRow
            ? {
                id: projectRow.id,
                title: projectRow.title,
                description: projectRow.description,
            }
            : null,
        finalExam: examRow
            ? {
                id: examRow.id,
                title: examRow.title,
                description: examRow.description,
                timeLimit: examRow.timeLimit ?? 0,
                passingScore: examRow.passingScore ?? 0,
            }
            : null,
    };

    if (isEnrolled) {
        coursePayload.progress = await calculateCourseProgress(db, userId, courseRow.id);
    }

    return c.json({
        success: true,
        data: coursePayload,
    });
});

coursesRouter.get('/:id/can-access', async (c) => {
    const db = ensureDatabase(c);
    const userId = c.var.userId;
    const { id } = c.req.param();

    const [courseRow] = await db
        .select({
            id: courses.id,
            courseNumber: courses.courseNumber,
        })
        .from(courses)
        .where(eq(courses.id, id))
        .limit(1);

    if (!courseRow) {
        return c.json(
            {
                success: false,
                error: { message: 'Course not found' },
            },
            404,
        );
    }

    const rows = await db
        .select({ unlockedCourses: enrollments.unlockedCourses })
        .from(enrollments)
        .where(eq(enrollments.userId, userId))
        .orderBy(desc(enrollments.unlockedCourses))
        .limit(1);

    const highestUnlocked = rows[0]?.unlockedCourses ?? 1;
    const canAccess = (courseRow.courseNumber ?? 0) <= highestUnlocked;

    if (!canAccess) {
        const prerequisite = await getPrerequisiteCourseTitle(db, courseRow.courseNumber ?? 0);
        return c.json({
            success: true,
            data: {
                canAccess: false,
                message: prerequisite
                    ? `You must complete "${prerequisite}" before accessing this course`
                    : 'You do not have access to this course',
            },
        });
    }

    return c.json({
        success: true,
        data: {
            canAccess: true,
            message: 'You have access to this course',
        },
    });
});

coursesRouter.post('/:id/enroll', async (c) => {
    const db = ensureDatabase(c);
    const userId = c.var.userId;
    const { id } = c.req.param();

    const [courseRow] = await db
        .select({
            id: courses.id,
            courseNumber: courses.courseNumber,
            published: courses.published,
        })
        .from(courses)
        .where(eq(courses.id, id))
        .limit(1);

    if (!courseRow) {
        return c.json(
            {
                success: false,
                error: { message: 'Course not found' },
            },
            404,
        );
    }

    if (!courseRow.published) {
        return c.json(
            {
                success: false,
                error: { message: 'Course is not available for enrollment' },
            },
            400,
        );
    }

    const [existingEnrollment] = await db
        .select({ id: enrollments.id })
        .from(enrollments)
        .where(and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseRow.id)))
        .limit(1);

    if (existingEnrollment) {
        return c.json(
            {
                success: false,
                error: { message: 'You are already enrolled in this course' },
            },
            409,
        );
    }

    const rows = await db
        .select({ unlockedCourses: enrollments.unlockedCourses })
        .from(enrollments)
        .where(eq(enrollments.userId, userId))
        .orderBy(desc(enrollments.unlockedCourses))
        .limit(1);

    const highestUnlocked = rows[0]?.unlockedCourses ?? 1;

    if ((courseRow.courseNumber ?? 0) > highestUnlocked) {
        return c.json(
            {
                success: false,
                error: { message: 'You must complete the previous course before enrolling in this one' },
            },
            403,
        );
    }

    await db.insert(enrollments).values({
        id: crypto.randomUUID(),
        userId,
        courseId: courseRow.id,
        currentLesson: 1,
        unlockedCourses: highestUnlocked,
    });

    return c.json(
        {
            success: true,
            data: {
                message: 'Successfully enrolled in course',
            },
        },
        201,
    );
});

coursesRouter.post('/:id/unlock-next', async (c) => {
    const db = ensureDatabase(c);
    const userId = c.var.userId;
    const { id } = c.req.param();

    const [courseRow] = await db
        .select({
            id: courses.id,
            courseNumber: courses.courseNumber,
        })
        .from(courses)
        .where(eq(courses.id, id))
        .limit(1);

    if (!courseRow) {
        return c.json(
            {
                success: false,
                error: { message: 'Course not found' },
            },
            404,
        );
    }

    const [enrollment] = await db
        .select({ id: enrollments.id })
        .from(enrollments)
        .where(and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseRow.id)))
        .limit(1);

    if (!enrollment) {
        return c.json(
            {
                success: false,
                error: { message: 'You are not enrolled in this course' },
            },
            404,
        );
    }

    const completed = await isCourseCompleted(db, userId, courseRow.id);
    if (!completed) {
        return c.json(
            {
                success: false,
                error: {
                    message:
                        'You must complete all lessons, final project, and final exam before unlocking the next course',
                },
            },
            400,
        );
    }

    const nextCourseNumber = (courseRow.courseNumber ?? 0) + 1;

    await db
        .update(enrollments)
        .set({ completedAt: new Date(), unlockedCourses: nextCourseNumber })
        .where(and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseRow.id)));

    await db
        .update(enrollments)
        .set({ unlockedCourses: nextCourseNumber })
        .where(
            and(
                eq(enrollments.userId, userId),
                lt(enrollments.unlockedCourses, nextCourseNumber),
            ),
        );

    return c.json({
        success: true,
        data: {
            message: 'Next course unlocked successfully',
        },
    });
});
