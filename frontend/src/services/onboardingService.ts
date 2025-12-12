/**
 * Onboarding Service
 * 
 * Manages onboarding state and tracks user progress through the onboarding flow.
 * Uses localStorage for persistence across sessions.
 */

import { logger } from '../utils/logger';

export interface OnboardingStep {
  id: string;
  completed: boolean;
  timestamp?: string;
}

export interface OnboardingState {
  completed: boolean;
  steps: OnboardingStep[];
  skipped: boolean;
  version: string;
  completedAt?: string;
}

class OnboardingService {
  private static readonly STORAGE_KEY = 'onboarding_state';
  private static readonly VERSION = '1.0';

  /**
   * Get current onboarding state
   */
  static getState(): OnboardingState | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return null;
      
      const state = JSON.parse(stored) as OnboardingState;
      // Migrate old versions if needed
      if (state.version !== this.VERSION) {
        return this.migrateState(state);
      }
      return state;
    } catch {
      return null;
    }
  }

  /**
   * Check if user has completed onboarding
   */
  static isCompleted(): boolean {
    const state = this.getState();
    return state?.completed ?? false;
  }

  /**
   * Check if user has skipped onboarding
   */
  static isSkipped(): boolean {
    const state = this.getState();
    return state?.skipped ?? false;
  }

  /**
   * Check if user should see onboarding
   */
  static shouldShowOnboarding(): boolean {
    return !this.isCompleted() && !this.isSkipped();
  }

  /**
   * Mark a specific step as completed
   */
  static completeStep(stepId: string): void {
    const state = this.getState() || this.getInitialState();
    
    const step = state.steps.find(s => s.id === stepId);
    if (step) {
      step.completed = true;
      step.timestamp = new Date().toISOString();
    } else {
      // Add new step if it doesn't exist
      state.steps.push({
        id: stepId,
        completed: true,
        timestamp: new Date().toISOString(),
      });
    }

    // Check if all steps are completed
    const allStepsCompleted = state.steps.every(s => s.completed);
    if (allStepsCompleted) {
      state.completed = true;
      state.completedAt = new Date().toISOString();
    }

    this.saveState(state);
  }

  /**
   * Mark onboarding as completed
   */
  static completeOnboarding(): void {
    const state = this.getState() || this.getInitialState();
    state.completed = true;
    state.completedAt = new Date().toISOString();
    
    // Mark all steps as completed
    state.steps.forEach(step => {
      if (!step.completed) {
        step.completed = true;
        step.timestamp = new Date().toISOString();
      }
    });

    this.saveState(state);
  }

  /**
   * Skip onboarding
   */
  static skipOnboarding(): void {
    const state = this.getState() || this.getInitialState();
    state.skipped = true;
    state.completedAt = new Date().toISOString();
    this.saveState(state);
  }

  /**
   * Reset onboarding (for testing or re-onboarding)
   */
  static resetOnboarding(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Get initial state
   */
  private static getInitialState(): OnboardingState {
    return {
      completed: false,
      skipped: false,
      version: this.VERSION,
      steps: [
        { id: 'welcome', completed: false },
        { id: 'dashboard', completed: false },
        { id: 'courses', completed: false },
        { id: 'lessons', completed: false },
        { id: 'activities', completed: false },
        { id: 'profile', completed: false },
      ],
    };
  }

  /**
   * Save state to localStorage
   */
  private static saveState(state: OnboardingState): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      logger.error('Failed to save onboarding state', error);
    }
  }

  /**
   * Migrate state from old version to new version
   */
  private static migrateState(oldState: OnboardingState): OnboardingState {
    // For now, just update version
    // In future, add migration logic here
    const newState = {
      ...oldState,
      version: this.VERSION,
    };
    this.saveState(newState);
    return newState;
  }
}

export default OnboardingService;

