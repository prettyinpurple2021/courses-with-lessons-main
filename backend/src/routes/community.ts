import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import * as forumController from '../controllers/forumController.js';
import * as memberController from '../controllers/memberController.js';
import * as eventController from '../controllers/eventController.js';

const router = Router();

// All community routes require authentication
router.use(authenticate);

// GET /api/community/forums - Get all forum categories
router.get('/forums', asyncHandler(forumController.getForumCategories));

// GET /api/community/threads - Get threads with filters
router.get('/threads', asyncHandler(forumController.getThreads));

// POST /api/community/threads - Create new thread
router.post('/threads', asyncHandler(forumController.createThread));

// GET /api/community/threads/:id - Get thread details with posts
router.get('/threads/:id', asyncHandler(forumController.getThreadById));

// POST /api/community/threads/:id/replies - Create reply to thread
router.post('/threads/:id/replies', asyncHandler(forumController.createReply));

// PUT /api/community/posts/:id - Update a post
router.put('/posts/:id', asyncHandler(forumController.updatePost));

// DELETE /api/community/posts/:id - Delete a post
router.delete('/posts/:id', asyncHandler(forumController.deletePost));

// GET /api/community/search - Search threads
router.get('/search', asyncHandler(forumController.searchThreads));

// GET /api/community/users/:userId/reputation - Get user reputation
router.get('/users/:userId/reputation', asyncHandler(forumController.getUserReputation));

// GET /api/community/members - Get all members
router.get('/members', asyncHandler(memberController.getMembers));

// GET /api/community/members/:id - Get member profile
router.get('/members/:id', asyncHandler(memberController.getMemberById));

// GET /api/community/events - Get all upcoming events
router.get('/events', asyncHandler(eventController.getEvents));

// GET /api/community/events/my/registrations - Get user's registered events
router.get('/events/my/registrations', asyncHandler(eventController.getUserEvents));

// GET /api/community/events/:id - Get event details
router.get('/events/:id', asyncHandler(eventController.getEventById));

// POST /api/community/events/:id/register - Register for event
router.post('/events/:id/register', asyncHandler(eventController.registerForEvent));

// DELETE /api/community/events/:id/register - Unregister from event
router.delete('/events/:id/register', asyncHandler(eventController.unregisterFromEvent));

export default router;
