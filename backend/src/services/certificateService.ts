import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import PDFDocument from 'pdfkit';

const prisma = new PrismaClient();

/**
 * Generate a unique verification code for certificates
 */
export const generateVerificationCode = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomPart = crypto.randomBytes(6).toString('hex').toUpperCase();
  return `SSIA-${timestamp}-${randomPart}`;
};

/**
 * Create a certificate for a user upon course completion
 */
export const createCertificate = async (userId: string, courseId: string) => {
  // Check if certificate already exists
  const existingCertificate = await prisma.certificate.findFirst({
    where: {
      userId,
      courseId,
    },
  });

  if (existingCertificate) {
    return existingCertificate;
  }

  // Verify course completion
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
  });

  if (!enrollment || !enrollment.completedAt) {
    throw new Error('Course not completed');
  }

  // Generate unique verification code
  const verificationCode = generateVerificationCode();

  // Create certificate
  const certificate = await prisma.certificate.create({
    data: {
      userId,
      courseId,
      verificationCode,
    },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      course: {
        select: {
          title: true,
          courseNumber: true,
        },
      },
    },
  });

  return certificate;
};

/**
 * Get all certificates for a user
 */
export const getUserCertificates = async (userId: string) => {
  const certificates = await prisma.certificate.findMany({
    where: {
      userId,
    },
    include: {
      course: {
        select: {
          title: true,
          courseNumber: true,
          thumbnail: true,
        },
      },
    },
    orderBy: {
      issuedAt: 'desc',
    },
  });

  return certificates;
};

/**
 * Get a specific certificate by ID
 */
export const getCertificateById = async (certificateId: string, userId: string) => {
  const certificate = await prisma.certificate.findFirst({
    where: {
      id: certificateId,
      userId,
    },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      course: {
        select: {
          title: true,
          courseNumber: true,
          description: true,
        },
      },
    },
  });

  if (!certificate) {
    throw new Error('Certificate not found');
  }

  return certificate;
};

/**
 * Verify a certificate by verification code
 */
export const verifyCertificate = async (verificationCode: string) => {
  const certificate = await prisma.certificate.findUnique({
    where: {
      verificationCode,
    },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      course: {
        select: {
          title: true,
          courseNumber: true,
        },
      },
    },
  });

  if (!certificate) {
    return null;
  }

  return {
    valid: true,
    certificate,
  };
};

/**
 * Generate PDF certificate
 */
export const generateCertificatePDF = async (certificateId: string, userId: string): Promise<Buffer> => {
  const certificate = await getCertificateById(certificateId, userId);

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
      });

      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Background color
      doc.rect(0, 0, doc.page.width, doc.page.height).fill('#FFF5F7');

      // Girly camo border pattern (simplified)
      doc.strokeColor('#FFC0CB').lineWidth(10);
      doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke();
      
      doc.strokeColor('#708090').lineWidth(5);
      doc.rect(25, 25, doc.page.width - 50, doc.page.height - 50).stroke();

      // Title
      doc.fontSize(48)
        .fillColor('#FF1493')
        .font('Helvetica-Bold')
        .text('Certificate of Completion', 0, 100, {
          align: 'center',
          width: doc.page.width,
        });

      // Subtitle
      doc.fontSize(20)
        .fillColor('#000000')
        .font('Helvetica')
        .text('SoloSuccess Intel Academy', 0, 160, {
          align: 'center',
          width: doc.page.width,
        });

      // Recipient name
      doc.fontSize(16)
        .fillColor('#708090')
        .text('This certifies that', 0, 220, {
          align: 'center',
          width: doc.page.width,
        });

      doc.fontSize(36)
        .fillColor('#000000')
        .font('Helvetica-Bold')
        .text(`${certificate.user.firstName} ${certificate.user.lastName}`, 0, 250, {
          align: 'center',
          width: doc.page.width,
        });

      // Course completion text
      doc.fontSize(16)
        .fillColor('#708090')
        .font('Helvetica')
        .text('has successfully completed', 0, 310, {
          align: 'center',
          width: doc.page.width,
        });

      doc.fontSize(28)
        .fillColor('#FF1493')
        .font('Helvetica-Bold')
        .text(certificate.course.title, 0, 340, {
          align: 'center',
          width: doc.page.width,
        });

      // Date
      const formattedDate = new Date(certificate.issuedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      doc.fontSize(14)
        .fillColor('#000000')
        .font('Helvetica')
        .text(`Issued on ${formattedDate}`, 0, 410, {
          align: 'center',
          width: doc.page.width,
        });

      // Verification code
      doc.fontSize(12)
        .fillColor('#708090')
        .text(`Verification Code: ${certificate.verificationCode}`, 0, 480, {
          align: 'center',
          width: doc.page.width,
        });

      // Holographic seal placeholder (text-based)
      doc.fontSize(10)
        .fillColor('#40E0D0')
        .text('★ VERIFIED ★', doc.page.width - 150, doc.page.height - 100, {
          align: 'center',
          width: 100,
        });

      // Finalize PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
