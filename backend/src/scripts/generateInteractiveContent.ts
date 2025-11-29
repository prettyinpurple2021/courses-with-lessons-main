/**
 * Interactive Content Generator
 * 
 * This script helps generate interactive activity content for lessons.
 * It provides templates and examples for creating engaging quizzes, exercises,
 * practical tasks, and reflections.
 * 
 * Usage:
 *   - Review the templates
 *   - Customize for your specific lesson
 *   - Use the admin panel to create/update activities
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Quiz Content Templates
 */
export const quizTemplates = {
  /**
   * Knowledge Check Quiz (Opening Quiz)
   */
  knowledgeCheck: (topic: string, questions: Array<{
    text: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }>) => ({
    questions: questions.map((q, i) => ({
      id: `q${i + 1}`,
      text: q.text,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
    })),
  }),

  /**
   * Application Quiz (Mid-Lesson)
   */
  applicationQuiz: (topic: string, scenarios: Array<{
    scenario: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }>) => ({
    questions: scenarios.map((s, i) => ({
      id: `q${i + 1}`,
      text: `${s.scenario} ${s.question}`,
      options: s.options,
      correctAnswer: s.correctAnswer,
      explanation: s.explanation,
    })),
  }),

  /**
   * Comprehensive Quiz (Closing Quiz)
   */
  comprehensiveQuiz: (topic: string, questions: Array<{
    text: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    difficulty: 'easy' | 'medium' | 'hard';
  }>) => ({
    questions: questions.map((q, i) => ({
      id: `q${i + 1}`,
      text: q.text,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      difficulty: q.difficulty,
    })),
  }),
};

/**
 * Exercise Content Templates
 */
export const exerciseTemplates = {
  /**
   * Guided Practice Exercise
   */
  guidedPractice: (topic: string, steps: Array<{
    title: string;
    description: string;
    hint?: string;
  }>, checklist: string[], resources?: Array<{ title: string; url: string; type: string }>) => ({
    instructions: `Complete this guided exercise on ${topic}. Follow each step carefully.`,
    steps: steps.map((step, i) => ({
      stepNumber: i + 1,
      title: step.title,
      description: step.description,
      hint: step.hint,
    })),
    submissionType: 'text',
    checklist,
    resources: resources || [],
  }),

  /**
   * Analysis Exercise
   */
  analysisExercise: (topic: string, analysisPoints: string[], deliverables: string[]) => ({
    instructions: `Analyze ${topic} using the following framework.`,
    analysisPoints,
    deliverables,
    submissionType: 'text',
    guidance: 'Be thorough in your analysis. Consider multiple perspectives and provide evidence for your conclusions.',
  }),
};

/**
 * Practical Task Templates
 */
export const practicalTaskTemplates = {
  /**
   * Create Task
   */
  createTask: (
    taskName: string,
    scenario: string,
    objectives: string[],
    deliverables: string[],
    criteria: string[],
    examples?: Array<{ title: string; description: string }>,
    resources?: Array<{ title: string; url: string; type: string }>
  ) => ({
    instructions: `Create ${taskName}. This is a hands-on task that will help you apply what you've learned.`,
    scenario,
    objectives,
    deliverables,
    criteria,
    submissionType: 'text',
    examples: examples || [],
    resources: resources || [],
  }),

  /**
   * Analyze Task
   */
  analyzeTask: (
    subject: string,
    scenario: string,
    analysisFramework: string[],
    deliverables: string[]
  ) => ({
    instructions: `Analyze ${subject} using the provided framework.`,
    scenario,
    analysisFramework,
    deliverables,
    submissionType: 'text',
    guidance: 'Be objective and thorough in your analysis. Support your conclusions with evidence.',
  }),

  /**
   * Plan Task
   */
  planTask: (
    planType: string,
    scenario: string,
    objectives: string[],
    deliverables: string[],
    timeline: string
  ) => ({
    instructions: `Develop a comprehensive ${planType} plan.`,
    scenario,
    objectives,
    deliverables,
    timeline,
    submissionType: 'text',
    guidance: 'Your plan should be actionable, realistic, and aligned with the objectives.',
  }),
};

/**
 * Reflection Templates
 */
export const reflectionTemplates = {
  /**
   * Learning Reflection
   */
  learningReflection: (topic: string, questions: string[]) => ({
    instructions: `Reflect on your learning about ${topic}. Take time to think deeply about these questions.`,
    questions: questions.map((q, i) => ({
      id: `r${i + 1}`,
      text: q,
      type: 'text',
    })),
    submissionType: 'text',
    guidance: 'There are no right or wrong answers. Be honest and thoughtful in your reflection.',
  }),

  /**
   * Application Reflection
   */
  applicationReflection: (topic: string, applicationQuestions: string[]) => ({
    instructions: `Reflect on how you can apply ${topic} in your own context.`,
    questions: applicationQuestions.map((q, i) => ({
      id: `r${i + 1}`,
      text: q,
      type: 'text',
    })),
    submissionType: 'text',
    guidance: 'Think about your specific situation and how these concepts apply. Be concrete and specific.',
  }),
};

/**
 * Example Content Generators by Course
 */
export const courseContentExamples = {
  course1: {
    // Business Fundamentals
    lesson1: {
      openingQuiz: () => quizTemplates.knowledgeCheck('Business Planning', [
        {
          text: 'What is the primary purpose of a business plan?',
          options: [
            'To secure funding only',
            'To outline business strategy and roadmap',
            'To track daily expenses',
            'To hire employees'
          ],
          correctAnswer: 1,
          explanation: 'A business plan primarily outlines the business strategy, goals, and roadmap for achieving success. While it can help secure funding, that\'s a secondary purpose.',
        },
        {
          text: 'Which section of a business plan comes first?',
          options: [
            'Financial Projections',
            'Executive Summary',
            'Market Analysis',
            'Operations Plan'
          ],
          correctAnswer: 1,
          explanation: 'The Executive Summary is always first as it provides an overview of the entire plan, though it\'s typically written last.',
        },
      ]),
      exercise: () => exerciseTemplates.guidedPractice(
        'Mission Statement Creation',
        [
          {
            title: 'Identify Your Core Purpose',
            description: 'Write down why your business exists beyond making money. What problem do you solve?',
            hint: 'Think about the impact you want to make.',
          },
          {
            title: 'Define Your Values',
            description: 'List 3-5 core values that guide your business decisions.',
            hint: 'Values should be non-negotiable principles.',
          },
          {
            title: 'Craft Your Mission Statement',
            description: 'Combine your purpose and values into a clear, concise mission statement (1-2 sentences).',
            hint: 'Keep it simple and memorable.',
          },
        ],
        [
          'Mission statement is clear and concise',
          'Reflects core purpose',
          'Includes key values',
          'Is inspiring and actionable'
        ]
      ),
    },
  },
};

/**
 * Helper function to generate activity content
 */
export function generateActivityContent(
  courseNumber: number,
  lessonNumber: number,
  activityNumber: number,
  activityType: 'quiz' | 'exercise' | 'practical_task' | 'reflection'
): any {
  // This is a template - customize based on your needs
  const courseThemes = [
    'Business Fundamentals',
    'Marketing Mastery',
    'Financial Intelligence',
    'Sales & Conversion',
    'Operations & Systems',
    'Leadership & Team Building',
    'Growth & Scaling',
  ];

  const theme = courseThemes[courseNumber - 1];

  switch (activityType) {
    case 'quiz':
      return quizTemplates.knowledgeCheck(theme, [
        {
          text: `Sample question about ${theme}?`,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 0,
          explanation: 'This is a sample explanation. Replace with actual content.',
        },
      ]);

    case 'exercise':
      return exerciseTemplates.guidedPractice(
        theme,
        [
          {
            title: 'Step 1',
            description: 'First step description',
          },
          {
            title: 'Step 2',
            description: 'Second step description',
          },
        ],
        ['Checklist item 1', 'Checklist item 2']
      );

    case 'practical_task':
      return practicalTaskTemplates.createTask(
        'Sample Task',
        'Real-world scenario description',
        ['Objective 1', 'Objective 2'],
        ['Deliverable 1', 'Deliverable 2'],
        ['Criterion 1', 'Criterion 2']
      );

    case 'reflection':
      return reflectionTemplates.learningReflection(theme, [
        'What did you learn?',
        'How will you apply this?',
      ]);

    default:
      return {};
  }
}

/**
 * Export templates for use in content creation
 */
export default {
  quizTemplates,
  exerciseTemplates,
  practicalTaskTemplates,
  reflectionTemplates,
  courseContentExamples,
  generateActivityContent,
};

