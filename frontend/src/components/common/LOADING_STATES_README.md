# Loading States and Skeleton Screens

This document describes the loading states and skeleton screen components implemented in the SoloSuccess Intel Academy platform.

## Overview

The platform uses a combination of loading spinners and skeleton screens to provide smooth, engaging loading experiences that maintain the glassmorphic and holographic design aesthetic.

## Components

### 1. LoadingSpinner

A holographic loading spinner with customizable sizes and optional text.

**Location:** `frontend/src/components/common/LoadingSpinner.tsx`

**Props:**
- `size?: 'sm' | 'md' | 'lg' | 'xl'` - Size of the spinner (default: 'md')
- `holographic?: boolean` - Enable holographic border effect (default: true)
- `text?: string` - Optional loading text to display
- `className?: string` - Additional CSS classes
- `fullScreen?: boolean` - Display as full-screen overlay (default: false)

**Usage:**
```tsx
import { LoadingSpinner } from '../components/common';

// Basic usage
<LoadingSpinner />

// With text and custom size
<LoadingSpinner size="lg" text="Loading course..." />

// Full screen overlay
<LoadingSpinner fullScreen text="Processing..." />
```

### 2. SkeletonLoader

A versatile skeleton loader component for creating placeholder content.

**Location:** `frontend/src/components/common/SkeletonLoader.tsx`

**Props:**
- `variant?: 'text' | 'circle' | 'rectangle' | 'card'` - Shape variant (default: 'rectangle')
- `width?: string` - Custom width (CSS value)
- `height?: string` - Custom height (CSS value)
- `count?: number` - Number of skeleton elements to render (default: 1)
- `className?: string` - Additional CSS classes

**Usage:**
```tsx
import { SkeletonLoader } from '../components/common';

// Text skeleton
<SkeletonLoader variant="text" width="80%" />

// Circle skeleton (for avatars)
<SkeletonLoader variant="circle" width="48px" height="48px" />

// Multiple skeletons
<SkeletonLoader variant="text" count={3} />
```

### 3. ProgressiveImage

Progressive image loading component with smooth transitions.

**Location:** `frontend/src/components/common/ProgressiveImage.tsx`

**Props:**
- `src: string` - Image source URL
- `alt: string` - Alt text for accessibility
- `className?: string` - CSS classes for the image
- `placeholderClassName?: string` - CSS classes for the placeholder
- `onLoad?: () => void` - Callback when image loads
- `onError?: () => void` - Callback when image fails to load

**Usage:**
```tsx
import { ProgressiveImage } from '../components/common';

<ProgressiveImage
  src="/path/to/image.jpg"
  alt="Course thumbnail"
  className="w-full h-48 object-cover"
  placeholderClassName="w-full h-48"
/>
```

### 4. CourseCardSkeleton

Skeleton loader specifically designed for course cards.

**Location:** `frontend/src/components/course/CourseCardSkeleton.tsx`

**Usage:**
```tsx
import { CourseCardSkeleton } from '../components/course';

// Single skeleton
<CourseCardSkeleton />

// Multiple skeletons in a grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {Array.from({ length: 6 }, (_, i) => (
    <CourseCardSkeleton key={i} />
  ))}
</div>
```

### 5. ActivityCardSkeleton

Skeleton loader for activity cards.

**Location:** `frontend/src/components/course/ActivityCardSkeleton.tsx`

**Usage:**
```tsx
import { ActivityCardSkeleton } from '../components/course';

<ActivityCardSkeleton />
```

### 6. LessonListSkeleton

Skeleton loader for lesson lists with customizable count.

**Location:** `frontend/src/components/course/LessonListSkeleton.tsx`

**Props:**
- `count?: number` - Number of lesson skeletons to display (default: 3)

**Usage:**
```tsx
import { LessonListSkeleton } from '../components/course';

<LessonListSkeleton count={5} />
```

### 7. CourseProgressCardSkeleton

Skeleton loader for dashboard course progress cards.

**Location:** `frontend/src/components/dashboard/CourseProgressCardSkeleton.tsx`

**Usage:**
```tsx
import CourseProgressCardSkeleton from '../components/dashboard/CourseProgressCardSkeleton';

<CourseProgressCardSkeleton />
```

## Implementation Examples

### Example 1: Course List with Loading State

```tsx
import { useQuery } from '@tanstack/react-query';
import { CourseCard, CourseCardSkeleton } from '../components/course';
import { getAllCourses } from '../services/courseService';

function CourseList() {
  const { data: courses, isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: getAllCourses,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }, (_, index) => (
          <CourseCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses?.map((course) => (
        <CourseCard key={course.id} {...course} />
      ))}
    </div>
  );
}
```

### Example 2: Full Page Loading

```tsx
import { LoadingSpinner } from '../components/common';

function CoursePage() {
  const { data: course, isLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => getCourseById(courseId),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading course..." />
      </div>
    );
  }

  return <div>{/* Course content */}</div>;
}
```

### Example 3: Progressive Image Loading

```tsx
import { ProgressiveImage } from '../components/common';

function CourseHero({ course }) {
  return (
    <div className="relative h-96">
      <ProgressiveImage
        src={course.thumbnail}
        alt={course.title}
        className="w-full h-full object-cover rounded-lg"
        placeholderClassName="w-full h-96 rounded-lg"
      />
    </div>
  );
}
```

## Styling

### Shimmer Animation

The skeleton loaders use a shimmer animation defined in `frontend/src/styles/holographic.css`:

```css
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
```

### Glassmorphic Integration

All skeleton components are wrapped in glassmorphic cards to maintain visual consistency with the platform's design system.

## Best Practices

1. **Use Skeleton Loaders for Content Areas**: Replace content-heavy sections with skeleton loaders that match the layout of the actual content.

2. **Use Loading Spinners for Actions**: Use loading spinners for button actions, form submissions, and full-page loads.

3. **Match Skeleton Layout**: Ensure skeleton loaders closely match the layout and dimensions of the actual content for smooth transitions.

4. **Progressive Image Loading**: Always use ProgressiveImage for course thumbnails, user avatars, and other images to prevent layout shifts.

5. **Smooth Transitions**: The platform uses `transition-opacity duration-500` for smooth fade-ins when content loads.

6. **Accessibility**: All loading components include proper ARIA attributes and screen reader text.

## Performance Considerations

- Skeleton loaders are lightweight and render quickly
- Progressive images prevent layout shifts (CLS)
- Loading spinners use CSS animations for smooth performance
- All animations respect `prefers-reduced-motion` media query

## Future Enhancements

- Add more specialized skeleton components (e.g., ProfileSkeleton, ForumThreadSkeleton)
- Implement staggered loading animations for lists
- Add loading progress indicators for long operations
- Create skeleton variants for mobile vs desktop layouts
