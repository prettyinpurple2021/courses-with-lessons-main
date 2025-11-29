export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  issuedAt: string;
  verificationCode: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  course?: {
    title: string;
    courseNumber: number;
    description?: string;
    thumbnail?: string;
  };
}

export interface CertificateVerification {
  valid: boolean;
  certificate: Certificate;
}

export interface ShareCertificateResponse {
  shareUrl: string;
  verificationCode: string;
}
