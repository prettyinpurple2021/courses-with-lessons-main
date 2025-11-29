import { api } from './api';
import type { Achievement, RecentLesson } from '../types/dashboard';

export interface DashboardAchievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    unlocked: boolean;
    unlockedAt: string | null;
}

export interface DashboardRecentLesson {
    id: number;
    lessonId?: string | null;
    lessonTitle: string;
    courseId?: string | null;
    courseTitle: string;
    thumbnailUrl?: string | null;
    progress: number;
    completedAt: string;
}

const defaultHeaders = { 'X-User-Id': 'demo-user' } as const;

export async function fetchAchievements() {
    const response = await api.get<{ status: string; data: DashboardAchievement[] }>('/dashboard/achievements', {
        headers: defaultHeaders,
    });
    return response.data.data.map<Achievement>((achievement) => ({
        ...achievement,
    }));
}

export async function fetchRecentLessons() {
    const response = await api.get<{ status: string; data: DashboardRecentLesson[] }>('/dashboard/recent-lessons', {
        headers: defaultHeaders,
    });
    return response.data.data.map<RecentLesson>((lesson) => ({
        id: lesson.id,
        lessonId: lesson.lessonId,
        lessonTitle: lesson.lessonTitle,
        courseId: lesson.courseId,
        courseTitle: lesson.courseTitle,
        thumbnailUrl: lesson.thumbnailUrl,
        progress: lesson.progress,
        completedAt: lesson.completedAt,
    }));
}
