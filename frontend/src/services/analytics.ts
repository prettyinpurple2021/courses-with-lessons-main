/**
 * Analytics Service
 * 
 * Provides a unified interface for tracking events across different analytics platforms.
 * Supports Google Analytics 4 and Plausible Analytics.
 */

// Analytics event types
export type AnalyticsEvent =
  // User events
  | 'user_registered'
  | 'user_logged_in'
  | 'user_logged_out'
  
  // Course events
  | 'course_viewed'
  | 'course_enrolled'
  | 'course_completed'
  | 'course_unlocked'
  
  // Lesson events
  | 'lesson_started'
  | 'lesson_completed'
  | 'lesson_video_played'
  | 'lesson_video_completed'
  
  // Activity events
  | 'activity_started'
  | 'activity_completed'
  | 'activity_submitted'
  
  // Assessment events
  | 'final_project_started'
  | 'final_project_submitted'
  | 'final_exam_started'
  | 'final_exam_completed'
  | 'final_exam_passed'
  | 'final_exam_failed'
  
  // Certification events
  | 'certificate_earned'
  | 'certificate_downloaded'
  | 'certificate_shared'
  
  // Community events
  | 'forum_thread_created'
  | 'forum_post_created'
  | 'member_profile_viewed'
  
  // Feature usage events
  | 'note_created'
  | 'note_saved'
  | 'resource_downloaded'
  | 'achievement_unlocked'
  
  // Conversion events
  | 'pricing_page_viewed'
  | 'registration_started'
  | 'registration_completed';

export interface AnalyticsEventData {
  [key: string]: string | number | boolean | undefined;
}

class AnalyticsService {
  private isInitialized = false;
  private analyticsProvider: 'ga4' | 'plausible' | 'none' = 'none';

  /**
   * Initialize analytics service
   */
  initialize() {
    if (this.isInitialized) return;

    // Check for Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      this.analyticsProvider = 'ga4';
      console.log('[Analytics] Google Analytics 4 initialized');
    }
    // Check for Plausible Analytics
    else if (typeof window !== 'undefined' && (window as any).plausible) {
      this.analyticsProvider = 'plausible';
      console.log('[Analytics] Plausible Analytics initialized');
    }
    // No analytics provider found
    else {
      this.analyticsProvider = 'none';
      console.warn('[Analytics] No analytics provider found');
    }

    this.isInitialized = true;
  }

  /**
   * Track a custom event
   */
  trackEvent(eventName: AnalyticsEvent, eventData?: AnalyticsEventData) {
    if (!this.isInitialized) {
      this.initialize();
    }

    // Log in development
    if (import.meta.env.DEV) {
      console.log('[Analytics] Event:', eventName, eventData);
    }

    switch (this.analyticsProvider) {
      case 'ga4':
        this.trackGA4Event(eventName, eventData);
        break;
      case 'plausible':
        this.trackPlausibleEvent(eventName, eventData);
        break;
      case 'none':
        // No-op in development or when analytics is not configured
        break;
    }
  }

  /**
   * Track page view
   */
  trackPageView(path: string, title?: string) {
    if (!this.isInitialized) {
      this.initialize();
    }

    // Respect cookie consent - don't track if analytics is disabled
    if (!this.analyticsEnabled) {
      if (import.meta.env.DEV) {
        console.log('[Analytics] Page view blocked (analytics disabled by consent):', path);
      }
      return;
    }

    if (import.meta.env.DEV) {
      console.log('[Analytics] Page view:', path, title);
    }

    switch (this.analyticsProvider) {
      case 'ga4':
        if ((window as any).gtag) {
          (window as any).gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID, {
            page_path: path,
            page_title: title,
          });
        }
        break;
      case 'plausible':
        if ((window as any).plausible) {
          (window as any).plausible('pageview', { props: { path, title } });
        }
        break;
    }
  }

  /**
   * Track user properties
   */
  setUserProperties(properties: { userId?: string; [key: string]: any }) {
    if (!this.isInitialized) {
      this.initialize();
    }

    switch (this.analyticsProvider) {
      case 'ga4':
        if ((window as any).gtag) {
          (window as any).gtag('set', 'user_properties', properties);
        }
        break;
      case 'plausible':
        // Plausible doesn't support user properties directly
        // Store in session storage for use with events
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('analytics_user_props', JSON.stringify(properties));
        }
        break;
    }
  }

  /**
   * Track conversion event
   */
  trackConversion(eventName: string, value?: number, currency: string = 'USD') {
    this.trackEvent(eventName as AnalyticsEvent, {
      value,
      currency,
    });
  }

  // Private methods

  private trackGA4Event(eventName: string, eventData?: AnalyticsEventData) {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, eventData);
    }
  }

  private trackPlausibleEvent(eventName: string, eventData?: AnalyticsEventData) {
    if (typeof window !== 'undefined' && (window as any).plausible) {
      (window as any).plausible(eventName, { props: eventData });
    }
  }

  // Convenience methods for common events

  /**
   * Track course enrollment
   */
  trackCourseEnrollment(courseId: string, courseTitle: string, courseNumber: number) {
    this.trackEvent('course_enrolled', {
      course_id: courseId,
      course_title: courseTitle,
      course_number: courseNumber,
    });
  }

  /**
   * Track course completion
   */
  trackCourseCompletion(courseId: string, courseTitle: string, courseNumber: number) {
    this.trackEvent('course_completed', {
      course_id: courseId,
      course_title: courseTitle,
      course_number: courseNumber,
    });
  }

  /**
   * Track course unlock (sequential progression)
   */
  trackCourseUnlock(courseId: string, courseTitle: string, courseNumber: number) {
    this.trackEvent('course_unlocked', {
      course_id: courseId,
      course_title: courseTitle,
      course_number: courseNumber,
    });
  }

  /**
   * Track lesson completion
   */
  trackLessonCompletion(
    lessonId: string,
    lessonTitle: string,
    lessonNumber: number,
    courseId: string
  ) {
    this.trackEvent('lesson_completed', {
      lesson_id: lessonId,
      lesson_title: lessonTitle,
      lesson_number: lessonNumber,
      course_id: courseId,
    });
  }

  /**
   * Track activity completion
   */
  trackActivityCompletion(
    activityId: string,
    activityType: string,
    activityNumber: number,
    lessonId: string
  ) {
    this.trackEvent('activity_completed', {
      activity_id: activityId,
      activity_type: activityType,
      activity_number: activityNumber,
      lesson_id: lessonId,
    });
  }

  /**
   * Track final exam result
   */
  trackFinalExamResult(
    courseId: string,
    courseTitle: string,
    score: number,
    passed: boolean
  ) {
    this.trackEvent(passed ? 'final_exam_passed' : 'final_exam_failed', {
      course_id: courseId,
      course_title: courseTitle,
      score,
      passed,
    });
  }

  /**
   * Track certificate earned
   */
  trackCertificateEarned(courseId: string, courseTitle: string, certificateId: string) {
    this.trackEvent('certificate_earned', {
      course_id: courseId,
      course_title: courseTitle,
      certificate_id: certificateId,
    });
  }

  /**
   * Track resource download
   */
  trackResourceDownload(resourceId: string, resourceTitle: string, fileType: string) {
    this.trackEvent('resource_downloaded', {
      resource_id: resourceId,
      resource_title: resourceTitle,
      file_type: fileType,
    });
  }

  /**
   * Track note creation
   */
  trackNoteCreated(lessonId: string, hasTimestamp: boolean) {
    this.trackEvent('note_created', {
      lesson_id: lessonId,
      has_timestamp: hasTimestamp,
    });
  }

  /**
   * Track forum activity
   */
  trackForumThreadCreated(threadId: string, categoryId: string) {
    this.trackEvent('forum_thread_created', {
      thread_id: threadId,
      category_id: categoryId,
    });
  }

  /**
   * Track achievement unlock
   */
  trackAchievementUnlocked(achievementId: string, achievementTitle: string, rarity: string) {
    this.trackEvent('achievement_unlocked', {
      achievement_id: achievementId,
      achievement_title: achievementTitle,
      rarity,
    });
  }
}

// Export singleton instance
export const analytics = new AnalyticsService();

// Export for use in React components
export default analytics;