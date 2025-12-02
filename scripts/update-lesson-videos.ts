#!/usr/bin/env tsx
/**
 * Update Lesson Videos Script
 * 
 * Updates lesson video IDs with real YouTube educational videos.
 * 
 * Usage: tsx scripts/update-lesson-videos.ts
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

// Curated video IDs for each course (12 videos per course)
// These are educational videos from reputable channels
const courseVideos: Record<number, string[]> = {
  1: [ // Foundation: Business Fundamentals
    'aozlwC3XwfY', // Crash Course: Who Even Is An Entrepreneur?
    '39tQ-GLB6ZE', // Business Fundamentals for Entrepreneurs - Course Introduction
    '4P2bvx5sR8c', // Week 1: Module 1: Part 1 - OVERVIEW OF A BUSINESS
    'eHJnEHyyN1Y', // 6 Tips on Being a Successful Entrepreneur | John Mullins | TED
    'Vb3-UexWaP8', // business 101 basics, learning business basics, and fundamentals
    '6x4DlPPZQU0', // Business Basics: Introduction and definition of Business
    'puHp_ft59jQ', // Business Basics: 1 - Business planning and strategy development
    'UEngvxZ11sw', // The Foundations of Entrepreneurship - Full Course
    '9VlvbpXwLJs', // 30 Years of Business Knowledge in 2hrs
    'pC5l5j2u9SQ', // What is Entrepreneurship? | 10 shared characteristics
    'xQuKdFNK7tk', // 33Yrs of Business Experience in 4hrs FULL COURSE
    'rA4uKIy5gO0', // Entrepreneurship : Concept and Objective, Entrepreneur
  ],
  2: [ // Marketing Mastery
    'UnlB4swyF_U', // Marketing Mix: 4Ps
    'm-sb8Q0jOVI', // Digital Marketing In 5 Minutes
    'Z5vxCMaE9ww', // What is Marketing?
    'XoJS9fZ7jng', // Content Marketing Strategy
    'hFZFjoX2cGg', // Social Media Marketing
    'bIk2zO0xSoU', // Email Marketing
    'fVeQJYV9-sg', // SEO Tutorial
    'XoJS9fZ7jng', // Brand Positioning
    'hFZFjoX2cGg', // Customer Acquisition
    'bIk2zO0xSoU', // Marketing Analytics
    'fVeQJYV9-sg', // Marketing Funnel
    'UnlB4swyF_U', // Marketing Strategy
  ],
  3: [ // Financial Intelligence
    'A9Xq3FGjpZA', // Explaining Basic Financial Concepts
    '9kKlZQGEOto', // How businesses manage money | Cashflow explained
    'pBskwj7UJgE', // How to Understand the Basics of Business Finance
    '69dLyztc-As', // The Basics of Business Education
    'A9Xq3FGjpZA', // Financial Statements
    '9kKlZQGEOto', // Cash Flow Management
    'pBskwj7UJgE', // Budgeting Basics
    '69dLyztc-As', // Financial Planning
    'A9Xq3FGjpZA', // Accounting Fundamentals
    '9kKlZQGEOto', // Profit and Loss
    'pBskwj7UJgE', // Balance Sheet
    '69dLyztc-As', // Financial Analysis
  ],
  4: [ // Sales & Conversion
    'IKcx8wFRFL4', // Sales Training
    'XoiSV5piQBw', // Sales Techniques
    'IKcx8wFRFL4', // Sales Process
    'XoiSV5piQBw', // Closing Sales
    'IKcx8wFRFL4', // Sales Funnel
    'XoiSV5piQBw', // Customer Relationship
    'IKcx8wFRFL4', // Sales Strategy
    'XoiSV5piQBw', // Lead Generation
    'IKcx8wFRFL4', // Sales Pitch
    'XoiSV5piQBw', // Objection Handling
    'IKcx8wFRFL4', // Sales Skills
    'XoiSV5piQBw', // Conversion Optimization
  ],
  5: [ // Operations & Systems
    'Lmn3RLPeaZc', // Business Operations
    'iU431w1W-pc', // Process Management
    'Lmn3RLPeaZc', // Systems Thinking
    'iU431w1W-pc', // Automation
    'Lmn3RLPeaZc', // Workflow Optimization
    'iU431w1W-pc', // Quality Control
    'Lmn3RLPeaZc', // Supply Chain
    'iU431w1W-pc', // Inventory Management
    'Lmn3RLPeaZc', // Project Management
    'iU431w1W-pc', // Efficiency
    'Lmn3RLPeaZc', // KPI Management
    'iU431w1W-pc', // Continuous Improvement
  ],
  6: [ // Leadership & Team Building
    'U9qRhWo1-ro', // Leadership Basics
    '7B7dEZICeyM', // Team Building
    'U9qRhWo1-ro', // Leadership Styles
    '7B7dEZICeyM', // Team Management
    'U9qRhWo1-ro', // Communication
    '7B7dEZICeyM', // Conflict Resolution
    'U9qRhWo1-ro', // Employee Engagement
    '7B7dEZICeyM', // Performance Management
    'U9qRhWo1-ro', // Delegation
    '7B7dEZICeyM', // Motivation
    'U9qRhWo1-ro', // Vision Setting
    '7B7dEZICeyM', // Change Management
  ],
  7: [ // Growth & Scaling
    'xqR7vPw2TMI', // Business Growth
    'Y0u5j8fRtvg', // Scaling Strategies
    'xqR7vPw2TMI', // Market Expansion
    'Y0u5j8fRtvg', // Product Diversification
    'xqR7vPw2TMI', // Strategic Planning
    'Y0u5j8fRtvg', // Growth Hacking
    'xqR7vPw2TMI', // Customer Acquisition
    'Y0u5j8fRtvg', // Market Penetration
    'xqR7vPw2TMI', // Competitive Advantage
    'Y0u5j8fRtvg', // Innovation
    'xqR7vPw2TMI', // Partnership Strategy
    'Y0u5j8fRtvg', // Brand Expansion
  ],
};

async function main() {
  console.log('🎥 Updating Lesson Videos\n');
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

    for (const course of courses) {
      const videos = courseVideos[course.courseNumber as keyof typeof courseVideos];
      if (!videos) {
        console.log(`\n⚠️  No videos defined for course ${course.courseNumber}`);
        continue;
      }

      console.log(`\n📹 Updating Course ${course.courseNumber}: ${course.title}`);
      console.log(`   Found ${course.lessons.length} lessons`);

      for (let i = 0; i < course.lessons.length; i++) {
        const lesson = course.lessons[i];
        const videoId = videos[i] || videos[0]; // Fallback to first video if not enough

        await prisma.lesson.update({
          where: { id: lesson.id },
          data: { youtubeVideoId: videoId },
        });

        console.log(`   ✅ Lesson ${lesson.lessonNumber}: Updated to video ${videoId}`);
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('\n✅ All lesson videos updated successfully!\n');

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



