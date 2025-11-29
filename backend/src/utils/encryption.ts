import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const TAG_POSITION = SALT_LENGTH + IV_LENGTH;
const ENCRYPTED_POSITION = TAG_POSITION + TAG_LENGTH;

/**
 * Get encryption key from environment variable
 * In production, this should be a strong, randomly generated key (32 bytes for AES-256)
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is required');
  }
  // If key is hex string, convert to buffer, otherwise use directly
  if (key.length === 64) {
    // Assume hex-encoded 32-byte key
    return Buffer.from(key, 'hex');
  }
  // Otherwise, derive a key from the string (not ideal, but better than nothing)
  return crypto.scryptSync(key, 'salt', 32);
}

/**
 * Encrypt sensitive data (e.g., OAuth tokens) before storing in database
 * Uses AES-256-GCM encryption with authentication tag
 */
export function encrypt(text: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const salt = crypto.randomBytes(SALT_LENGTH);

  // Derive key from password using PBKDF2
  const derivedKey = crypto.pbkdf2Sync(key, salt, 100000, 32, 'sha512');

  const cipher = crypto.createCipheriv(ALGORITHM, derivedKey, iv);

  let encrypted = cipher.update(text, 'utf8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  // Get authentication tag
  const tag = cipher.getAuthTag();

  // Combine salt + iv + tag + encrypted
  const result = Buffer.concat([salt, iv, tag, encrypted]);

  // Return as base64 string
  return result.toString('base64');
}

/**
 * Decrypt data that was encrypted with encrypt()
 */
export function decrypt(encryptedData: string): string {
  try {
    const key = getEncryptionKey();
    const data = Buffer.from(encryptedData, 'base64');

    // Extract salt, iv, tag, and encrypted data
    const salt = data.subarray(0, SALT_LENGTH);
    const iv = data.subarray(SALT_LENGTH, TAG_POSITION);
    const tag = data.subarray(TAG_POSITION, ENCRYPTED_POSITION);
    const encrypted = data.subarray(ENCRYPTED_POSITION);

    // Derive key from password using PBKDF2
    const derivedKey = crypto.pbkdf2Sync(key, salt, 100000, 32, 'sha512');

    const decipher = crypto.createDecipheriv(ALGORITHM, derivedKey, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString('utf8');
  } catch (error) {
    throw new Error('Failed to decrypt data: Invalid encrypted data or key');
  }
}

