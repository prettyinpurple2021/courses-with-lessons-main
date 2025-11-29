import { CookieOptions } from 'express';

/**
 * Get secure cookie configuration based on environment
 * Ensures cookies are secure in production with proper flags
 */
export const getSecureCookieConfig = (maxAge?: number): CookieOptions => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    httpOnly: true, // Prevents JavaScript access to cookies
    secure: isProduction, // Only send over HTTPS in production
    sameSite: isProduction ? 'strict' : 'lax', // CSRF protection
    maxAge: maxAge || 7 * 24 * 60 * 60 * 1000, // Default 7 days
    path: '/', // Cookie available for all paths
    ...(isProduction && { domain: process.env.COOKIE_DOMAIN }), // Set domain in production if specified
  };
};

/**
 * Get refresh token cookie configuration
 */
export const getRefreshTokenCookieConfig = (): CookieOptions => {
  return getSecureCookieConfig(7 * 24 * 60 * 60 * 1000); // 7 days
};

/**
 * Get session cookie configuration
 */
export const getSessionCookieConfig = (): CookieOptions => {
  return getSecureCookieConfig(24 * 60 * 60 * 1000); // 1 day
};
