#!/usr/bin/env tsx
/**
 * Add Exam Questions Script
 * 
 * Adds comprehensive exam questions to all 7 final exams.
 * 
 * Usage: tsx scripts/add-exam-questions.ts
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

// Exam questions for each course
const examQuestions = {
  1: [ // Foundation: Business Fundamentals
    {
      text: 'What is the primary purpose of a business plan?',
      options: [
        { text: 'To secure funding from investors', isCorrect: false },
        { text: 'To provide a roadmap for business operations and growth', isCorrect: true },
        { text: 'To comply with legal requirements', isCorrect: false },
        { text: 'To impress potential customers', isCorrect: false },
      ],
    },
    {
      text: 'Which of the following is a key component of market research?',
      options: [
        { text: 'Analyzing competitor strategies', isCorrect: true },
        { text: 'Setting product prices', isCorrect: false },
        { text: 'Hiring employees', isCorrect: false },
        { text: 'Designing logos', isCorrect: false },
      ],
    },
    {
      text: 'What does SWOT analysis stand for?',
      options: [
        { text: 'Strengths, Weaknesses, Opportunities, Threats', isCorrect: true },
        { text: 'Sales, Workflow, Operations, Technology', isCorrect: false },
        { text: 'Strategy, Work, Organization, Team', isCorrect: false },
        { text: 'Success, Wealth, Objectives, Targets', isCorrect: false },
      ],
    },
    {
      text: 'What is the difference between a mission and a vision statement?',
      options: [
        { text: 'Mission describes what you do, vision describes where you want to be', isCorrect: true },
        { text: 'Mission is for employees, vision is for customers', isCorrect: false },
        { text: 'There is no difference', isCorrect: false },
        { text: 'Mission is short-term, vision is long-term only', isCorrect: false },
      ],
    },
    {
      text: 'Which business structure offers the most personal liability protection?',
      options: [
        { text: 'Sole Proprietorship', isCorrect: false },
        { text: 'Partnership', isCorrect: false },
        { text: 'LLC or Corporation', isCorrect: true },
        { text: 'All offer the same protection', isCorrect: false },
      ],
    },
    {
      text: 'What is a target market?',
      options: [
        { text: 'All potential customers', isCorrect: false },
        { text: 'A specific group of customers most likely to buy your product', isCorrect: true },
        { text: 'Your competitors', isCorrect: false },
        { text: 'Your suppliers', isCorrect: false },
      ],
    },
    {
      text: 'What is the break-even point?',
      options: [
        { text: 'When you make your first sale', isCorrect: false },
        { text: 'When revenue equals total costs', isCorrect: true },
        { text: 'When you hire your first employee', isCorrect: false },
        { text: 'When you break even with competitors', isCorrect: false },
      ],
    },
    {
      text: 'Which is NOT a common source of business funding?',
      options: [
        { text: 'Personal savings', isCorrect: false },
        { text: 'Bank loans', isCorrect: false },
        { text: 'Venture capital', isCorrect: false },
        { text: 'Winning the lottery', isCorrect: true },
      ],
    },
    {
      text: 'What is customer acquisition cost (CAC)?',
      options: [
        { text: 'The cost to keep a customer', isCorrect: false },
        { text: 'The total cost to acquire a new customer', isCorrect: true },
        { text: 'The price of your product', isCorrect: false },
        { text: 'The cost of customer service', isCorrect: false },
      ],
    },
    {
      text: 'What is the purpose of a value proposition?',
      options: [
        { text: 'To set product prices', isCorrect: false },
        { text: 'To clearly communicate why customers should choose your product', isCorrect: true },
        { text: 'To describe your company history', isCorrect: false },
        { text: 'To list all your products', isCorrect: false },
      ],
    },
    {
      text: 'Which financial statement shows revenue and expenses?',
      options: [
        { text: 'Balance Sheet', isCorrect: false },
        { text: 'Income Statement', isCorrect: true },
        { text: 'Cash Flow Statement', isCorrect: false },
        { text: 'Profit & Loss Statement (same as Income Statement)', isCorrect: true },
      ],
    },
    {
      text: 'What is the difference between fixed and variable costs?',
      options: [
        { text: 'Fixed costs change with production, variable costs stay the same', isCorrect: false },
        { text: 'Fixed costs stay the same, variable costs change with production', isCorrect: true },
        { text: 'There is no difference', isCorrect: false },
        { text: 'Fixed costs are higher than variable costs', isCorrect: false },
      ],
    },
    {
      text: 'What is a competitive advantage?',
      options: [
        { text: 'Having more money than competitors', isCorrect: false },
        { text: 'A unique strength that gives you an edge over competitors', isCorrect: true },
        { text: 'Being the first business in your industry', isCorrect: false },
        { text: 'Having the lowest prices', isCorrect: false },
      ],
    },
    {
      text: 'What is the purpose of a business model?',
      options: [
        { text: 'To describe how your business creates and delivers value', isCorrect: true },
        { text: 'To set employee salaries', isCorrect: false },
        { text: 'To design your website', isCorrect: false },
        { text: 'To choose your business name', isCorrect: false },
      ],
    },
    {
      text: 'Which is a key principle of effective goal setting?',
      options: [
        { text: 'Goals should be vague and flexible', isCorrect: false },
        { text: 'Goals should be SMART (Specific, Measurable, Achievable, Relevant, Time-bound)', isCorrect: true },
        { text: 'Goals should change daily', isCorrect: false },
        { text: 'Goals should be set by others', isCorrect: false },
      ],
    },
    {
      text: 'What is market segmentation?',
      options: [
        { text: 'Dividing the market into smaller groups with similar needs', isCorrect: true },
        { text: 'Splitting your business into departments', isCorrect: false },
        { text: 'Separating products by price', isCorrect: false },
        { text: 'Dividing profits among partners', isCorrect: false },
      ],
    },
    {
      text: 'What is the importance of cash flow management?',
      options: [
        { text: 'It ensures you always have money to pay bills and operate', isCorrect: true },
        { text: 'It increases your revenue', isCorrect: false },
        { text: 'It reduces your expenses', isCorrect: false },
        { text: 'It is not important', isCorrect: false },
      ],
    },
    {
      text: 'What is a business license?',
      options: [
        { text: 'A permit required to operate a business legally', isCorrect: true },
        { text: 'A discount card for business supplies', isCorrect: false },
        { text: 'A certificate of completion', isCorrect: false },
        { text: 'A type of insurance', isCorrect: false },
      ],
    },
    {
      text: 'What is the role of branding in business?',
      options: [
        { text: 'To create a memorable identity and emotional connection with customers', isCorrect: true },
        { text: 'To set product prices', isCorrect: false },
        { text: 'To hire employees', isCorrect: false },
        { text: 'To file taxes', isCorrect: false },
      ],
    },
    {
      text: 'What is scalability in business?',
      options: [
        { text: 'The ability to grow without proportional increases in costs', isCorrect: true },
        { text: 'The size of your office', isCorrect: false },
        { text: 'The number of employees', isCorrect: false },
        { text: 'The price of your products', isCorrect: false },
      ],
    },
  ],
  2: [ // Marketing Mastery
    {
      text: 'What is the primary goal of marketing?',
      options: [
        { text: 'To create awareness and drive customer action', isCorrect: true },
        { text: 'To reduce costs', isCorrect: false },
        { text: 'To manage employees', isCorrect: false },
        { text: 'To file taxes', isCorrect: false },
      ],
    },
    {
      text: 'What does the "4 Ps" of marketing stand for?',
      options: [
        { text: 'Product, Price, Place, Promotion', isCorrect: true },
        { text: 'People, Process, Profit, Performance', isCorrect: false },
        { text: 'Plan, Produce, Promote, Profit', isCorrect: false },
        { text: 'Price, Profit, People, Process', isCorrect: false },
      ],
    },
    {
      text: 'What is a target audience?',
      options: [
        { text: 'Everyone who might buy your product', isCorrect: false },
        { text: 'A specific group of people most likely to be interested in your product', isCorrect: true },
        { text: 'Your competitors', isCorrect: false },
        { text: 'Your employees', isCorrect: false },
      ],
    },
    {
      text: 'What is content marketing?',
      options: [
        { text: 'Creating valuable content to attract and engage your audience', isCorrect: true },
        { text: 'Selling content online', isCorrect: false },
        { text: 'Writing blog posts only', isCorrect: false },
        { text: 'Posting on social media', isCorrect: false },
      ],
    },
    {
      text: 'What is SEO?',
      options: [
        { text: 'Search Engine Optimization - improving visibility in search results', isCorrect: true },
        { text: 'Social Engagement Optimization', isCorrect: false },
        { text: 'Sales Efficiency Operations', isCorrect: false },
        { text: 'Strategic Enterprise Organization', isCorrect: false },
      ],
    },
    {
      text: 'What is a call-to-action (CTA)?',
      options: [
        { text: 'A prompt that encourages the audience to take a specific action', isCorrect: true },
        { text: 'A phone number to call', isCorrect: false },
        { text: 'A customer complaint', isCorrect: false },
        { text: 'A marketing budget', isCorrect: false },
      ],
    },
    {
      text: 'What is brand positioning?',
      options: [
        { text: 'How your brand is perceived relative to competitors', isCorrect: true },
        { text: 'Where your office is located', isCorrect: false },
        { text: 'Your product placement in stores', isCorrect: false },
        { text: 'Your website position in search results', isCorrect: false },
      ],
    },
    {
      text: 'What is email marketing?',
      options: [
        { text: 'Sending promotional messages to a list of subscribers', isCorrect: true },
        { text: 'Spamming everyone', isCorrect: false },
        { text: 'Only sending invoices', isCorrect: false },
        { text: 'Emailing competitors', isCorrect: false },
      ],
    },
    {
      text: 'What is social media marketing?',
      options: [
        { text: 'Using social platforms to promote your brand and engage with customers', isCorrect: true },
        { text: 'Only posting on Facebook', isCorrect: false },
        { text: 'Buying followers', isCorrect: false },
        { text: 'Spamming social media', isCorrect: false },
      ],
    },
    {
      text: 'What is customer retention?',
      options: [
        { text: 'Keeping existing customers and encouraging repeat business', isCorrect: true },
        { text: 'Getting new customers', isCorrect: false },
        { text: 'Firing customers', isCorrect: false },
        { text: 'Reducing customer service', isCorrect: false },
      ],
    },
    {
      text: 'What is a marketing funnel?',
      options: [
        { text: 'The customer journey from awareness to purchase', isCorrect: true },
        { text: 'A physical funnel for products', isCorrect: false },
        { text: 'A type of email campaign', isCorrect: false },
        { text: 'A sales technique', isCorrect: false },
      ],
    },
    {
      text: 'What is influencer marketing?',
      options: [
        { text: 'Partnering with influential people to promote your brand', isCorrect: true },
        { text: 'Influencing your employees', isCorrect: false },
        { text: 'Copying competitors', isCorrect: false },
        { text: 'Only using celebrities', isCorrect: false },
      ],
    },
    {
      text: 'What is A/B testing?',
      options: [
        { text: 'Comparing two versions to see which performs better', isCorrect: true },
        { text: 'Testing products A and B', isCorrect: false },
        { text: 'Grading marketing campaigns', isCorrect: false },
        { text: 'Comparing two competitors', isCorrect: false },
      ],
    },
    {
      text: 'What is conversion rate?',
      options: [
        { text: 'The percentage of visitors who take a desired action', isCorrect: true },
        { text: 'The rate at which you convert competitors', isCorrect: false },
        { text: 'How fast you respond to emails', isCorrect: false },
        { text: 'The speed of your website', isCorrect: false },
      ],
    },
    {
      text: 'What is a marketing campaign?',
      options: [
        { text: 'A coordinated series of marketing activities with a specific goal', isCorrect: true },
        { text: 'A single advertisement', isCorrect: false },
        { text: 'Your entire marketing strategy', isCorrect: false },
        { text: 'A political campaign', isCorrect: false },
      ],
    },
    {
      text: 'What is brand awareness?',
      options: [
        { text: 'How familiar people are with your brand', isCorrect: true },
        { text: 'Your brand name', isCorrect: false },
        { text: 'Your logo design', isCorrect: false },
        { text: 'Your website traffic', isCorrect: false },
      ],
    },
    {
      text: 'What is customer lifetime value (CLV)?',
      options: [
        { text: 'The total revenue a customer generates over their relationship with you', isCorrect: true },
        { text: 'The price of one product', isCorrect: false },
        { text: 'How long a customer lives', isCorrect: false },
        { text: 'The cost to acquire a customer', isCorrect: false },
      ],
    },
    {
      text: 'What is remarketing?',
      options: [
        { text: 'Targeting ads to people who previously visited your website', isCorrect: true },
        { text: 'Redoing your marketing', isCorrect: false },
        { text: 'Marketing to competitors', isCorrect: false },
        { text: 'Changing your brand', isCorrect: false },
      ],
    },
    {
      text: 'What is a marketing persona?',
      options: [
        { text: 'A fictional representation of your ideal customer', isCorrect: true },
        { text: 'A real customer', isCorrect: false },
        { text: 'A celebrity spokesperson', isCorrect: false },
        { text: 'A marketing employee', isCorrect: false },
      ],
    },
    {
      text: 'What is the purpose of analytics in marketing?',
      options: [
        { text: 'To measure performance and make data-driven decisions', isCorrect: true },
        { text: 'To increase prices', isCorrect: false },
        { text: 'To reduce costs only', isCorrect: false },
        { text: 'To fire employees', isCorrect: false },
      ],
    },
  ],
  3: [ // Financial Intelligence
    {
      text: 'What is the primary purpose of a profit and loss statement?',
      options: [
        { text: 'To show revenue, expenses, and profit over a period', isCorrect: true },
        { text: 'To list all assets', isCorrect: false },
        { text: 'To track inventory', isCorrect: false },
        { text: 'To calculate taxes only', isCorrect: false },
      ],
    },
    {
      text: 'What is cash flow?',
      options: [
        { text: 'The movement of money in and out of your business', isCorrect: true },
        { text: 'Your total revenue', isCorrect: false },
        { text: 'Your bank balance', isCorrect: false },
        { text: 'Your profit', isCorrect: false },
      ],
    },
    {
      text: 'What is the difference between revenue and profit?',
      options: [
        { text: 'Revenue is total income, profit is revenue minus expenses', isCorrect: true },
        { text: 'They are the same thing', isCorrect: false },
        { text: 'Revenue is profit minus expenses', isCorrect: false },
        { text: 'Profit is always higher than revenue', isCorrect: false },
      ],
    },
    {
      text: 'What is a balance sheet?',
      options: [
        { text: 'A snapshot of assets, liabilities, and equity at a point in time', isCorrect: true },
        { text: 'A list of expenses', isCorrect: false },
        { text: 'A profit statement', isCorrect: false },
        { text: 'A cash flow report', isCorrect: false },
      ],
    },
    {
      text: 'What is accounts receivable?',
      options: [
        { text: 'Money customers owe you for products/services sold', isCorrect: true },
        { text: 'Money you owe to suppliers', isCorrect: false },
        { text: 'Your bank account balance', isCorrect: false },
        { text: 'Your total revenue', isCorrect: false },
      ],
    },
    {
      text: 'What is accounts payable?',
      options: [
        { text: 'Money you owe to suppliers and vendors', isCorrect: true },
        { text: 'Money customers owe you', isCorrect: false },
        { text: 'Your profit', isCorrect: false },
        { text: 'Your expenses', isCorrect: false },
      ],
    },
    {
      text: 'What is gross profit?',
      options: [
        { text: 'Revenue minus cost of goods sold', isCorrect: true },
        { text: 'Total revenue', isCorrect: false },
        { text: 'Net profit', isCorrect: false },
        { text: 'Operating expenses', isCorrect: false },
      ],
    },
    {
      text: 'What is net profit?',
      options: [
        { text: 'Revenue minus all expenses', isCorrect: true },
        { text: 'Gross profit only', isCorrect: false },
        { text: 'Revenue before expenses', isCorrect: false },
        { text: 'Cash in bank', isCorrect: false },
      ],
    },
    {
      text: 'What is a budget?',
      options: [
        { text: 'A financial plan for income and expenses over a period', isCorrect: true },
        { text: 'Your bank balance', isCorrect: false },
        { text: 'Your profit', isCorrect: false },
        { text: 'A list of expenses only', isCorrect: false },
      ],
    },
    {
      text: 'What is the purpose of financial forecasting?',
      options: [
        { text: 'To predict future financial performance and plan accordingly', isCorrect: true },
        { text: 'To calculate past profits', isCorrect: false },
        { text: 'To file taxes', isCorrect: false },
        { text: 'To track inventory', isCorrect: false },
      ],
    },
    {
      text: 'What is working capital?',
      options: [
        { text: 'Current assets minus current liabilities', isCorrect: true },
        { text: 'Your total assets', isCorrect: false },
        { text: 'Your profit', isCorrect: false },
        { text: 'Your revenue', isCorrect: false },
      ],
    },
    {
      text: 'What is depreciation?',
      options: [
        { text: 'The decrease in value of assets over time', isCorrect: true },
        { text: 'An increase in value', isCorrect: false },
        { text: 'Your expenses', isCorrect: false },
        { text: 'Your profit', isCorrect: false },
      ],
    },
    {
      text: 'What is a financial ratio?',
      options: [
        { text: 'A comparison of two financial metrics to analyze performance', isCorrect: true },
        { text: 'Your profit percentage', isCorrect: false },
        { text: 'Your tax rate', isCorrect: false },
        { text: 'Your expense ratio', isCorrect: false },
      ],
    },
    {
      text: 'What is break-even analysis?',
      options: [
        { text: 'Determining the point where revenue equals total costs', isCorrect: true },
        { text: 'Analyzing when you break even with competitors', isCorrect: false },
        { text: 'Calculating your profit', isCorrect: false },
        { text: 'Tracking your expenses', isCorrect: false },
      ],
    },
    {
      text: 'What is ROI (Return on Investment)?',
      options: [
        { text: 'A measure of profitability relative to investment cost', isCorrect: true },
        { text: 'Your total revenue', isCorrect: false },
        { text: 'Your profit', isCorrect: false },
        { text: 'Your expenses', isCorrect: false },
      ],
    },
    {
      text: 'What is a financial audit?',
      options: [
        { text: 'An examination of financial records for accuracy', isCorrect: true },
        { text: 'A tax filing', isCorrect: false },
        { text: 'A budget review', isCorrect: false },
        { text: 'A profit calculation', isCorrect: false },
      ],
    },
    {
      text: 'What is the difference between fixed and variable costs?',
      options: [
        { text: 'Fixed costs stay constant, variable costs change with production', isCorrect: true },
        { text: 'They are the same', isCorrect: false },
        { text: 'Fixed costs change, variable costs stay constant', isCorrect: false },
        { text: 'Both always increase', isCorrect: false },
      ],
    },
    {
      text: 'What is equity?',
      options: [
        { text: 'The owner\'s stake in the business (assets minus liabilities)', isCorrect: true },
        { text: 'Your total assets', isCorrect: false },
        { text: 'Your profit', isCorrect: false },
        { text: 'Your revenue', isCorrect: false },
      ],
    },
    {
      text: 'What is a financial statement?',
      options: [
        { text: 'A formal record of financial activities and position', isCorrect: true },
        { text: 'A bank statement only', isCorrect: false },
        { text: 'A tax return', isCorrect: false },
        { text: 'A budget', isCorrect: false },
      ],
    },
    {
      text: 'What is the purpose of bookkeeping?',
      options: [
        { text: 'To systematically record all financial transactions', isCorrect: true },
        { text: 'To calculate taxes only', isCorrect: false },
        { text: 'To track inventory', isCorrect: false },
        { text: 'To manage employees', isCorrect: false },
      ],
    },
  ],
  4: [ // Sales & Conversion
    {
      text: 'What is the primary goal of the sales process?',
      options: [
        { text: 'To guide prospects from awareness to purchase', isCorrect: true },
        { text: 'To reduce prices', isCorrect: false },
        { text: 'To fire employees', isCorrect: false },
        { text: 'To track inventory', isCorrect: false },
      ],
    },
    {
      text: 'What is a sales funnel?',
      options: [
        { text: 'The journey prospects take from awareness to purchase', isCorrect: true },
        { text: 'A physical funnel', isCorrect: false },
        { text: 'A list of customers', isCorrect: false },
        { text: 'A pricing strategy', isCorrect: false },
      ],
    },
    {
      text: 'What is a lead?',
      options: [
        { text: 'A potential customer who has shown interest', isCorrect: true },
        { text: 'A current customer', isCorrect: false },
        { text: 'A competitor', isCorrect: false },
        { text: 'An employee', isCorrect: false },
      ],
    },
    {
      text: 'What is conversion rate?',
      options: [
        { text: 'The percentage of leads that become customers', isCorrect: true },
        { text: 'The speed of sales', isCorrect: false },
        { text: 'The number of products sold', isCorrect: false },
        { text: 'The profit margin', isCorrect: false },
      ],
    },
    {
      text: 'What is objection handling?',
      options: [
        { text: 'Addressing customer concerns and overcoming resistance', isCorrect: true },
        { text: 'Rejecting customers', isCorrect: false },
        { text: 'Ignoring complaints', isCorrect: false },
        { text: 'Lowering prices', isCorrect: false },
      ],
    },
    {
      text: 'What is a value proposition?',
      options: [
        { text: 'A clear statement of the unique value you provide', isCorrect: true },
        { text: 'Your product price', isCorrect: false },
        { text: 'Your company name', isCorrect: false },
        { text: 'Your sales pitch', isCorrect: false },
      ],
    },
    {
      text: 'What is consultative selling?',
      options: [
        { text: 'Understanding customer needs and providing solutions', isCorrect: true },
        { text: 'Pushing products aggressively', isCorrect: false },
        { text: 'Selling only to friends', isCorrect: false },
        { text: 'Copying competitors', isCorrect: false },
      ],
    },
    {
      text: 'What is customer relationship management (CRM)?',
      options: [
        { text: 'A system to manage customer interactions and data', isCorrect: true },
        { text: 'A customer database only', isCorrect: false },
        { text: 'A sales technique', isCorrect: false },
        { text: 'A marketing tool', isCorrect: false },
      ],
    },
    {
      text: 'What is upselling?',
      options: [
        { text: 'Encouraging customers to buy a higher-value product', isCorrect: true },
        { text: 'Selling to new customers', isCorrect: false },
        { text: 'Reducing prices', isCorrect: false },
        { text: 'Firing customers', isCorrect: false },
      ],
    },
    {
      text: 'What is cross-selling?',
      options: [
        { text: 'Offering complementary products to existing customers', isCorrect: true },
        { text: 'Selling across different markets', isCorrect: false },
        { text: 'Competing with others', isCorrect: false },
        { text: 'Reducing inventory', isCorrect: false },
      ],
    },
    {
      text: 'What is a sales pipeline?',
      options: [
        { text: 'A visual representation of sales opportunities at different stages', isCorrect: true },
        { text: 'A physical pipe', isCorrect: false },
        { text: 'A list of products', isCorrect: false },
        { text: 'A customer database', isCorrect: false },
      ],
    },
    {
      text: 'What is closing a sale?',
      options: [
        { text: 'Finalizing the purchase agreement', isCorrect: true },
        { text: 'Ending the conversation', isCorrect: false },
        { text: 'Rejecting the customer', isCorrect: false },
        { text: 'Lowering the price', isCorrect: false },
      ],
    },
    {
      text: 'What is follow-up in sales?',
      options: [
        { text: 'Maintaining contact after initial interaction', isCorrect: true },
        { text: 'Giving up on a lead', isCorrect: false },
        { text: 'Ignoring customers', isCorrect: false },
        { text: 'Reducing prices', isCorrect: false },
      ],
    },
    {
      text: 'What is a qualified lead?',
      options: [
        { text: 'A lead that meets your ideal customer criteria', isCorrect: true },
        { text: 'Any person who visits your website', isCorrect: false },
        { text: 'A competitor', isCorrect: false },
        { text: 'An employee', isCorrect: false },
      ],
    },
    {
      text: 'What is sales forecasting?',
      options: [
        { text: 'Predicting future sales based on data and trends', isCorrect: true },
        { text: 'Calculating past sales', isCorrect: false },
        { text: 'Setting prices', isCorrect: false },
        { text: 'Tracking inventory', isCorrect: false },
      ],
    },
    {
      text: 'What is the difference between B2B and B2C sales?',
      options: [
        { text: 'B2B is business-to-business, B2C is business-to-consumer', isCorrect: true },
        { text: 'They are the same', isCorrect: false },
        { text: 'B2B is online, B2C is offline', isCorrect: false },
        { text: 'B2B is cheaper, B2C is expensive', isCorrect: false },
      ],
    },
    {
      text: 'What is a sales quota?',
      options: [
        { text: 'A target sales goal to achieve', isCorrect: true },
        { text: 'A customer limit', isCorrect: false },
        { text: 'A price limit', isCorrect: false },
        { text: 'A time limit', isCorrect: false },
      ],
    },
    {
      text: 'What is relationship selling?',
      options: [
        { text: 'Building long-term relationships with customers', isCorrect: true },
        { text: 'Selling only to friends', isCorrect: false },
        { text: 'One-time transactions only', isCorrect: false },
        { text: 'Ignoring customer needs', isCorrect: false },
      ],
    },
    {
      text: 'What is the purpose of a sales script?',
      options: [
        { text: 'To provide a consistent framework for sales conversations', isCorrect: true },
        { text: 'To force customers to buy', isCorrect: false },
        { text: 'To replace listening', isCorrect: false },
        { text: 'To automate all sales', isCorrect: false },
      ],
    },
    {
      text: 'What is customer retention?',
      options: [
        { text: 'Keeping existing customers and encouraging repeat business', isCorrect: true },
        { text: 'Getting new customers only', isCorrect: false },
        { text: 'Firing customers', isCorrect: false },
        { text: 'Reducing service', isCorrect: false },
      ],
    },
  ],
  5: [ // Operations & Systems
    {
      text: 'What is the primary goal of business operations?',
      options: [
        { text: 'To efficiently deliver products/services to customers', isCorrect: true },
        { text: 'To increase prices', isCorrect: false },
        { text: 'To reduce quality', isCorrect: false },
        { text: 'To fire employees', isCorrect: false },
      ],
    },
    {
      text: 'What is a business process?',
      options: [
        { text: 'A series of steps to accomplish a business task', isCorrect: true },
        { text: 'A single action', isCorrect: false },
        { text: 'A product', isCorrect: false },
        { text: 'An employee', isCorrect: false },
      ],
    },
    {
      text: 'What is process optimization?',
      options: [
        { text: 'Improving processes to be more efficient and effective', isCorrect: true },
        { text: 'Making processes longer', isCorrect: false },
        { text: 'Eliminating all processes', isCorrect: false },
        { text: 'Copying competitors', isCorrect: false },
      ],
    },
    {
      text: 'What is automation?',
      options: [
        { text: 'Using technology to perform tasks without human intervention', isCorrect: true },
        { text: 'Firing all employees', isCorrect: false },
        { text: 'Reducing quality', isCorrect: false },
        { text: 'Eliminating processes', isCorrect: false },
      ],
    },
    {
      text: 'What is a standard operating procedure (SOP)?',
      options: [
        { text: 'A documented set of steps for completing a task', isCorrect: true },
        { text: 'A product manual', isCorrect: false },
        { text: 'An employee handbook', isCorrect: false },
        { text: 'A marketing plan', isCorrect: false },
      ],
    },
    {
      text: 'What is quality control?',
      options: [
        { text: 'Processes to ensure products/services meet standards', isCorrect: true },
        { text: 'Reducing costs only', isCorrect: false },
        { text: 'Increasing prices', isCorrect: false },
        { text: 'Firing employees', isCorrect: false },
      ],
    },
    {
      text: 'What is inventory management?',
      options: [
        { text: 'Tracking and controlling stock levels', isCorrect: true },
        { text: 'Buying everything', isCorrect: false },
        { text: 'Selling everything', isCorrect: false },
        { text: 'Ignoring inventory', isCorrect: false },
      ],
    },
    {
      text: 'What is supply chain management?',
      options: [
        { text: 'Managing the flow of goods from suppliers to customers', isCorrect: true },
        { text: 'Managing only suppliers', isCorrect: false },
        { text: 'Managing only customers', isCorrect: false },
        { text: 'Managing employees only', isCorrect: false },
      ],
    },
    {
      text: 'What is scalability?',
      options: [
        { text: 'The ability to grow without proportional cost increases', isCorrect: true },
        { text: 'The size of your office', isCorrect: false },
        { text: 'The number of employees', isCorrect: false },
        { text: 'Your revenue', isCorrect: false },
      ],
    },
    {
      text: 'What is a workflow?',
      options: [
        { text: 'A sequence of tasks to complete a process', isCorrect: true },
        { text: 'A single task', isCorrect: false },
        { text: 'A product', isCorrect: false },
        { text: 'An employee', isCorrect: false },
      ],
    },
    {
      text: 'What is efficiency?',
      options: [
        { text: 'Achieving maximum output with minimum waste', isCorrect: true },
        { text: 'Working faster only', isCorrect: false },
        { text: 'Reducing quality', isCorrect: false },
        { text: 'Firing employees', isCorrect: false },
      ],
    },
    {
      text: 'What is a KPI (Key Performance Indicator)?',
      options: [
        { text: 'A measurable value that shows how effectively goals are achieved', isCorrect: true },
        { text: 'A product feature', isCorrect: false },
        { text: 'An employee name', isCorrect: false },
        { text: 'A customer name', isCorrect: false },
      ],
    },
    {
      text: 'What is lean operations?',
      options: [
        { text: 'Eliminating waste and maximizing value', isCorrect: true },
        { text: 'Reducing quality', isCorrect: false },
        { text: 'Firing employees', isCorrect: false },
        { text: 'Cutting all costs', isCorrect: false },
      ],
    },
    {
      text: 'What is project management?',
      options: [
        { text: 'Planning, organizing, and executing projects to achieve goals', isCorrect: true },
        { text: 'Managing only employees', isCorrect: false },
        { text: 'Managing only customers', isCorrect: false },
        { text: 'Managing only finances', isCorrect: false },
      ],
    },
    {
      text: 'What is vendor management?',
      options: [
        { text: 'Managing relationships with suppliers and service providers', isCorrect: true },
        { text: 'Managing only customers', isCorrect: false },
        { text: 'Managing only employees', isCorrect: false },
        { text: 'Managing only products', isCorrect: false },
      ],
    },
    {
      text: 'What is capacity planning?',
      options: [
        { text: 'Determining the resources needed to meet demand', isCorrect: true },
        { text: 'Planning office space only', isCorrect: false },
        { text: 'Planning employee schedules only', isCorrect: false },
        { text: 'Planning marketing only', isCorrect: false },
      ],
    },
    {
      text: 'What is a bottleneck?',
      options: [
        { text: 'A point in a process that limits overall capacity', isCorrect: true },
        { text: 'A type of product', isCorrect: false },
        { text: 'An employee issue', isCorrect: false },
        { text: 'A customer problem', isCorrect: false },
      ],
    },
    {
      text: 'What is continuous improvement?',
      options: [
        { text: 'Ongoing effort to improve processes and systems', isCorrect: true },
        { text: 'Making one big change', isCorrect: false },
        { text: 'Never changing anything', isCorrect: false },
        { text: 'Copying competitors only', isCorrect: false },
      ],
    },
    {
      text: 'What is risk management?',
      options: [
        { text: 'Identifying and mitigating potential problems', isCorrect: true },
        { text: 'Avoiding all risks', isCorrect: false },
        { text: 'Ignoring problems', isCorrect: false },
        { text: 'Taking all risks', isCorrect: false },
      ],
    },
    {
      text: 'What is the purpose of documentation?',
      options: [
        { text: 'To create a record of processes and procedures', isCorrect: true },
        { text: 'To replace training', isCorrect: false },
        { text: 'To fire employees', isCorrect: false },
        { text: 'To reduce quality', isCorrect: false },
      ],
    },
  ],
  6: [ // Leadership & Team Building
    {
      text: 'What is leadership?',
      options: [
        { text: 'The ability to guide and influence others toward a common goal', isCorrect: true },
        { text: 'Being the boss', isCorrect: false },
        { text: 'Having the most power', isCorrect: false },
        { text: 'Making all decisions alone', isCorrect: false },
      ],
    },
    {
      text: 'What is the difference between leadership and management?',
      options: [
        { text: 'Leadership inspires and guides, management organizes and controls', isCorrect: true },
        { text: 'They are the same', isCorrect: false },
        { text: 'Leadership is for employees, management is for customers', isCorrect: false },
        { text: 'Leadership is short-term, management is long-term', isCorrect: false },
      ],
    },
    {
      text: 'What is emotional intelligence?',
      options: [
        { text: 'The ability to understand and manage emotions in yourself and others', isCorrect: true },
        { text: 'Being emotional', isCorrect: false },
        { text: 'Ignoring emotions', isCorrect: false },
        { text: 'Only managing your own emotions', isCorrect: false },
      ],
    },
    {
      text: 'What is delegation?',
      options: [
        { text: 'Assigning tasks and authority to others', isCorrect: true },
        { text: 'Doing everything yourself', isCorrect: false },
        { text: 'Firing employees', isCorrect: false },
        { text: 'Ignoring tasks', isCorrect: false },
      ],
    },
    {
      text: 'What is team building?',
      options: [
        { text: 'Activities and strategies to improve team cohesion and performance', isCorrect: true },
        { text: 'Building a physical team', isCorrect: false },
        { text: 'Hiring employees only', isCorrect: false },
        { text: 'Firing employees', isCorrect: false },
      ],
    },
    {
      text: 'What is a team culture?',
      options: [
        { text: 'Shared values, beliefs, and behaviors of a team', isCorrect: true },
        { text: 'The office location', isCorrect: false },
        { text: 'The team size', isCorrect: false },
        { text: 'The team budget', isCorrect: false },
      ],
    },
    {
      text: 'What is conflict resolution?',
      options: [
        { text: 'Addressing and resolving disagreements constructively', isCorrect: true },
        { text: 'Avoiding all conflicts', isCorrect: false },
        { text: 'Firing people who disagree', isCorrect: false },
        { text: 'Ignoring problems', isCorrect: false },
      ],
    },
    {
      text: 'What is employee engagement?',
      options: [
        { text: 'The level of commitment and enthusiasm employees have', isCorrect: true },
        { text: 'Hiring employees', isCorrect: false },
        { text: 'Firing employees', isCorrect: false },
        { text: 'Employee attendance only', isCorrect: false },
      ],
    },
    {
      text: 'What is performance management?',
      options: [
        { text: 'Ongoing process of setting goals and providing feedback', isCorrect: true },
        { text: 'Firing underperformers only', isCorrect: false },
        { text: 'Setting salaries only', isCorrect: false },
        { text: 'Tracking attendance only', isCorrect: false },
      ],
    },
    {
      text: 'What is mentorship?',
      options: [
        { text: 'Guiding and developing others through experience and knowledge sharing', isCorrect: true },
        { text: 'Managing employees', isCorrect: false },
        { text: 'Firing employees', isCorrect: false },
        { text: 'Training only', isCorrect: false },
      ],
    },
    {
      text: 'What is accountability?',
      options: [
        { text: 'Taking responsibility for actions and outcomes', isCorrect: true },
        { text: 'Blaming others', isCorrect: false },
        { text: 'Avoiding responsibility', isCorrect: false },
        { text: 'Making excuses', isCorrect: false },
      ],
    },
    {
      text: 'What is communication in leadership?',
      options: [
        { text: 'Clearly conveying information and expectations', isCorrect: true },
        { text: 'Talking only', isCorrect: false },
        { text: 'Emailing only', isCorrect: false },
        { text: 'Meetings only', isCorrect: false },
      ],
    },
    {
      text: 'What is a vision statement?',
      options: [
        { text: 'A description of where the organization wants to be in the future', isCorrect: true },
        { text: 'A list of goals', isCorrect: false },
        { text: 'A mission statement', isCorrect: false },
        { text: 'A budget', isCorrect: false },
      ],
    },
    {
      text: 'What is change management?',
      options: [
        { text: 'Guiding people and organizations through transitions', isCorrect: true },
        { text: 'Forcing changes', isCorrect: false },
        { text: 'Ignoring resistance', isCorrect: false },
        { text: 'Making sudden changes only', isCorrect: false },
      ],
    },
    {
      text: 'What is empowerment?',
      options: [
        { text: 'Giving others authority and confidence to act', isCorrect: true },
        { text: 'Controlling everything', isCorrect: false },
        { text: 'Micromanaging', isCorrect: false },
        { text: 'Firing employees', isCorrect: false },
      ],
    },
    {
      text: 'What is diversity and inclusion?',
      options: [
        { text: 'Valuing different perspectives and ensuring everyone feels welcome', isCorrect: true },
        { text: 'Hiring only similar people', isCorrect: false },
        { text: 'Ignoring differences', isCorrect: false },
        { text: 'Separating people', isCorrect: false },
      ],
    },
    {
      text: 'What is feedback?',
      options: [
        { text: 'Information about performance to help improve', isCorrect: true },
        { text: 'Only criticism', isCorrect: false },
        { text: 'Only praise', isCorrect: false },
        { text: 'Firing employees', isCorrect: false },
      ],
    },
    {
      text: 'What is a high-performing team?',
      options: [
        { text: 'A team that consistently achieves exceptional results', isCorrect: true },
        { text: 'A large team', isCorrect: false },
        { text: 'A team with the most members', isCorrect: false },
        { text: 'A team that works the longest hours', isCorrect: false },
      ],
    },
    {
      text: 'What is servant leadership?',
      options: [
        { text: 'Leading by serving and supporting others first', isCorrect: true },
        { text: 'Being a servant', isCorrect: false },
        { text: 'Following others', isCorrect: false },
        { text: 'Avoiding leadership', isCorrect: false },
      ],
    },
    {
      text: 'What is the purpose of team meetings?',
      options: [
        { text: 'To align on goals, share information, and collaborate', isCorrect: true },
        { text: 'To waste time', isCorrect: false },
        { text: 'To fire employees', isCorrect: false },
        { text: 'To avoid work', isCorrect: false },
      ],
    },
  ],
  7: [ // Growth & Scaling
    {
      text: 'What is business scaling?',
      options: [
        { text: 'Growing the business while maintaining or improving efficiency', isCorrect: true },
        { text: 'Making the business smaller', isCorrect: false },
        { text: 'Increasing prices only', isCorrect: false },
        { text: 'Hiring more employees only', isCorrect: false },
      ],
    },
    {
      text: 'What is the difference between growth and scaling?',
      options: [
        { text: 'Growth increases revenue and costs proportionally, scaling increases revenue faster than costs', isCorrect: true },
        { text: 'They are the same', isCorrect: false },
        { text: 'Growth is for small businesses, scaling is for large', isCorrect: false },
        { text: 'Growth is online, scaling is offline', isCorrect: false },
      ],
    },
    {
      text: 'What is market expansion?',
      options: [
        { text: 'Entering new markets or customer segments', isCorrect: true },
        { text: 'Reducing markets', isCorrect: false },
        { text: 'Closing markets', isCorrect: false },
        { text: 'Ignoring markets', isCorrect: false },
      ],
    },
    {
      text: 'What is product diversification?',
      options: [
        { text: 'Adding new products or services to your offering', isCorrect: true },
        { text: 'Removing products', isCorrect: false },
        { text: 'Reducing variety', isCorrect: false },
        { text: 'Focusing on one product only', isCorrect: false },
      ],
    },
    {
      text: 'What is strategic planning?',
      options: [
        { text: 'Long-term planning to achieve business goals', isCorrect: true },
        { text: 'Short-term planning only', isCorrect: false },
        { text: 'Daily planning', isCorrect: false },
        { text: 'No planning', isCorrect: false },
      ],
    },
    {
      text: 'What is a growth strategy?',
      options: [
        { text: 'A plan to expand the business systematically', isCorrect: true },
        { text: 'Growing randomly', isCorrect: false },
        { text: 'Staying the same size', isCorrect: false },
        { text: 'Reducing size', isCorrect: false },
      ],
    },
    {
      text: 'What is customer acquisition?',
      options: [
        { text: 'The process of gaining new customers', isCorrect: true },
        { text: 'Keeping existing customers only', isCorrect: false },
        { text: 'Firing customers', isCorrect: false },
        { text: 'Reducing customers', isCorrect: false },
      ],
    },
    {
      text: 'What is market penetration?',
      options: [
        { text: 'Increasing market share in existing markets', isCorrect: true },
        { text: 'Entering new markets', isCorrect: false },
        { text: 'Leaving markets', isCorrect: false },
        { text: 'Reducing market share', isCorrect: false },
      ],
    },
    {
      text: 'What is a competitive advantage?',
      options: [
        { text: 'A unique strength that gives you an edge over competitors', isCorrect: true },
        { text: 'Having more money', isCorrect: false },
        { text: 'Being the first business', isCorrect: false },
        { text: 'Having the lowest prices', isCorrect: false },
      ],
    },
    {
      text: 'What is innovation?',
      options: [
        { text: 'Introducing new ideas, methods, or products', isCorrect: true },
        { text: 'Copying competitors', isCorrect: false },
        { text: 'Staying the same', isCorrect: false },
        { text: 'Reducing quality', isCorrect: false },
      ],
    },
    {
      text: 'What is partnership strategy?',
      options: [
        { text: 'Collaborating with other businesses for mutual benefit', isCorrect: true },
        { text: 'Competing with everyone', isCorrect: false },
        { text: 'Working alone only', isCorrect: false },
        { text: 'Copying partners', isCorrect: false },
      ],
    },
    {
      text: 'What is brand expansion?',
      options: [
        { text: 'Extending your brand to new products or markets', isCorrect: true },
        { text: 'Reducing your brand', isCorrect: false },
        { text: 'Changing your brand name', isCorrect: false },
        { text: 'Eliminating your brand', isCorrect: false },
      ],
    },
    {
      text: 'What is technology scaling?',
      options: [
        { text: 'Using technology to support business growth efficiently', isCorrect: true },
        { text: 'Buying more computers only', isCorrect: false },
        { text: 'Ignoring technology', isCorrect: false },
        { text: 'Using old technology only', isCorrect: false },
      ],
    },
    {
      text: 'What is organizational structure?',
      options: [
        { text: 'How a business is organized to achieve its goals', isCorrect: true },
        { text: 'The office layout', isCorrect: false },
        { text: 'The number of employees', isCorrect: false },
        { text: 'The company name', isCorrect: false },
      ],
    },
    {
      text: 'What is risk assessment in scaling?',
      options: [
        { text: 'Evaluating potential challenges and preparing for them', isCorrect: true },
        { text: 'Ignoring all risks', isCorrect: false },
        { text: 'Avoiding all growth', isCorrect: false },
        { text: 'Taking all risks', isCorrect: false },
      ],
    },
    {
      text: 'What is sustainable growth?',
      options: [
        { text: 'Growth that can be maintained long-term without negative consequences', isCorrect: true },
        { text: 'Rapid growth only', isCorrect: false },
        { text: 'No growth', isCorrect: false },
        { text: 'Uncontrolled growth', isCorrect: false },
      ],
    },
    {
      text: 'What is market research in scaling?',
      options: [
        { text: 'Gathering information about markets before expanding', isCorrect: true },
        { text: 'Guessing about markets', isCorrect: false },
        { text: 'Ignoring markets', isCorrect: false },
        { text: 'Copying competitors only', isCorrect: false },
      ],
    },
    {
      text: 'What is resource allocation?',
      options: [
        { text: 'Distributing resources effectively to support growth', isCorrect: true },
        { text: 'Spending everything', isCorrect: false },
        { text: 'Saving everything', isCorrect: false },
        { text: 'Ignoring resources', isCorrect: false },
      ],
    },
    {
      text: 'What is the purpose of metrics in scaling?',
      options: [
        { text: 'To measure progress and make data-driven decisions', isCorrect: true },
        { text: 'To increase costs', isCorrect: false },
        { text: 'To reduce quality', isCorrect: false },
        { text: 'To ignore data', isCorrect: false },
      ],
    },
    {
      text: 'What is exit strategy?',
      options: [
        { text: 'A plan for how to exit or transition the business', isCorrect: true },
        { text: 'Giving up immediately', isCorrect: false },
        { text: 'Firing everyone', isCorrect: false },
        { text: 'Closing the business', isCorrect: false },
      ],
    },
  ],
};

async function addQuestionsToExam(courseNumber: number, examId: string) {
  const questions = examQuestions[courseNumber as keyof typeof examQuestions];
  if (!questions) {
    console.log(`⚠️  No questions defined for course ${courseNumber}`);
    return;
  }

  console.log(`\n📝 Adding ${questions.length} questions to Course ${courseNumber} exam...`);

  // Delete existing questions first
  const existingQuestions = await prisma.examQuestion.findMany({
    where: { examId },
    select: { id: true },
  });

  if (existingQuestions.length > 0) {
    console.log(`  Removing ${existingQuestions.length} existing questions...`);
    await prisma.examQuestion.deleteMany({
      where: { examId },
    });
  }

  // Add new questions
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const question = await prisma.examQuestion.create({
      data: {
        examId,
        text: q.text,
        type: 'multiple_choice',
        order: i + 1,
        points: 5,
        options: {
          create: q.options.map((opt, optIdx) => ({
            text: opt.text,
            isCorrect: opt.isCorrect,
            order: optIdx + 1,
          })),
        },
      },
    });
    console.log(`  ✅ Added question ${i + 1}: ${q.text.substring(0, 50)}...`);
  }
}

async function main() {
  console.log('📝 Adding Exam Questions to All Courses\n');
  console.log('='.repeat(70));

  try {
    const courses = await prisma.course.findMany({
      include: {
        finalExam: true,
      },
      orderBy: { courseNumber: 'asc' },
    });

    if (courses.length === 0) {
      console.log('❌ No courses found. Run seed script first: npm run prisma:seed');
      process.exit(1);
    }

    for (const course of courses) {
      if (!course.finalExam) {
        console.log(`\n⚠️  Course ${course.courseNumber} (${course.title}) has no final exam`);
        continue;
      }

      await addQuestionsToExam(course.courseNumber, course.finalExam.id);
    }

    console.log('\n' + '='.repeat(70));
    console.log('\n✅ All exam questions added successfully!\n');

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


