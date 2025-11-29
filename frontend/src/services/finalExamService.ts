import { api } from './api';
import { FinalExam, ExamResult, SubmitExamData } from '../types/finalExam';

export const finalExamService = {
  async getFinalExam(courseId: string): Promise<FinalExam> {
    const response = await api.get(`/courses/${courseId}/final-exam`);
    return response.data.data;
  },

  async submitFinalExam(courseId: string, data: SubmitExamData): Promise<ExamResult> {
    const response = await api.post(`/courses/${courseId}/final-exam/submit`, data);
    return response.data.data.result;
  },

  async getExamResult(courseId: string): Promise<ExamResult> {
    const response = await api.get(`/courses/${courseId}/final-exam/result`);
    return response.data.data;
  },

  async checkExamUnlock(courseId: string): Promise<{ isUnlocked: boolean; message: string }> {
    const response = await api.get(`/courses/${courseId}/final-exam/unlock`);
    return response.data.data;
  },
};
