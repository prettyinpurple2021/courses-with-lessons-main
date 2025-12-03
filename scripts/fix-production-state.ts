#!/usr/bin/env tsx
/**
 * Fix Production State Script
 * 
 * This script verifies and fixes the production database state:
 * 1. Checks if exams have questions
 * 2. Checks if videos are placeholders
 * 3. Runs content setup if needed
 * 
 * Usage: tsx scripts/fix-production-state.ts
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

// Load environment variables
const envPath = join(process.cwd(), 'backend', '.env');
if (existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const prisma = new PrismaClient();

async function checkExamsHaveQuestions(): Promise<boolean> {
  console.log('\n🔍 Checking exam questions...');
  
  const exams = await prisma.finalExam.findMany({
    include: {
      questions: true,
    },
  });

  const emptyExams = exams.filter(exam => exam.questions.length === 0);
  
  if (emptyExams.length > 0) {
    console.log(`❌ Found ${emptyExams.length} exam(s) with no questions:`);
    emptyExams.forEach(exam => {
      console.log(`   - ${exam.title}`);
    });
    return false;
  }
  
  console.log(`✅ All ${exams.length} exams have questions`);
  return true;
}

async function checkVideosArePlaceholders(): Promise<boolean> {
  console.log('\n🔍 Checking video IDs...');
  
  const lessons = await prisma.lesson.findMany({
    select: { id: true, youtubeVideoId: true, title: true },
  });

  const placeholderVideos = lessons.filter(
    lesson => lesson.youtubeVideoId === 'dQw4w9WgXcQ'
  );
  
  if (placeholderVideos.length > 0) {
    console.log(`❌ Found ${placeholderVideos.length} lesson(s) with placeholder videos`);
    console.log(`   Sample: ${placeholderVideos.slice(0, 3).map(l => l.title).join(', ')}`);
    return false;
  }
  
  console.log(`✅ All ${lessons.length} lessons have real video IDs`);
  return true;
}

async function fixContent() {
  console.log('\n🔧 Running content setup...');
  
  try {
    execSync('npm run content:setup-production', {
      stdio: 'inherit',
      cwd: process.cwd(),
    });
    return true;
  } catch (error: any) {
    console.error('❌ Content setup failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('\n🚀 Production State Fix Script');
  console.log('='.repeat(70));
  
  try {
    // Check exams
    const examsOk = await checkExamsHaveQuestions();
    
    // Check videos
    const videosOk = await checkVideosArePlaceholders();
    
    if (examsOk && videosOk) {
      console.log('\n✅ Production state is correct!');
      console.log('   All exams have questions');
      console.log('   All videos are updated');
      process.exit(0);
    }
    
    // Need to fix
    console.log('\n⚠️  Production state needs fixing');
    console.log('   Running content setup...\n');
    
    const fixed = await fixContent();
    
    if (!fixed) {
      console.error('\n❌ Failed to fix production state');
      process.exit(1);
    }
    
    // Verify again
    console.log('\n🔍 Verifying fixes...');
    const examsOkAfter = await checkExamsHaveQuestions();
    const videosOkAfter = await checkVideosArePlaceholders();
    
    if (examsOkAfter && videosOkAfter) {
      console.log('\n✅ Production state fixed successfully!');
      process.exit(0);
    } else {
      console.error('\n❌ Some issues remain after fix');
      if (!examsOkAfter) console.error('   Exams still missing questions');
      if (!videosOkAfter) console.error('   Videos still have placeholders');
      process.exit(1);
    }
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();


