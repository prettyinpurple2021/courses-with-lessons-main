
import { Request, Response } from 'express';
import prisma from '../config/prisma.js';

// Define interface for recent lesson structure
interface DashboardRecentLesson {
    id: number;
    lessonId?: string | null;
    lessonTitle: string;
    courseId?: string | null;
    courseTitle: string;
    thumbnailUrl?: string | null;
    progress: number;
    completedAt: string;
}

export const dashboardController = {
    getRecentLessons: async (req: Request, res: Response) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    status: 'error',
                    message: 'User not authenticated',
                });
            }

            // Cast req.user to any to access custom properties if type definition is outdated
            const userId = (req.user as any).userId || (req.user as any).id;

            // Fetch recent lesson progress
            const recentProgress = await prisma.lessonProgress.findMany({
                where: { userId },
                take: 5,
                orderBy: { updatedAt: 'desc' },
                include: {
                    lesson: {
                        select: {
                            id: true,
                            title: true,
                            lessonNumber: true,
                            courseId: true,
                            course: {
                                select: {
                                    id: true,
                                    title: true,
                                    thumbnail: true,
                                },
                            },
                        },
                    },
                },
            });

            const recentLessons: DashboardRecentLesson[] = recentProgress.map((progress) => ({
                id: progress.lesson.lessonNumber,
                lessonId: progress.lessonId,
                lessonTitle: progress.lesson.title,
                courseId: progress.lesson.courseId,
                courseTitle: progress.lesson.course ? progress.lesson.course.title : 'Unknown Course',
                thumbnailUrl: progress.lesson.course ? progress.lesson.course.thumbnail : null,
                progress: progress.completed ? 100 : Math.round((progress.videoPosition / 100) * 100) || 0,
                completedAt: progress.updatedAt.toISOString(),
            }));

            return res.json({
                status: 'success',
                data: recentLessons,
            });
        } catch (error) {
            console.error('Get recent lessons error:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Failed to fetch recent lessons',
            });
        }
    },

    getAchievements: async (req: Request, res: Response) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    status: 'error',
                    message: 'User not authenticated',
                });
            }

            const userId = (req.user as any).userId || (req.user as any).id;

            const achievements = await prisma.achievement.findMany({
                where: { userId },
                orderBy: { unlockedAt: 'desc' },
                take: 5,
                select: {
                    id: true,
                    title: true,
                    description: true,
                    icon: true,
                    unlockedAt: true,
                },
            });

            return res.json({
                status: 'success',
                data: achievements,
            });
        } catch (error) {
            console.error('Get achievements error:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Failed to fetch achievements',
            });
        }
    },
};
