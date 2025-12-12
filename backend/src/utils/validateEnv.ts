/**
 * Environment Variable Validation Utility
 * 
 * Validates that all required environment variables are set and have valid values.
 * This should be called at server startup to fail fast if configuration is invalid.
 */

import { logger } from './logger.js';

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
    name: 'REDIS_URL',
    required: false,
    validator: (v) => v.startsWith('redis://') || v.startsWith('rediss://'),
    errorMessage: 'Must be a valid Redis connection string',
    description: 'Redis connection URL'
  },
  {
    name: 'FRONTEND_URL',
    required: false,
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
    name: 'COOKIE_DOMAIN',
    required: false,
    description: 'Cookie domain (e.g., .yourdomain.com)'
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

/**
 * Validate all environment variables
 * Throws an error if validation fails
 */
export function validateEnvironment(): void {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate required variables
  for (const envVar of requiredVars) {
    const result = validateEnvVar(envVar);
    if (!result.valid) {
      errors.push(`${envVar.name}: ${result.error}`);
    }
  }

  // Validate optional variables
  for (const envVar of optionalVars) {
    const result = validateEnvVar(envVar);
    const value = process.env[envVar.name];

    if (!value) {
      if (envVar.name === 'COOKIE_DOMAIN' && process.env.NODE_ENV === 'production') {
        warnings.push('COOKIE_DOMAIN is recommended for production');
      }
    } else if (!result.valid) {
      warnings.push(`${envVar.name}: ${result.error}`);
    }
  }

  // Production-specific checks
  if (process.env.NODE_ENV === 'production') {
    // Check for default/placeholder values in production
    if (process.env.JWT_SECRET === 'your-super-secret-jwt-key-change-this-in-production') {
      errors.push('JWT_SECRET must be changed from default value in production');
    }
    if (process.env.JWT_REFRESH_SECRET === 'your-super-secret-refresh-key-change-this-in-production') {
      errors.push('JWT_REFRESH_SECRET must be changed from default value in production');
    }
  }

  // If there are errors, throw with details
  if (errors.length > 0) {
    const errorMessage = [
      '❌ Environment variable validation failed:',
      ...errors.map(e => `  - ${e}`),
      ...(warnings.length > 0 ? ['', '⚠️  Warnings:', ...warnings.map(w => `  - ${w}`)] : []),
      '',
      'Please check your .env file and ensure all required variables are set correctly.',
      'See backend/env.example for reference.'
    ].join('\n');

    throw new Error(errorMessage);
  }

  // Log warnings if any
  if (warnings.length > 0 && process.env.NODE_ENV !== 'production') {
    logger.warn('⚠️  Environment variable warnings:');
    warnings.forEach(w => logger.warn(`  - ${w}`));
  }
}

