#!/usr/bin/env tsx
/**
 * Video-to-Lesson Alignment Verification Script
 * 
 * Verifies that YouTube videos match their lesson content by:
 * 1. Validating video IDs exist and are accessible
 * 2. Comparing video titles/descriptions with lesson titles
 * 3. Providing alignment scores and recommendations
 * 4. Optionally searching for better video matches
 * 
 * Usage: tsx scripts/verify-video-lesson-alignment.ts [--search-better]
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
const SEARCH_BETTER = process.argv.includes('--search-better');

interface VideoInfo {
  videoId: string;
  title: string;
  description: string;
  channelTitle: string;
  publishedAt: string;
  valid: boolean;
  error?: string;
}

interface AlignmentResult {
  courseNumber: number;
  courseTitle: string;
  lessonNumber: number;
  lessonTitle: string;
  videoId: string;
  videoTitle: string;
  alignmentScore: number;
  alignmentIssues: string[];
  recommendations?: string[];
}

/**
 * Extract keywords from text for matching
 */
function extractKeywords(text: string): string[] {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be',
    'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
    'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this',
    'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
  ]);

  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));
}

/**
 * Calculate alignment score between lesson title and video title/description
 */
function calculateAlignmentScore(
  lessonTitle: string,
  videoTitle: string,
  videoDescription: string
): { score: number; issues: string[] } {
  const issues: string[] = [];
  let score = 0;

  const lessonKeywords = extractKeywords(lessonTitle);
  const videoTitleKeywords = extractKeywords(videoTitle);
  const videoDescKeywords = extractKeywords(videoDescription.substring(0, 500)); // First 500 chars

  // Check keyword overlap
  const titleMatches = lessonKeywords.filter(kw => videoTitleKeywords.includes(kw)).length;
  const descMatches = lessonKeywords.filter(kw => videoDescKeywords.includes(kw)).length;

  // Score based on keyword matches
  const titleMatchRatio = lessonKeywords.length > 0 ? titleMatches / lessonKeywords.length : 0;
  const descMatchRatio = lessonKeywords.length > 0 ? descMatches / lessonKeywords.length : 0;

  score = (titleMatchRatio * 0.7 + descMatchRatio * 0.3) * 100;

  // Check for specific issues
  if (titleMatchRatio < 0.3) {
    issues.push('Very few keywords match between lesson title and video title');
  }
  if (descMatchRatio < 0.2) {
    issues.push('Video description does not align well with lesson content');
  }
  if (score < 30) {
    issues.push('Poor alignment - video may not match lesson content');
  }
  if (score >= 30 && score < 60) {
    issues.push('Moderate alignment - video may be partially relevant');
  }

  return { score: Math.round(score), issues };
}

/**
 * Fetch video information from YouTube API
 */
async function fetchVideoInfo(videoId: string): Promise<VideoInfo | null> {
  if (!YOUTUBE_API_KEY) {
    return {
      videoId,
      title: 'Unknown',
      description: '',
      channelTitle: 'Unknown',
      publishedAt: '',
      valid: false,
      error: 'YouTube API key not configured',
    };
  }

  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
      params: {
        part: 'snippet,status',
        id: videoId,
        key: YOUTUBE_API_KEY,
      },
      timeout: 10000,
    });

    if (!response.data.items || response.data.items.length === 0) {
      return {
        videoId,
        title: 'Unknown',
        description: '',
        channelTitle: 'Unknown',
        publishedAt: '',
        valid: false,
        error: 'Video not found',
      };
    }

    const video = response.data.items[0];
    const isValid =
      video.status.embeddable &&
      video.status.privacyStatus === 'public';

    return {
      videoId,
      title: video.snippet.title,
      description: video.snippet.description,
      channelTitle: video.snippet.channelTitle,
      publishedAt: video.snippet.publishedAt,
      valid: isValid,
      error: isValid ? undefined : `Privacy: ${video.status.privacyStatus}, Embeddable: ${video.status.embeddable}`,
    };
  } catch (error: any) {
    return {
      videoId,
      title: 'Unknown',
      description: '',
      channelTitle: 'Unknown',
      publishedAt: '',
      valid: false,
      error: error.response?.status === 403
        ? 'API key invalid or quota exceeded'
        : error.message,
    };
  }
}

/**
 * Search for better video matches using YouTube API
 */
async function searchBetterVideos(
  lessonTitle: string,
  maxResults: number = 5
): Promise<Array<{ videoId: string; title: string; description: string }>> {
  if (!YOUTUBE_API_KEY) {
    return [];
  }

  try {
    // Create search query from lesson title
    const searchQuery = lessonTitle
      .replace(/:/g, ' ')
      .replace(/[^\w\s]/g, ' ')
      .substring(0, 100); // YouTube API limit

    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: searchQuery + ' tutorial educational',
        type: 'video',
        maxResults,
        key: YOUTUBE_API_KEY,
        videoDuration: 'medium', // Prefer 4-20 minute videos
        videoCategoryId: '27', // Education category
        order: 'relevance',
      },
      timeout: 10000,
    });

    if (!response.data.items) {
      return [];
    }

    return response.data.items.map((item: any) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
    }));
  } catch (error: any) {
    console.error(`Error searching for videos: ${error.message}`);
    return [];
  }
}

/**
 * Main verification function
 */
async function main() {
  console.log('🎥 Video-to-Lesson Alignment Verification\n');
  console.log('='.repeat(70));

  if (!YOUTUBE_API_KEY) {
    console.log('❌ YOUTUBE_API_KEY not set in environment variables');
    console.log('   Cannot verify alignment without API key.\n');
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

    console.log(`\n📊 Analyzing ${lessons.length} lessons for video alignment...\n`);

    const results: AlignmentResult[] = [];
    let processed = 0;

    // Process lessons in batches to avoid rate limiting
    for (const lesson of lessons) {
      processed++;
      process.stdout.write(`\r⏳ Processing ${processed}/${lessons.length}...`);

      const videoInfo = await fetchVideoInfo(lesson.youtubeVideoId);

      if (!videoInfo) {
        results.push({
          courseNumber: lesson.course.courseNumber,
          courseTitle: lesson.course.title,
          lessonNumber: lesson.lessonNumber,
          lessonTitle: lesson.title,
          videoId: lesson.youtubeVideoId,
          videoTitle: 'Unknown',
          alignmentScore: 0,
          alignmentIssues: ['Could not fetch video information'],
        });
        continue;
      }

      if (!videoInfo.valid) {
        results.push({
          courseNumber: lesson.course.courseNumber,
          courseTitle: lesson.course.title,
          lessonNumber: lesson.lessonNumber,
          lessonTitle: lesson.title,
          videoId: lesson.youtubeVideoId,
          videoTitle: videoInfo.title,
          alignmentScore: 0,
          alignmentIssues: [videoInfo.error || 'Video is not accessible'],
        });
        continue;
      }

      const { score, issues } = calculateAlignmentScore(
        lesson.title,
        videoInfo.title,
        videoInfo.description
      );

      const result: AlignmentResult = {
        courseNumber: lesson.course.courseNumber,
        courseTitle: lesson.course.title,
        lessonNumber: lesson.lessonNumber,
        lessonTitle: lesson.title,
        videoId: lesson.youtubeVideoId,
        videoTitle: videoInfo.title,
        alignmentScore: score,
        alignmentIssues: issues,
      };

      // Search for better videos if requested and alignment is poor
      if (SEARCH_BETTER && score < 60) {
        const betterVideos = await searchBetterVideos(lesson.title);
        if (betterVideos.length > 0) {
          const scoredVideos = betterVideos.map(v => ({
            videoId: v.videoId,
            title: v.title,
            score: calculateAlignmentScore(lesson.title, v.title, v.description).score,
          })).sort((a, b) => b.score - a.score).slice(0, 3);
          
          result.recommendations = scoredVideos.map(v => 
            `Video ID: ${v.videoId} | Score: ${v.score} | "${v.title}"`
          );
        }
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      results.push(result);
    }

    console.log('\n\n' + '='.repeat(70));
    console.log('\n📊 Alignment Results:\n');

    // Group by alignment score
    const excellent = results.filter(r => r.alignmentScore >= 80);
    const good = results.filter(r => r.alignmentScore >= 60 && r.alignmentScore < 80);
    const moderate = results.filter(r => r.alignmentScore >= 40 && r.alignmentScore < 60);
    const poor = results.filter(r => r.alignmentScore < 40);

    console.log(`✅ Excellent (80-100): ${excellent.length}`);
    console.log(`🟢 Good (60-79): ${good.length}`);
    console.log(`🟡 Moderate (40-59): ${moderate.length}`);
    console.log(`🔴 Poor (0-39): ${poor.length}\n`);

    // Show poor alignments
    if (poor.length > 0) {
      console.log('🔴 Poor Alignment Issues:\n');
      poor.forEach(result => {
        console.log(`Course ${result.courseNumber}: ${result.courseTitle}`);
        console.log(`  Lesson ${result.lessonNumber}: ${result.lessonTitle}`);
        console.log(`  Video: ${result.videoTitle}`);
        console.log(`  Alignment Score: ${result.alignmentScore}/100`);
        console.log(`  Issues:`);
        result.alignmentIssues.forEach(issue => console.log(`    - ${issue}`));
        if (result.recommendations && result.recommendations.length > 0) {
          console.log(`  Recommendations:`);
          result.recommendations.forEach(rec => console.log(`    - ${rec}`));
        }
        console.log('');
      });
    }

    // Show moderate alignments
    if (moderate.length > 0 && moderate.length <= 20) {
      console.log('🟡 Moderate Alignment (Review Recommended):\n');
      moderate.forEach(result => {
        console.log(`Course ${result.courseNumber}, Lesson ${result.lessonNumber}: ${result.lessonTitle}`);
        console.log(`  Video: ${result.videoTitle} (Score: ${result.alignmentScore}/100)`);
        if (result.recommendations && result.recommendations.length > 0) {
          console.log(`  Better options available (use --search-better to see all)`);
        }
        console.log('');
      });
    }

    // Summary by course
    console.log('\n📋 Summary by Course:\n');
    const courseStats = new Map<number, { excellent: number; good: number; moderate: number; poor: number; total: number }>();

    results.forEach(result => {
      if (!courseStats.has(result.courseNumber)) {
        courseStats.set(result.courseNumber, { excellent: 0, good: 0, moderate: 0, poor: 0, total: 0 });
      }
      const stats = courseStats.get(result.courseNumber)!;
      stats.total++;
      if (result.alignmentScore >= 80) stats.excellent++;
      else if (result.alignmentScore >= 60) stats.good++;
      else if (result.alignmentScore >= 40) stats.moderate++;
      else stats.poor++;
    });

    for (const [courseNum, stats] of courseStats.entries()) {
      const course = results.find(r => r.courseNumber === courseNum);
      const avgScore = results
        .filter(r => r.courseNumber === courseNum)
        .reduce((sum, r) => sum + r.alignmentScore, 0) / stats.total;
      
      const status = stats.poor === 0 && stats.moderate === 0 ? '✅' :
                     stats.poor === 0 ? '🟡' : '🔴';
      
      console.log(`${status} Course ${courseNum}: ${course?.courseTitle || 'Unknown'}`);
      console.log(`   Average Score: ${Math.round(avgScore)}/100`);
      console.log(`   Excellent: ${stats.excellent}, Good: ${stats.good}, Moderate: ${stats.moderate}, Poor: ${stats.poor}`);
      console.log('');
    }

    await prisma.$disconnect();

    const hasIssues = poor.length > 0 || moderate.length > 0;
    if (hasIssues) {
      console.log('⚠️  Some videos have alignment issues. Review the recommendations above.\n');
      if (!SEARCH_BETTER) {
        console.log('💡 Tip: Run with --search-better flag to see video recommendations.\n');
      }
      process.exit(1);
    } else {
      console.log('✅ All videos are well-aligned with their lessons!\n');
      process.exit(0);
    }
  } catch (error: any) {
    console.error('\n❌ Fatal error:', error.message);
    console.error(error.stack);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();

