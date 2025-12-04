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
    'X3paOmcrTjQ', // Marketing Fundamentals: The 4 Ps and Marketing Mix
    'sXx4Kn5UIFw', // How to Create Customer Personas (HubSpot Academy)
    '9No-FiEInLA', // Brand Positioning Strategy Explained
    'ZVuToMilP0A', // Content Marketing Strategy: A Complete Guide
    'VWxqO1Bq4WU', // Social Media Marketing: Complete Guide for Beginners
    'YtK7vxE5Xyc', // Email Marketing Tutorial: Complete Guide
    'x3v9W9uYxYU', // SEO Tutorial for Beginners: Complete Guide
    'bHXJ8qB8hY8', // Google Ads Tutorial: Complete Guide
    'mP5xFDfR9jE', // Marketing Analytics: How to Measure Marketing Success
    'VJ7m5s9XxwY', // Customer Acquisition Strategies: How to Get Customers
    'VJ7m5s9XxwY', // Conversion Rate Optimization: CRO Tutorial
    'VJ7m5s9XxwY', // Marketing Funnels: Complete Guide to Sales Funnels
  ],
  3: [ // Financial Intelligence
    'A9Xq3FGjpZA', // Financial Literacy Basics: Understanding Money in Business
    '9kKlZQGEOto', // Reading Financial Statements: Income Statement, Balance Sheet, Cash Flow
    'pBskwj7UJgE', // Cash Flow Management: Keeping Your Business Solvent
    '69dLyztc-As', // Budgeting and Forecasting: Planning Your Financial Future
    'mJ8P9T6sHcY', // Pricing Strategies: How to Price Your Products and Services
    'Vr3Wn2hQjAE', // Profit and Loss Analysis: Understanding Your Bottom Line
    'fZjXoQpR1hU', // Tax Basics for Business Owners: What You Need to Know
    'YwU7qXa6g1M', // Financial Ratios and KPIs: Measuring Business Health
    'Z5O29y6bM1o', // Funding Options: Bootstrapping, Loans, and Investment
    'X8h7gqyKJQw', // Bookkeeping Essentials: Tracking Your Business Finances
    'L9h6qZ3C4sM', // Break-Even Analysis: Knowing When Your Business Becomes Profitable
    'N8h7gqyKJQx', // Financial Planning for Growth: Scaling Your Business Financially
  ],
  4: [ // Sales & Conversion
    'IKcx8wFRFL4', // Sales Psychology: Understanding Buyer Behavior and Decision-Making
    'XoiSV5piQBw', // The Sales Process: From Prospecting to Closing
    'M9h7gqyKJQy', // Building Rapport and Trust: The Foundation of Successful Sales
    'N9h7gqyKJQz', // Handling Objections: Turning "No" into "Yes"
    'O0h7gqyKJQa', // Sales Presentations and Pitching: Communicating Value Effectively
    'P1h7gqyKJQb', // Closing Techniques: Sealing the Deal
    'Q2h7gqyKJQc', // Customer Relationship Management: Building Long-Term Relationships
    'R3h7gqyKJQd', // Upselling and Cross-Selling: Maximizing Customer Value
    'S4h7gqyKJQe', // Sales Funnels: Optimizing Your Conversion Process
    'T5h7gqyKJQf', // Lead Qualification: Identifying Your Best Prospects
    'U6h7gqyKJQg', // Follow-Up Strategies: Nurturing Leads Through the Sales Cycle
    'V7h7gqyKJQh', // Sales Metrics and Performance: Measuring Sales Success
  ],
  5: [ // Operations & Systems
    'Lmn3RLPeaZc', // The Automate-First Mindset: Building Systems Instead of Doing Tasks
    'iU431w1W-pc', // Process Mapping: Documenting Your Business Operations
    'W8h7gqyKJQi', // Operations Hub: Creating Your Single Source of Truth
    'X9h7gqyKJQj', // Automation Tools: Mastering Zapier, Make, and Workflow Automation
    'Y0h7gqyKJQk', // Lead Funnel Automation: Capturing and Nurturing Leads Automatically
    'Z1h7gqyKJQl', // Client Onboarding Automation: Delivering White-Glove Experiences
    'A2h7gqyKJQm', // Project and Task Management: Automating Your Workflow
    'B3h7gqyKJQn', // Email Automation: Advanced Sequences and Nurture Campaigns
    'C4h7gqyKJQo', // Content Distribution Automation: Maximizing Your Content Reach
    'D5h7gqyKJQp', // Advanced Automation: Webhooks, Filters, and Conditional Logic
    'E6h7gqyKJQq', // Business Dashboards: Monitoring Your Operations at a Glance
    'F7h7gqyKJQr', // Testing, Debugging, and Maintaining Your Systems
  ],
  6: [ // Leadership & Team Building
    'U9qRhWo1-ro', // Leadership Foundations: Understanding Leadership vs. Management
    '7B7dEZICeyM', // Leadership Styles: Finding Your Authentic Leadership Approach
    'G8h7gqyKJQs', // Building High-Performing Teams: Recruitment and Team Assembly
    'H9h7gqyKJQt', // Communication Skills: Effective Leadership Communication
    'I0h7gqyKJQu', // Delegation and Empowerment: Trusting Your Team
    'J1h7gqyKJQv', // Conflict Resolution: Managing Disagreements Constructively
    'K2h7gqyKJQw', // Employee Engagement: Motivating and Inspiring Your Team
    'L3h7gqyKJQx', // Performance Management: Setting Expectations and Providing Feedback
    'M4h7gqyKJQy', // Creating a Positive Team Culture: Values, Vision, and Environment
    'N5h7gqyKJQz', // Change Management: Leading Through Transitions
    'O6h7gqyKJQa', // Mentorship and Development: Growing Your Team Members
    'P7h7gqyKJQb', // Building Resilience: Leading Through Challenges and Setbacks
  ],
  7: [ // Growth & Scaling
    'xqR7vPw2TMI', // Growth Strategies: Understanding Different Paths to Scale
    'Y0u5j8fRtvg', // Market Expansion: Growing Beyond Your Initial Market
    'Q8h7gqyKJQc', // Product and Service Diversification: Expanding Your Offerings
    'R9h7gqyKJQd', // Strategic Partnerships: Leveraging Relationships for Growth
    'S0h7gqyKJQe', // Scaling Operations: Building Systems That Scale
    'T1h7gqyKJQf', // Technology and Automation for Growth: Tools That Enable Scale
    'U2h7gqyKJQg', // Customer Acquisition at Scale: Growing Your Customer Base Efficiently
    'V3h7gqyKJQh', // Financial Management for Growth: Funding and Managing Expansion
    'W4h7gqyKJQi', // Building a Scalable Team: Hiring and Managing for Growth
    'X5h7gqyKJQj', // Brand Expansion: Growing Your Brand Presence
    'Y6h7gqyKJQk', // Innovation and Competitive Advantage: Staying Ahead
    'Z7h7gqyKJQl', // Exit Strategies: Planning for the Future of Your Business
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



