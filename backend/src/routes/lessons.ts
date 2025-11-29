import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import * as lessonController from '../controllers/lessonController.js';
import * as noteController from '../controllers/noteController.js';
import * as activityController from '../controllers/activityController.js';

const router = Router();

// All lesson routes require authentication
router.use(authenticate);

// GET /api/lessons/:id - Get lesson details with activities
router.get('/:id', asyncHandler(lessonController.getLessonById));

// GET /api/lessons/:id/unlock - Check if user can access lesson
router.get('/:id/unlock', asyncHandler(lessonController.checkLessonAccess));

// GET /api/lessons/:id/resources - Get lesson resources
router.get('/:id/resources', asyncHandler(lessonController.getLessonResources));

// POST /api/lessons/:id/complete - Mark lesson as completed
router.post('/:id/complete', asyncHandler(lessonController.completeLesson));

// PUT /api/lessons/:id/progress - Update video position
router.put('/:id/progress', asyncHandler(lessonController.updateVideoProgress));

// Note endpoints
// GET /api/lessons/:id/notes - Get all notes for a lesson
router.get('/:id/notes', asyncHandler(noteController.getNotesByLesson));

// POST /api/lessons/:id/notes - Create a new note
router.post('/:id/notes', asyncHandler(noteController.createNote));

// POST /api/lessons/:id/notes/auto-save - Auto-save note
router.post('/:id/notes/auto-save', asyncHandler(noteController.autoSaveNote));

// GET /api/lessons/:id/notes/draft - Get note draft
router.get('/:id/notes/draft', asyncHandler(noteController.getNoteDraft));

// PUT /api/lessons/:lessonId/notes/:noteId - Update a note
router.put('/:lessonId/notes/:noteId', asyncHandler(noteController.updateNote));

// POST /api/lessons/:lessonId/notes/:noteId/resolve-conflict - Resolve note conflict
router.post('/:lessonId/notes/:noteId/resolve-conflict', asyncHandler(noteController.resolveNoteConflict));

// DELETE /api/lessons/:lessonId/notes/:noteId - Delete a note
router.delete('/:lessonId/notes/:noteId', asyncHandler(noteController.deleteNote));

// Activity endpoints
// GET /api/lessons/:lessonId/activities - Get all activities for a lesson
router.get('/:lessonId/activities', asyncHandler(activityController.getActivitiesByLesson));

export default router;
