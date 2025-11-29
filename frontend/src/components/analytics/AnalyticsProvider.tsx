import { useEffect } from 'react';
import { usePageTracking } from '../../hooks/useAnalytics';
import { analytics } from '../../services/analytics';

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

/**
 * Analytics Provider Component
 * 
 * Initializes analytics and provides automatic page tracking.
 * Place this component at the root of your app.
 */
export default function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  // Initialize analytics on mount
  useEffect(() => {
    analytics.initialize();
  }, []);

  // Track page views automatically
  usePageTracking();

  return <>{children}</>;
}
