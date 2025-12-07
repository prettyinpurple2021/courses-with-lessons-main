import { useEffect, useState } from 'react';

interface CelebrationAnimationProps {
  show: boolean;
  onComplete?: () => void;
}

const CelebrationAnimation = ({ show, onComplete }: CelebrationAnimationProps) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string }>>([]);

  useEffect(() => {
    if (show) {
      // Generate confetti particles
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: -10,
        color: ['#0FA3A3', '#1CC8C8', '#40E0D0', '#D4AF37', '#1A2B4A', '#2D4A6F'][Math.floor(Math.random() * 6)],
      }));
      setParticles(newParticles);

      // Clear animation after 3 seconds
      const timer = setTimeout(() => {
        setParticles([]);
        onComplete?.();
      }, 3000);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [show, onComplete]);

  if (!show || particles.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-3 h-3 rounded-full animate-fall"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            backgroundColor: particle.color,
            animation: `fall ${2 + Math.random()}s linear forwards`,
            animationDelay: `${Math.random() * 0.5}s`,
          }}
        />
      ))}
      
      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default CelebrationAnimation;
