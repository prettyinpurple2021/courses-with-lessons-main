import React, { useState } from 'react';
import { Activity } from '../../types/activity';
import { activityService } from '../../services/activityService';
import QuizActivity from './QuizActivity';
import ExerciseActivity from './ExerciseActivity';
import ReflectionActivity from './ReflectionActivity';
import PracticalTaskActivity from './PracticalTaskActivity';
import Modal from '../common/Modal';
import GlassmorphicCard from '../common/GlassmorphicCard';
import { useToast } from '../../hooks/useToast';
import { useAchievements } from '../../hooks/useAchievements';
import AchievementUnlockModal from '../achievements/AchievementUnlockModal';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon, SparklesIcon } from '@heroicons/react/24/solid';

interface ActivityViewProps {
  activity: Activity;
  onActivityCompleted: () => void;
}

const ActivityView: React.FC<ActivityViewProps> = ({ activity, onActivityCompleted }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    feedback: string;
    nextActivityUnlocked: boolean;
    lessonCompleted: boolean;
  } | null>(null);
  const { success, error: showError } = useToast();
  const { currentAchievement, checkForNewAchievements, closeCurrentAchievement } = useAchievements();

  const handleSubmit = async (response: any) => {
    setIsSubmitting(true);
    try {
      const result = await activityService.submitActivity(activity.id, response);
      setSubmissionResult(result);
      setShowSuccessModal(true);
      
      // Show success toast
      success('Activity submitted successfully!');
      
      // Check for newly unlocked achievements
      setTimeout(() => {
        checkForNewAchievements();
      }, 1000);

      // Trigger callback to refresh activity data
      setTimeout(() => {
        onActivityCompleted();
      }, 2000);
    } catch (err: any) {
      showError(err.response?.data?.error?.message || 'Failed to submit activity');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderActivityComponent = () => {
    switch (activity.type) {
      case 'quiz':
        return (
          <QuizActivity
            activity={activity}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        );
      case 'exercise':
        return (
          <ExerciseActivity
            activity={activity}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        );
      case 'reflection':
        return (
          <ReflectionActivity
            activity={activity}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        );
      case 'practical_task':
        return (
          <PracticalTaskActivity
            activity={activity}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return (
          <GlassmorphicCard variant="default" className="p-6">
            <p className="text-white">Unknown activity type: {activity.type}</p>
          </GlassmorphicCard>
        );
    }
  };

  return (
    <>
      {renderActivityComponent()}

      {/* Achievement Unlock Modal */}
      <AchievementUnlockModal
        achievement={currentAchievement}
        isOpen={!!currentAchievement}
        onClose={closeCurrentAchievement}
      />

      {/* Success Modal with Celebration Animation */}
      <AnimatePresence>
        {showSuccessModal && submissionResult && (
          <Modal
            isOpen={showSuccessModal}
            onClose={() => setShowSuccessModal(false)}
            title="Activity Completed!"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center space-y-6"
            >
              {/* Celebration Icon with Holographic Effect */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: 360 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex justify-center"
              >
                <div className="relative">
                  <CheckCircleIcon className="w-24 h-24 text-success-teal holographic-badge" />
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <SparklesIcon className="w-32 h-32 text-hot-pink opacity-50" />
                  </motion.div>
                </div>
              </motion.div>

              {/* Feedback Message */}
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Excellent Work!
                </h3>
                <GlassmorphicCard variant="default" className="p-4 bg-success-teal/10 border-success-teal/30">
                  <p className="text-white text-lg">{submissionResult.feedback}</p>
                </GlassmorphicCard>
              </div>

              {/* Progress Indicators */}
              <div className="space-y-3">
                {submissionResult.nextActivityUnlocked && (
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <GlassmorphicCard variant="default" className="p-4 bg-hot-pink/10 border-hot-pink/30">
                      <div className="flex items-center gap-3">
                        <CheckCircleIcon className="w-6 h-6 text-hot-pink" />
                        <span className="text-white font-semibold">
                          Next activity unlocked!
                        </span>
                      </div>
                    </GlassmorphicCard>
                  </motion.div>
                )}

                {submissionResult.lessonCompleted && (
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <GlassmorphicCard variant="elevated" className="p-6 bg-gradient-to-r from-hot-pink/20 to-success-teal/20 border-2 border-hot-pink/50 holographic-border">
                      <div className="text-center space-y-2">
                        <motion.div
                          animate={{
                            rotate: [0, 10, -10, 10, 0],
                          }}
                          transition={{
                            duration: 0.5,
                            repeat: Infinity,
                            repeatDelay: 2,
                          }}
                        >
                          <SparklesIcon className="w-12 h-12 text-hot-pink mx-auto" />
                        </motion.div>
                        <h4 className="text-xl font-bold text-white">
                          🎉 Lesson Complete! 🎉
                        </h4>
                        <p className="text-white/80">
                          You've completed all activities in this lesson. The next lesson is now unlocked!
                        </p>
                      </div>
                    </GlassmorphicCard>
                  </motion.div>
                )}
              </div>

              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSuccessModal(false)}
                className="glassmorphic px-8 py-3 bg-hot-pink/20 hover:bg-hot-pink/30 text-white font-semibold rounded-lg transition-all duration-300 holographic"
              >
                Continue Learning
              </motion.button>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
};

export default ActivityView;
