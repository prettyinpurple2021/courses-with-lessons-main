import { Hono } from 'hono';
import type { Context } from 'hono';
import { and, desc, eq } from 'drizzle-orm';
import type { AppEnv } from '../types.js';
import { getDb } from '../db/client.js';
import { achievements, recentLessons, userAchievements } from '../db/schema.js';

export const dashboardRouter = new Hono<AppEnv>();

// Attach request-scoped context
dashboardRouter.use('*', async (c, next) => {
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

dashboardRouter.get('/achievements', async (c) => {
    const db = ensureDatabase(c);
    const userId = c.var.userId;

    const rows = await db
        .select({
            id: achievements.id,
            title: achievements.title,
            description: achievements.description,
            icon: achievements.icon,
            rarity: achievements.rarity,
            unlockedAt: userAchievements.unlockedAt,
        })
        .from(achievements)
        .leftJoin(
            userAchievements,
            and(eq(userAchievements.achievementId, achievements.id), eq(userAchievements.userId, userId)),
        )
        .orderBy(achievements.createdAt);

    const achievementsData = rows.map((row) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        icon: row.icon,
        rarity: row.rarity,
        unlocked: !!row.unlockedAt,
        unlockedAt: row.unlockedAt ? row.unlockedAt.toISOString() : null,
    }));

    return c.json({
        status: 'ok',
        data: achievementsData,
    });
});

dashboardRouter.get('/recent-lessons', async (c) => {
    const db = ensureDatabase(c);
    const userId = c.var.userId;

    const rows = await db
        .select({
            id: recentLessons.id,
            lessonId: recentLessons.lessonId,
            lessonTitle: recentLessons.lessonTitle,
            courseId: recentLessons.courseId,
            courseTitle: recentLessons.courseTitle,
            thumbnailUrl: recentLessons.thumbnailUrl,
            progress: recentLessons.progress,
            completedAt: recentLessons.completedAt,
        })
        .from(recentLessons)
        .where(eq(recentLessons.userId, userId))
        .orderBy(desc(recentLessons.completedAt))
        .limit(6);

    const lessons = rows.map((row) => ({
        id: row.id,
        lessonId: row.lessonId,
        lessonTitle: row.lessonTitle,
        courseId: row.courseId,
        courseTitle: row.courseTitle,
        thumbnailUrl: row.thumbnailUrl,
        progress: row.progress ?? 0,
        completedAt: row.completedAt.toISOString(),
    }));

    return c.json({
        status: 'ok',
        data: lessons,
    });
});
