export interface Activity {
  id: string;
  activityNumber: number;
  title: string;
  description: string;
  type: 'quiz' | 'exercise' | 'reflection' | 'practical_task';
  content: any;
  required: boolean;
  lessonId: string;
  isCompleted: boolean;
  isLocked: boolean;
  submission?: {
    id: string;
    response: any;
    completed: boolean;
    submittedAt: Date;
    feedback: string | null;
  };
}

export interface QuizContent {
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  feedback?: string;
  explanation?: string;
}

export interface QuizResponse {
  answers: number[];
}

export interface ExerciseContent {
  instructions: string;
  placeholder?: string;
}

export interface ExerciseResponse {
  answer: string;
}

export interface ReflectionContent {
  prompt: string;
  minLength: number;
}

export interface ReflectionResponse {
  reflection: string;
}

export interface PracticalTaskContent {
  instructions: string;
  requiredFields: string[];
  fieldLabels: Record<string, string>;
}

export interface PracticalTaskResponse {
  submission: Record<string, any>;
}

export interface ActivitySubmissionResult {
  success: boolean;
  feedback: string;
  nextActivityUnlocked: boolean;
  lessonCompleted: boolean;
}
