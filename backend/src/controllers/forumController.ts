import { Request, Response, NextFunction } from 'express';
import * as forumService from '../services/forumService.js';
import { stripHtmlTags } from '../utils/sanitization.js';

/**
 * GET /api/community/forums
 * Get all forum categories with thread counts
 */
export async function getForumCategories(_req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await forumService.getAllCategories();

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/community/threads
 * Get threads with pagination and filters
 */
export async function getThreads(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      categoryId,
      search,
      authorId,
      isPinned,
      page = '1',
      limit = '20',
    } = req.query;

    const filters: any = {};
    if (categoryId) filters.categoryId = categoryId as string;
    if (search) filters.search = search as string;
    if (authorId) filters.authorId = authorId as string;
    if (isPinned !== undefined) filters.isPinned = isPinned === 'true';

    const pagination = {
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
    };

    const result = await forumService.getThreads(filters, pagination);

    res.json({
      success: true,
      data: {
        threads: result.threads,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / pagination.limit),
        },
      },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /api/community/threads
 * Create a new thread
 */
export async function createThread(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { categoryId, title, content } = req.body;

    // Validation
    if (!categoryId || !title || !content) {
      res.status(400).json({
        success: false,
        error: { message: 'Category ID, title, and content are required' },
      });
      return;
    }

    if (title.length < 5 || title.length > 200) {
      res.status(400).json({
        success: false,
        error: { message: 'Title must be between 5 and 200 characters' },
      });
      return;
    }

    if (content.length < 10) {
      res.status(400).json({
        success: false,
        error: { message: 'Content must be at least 10 characters' },
      });
      return;
    }

    // Strip HTML tags from user-generated content for security
    const sanitizedTitle = stripHtmlTags(title);
    const sanitizedContent = stripHtmlTags(content);

    const thread = await forumService.createThread({
      categoryId,
      authorId: userId,
      title: sanitizedTitle,
      content: sanitizedContent,
    });

    res.status(201).json({
      success: true,
      data: thread,
    });
  } catch (error: any) {
    if (error.message === 'Category not found') {
      res.status(404).json({
        success: false,
        error: { message: 'Forum category not found' },
      });
      return;
    }
    next(error);
  }
}

/**
 * GET /api/community/threads/:id
 * Get thread details with all posts
 */
export async function getThreadById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    const result = await forumService.getThreadById(id);

    if (!result) {
      res.status(404).json({
        success: false,
        error: { message: 'Thread not found' },
      });
      return;
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /api/community/threads/:id/replies
 * Create a reply to a thread
 */
export async function createReply(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { content } = req.body;

    // Validation
    if (!content) {
      res.status(400).json({
        success: false,
        error: { message: 'Content is required' },
      });
      return;
    }

    if (content.length < 10) {
      res.status(400).json({
        success: false,
        error: { message: 'Content must be at least 10 characters' },
      });
      return;
    }

    // Strip HTML tags from user-generated content for security
    const sanitizedContent = stripHtmlTags(content);

    const post = await forumService.createReply({
      threadId: id,
      authorId: userId,
      content: sanitizedContent,
    });

    res.status(201).json({
      success: true,
      data: post,
    });
  } catch (error: any) {
    if (error.message === 'Thread not found') {
      res.status(404).json({
        success: false,
        error: { message: 'Thread not found' },
      });
      return;
    }
    if (error.message === 'Thread is locked') {
      res.status(403).json({
        success: false,
        error: { message: 'This thread is locked and cannot accept new replies' },
      });
      return;
    }
    next(error);
  }
}

/**
 * PUT /api/community/posts/:id
 * Update a post
 */
export async function updatePost(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { content } = req.body;

    // Validation
    if (!content) {
      res.status(400).json({
        success: false,
        error: { message: 'Content is required' },
      });
      return;
    }

    if (content.length < 10) {
      res.status(400).json({
        success: false,
        error: { message: 'Content must be at least 10 characters' },
      });
      return;
    }

    // Strip HTML tags from user-generated content for security
    const sanitizedContent = stripHtmlTags(content);

    const post = await forumService.updatePost(id, userId, sanitizedContent);

    res.json({
      success: true,
      data: post,
    });
  } catch (error: any) {
    if (error.message === 'Post not found') {
      res.status(404).json({
        success: false,
        error: { message: 'Post not found' },
      });
      return;
    }
    if (error.message === 'Not authorized to edit this post') {
      res.status(403).json({
        success: false,
        error: { message: 'You are not authorized to edit this post' },
      });
      return;
    }
    next(error);
  }
}

/**
 * DELETE /api/community/posts/:id
 * Delete a post
 */
export async function deletePost(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    await forumService.deletePost(id, userId);

    res.json({
      success: true,
      data: { message: 'Post deleted successfully' },
    });
  } catch (error: any) {
    if (error.message === 'Post not found') {
      res.status(404).json({
        success: false,
        error: { message: 'Post not found' },
      });
      return;
    }
    if (error.message === 'Not authorized to delete this post') {
      res.status(403).json({
        success: false,
        error: { message: 'You are not authorized to delete this post' },
      });
      return;
    }
    if (error.message.includes('Cannot delete the only post')) {
      res.status(400).json({
        success: false,
        error: { message: error.message },
      });
      return;
    }
    next(error);
  }
}

/**
 * GET /api/community/search
 * Search threads
 */
export async function searchThreads(req: Request, res: Response, next: NextFunction) {
  try {
    const { q, page = '1', limit = '20' } = req.query;

    if (!q || typeof q !== 'string') {
      res.status(400).json({
        success: false,
        error: { message: 'Search query is required' },
      });
      return;
    }

    const pagination = {
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
    };

    const result = await forumService.searchThreads(q, pagination);

    res.json({
      success: true,
      data: {
        threads: result.threads,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / pagination.limit),
        },
      },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/community/users/:userId/reputation
 * Get user's forum reputation
 */
export async function getUserReputation(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.params;

    const reputation = await forumService.getUserReputation(userId);

    res.json({
      success: true,
      data: reputation,
    });
  } catch (error) {
    return next(error);
  }
}

