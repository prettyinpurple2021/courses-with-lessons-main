export interface Course {
  id: string;
  courseNumber: number;
  title: string;
  description: string;
  thumbnail: string;
  published: boolean;
  isLocked: boolean;
  isEnrolled: boolean;
  isCompleted: boolean;
  progress?: number;
  completedLessons?: number;
  lessonCount: number;
}

export interface Lesson {
  id: string;
  lessonNumber: number;
  title: string;
  description: string;
  youtubeVideoId: string;
  duration: number;
}

export interface CourseDetails extends Course {
  lessons: Lesson[];
  finalProject: {
    id: string;
    title: string;
    description: string;
  } | null;
  finalExam: {
    id: string;
    title: string;
    description: string;
    timeLimit: number;
    passingScore: number;
  } | null;
}
