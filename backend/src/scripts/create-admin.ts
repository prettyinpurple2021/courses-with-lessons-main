#!/usr/bin/env tsx
/**
 * Create Admin User Script
 * 
 * Interactive script to create an admin user in the database.
 * 
 * Usage: tsx src/scripts/create-admin.ts
 * Or: npm run create-admin
 */

import dotenv from 'dotenv';
import { existsSync } from 'fs';
import { join } from 'path';
import readline from 'readline';
import prisma from '../config/prisma.js';
import { hashPassword, validatePasswordStrength } from '../utils/password.js';

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

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Helper function to prompt for input
function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

// Helper function to prompt for password
// Note: Password will be visible on Windows, but hidden on Unix systems
function questionPassword(query: string): Promise<string> {
  // On Windows, we'll just use regular input
  // On Unix systems, we could use a library, but for simplicity we'll use regular input
  return question(query);
}

async function main() {
  try {
    console.log('🔐 Create Admin User\n');
    console.log('This script will create a new admin user in the database.\n');

    // Get user input
    const email = await question('Email: ');
    if (!email || !email.includes('@')) {
      console.error('❌ Invalid email address');
      process.exit(1);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log(`\n⚠️  User with email ${email} already exists.`);
      const update = await question('Do you want to update this user to admin? (y/n): ');
      if (update.toLowerCase() === 'y' || update.toLowerCase() === 'yes') {
        await prisma.user.update({
          where: { email },
          data: { role: 'admin' },
        });
        console.log(`\n✅ User ${email} has been updated to admin role.`);
        await prisma.$disconnect();
        process.exit(0);
      } else {
        console.log('❌ Operation cancelled.');
        await prisma.$disconnect();
        process.exit(0);
      }
    }

    const firstName = await question('First Name: ');
    if (!firstName || firstName.trim().length === 0) {
      console.error('❌ First name is required');
      process.exit(1);
    }

    const lastName = await question('Last Name: ');
    if (!lastName || lastName.trim().length === 0) {
      console.error('❌ Last name is required');
      process.exit(1);
    }

    let password = '';
    let passwordValid = false;
    let attempts = 0;
    const maxAttempts = 3;

    while (!passwordValid && attempts < maxAttempts) {
      password = await questionPassword('Password: ');
      
      if (password.length === 0) {
        console.error('\n❌ Password cannot be empty');
        attempts++;
        continue;
      }

      const validation = validatePasswordStrength(password);
      if (!validation.valid) {
        console.error(`\n❌ ${validation.message}`);
        attempts++;
        if (attempts < maxAttempts) {
          console.log(`\nPlease try again (${maxAttempts - attempts} attempts remaining).\n`);
        }
        continue;
      }

      const confirmPassword = await questionPassword('\nConfirm Password: ');
      if (password !== confirmPassword) {
        console.error('\n❌ Passwords do not match');
        attempts++;
        if (attempts < maxAttempts) {
          console.log(`\nPlease try again (${maxAttempts - attempts} attempts remaining).\n`);
        }
        continue;
      }

      passwordValid = true;
    }

    if (!passwordValid) {
      console.error('\n❌ Failed to set password after maximum attempts');
      await prisma.$disconnect();
      process.exit(1);
    }

    // Hash password
    console.log('\n⏳ Creating admin user...');
    const hashedPassword = await hashPassword(password);

    // Create admin user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        role: 'admin',
      },
    });

    console.log('\n✅ Admin user created successfully!');
    console.log(`\n📋 User Details:`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.firstName} ${user.lastName}`);
    console.log(`   Role: ${user.role}`);
    console.log(`\n💡 You can now log in to the admin panel at /admin/login`);
    console.log(`   Email: ${user.email}`);

  } catch (error) {
    console.error('\n❌ Error creating admin user:');
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
      if (error.stack && process.env.NODE_ENV === 'development') {
        console.error(`\nStack trace:\n${error.stack}`);
      }
    } else {
      console.error('   Unknown error occurred');
    }
    process.exit(1);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

main();

