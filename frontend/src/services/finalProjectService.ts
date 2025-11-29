import { api } from './api';
import { FinalProject, SubmitProjectData } from '../types/finalProject';

export const finalProjectService = {
  async getFinalProject(courseId: string): Promise<FinalProject> {
    const response = await api.get(`/courses/${courseId}/final-project`);
    return response.data.data;
  },

  async submitFinalProject(courseId: string, data: SubmitProjectData): Promise<void> {
    await api.post(`/courses/${courseId}/final-project/submit`, data);
  },

  async getSubmissionStatus(courseId: string): Promise<any> {
    const response = await api.get(`/courses/${courseId}/final-project/status`);
    return response.data.data;
  },
};
