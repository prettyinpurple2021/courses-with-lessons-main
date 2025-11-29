export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  bio?: string;
  emailNotifications: boolean;
  courseUpdates: boolean;
  communityDigest: boolean;
  achievementAlerts: boolean;
  createdAt: string;
}

export interface UserStatistics {
  coursesCompleted: number;
  lessonsViewed: number;
  activitiesCompleted: number;
  averageScore: number;
  totalStudyTime: number; // in minutes
  currentStreak: number; // days
  longestStreak: number; // days
}

export interface CourseProgressSummary {
  courseId: string;
  courseNumber: number;
  courseTitle: string;
  thumbnail: string;
  progress: number; // 0-100
  lessonsCompleted: number;
  totalLessons: number;
  status: 'not_started' | 'in_progress' | 'completed';
  enrolledAt: string;
  completedAt?: string;
}

export interface ProfileAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt: string;
}

export interface ProfileData {
  user: UserProfile;
  statistics: UserStatistics;
  courseProgress: CourseProgressSummary[];
  achievements: ProfileAchievement[];
}
