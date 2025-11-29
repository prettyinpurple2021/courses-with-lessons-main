import { api } from './api';
import {
  ForumCategory,
  ForumThread,
  ThreadWithPosts,
  PaginatedThreads,
  ThreadFilters,
  UserReputation,
  ForumPost,
  PaginatedMembers,
  MemberProfile,
  Event,
} from '../types/forum';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    message: string;
  };
}

/**
 * Get all forum categories
 */
export async function getForumCategories(): Promise<ForumCategory[]> {
  const response = await api.get<ApiResponse<ForumCategory[]>>('/community/forums');
  return response.data.data;
}

/**
 * Get threads with pagination and filters
 */
export async function getThreads(
  filters: ThreadFilters = {},
  page: number = 1,
  limit: number = 20
): Promise<PaginatedThreads> {
  const params = new URLSearchParams();
  if (filters.categoryId) params.append('categoryId', filters.categoryId);
  if (filters.search) params.append('search', filters.search);
  if (filters.authorId) params.append('authorId', filters.authorId);
  if (filters.isPinned !== undefined) params.append('isPinned', String(filters.isPinned));
  params.append('page', String(page));
  params.append('limit', String(limit));

  const response = await api.get<ApiResponse<PaginatedThreads>>(
    `/community/threads?${params.toString()}`
  );
  return response.data.data;
}

/**
 * Create a new thread
 */
export async function createThread(data: {
  categoryId: string;
  title: string;
  content: string;
}): Promise<ForumThread> {
  const response = await api.post<ApiResponse<ForumThread>>('/community/threads', data);
  return response.data.data;
}

/**
 * Get thread details with all posts
 */
export async function getThreadById(threadId: string): Promise<ThreadWithPosts> {
  const response = await api.get<ApiResponse<ThreadWithPosts>>(`/community/threads/${threadId}`);
  return response.data.data;
}

/**
 * Create a reply to a thread
 */
export async function createReply(threadId: string, content: string): Promise<ForumPost> {
  const response = await api.post<ApiResponse<ForumPost>>(
    `/community/threads/${threadId}/replies`,
    { content }
  );
  return response.data.data;
}

/**
 * Update a post
 */
export async function updatePost(postId: string, content: string): Promise<ForumPost> {
  const response = await api.put<ApiResponse<ForumPost>>(`/community/posts/${postId}`, {
    content,
  });
  return response.data.data;
}

/**
 * Delete a post
 */
export async function deletePost(postId: string): Promise<void> {
  await api.delete(`/community/posts/${postId}`);
}

/**
 * Search threads
 */
export async function searchThreads(
  query: string,
  page: number = 1,
  limit: number = 20
): Promise<PaginatedThreads> {
  const params = new URLSearchParams();
  params.append('q', query);
  params.append('page', String(page));
  params.append('limit', String(limit));

  const response = await api.get<ApiResponse<PaginatedThreads>>(
    `/community/search?${params.toString()}`
  );
  return response.data.data;
}

/**
 * Get user's forum reputation
 */
export async function getUserReputation(userId: string): Promise<UserReputation> {
  const response = await api.get<ApiResponse<UserReputation>>(
    `/community/users/${userId}/reputation`
  );
  return response.data.data;
}

/**
 * Get all members with pagination and search
 */
export async function getMembers(
  search: string = '',
  page: number = 1,
  limit: number = 20
): Promise<PaginatedMembers> {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  params.append('page', String(page));
  params.append('limit', String(limit));

  const response = await api.get<ApiResponse<PaginatedMembers>>(
    `/community/members?${params.toString()}`
  );
  return response.data.data;
}

/**
 * Get member profile by ID
 */
export async function getMemberById(memberId: string): Promise<MemberProfile> {
  const response = await api.get<ApiResponse<MemberProfile>>(`/community/members/${memberId}`);
  return response.data.data;
}

/**
 * Get all upcoming events
 */
export async function getEvents(filters: { type?: string } = {}): Promise<Event[]> {
  const params = new URLSearchParams();
  if (filters.type) params.append('type', filters.type);

  const response = await api.get<ApiResponse<Event[]>>(
    `/community/events${params.toString() ? `?${params.toString()}` : ''}`
  );
  return response.data.data;
}

/**
 * Get event by ID
 */
export async function getEventById(eventId: string): Promise<Event> {
  const response = await api.get<ApiResponse<Event>>(`/community/events/${eventId}`);
  return response.data.data;
}

/**
 * Register for an event
 */
export async function registerForEvent(eventId: string): Promise<void> {
  await api.post(`/community/events/${eventId}/register`);
}

/**
 * Unregister from an event
 */
export async function unregisterFromEvent(eventId: string): Promise<void> {
  await api.delete(`/community/events/${eventId}/register`);
}

/**
 * Get user's registered events
 */
export async function getUserEvents(): Promise<Event[]> {
  const response = await api.get<ApiResponse<Event[]>>('/community/events/my/registrations');
  return response.data.data;
}
