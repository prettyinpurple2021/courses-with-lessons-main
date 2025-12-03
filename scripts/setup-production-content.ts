#!/usr/bin/env tsx
/**
 * Production Content Setup Script
 * 
 * This script sets up all production content in the correct order:
 * 1. Seeds the database with courses, lessons, activities, and exam structures
 * 2. Updates lesson videos with real YouTube video IDs
 * 3. Adds comprehensive exam questions to all final exams
 * 
 * Usage: npm run content:setup-production
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

const scripts = {
  seed: 'npm run prisma:seed --workspace=backend',
  updateVideos: 'npm run content:update-videos',
  addExamQuestions: 'npm run content:add-exam-questions',
};

function runScript(name: string, command: string) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`📋 Step: ${name}`);
  console.log(`${'='.repeat(70)}\n`);
  
  try {
    execSync(command, { stdio: 'inherit', cwd: process.cwd() });
    console.log(`\n✅ ${name} completed successfully\n`);
    return true;
  } catch (error: any) {
    console.error(`\n❌ ${name} failed`);
    console.error(error.message);
    return false;
  }
}

async function main() {
  console.log('\n🚀 Production Content Setup');
  console.log('='.repeat(70));
  console.log('\nThis script will:');
  console.log('  1. Seed database with courses and lesson structures');
  console.log('  2. Update all lesson videos with real YouTube IDs');
  console.log('  3. Add comprehensive exam questions to all final exams');
  console.log('\n⚠️  Make sure your DATABASE_URL is configured correctly!\n');

  // Check if database connection is available
  const envPath = join(process.cwd(), 'backend', '.env');
  if (!existsSync(envPath)) {
    console.error('❌ Error: backend/.env file not found');
    console.error('   Please create backend/.env with your DATABASE_URL');
    process.exit(1);
  }

  // Step 1: Seed database
  if (!runScript('Database Seeding', scripts.seed)) {
    console.error('\n❌ Setup failed at database seeding step');
    process.exit(1);
  }

  // Step 2: Update videos
  if (!runScript('Updating Lesson Videos', scripts.updateVideos)) {
    console.error('\n❌ Setup failed at video update step');
    console.error('   You can retry with: npm run content:update-videos');
    process.exit(1);
  }

  // Step 3: Add exam questions
  if (!runScript('Adding Exam Questions', scripts.addExamQuestions)) {
    console.error('\n❌ Setup failed at exam questions step');
    console.error('   You can retry with: npm run content:add-exam-questions');
    process.exit(1);
  }

  // Success!
  console.log('\n' + '='.repeat(70));
  console.log('✅ Production Content Setup Complete!');
  console.log('='.repeat(70));
  console.log('\nYour database now contains:');
  console.log('  ✅ 7 courses with proper structure');
  console.log('  ✅ 84 lessons (12 per course) with real YouTube videos');
  console.log('  ✅ Activities and resources for each lesson');
  console.log('  ✅ Final projects for each course');
  console.log('  ✅ Final exams with comprehensive questions (20 per exam)');
  console.log('\n🎉 Your academy is ready for production!\n');
}

main().catch((error) => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});

