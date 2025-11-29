import React, { useEffect, useState } from 'react';
import { PerformanceMarker } from '../../utils/performanceMonitoring';

/**
 * Performance Monitor Component
 * Displays real-time performance metrics in development mode
 * Only visible when NODE_ENV is development
 */
const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<{
    fps: number;
    memory?: number;
    renderTime: number;
  }>({
    fps: 0,
    renderTime: 0,
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    let frameCount = 0;
    let lastTime = performance.now();
    let animationFrameId: number;

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      const elapsed = currentTime - lastTime;

      if (elapsed >= 1000) {
        const fps = Math.round((frameCount * 1000) / elapsed);
        
        setMetrics((prev) => ({
          ...prev,
          fps,
          memory: (performance as any).memory
            ? Math.round((performance as any).memory.usedJSHeapSize / 1048576)
            : undefined,
        }));

        frameCount = 0;
        lastTime = currentTime;
      }

      animationFrameId = requestAnimationFrame(measureFPS);
    };

    animationFrameId = requestAnimationFrame(measureFPS);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Measure component render time
  useEffect(() => {
    PerformanceMarker.mark('component-render-start');
    
    return () => {
      PerformanceMarker.mark('component-render-end');
      const duration = PerformanceMarker.measure(
        'component-render',
        'component-render-start',
        'component-render-end'
      );
      
      setMetrics((prev) => ({
        ...prev,
        renderTime: Math.round(duration * 100) / 100,
      }));
    };
  });

  // Toggle visibility with keyboard shortcut (Ctrl+Shift+P)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (process.env.NODE_ENV !== 'development' || !isVisible) {
    return null;
  }

  const getFPSColor = (fps: number) => {
    if (fps >= 55) return 'text-green-400';
    if (fps >= 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999] glassmorphic p-4 rounded-lg shadow-lg text-white text-xs font-mono">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-hot-pink">Performance Monitor</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-white hover:text-hot-pink"
          aria-label="Close performance monitor"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-1">
        <div className="flex justify-between gap-4">
          <span>FPS:</span>
          <span className={getFPSColor(metrics.fps)}>{metrics.fps}</span>
        </div>
        
        {metrics.memory !== undefined && (
          <div className="flex justify-between gap-4">
            <span>Memory:</span>
            <span>{metrics.memory} MB</span>
          </div>
        )}
        
        <div className="flex justify-between gap-4">
          <span>Render:</span>
          <span>{metrics.renderTime}ms</span>
        </div>
      </div>
      
      <div className="mt-2 pt-2 border-t border-white/20 text-[10px] text-white/60">
        Press Ctrl+Shift+P to toggle
      </div>
    </div>
  );
};

export default PerformanceMonitor;
