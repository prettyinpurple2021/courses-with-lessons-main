import { useEffect, useRef, RefObject } from 'react';

interface TouchGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinchIn?: (scale: number) => void;
  onPinchOut?: (scale: number) => void;
  threshold?: number; // Minimum distance for swipe (default: 50px)
}

interface TouchPoint {
  x: number;
  y: number;
  time: number;
}

/**
 * Custom hook for handling touch gestures
 * @param elementRef - Reference to the element to attach gestures to
 * @param options - Gesture callbacks and configuration
 */
export const useTouchGestures = (
  elementRef: RefObject<HTMLElement>,
  options: TouchGestureOptions
): void => {
  const touchStart = useRef<TouchPoint | null>(null);
  const touchEnd = useRef<TouchPoint | null>(null);
  const initialPinchDistance = useRef<number | null>(null);
  const threshold = options.threshold || 50;

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const getTouchPoint = (touch: Touch): TouchPoint => ({
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    });

    const getDistance = (touch1: Touch, touch2: Touch): number => {
      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStart.current = getTouchPoint(e.touches[0]);
        touchEnd.current = null;
      } else if (e.touches.length === 2) {
        initialPinchDistance.current = getDistance(e.touches[0], e.touches[1]);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && initialPinchDistance.current) {
        const currentDistance = getDistance(e.touches[0], e.touches[1]);
        const scale = currentDistance / initialPinchDistance.current;

        if (scale < 0.9 && options.onPinchIn) {
          options.onPinchIn(scale);
        } else if (scale > 1.1 && options.onPinchOut) {
          options.onPinchOut(scale);
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStart.current) return;

      if (e.changedTouches.length === 1) {
        touchEnd.current = getTouchPoint(e.changedTouches[0]);

        const deltaX = touchEnd.current.x - touchStart.current.x;
        const deltaY = touchEnd.current.y - touchStart.current.y;
        const deltaTime = touchEnd.current.time - touchStart.current.time;

        // Ignore if touch was too slow (likely not a swipe)
        if (deltaTime > 500) return;

        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);

        // Horizontal swipe
        if (absX > absY && absX > threshold) {
          if (deltaX > 0 && options.onSwipeRight) {
            options.onSwipeRight();
          } else if (deltaX < 0 && options.onSwipeLeft) {
            options.onSwipeLeft();
          }
        }
        // Vertical swipe
        else if (absY > absX && absY > threshold) {
          if (deltaY > 0 && options.onSwipeDown) {
            options.onSwipeDown();
          } else if (deltaY < 0 && options.onSwipeUp) {
            options.onSwipeUp();
          }
        }
      }

      touchStart.current = null;
      touchEnd.current = null;
      initialPinchDistance.current = null;
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [elementRef, options, threshold]);
};

/**
 * Hook to detect if device supports touch
 */
export const useIsTouchDevice = (): boolean => {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  );
};

/**
 * Hook to optimize hover effects for touch devices
 */
export const useOptimizeHoverForTouch = (): boolean => {
  const isTouchDevice = useIsTouchDevice();
  
  useEffect(() => {
    if (isTouchDevice) {
      document.body.classList.add('touch-device');
    } else {
      document.body.classList.add('pointer-device');
    }
  }, [isTouchDevice]);

  return isTouchDevice;
};

export default useTouchGestures;
