#!/usr/bin/env tsx
/**
 * Update Lesson Titles Script
 * 
 * Updates existing lesson titles in the database with specific, content-focused titles.
 * 
 * Usage: tsx scripts/update-lesson-titles.ts
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { existsSync } from 'fs';
import { join } from 'path';
import { lessonTitles } from '../backend/src/prisma/lessonTitles';

// Load environment variables
const envPath = join(process.cwd(), 'backend', '.env');
if (existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const prisma = new PrismaClient();

async function main() {
  console.log('📝 Updating Lesson Titles\n');
  console.log('='.repeat(70));

  try {
    const courses = await prisma.course.findMany({
      include: {
        lessons: {
          orderBy: { lessonNumber: 'asc' },
        },
      },
      orderBy: { courseNumber: 'asc' },
    });

    if (courses.length === 0) {
      console.log('❌ No courses found. Run seed script first: npm run prisma:seed');
      process.exit(1);
    }

    let updated = 0;
    let skipped = 0;

    for (const course of courses) {
      const courseLessonTitles = lessonTitles[course.courseNumber] || [];
      
      if (courseLessonTitles.length === 0) {
        console.log(`\n⚠️  No lesson titles defined for course ${course.courseNumber}`);
        continue;
      }

      console.log(`\n📚 Course ${course.courseNumber}: ${course.title}`);
      console.log(`   Found ${course.lessons.length} lessons`);

      for (let i = 0; i < course.lessons.length; i++) {
        const lesson = course.lessons[i];
        const newTitle = courseLessonTitles[i];

        if (!newTitle) {
          console.log(`   ⚠️  Lesson ${lesson.lessonNumber}: No title defined, skipping`);
          skipped++;
          continue;
        }

        if (lesson.title === newTitle) {
          console.log(`   ✓ Lesson ${lesson.lessonNumber}: Already has correct title`);
          continue;
        }

        const newDescription = `Learn ${newTitle.toLowerCase()}. This lesson covers essential concepts and practical applications.`;

        await prisma.lesson.update({
          where: { id: lesson.id },
          data: {
            title: newTitle,
            description: newDescription,
          },
        });

        console.log(`   ✅ Lesson ${lesson.lessonNumber}: Updated`);
        console.log(`      Old: ${lesson.title}`);
        console.log(`      New: ${newTitle}`);
        updated++;
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('\n📊 Summary:');
    console.log(`   ✅ Updated: ${updated} lessons`);
    console.log(`   ⚠️  Skipped: ${skipped} lessons`);
    console.log('\n✅ Lesson titles updated successfully!\n');

    await prisma.$disconnect();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();

