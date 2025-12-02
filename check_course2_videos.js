const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCourse2Videos() {
  try {
    const lessons = await prisma.lesson.findMany({
      where: {
        course: {
          courseNumber: 2
        }
      },
      include: {
        course: true
      },
      orderBy: {
        lessonNumber: 'asc'
      }
    });

    console.log('Course 2 (Marketing Mastery) current video IDs:');
    lessons.forEach(lesson => {
      console.log(`Lesson ${lesson.lessonNumber}: ${lesson.youtubeVideoId}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCourse2Videos();
