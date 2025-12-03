import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const courses = [
  {
    courseNumber: 1,
    title: 'Foundation: Business Fundamentals',
    description: 'Master the core principles of business strategy, planning, and execution.',
    thumbnail: '/images/course-1.jpg',
  },
  {
    courseNumber: 2,
    title: 'Marketing Mastery',
    description: 'Learn to create compelling marketing strategies that drive results.',
    thumbnail: '/images/course-2.jpg',
  },
  {
    courseNumber: 3,
    title: 'Financial Intelligence',
    description: 'Develop financial literacy and money management skills for your business.',
    thumbnail: '/images/course-3.jpg',
  },
  {
    courseNumber: 4,
    title: 'Sales & Conversion',
    description: 'Master the art of selling and converting prospects into loyal customers.',
    thumbnail: '/images/course-4.jpg',
  },
  {
    courseNumber: 5,
    title: 'Operations & Systems',
    description: 'Build efficient systems and processes to scale your business.',
    thumbnail: '/images/course-5.jpg',
  },
  {
    courseNumber: 6,
    title: 'Leadership & Team Building',
    description: 'Develop leadership skills and learn to build high-performing teams.',
    thumbnail: '/images/course-6.jpg',
  },
  {
    courseNumber: 7,
    title: 'Growth & Scaling',
    description: 'Learn strategies to scale your business to new heights.',
    thumbnail: '/images/course-7.jpg',
  },
];

async function main() {
  console.log('🌱 Starting seed...');

  // Create courses with lessons, activities, final projects, and final exams
  for (const courseData of courses) {
    console.log(`Creating Course ${courseData.courseNumber}: ${courseData.title}`);

    const course = await prisma.course.create({
      data: {
        ...courseData,
        published: true,
      },
    });

    // Create 12 lessons for each course
    for (let lessonNum = 1; lessonNum <= 12; lessonNum++) {
      const lesson = await prisma.lesson.create({
        data: {
          courseId: course.id,
          lessonNumber: lessonNum,
          title: `Lesson ${lessonNum}: ${courseData.title} - Part ${lessonNum}`,
          description: `Comprehensive lesson covering key concepts of ${courseData.title}.`,
          youtubeVideoId: 'dQw4w9WgXcQ', // Placeholder - run `npm run content:update-videos` to replace with real videos
          duration: 1800,
        },
      });

      // Create 3-5 activities per lesson
      const activityCount = Math.floor(Math.random() * 3) + 3;
      for (let actNum = 1; actNum <= activityCount; actNum++) {
        await prisma.activity.create({
          data: {
            lessonId: lesson.id,
            activityNumber: actNum,
            title: `Activity ${actNum}: ${['Quiz', 'Exercise', 'Reflection', 'Practical Task'][actNum % 4]}`,
            description: `Complete this ${['quiz', 'exercise', 'reflection', 'practical task'][actNum % 4]} to test your understanding.`,
            type: ['quiz', 'exercise', 'reflection', 'practical_task'][actNum % 4],
            content: {
              instructions: 'Complete the activity based on the lesson content.',
              questions: actNum % 4 === 0 ? [
                { question: 'What did you learn?', type: 'text' },
              ] : [
                { question: 'Sample question', options: ['A', 'B', 'C', 'D'], correctAnswer: 'A' },
              ],
            },
            required: true,
          },
        });
      }

      // Create 2-3 resources per lesson
      for (let resNum = 1; resNum <= 2; resNum++) {
        await prisma.resource.create({
          data: {
            lessonId: lesson.id,
            title: `Resource ${resNum}: ${courseData.title} Materials`,
            description: 'Downloadable resource for this lesson',
            fileUrl: `/resources/course-${courseData.courseNumber}-lesson-${lessonNum}-resource-${resNum}.pdf`,
            fileType: 'pdf',
            fileSize: 1024000,
          },
        });
      }
    }

    // Create final project
    await prisma.finalProject.create({
      data: {
        courseId: course.id,
        title: `${courseData.title} - Final Project`,
        description: `Apply everything you've learned in ${courseData.title} to complete this comprehensive project.`,
        instructions: 'Follow the detailed instructions to complete your final project.',
        requirements: {
          deliverables: [
            'Written report',
            'Presentation slides',
            'Implementation plan',
          ],
          criteria: [
            'Demonstrates understanding of course concepts',
            'Shows practical application',
            'Meets quality standards',
          ],
        },
      },
    });

    // Create final exam (without questions - use scripts/add-exam-questions.ts to add real questions)
    const finalExam = await prisma.finalExam.create({
      data: {
        courseId: course.id,
        title: `${courseData.title} - Final Exam`,
        description: `Test your knowledge of ${courseData.title} with this comprehensive exam.`,
        timeLimit: 60,
        passingScore: 70,
      },
    });

    // NOTE: Exam questions are NOT created here. 
    // Run `npm run content:add-exam-questions` after seeding to add real exam questions.
    // Placeholder questions were removed to prevent production issues.

    console.log(`✅ Course ${courseData.courseNumber} created with 12 lessons, activities, final project, and final exam (no questions yet)`);
  }

  // Create forum categories
  const categories = [
    { name: 'General Discussion', description: 'General topics and introductions', order: 1 },
    { name: 'Course Questions', description: 'Ask questions about course content', order: 2 },
    { name: 'Success Stories', description: 'Share your wins and achievements', order: 3 },
    { name: 'Networking', description: 'Connect with fellow entrepreneurs', order: 4 },
  ];

  for (const category of categories) {
    await prisma.forumCategory.create({ data: category });
  }

  console.log('✅ Forum categories created');
  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
