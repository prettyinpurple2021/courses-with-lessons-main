import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminAuth.js';
import { validate } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { param, body } from 'express-validator';
import * as youtubeService from '../services/youtubeService.js';

const router = Router();

// All routes require admin authentication
router.use(authenticate, requireAdmin);

/**
 * GET /api/admin/youtube/validate/:videoId
 * Validate if a YouTube video ID is valid and embeddable
 */
router.get(
  '/validate/:videoId',
  validate([
    param('videoId')
      .isString()
      .isLength({ min: 11, max: 11 })
      .withMessage('Invalid YouTube video ID format'),
  ]),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { videoId } = req.params;

      const isValid = await youtubeService.validateYouTubeVideoId(videoId);

      res.json({
        success: true,
        data: {
          videoId,
          isValid,
          message: isValid
            ? 'Video is valid and embeddable'
            : 'Video not found, private, or not embeddable',
        },
      });
    } catch (error) {
      next(error);
    }
  })
);

/**
 * GET /api/admin/youtube/metadata/:videoId
 * Fetch metadata for a YouTube video
 */
router.get(
  '/metadata/:videoId',
  validate([
    param('videoId')
      .isString()
      .isLength({ min: 11, max: 11 })
      .withMessage('Invalid YouTube video ID format'),
  ]),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { videoId } = req.params;

      const metadata = await youtubeService.getYouTubeVideoMetadata(videoId);

      if (!metadata) {
        res.status(404).json({
          success: false,
          error: {
            message: 'Video not found or not accessible',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: metadata,
      });
    } catch (error) {
      next(error);
    }
  })
);

/**
 * POST /api/admin/youtube/extract-id
 * Extract YouTube video ID from a URL
 */
router.post(
  '/extract-id',
  validate([
    body('url').isString().notEmpty().withMessage('URL is required'),
  ]),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { url } = req.body;

      const videoId = youtubeService.extractYouTubeVideoId(url);

      if (!videoId) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Could not extract video ID from URL',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: {
          videoId,
          url,
        },
      });
    } catch (error) {
      next(error);
    }
  })
);

/**
 * POST /api/admin/youtube/batch-validate
 * Validate multiple YouTube video IDs at once
 */
router.post(
  '/batch-validate',
  validate([
    body('videoIds')
      .isArray({ min: 1, max: 50 })
      .withMessage('videoIds must be an array with 1-50 items'),
    body('videoIds.*')
      .isString()
      .isLength({ min: 11, max: 11 })
      .withMessage('Each video ID must be 11 characters'),
  ]),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { videoIds } = req.body;

      const results = await youtubeService.batchValidateYouTubeVideos(videoIds);

      // Convert Map to object for JSON response
      const resultsObject: Record<string, boolean> = {};
      results.forEach((isValid, videoId) => {
        resultsObject[videoId] = isValid;
      });

      res.json({
        success: true,
        data: {
          results: resultsObject,
          summary: {
            total: videoIds.length,
            valid: Array.from(results.values()).filter((v) => v).length,
            invalid: Array.from(results.values()).filter((v) => !v).length,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  })
);

export default router;
