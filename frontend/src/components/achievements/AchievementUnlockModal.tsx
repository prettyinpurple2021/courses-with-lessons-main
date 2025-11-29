import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../common/Modal';
import GlassmorphicCard from '../common/GlassmorphicCard';
import { SparklesIcon, TrophyIcon } from '@heroicons/react/24/solid';
import { Achievement } from '../../services/achievementService';

interface AchievementUnlockModalProps {
  achievement: Achievement | null;
  isOpen: boolean;
  onClose: () => void;
}

const AchievementUnlockModal: React.FC<AchievementUnlockModalProps> = ({
  achievement,
  isOpen,
  onClose,
}) => {
  if (!achievement) return null;

  const rarityColors = {
    common: 'from-gray-400 to-gray-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-yellow-400 via-orange-400 to-yellow-600',
  };

  const rarityGlow = {
    common: 'shadow-gray-400/50',
    rare: 'shadow-blue-400/50',
    epic: 'shadow-purple-400/50',
    legendary: 'shadow-yellow-400/50',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal isOpen={isOpen} onClose={onClose} title="">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center space-y-6"
          >
            {/* Achievement Icon with Holographic Effect */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, delay: 0.2, type: 'spring', stiffness: 200 }}
              className="flex justify-center"
            >
              <div className="relative">
                <div
                  className={`w-32 h-32 rounded-full bg-gradient-to-br ${rarityColors[achievement.rarity]} flex items-center justify-center text-6xl shadow-2xl ${rarityGlow[achievement.rarity]} holographic-badge`}
                >
                  {achievement.icon}
                </div>
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
                  <SparklesIcon className="w-40 h-40 text-hot-pink opacity-50" />
                </motion.div>
              </div>
            </motion.div>

            {/* Achievement Title */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-3xl font-bold text-white mb-2 holographic-text">
                Achievement Unlocked!
              </h3>
              <h4 className={`text-2xl font-bold mb-2 ${
                achievement.rarity === 'legendary' ? 'text-yellow-400' :
                achievement.rarity === 'epic' ? 'text-purple-400' :
                achievement.rarity === 'rare' ? 'text-blue-400' :
                'text-gray-300'
              }`}>
                {achievement.title}
              </h4>
            </motion.div>

            {/* Achievement Description */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <GlassmorphicCard
                variant="elevated"
                className={`p-6 border-2 ${
                  achievement.rarity === 'legendary' ? 'bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border-yellow-400/50' :
                  achievement.rarity === 'epic' ? 'bg-purple-400/10 border-purple-400/30' :
                  achievement.rarity === 'rare' ? 'bg-blue-400/10 border-blue-400/30' :
                  'bg-gray-400/10 border-gray-400/30'
                } holographic-border`}
              >
                <p className="text-white text-lg">{achievement.description}</p>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <TrophyIcon className={`w-5 h-5 ${
                    achievement.rarity === 'legendary' ? 'text-yellow-400' :
                    achievement.rarity === 'epic' ? 'text-purple-400' :
                    achievement.rarity === 'rare' ? 'text-blue-400' :
                    'text-gray-400'
                  }`} />
                  <span className={`text-sm font-semibold uppercase ${
                    achievement.rarity === 'legendary' ? 'text-yellow-400' :
                    achievement.rarity === 'epic' ? 'text-purple-400' :
                    achievement.rarity === 'rare' ? 'text-blue-400' :
                    'text-gray-400'
                  }`}>
                    {achievement.rarity}
                  </span>
                </div>
              </GlassmorphicCard>
            </motion.div>

            {/* Close Button */}
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="glassmorphic px-8 py-3 bg-hot-pink/20 hover:bg-hot-pink/30 text-white font-semibold rounded-lg transition-all duration-300 holographic"
            >
              Awesome!
            </motion.button>
          </motion.div>
        </Modal>
      )}
    </AnimatePresence>
  );
};

export default AchievementUnlockModal;

