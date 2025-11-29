import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ActivityCard from '../ActivityCard';
import { Activity } from '../../../types/activity';

describe('ActivityCard', () => {
  const mockActivity: Activity = {
    id: 'activity-1',
    activityNumber: 1,
    title: 'Test Activity',
    description: 'This is a test activity',
    type: 'quiz',
    content: {},
    required: true,
    lessonId: 'lesson-1',
    isCompleted: false,
    isLocked: false,
  };

  it('renders activity title and description', () => {
    render(<ActivityCard activity={mockActivity} />);
    expect(screen.getByText('Test Activity')).toBeInTheDocument();
    expect(screen.getByText('This is a test activity')).toBeInTheDocument();
  });

  it('displays activity number', () => {
    render(<ActivityCard activity={mockActivity} />);
    expect(screen.getByText('Activity 1')).toBeInTheDocument();
  });

  it('displays quiz type label', () => {
    render(<ActivityCard activity={mockActivity} />);
    expect(screen.getByText('Quiz')).toBeInTheDocument();
  });

  it('displays exercise type label', () => {
    const exerciseActivity = { ...mockActivity, type: 'exercise' };
    render(<ActivityCard activity={exerciseActivity} />);
    expect(screen.getByText('Exercise')).toBeInTheDocument();
  });

  it('displays reflection type label', () => {
    const reflectionActivity = { ...mockActivity, type: 'reflection' };
    render(<ActivityCard activity={reflectionActivity} />);
    expect(screen.getByText('Reflection')).toBeInTheDocument();
  });

  it('displays practical task type label', () => {
    const practicalActivity = { ...mockActivity, type: 'practical_task' };
    render(<ActivityCard activity={practicalActivity} />);
    expect(screen.getByText('Practical Task')).toBeInTheDocument();
  });

  it('shows completed icon when activity is completed', () => {
    const completedActivity = { ...mockActivity, isCompleted: true };
    const { container } = render(<ActivityCard activity={completedActivity} />);
    const checkIcon = container.querySelector('.text-success-teal');
    expect(checkIcon).toBeInTheDocument();
  });

  it('shows lock icon when activity is locked', () => {
    const lockedActivity = { ...mockActivity, isLocked: true };
    render(<ActivityCard activity={lockedActivity} />);
    expect(screen.getByText('Complete previous activities to unlock')).toBeInTheDocument();
  });

  it('applies opacity when activity is locked', () => {
    const lockedActivity = { ...mockActivity, isLocked: true };
    const { container } = render(<ActivityCard activity={lockedActivity} />);
    const card = container.querySelector('.opacity-60');
    expect(card).toBeInTheDocument();
  });

  it('calls onClick handler when clicked and not locked', () => {
    const handleClick = vi.fn();
    render(<ActivityCard activity={mockActivity} onClick={handleClick} />);
    
    fireEvent.click(screen.getByText('Test Activity'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when activity is locked', () => {
    const handleClick = vi.fn();
    const lockedActivity = { ...mockActivity, isLocked: true };
    render(<ActivityCard activity={lockedActivity} onClick={handleClick} />);
    
    fireEvent.click(screen.getByText('Test Activity'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('displays feedback when submission has feedback', () => {
    const activityWithFeedback = {
      ...mockActivity,
      isCompleted: true,
      submission: {
        id: 'sub-1',
        response: {},
        completed: true,
        submittedAt: new Date(),
        feedback: 'Great job on this activity!',
      },
    };
    render(<ActivityCard activity={activityWithFeedback} />);
    expect(screen.getByText('Great job on this activity!')).toBeInTheDocument();
  });

  it('does not display feedback section when no feedback', () => {
    render(<ActivityCard activity={mockActivity} />);
    const feedbackSection = screen.queryByText(/Great job/);
    expect(feedbackSection).not.toBeInTheDocument();
  });

  it('applies holographic border when activity is completed', () => {
    const completedActivity = { ...mockActivity, isCompleted: true };
    const { container } = render(<ActivityCard activity={completedActivity} />);
    const cardWithBorder = container.querySelector('.holographic-border');
    expect(cardWithBorder).toBeInTheDocument();
  });

  it('does not apply holographic border when activity is not completed', () => {
    const { container } = render(<ActivityCard activity={mockActivity} />);
    const cardWithBorder = container.querySelector('.holographic-border');
    expect(cardWithBorder).not.toBeInTheDocument();
  });
});
