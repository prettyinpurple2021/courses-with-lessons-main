export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  unlockedAt: string | null;
}

export interface RecentLesson {
  id: number;
  lessonId?: string | null;
  lessonTitle: string;
  courseTitle: string;
  courseId?: string | null;
  thumbnailUrl?: string | null;
  progress: number;
  completedAt: string;
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: () => void;
}

export type DashboardTab = 'overview' | 'courses' | 'achievements' | 'community';
