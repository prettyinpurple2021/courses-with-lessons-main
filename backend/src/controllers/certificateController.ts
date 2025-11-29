import { Request, Response, NextFunction } from 'express';
import * as certificateService from '../services/certificateService.js';

/**
 * Get all certificates for the authenticated user
 */
export const getUserCertificates = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
      return;
    }

    const certificates = await certificateService.getUserCertificates(userId);

    res.json({
      success: true,
      data: certificates,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get a specific certificate by ID
 */
export const getCertificateById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
      return;
    }

    const certificate = await certificateService.getCertificateById(id, userId);

    res.json({
      success: true,
      data: certificate,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Certificate not found') {
      res.status(404).json({
        success: false,
        error: 'Certificate not found',
      });
      return;
    }
    next(error);
  }
};

/**
 * Download certificate as PDF
 */
export const downloadCertificatePDF = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
      return;
    }

    const pdfBuffer = await certificateService.generateCertificatePDF(id, userId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=certificate-${id}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    if (error instanceof Error && error.message === 'Certificate not found') {
      res.status(404).json({
        success: false,
        error: 'Certificate not found',
      });
      return;
    }
    next(error);
  }
};

/**
 * Generate shareable link for certificate
 */
export const shareCertificate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
      return;
    }

    const certificate = await certificateService.getCertificateById(id, userId);

    // Generate shareable URL
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const shareUrl = `${baseUrl}/certificates/verify/${certificate.verificationCode}`;

    res.json({
      success: true,
      data: {
        shareUrl,
        verificationCode: certificate.verificationCode,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Certificate not found') {
      res.status(404).json({
        success: false,
        error: 'Certificate not found',
      });
      return;
    }
    next(error);
  }
};

/**
 * Verify a certificate by verification code (public endpoint)
 */
export const verifyCertificate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { verificationCode } = req.params;

    const result = await certificateService.verifyCertificate(verificationCode);

    if (!result) {
      res.status(404).json({
        success: false,
        error: 'Certificate not found or invalid verification code',
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
};

