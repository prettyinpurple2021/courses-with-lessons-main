import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import OnboardingService from '../services/onboardingService';

/**
 * Hook to manage onboarding state
 * Shows onboarding for authenticated users who haven't completed it
 */
export function useOnboarding() {
  const { user, isAuthenticated } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Only show onboarding for authenticated users
    if (!isAuthenticated || !user) {
      setShowOnboarding(false);
      return;
    }

    // Check if onboarding should be shown
    const shouldShow = OnboardingService.shouldShowOnboarding();
    setShowOnboarding(shouldShow);
  }, [isAuthenticated, user]);

  const handleComplete = () => {
    setShowOnboarding(false);
  };

  const handleSkip = () => {
    setShowOnboarding(false);
  };

  return {
    showOnboarding,
    handleComplete,
    handleSkip,
  };
}

