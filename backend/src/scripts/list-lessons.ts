/**
 * List Lessons Script
 * 
 * This script helps you find lesson IDs and course IDs for use with the content generation script.
 * 
 * Usage:
 *   npm run list-lessons
 *   npm run list-lessons -- --course <courseNumber>
 */

import dotenv from 'dotenv';
import { existsSync } from 'fs';
import { join } from 'path';
import { PrismaClient } from '@prisma/client';

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

async function listAllLessons() {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { courseNumber: 'asc' },
      include: {
        lessons: {
          orderBy: { lessonNumber: 'asc' },
          include: {
            _count: {
              select: {
                activities: true,
              },
            },
          },
        },
      },
    });

    if (courses.length === 0) {
      console.log('\n⚠️  No courses found in the database.');
      console.log('\n💡 You may need to:');
      console.log('   1. Run the database seed script: npm run prisma:seed');
      console.log('   2. Or create courses through the admin panel\n');
      return;
    }

    console.log('\n📚 All Courses and Lessons:\n');
    console.log('='.repeat(80));

    for (const course of courses) {
      console.log(`\n📖 Course ${course.courseNumber}: ${course.title}`);
      console.log(`   Course ID: ${course.id}`);
      console.log(`   Lessons: ${course.lessons.length}`);
      console.log('-'.repeat(80));

      if (course.lessons.length === 0) {
        console.log('   ⚠️  No lessons in this course');
      } else {
        for (const lesson of course.lessons) {
          console.log(`   Lesson ${lesson.lessonNumber}: ${lesson.title}`);
          console.log(`   └─ Lesson ID: ${lesson.id}`);
          console.log(`   └─ Activities: ${lesson._count.activities}`);
        }
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n💡 To generate content, use:');
    console.log('   npm run generate-content -- --lesson-id "LESSON_ID" --dry-run');
    console.log('   npm run generate-content -- --course-id "COURSE_ID"');
    console.log('   npm run generate-content -- --all\n');
  } catch (error) {
    console.error('\n❌ Error fetching courses:', error);
    throw error;
  }
}

async function listCourseLessons(courseNumber: number) {
  const course = await prisma.course.findUnique({
    where: { courseNumber },
    include: {
      lessons: {
        orderBy: { lessonNumber: 'asc' },
        include: {
          _count: {
            select: {
              activities: true,
            },
          },
        },
      },
    },
  });

  if (!course) {
    console.error(`❌ Course ${courseNumber} not found`);
    process.exit(1);
  }

  console.log(`\n📖 Course ${course.courseNumber}: ${course.title}`);
  console.log(`   Course ID: ${course.id}`);
  console.log(`   Lessons: ${course.lessons.length}`);
  console.log('='.repeat(80));

  for (const lesson of course.lessons) {
    console.log(`\n   Lesson ${lesson.lessonNumber}: ${lesson.title}`);
    console.log(`   └─ Lesson ID: ${lesson.id}`);
    console.log(`   └─ Activities: ${lesson._count.activities}`);
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n💡 To generate content for this course:');
  console.log(`   npm run generate-content -- --course-id "${course.id}"`);
  console.log('\n💡 To generate content for a specific lesson:');
  console.log(`   npm run generate-content -- --lesson-id "LESSON_ID" --dry-run\n`);
}

async function main() {
  console.log('🔍 Starting list-lessons script...\n');
  
  const args = process.argv.slice(2);
  const courseIndex = args.indexOf('--course');

  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set in your .env file');
    console.error('\n💡 Please set DATABASE_URL in your .env file:');
    console.error('   DATABASE_URL="postgresql://user:password@localhost:5432/dbname"\n');
    process.exit(1);
  }

  console.log('📡 Connecting to database...');
  
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Connected to database\n');
  } catch (error) {
    console.error('\n❌ Failed to connect to database');
    console.error('Error:', error instanceof Error ? error.message : error);
    console.error('\n💡 Please check:');
    console.error('   1. DATABASE_URL is correct in your .env file');
    console.error('   2. PostgreSQL is running');
    console.error('   3. Database exists and is accessible\n');
    process.exit(1);
  }

  try {
    if (courseIndex !== -1 && args[courseIndex + 1]) {
      const courseNumber = parseInt(args[courseIndex + 1], 10);
      if (isNaN(courseNumber)) {
        console.error('❌ Invalid course number');
        process.exit(1);
      }
      await listCourseLessons(courseNumber);
    } else {
      await listAllLessons();
    }
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
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

export { listAllLessons, listCourseLessons };

