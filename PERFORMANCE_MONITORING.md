# Performance Monitoring Guide

This document explains the performance optimization and monitoring features implemented in SoloSuccess Intel Academy.

## Overview

The application includes comprehensive performance monitoring and optimization features:

1. **Frontend Code Splitting** - Lazy loading of routes and components
2. **Asset Optimization** - Image lazy loading, WebP support, compression
3. **Caching Strategies** - React Query caching, Service Worker, Redis
4. **Database Optimization** - Indexes, connection pooling, query optimization
5. **Performance Monitoring** - Web Vitals tracking, custom metrics

## Frontend Performance

### Code Splitting

The application uses React.lazy() for route-based code splitting:

- Critical pages (HomePage, LoginPage, RegisterPage) are loaded immediately
- Non-critical pages are lazy-loaded on demand
- Vendor bundles are separated for better caching
- Bundle analyzer available via `npm run build:analyze`

### Asset Optimization

**Image Optimization:**
- Use `LazyImage` component for automatic lazy loading
- WebP format support with fallbacks
- Responsive images with srcset
- Placeholder images during loading

```tsx
import LazyImage from '@/components/common/LazyImage';

<LazyImage
  src="/path/to/image.jpg"
  alt="Description"
  srcSet="image-400.jpg 400w, image-800.jpg 800w"
  sizes="(max-width: 767px) 100vw, 50vw"
/>
```

**Video Optimization:**
- Use `LazyYouTubeEmbed` for YouTube videos
- Videos only load when clicked
- Reduces initial page load significantly

```tsx
import LazyYouTubeEmbed from '@/components/common/LazyYouTubeEmbed';

<LazyYouTubeEmbed
  videoId="dQw4w9WgXcQ"
  title="Lesson Video"
/>
```

### Caching

**React Query Caching:**
- 5-minute stale time for queries
- 10-minute garbage collection time
- Automatic cache invalidation on mutations

**Service Worker:**
- Network-first strategy for API calls
- Cache-first strategy for static assets
- Offline support with fallbacks
- Background sync for data updates

**Browser Caching:**
- Static assets cached for 1 year
- Images cached for 1 month
- HTML files not cached (always fresh)

## Backend Performance

### Database Optimization

**Indexes:**
The following indexes are added for frequently queried columns:
- User: email, createdAt
- Course: courseNumber, published
- Enrollment: userId, courseId, completedAt
- LessonProgress: userId, lessonId, completed
- ActivitySubmission: userId, activityId, completed
- ForumThread: categoryId, authorId, createdAt, isPinned
- Certificate: userId, courseId, verificationCode

**Connection Pooling:**
Prisma automatically manages connection pooling. Configure in DATABASE_URL:
```
postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=20
```

**Query Optimization:**
- Use `include` to prevent N+1 queries
- Use `select` to fetch only needed fields
- Implement pagination for large result sets
- Use transactions for atomic operations

Example optimized query:
```typescript
import { getUserWithEnrollments } from '@/utils/queryOptimization';

const user = await getUserWithEnrollments(userId);
// Fetches user with all enrollments and course details in one query
```

### Redis Caching

**Setup:**
1. Install Redis: `docker run -d -p 6379:6379 redis`
2. Set REDIS_URL in .env: `REDIS_URL=redis://localhost:6379`
3. Redis is optional - app works without it

**Cache Keys:**
```typescript
import { CacheKeys, CacheTTL, getOrSetCache } from '@/utils/cache';

// Cache course data for 15 minutes
const course = await getOrSetCache(
  CacheKeys.course(courseId),
  () => fetchCourseFromDB(courseId),
  CacheTTL.LONG
);
```

**Cache Middleware:**
```typescript
import { cacheMiddleware } from '@/middleware/cacheMiddleware';

// Cache GET requests for 5 minutes
router.get('/courses', cacheMiddleware(300), getCourses);
```

## Performance Monitoring

### Web Vitals

The application automatically tracks Core Web Vitals:

- **LCP (Largest Contentful Paint)** - Loading performance
  - Good: < 2.5s
  - Needs Improvement: 2.5s - 4.0s
  - Poor: > 4.0s

- **FID (First Input Delay)** - Interactivity
  - Good: < 100ms
  - Needs Improvement: 100ms - 300ms
  - Poor: > 300ms

- **CLS (Cumulative Layout Shift)** - Visual stability
  - Good: < 0.1
  - Needs Improvement: 0.1 - 0.25
  - Poor: > 0.25

- **FCP (First Contentful Paint)** - Loading
  - Good: < 1.8s
  - Needs Improvement: 1.8s - 3.0s
  - Poor: > 3.0s

- **TTFB (Time to First Byte)** - Server response
  - Good: < 800ms
  - Needs Improvement: 800ms - 1800ms
  - Poor: > 1800ms

### Custom Metrics

Track custom performance metrics:

```typescript
import { trackCustomMetric, measurePerformance } from '@/utils/performanceMonitoring';

// Track a custom metric
trackCustomMetric('api-call-duration', 250, { endpoint: '/api/courses' });

// Measure function execution time
const result = await measurePerformance('fetchCourses', async () => {
  return await fetchCourses();
});
```

### Performance Monitor (Development)

In development mode, press `Ctrl+Shift+P` to toggle the performance monitor overlay:
- Real-time FPS counter
- Memory usage (if available)
- Component render time

### Analytics Integration

Performance metrics are sent to `/api/analytics/performance` endpoint.

**Production Setup:**

1. **Google Analytics 4:**
```html
<!-- Add to index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

2. **Sentry (Error Tracking):**
```bash
npm install @sentry/react @sentry/tracing
```

```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  integrations: [new Sentry.BrowserTracing()],
  tracesSampleRate: 1.0,
});
```

3. **DataDog / New Relic:**
Follow their respective integration guides for React applications.

## Performance Best Practices

### Frontend

1. **Use lazy loading for images and videos**
   - Always use `LazyImage` and `LazyYouTubeEmbed` components
   
2. **Minimize bundle size**
   - Run `npm run build:analyze` to check bundle sizes
   - Keep vendor chunks under 500KB
   
3. **Optimize re-renders**
   - Use `React.memo` for expensive components
   - Use `useMemo` and `useCallback` appropriately
   
4. **Debounce user input**
   - Debounce search inputs and auto-save operations
   
5. **Prefetch critical data**
   - Use React Query's `prefetchQuery` for predictable navigation

### Backend

1. **Use database indexes**
   - Add indexes for frequently queried columns
   - Monitor slow queries in logs
   
2. **Implement pagination**
   - Never fetch all records at once
   - Use cursor-based pagination for infinite scroll
   
3. **Cache frequently accessed data**
   - Cache course lists, user profiles, etc.
   - Set appropriate TTL values
   
4. **Optimize database queries**
   - Use `include` to prevent N+1 queries
   - Use `select` to fetch only needed fields
   - Use transactions for atomic operations
   
5. **Monitor performance**
   - Check logs for slow queries (> 1s)
   - Monitor database connection pool usage
   - Track API response times

## Monitoring in Production

### Metrics to Track

1. **Frontend:**
   - Core Web Vitals (LCP, FID, CLS)
   - Page load time
   - Time to interactive
   - Bundle sizes
   - Error rates

2. **Backend:**
   - API response times (p50, p95, p99)
   - Database query times
   - Cache hit rates
   - Error rates
   - Server resource usage (CPU, memory)

3. **Database:**
   - Query execution times
   - Connection pool usage
   - Index usage
   - Table sizes

### Alerts

Set up alerts for:
- LCP > 4s
- API response time p95 > 1s
- Error rate > 1%
- Database connection pool > 80% usage
- Memory usage > 80%

## Troubleshooting

### Slow Page Load

1. Check bundle sizes: `npm run build:analyze`
2. Verify images are lazy loaded
3. Check network tab for large resources
4. Verify service worker is caching correctly

### Slow API Responses

1. Check database query logs for slow queries
2. Verify indexes are being used
3. Check Redis cache hit rates
4. Monitor database connection pool

### High Memory Usage

1. Check for memory leaks in React components
2. Verify event listeners are cleaned up
3. Check service worker cache size
4. Monitor database connection pool

## Resources

- [Web Vitals](https://web.dev/vitals/)
- [React Performance](https://react.dev/learn/render-and-commit)
- [Prisma Performance](https://www.prisma.io/docs/guides/performance-and-optimization)
- [Redis Caching](https://redis.io/docs/manual/patterns/)
