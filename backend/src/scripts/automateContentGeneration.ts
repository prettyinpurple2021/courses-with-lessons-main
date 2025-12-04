/**
 * Automated Content Generation Script
 * 
 * This script uses AI to automatically generate interactive activities for lessons.
 * 
 * Usage:
 *   npm run generate-content -- --lesson-id <lessonId>
 *   npm run generate-content -- --course-id <courseId>
 *   npm run generate-content -- --all
 *   npm run generate-content -- --lesson-id <lessonId> --dry-run
 */

import dotenv from 'dotenv';
import { existsSync } from 'fs';
import { join } from 'path';
import { PrismaClient } from '@prisma/client';
import * as contentGenerationService from '../services/contentGenerationService.js';
import { adminCourseService } from '../services/adminCourseService.js';

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

const prisma = new PrismaClient();

interface GenerationOptions {
  lessonId?: string;
  courseId?: string;
  all?: boolean;
  dryRun?: boolean;
  activityPlan?: Array<{ type: contentGenerationService.ActivityType; position?: 'opening' | 'mid' | 'closing' }>;
}

/**
 * Generate activities for a single lesson
 */
async function generateForLesson(
  lessonId: string,
  options: { dryRun?: boolean; activityPlan?: Array<{ type: contentGenerationService.ActivityType; position?: 'opening' | 'mid' | 'closing' }> }
): Promise<void> {
  console.log(`\n🔍 Looking up lesson: ${lessonId}...`);
  
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      course: {
        select: {
          courseNumber: true,
          title: true,
        },
      },
      activities: {
        orderBy: { activityNumber: 'asc' },
      },
    },
  });

  if (!lesson) {
    console.error(`\n❌ Lesson not found: ${lessonId}`);
    throw new Error(`Lesson not found: ${lessonId}`);
  }

  console.log(`\n📚 Generating content for: ${lesson.course.title} - ${lesson.title}`);
  console.log(`   Existing activities: ${lesson.activities.length}`);

  if (lesson.activities.length > 0 && !options.dryRun) {
    console.log(`   ⚠️  Warning: This lesson already has ${lesson.activities.length} activities.`);
    console.log(`   ⚠️  New activities will be added (not replaced).`);
  }

  try {
    console.log(`\n🤖 Calling AI service to generate activities...`);
    console.log(`   This may take a minute (generating ${options.activityPlan?.length || 5} activities)...\n`);
    
    const activities = await contentGenerationService.generateLessonActivities(
      lessonId,
      options.activityPlan
    );

    console.log(`\n   ✅ Generated ${activities.length} activities`);

    if (options.dryRun) {
      console.log('\n   📋 Generated Activities (DRY RUN - not saved):');
      console.log('   ' + '='.repeat(70));
      activities.forEach((activity, index) => {
        console.log(`\n   ${index + 1}. ${activity.title}`);
        console.log(`      Description: ${activity.description}`);
        if (activity.content.questions) {
          console.log(`      Type: Quiz (${activity.content.questions.length} questions)`);
        } else if (activity.content.steps) {
          console.log(`      Type: Exercise (${activity.content.steps.length} steps)`);
        } else if (activity.content.objectives) {
          console.log(`      Type: Practical Task (${activity.content.objectives.length} objectives)`);
        } else if (activity.content.questions && Array.isArray(activity.content.questions)) {
          console.log(`      Type: Reflection (${activity.content.questions.length} questions)`);
        }
      });
      console.log('\n   ' + '='.repeat(70));
      console.log('\n💡 To save these activities, run the same command without --dry-run\n');
      return;
    }

    // Save activities to database
    for (let i = 0; i < activities.length; i++) {
      const activity = activities[i];
      const activityNumber = lesson.activities.length + i + 1;

      try {
        await adminCourseService.createActivity(lessonId, {
          activityNumber,
          title: activity.title,
          description: activity.description,
          type: activity.content.questions ? 'quiz' : 
                activity.content.steps ? 'exercise' :
                activity.content.objectives ? 'practical_task' : 'reflection',
          content: activity.content,
          required: true,
        });

        console.log(`   ✅ Saved: Activity ${activityNumber} - ${activity.title}`);
      } catch (error) {
        console.error(`   ❌ Failed to save activity ${activityNumber}:`, error);
        throw error;
      }
    }

    console.log(`   🎉 Successfully created ${activities.length} activities for this lesson!`);
  } catch (error) {
    console.error(`   ❌ Error generating content:`, error);
    throw error;
  }
}

/**
 * Generate activities for all lessons in a course
 */
async function generateForCourse(
  courseId: string,
  options: { dryRun?: boolean; activityPlan?: Array<{ type: contentGenerationService.ActivityType; position?: 'opening' | 'mid' | 'closing' }> }
): Promise<void> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      lessons: {
        orderBy: { lessonNumber: 'asc' },
        include: {
          activities: true,
        },
      },
    },
  });

  if (!course) {
    throw new Error(`Course not found: ${courseId}`);
  }

  console.log(`\n📖 Generating content for course: ${course.title}`);
  console.log(`   Lessons: ${course.lessons.length}`);

  for (const lesson of course.lessons) {
    await generateForLesson(lesson.id, options);
    
    // Add delay between lessons to avoid rate limiting
    if (lesson !== course.lessons[course.lessons.length - 1]) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log(`\n🎉 Successfully generated content for all lessons in ${course.title}!`);
}

/**
 * Generate activities for all lessons in all courses
 */
async function generateForAll(
  options: { dryRun?: boolean; activityPlan?: Array<{ type: contentGenerationService.ActivityType; position?: 'opening' | 'mid' | 'closing' }> }
): Promise<void> {
  const courses = await prisma.course.findMany({
    orderBy: { courseNumber: 'asc' },
    include: {
      lessons: {
        orderBy: { lessonNumber: 'asc' },
        include: {
          activities: true,
        },
      },
    },
  });

  console.log(`\n🚀 Generating content for ALL courses (${courses.length} courses)`);
  console.log(`   Total lessons: ${courses.reduce((sum, c) => sum + c.lessons.length, 0)}`);

  if (options.dryRun) {
    console.log(`   ⚠️  DRY RUN MODE - No changes will be saved`);
  }

  for (const course of courses) {
    await generateForCourse(course.id, options);
    
    // Add delay between courses
    if (course !== courses[courses.length - 1]) {
      console.log('\n⏳ Waiting 3 seconds before next course...\n');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  console.log(`\n🎉 Successfully generated content for ALL courses!`);
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting content generation script...\n');
  
  const args = process.argv.slice(2);
  const options: GenerationOptions = {
    dryRun: args.includes('--dry-run'),
  };

  // Check if GEMINI_API_KEY is set
  if (!process.env.GEMINI_API_KEY) {
    console.error('\n❌ GEMINI_API_KEY is not set in your .env file');
    console.error('\n💡 Please set GEMINI_API_KEY in your .env file:');
    console.error('   GEMINI_API_KEY=your-api-key-here');
    console.error('\n📁 Make sure the .env file is in the backend folder');
    console.error(`   Current working directory: ${process.cwd()}`);
    console.error(`   Looking for .env at: ${join(process.cwd(), envFile)}\n`);
    process.exit(1);
  }

  // Show API key status (masked for security)
  const apiKey = process.env.GEMINI_API_KEY;
  const maskedKey = apiKey.length > 10 
    ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`
    : '***';
  console.log(`✅ GEMINI_API_KEY found: ${maskedKey}`);
  console.log(`   Key length: ${apiKey.length} characters`);
  
  // Check if key looks valid (Gemini keys usually start with AIza)
  if (!apiKey.startsWith('AIza')) {
    console.warn('⚠️  Warning: API key doesn\'t start with "AIza" - make sure it\'s a valid Gemini API key');
  }

  // Parse arguments
  const lessonIdIndex = args.indexOf('--lesson-id');
  if (lessonIdIndex !== -1 && args[lessonIdIndex + 1]) {
    options.lessonId = args[lessonIdIndex + 1];
  }

  const courseIdIndex = args.indexOf('--course-id');
  if (courseIdIndex !== -1 && args[courseIdIndex + 1]) {
    options.courseId = args[courseIdIndex + 1];
  }

  if (args.includes('--all')) {
    options.all = true;
  }

  // Check database connection
  try {
    await prisma.$connect();
    console.log('✅ Connected to database');
  } catch (error) {
    console.error('\n❌ Failed to connect to database');
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }

  try {
    if (options.lessonId) {
      await generateForLesson(options.lessonId, options);
    } else if (options.courseId) {
      await generateForCourse(options.courseId, options);
    } else if (options.all) {
      await generateForAll(options);
    } else {
      console.error('\n❌ No target specified');
      console.error('\nUsage:');
      console.error('  npm run generate-content -- --lesson-id "lessonId"');
      console.error('  npm run generate-content -- --course-id "courseId"');
      console.error('  npm run generate-content -- --all');
      console.error('  npm run generate-content -- --lesson-id "lessonId" --dry-run\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Fatal error:', error instanceof Error ? error.message : error);
    if (error instanceof Error && error.stack) {
      console.error('\nStack trace:', error.stack);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run main function
main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});

export { generateForLesson, generateForCourse, generateForAll };

