import crypto from 'crypto';

/**
 * Generate a salt and hash password securely using scrypt / PBKDF2
 */
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

/**
 * Verify a plain password against a stored salt and hash
 */
export function verifyPassword(password, salt, storedHash) {
  if (!password || !salt || !storedHash) return false;
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(storedHash, 'hex'));
}
