#!/usr/bin/env tsx
/**
 * YouTube Video Verification Script
 * 
 * Verifies all YouTube video IDs in the database are valid and accessible.
 * 
 * Usage: tsx scripts/verify-youtube-videos.ts
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
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

interface VideoStatus {
  videoId: string;
  lessonTitle: string;
  courseTitle: string;
  valid: boolean;
  error?: string;
  title?: string;
}

async function validateVideoBatch(videoIds: string[]): Promise<Map<string, VideoStatus>> {
  const results = new Map<string, VideoStatus>();

  if (!YOUTUBE_API_KEY) {
    console.log('⚠️  YouTube API key not configured. Cannot validate videos.');
    return results;
  }

  // YouTube API allows up to 50 IDs per request
  const batchSize = 50;
  
  for (let i = 0; i < videoIds.length; i += batchSize) {
    const batch = videoIds.slice(i, i + batchSize);
    
    try {
      const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
        params: {
          part: 'snippet,status',
          id: batch.join(','),
          key: YOUTUBE_API_KEY,
        },
        timeout: 10000,
      });

      // Mark all as invalid initially
      batch.forEach(id => {
        results.set(id, {
          videoId: id,
          lessonTitle: '',
          courseTitle: '',
          valid: false,
          error: 'Not found in API response',
        });
      });

      // Update valid videos
      if (response.data.items) {
        response.data.items.forEach((video: any) => {
          const isValid = 
            video.status.embeddable &&
            video.status.privacyStatus !== 'private' &&
            video.status.privacyStatus !== 'unlisted';

          results.set(video.id, {
            videoId: video.id,
            lessonTitle: '',
            courseTitle: '',
            valid: isValid,
            title: video.snippet.title,
            error: isValid ? undefined : `Privacy: ${video.status.privacyStatus}, Embeddable: ${video.status.embeddable}`,
          });
        });
      }

      // Small delay to avoid rate limiting
      if (i + batchSize < videoIds.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error: any) {
      if (error.response?.status === 403) {
        console.error('❌ YouTube API error: Invalid API key or quota exceeded');
        batch.forEach(id => {
          results.set(id, {
            videoId: id,
            lessonTitle: '',
            courseTitle: '',
            valid: false,
            error: 'API error: Invalid key or quota exceeded',
          });
        });
      } else {
        console.error(`❌ Error validating batch: ${error.message}`);
        batch.forEach(id => {
          results.set(id, {
            videoId: id,
            lessonTitle: '',
            courseTitle: '',
            valid: false,
            error: error.message,
          });
        });
      }
    }
  }

  return results;
}

async function main() {
  console.log('🎥 YouTube Video Verification\n');
  console.log('='.repeat(60));

  if (!YOUTUBE_API_KEY) {
    console.log('❌ YOUTUBE_API_KEY not set in environment variables');
    console.log('   Cannot validate videos without API key.\n');
    await prisma.$disconnect();
    process.exit(1);
  }

  try {
    // Get all lessons with their courses
    const lessons = await prisma.lesson.findMany({
      include: {
        course: {
          select: {
            title: true,
            courseNumber: true,
          },
        },
      },
      orderBy: [
        { course: { courseNumber: 'asc' } },
        { lessonNumber: 'asc' },
      ],
    });

    if (lessons.length === 0) {
      console.log('❌ No lessons found in database');
      console.log('   Run: npm run prisma:seed\n');
      await prisma.$disconnect();
      process.exit(1);
    }

    console.log(`\n📊 Found ${lessons.length} lessons to verify\n`);

    // Extract unique video IDs
    const videoIds = [...new Set(lessons.map(l => l.youtubeVideoId).filter(Boolean))];
    console.log(`📹 Verifying ${videoIds.length} unique video IDs...\n`);

    // Validate all videos
    const validationResults = await validateVideoBatch(videoIds);

    // Map results back to lessons
    const lessonResults: Array<{
      course: string;
      lesson: string;
      videoId: string;
      status: VideoStatus;
    }> = [];

    for (const lesson of lessons) {
      const status = validationResults.get(lesson.youtubeVideoId) || {
        videoId: lesson.youtubeVideoId,
        lessonTitle: lesson.title,
        courseTitle: lesson.course.title,
        valid: false,
        error: 'Video ID not validated',
      };

      lessonResults.push({
        course: `Course ${lesson.course.courseNumber}: ${lesson.course.title}`,
        lesson: `Lesson ${lesson.lessonNumber}: ${lesson.title}`,
        videoId: lesson.youtubeVideoId,
        status: {
          ...status,
          lessonTitle: lesson.title,
          courseTitle: lesson.course.title,
        },
      });
    }

    // Report results
    const valid = lessonResults.filter(r => r.status.valid).length;
    const invalid = lessonResults.filter(r => !r.status.valid).length;

    console.log('='.repeat(60));
    console.log('\n📊 Results:\n');
    console.log(`✅ Valid: ${valid}`);
    console.log(`❌ Invalid: ${invalid}\n`);

    if (invalid > 0) {
      console.log('❌ Invalid Videos:\n');
      lessonResults
        .filter(r => !r.status.valid)
        .forEach(r => {
          console.log(`   ${r.course}`);
          console.log(`   ${r.lesson}`);
          console.log(`   Video ID: ${r.videoId}`);
          console.log(`   Error: ${r.status.error || 'Unknown error'}`);
          if (r.status.title) {
            console.log(`   Title: ${r.status.title}`);
          }
          console.log('');
        });
    }

    // Summary by course
    console.log('\n📋 Summary by Course:\n');
    const courses = new Map<string, { valid: number; invalid: number }>();
    
    for (const result of lessonResults) {
      const courseKey = result.course;
      if (!courses.has(courseKey)) {
        courses.set(courseKey, { valid: 0, invalid: 0 });
      }
      const course = courses.get(courseKey)!;
      if (result.status.valid) {
        course.valid++;
      } else {
        course.invalid++;
      }
    }

    for (const [course, stats] of courses.entries()) {
      const total = stats.valid + stats.invalid;
      const status = stats.invalid === 0 ? '✅' : stats.invalid === total ? '❌' : '⚠️';
      console.log(`${status} ${course}: ${stats.valid}/${total} valid`);
    }

    await prisma.$disconnect();

    if (invalid > 0) {
      console.log('\n❌ Some videos are invalid. Please update them before production.\n');
      process.exit(1);
    } else {
      console.log('\n✅ All videos are valid!\n');
      process.exit(0);
    }
  } catch (error: any) {
    console.error('❌ Fatal error:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();

