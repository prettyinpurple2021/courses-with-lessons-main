#!/usr/bin/env tsx
/**
 * Content Completeness Verification Script
 * 
 * Verifies that all courses, lessons, activities, projects, and exams are properly set up.
 * Generates a detailed report of any missing or incomplete content.
 * 
 * Usage: tsx scripts/verify-content-completeness.ts
 */

import { PrismaClient } from '@prisma/client';
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

interface ContentIssue {
  type: 'error' | 'warning' | 'info';
  category: string;
  message: string;
  details?: string;
  courseNumber?: number;
  lessonNumber?: number;
}

const issues: ContentIssue[] = [];

function addIssue(
  type: 'error' | 'warning' | 'info',
  category: string,
  message: string,
  details?: string,
  courseNumber?: number,
  lessonNumber?: number
) {
  issues.push({ type, category, message, details, courseNumber, lessonNumber });
}

async function verifyCourses() {
  console.log('\n📚 Verifying Courses...\n');

  const courses = await prisma.course.findMany({
    include: {
      lessons: {
        include: {
          activities: true,
        },
        orderBy: { lessonNumber: 'asc' },
      },
      finalProject: true,
      finalExam: true,
    },
    orderBy: { courseNumber: 'asc' },
  });

  // Check if we have exactly 7 courses
  if (courses.length === 0) {
    addIssue('error', 'Courses', 'No courses found in database', 'Run: npm run prisma:seed');
    return;
  }

  if (courses.length !== 7) {
    addIssue(
      'warning',
      'Courses',
      `Found ${courses.length} courses (expected 7)`,
      'Verify all courses are created'
    );
  }

  // Verify each course
  for (const course of courses) {
    // Check if course is published
    if (!course.published) {
      addIssue(
        'warning',
        `Course ${course.courseNumber}`,
        `Course "${course.title}" is not published`,
        'Set published to true for production',
        course.courseNumber
      );
    }

    // Check lesson count
    if (course.lessons.length !== 12) {
      addIssue(
        'error',
        `Course ${course.courseNumber}`,
        `Course "${course.title}" has ${course.lessons.length} lessons (expected 12)`,
        'Each course must have exactly 12 lessons',
        course.courseNumber
      );
    }

    // Check for final project
    if (!course.finalProject) {
      addIssue(
        'error',
        `Course ${course.courseNumber}`,
        `Course "${course.title}" is missing final project`,
        'Create final project for this course',
        course.courseNumber
      );
    } else {
      // Verify final project has content
      if (!course.finalProject.instructions || course.finalProject.instructions.trim().length === 0) {
        addIssue(
          'warning',
          `Course ${course.courseNumber}`,
          `Final project for "${course.title}" has no instructions`,
          'Add instructions to final project',
          course.courseNumber
        );
      }
    }

    // Check for final exam
    if (!course.finalExam) {
      addIssue(
        'error',
        `Course ${course.courseNumber}`,
        `Course "${course.title}" is missing final exam`,
        'Create final exam for this course',
        course.courseNumber
      );
    } else {
      // Verify final exam has questions
      const questions = course.finalExam.questions as any;
      if (!questions || !Array.isArray(questions) || questions.length === 0) {
        addIssue(
          'error',
          `Course ${course.courseNumber}`,
          `Final exam for "${course.title}" has no questions`,
          'Add questions to final exam',
          course.courseNumber
        );
      } else if (questions.length < 10) {
        addIssue(
          'warning',
          `Course ${course.courseNumber}`,
          `Final exam for "${course.title}" has only ${questions.length} questions`,
          'Consider adding more questions (recommended: 20+)',
          course.courseNumber
        );
      }
    }

    // Verify lessons
    for (const lesson of course.lessons) {
      // Check YouTube video ID
      if (!lesson.youtubeVideoId || lesson.youtubeVideoId.trim().length === 0) {
        addIssue(
          'error',
          `Course ${course.courseNumber} - Lesson ${lesson.lessonNumber}`,
          `Lesson "${lesson.title}" has no YouTube video ID`,
          'Add a valid YouTube video ID',
          course.courseNumber,
          lesson.lessonNumber
        );
      } else if (
        lesson.youtubeVideoId.length !== 11 ||
        lesson.youtubeVideoId === 'placeholder' ||
        lesson.youtubeVideoId === 'dQw4w9WgXcQ' // Rick Roll placeholder
      ) {
        addIssue(
          'warning',
          `Course ${course.courseNumber} - Lesson ${lesson.lessonNumber}`,
          `Lesson "${lesson.title}" has potentially invalid video ID: ${lesson.youtubeVideoId}`,
          'Verify this is a real YouTube video ID',
          course.courseNumber,
          lesson.lessonNumber
        );
      }

      // Check lesson description
      if (!lesson.description || lesson.description.trim().length < 50) {
        addIssue(
          'warning',
          `Course ${course.courseNumber} - Lesson ${lesson.lessonNumber}`,
          `Lesson "${lesson.title}" has short or missing description`,
          'Add a detailed description (recommended: 100+ characters)',
          course.courseNumber,
          lesson.lessonNumber
        );
      }

      // Check activities
      if (lesson.activities.length === 0) {
        addIssue(
          'warning',
          `Course ${course.courseNumber} - Lesson ${lesson.lessonNumber}`,
          `Lesson "${lesson.title}" has no activities`,
          'Add at least 2-3 activities per lesson',
          course.courseNumber,
          lesson.lessonNumber
        );
      } else {
        // Verify activities are sequential
        const activityNumbers = lesson.activities.map(a => a.activityNumber).sort((a, b) => a - b);
        for (let i = 0; i < activityNumbers.length; i++) {
          if (activityNumbers[i] !== i + 1) {
            addIssue(
              'error',
              `Course ${course.courseNumber} - Lesson ${lesson.lessonNumber}`,
              `Activity numbering is not sequential`,
              `Expected activity ${i + 1}, found ${activityNumbers[i]}`,
              course.courseNumber,
              lesson.lessonNumber
            );
          }
        }

        // Check activity content
        for (const activity of lesson.activities) {
          if (!activity.content || Object.keys(activity.content as object).length === 0) {
            addIssue(
              'error',
              `Course ${course.courseNumber} - Lesson ${lesson.lessonNumber} - Activity ${activity.activityNumber}`,
              `Activity "${activity.title}" has no content`,
              'Add content to activity',
              course.courseNumber,
              lesson.lessonNumber
            );
          }

          // Check activity description
          if (!activity.description || activity.description.trim().length < 20) {
            addIssue(
              'warning',
              `Course ${course.courseNumber} - Lesson ${lesson.lessonNumber} - Activity ${activity.activityNumber}`,
              `Activity "${activity.title}" has short description`,
              'Add a detailed description',
              course.courseNumber,
              lesson.lessonNumber
            );
          }
        }
      }

      // Check lesson numbering
      if (lesson.lessonNumber !== course.lessons.indexOf(lesson) + 1) {
        addIssue(
          'error',
          `Course ${course.courseNumber}`,
          `Lesson numbering is incorrect`,
          `Lesson "${lesson.title}" has number ${lesson.lessonNumber} but should be ${course.lessons.indexOf(lesson) + 1}`,
          course.courseNumber,
          lesson.lessonNumber
        );
      }
    }

    // Check lesson numbering sequence
    const lessonNumbers = course.lessons.map(l => l.lessonNumber).sort((a, b) => a - b);
    for (let i = 0; i < lessonNumbers.length; i++) {
      if (lessonNumbers[i] !== i + 1) {
        addIssue(
          'error',
          `Course ${course.courseNumber}`,
          `Lesson sequence is broken`,
          `Missing lesson ${i + 1}`,
          course.courseNumber
        );
      }
    }
  }

  console.log(`✅ Verified ${courses.length} courses`);
}

async function verifyDatabaseIntegrity() {
  console.log('\n🔍 Verifying Database Integrity...\n');

  try {
    // Check for orphaned records
    const lessonsWithoutCourse = await prisma.lesson.findMany({
      where: {
        course: null,
      },
    });

    if (lessonsWithoutCourse.length > 0) {
      addIssue(
        'error',
        'Database Integrity',
        `Found ${lessonsWithoutCourse.length} orphaned lessons`,
        'Lessons without a parent course'
      );
    }

    const activitiesWithoutLesson = await prisma.activity.findMany({
      where: {
        lesson: null,
      },
    });

    if (activitiesWithoutLesson.length > 0) {
      addIssue(
        'error',
        'Database Integrity',
        `Found ${activitiesWithoutLesson.length} orphaned activities`,
        'Activities without a parent lesson'
      );
    }

    console.log('✅ Database integrity check complete');
  } catch (error: any) {
    addIssue('error', 'Database Integrity', 'Failed to check database integrity', error.message);
  }
}

async function generateReport() {
  console.log('\n📊 Generating Report...\n');

  const errors = issues.filter(i => i.type === 'error');
  const warnings = issues.filter(i => i.type === 'warning');
  const infos = issues.filter(i => i.type === 'info');

  console.log('='.repeat(70));
  console.log('CONTENT COMPLETENESS REPORT');
  console.log('='.repeat(70));
  console.log(`\n❌ Errors: ${errors.length}`);
  console.log(`⚠️  Warnings: ${warnings.length}`);
  console.log(`ℹ️  Info: ${infos.length}\n`);

  if (errors.length > 0) {
    console.log('❌ ERRORS (Must Fix Before Production):\n');
    errors.forEach((issue, index) => {
      console.log(`${index + 1}. [${issue.category}] ${issue.message}`);
      if (issue.details) {
        console.log(`   → ${issue.details}`);
      }
      if (issue.courseNumber) {
        console.log(`   Course: ${issue.courseNumber}`);
      }
      if (issue.lessonNumber) {
        console.log(`   Lesson: ${issue.lessonNumber}`);
      }
      console.log('');
    });
  }

  if (warnings.length > 0) {
    console.log('\n⚠️  WARNINGS (Recommended to Fix):\n');
    warnings.forEach((issue, index) => {
      console.log(`${index + 1}. [${issue.category}] ${issue.message}`);
      if (issue.details) {
        console.log(`   → ${issue.details}`);
      }
      if (issue.courseNumber) {
        console.log(`   Course: ${issue.courseNumber}`);
      }
      if (issue.lessonNumber) {
        console.log(`   Lesson: ${issue.lessonNumber}`);
      }
      console.log('');
    });
  }

  // Summary by category
  const categories = new Map<string, { errors: number; warnings: number }>();
  issues.forEach(issue => {
    if (!categories.has(issue.category)) {
      categories.set(issue.category, { errors: 0, warnings: 0 });
    }
    const cat = categories.get(issue.category)!;
    if (issue.type === 'error') cat.errors++;
    if (issue.type === 'warning') cat.warnings++;
  });

  console.log('\n📋 Summary by Category:\n');
  categories.forEach((counts, category) => {
    const status = counts.errors > 0 ? '❌' : counts.warnings > 0 ? '⚠️' : '✅';
    console.log(`${status} ${category}: ${counts.errors} errors, ${counts.warnings} warnings`);
  });

  console.log('\n' + '='.repeat(70));

  if (errors.length === 0 && warnings.length === 0) {
    console.log('\n🎉 All content checks passed! Content is complete.\n');
    return true;
  } else if (errors.length === 0) {
    console.log('\n✅ No critical errors. Review warnings before production.\n');
    return true;
  } else {
    console.log('\n❌ Please fix errors before deploying to production.\n');
    return false;
  }
}

async function main() {
  console.log('🔍 Content Completeness Verification\n');
  console.log('='.repeat(70));

  try {
    await verifyCourses();
    await verifyDatabaseIntegrity();
    const allGood = await generateReport();

    await prisma.$disconnect();
    process.exit(allGood ? 0 : 1);
  } catch (error: any) {
    console.error('❌ Fatal error:', error.message);
    console.error(error.stack);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();

