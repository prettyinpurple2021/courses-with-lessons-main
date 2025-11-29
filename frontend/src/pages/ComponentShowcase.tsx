import React from 'react';
import {
  GlassmorphicCard,
  GlassmorphicButton,
  GlassmorphicInput,
  HolographicBadge,
  CamoBackground,
  ProgressTracker,
  AchievementBadge,
  Modal,
  LoadingSpinner,
  ToastContainer,
} from '../components/common';
import { useToast } from '../hooks/useToast';

const ComponentShowcase: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const { toasts, removeToast, success, error, warning, info } = useToast();

  return (
    <CamoBackground variant="animated" opacity={0.3} className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-5xl font-bold text-white text-center mb-4 holographic-text">
          Component Showcase
        </h1>
        <p className="text-center text-white/80 mb-12">
          Visual Design System for SoloSuccess Intel Academy
        </p>

        {/* Glassmorphic Cards */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Glassmorphic Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassmorphicCard variant="default" className="p-6">
              <h3 className="text-xl font-bold text-white mb-2">Default Card</h3>
              <p className="text-white/70">Standard glassmorphic effect with frosted transparency.</p>
            </GlassmorphicCard>
            <GlassmorphicCard variant="elevated" className="p-6">
              <h3 className="text-xl font-bold text-white mb-2">Elevated Card</h3>
              <p className="text-white/70">Enhanced depth with stronger blur and shadows.</p>
            </GlassmorphicCard>
            <GlassmorphicCard variant="flat" className="p-6">
              <h3 className="text-xl font-bold text-white mb-2">Flat Card</h3>
              <p className="text-white/70">Subtle effect for background elements.</p>
            </GlassmorphicCard>
          </div>
        </section>

        {/* Buttons */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Glassmorphic Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <GlassmorphicButton variant="primary" size="sm">
              Small Primary
            </GlassmorphicButton>
            <GlassmorphicButton variant="primary" size="md">
              Medium Primary
            </GlassmorphicButton>
            <GlassmorphicButton variant="primary" size="lg">
              Large Primary
            </GlassmorphicButton>
            <GlassmorphicButton variant="secondary">
              Secondary
            </GlassmorphicButton>
            <GlassmorphicButton variant="outline">
              Outline
            </GlassmorphicButton>
            <GlassmorphicButton loading>
              Loading
            </GlassmorphicButton>
            <GlassmorphicButton disabled>
              Disabled
            </GlassmorphicButton>
          </div>
        </section>

        {/* Inputs */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Glassmorphic Inputs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
            <GlassmorphicInput
              label="Email Address"
              type="email"
              placeholder="Enter your email"
            />
            <GlassmorphicInput
              label="Password"
              type="password"
              placeholder="Enter your password"
              helperText="Must be at least 8 characters"
            />
            <GlassmorphicInput
              label="With Error"
              type="text"
              placeholder="Invalid input"
              error="This field is required"
            />
          </div>
        </section>

        {/* Progress Tracker */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Progress Tracker</h2>
          <div className="max-w-2xl space-y-6">
            <ProgressTracker current={7} total={12} label="Course Progress" />
            <ProgressTracker current={3} total={7} label="Courses Completed" />
            <ProgressTracker current={45} total={100} label="Overall Achievement" />
          </div>
        </section>

        {/* Holographic Badges */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Holographic Badges</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <HolographicBadge
              title="Starter"
              description="Complete first lesson"
              icon="🌟"
              unlocked={true}
              rarity="common"
            />
            <HolographicBadge
              title="Achiever"
              description="Complete 5 courses"
              icon="🏆"
              unlocked={true}
              rarity="rare"
            />
            <HolographicBadge
              title="Master"
              description="Complete all courses"
              icon="👑"
              unlocked={false}
              rarity="epic"
            />
            <HolographicBadge
              title="Legend"
              description="Perfect scores"
              icon="💎"
              unlocked={false}
              rarity="legendary"
            />
          </div>
        </section>

        {/* Achievement Badges */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Achievement Badges</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AchievementBadge
              title="First Steps"
              description="Completed your first lesson"
              icon="🎯"
              unlocked={true}
              unlockedDate={new Date()}
              rarity="common"
              showAnimation={false}
            />
            <AchievementBadge
              title="Quick Learner"
              description="Completed 3 lessons in one day"
              icon="⚡"
              unlocked={true}
              unlockedDate={new Date()}
              rarity="rare"
              showAnimation={false}
            />
            <AchievementBadge
              title="Perfectionist"
              description="Score 100% on all assessments"
              icon="💯"
              unlocked={false}
              rarity="legendary"
            />
          </div>
        </section>

        {/* Loading Spinner */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Loading Spinners</h2>
          <div className="flex flex-wrap gap-12 items-center">
            <LoadingSpinner size="sm" />
            <LoadingSpinner size="md" text="Loading..." />
            <LoadingSpinner size="lg" />
            <LoadingSpinner size="xl" holographic={false} />
          </div>
        </section>

        {/* Modal & Toast Demo */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Modal & Toasts</h2>
          <div className="flex flex-wrap gap-4">
            <GlassmorphicButton onClick={() => setIsModalOpen(true)}>
              Open Modal
            </GlassmorphicButton>
            <GlassmorphicButton variant="secondary" onClick={() => success('Success! Operation completed.')}>
              Show Success Toast
            </GlassmorphicButton>
            <GlassmorphicButton variant="secondary" onClick={() => error('Error! Something went wrong.')}>
              Show Error Toast
            </GlassmorphicButton>
            <GlassmorphicButton variant="secondary" onClick={() => warning('Warning! Please check your input.')}>
              Show Warning Toast
            </GlassmorphicButton>
            <GlassmorphicButton variant="secondary" onClick={() => info('Info: New feature available!')}>
              Show Info Toast
            </GlassmorphicButton>
          </div>
        </section>

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Example Modal"
          size="md"
        >
          <div className="space-y-4">
            <p className="text-white">
              This is a glassmorphic modal with holographic title effects.
            </p>
            <p className="text-white/70">
              It includes a backdrop blur, keyboard support (ESC to close), and smooth animations.
            </p>
            <div className="flex gap-3 justify-end mt-6">
              <GlassmorphicButton variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </GlassmorphicButton>
              <GlassmorphicButton onClick={() => setIsModalOpen(false)}>
                Confirm
              </GlassmorphicButton>
            </div>
          </div>
        </Modal>

        {/* Toast Container */}
        <ToastContainer toasts={toasts} onRemove={removeToast} position="top-right" />
      </div>
    </CamoBackground>
  );
};

export default ComponentShowcase;
