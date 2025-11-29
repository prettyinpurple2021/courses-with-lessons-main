import type { Content } from '@google/generative-ai';
import { genAI } from '../config/ai.js';
import { logger } from '../utils/logger.js';
import { PrismaClient } from '@prisma/client';

// Use the same client import as the working aiService

const prisma = new PrismaClient();

export type ActivityType = 'quiz' | 'exercise' | 'practical_task' | 'reflection';

export interface GenerateActivityOptions {
  lessonId: string;
  activityType: ActivityType;
  activityNumber: number;
  position?: 'opening' | 'mid' | 'closing'; // For quizzes
}

export interface GeneratedActivity {
  title: string;
  description: string;
  content: any;
}

const courseThemes = [
  'Business Fundamentals',
  'Marketing Mastery',
  'Financial Intelligence',
  'Sales & Conversion',
  'Operations & Systems',
  'Leadership & Team Building',
  'Growth & Scaling',
];

function ensureClient() {
  if (!genAI) {
    throw new Error('AI client is not configured. Set GEMINI_API_KEY to enable AI features.');
  }
  return genAI;
}

/**
 * Get lesson context for AI generation
 */
async function getLessonContext(lessonId: string): Promise<string> {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      course: {
        select: {
          courseNumber: true,
          title: true,
          description: true,
        },
      },
      activities: {
        orderBy: { activityNumber: 'asc' },
        select: {
          activityNumber: true,
          title: true,
          type: true,
        },
      },
    },
  });

  if (!lesson) {
    throw new Error('Lesson not found');
  }

  const courseTheme = courseThemes[lesson.course.courseNumber - 1] || 'Business';

  return `Course: ${lesson.course.title} (${courseTheme})
Course Description: ${lesson.course.description}

Lesson: ${lesson.title}
Lesson Description: ${lesson.description}
Lesson Number: ${lesson.lessonNumber}
Video Duration: ${lesson.duration} seconds

Existing Activities:
${lesson.activities.map(a => `- Activity ${a.activityNumber}: ${a.title} (${a.type})`).join('\n') || 'None'}`;
}

/**
 * Generate quiz content using AI
 */
async function generateQuizContent(
  lessonContext: string,
  position: 'opening' | 'mid' | 'closing',
  activityNumber: number
): Promise<any> {
  const client = ensureClient();
  // Use gemini-2.5-flash which is available in v1 API
  const model = client.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: `You are an expert eLearning content creator specializing in creating engaging, educational quiz questions for business and entrepreneurship courses.

Your task is to generate quiz content in JSON format that matches the exact structure required by the platform.

IMPORTANT: You must return ONLY valid JSON, no markdown, no code blocks, just pure JSON.`,
  });

  const questionCount = position === 'opening' ? 3 : position === 'mid' ? 5 : 7;
  const quizType = position === 'opening' ? 'knowledge check' : position === 'mid' ? 'application' : 'comprehensive assessment';

  const prompt = `Generate a ${quizType} quiz for this lesson.

${lessonContext}

Requirements:
- Generate exactly ${questionCount} questions
- Each question must have 4 options (A, B, C, D)
- Include detailed explanations for each answer
- Questions should test understanding of key concepts from the lesson
- For ${position === 'opening' ? 'opening quiz: test prior knowledge and introduce concepts' : position === 'mid' ? 'mid-lesson quiz: reinforce video content with scenario-based questions' : 'closing quiz: comprehensive assessment with mixed difficulty levels'}

Return ONLY a valid JSON object with this exact structure:
{
  "questions": [
    {
      "id": "q1",
      "text": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Detailed explanation of why this answer is correct and why others are wrong"
    }
  ]
}

Do not include any markdown formatting, code blocks, or text outside the JSON. Return only the JSON object.`;

  const contents: Content[] = [
    {
      role: 'user',
      parts: [{ text: prompt }],
    },
  ];

  try {
    const result = await model.generateContent({ contents });
    const text = result.response.text();
    
    // Clean up the response - remove markdown code blocks if present
    let cleanedText = text.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }

    const content = JSON.parse(cleanedText);
    
    // Validate structure
    if (!content.questions || !Array.isArray(content.questions)) {
      throw new Error('Invalid quiz structure: missing questions array');
    }

    return content;
  } catch (error) {
    logger.error('Error generating quiz content', { error });
    throw new Error(`Failed to generate quiz content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate exercise content using AI
 */
async function generateExerciseContent(
  lessonContext: string,
  activityNumber: number
): Promise<any> {
  const client = ensureClient();
  // Use gemini-2.5-flash which is available in v1 API
  const model = client.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: `You are an expert eLearning content creator specializing in creating hands-on, practical exercises for business and entrepreneurship courses.

Your task is to generate exercise content in JSON format that matches the exact structure required by the platform.

IMPORTANT: You must return ONLY valid JSON, no markdown, no code blocks, just pure JSON.`,
  });

  const prompt = `Generate a guided practice exercise for this lesson.

${lessonContext}

Requirements:
- Create 3-5 clear, actionable steps
- Each step should have a title, description, and optional hint
- Include a checklist for students to verify their work
- Exercise should be hands-on and practical
- Should help students apply concepts from the lesson

Return ONLY a valid JSON object with this exact structure:
{
  "instructions": "Clear, actionable instructions for the exercise",
  "steps": [
    {
      "stepNumber": 1,
      "title": "Step Title",
      "description": "What to do in this step",
      "hint": "Optional hint if student gets stuck"
    }
  ],
  "submissionType": "text",
  "checklist": [
    "Item to verify",
    "Another verification point"
  ],
  "resources": []
}

Do not include any markdown formatting, code blocks, or text outside the JSON. Return only the JSON object.`;

  const contents: Content[] = [
    {
      role: 'user',
      parts: [{ text: prompt }],
    },
  ];

  try {
    const result = await model.generateContent({ contents });
    let text = result.response.text().trim();
    
    // Clean up the response
    if (text.startsWith('```json')) {
      text = text.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (text.startsWith('```')) {
      text = text.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }

    const content = JSON.parse(text);
    
    // Validate structure
    if (!content.steps || !Array.isArray(content.steps)) {
      throw new Error('Invalid exercise structure: missing steps array');
    }

    return content;
  } catch (error) {
    logger.error('Error generating exercise content', { error });
    throw new Error(`Failed to generate exercise content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate practical task content using AI
 */
async function generatePracticalTaskContent(
  lessonContext: string,
  activityNumber: number
): Promise<any> {
  const client = ensureClient();
  // Use gemini-2.5-flash which is available in v1 API
  const model = client.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: `You are an expert eLearning content creator specializing in creating real-world practical tasks for business and entrepreneurship courses.

Your task is to generate practical task content in JSON format that matches the exact structure required by the platform.

IMPORTANT: You must return ONLY valid JSON, no markdown, no code blocks, just pure JSON.`,
  });

  const prompt = `Generate a practical task for this lesson.

${lessonContext}

Requirements:
- Create a realistic business scenario
- Define clear objectives (2-4 objectives)
- Specify deliverables (what students should create/submit)
- Include success criteria (3-5 criteria)
- Task should be applicable to real business situations
- Should help students build portfolio-worthy work

Return ONLY a valid JSON object with this exact structure:
{
  "instructions": "Clear task description",
  "scenario": "Real-world scenario description",
  "objectives": [
    "Objective 1",
    "Objective 2"
  ],
  "deliverables": [
    "What students should create/deliver"
  ],
  "criteria": [
    "Success criterion 1",
    "Success criterion 2"
  ],
  "submissionType": "text",
  "examples": [],
  "resources": []
}

Do not include any markdown formatting, code blocks, or text outside the JSON. Return only the JSON object.`;

  const contents: Content[] = [
    {
      role: 'user',
      parts: [{ text: prompt }],
    },
  ];

  try {
    const result = await model.generateContent({ contents });
    let text = result.response.text().trim();
    
    // Clean up the response
    if (text.startsWith('```json')) {
      text = text.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (text.startsWith('```')) {
      text = text.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }

    const content = JSON.parse(text);
    
    // Validate structure
    if (!content.objectives || !Array.isArray(content.objectives)) {
      throw new Error('Invalid practical task structure: missing objectives array');
    }

    return content;
  } catch (error) {
    logger.error('Error generating practical task content', { error });
    throw new Error(`Failed to generate practical task content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate reflection content using AI
 */
async function generateReflectionContent(
  lessonContext: string,
  activityNumber: number
): Promise<any> {
  const client = ensureClient();
  // Use gemini-2.5-flash which is available in v1 API
  const model = client.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: `You are an expert eLearning content creator specializing in creating reflective learning activities for business and entrepreneurship courses.

Your task is to generate reflection content in JSON format that matches the exact structure required by the platform.

IMPORTANT: You must return ONLY valid JSON, no markdown, no code blocks, just pure JSON.`,
  });

  const prompt = `Generate a reflection activity for this lesson.

${lessonContext}

Requirements:
- Create 2-4 open-ended reflection questions
- Questions should encourage deep thinking and self-assessment
- Should connect learning to personal experience
- Use "how" and "why" questions
- Should help students internalize concepts

Return ONLY a valid JSON object with this exact structure:
{
  "instructions": "Reflection prompt",
  "questions": [
    {
      "id": "r1",
      "text": "Reflection question",
      "type": "text",
      "hint": "Optional guidance"
    }
  ],
  "submissionType": "text",
  "guidance": "Additional guidance for reflection"
}

Do not include any markdown formatting, code blocks, or text outside the JSON. Return only the JSON object.`;

  const contents: Content[] = [
    {
      role: 'user',
      parts: [{ text: prompt }],
    },
  ];

  try {
    const result = await model.generateContent({ contents });
    let text = result.response.text().trim();
    
    // Clean up the response
    if (text.startsWith('```json')) {
      text = text.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (text.startsWith('```')) {
      text = text.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }

    const content = JSON.parse(text);
    
    // Validate structure
    if (!content.questions || !Array.isArray(content.questions)) {
      throw new Error('Invalid reflection structure: missing questions array');
    }

    return content;
  } catch (error) {
    logger.error('Error generating reflection content', { error });
    throw new Error(`Failed to generate reflection content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate activity title and description using AI
 */
async function generateActivityMetadata(
  lessonContext: string,
  activityType: ActivityType,
  activityNumber: number,
  position?: 'opening' | 'mid' | 'closing'
): Promise<{ title: string; description: string }> {
  const client = ensureClient();
  // Use gemini-2.5-flash which is available in v1 API
  const model = client.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: `You are an expert eLearning content creator. Generate concise, engaging titles and descriptions for learning activities.`,
  });

  const activityTypeName = activityType === 'quiz' 
    ? (position === 'opening' ? 'Opening Quiz' : position === 'mid' ? 'Mid-Lesson Quiz' : 'Closing Quiz')
    : activityType === 'exercise' ? 'Exercise'
    : activityType === 'practical_task' ? 'Practical Task'
    : 'Reflection';

  const prompt = `Generate a title and description for a ${activityTypeName} (Activity ${activityNumber}) for this lesson.

${lessonContext}

Requirements:
- Title should be concise (5-10 words), engaging, and specific to the lesson content
- Description should be 1-2 sentences explaining what students will do
- Make it clear and actionable

Return ONLY a valid JSON object:
{
  "title": "Activity Title Here",
  "description": "Brief description of what students will do in this activity."
}

Do not include any markdown formatting, code blocks, or text outside the JSON. Return only the JSON object.`;

  const contents: Content[] = [
    {
      role: 'user',
      parts: [{ text: prompt }],
    },
  ];

  try {
    const result = await model.generateContent({ contents });
    let text = result.response.text().trim();
    
    // Clean up the response
    if (text.startsWith('```json')) {
      text = text.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (text.startsWith('```')) {
      text = text.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }

    const metadata = JSON.parse(text);
    
    if (!metadata.title || !metadata.description) {
      throw new Error('Invalid metadata structure: missing title or description');
    }

    return metadata;
  } catch (error) {
    logger.error('Error generating activity metadata', { error });
    // Fallback to default titles
    const defaultTitles: Record<ActivityType, string> = {
      quiz: position === 'opening' ? 'Opening Knowledge Check' : position === 'mid' ? 'Mid-Lesson Quiz' : 'Lesson Assessment',
      exercise: 'Guided Practice Exercise',
      practical_task: 'Practical Application Task',
      reflection: 'Learning Reflection',
    };
    
    return {
      title: defaultTitles[activityType],
      description: `Complete this ${activityType.replace('_', ' ')} to reinforce your learning.`,
    };
  }
}

/**
 * Main function to generate a complete activity
 */
export async function generateActivity(options: GenerateActivityOptions): Promise<GeneratedActivity> {
  const { lessonId, activityType, activityNumber, position } = options;

  logger.info('Generating activity', { lessonId, activityType, activityNumber, position });

  // Get lesson context
  const lessonContext = await getLessonContext(lessonId);

  // Generate metadata (title and description)
  const metadata = await generateActivityMetadata(lessonContext, activityType, activityNumber, position);

  // Generate content based on type
  let content: any;

  switch (activityType) {
    case 'quiz':
      content = await generateQuizContent(lessonContext, position || 'mid', activityNumber);
      break;
    case 'exercise':
      content = await generateExerciseContent(lessonContext, activityNumber);
      break;
    case 'practical_task':
      content = await generatePracticalTaskContent(lessonContext, activityNumber);
      break;
    case 'reflection':
      content = await generateReflectionContent(lessonContext, activityNumber);
      break;
    default:
      throw new Error(`Unsupported activity type: ${activityType}`);
  }

  return {
    title: metadata.title,
    description: metadata.description,
    content,
  };
}

/**
 * Generate multiple activities for a lesson
 */
export async function generateLessonActivities(
  lessonId: string,
  activityPlan?: Array<{ type: ActivityType; position?: 'opening' | 'mid' | 'closing' }>
): Promise<GeneratedActivity[]> {
  // Default activity plan if not provided
  const defaultPlan: Array<{ type: ActivityType; position?: 'opening' | 'mid' | 'closing' }> = [
    { type: 'quiz', position: 'opening' },
    { type: 'exercise' },
    { type: 'quiz', position: 'mid' },
    { type: 'practical_task' },
    { type: 'quiz', position: 'closing' },
  ];

  const plan = activityPlan || defaultPlan;
  const activities: GeneratedActivity[] = [];

  for (let i = 0; i < plan.length; i++) {
    const activitySpec = plan[i];
    const activityNumber = i + 1;

    try {
      const activity = await generateActivity({
        lessonId,
        activityType: activitySpec.type,
        activityNumber,
        position: activitySpec.position,
      });

      activities.push(activity);

      // Add a small delay to avoid rate limiting
      if (i < plan.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      logger.error(`Failed to generate activity ${activityNumber}`, { error, lessonId });
      throw error;
    }
  }

  return activities;
}

