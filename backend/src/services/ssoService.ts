import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { generateAccessToken } from '../utils/jwt.js';
import { logger } from '../utils/logger.js';
import { syncSubscriptionTier } from './subscriptionSyncService.js';

// Re-export for convenience
export { syncSubscriptionTier } from './subscriptionSyncService.js';
import { hashPassword } from '../utils/password.js';

const prisma = new PrismaClient();

const SSO_JWT_SECRET = process.env.SSO_JWT_SECRET || process.env.JWT_SECRET || 'sso-jwt-secret';

export interface SSOTokenPayload {
  userId: string; // SoloSuccess AI user ID
  email: string;
  tier: string; // free, accelerator, premium
  intelAcademyUserId?: string;
  firstName?: string;
  lastName?: string;
  iat?: number;
  exp?: number;
}

export interface SSOValidationResult {
  intelAcademyUserId: string;
  sessionToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    subscriptionTier: string;
  };
}

/**
 * Validate SSO JWT token from SoloSuccess AI
 */
export function validateSSOToken(token: string): SSOTokenPayload {
  try {
    const payload = jwt.verify(token, SSO_JWT_SECRET) as SSOTokenPayload;
    
    // Validate expiration (JWT library handles this, but double-check)
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      throw new Error('SSO token has expired');
    }
    
    // Validate required fields
    if (!payload.userId || !payload.email || !payload.tier) {
      throw new Error('SSO token missing required fields');
    }
    
    return payload;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid SSO token signature');
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('SSO token has expired');
    }
    throw error;
  }
}

/**
 * Create or get user by email or intelAcademyUserId
 */
export async function createOrGetUser(
  email: string,
  firstName: string,
  lastName: string,
  _tier: string,
  intelAcademyUserId?: string
): Promise<{ id: string; email: string; firstName: string; lastName: string }> {
  let user;
  
  // Try to find user by intelAcademyUserId first (if provided)
  if (intelAcademyUserId) {
    user = await prisma.user.findUnique({
      where: { id: intelAcademyUserId },
    });
  }
  
  // If not found, try by email
  if (!user) {
    user = await prisma.user.findUnique({
      where: { email },
    });
  }
  
  // If user doesn't exist, create new user
  if (!user) {
    // Generate a temporary password (user will use SSO for login)
    const tempPassword = await hashPassword(
      `temp_${Date.now()}_${Math.random().toString(36).substring(7)}`
    );
    
    user = await prisma.user.create({
      data: {
        email,
        password: tempPassword,
        firstName: firstName || 'User',
        lastName: lastName || 'Name',
        role: 'student',
      },
    });
    
    logger.info('New user created via SSO', {
      userId: user.id,
      email: user.email,
    });
  } else {
    // Update user info if needed (in case names changed in SoloSuccess AI)
    if (firstName && lastName) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          firstName,
          lastName,
        },
      });
    }
  }
  
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  };
}

/**
 * Generate Intel Academy session token (JWT)
 */
export function generateSessionToken(userId: string, email: string, role: string): string {
  const payload = {
    userId,
    email,
    role,
  };
  
  return generateAccessToken(payload);
}

/**
 * Sync subscription tier to course access levels
 */
export async function syncSubscriptionTierForUser(
  userId: string,
  tier: string
): Promise<void> {
  await syncSubscriptionTier(userId, tier);
  
  logger.info('Subscription tier synced for user', {
    userId,
    tier,
  });
}

/**
 * Validate SSO token and create/get user with session
 */
export async function validateAndLogin(
  token: string
): Promise<SSOValidationResult> {
  // Validate SSO token
  const payload = validateSSOToken(token);
  
  // Create or get user
  const user = await createOrGetUser(
    payload.email,
    payload.firstName || 'User',
    payload.lastName || 'Name',
    payload.tier,
    payload.intelAcademyUserId
  );
  
  // Sync subscription tier to course access
  await syncSubscriptionTierForUser(user.id, payload.tier);
  
  // Get user role
  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  
  if (!fullUser) {
    throw new Error('User not found after creation');
  }
  
  // Generate Intel Academy session token
  const sessionToken = generateSessionToken(
    user.id,
    user.email,
    fullUser.role
  );
  
  logger.info('SSO validation successful', {
    intelAcademyUserId: user.id,
    solosuccessUserId: payload.userId,
    tier: payload.tier,
  });
  
  return {
    intelAcademyUserId: user.id,
    sessionToken,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      subscriptionTier: payload.tier,
    },
  };
}

