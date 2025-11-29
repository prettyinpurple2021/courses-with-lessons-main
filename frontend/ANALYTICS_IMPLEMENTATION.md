# Analytics Implementation Guide

This document describes the analytics tracking implementation for SoloSuccess Intel Academy.

## Overview

The platform supports two analytics providers:
- **Google Analytics 4 (GA4)** - Full-featured analytics with detailed user tracking
- **Plausible Analytics** - Privacy-friendly, lightweight analytics

The implementation provides a unified interface that works with both providers, making it easy to switch or use both simultaneously.

## Setup

### Option 1: Google Analytics 4

1. Create a Google Analytics 4 property at https://analytics.google.com
2. Get your Measurement ID (format: `G-XXXXXXXXXX`)
3. Add to your `.env` file:
   ```
   VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   VITE_ANALYTICS_PROVIDER=ga4
   ```

4. Add the GoogleAnalytics component to your app:
   ```tsx
   // src/App.tsx or src/main.tsx
   import GoogleAnalytics from './components/analytics/GoogleAnalytics';
   import AnalyticsProvider from './components/analytics/AnalyticsProvider';

   function App() {
     return (
       <AnalyticsProvider>
         {import.meta.env.VITE_GA_MEASUREMENT_ID && (
           <GoogleAnalytics measurementId={import.meta.env.VITE_GA_MEASUREMENT_ID} />
         )}
         {/* Your app content */}
       </AnalyticsProvider>
     );
   }
   ```

### Option 2: Plausible Analytics

1. Sign up at https://plausible.io
2. Add your domain to Plausible
3. Add to your `.env` file:
   ```
   VITE_PLAUSIBLE_DOMAIN=yourdomain.com
   VITE_ANALYTICS_PROVIDER=plausible
   ```

4. Add the PlausibleAnalytics component to your app:
   ```tsx
   // src/App.tsx or src/main.tsx
   import PlausibleAnalytics from './components/analytics/PlausibleAnalytics';
   import AnalyticsProvider from './components/analytics/AnalyticsProvider';

   function App() {
     return (
       <AnalyticsProvider>
         {import.meta.env.VITE_PLAUSIBLE_DOMAIN && (
           <PlausibleAnalytics domain={import.meta.env.VITE_PLAUSIBLE_DOMAIN} />
         )}
         {/* Your app content */}
       </AnalyticsProvider>
     );
   }
   ```

## Usage

### Basic Event Tracking

```tsx
import { useAnalytics } from '../hooks/useAnalytics';

function MyComponent() {
  const { trackEvent } = useAnalytics();

  const handleClick = () => {
    trackEvent('button_clicked', {
      button_name: 'signup',
      page: 'homepage',
    });
  };

  return <button onClick={handleClick}>Sign Up</button>;
}
```

### Course Enrollment Tracking

```tsx
import { useAnalytics } from '../hooks/useAnalytics';

function EnrollButton({ course }) {
  const { trackCourseEnrollment } = useAnalytics();

  const handleEnroll = async () => {
    await enrollInCourse(course.id);
    
    // Track enrollment
    trackCourseEnrollment(
      course.id,
      course.title,
      course.courseNumber
    );
  };

  return <button onClick={handleEnroll}>Enroll Now</button>;
}
```

### Lesson Completion Tracking

```tsx
import { useAnalytics } from '../hooks/useAnalytics';

function LessonPage({ lesson }) {
  const { trackLessonCompletion } = useAnalytics();

  const handleComplete = async () => {
    await completeLesson(lesson.id);
    
    // Track completion
    trackLessonCompletion(
      lesson.id,
      lesson.title,
      lesson.lessonNumber,
      lesson.courseId
    );
  };

  return <button onClick={handleComplete}>Mark Complete</button>;
}
```

### Activity Completion Tracking

```tsx
import { useAnalytics } from '../hooks/useAnalytics';

function ActivitySubmit({ activity }) {
  const { trackActivityCompletion } = useAnalytics();

  const handleSubmit = async (response) => {
    await submitActivity(activity.id, response);
    
    // Track completion
    trackActivityCompletion(
      activity.id,
      activity.type,
      activity.activityNumber,
      activity.lessonId
    );
  };

  return <button onClick={handleSubmit}>Submit</button>;
}
```

### Sequential Progression Tracking

```tsx
import { useAnalytics } from '../hooks/useAnalytics';

function CourseUnlock({ course }) {
  const { trackCourseUnlock } = useAnalytics();

  useEffect(() => {
    if (course.isUnlocked && !course.wasUnlockedBefore) {
      // Track when a new course is unlocked
      trackCourseUnlock(
        course.id,
        course.title,
        course.courseNumber
      );
    }
  }, [course.isUnlocked]);

  return <div>Course {course.courseNumber}</div>;
}
```

### Final Exam Tracking

```tsx
import { useAnalytics } from '../hooks/useAnalytics';

function FinalExamResults({ exam, score, passed }) {
  const { trackFinalExamResult } = useAnalytics();

  useEffect(() => {
    trackFinalExamResult(
      exam.courseId,
      exam.courseTitle,
      score,
      passed
    );
  }, []);

  return <div>Your score: {score}%</div>;
}
```

### Certificate Tracking

```tsx
import { useAnalytics } from '../hooks/useAnalytics';

function Certificate({ certificate }) {
  const { trackCertificateEarned, trackEvent } = useAnalytics();

  useEffect(() => {
    // Track when certificate is earned
    trackCertificateEarned(
      certificate.courseId,
      certificate.courseTitle,
      certificate.id
    );
  }, []);

  const handleDownload = () => {
    // Track download
    trackEvent('certificate_downloaded', {
      certificate_id: certificate.id,
      course_id: certificate.courseId,
    });
  };

  const handleShare = (platform) => {
    // Track share
    trackEvent('certificate_shared', {
      certificate_id: certificate.id,
      platform,
    });
  };

  return (
    <div>
      <button onClick={handleDownload}>Download</button>
      <button onClick={() => handleShare('linkedin')}>Share on LinkedIn</button>
    </div>
  );
}
```

### User Properties Tracking

```tsx
import { useAnalytics } from '../hooks/useAnalytics';
import { useAuth } from '../hooks/useAuth';

function App() {
  const { user } = useAuth();
  const { setUserProperties } = useAnalytics();

  useEffect(() => {
    if (user) {
      setUserProperties({
        userId: user.id,
        userRole: user.role,
        enrolledCourses: user.enrolledCourses.length,
        completedCourses: user.completedCourses.length,
      });
    }
  }, [user]);

  return <div>App content</div>;
}
```

### Conversion Tracking

```tsx
import { useAnalytics } from '../hooks/useAnalytics';

function PricingPage() {
  const { trackEvent, trackConversion } = useAnalytics();

  useEffect(() => {
    // Track pricing page view
    trackEvent('pricing_page_viewed');
  }, []);

  const handlePurchase = (tier, price) => {
    // Track conversion
    trackConversion('purchase_completed', price, 'USD');
    
    trackEvent('registration_completed', {
      tier,
      price,
    });
  };

  return <div>Pricing content</div>;
}
```

## Tracked Events

### User Events
- `user_registered` - New user registration
- `user_logged_in` - User login
- `user_logged_out` - User logout

### Course Events
- `course_viewed` - Course page viewed
- `course_enrolled` - User enrolled in course
- `course_completed` - Course completed
- `course_unlocked` - New course unlocked (sequential progression)

### Lesson Events
- `lesson_started` - Lesson page opened
- `lesson_completed` - Lesson marked complete
- `lesson_video_played` - Video playback started
- `lesson_video_completed` - Video watched to end

### Activity Events
- `activity_started` - Activity opened
- `activity_completed` - Activity marked complete
- `activity_submitted` - Activity response submitted

### Assessment Events
- `final_project_started` - Final project opened
- `final_project_submitted` - Final project submitted
- `final_exam_started` - Final exam started
- `final_exam_completed` - Final exam submitted
- `final_exam_passed` - Final exam passed
- `final_exam_failed` - Final exam failed

### Certification Events
- `certificate_earned` - Certificate generated
- `certificate_downloaded` - Certificate PDF downloaded
- `certificate_shared` - Certificate shared on social media

### Community Events
- `forum_thread_created` - New forum thread created
- `forum_post_created` - New forum post/reply created
- `member_profile_viewed` - Member profile viewed

### Feature Usage Events
- `note_created` - Note created in lesson
- `note_saved` - Note auto-saved
- `resource_downloaded` - Resource file downloaded
- `achievement_unlocked` - Achievement badge earned

### Conversion Events
- `pricing_page_viewed` - Pricing page viewed
- `registration_started` - Registration form started
- `registration_completed` - Registration completed

## Event Properties

Each event can include custom properties for detailed tracking:

```typescript
{
  course_id: string;
  course_title: string;
  course_number: number;
  lesson_id: string;
  lesson_number: number;
  activity_id: string;
  activity_type: 'quiz' | 'exercise' | 'reflection' | 'practical_task';
  score: number;
  passed: boolean;
  // ... and more
}
```

## Privacy Considerations

### Google Analytics 4
- Collects user data including IP addresses (can be anonymized)
- Uses cookies for tracking
- Requires cookie consent in some jurisdictions
- Provides detailed user journey tracking

### Plausible Analytics
- Privacy-friendly, GDPR compliant
- No cookies used
- No personal data collected
- Lightweight script (< 1KB)
- No cookie consent required

## Best Practices

1. **Track Key User Actions**: Focus on events that provide business value
2. **Use Consistent Naming**: Follow the event naming convention
3. **Include Context**: Add relevant properties to events
4. **Respect Privacy**: Only track what's necessary
5. **Test in Development**: Events are logged to console in dev mode
6. **Monitor Performance**: Analytics should not impact user experience

## Testing

In development mode, all analytics events are logged to the console:

```
[Analytics] Event: course_enrolled { course_id: '123', course_title: 'Foundation & Mindset', course_number: 1 }
```

To test in production mode without sending data:
1. Set `VITE_ANALYTICS_PROVIDER=none` in `.env`
2. Events will still be logged but not sent to analytics providers

## Troubleshooting

### Events Not Tracking

1. Check that analytics provider is initialized:
   ```javascript
   console.log(window.gtag); // For GA4
   console.log(window.plausible); // For Plausible
   ```

2. Verify environment variables are set correctly

3. Check browser console for errors

4. Ensure ad blockers are not blocking analytics scripts

### Multiple Providers

You can use both GA4 and Plausible simultaneously:

```tsx
<AnalyticsProvider>
  {import.meta.env.VITE_GA_MEASUREMENT_ID && (
    <GoogleAnalytics measurementId={import.meta.env.VITE_GA_MEASUREMENT_ID} />
  )}
  {import.meta.env.VITE_PLAUSIBLE_DOMAIN && (
    <PlausibleAnalytics domain={import.meta.env.VITE_PLAUSIBLE_DOMAIN} />
  )}
  {/* App content */}
</AnalyticsProvider>
```

Events will be sent to both providers automatically.

## Dashboard Setup

### Google Analytics 4 Dashboard

Recommended custom reports:
1. **Course Progression Funnel**
   - course_enrolled → lesson_completed → course_completed

2. **Sequential Progression**
   - course_unlocked events by course_number

3. **Activity Completion Rate**
   - activity_started vs activity_completed

4. **Certification Conversion**
   - course_enrolled → certificate_earned

### Plausible Dashboard

Plausible automatically tracks:
- Page views
- Custom events
- Traffic sources
- Device types

Create custom goals for:
- Course enrollments
- Course completions
- Certificate downloads

## Future Enhancements

- Add cohort analysis for course progression
- Implement A/B testing framework
- Add heatmap tracking for UI optimization
- Create custom dashboards for admin panel
- Add real-time analytics monitoring
