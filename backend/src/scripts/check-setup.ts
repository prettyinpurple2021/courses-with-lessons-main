/**
 * Setup Checklist Script
 * 
 * This script helps you verify your setup before starting the servers.
 * 
 * Usage: npm run check-setup
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

async function checkBackendEnv() {
  console.log('\n📋 Checking Backend .env file...\n');
  
  const required = [
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'CORS_ORIGIN',
    'FRONTEND_URL',
    'GEMINI_API_KEY',
  ];

  const optional = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'RESEND_API_KEY',
    'YOUTUBE_API_KEY',
    'REDIS_URL',
  ];

  let allGood = true;

  console.log('Required variables:');
  for (const key of required) {
    const value = process.env[key];
    if (value) {
      const display = key.includes('SECRET') || key.includes('KEY') || key.includes('PASSWORD')
        ? '*'.repeat(Math.min(value.length, 20))
        : value;
      console.log(`  ✅ ${key}: ${display}`);
    } else {
      console.log(`  ❌ ${key}: NOT SET`);
      allGood = false;
    }
  }

  console.log('\nOptional variables:');
  for (const key of optional) {
    const value = process.env[key];
    if (value) {
      const display = key.includes('SECRET') || key.includes('KEY')
        ? '*'.repeat(Math.min(value.length, 20))
        : value;
      console.log(`  ✅ ${key}: ${display}`);
    } else {
      console.log(`  ⚠️  ${key}: Not set (optional)`);
    }
  }

  return allGood;
}

async function checkFrontendEnv() {
  console.log('\n📋 Checking Frontend .env file...\n');
  
  const frontendEnvPath = join(process.cwd(), '..', 'frontend', '.env');
  const frontendEnvExists = existsSync(frontendEnvPath);

  if (!frontendEnvExists) {
    console.log('  ❌ Frontend .env file not found!');
    console.log(`  📁 Expected location: ${frontendEnvPath}`);
    console.log('\n  💡 Create frontend/.env with:');
    console.log('     VITE_API_BASE_URL=http://localhost:5000/api');
    return false;
  }

  // Try to read it
  dotenv.config({ path: frontendEnvPath });
  const apiUrl = process.env.VITE_API_BASE_URL || process.env.VITE_API_URL;

  if (apiUrl) {
    console.log(`  ✅ VITE_API_BASE_URL: ${apiUrl}`);
    return true;
  } else {
    console.log('  ❌ VITE_API_BASE_URL not set in frontend/.env');
    console.log('\n  💡 Add to frontend/.env:');
    console.log('     VITE_API_BASE_URL=http://localhost:5000/api');
    return false;
  }
}

async function checkDatabase() {
  console.log('\n📋 Checking Database Connection...\n');

  if (!process.env.DATABASE_URL) {
    console.log('  ❌ DATABASE_URL not set - cannot test database');
    return false;
  }

  try {
    await prisma.$connect();
    console.log('  ✅ Database connection successful');

    // Check if tables exist
    const courseCount = await prisma.course.count();
    const lessonCount = await prisma.lesson.count();
    
    console.log(`  ✅ Found ${courseCount} courses`);
    console.log(`  ✅ Found ${lessonCount} lessons`);

    if (courseCount === 0) {
      console.log('\n  ⚠️  No courses found. You may want to run:');
      console.log('     npm run prisma:seed');
    }

    return true;
  } catch (error: any) {
    console.log('  ❌ Database connection failed');
    console.log(`  Error: ${error.message}`);
    console.log('\n  💡 Check:');
    console.log('     1. PostgreSQL is running');
    console.log('     2. DATABASE_URL is correct');
    console.log('     3. Database exists');
    console.log('     4. Run: npm run prisma:migrate');
    return false;
  }
}

async function checkPostgreSQL() {
  console.log('\n📋 Checking PostgreSQL Service...\n');

  // Try to parse DATABASE_URL
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.log('  ⚠️  Cannot check - DATABASE_URL not set');
    return false;
  }

  try {
    // Try to connect
    await prisma.$connect();
    console.log('  ✅ PostgreSQL appears to be running');
    return true;
  } catch (error: any) {
    if (error.message?.includes('ECONNREFUSED') || error.message?.includes('connection')) {
      console.log('  ❌ PostgreSQL service may not be running');
      console.log('\n  💡 On Windows, check:');
      console.log('     1. Open Services (services.msc)');
      console.log('     2. Look for "postgresql-x64-18" or similar');
      console.log('     3. Start the service if it\'s stopped');
    } else {
      console.log('  ⚠️  Could not verify PostgreSQL status');
    }
    return false;
  }
}

async function main() {
  console.log('🔍 Running Setup Checklist...\n');
  console.log('='.repeat(60));

  const results = {
    backendEnv: await checkBackendEnv(),
    frontendEnv: await checkFrontendEnv(),
    database: await checkDatabase(),
    postgresql: await checkPostgreSQL(),
  };

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Summary:\n');

  const allGood = Object.values(results).every(v => v);

  if (results.backendEnv) {
    console.log('  ✅ Backend .env file is configured');
  } else {
    console.log('  ❌ Backend .env file needs configuration');
  }

  if (results.frontendEnv) {
    console.log('  ✅ Frontend .env file is configured');
  } else {
    console.log('  ❌ Frontend .env file needs configuration');
  }

  if (results.postgresql) {
    console.log('  ✅ PostgreSQL is running');
  } else {
    console.log('  ❌ PostgreSQL may not be running');
  }

  if (results.database) {
    console.log('  ✅ Database connection works');
  } else {
    console.log('  ❌ Database connection failed');
  }

  if (allGood) {
    console.log('\n🎉 All checks passed! You can start the servers:\n');
    console.log('  Terminal 1 (Backend):');
    console.log('    cd backend');
    console.log('    npm run dev\n');
    console.log('  Terminal 2 (Frontend):');
    console.log('    cd frontend');
    console.log('    npm run dev\n');
  } else {
    console.log('\n⚠️  Some checks failed. Please fix the issues above before starting.\n');
  }

  await prisma.$disconnect();
  process.exit(allGood ? 0 : 1);
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});




