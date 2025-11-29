import crypto from 'crypto';

// In-memory store for password reset tokens
// In production, this should be Redis or database
interface ResetToken {
  userId: string;
  token: string;
  expiresAt: Date;
}

const resetTokens = new Map<string, ResetToken>();

export const generateResetToken = (userId: string): string => {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  resetTokens.set(token, {
    userId,
    token,
    expiresAt,
  });

  return token;
};

export const verifyResetToken = (token: string): string | null => {
  const resetToken = resetTokens.get(token);

  if (!resetToken) {
    return null;
  }

  if (resetToken.expiresAt < new Date()) {
    resetTokens.delete(token);
    return null;
  }

  return resetToken.userId;
};

export const deleteResetToken = (token: string): void => {
  resetTokens.delete(token);
};

// Cleanup expired tokens periodically
setInterval(() => {
  const now = new Date();
  for (const [token, data] of resetTokens.entries()) {
    if (data.expiresAt < now) {
      resetTokens.delete(token);
    }
  }
}, 60 * 60 * 1000); // Run every hour
