import { useState, useEffect } from 'react';
import GlassmorphicCard from '../common/GlassmorphicCard';
import GlassmorphicButton from '../common/GlassmorphicButton';
import OnboardingService, { OnboardingState } from '../../services/onboardingService';

interface OnboardingFlowProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

export default function OnboardingFlow({ onComplete, onSkip }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingState, setOnboardingState] = useState<OnboardingState | null>(null);

  useEffect(() => {
    const state = OnboardingService.getState();
    setOnboardingState(state);
    
    // If onboarding is already completed or skipped, don't show
    if (state?.completed || state?.skipped) {
      onComplete?.();
      return;
    }
  }, [onComplete]);

  const steps = [
    {
      id: 'welcome',
      title: 'Welcome to SoloSuccess Intel Academy! 🎓',
      description: 'Your journey to mastering entrepreneurship starts here. Let\'s get you set up.',
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">
            We're excited to have you join our community of ambitious entrepreneurs. 
            This quick tour will help you get the most out of your learning experience.
          </p>
          <div className="bg-white/5 rounded-lg p-4 space-y-2">
            <h4 className="text-white font-semibold">What you'll learn:</h4>
            <ul className="text-gray-300 space-y-1 text-sm">
              <li>• How to navigate the platform</li>
              <li>• How to access and complete courses</li>
              <li>• How to track your progress</li>
              <li>• How to earn certificates</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'dashboard',
      title: 'Your Dashboard',
      description: 'Your command center for tracking progress and accessing courses.',
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">
            The dashboard is where you'll see your enrolled courses, progress, 
            recent activity, and quick actions.
          </p>
          <div className="bg-white/5 rounded-lg p-4 space-y-2">
            <h4 className="text-white font-semibold">Key features:</h4>
            <ul className="text-gray-300 space-y-1 text-sm">
              <li>• Continue learning from where you left off</li>
              <li>• View your course progress</li>
              <li>• See your achievements and certificates</li>
              <li>• Quick access to your enrolled courses</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'courses',
      title: 'Sequential Course Progression',
      description: 'Courses unlock in order - complete Course One to access Course Two.',
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">
            Our courses are designed to build on each other. You must complete 
            courses in sequence to ensure you master each concept before moving forward.
          </p>
          <div className="bg-white/5 rounded-lg p-4 space-y-2">
            <h4 className="text-white font-semibold">How it works:</h4>
            <ul className="text-gray-300 space-y-1 text-sm">
              <li>• Start with Course One: Foundation & Mindset</li>
              <li>• Complete all 12 lessons in a course</li>
              <li>• Finish the final project to unlock the next course</li>
              <li>• Progress through courses 1 → 2 → 3 → 4 → 5 → 6 → 7</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'lessons',
      title: 'Interactive Lessons',
      description: 'Each lesson includes video content, activities, and resources.',
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">
            Lessons are the building blocks of each course. Each lesson includes 
            video content, interactive activities, and downloadable resources.
          </p>
          <div className="bg-white/5 rounded-lg p-4 space-y-2">
            <h4 className="text-white font-semibold">Lesson features:</h4>
            <ul className="text-gray-300 space-y-1 text-sm">
              <li>• Video lessons with progress tracking</li>
              <li>• Interactive activities to reinforce learning</li>
              <li>• Note-taking capabilities</li>
              <li>• Downloadable resources</li>
              <li>• AI tutor for questions</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'activities',
      title: 'Complete Activities',
      description: 'Activities help you apply what you\'ve learned and unlock progress.',
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">
            Activities are hands-on exercises that help you practice and apply 
            the concepts from each lesson. Complete all required activities to 
            mark a lesson as complete.
          </p>
          <div className="bg-white/5 rounded-lg p-4 space-y-2">
            <h4 className="text-white font-semibold">Activity types:</h4>
            <ul className="text-gray-300 space-y-1 text-sm">
              <li>• Multiple choice quizzes</li>
              <li>• Written assignments</li>
              <li>• Practical exercises</li>
              <li>• Final projects</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'profile',
      title: 'Your Profile & Achievements',
      description: 'Track your progress, view certificates, and see your achievements.',
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">
            Your profile is where you can view your progress, achievements, 
            certificates, and manage your account settings.
          </p>
          <div className="bg-white/5 rounded-lg p-4 space-y-2">
            <h4 className="text-white font-semibold">Profile features:</h4>
            <ul className="text-gray-300 space-y-1 text-sm">
              <li>• View your learning progress</li>
              <li>• See all your achievements</li>
              <li>• Download course certificates</li>
              <li>• Update your profile information</li>
            </ul>
          </div>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      // Mark current step as completed
      OnboardingService.completeStep(steps[currentStep].id);
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    OnboardingService.skipOnboarding();
    onSkip?.();
  };

  const handleComplete = () => {
    OnboardingService.completeStep(steps[currentStep].id);
    OnboardingService.completeOnboarding();
    onComplete?.();
  };

  // Don't render if onboarding is already completed or skipped
  if (onboardingState?.completed || onboardingState?.skipped) {
    return null;
  }

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <GlassmorphicCard className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 md:p-8">
          {/* Progress indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">
                Step {currentStep + 1} of {steps.length}
              </span>
              <button
                onClick={handleSkip}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Skip tour
              </button>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-hot-pink to-cyan transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Step content */}
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              {step.title}
            </h2>
            <p className="text-lg text-gray-300 mb-6">{step.description}</p>
            <div className="text-gray-300">{step.content}</div>
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between gap-4">
            <div>
              {!isFirstStep && (
                <GlassmorphicButton
                  onClick={handlePrevious}
                  variant="outline"
                  size="sm"
                >
                  Previous
                </GlassmorphicButton>
              )}
            </div>
            <div className="flex items-center gap-3">
              {!isLastStep ? (
                <GlassmorphicButton
                  onClick={handleNext}
                  variant="primary"
                >
                  Next
                </GlassmorphicButton>
              ) : (
                <GlassmorphicButton
                  onClick={handleComplete}
                  variant="primary"
                >
                  Get Started!
                </GlassmorphicButton>
              )}
            </div>
          </div>

          {/* Step indicators */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'w-8 bg-hot-pink'
                    : index < currentStep
                    ? 'w-2 bg-cyan'
                    : 'w-2 bg-white/20'
                }`}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </GlassmorphicCard>
    </div>
  );
}

