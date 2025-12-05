import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function completeAllLessons(email: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            console.error(`User with email ${email} not found`);
            process.exit(1);
        }

        // Get all lessons
        const lessons = await prisma.lesson.findMany({
            select: { id: true, courseId: true, lessonNumber: true },
        });

        console.log(`Found ${lessons.length} lessons. Marking as complete...`);

        // Create lesson progress for all lessons
        await prisma.$transaction(
            lessons.map((lesson) =>
                prisma.lessonProgress.upsert({
                    where: {
                        userId_lessonId: {
                            userId: user.id,
                            lessonId: lesson.id,
                        },
                    },
                    update: {
                        completed: true,
                        completedAt: new Date(),
                    },
                    create: {
                        userId: user.id,
                        lessonId: lesson.id,
                        completed: true,
                        completedAt: new Date(),
                        videoPosition: 0,
                        currentActivity: 1,
                    },
                })
            )
        );

        // Update enrollments
        const courseIds = [...new Set(lessons.map((l) => l.courseId))];

        await prisma.$transaction(
            courseIds.map((courseId) =>
                prisma.enrollment.upsert({
                    where: {
                        userId_courseId: {
                            userId: user.id,
                            courseId,
                        },
                    },
                    update: {
                        currentLesson: 13, // Assuming 12 lessons, set to 13 to unlock everything
                        completedAt: new Date(), // Mark course as completed
                    },
                    create: {
                        userId: user.id,
                        courseId,
                        currentLesson: 13,
                        completedAt: new Date(),
                    },
                })
            )
        );

        console.log('Successfully completed all lessons and courses for user.');
    } catch (error) {
        console.error('Error completing lessons:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

const email = process.argv[2];
if (!email) {
    console.error('Please provide user email as argument');
    process.exit(1);
}

completeAllLessons(email);
