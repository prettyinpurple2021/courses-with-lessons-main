import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface MemberProfile {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  bio: string | null;
  createdAt: Date;
  achievementCount: number;
  courseCount: number;
  reputationScore: number;
  achievements: Array<{
    title: string;
    icon: string;
    rarity: string;
    unlockedAt: Date;
  }>;
}

export interface MemberFilters {
  search?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

/**
 * Get all members with pagination and filters
 */
export async function getMembers(
  filters: MemberFilters,
  pagination: PaginationOptions
): Promise<{ members: MemberProfile[]; total: number }> {
  const { page, limit } = pagination;
  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = {};

  if (filters.search) {
    where.OR = [
      {
        firstName: {
          contains: filters.search,
          mode: 'insensitive',
        },
      },
      {
        lastName: {
          contains: filters.search,
          mode: 'insensitive',
        },
      },
    ];
  }

  // Get total count
  const total = await prisma.user.count({ where });

  // Get users with details
  const users = await prisma.user.findMany({
    where,
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      avatar: true,
      bio: true,
      createdAt: true,
      achievements: {
        select: {
          title: true,
          icon: true,
          rarity: true,
          unlockedAt: true,
        },
        orderBy: { unlockedAt: 'desc' },
      },
      enrollments: {
        where: {
          completedAt: { not: null },
        },
        select: {
          id: true,
        },
      },
      forumPosts: {
        select: {
          id: true,
        },
      },
    },
  });

  // Calculate reputation for each user
  const members: MemberProfile[] = users.map((user: any) => {
    const postCount = user.forumPosts.length;
    const threadCount = 0; // We'll need to count threads separately if needed
    const reputationScore = threadCount * 10 + postCount * 2;

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      bio: user.bio,
      createdAt: user.createdAt,
      achievementCount: user.achievements.length,
      courseCount: user.enrollments.length,
      reputationScore,
      achievements: user.achievements.slice(0, 3), // Top 3 achievements
    };
  });

  return { members, total };
}

/**
 * Get member profile by ID
 */
export async function getMemberById(userId: string): Promise<MemberProfile | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      avatar: true,
      bio: true,
      createdAt: true,
      achievements: {
        select: {
          title: true,
          icon: true,
          rarity: true,
          unlockedAt: true,
        },
        orderBy: { unlockedAt: 'desc' },
      },
      enrollments: {
        where: {
          completedAt: { not: null },
        },
        select: {
          id: true,
        },
      },
      forumPosts: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  const postCount = user.forumPosts.length;
  const threadCount = 0;
  const reputationScore = threadCount * 10 + postCount * 2;

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    avatar: user.avatar,
    bio: user.bio,
    createdAt: user.createdAt,
    achievementCount: user.achievements.length,
    courseCount: user.enrollments.length,
    reputationScore,
    achievements: user.achievements,
  };
}
