import { Request, Response, NextFunction } from 'express';
import * as noteService from '../services/noteService.js';
import * as lessonService from '../services/lessonService.js';
import { stripHtmlTags } from '../utils/sanitization.js';

/**
 * GET /api/lessons/:id/notes
 * Get all notes for a lesson
 */
export async function getNotesByLesson(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: lessonId } = req.params;
    const userId = req.user!.userId;

    // Verify user has access to this lesson
    const hasAccess = await lessonService.canAccessLesson(userId, lessonId);
    if (!hasAccess) {
      res.status(403).json({
        success: false,
        error: { message: 'You do not have access to this lesson' },
      });
      return;
    }

    const notes = await noteService.getNotesByLesson(userId, lessonId);

    res.json({
      success: true,
      data: notes,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /api/lessons/:id/notes
 * Create a new note for a lesson
 */
export async function createNote(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: lessonId } = req.params;
    const { content, timestamp } = req.body;
    const userId = req.user!.userId;

    // Validate input
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: { message: 'Note content is required' },
      });
      return;
    }

    if (timestamp !== undefined && (typeof timestamp !== 'number' || timestamp < 0)) {
      res.status(400).json({
        success: false,
        error: { message: 'Invalid timestamp' },
      });
      return;
    }

    // Verify user has access to this lesson
    const hasAccess = await lessonService.canAccessLesson(userId, lessonId);
    if (!hasAccess) {
      res.status(403).json({
        success: false,
        error: { message: 'You do not have access to this lesson' },
      });
      return;
    }

    // Strip HTML tags from note content for security
    const sanitizedContent = stripHtmlTags(content.trim());

    const note = await noteService.createNote(userId, lessonId, {
      content: sanitizedContent,
      timestamp,
    });

    res.status(201).json({
      success: true,
      data: note,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * PUT /api/lessons/:lessonId/notes/:noteId
 * Update an existing note
 */
export async function updateNote(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { noteId } = req.params;
    const { content, timestamp } = req.body;
    const userId = req.user!.userId;

    // Validate input
    if (content !== undefined && (typeof content !== 'string' || content.trim().length === 0)) {
      res.status(400).json({
        success: false,
        error: { message: 'Note content cannot be empty' },
      });
      return;
    }

    if (timestamp !== undefined && typeof timestamp !== 'number') {
      res.status(400).json({
        success: false,
        error: { message: 'Invalid timestamp' },
      });
      return;
    }

    // Strip HTML tags from note content for security
    const sanitizedContent = content ? stripHtmlTags(content.trim()) : undefined;

    const note = await noteService.updateNote(userId, noteId, {
      content: sanitizedContent,
      timestamp,
    });

    if (!note) {
      res.status(404).json({
        success: false,
        error: { message: 'Note not found or you do not have permission to update it' },
      });
      return;
    }

    res.json({
      success: true,
      data: note,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * DELETE /api/lessons/:lessonId/notes/:noteId
 * Delete a note
 */
export async function deleteNote(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { noteId } = req.params;
    const userId = req.user!.userId;

    const deleted = await noteService.deleteNote(userId, noteId);

    if (!deleted) {
      res.status(404).json({
        success: false,
        error: { message: 'Note not found or you do not have permission to delete it' },
      });
      return;
    }

    res.json({
      success: true,
      data: {
        message: 'Note deleted successfully',
      },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /api/lessons/:id/notes/auto-save
 * Auto-save note (for auto-save functionality)
 */
export async function autoSaveNote(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: lessonId } = req.params;
    const { content, timestamp, noteId } = req.body;
    const userId = req.user!.userId;

    // Validate input
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: { message: 'Note content is required' },
      });
      return;
    }

    // Verify user has access to this lesson
    const hasAccess = await lessonService.canAccessLesson(userId, lessonId);
    if (!hasAccess) {
      res.status(403).json({
        success: false,
        error: { message: 'You do not have access to this lesson' },
      });
      return;
    }

    // Strip HTML tags from note content for security
    const sanitizedContent = stripHtmlTags(content.trim());

    // Use upsert if noteId is provided
    const note = await noteService.upsertNote(userId, lessonId, noteId || null, {
      content: sanitizedContent,
      timestamp,
    });

    res.json({
      success: true,
      data: note,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/lessons/:id/notes/draft
 * Get the most recent note draft for a lesson
 */
export async function getNoteDraft(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: lessonId } = req.params;
    const userId = req.user!.userId;

    // Verify user has access to this lesson
    const hasAccess = await lessonService.canAccessLesson(userId, lessonId);
    if (!hasAccess) {
      res.status(403).json({
        success: false,
        error: { message: 'You do not have access to this lesson' },
      });
      return;
    }

    const draft = await noteService.getNoteDraft(userId, lessonId);

    res.json({
      success: true,
      data: draft,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /api/lessons/:lessonId/notes/:noteId/resolve-conflict
 * Resolve note conflict by comparing timestamps
 */
export async function resolveNoteConflict(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { noteId } = req.params;
    const { content, clientTimestamp } = req.body;
    const userId = req.user!.userId;

    if (!content || !clientTimestamp) {
      res.status(400).json({
        success: false,
        error: { message: 'Content and clientTimestamp are required' },
      });
      return;
    }

    // Strip HTML tags from note content for security
    const sanitizedContent = stripHtmlTags(content);

    const result = await noteService.resolveNoteConflict(
      userId,
      noteId,
      sanitizedContent,
      new Date(clientTimestamp)
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    if (error.message === 'Note not found') {
      res.status(404).json({
        success: false,
        error: { message: 'Note not found' },
      });
      return;
    }
    next(error);
  }
}

