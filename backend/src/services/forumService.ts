import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ForumCategoryWithThreadCount {
  id: string;
  name: string;
  description: string;
  order: number;
  threadCount: number;
}

export interface ForumThreadWithDetails {
  id: string;
  categoryId: string;
  authorId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  isPinned: boolean;
  isLocked: boolean;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
  postCount: number;
  lastPost?: {
    createdAt: Date;
    author: {
      firstName: string;
      lastName: string;
    };
  };
}

export interface ForumPostWithAuthor {
  id: string;
  threadId: string;
  authorId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
    achievements: Array<{
      title: string;
      icon: string;
      rarity: string;
    }>;
  };
}

export interface ThreadFilters {
  categoryId?: string;
  search?: string;
  authorId?: string;
  isPinned?: boolean;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

/**
 * Get all forum categories with thread counts
 */
export async function getAllCategories(): Promise<ForumCategoryWithThreadCount[]> {
  const categories = await prisma.forumCategory.findMany({
    orderBy: { order: 'asc' },
    include: {
      _count: {
        select: { threads: true },
      },
    },
  });

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    description: category.description,
    order: category.order,
    threadCount: category._count.threads,
  }));
}

/**
 * Get category by ID
 */
export async function getCategoryById(categoryId: string) {
  return await prisma.forumCategory.findUnique({
    where: { id: categoryId },
  });
}

/**
 * Create a new forum category
 */
export async function createCategory(data: {
  name: string;
  description: string;
  order: number;
}) {
  return await prisma.forumCategory.create({
    data,
  });
}

/**
 * Get threads with pagination and filters
 */
export async function getThreads(
  filters: ThreadFilters,
  pagination: PaginationOptions
): Promise<{ threads: ForumThreadWithDetails[]; total: number }> {
  const { page, limit } = pagination;
  const skip = (page - 1) * limit;

  // Build where clause
  const where: import('@prisma/client').Prisma.ForumThreadWhereInput = {};

  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }

  if (filters.authorId) {
    where.authorId = filters.authorId;
  }

  if (filters.isPinned !== undefined) {
    where.isPinned = filters.isPinned;
  }

  if (filters.search) {
    where.title = {
      contains: filters.search,
      mode: 'insensitive',
    };
  }

  // Get total count
  const total = await prisma.forumThread.count({ where });

  // Get threads with details
  const threads = await prisma.forumThread.findMany({
    where,
    skip,
    take: limit,
    orderBy: [
      { isPinned: 'desc' }, // Pinned threads first
      { updatedAt: 'desc' }, // Then by most recent activity
    ],
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
        },
      },
      _count: {
        select: { posts: true },
      },
      posts: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: {
          createdAt: true,
          author: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });

  const threadsWithDetails: ForumThreadWithDetails[] = threads.map((thread) => ({
    id: thread.id,
    categoryId: thread.categoryId,
    authorId: thread.authorId,
    title: thread.title,
    createdAt: thread.createdAt,
    updatedAt: thread.updatedAt,
    isPinned: thread.isPinned,
    isLocked: thread.isLocked,
    author: thread.author,
    postCount: thread._count.posts,
    lastPost: thread.posts[0] || undefined,
  }));

  return { threads: threadsWithDetails, total };
}

/**
 * Get thread by ID with all posts
 */
export async function getThreadById(threadId: string): Promise<{
  thread: ForumThreadWithDetails;
  posts: ForumPostWithAuthor[];
} | null> {
  const thread = await prisma.forumThread.findUnique({
    where: { id: threadId },
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
        },
      },
      _count: {
        select: { posts: true },
      },
      posts: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: {
          createdAt: true,
          author: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });

  if (!thread) {
    return null;
  }

  // Get all posts for this thread
  const posts = await prisma.forumPost.findMany({
    where: { threadId },
    orderBy: { createdAt: 'asc' },
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
          achievements: {
            select: {
              title: true,
              icon: true,
              rarity: true,
            },
            orderBy: { unlockedAt: 'desc' },
            take: 3, // Show top 3 achievements
          },
        },
      },
    },
  });

  const threadWithDetails: ForumThreadWithDetails = {
    id: thread.id,
    categoryId: thread.categoryId,
    authorId: thread.authorId,
    title: thread.title,
    createdAt: thread.createdAt,
    updatedAt: thread.updatedAt,
    isPinned: thread.isPinned,
    isLocked: thread.isLocked,
    author: thread.author,
    postCount: thread._count.posts,
    lastPost: thread.posts[0] || undefined,
  };

  return { thread: threadWithDetails, posts };
}

/**
 * Create a new thread
 */
export async function createThread(data: {
  categoryId: string;
  authorId: string;
  title: string;
  content: string;
}): Promise<ForumThreadWithDetails> {
  // Verify category exists
  const category = await prisma.forumCategory.findUnique({
    where: { id: data.categoryId },
  });

  if (!category) {
    throw new Error('Category not found');
  }

  // Create thread and initial post in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create the thread
    const thread = await tx.forumThread.create({
      data: {
        categoryId: data.categoryId,
        authorId: data.authorId,
        title: data.title,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    // Create the initial post
    await tx.forumPost.create({
      data: {
        threadId: thread.id,
        authorId: data.authorId,
        content: data.content,
      },
    });

    return thread;
  });

  return {
    id: result.id,
    categoryId: result.categoryId,
    authorId: result.authorId,
    title: result.title,
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
    isPinned: result.isPinned,
    isLocked: result.isLocked,
    author: result.author,
    postCount: 1,
  };
}

/**
 * Create a reply to a thread
 */
export async function createReply(data: {
  threadId: string;
  authorId: string;
  content: string;
}): Promise<ForumPostWithAuthor> {
  // Verify thread exists and is not locked
  const thread = await prisma.forumThread.findUnique({
    where: { id: data.threadId },
  });

  if (!thread) {
    throw new Error('Thread not found');
  }

  if (thread.isLocked) {
    throw new Error('Thread is locked');
  }

  // Create the post and update thread's updatedAt
  const result = await prisma.$transaction(async (tx) => {
    // Create the post
    const post = await tx.forumPost.create({
      data: {
        threadId: data.threadId,
        authorId: data.authorId,
        content: data.content,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            achievements: {
              select: {
                title: true,
                icon: true,
                rarity: true,
              },
              orderBy: { unlockedAt: 'desc' },
              take: 3,
            },
          },
        },
      },
    });

    // Update thread's updatedAt timestamp
    await tx.forumThread.update({
      where: { id: data.threadId },
      data: { updatedAt: new Date() },
    });

    return post;
  });

  return result;
}

/**
 * Update a post
 */
export async function updatePost(
  postId: string,
  authorId: string,
  content: string
): Promise<ForumPostWithAuthor> {
  // Verify post exists and belongs to author
  const existingPost = await prisma.forumPost.findUnique({
    where: { id: postId },
  });

  if (!existingPost) {
    throw new Error('Post not found');
  }

  if (existingPost.authorId !== authorId) {
    throw new Error('Not authorized to edit this post');
  }

  // Update the post
  const post = await prisma.forumPost.update({
    where: { id: postId },
    data: { content, updatedAt: new Date() },
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
          achievements: {
            select: {
              title: true,
              icon: true,
              rarity: true,
            },
            orderBy: { unlockedAt: 'desc' },
            take: 3,
          },
        },
      },
    },
  });

  return post;
}

/**
 * Delete a post
 */
export async function deletePost(postId: string, authorId: string): Promise<void> {
  // Verify post exists and belongs to author
  const existingPost = await prisma.forumPost.findUnique({
    where: { id: postId },
    include: {
      thread: {
        select: {
          _count: {
            select: { posts: true },
          },
        },
      },
    },
  });

  if (!existingPost) {
    throw new Error('Post not found');
  }

  if (existingPost.authorId !== authorId) {
    throw new Error('Not authorized to delete this post');
  }

  // Don't allow deleting the only post in a thread (the initial post)
  if (existingPost.thread._count.posts === 1) {
    throw new Error('Cannot delete the only post in a thread. Delete the thread instead.');
  }

  await prisma.forumPost.delete({
    where: { id: postId },
  });
}

/**
 * Search threads by title or content
 */
export async function searchThreads(
  query: string,
  pagination: PaginationOptions
): Promise<{ threads: ForumThreadWithDetails[]; total: number }> {
  const { page, limit } = pagination;
  const skip = (page - 1) * limit;

  // Search in thread titles and post content
  const threads = await prisma.forumThread.findMany({
    where: {
      OR: [
        {
          title: {
            contains: query,
            mode: 'insensitive',
          },
        },
        {
          posts: {
            some: {
              content: {
                contains: query,
                mode: 'insensitive',
              },
            },
          },
        },
      ],
    },
    skip,
    take: limit,
    orderBy: { updatedAt: 'desc' },
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
        },
      },
      _count: {
        select: { posts: true },
      },
      posts: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: {
          createdAt: true,
          author: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });

  const total = await prisma.forumThread.count({
    where: {
      OR: [
        {
          title: {
            contains: query,
            mode: 'insensitive',
          },
        },
        {
          posts: {
            some: {
              content: {
                contains: query,
                mode: 'insensitive',
              },
            },
          },
        },
      ],
    },
  });

  const threadsWithDetails: ForumThreadWithDetails[] = threads.map((thread) => ({
    id: thread.id,
    categoryId: thread.categoryId,
    authorId: thread.authorId,
    title: thread.title,
    createdAt: thread.createdAt,
    updatedAt: thread.updatedAt,
    isPinned: thread.isPinned,
    isLocked: thread.isLocked,
    author: thread.author,
    postCount: thread._count.posts,
    lastPost: thread.posts[0] || undefined,
  }));

  return { threads: threadsWithDetails, total };
}

/**
 * Get user's reputation score based on forum activity
 */
export async function getUserReputation(userId: string): Promise<{
  postCount: number;
  threadCount: number;
  reputationScore: number;
}> {
  const [postCount, threadCount] = await Promise.all([
    prisma.forumPost.count({
      where: { authorId: userId },
    }),
    prisma.forumThread.count({
      where: { authorId: userId },
    }),
  ]);

  // Calculate reputation score
  // Threads are worth more than posts
  const reputationScore = threadCount * 10 + postCount * 2;

  return {
    postCount,
    threadCount,
    reputationScore,
  };
}

/**
 * Pin or unpin a thread (admin function)
 */
export async function toggleThreadPin(threadId: string): Promise<void> {
  const thread = await prisma.forumThread.findUnique({
    where: { id: threadId },
  });

  if (!thread) {
    throw new Error('Thread not found');
  }

  await prisma.forumThread.update({
    where: { id: threadId },
    data: { isPinned: !thread.isPinned },
  });
}

/**
 * Lock or unlock a thread (admin function)
 */
export async function toggleThreadLock(threadId: string): Promise<void> {
  const thread = await prisma.forumThread.findUnique({
    where: { id: threadId },
  });

  if (!thread) {
    throw new Error('Thread not found');
  }

  await prisma.forumThread.update({
    where: { id: threadId },
    data: { isLocked: !thread.isLocked },
  });
}
