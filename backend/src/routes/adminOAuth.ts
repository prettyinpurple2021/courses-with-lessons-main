import { Router } from 'express';
import { adminOAuthController } from '../controllers/adminOAuthController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminAuth.js';
import { validate } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { body } from 'express-validator';

const router = Router();

// All routes require admin authentication
router.use(authenticate);
router.use(requireAdmin);

/**
 * POST /api/admin/oauth/clients
 * Create a new OAuth client
 */
router.post(
  '/clients',
  validate([
    body('name').notEmpty().withMessage('name is required'),
    body('redirectUri').isURL().withMessage('redirectUri must be a valid URL'),
    body('webhookUrl').optional().isURL().withMessage('webhookUrl must be a valid URL'),
    body('webhookSecret').optional().isString(),
  ]),
  asyncHandler(adminOAuthController.createClient.bind(adminOAuthController))
);

/**
 * GET /api/admin/oauth/clients
 * List all OAuth clients
 */
router.get(
  '/clients',
  asyncHandler(adminOAuthController.listClients.bind(adminOAuthController))
);

/**
 * GET /api/admin/oauth/clients/:id
 * Get OAuth client details by ID or clientId
 */
router.get(
  '/clients/:id',
  asyncHandler(adminOAuthController.getClientById.bind(adminOAuthController))
);

/**
 * PUT /api/admin/oauth/clients/:id
 * Update OAuth client configuration
 */
router.put(
  '/clients/:id',
  validate([
    body('name').optional().notEmpty(),
    body('redirectUri').optional().isURL().withMessage('redirectUri must be a valid URL'),
    body('webhookUrl').optional().isURL().withMessage('webhookUrl must be a valid URL'),
    body('webhookSecret').optional().isString(),
  ]),
  asyncHandler(adminOAuthController.updateClientById.bind(adminOAuthController))
);

/**
 * DELETE /api/admin/oauth/clients/:id
 * Deactivate OAuth client
 */
router.delete(
  '/clients/:id',
  asyncHandler(adminOAuthController.deleteClient.bind(adminOAuthController))
);

export default router;

