import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger.js';
import { encrypt, decrypt } from '../utils/encryption.js';
import crypto from 'crypto';
import { validateClientSecret } from './oauthClientService.js';

const prisma = new PrismaClient();

const OAUTH_ACCESS_TOKEN_SECRET = process.env.OAUTH_ACCESS_TOKEN_SECRET || process.env.JWT_SECRET || 'oauth-access-token-secret';
const OAUTH_REFRESH_TOKEN_SECRET = process.env.OAUTH_REFRESH_TOKEN_SECRET || process.env.JWT_REFRESH_SECRET || 'oauth-refresh-token-secret';

const ACCESS_TOKEN_EXPIRES_IN = '1h'; // 1 hour
const REFRESH_TOKEN_EXPIRES_IN = '30d'; // 30 days
const AUTHORIZATION_CODE_EXPIRES_IN = 10 * 60 * 1000; // 10 minutes in milliseconds

export interface OAuthTokenPayload {
  userId: string;
  clientId: string;
  email?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number; // seconds
  token_type: string;
}

/**
 * Generate a random authorization code
 */
function generateAuthorizationCode(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate OAuth access token (JWT)
 */
export function generateAccessToken(userId: string, clientId: string): string {
  const payload: OAuthTokenPayload = {
    userId,
    clientId,
  };
  
  return jwt.sign(payload, OAUTH_ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });
}

/**
 * Generate OAuth refresh token (JWT)
 */
export function generateRefreshToken(userId: string, clientId: string): string {
  const payload: OAuthTokenPayload = {
    userId,
    clientId,
  };
  
  return jwt.sign(payload, OAUTH_REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });
}

/**
 * Verify OAuth access token
 */
export function verifyAccessToken(token: string): OAuthTokenPayload {
  try {
    return jwt.verify(token, OAUTH_ACCESS_TOKEN_SECRET) as OAuthTokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
}

/**
 * Verify OAuth refresh token
 */
export function verifyRefreshToken(token: string): OAuthTokenPayload {
  try {
    return jwt.verify(token, OAUTH_REFRESH_TOKEN_SECRET) as OAuthTokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
}

/**
 * Generate authorization code for OAuth flow
 */
export async function generateAuthorizationCodeFlow(
  userId: string,
  clientId: string,
  redirectUri: string
): Promise<string> {
  // Verify client exists and is active
  const client = await prisma.oAuthClient.findUnique({
    where: { clientId },
    select: { id: true, redirectUri: true, isActive: true },
  });
  
  if (!client || !client.isActive) {
    throw new Error('Invalid client');
  }
  
  // Validate redirect URI matches client's registered URI
  if (client.redirectUri !== redirectUri) {
    throw new Error('Invalid redirect URI');
  }
  
  // Generate authorization code
  const code = generateAuthorizationCode();
  const expiresAt = new Date(Date.now() + AUTHORIZATION_CODE_EXPIRES_IN);
  
  // Store authorization code
  await prisma.oAuthAuthorizationCode.create({
    data: {
      code,
      clientId: client.id, // Use UUID, not the clientId string
      userId,
      redirectUri,
      expiresAt,
      used: false,
    },
  });
  
  logger.info('Authorization code generated', {
    userId,
    clientId,
    code: code.substring(0, 8) + '...', // Log partial code for debugging
  });
  
  return code;
}

/**
 * Exchange authorization code for access and refresh tokens
 */
export async function exchangeCodeForToken(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<TokenResponse> {
  // Validate client credentials
  const isValid = await validateClientSecret(clientId, clientSecret);
  if (!isValid) {
    throw new Error('Invalid client credentials');
  }
  
  // Find and validate authorization code
  const authCode = await prisma.oAuthAuthorizationCode.findUnique({
    where: { code },
    include: {
      client: {
        select: { id: true, clientId: true, redirectUri: true, isActive: true },
      },
    },
  });
  
  if (!authCode) {
    throw new Error('Invalid authorization code');
  }
  
  if (authCode.used) {
    throw new Error('Authorization code has already been used');
  }
  
  if (authCode.expiresAt < new Date()) {
    throw new Error('Authorization code has expired');
  }
  
  // Compare clientId string (not UUID) from the client relation
  if (authCode.client.clientId !== clientId) {
    throw new Error('Invalid client for authorization code');
  }
  
  if (authCode.redirectUri !== redirectUri) {
    throw new Error('Invalid redirect URI');
  }
  
  if (!authCode.client.isActive) {
    throw new Error('Client is not active');
  }
  
  // Mark authorization code as used
  await prisma.oAuthAuthorizationCode.update({
    where: { code },
    data: { used: true },
  });
  
  // Generate tokens
  const accessToken = generateAccessToken(authCode.userId, clientId);
  const refreshToken = generateRefreshToken(authCode.userId, clientId);
  
  // Calculate token expiry (1 hour = 3600 seconds)
  const expiresIn = 3600;
  const tokenExpiry = new Date(Date.now() + expiresIn * 1000);
  
  // Encrypt tokens before storing
  const encryptedAccessToken = encrypt(accessToken);
  const encryptedRefreshToken = encrypt(refreshToken);
  
  // Determine subscription tier from existing enrollments if available
  // This prevents resetting tier to "free" if user was already synced with a higher tier
  let subscriptionTier = 'free'; // Default
  const existingEnrollment = await prisma.enrollment.findFirst({
    where: { userId: authCode.userId },
    select: { unlockedCourses: true },
    orderBy: { unlockedCourses: 'desc' },
  });
  
  if (existingEnrollment) {
    // Infer tier from unlockedCourses to preserve existing tier
    const unlockedCourses = existingEnrollment.unlockedCourses;
    if (unlockedCourses >= 7) {
      subscriptionTier = 'premium';
    } else if (unlockedCourses >= 4) {
      subscriptionTier = 'accelerator';
    } else {
      subscriptionTier = 'free';
    }
  }
  
  // Store or update integration record
  // Use authCode.client.id (UUID) for the foreign key, not the clientId string
  await prisma.soloSuccessIntegration.upsert({
    where: { userId: authCode.userId },
    create: {
      userId: authCode.userId,
      solosuccessUserId: authCode.userId, // Will be updated by SoloSuccess AI later
      oauthClientId: authCode.client.id, // Use UUID from client relation
      accessToken: encryptedAccessToken,
      refreshToken: encryptedRefreshToken,
      tokenExpiry,
      subscriptionTier, // Preserve tier from existing enrollments
      isActive: true,
      syncStatus: 'pending',
    },
    update: {
      oauthClientId: authCode.client.id, // Update to correct UUID if it was wrong
      accessToken: encryptedAccessToken,
      refreshToken: encryptedRefreshToken,
      tokenExpiry,
      isActive: true,
      lastSyncAt: new Date(),
      syncStatus: 'synced',
      // Don't update subscriptionTier here - preserve existing value
    },
  });
  
  logger.info('Tokens generated and stored', {
    userId: authCode.userId,
    clientId,
  });
  
  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_in: expiresIn,
    token_type: 'Bearer',
  };
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  // Verify refresh token
  let payload: OAuthTokenPayload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
  
  const { userId, clientId } = payload;
  
  // Find integration record
  const integration = await prisma.soloSuccessIntegration.findUnique({
    where: { userId },
    include: {
      oauthClient: {
        select: { isActive: true },
      },
    },
  });
  
  if (!integration || !integration.isActive) {
    throw new Error('Integration not found or inactive');
  }
  
  if (!integration.oauthClient.isActive) {
    throw new Error('OAuth client is not active');
  }
  
  // Verify stored refresh token matches
  if (!integration.refreshToken) {
    throw new Error('No refresh token stored');
  }
  
  try {
    const decryptedRefreshToken = decrypt(integration.refreshToken);
    if (decryptedRefreshToken !== refreshToken) {
      throw new Error('Refresh token mismatch');
    }
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
  
  // Generate new tokens
  const newAccessToken = generateAccessToken(userId, clientId);
  const newRefreshToken = generateRefreshToken(userId, clientId);
  
  // Encrypt new tokens
  const encryptedAccessToken = encrypt(newAccessToken);
  const encryptedRefreshToken = encrypt(newRefreshToken);
  
  const expiresIn = 3600; // 1 hour in seconds
  const tokenExpiry = new Date(Date.now() + expiresIn * 1000);
  
  // Update integration with new tokens
  await prisma.soloSuccessIntegration.update({
    where: { userId },
    data: {
      accessToken: encryptedAccessToken,
      refreshToken: encryptedRefreshToken,
      tokenExpiry,
      lastSyncAt: new Date(),
    },
  });
  
  logger.info('Access token refreshed', { userId, clientId });
  
  return {
    access_token: newAccessToken,
    refresh_token: newRefreshToken,
    expires_in: expiresIn,
    token_type: 'Bearer',
  };
}

/**
 * Revoke tokens (disconnect integration)
 */
export async function revokeToken(accessToken: string): Promise<void> {
  try {
    const payload = verifyAccessToken(accessToken);
    const { userId } = payload;
    
    // Find and deactivate integration
    const integration = await prisma.soloSuccessIntegration.findUnique({
      where: { userId },
    });
    
    if (integration) {
      await prisma.soloSuccessIntegration.update({
        where: { userId },
        data: {
          isActive: false,
          accessToken: null,
          refreshToken: null,
          tokenExpiry: null,
          syncStatus: 'pending',
        },
      });
      
      logger.info('Tokens revoked and integration deactivated', { userId });
    }
  } catch (error) {
    // If token is invalid/expired, consider it already revoked
    logger.warn('Token revocation attempted with invalid token', { error });
  }
}

/**
 * Get stored access token for a user (decrypted)
 */
export async function getStoredAccessToken(userId: string): Promise<string | null> {
  const integration = await prisma.soloSuccessIntegration.findUnique({
    where: { userId },
    select: { accessToken: true, tokenExpiry: true, isActive: true },
  });
  
  if (!integration || !integration.isActive || !integration.accessToken) {
    return null;
  }
  
  // Check if token is expired
  if (integration.tokenExpiry && integration.tokenExpiry < new Date()) {
    return null;
  }
  
  try {
    return decrypt(integration.accessToken);
  } catch (error) {
    logger.error('Failed to decrypt access token', { userId, error });
    return null;
  }
}

