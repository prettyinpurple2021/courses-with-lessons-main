export interface ForumCategory {
  id: string;
  name: string;
  description: string;
  order: number;
  threadCount: number;
}

export interface ForumThread {
  id: string;
  categoryId: string;
  authorId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
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
    createdAt: string;
    author: {
      firstName: string;
      lastName: string;
    };
  };
}

export interface ForumPost {
  id: string;
  threadId: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
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

export interface ThreadWithPosts {
  thread: ForumThread;
  posts: ForumPost[];
}

export interface ThreadFilters {
  categoryId?: string;
  search?: string;
  authorId?: string;
  isPinned?: boolean;
}

export interface PaginatedThreads {
  threads: ForumThread[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UserReputation {
  postCount: number;
  threadCount: number;
  reputationScore: number;
}

export interface MemberProfile {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  bio: string | null;
  createdAt: string;
  achievementCount: number;
  courseCount: number;
  reputationScore: number;
  achievements: Array<{
    title: string;
    icon: string;
    rarity: string;
    unlockedAt: string;
  }>;
}

export interface PaginatedMembers {
  members: MemberProfile[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface Event {
  id: string;
  title: string;
  description: string;
  type: string;
  startTime: string;
  endTime: string;
  location: string | null;
  maxAttendees: number | null;
  registrationCount: number;
  isRegistered: boolean;
  isFull: boolean;
}
