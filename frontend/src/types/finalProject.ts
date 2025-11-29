export interface FinalProject {
  id: string;
  courseId: string;
  title: string;
  description: string;
  instructions: string;
  requirements: any;
  isUnlocked: boolean;
  submission?: FinalProjectSubmission | null;
}

export interface FinalProjectSubmission {
  id: string;
  submission: any;
  submittedAt: Date;
  status: 'pending' | 'approved' | 'needs_revision';
  feedback: string | null;
}

export interface SubmitProjectData {
  submission: any;
}
