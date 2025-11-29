import { api } from './api';
import { Certificate, CertificateVerification, ShareCertificateResponse } from '../types/certificate';

/**
 * Get all certificates for the authenticated user
 */
export const getUserCertificates = async (): Promise<Certificate[]> => {
  const response = await api.get('/certificates');
  return response.data.data;
};

/**
 * Get a specific certificate by ID
 */
export const getCertificateById = async (certificateId: string): Promise<Certificate> => {
  const response = await api.get(`/certificates/${certificateId}`);
  return response.data.data;
};

/**
 * Download certificate as PDF
 */
export const downloadCertificatePDF = async (certificateId: string): Promise<Blob> => {
  const response = await api.get(`/certificates/${certificateId}/pdf`, {
    responseType: 'blob',
  });
  return response.data;
};

/**
 * Generate shareable link for certificate
 */
export const shareCertificate = async (certificateId: string): Promise<ShareCertificateResponse> => {
  const response = await api.post(`/certificates/${certificateId}/share`);
  return response.data.data;
};

/**
 * Verify a certificate by verification code (public endpoint)
 */
export const verifyCertificate = async (verificationCode: string): Promise<CertificateVerification> => {
  const response = await api.get(`/certificates/verify/${verificationCode}`);
  return response.data.data;
};
