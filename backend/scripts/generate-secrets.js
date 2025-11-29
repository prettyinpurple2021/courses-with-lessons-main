#!/usr/bin/env node
/**
 * Generate secure random secrets for JWT tokens
 * Run: node scripts/generate-secrets.js
 */

import crypto from 'crypto';

console.log('\n🔐 Generating secure JWT secrets...\n');

const jwtSecret = crypto.randomBytes(32).toString('hex');
const jwtRefreshSecret = crypto.randomBytes(32).toString('hex');

console.log('Copy these into your .env file:\n');
console.log(`JWT_SECRET="${jwtSecret}"`);
console.log(`JWT_REFRESH_SECRET="${jwtRefreshSecret}"`);
console.log('\n✅ Secrets generated! Make sure to keep these secure.\n');

