-- AlterTable
ALTER TABLE "FinalExamResult" ADD COLUMN     "gradingStatus" TEXT NOT NULL DEFAULT 'GRADED';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "currentStreak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastStudyDate" TIMESTAMP(3),
ADD COLUMN     "longestStreak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalStudyTime" INTEGER NOT NULL DEFAULT 0;
