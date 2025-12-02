const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkExams() {
  try {
    console.log('Checking final exams and questions...\n');

    const exams = await prisma.finalExam.findMany({
      include: {
        questions: {
          include: {
            options: true
          }
        },
        course: true
      },
      orderBy: {
        course: {
          courseNumber: 'asc'
        }
      }
    });

    console.log(`Found ${exams.length} final exams:\n`);

    exams.forEach((exam, index) => {
      console.log(`${index + 1}. ${exam.course.title}`);
      console.log(`   Exam: ${exam.title}`);
      console.log(`   Questions: ${exam.questions.length}`);
      if (exam.questions.length > 0) {
        console.log(`   Sample question: "${exam.questions[0].text}"`);
      }
      console.log('');
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkExams();
