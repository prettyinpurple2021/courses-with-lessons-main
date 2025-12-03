# Seed Script Validation

## Overview

The `prisma:seed` script now includes validation to prevent creating broken database states. Specifically, it validates that all final exams have questions before completing.

## Behavior

### Production Mode (`NODE_ENV=production`)

**The seed script will FAIL if any exam has no questions.**

This prevents deploying to production with broken exams that students cannot complete.

**Error Example:**
```
❌ VALIDATION FAILED: 7 exam(s) have no questions!

This leaves the database in a non-functional state where students cannot complete courses.

🔧 TO FIX THIS:
  npm run content:setup-production
```

### Development Mode

**The seed script will WARN but continue if exams have no questions.**

This allows development workflows while still alerting you to the issue.

**Warning Example:**
```
⚠️  WARNING: 7 exam(s) have no questions!
⚠️  Continuing in development mode, but this should be fixed before production deployment.
```

## Usage

### Standard Seeding (with validation)

```bash
npm run prisma:seed --workspace=backend
```

### Development Seeding (skip validation)

```bash
npm run prisma:seed:dev --workspace=backend
```

Or manually:
```bash
SKIP_EXAM_VALIDATION=true npm run prisma:seed --workspace=backend
```

### Production Setup (Recommended)

For production, always use the complete setup script:

```bash
npm run content:setup-production
```

This ensures:
1. Database is seeded
2. Videos are updated
3. Exam questions are added
4. All validation passes

## Why This Matters

**Before this fix:**
- Seed script could create empty exams silently
- Production deployments could have broken functionality
- Students couldn't complete courses
- No clear error message or guidance

**After this fix:**
- Seed script validates exam completeness
- Production deployments fail fast with clear errors
- Development workflows still work (with warnings)
- Clear instructions provided to fix issues

## Environment Variables

- `NODE_ENV=production` - Enables strict validation (fails on empty exams)
- `SKIP_EXAM_VALIDATION=true` - Skips validation (development only)

## Migration Guide

If you have existing code that runs `prisma:seed`:

1. **For production:** Use `npm run content:setup-production` instead
2. **For development:** Use `npm run prisma:seed:dev` if you need empty exams temporarily
3. **For CI/CD:** Ensure `NODE_ENV=production` is set to catch issues early

