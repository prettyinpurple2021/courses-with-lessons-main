import xss from 'xss';
import validator from 'validator';

/**
 * Sanitize user input to prevent XSS attacks
 * Removes potentially dangerous HTML/JavaScript while preserving safe content
 */
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Use xss library to sanitize HTML and remove dangerous scripts
  return xss(input, {
    whiteList: {}, // No HTML tags allowed
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script', 'style'],
  });
};

/**
 * Strip all HTML tags from user input
 * Use for content that should be plain text only (notes, forum posts, etc.)
 */
export const stripHtmlTags = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Remove all HTML tags
  return validator.stripLow(
    input.replace(/<[^>]*>/g, '')
  );
};

/**
 * Sanitize an object's string properties recursively
 */
export const sanitizeObject = <T extends Record<string, any>>(obj: T): T => {
  const sanitized = { ...obj };
  
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeInput(sanitized[key]) as any;
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeObject(sanitized[key]);
    }
  }
  
  return sanitized;
};

/**
 * Validate and sanitize email addresses
 */
export const sanitizeEmail = (email: string): string => {
  if (typeof email !== 'string') {
    return '';
  }
  
  // Normalize and validate email
  const normalized = validator.normalizeEmail(email) || '';
  
  if (!validator.isEmail(normalized)) {
    throw new Error('Invalid email format');
  }
  
  return normalized;
};

/**
 * Sanitize file upload metadata
 */
export const sanitizeFileName = (fileName: string): string => {
  if (typeof fileName !== 'string') {
    return '';
  }
  
  // Remove path traversal attempts and dangerous characters
  return fileName
    .replace(/\.\./g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .substring(0, 255); // Limit length
};

/**
 * Validate file upload
 */
export const validateFileUpload = (
  file: any, // Multer file object
  options: {
    allowedMimeTypes?: string[];
    maxSize?: number; // in bytes
  } = {}
): void => {
  const {
    allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxSize = 5 * 1024 * 1024, // 5MB default
  } = options;
  
  // Check file size
  if (file.size > maxSize) {
    throw new Error(`File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`);
  }
  
  // Check MIME type
  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new Error(`File type ${file.mimetype} is not allowed`);
  }
  
  // Sanitize filename
  file.originalname = sanitizeFileName(file.originalname);
};

/**
 * Sanitize URL to prevent open redirect vulnerabilities
 */
export const sanitizeUrl = (url: string): string => {
  if (typeof url !== 'string') {
    return '';
  }
  
  // Only allow http and https protocols
  if (!validator.isURL(url, { protocols: ['http', 'https'], require_protocol: true })) {
    throw new Error('Invalid URL format');
  }
  
  return url;
};
