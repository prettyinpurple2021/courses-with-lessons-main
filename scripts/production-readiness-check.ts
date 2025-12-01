#!/usr/bin/env tsx
/**
 * Production Readiness Check
 * 
 * Comprehensive script to verify all production requirements are met.
 * Run this before deploying to production.
 * 
 * Usage: tsx scripts/production-readiness-check.ts
 */

import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import dotenv from 'dotenv';
import { existsSync } from 'fs';
import { join } from 'path';

// Load environment variables
const envPath = join(process.cwd(), 'backend', '.env');
if (existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const prisma = new PrismaClient();

interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string;
}

const results: CheckResult[] = [];

function addResult(name: string, status: 'pass' | 'fail' | 'warning', message: string, details?: string) {
  results.push({ name, status, message, details });
}

async function checkEnvironmentVariables() {
  console.log('\n📋 Checking Environment Variables...\n');

  const required = [
    { name: 'NODE_ENV', validator: (v: string) => v === 'production' },
    { name: 'DATABASE_URL', validator: (v: string) => v.startsWith('postgresql://') },
    { name: 'JWT_SECRET', validator: (v: string) => v.length >= 32 && !v.includes('change-this') },
    { name: 'JWT_REFRESH_SECRET', validator: (v: string) => v.length >= 32 && !v.includes('change-this') },
    { name: 'CORS_ORIGIN', validator: (v: string) => v.startsWith('https://') && !v.includes('localhost') },
    { name: 'FRONTEND_URL', validator: (v: string) => v.startsWith('https://') && !v.includes('localhost') },
    { name: 'CLOUDINARY_CLOUD_NAME', validator: (v: string) => v.length > 0 },
    { name: 'CLOUDINARY_API_KEY', validator: (v: string) => v.length > 0 },
    { name: 'CLOUDINARY_API_SECRET', validator: (v: string) => v.length > 0 },
    { name: 'RESEND_API_KEY', validator: (v: string) => v.startsWith('re_') },
    { name: 'YOUTUBE_API_KEY', validator: (v: string) => v.length > 0 },
  ];

  const optional = [
    { name: 'SENTRY_DSN', validator: (v: string) => v.startsWith('https://') },
    { name: 'REDIS_URL', validator: (v: string) => v.startsWith('redis://') },
    { name: 'COOKIE_DOMAIN', validator: () => true },
  ];

  let allPassed = true;

  for (const env of required) {
    const value = process.env[env.name];
    if (!value) {
      let details = 'Required for production';
      if (env.name === 'NODE_ENV') {
        details = 'Set to "production" for production deployment';
      } else if (env.name === 'CORS_ORIGIN' || env.name === 'FRONTEND_URL') {
        details = 'Must use HTTPS URL (e.g., https://yourdomain.com) - no localhost';
      }
      addResult(`Env: ${env.name}`, 'fail', 'Not set', details);
      allPassed = false;
    } else if (!env.validator(value)) {
      let details = 'Check configuration';
      if (env.name === 'NODE_ENV') {
        details = `Current value: "${value}". Must be "production" for production deployment`;
      } else if (env.name === 'CORS_ORIGIN' || env.name === 'FRONTEND_URL') {
        details = `Current value: "${value}". Must start with "https://" and not contain "localhost". Example: https://yourdomain.com`;
      } else if (env.name === 'JWT_SECRET' || env.name === 'JWT_REFRESH_SECRET') {
        details = 'Must be at least 32 characters long and not contain "change-this"';
      } else if (env.name === 'RESEND_API_KEY') {
        details = 'Must start with "re_"';
      }
      addResult(`Env: ${env.name}`, 'fail', 'Invalid value', details);
      allPassed = false;
    } else {
      addResult(`Env: ${env.name}`, 'pass', 'Valid');
    }
  }

  for (const env of optional) {
    const value = process.env[env.name];
    if (!value) {
      if (env.name === 'SENTRY_DSN') {
        addResult(`Env: ${env.name}`, 'warning', 'Not set', 'Recommended for production error tracking');
      } else {
        addResult(`Env: ${env.name}`, 'pass', 'Not set (optional)');
      }
    } else if (env.validator(value)) {
      addResult(`Env: ${env.name}`, 'pass', 'Valid');
    } else {
      addResult(`Env: ${env.name}`, 'warning', 'Invalid value', 'Check configuration');
    }
  }

  return allPassed;
}

async function checkDatabase() {
  console.log('\n📋 Checking Database...\n');

  try {
    await prisma.$connect();
    addResult('Database Connection', 'pass', 'Connected successfully');

    // Check migrations
    const migrations = await prisma.$queryRaw<Array<{ migration_name: string }>>`
      SELECT migration_name FROM _prisma_migrations ORDER BY finished_at DESC LIMIT 1
    `.catch(() => []);
    
    if (migrations.length > 0) {
      addResult('Database Migrations', 'pass', 'Migrations applied');
    } else {
      addResult('Database Migrations', 'warning', 'No migrations found', 'Run: npm run prisma:migrate deploy');
    }

    // Check data
    const courseCount = await prisma.course.count();
    const lessonCount = await prisma.lesson.count();
    const activityCount = await prisma.activity.count();

    if (courseCount === 0) {
      addResult('Database Content', 'fail', 'No courses found', 'Run: npm run prisma:seed');
      return false;
    }

    if (courseCount !== 7) {
      addResult('Database Content', 'warning', `Found ${courseCount} courses (expected 7)`, 'Verify course data');
    } else {
      addResult('Database Content', 'pass', `Found ${courseCount} courses, ${lessonCount} lessons, ${activityCount} activities`);
    }

    // Check for invalid YouTube video IDs
    const lessons = await prisma.lesson.findMany({
      select: { id: true, youtubeVideoId: true, title: true },
      take: 10, // Sample check
    });

    const invalidVideos = lessons.filter(l => 
      !l.youtubeVideoId || 
      l.youtubeVideoId.length !== 11 || 
      l.youtubeVideoId === 'placeholder' ||
      l.youtubeVideoId === 'dQw4w9WgXcQ' // Rick Roll placeholder
    );

    if (invalidVideos.length > 0) {
      addResult('YouTube Videos', 'warning', `Found ${invalidVideos.length} potentially invalid video IDs`, 'Verify all video IDs are valid');
    } else {
      addResult('YouTube Videos', 'pass', 'Video IDs appear valid (sample check)');
    }

    return true;
  } catch (error: any) {
    addResult('Database Connection', 'fail', 'Connection failed', error.message);
    return false;
  }
}

async function checkYouTubeVideos() {
  console.log('\n📋 Checking YouTube Videos...\n');

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    addResult('YouTube API Validation', 'warning', 'API key not set', 'Cannot validate videos without API key');
    return;
  }

  try {
    // Get all lessons with video IDs
    const lessons = await prisma.lesson.findMany({
      select: { youtubeVideoId: true, title: true },
      take: 5, // Sample check to avoid API limits
    });

    if (lessons.length === 0) {
      addResult('YouTube API Validation', 'warning', 'No lessons found', 'Seed database first');
      return;
    }

    const videoIds = lessons.map(l => l.youtubeVideoId).filter(Boolean);
    
    // Batch validate (YouTube allows up to 50 per request)
    const batch = videoIds.slice(0, 5);
    const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
      params: {
        part: 'status',
        id: batch.join(','),
        key: apiKey,
      },
      timeout: 5000,
    });

    const validVideos = response.data.items?.filter((v: any) => 
      v.status.embeddable && v.status.privacyStatus !== 'private'
    ).length || 0;

    if (validVideos === batch.length) {
      addResult('YouTube API Validation', 'pass', `All ${batch.length} sampled videos are valid`);
    } else {
      addResult('YouTube API Validation', 'warning', `${validVideos}/${batch.length} videos are valid`, 'Some videos may be invalid or private');
    }
  } catch (error: any) {
    if (error.response?.status === 403) {
      addResult('YouTube API Validation', 'fail', 'API key invalid or quota exceeded', 'Check YouTube API key and quota');
    } else {
      addResult('YouTube API Validation', 'warning', 'Validation failed', error.message);
    }
  }
}

async function checkExternalServices() {
  console.log('\n📋 Checking External Services...\n');

  // Check Cloudinary
  const cloudinaryName = process.env.CLOUDINARY_CLOUD_NAME;
  if (cloudinaryName) {
    try {
      const response = await axios.get(`https://res.cloudinary.com/${cloudinaryName}/image/upload/v1/test`, {
        timeout: 3000,
        validateStatus: () => true, // Don't throw on 404
      });
      addResult('Cloudinary', 'pass', 'Cloudinary accessible');
    } catch (error) {
      addResult('Cloudinary', 'warning', 'Could not verify Cloudinary', 'Check configuration');
    }
  } else {
    addResult('Cloudinary', 'fail', 'Not configured');
  }

  // Check Resend (can't easily test without sending email, so just check format)
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey && resendKey.startsWith('re_')) {
    addResult('Resend', 'pass', 'API key format valid');
  } else if (resendKey) {
    addResult('Resend', 'warning', 'API key format may be invalid', 'Should start with "re_"');
  } else {
    addResult('Resend', 'fail', 'Not configured');
  }
}

async function checkSecurity() {
  console.log('\n📋 Checking Security Configuration...\n');

  // Check JWT secrets
  const jwtSecret = process.env.JWT_SECRET;
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;

  if (jwtSecret && jwtSecret.length >= 32 && !jwtSecret.includes('change-this')) {
    addResult('JWT Secrets', 'pass', 'Secrets are strong');
  } else {
    addResult('JWT Secrets', 'fail', 'JWT secrets are weak or default', 'Generate strong random secrets');
  }

  // Check HTTPS
  const corsOrigin = process.env.CORS_ORIGIN;
  if (corsOrigin && corsOrigin.startsWith('https://')) {
    addResult('HTTPS Configuration', 'pass', 'CORS origin uses HTTPS');
  } else {
    addResult('HTTPS Configuration', 'fail', 'CORS origin does not use HTTPS', 'Production must use HTTPS');
  }

  // Check Sentry
  if (process.env.SENTRY_DSN) {
    addResult('Error Tracking', 'pass', 'Sentry configured');
  } else {
    addResult('Error Tracking', 'warning', 'Sentry not configured', 'Recommended for production');
  }
}

async function checkContent() {
  console.log('\n📋 Checking Content...\n');

  try {
    const courses = await prisma.course.findMany({
      include: {
        lessons: {
          include: {
            activities: true,
          },
        },
        finalProject: true,
        finalExam: true,
      },
    });

    if (courses.length === 0) {
      addResult('Content: Courses', 'fail', 'No courses found', 'Run: npm run prisma:seed');
      return;
    }

    // Check each course has required content
    for (const course of courses) {
      if (course.lessons.length !== 12) {
        addResult(`Content: ${course.title}`, 'warning', `Has ${course.lessons.length} lessons (expected 12)`);
      } else {
        addResult(`Content: ${course.title}`, 'pass', 'Has 12 lessons');
      }

      // Check activities
      const totalActivities = course.lessons.reduce((sum, lesson) => sum + lesson.activities.length, 0);
      if (totalActivities === 0) {
        addResult(`Content: ${course.title} Activities`, 'warning', 'No activities found');
      } else {
        addResult(`Content: ${course.title} Activities`, 'pass', `Has ${totalActivities} activities`);
      }

      // Check final project and exam
      if (!course.finalProject) {
        addResult(`Content: ${course.title} Final Project`, 'warning', 'No final project');
      } else {
        addResult(`Content: ${course.title} Final Project`, 'pass', 'Final project exists');
      }

      if (!course.finalExam) {
        addResult(`Content: ${course.title} Final Exam`, 'warning', 'No final exam');
      } else {
        addResult(`Content: ${course.title} Final Exam`, 'pass', 'Final exam exists');
      }
    }
  } catch (error: any) {
    addResult('Content Check', 'fail', 'Failed to check content', error.message);
  }
}

async function main() {
  console.log('🚀 Production Readiness Check\n');
  console.log('='.repeat(60));

  await checkEnvironmentVariables();
  await checkDatabase();
  await checkYouTubeVideos();
  await checkExternalServices();
  await checkSecurity();
  await checkContent();

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Summary:\n');

  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const warnings = results.filter(r => r.status === 'warning').length;

  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️  Warnings: ${warnings}\n`);

  if (failed > 0) {
    console.log('❌ Critical Issues (must fix before production):\n');
    results
      .filter(r => r.status === 'fail')
      .forEach(r => {
        console.log(`   ${r.name}: ${r.message}`);
        if (r.details) console.log(`      → ${r.details}`);
      });
  }

  if (warnings > 0) {
    console.log('\n⚠️  Warnings (recommended to fix):\n');
    results
      .filter(r => r.status === 'warning')
      .forEach(r => {
        console.log(`   ${r.name}: ${r.message}`);
        if (r.details) console.log(`      → ${r.details}`);
      });
  }

  if (failed === 0 && warnings === 0) {
    console.log('🎉 All checks passed! Ready for production deployment.\n');
  } else if (failed === 0) {
    console.log('✅ No critical issues. Review warnings before deploying.\n');
  } else {
    console.log('\n❌ Please fix critical issues before deploying to production.\n');
  }

  await prisma.$disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

