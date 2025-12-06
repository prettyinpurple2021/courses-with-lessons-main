import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import GlassmorphicCard from '../common/GlassmorphicCard';
import GlassmorphicButton from '../common/GlassmorphicButton';

export interface TooltipConfig {
  id: string;
  targetSelector: string;
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  showOnce?: boolean;
}

interface ContextualTooltipProps {
  config: TooltipConfig;
  onDismiss: (id: string) => void;
  onNext?: () => void;
  showNext?: boolean;
}

export default function ContextualTooltip({
  config,
  onDismiss,
  onNext,
  showNext = false,
}: ContextualTooltipProps) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [visible, setVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const target = document.querySelector(config.targetSelector) as HTMLElement;
    if (!target) {
      // Target not found, hide tooltip
      setVisible(false);
      return;
    }

    targetRef.current = target;
    
    // Check if already shown (if showOnce is true)
    if (config.showOnce) {
      const shownKey = `tooltip_shown_${config.id}`;
      if (localStorage.getItem(shownKey)) {
        setVisible(false);
        return;
      }
    }

    // Calculate position
    const updatePosition = () => {
      if (!target) return;

      const rect = target.getBoundingClientRect();
      const tooltipRect = tooltipRef.current?.getBoundingClientRect();
      const spacing = 12;

      let top = 0;
      let left = 0;

      switch (config.position || 'bottom') {
        case 'top':
          top = rect.top - (tooltipRect?.height || 0) - spacing;
          left = rect.left + rect.width / 2;
          break;
        case 'bottom':
          top = rect.bottom + spacing;
          left = rect.left + rect.width / 2;
          break;
        case 'left':
          top = rect.top + rect.height / 2;
          left = rect.left - (tooltipRect?.width || 0) - spacing;
          break;
        case 'right':
          top = rect.top + rect.height / 2;
          left = rect.right + spacing;
          break;
      }

      // Center horizontally for top/bottom
      if (config.position === 'top' || config.position === 'bottom' || !config.position) {
        left -= (tooltipRect?.width || 0) / 2;
      }

      // Center vertically for left/right
      if (config.position === 'left' || config.position === 'right') {
        top -= (tooltipRect?.height || 0) / 2;
      }

      // Keep within viewport
      const maxLeft = window.innerWidth - (tooltipRect?.width || 0) - 20;
      const maxTop = window.innerHeight - (tooltipRect?.height || 0) - 20;
      left = Math.max(20, Math.min(left, maxLeft));
      top = Math.max(20, Math.min(top, maxTop));

      setPosition({ top, left });
      setVisible(true);
    };

    // Add highlight to target
    target.style.outline = '2px solid #FF1493';
    target.style.outlineOffset = '4px';
    target.style.zIndex = '9998';
    target.style.position = 'relative';

    // Update position on scroll/resize
    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
      if (target) {
        target.style.outline = '';
        target.style.outlineOffset = '';
        target.style.zIndex = '';
        target.style.position = '';
      }
    };
  }, [config]);

  const handleDismiss = () => {
    if (config.showOnce) {
      localStorage.setItem(`tooltip_shown_${config.id}`, 'true');
    }
    setVisible(false);
    onDismiss(config.id);
  };

  if (!visible || !targetRef.current) {
    return null;
  }

  const tooltipContent = (
    <div
      ref={tooltipRef}
      className="fixed z-[9999] pointer-events-auto"
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
    >
      <GlassmorphicCard className="max-w-xs p-4">
        <div className="mb-3">
          <h3 className="text-white font-bold text-sm mb-1">{config.title}</h3>
          <p className="text-gray-300 text-xs">{config.description}</p>
        </div>
        <div className="flex items-center justify-end gap-2">
          {showNext && onNext && (
            <GlassmorphicButton
              onClick={onNext}
              variant="primary"
              size="sm"
              className="text-xs"
            >
              Next
            </GlassmorphicButton>
          )}
          <button
            onClick={handleDismiss}
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            Got it
          </button>
        </div>
      </GlassmorphicCard>
    </div>
  );

  return createPortal(tooltipContent, document.body);
}

