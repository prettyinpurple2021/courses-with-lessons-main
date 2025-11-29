export interface FinalExam {
  id: string;
  courseId: string;
  title: string;
  description: string;
  timeLimit: number;
  passingScore: number;
  isUnlocked: boolean;
  questions: ExamQuestion[];
  result?: ExamResult | null;
}

export interface ExamQuestion {
  id: string;
  text: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  order: number;
  points: number;
  options: ExamQuestionOption[];
}

export interface ExamQuestionOption {
  id: string;
  text: string;
  order: number;
}

export interface ExamResult {
  id: string;
  score: number;
  passed: boolean;
  submittedAt: Date;
  answers?: any;
}

export interface SubmitExamData {
  answers: Record<string, any>;
}
