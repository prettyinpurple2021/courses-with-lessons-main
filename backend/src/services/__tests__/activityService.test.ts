import { describe, it, expect } from '@jest/globals';
import { validateActivitySubmission, generateActivityFeedback } from '../activityService.js';

describe('ActivityService', () => {
  describe('validateActivitySubmission', () => {
    describe('quiz type', () => {
      it('should validate quiz with all questions answered', () => {
        const content = {
          questions: [
            { text: 'Question 1', correctAnswer: 'A' },
            { text: 'Question 2', correctAnswer: 'B' },
          ],
        };
        const response = {
          answers: ['A', 'B'],
        };

        const isValid = validateActivitySubmission('quiz', content, response);
        expect(isValid).toBe(true);
      });

      it('should reject quiz with missing answers', () => {
        const content = {
          questions: [
            { text: 'Question 1', correctAnswer: 'A' },
            { text: 'Question 2', correctAnswer: 'B' },
          ],
        };
        const response = {
          answers: ['A'], // Missing one answer
        };

        const isValid = validateActivitySubmission('quiz', content, response);
        expect(isValid).toBe(false);
      });

      it('should reject quiz with no answers', () => {
        const content = {
          questions: [
            { text: 'Question 1', correctAnswer: 'A' },
          ],
        };
        const response = {};

        const isValid = validateActivitySubmission('quiz', content, response);
        expect(isValid).toBe(false);
      });
    });

    describe('exercise type', () => {
      it('should validate exercise with non-empty answer', () => {
        const content = { instructions: 'Complete the exercise' };
        const response = { answer: 'My exercise answer' };

        const isValid = validateActivitySubmission('exercise', content, response);
        expect(isValid).toBe(true);
      });

      it('should reject exercise with empty answer', () => {
        const content = { instructions: 'Complete the exercise' };
        const response = { answer: '' };

        const isValid = validateActivitySubmission('exercise', content, response);
        // Empty string after trim has length 0, so it should be falsy
        expect(isValid).toBeFalsy();
      });

      it('should reject exercise with whitespace-only answer', () => {
        const content = { instructions: 'Complete the exercise' };
        const response = { answer: '   ' };

        const isValid = validateActivitySubmission('exercise', content, response);
        expect(isValid).toBe(false);
      });
    });

    describe('reflection type', () => {
      it('should validate reflection meeting minimum length', () => {
        const content = { minLength: 50 };
        const response = {
          reflection: 'This is a thoughtful reflection that meets the minimum length requirement for this activity.',
        };

        const isValid = validateActivitySubmission('reflection', content, response);
        expect(isValid).toBe(true);
      });

      it('should reject reflection below minimum length', () => {
        const content = { minLength: 50 };
        const response = { reflection: 'Too short' };

        const isValid = validateActivitySubmission('reflection', content, response);
        expect(isValid).toBe(false);
      });

      it('should use default minimum length if not specified', () => {
        const content = {}; // No minLength specified, defaults to 50
        const response = {
          reflection: 'This is a thoughtful reflection that meets the minimum length requirement for this activity.',
        };

        const isValid = validateActivitySubmission('reflection', content, response);
        expect(isValid).toBe(true);
      });
    });

    describe('practical_task type', () => {
      it('should validate practical task with all required fields', () => {
        const content = {
          requiredFields: ['field1', 'field2'],
        };
        const response = {
          submission: {
            field1: 'Value 1',
            field2: 'Value 2',
          },
        };

        const isValid = validateActivitySubmission('practical_task', content, response);
        expect(isValid).toBe(true);
      });

      it('should reject practical task with missing required fields', () => {
        const content = {
          requiredFields: ['field1', 'field2'],
        };
        const response = {
          submission: {
            field1: 'Value 1',
            // field2 is missing
          },
        };

        const isValid = validateActivitySubmission('practical_task', content, response);
        expect(isValid).toBe(false);
      });

      it('should validate practical task with no required fields', () => {
        const content = { requiredFields: [] };
        const response = { submission: {} };

        const isValid = validateActivitySubmission('practical_task', content, response);
        expect(isValid).toBe(true);
      });
    });

    describe('unknown activity type', () => {
      it('should accept any non-empty response for unknown type', () => {
        const content = {};
        const response = { someField: 'some value' };

        const isValid = validateActivitySubmission('unknown_type', content, response);
        expect(isValid).toBe(true);
      });

      it('should reject empty response for unknown type', () => {
        const content = {};
        const response = {};

        const isValid = validateActivitySubmission('unknown_type', content, response);
        expect(isValid).toBe(false);
      });
    });
  });

  describe('generateActivityFeedback', () => {
    it('should generate feedback for quiz with score', () => {
      const content = {
        questions: [
          { text: 'Q1', correctAnswer: 'A' },
          { text: 'Q2', correctAnswer: 'B' },
          { text: 'Q3', correctAnswer: 'C' },
        ],
      };
      const response = {
        answers: ['A', 'B', 'A'], // 2 out of 3 correct
      };

      const feedback = generateActivityFeedback('quiz', content, response);
      expect(feedback).toContain('2 out of 3');
      expect(feedback).toContain('67%');
    });

    it('should generate feedback for perfect quiz score', () => {
      const content = {
        questions: [
          { text: 'Q1', correctAnswer: 'A' },
          { text: 'Q2', correctAnswer: 'B' },
        ],
      };
      const response = {
        answers: ['A', 'B'],
      };

      const feedback = generateActivityFeedback('quiz', content, response);
      expect(feedback).toContain('2 out of 2');
      expect(feedback).toContain('100%');
    });

    it('should generate feedback for exercise', () => {
      const feedback = generateActivityFeedback('exercise', {}, {});
      expect(feedback).toContain('submitted successfully');
    });

    it('should generate feedback for reflection', () => {
      const feedback = generateActivityFeedback('reflection', {}, {});
      expect(feedback).toContain('reflection');
    });

    it('should generate feedback for practical task', () => {
      const feedback = generateActivityFeedback('practical_task', {}, {});
      expect(feedback).toContain('practical task');
    });

    it('should generate default feedback for unknown type', () => {
      const feedback = generateActivityFeedback('unknown_type', {}, {});
      expect(feedback).toContain('received');
    });
  });
});
