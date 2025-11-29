import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { analytics, AnalyticsEvent, AnalyticsEventData } from '../services/analytics';

/**
 * Hook for tracking analytics events
 */
export function useAnalytics() {
  return {
    trackEvent: (eventName: AnalyticsEvent, eventData?: AnalyticsEventData) => {
      analytics.trackEvent(eventName, eventData);
    },
    trackPageView: (path: string, title?: string) => {
      analytics.trackPageView(path, title);
    },
    setUserProperties: (properties: { userId?: string; [key: string]: any }) => {
      analytics.setUserProperties(properties);
    },
    trackConversion: (eventName: string, value?: number, currency?: string) => {
      analytics.trackConversion(eventName, value, currency);
    },
    // Convenience methods
    trackCourseEnrollment: analytics.trackCourseEnrollment.bind(analytics),
    trackCourseCompletion: analytics.trackCourseCompletion.bind(analytics),
    trackCourseUnlock: analytics.trackCourseUnlock.bind(analytics),
    trackLessonCompletion: analytics.trackLessonCompletion.bind(analytics),
    trackActivityCompletion: analytics.trackActivityCompletion.bind(analytics),
    trackFinalExamResult: analytics.trackFinalExamResult.bind(analytics),
    trackCertificateEarned: analytics.trackCertificateEarned.bind(analytics),
    trackResourceDownload: analytics.trackResourceDownload.bind(analytics),
    trackNoteCreated: analytics.trackNoteCreated.bind(analytics),
    trackForumThreadCreated: analytics.trackForumThreadCreated.bind(analytics),
    trackAchievementUnlocked: analytics.trackAchievementUnlocked.bind(analytics),
  };
}

/**
 * Hook for automatic page view tracking
 */
export function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    // Track page view on route change
    analytics.trackPageView(location.pathname + location.search);
  }, [location]);
}

export default useAnalytics;
