#!/usr/bin/env tsx
/**
 * Environment Variable Validation Script
 * 
 * Validates that all required environment variables are set and have valid values.
 * Run this script before deploying to production.
 * 
 * Usage: tsx src/scripts/validate-env.ts
 */

import dotenv from 'dotenv';
import { existsSync } from 'fs';
import { join } from 'path';

// Load environment variables
const envFile = process.env.NODE_ENV === 'production'
  ? '.env.production'
  : '.env';

const envPath = join(process.cwd(), envFile);

if (existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

interface EnvVar {
  name: string;
  required: boolean;
  validator?: (value: string) => boolean;
  errorMessage?: string;
  description?: string;
}

const requiredVars: EnvVar[] = [
  {
    name: 'NODE_ENV',
    required: true,
    validator: (v) => ['development', 'production', 'test'].includes(v),
    errorMessage: 'Must be one of: development, production, test',
    description: 'Node environment'
  },
  {
    name: 'DATABASE_URL',
    required: true,
    validator: (v) => v.startsWith('postgresql://') || v.startsWith('postgres://'),
    errorMessage: 'Must be a valid PostgreSQL connection string',
    description: 'PostgreSQL database connection URL'
  },
  {
    name: 'JWT_SECRET',
    required: true,
    validator: (v) => v.length >= 32 && v !== 'your-super-secret-jwt-key-change-this-in-production',
    errorMessage: 'Must be at least 32 characters and not the default value',
    description: 'JWT access token secret'
  },
  {
    name: 'JWT_REFRESH_SECRET',
    required: true,
    validator: (v) => v.length >= 32 && v !== 'your-super-secret-refresh-key-change-this-in-production',
    errorMessage: 'Must be at least 32 characters and not the default value',
    description: 'JWT refresh token secret'
  },
  {
    name: 'CORS_ORIGIN',
    required: true,
    validator: (v) => {
      try {
        const url = new URL(v);
        return ['http:', 'https:'].includes(url.protocol);
      } catch {
        return false;
      }
    },
    errorMessage: 'Must be a valid URL',
    description: 'CORS allowed origin'
  },
  {
    name: 'FRONTEND_URL',
    required: true,
    validator: (v) => {
      try {
        const url = new URL(v);
        return ['http:', 'https:'].includes(url.protocol);
      } catch {
        return false;
      }
    },
    errorMessage: 'Must be a valid URL',
    description: 'Frontend application URL'
  },
  {
    name: 'REDIS_URL',
    required: false,
    validator: (v) => v.startsWith('redis://'),
    errorMessage: 'Must be a valid Redis connection string',
    description: 'Redis connection URL'
  },
  {
    name: 'CLOUDINARY_CLOUD_NAME',
    required: true,
    validator: (v) => v.length > 0,
    errorMessage: 'Cannot be empty',
    description: 'Cloudinary cloud name'
  },
  {
    name: 'CLOUDINARY_API_KEY',
    required: true,
    validator: (v) => v.length > 0,
    errorMessage: 'Cannot be empty',
    description: 'Cloudinary API key'
  },
  {
    name: 'CLOUDINARY_API_SECRET',
    required: true,
    validator: (v) => v.length > 0,
    errorMessage: 'Cannot be empty',
    description: 'Cloudinary API secret'
  },
  {
    name: 'RESEND_API_KEY',
    required: true,
    validator: (v) => v.startsWith('re_') && v.length > 3,
    errorMessage: 'Must be a valid Resend API key (starts with re_)',
    description: 'Resend API key for email'
  },
  {
    name: 'YOUTUBE_API_KEY',
    required: true,
    validator: (v) => v.length > 0,
    errorMessage: 'Cannot be empty',
    description: 'YouTube API key'
  },
  {
    name: 'GEMINI_API_KEY',
    required: true,
    validator: (v) => v.length > 0,
    errorMessage: 'Cannot be empty',
    description: 'Google Gemini API key for AI features'
  }
];

const optionalVars: EnvVar[] = [
  {
    name: 'COOKIE_DOMAIN',
    required: false,
    description: 'Cookie domain (e.g., .yourdomain.com)'
  },
  {
    name: 'SENTRY_DSN',
    required: false,
    validator: (v) => v.startsWith('https://'),
    errorMessage: 'Must be a valid Sentry DSN URL',
    description: 'Sentry error tracking DSN'
  },
  {
    name: 'PORT',
    required: false,
    validator: (v) => {
      const port = parseInt(v, 10);
      return !isNaN(port) && port > 0 && port < 65536;
    },
    errorMessage: 'Must be a valid port number (1-65535)',
    description: 'Server port'
  }
];

function validateEnvVar(envVar: EnvVar): { valid: boolean; error?: string } {
  const value = process.env[envVar.name];

  if (envVar.required && !value) {
    return {
      valid: false,
      error: `Required environment variable ${envVar.name} is not set`
    };
  }

  if (!value && !envVar.required) {
    return { valid: true };
  }

  if (value && envVar.validator) {
    const isValid = envVar.validator(value);
    if (!isValid) {
      return {
        valid: false,
        error: `${envVar.name}: ${envVar.errorMessage || 'Invalid value'}`
      };
    }
  }

  return { valid: true };
}

function main() {
  console.log('🔍 Validating environment variables...\n');

  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate required variables
  console.log('📋 Checking required variables:');
  for (const envVar of requiredVars) {
    const result = validateEnvVar(envVar);
    if (result.valid) {
      const value = process.env[envVar.name];
      const displayValue = envVar.name.includes('SECRET') || envVar.name.includes('KEY') || envVar.name.includes('PASSWORD')
        ? '*'.repeat(Math.min(value?.length || 0, 20))
        : value;
      console.log(`  ✅ ${envVar.name}: ${displayValue || '(not set)'}`);
    } else {
      errors.push(`${envVar.name}: ${result.error}`);
      console.log(`  ❌ ${envVar.name}: ${result.error}`);
    }
  }

  // Validate optional variables
  console.log('\n📋 Checking optional variables:');
  for (const envVar of optionalVars) {
    const result = validateEnvVar(envVar);
    const value = process.env[envVar.name];

    if (!value) {
      console.log(`  ⚠️  ${envVar.name}: Not set (optional)`);
      if (envVar.name === 'COOKIE_DOMAIN' && process.env.NODE_ENV === 'production') {
        warnings.push('COOKIE_DOMAIN is recommended for production');
      }
      if (envVar.name === 'SENTRY_DSN' && process.env.NODE_ENV === 'production') {
        warnings.push('SENTRY_DSN is recommended for production error tracking');
      }
    } else if (result.valid) {
      const displayValue = envVar.name.includes('SECRET') || envVar.name.includes('KEY') || envVar.name.includes('PASSWORD')
        ? '*'.repeat(Math.min(value.length, 20))
        : value;
      console.log(`  ✅ ${envVar.name}: ${displayValue}`);
    } else {
      warnings.push(`${envVar.name}: ${result.error}`);
      console.log(`  ⚠️  ${envVar.name}: ${result.error}`);
    }
  }

  // Production-specific checks
  if (process.env.NODE_ENV === 'production') {
    console.log('\n🔒 Production-specific checks:');

    if (process.env.NODE_ENV !== 'production') {
      errors.push('NODE_ENV must be "production" in production environment');
    }

    if (!process.env.COOKIE_DOMAIN) {
      warnings.push('COOKIE_DOMAIN should be set in production for cookie security');
    }

    if (process.env.CORS_ORIGIN?.includes('localhost')) {
      errors.push('CORS_ORIGIN should not include localhost in production');
    }

    if (process.env.FRONTEND_URL?.includes('localhost')) {
      errors.push('FRONTEND_URL should not include localhost in production');
    }

    if (!process.env.SENTRY_DSN) {
      warnings.push('SENTRY_DSN is recommended for production error tracking');
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ All environment variables are valid!');
    process.exit(0);
  } else {
    if (errors.length > 0) {
      console.log(`\n❌ Found ${errors.length} error(s):`);
      errors.forEach(error => console.log(`   - ${error}`));
    }
    if (warnings.length > 0) {
      console.log(`\n⚠️  Found ${warnings.length} warning(s):`);
      warnings.forEach(warning => console.log(`   - ${warning}`));
    }
    console.log('\n💡 Please fix the errors before deploying to production.');
    process.exit(errors.length > 0 ? 1 : 0);
  }
}

main();

