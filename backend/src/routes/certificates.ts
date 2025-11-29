import { Router } from 'express';
import * as certificateController from '../controllers/certificateController.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

// Protected routes (require authentication)
router.get('/', authenticate, asyncHandler(certificateController.getUserCertificates));
router.get('/:id', authenticate, asyncHandler(certificateController.getCertificateById));
router.get('/:id/pdf', authenticate, asyncHandler(certificateController.downloadCertificatePDF));
router.post('/:id/share', authenticate, asyncHandler(certificateController.shareCertificate));

// Public route for verification
router.get('/verify/:verificationCode', asyncHandler(certificateController.verifyCertificate));

export default router;
