# Redis Usage Guide

Redis has been integrated into your application for caching and session management.

## Configuration

Redis credentials are configured in your `.env` file:

```env
REDIS_HOST=your-redis-host.redislabs.com
REDIS_PORT=12345
REDIS_USERNAME=default
REDIS_PASSWORD=your-redis-password-here
```

## Basic Usage

### Using the Cache Utility

The easiest way to use Redis is through the cache utility functions:

```typescript
import { getCache, setCache, getCacheJSON, setCacheJSON } from '../utils/cache.js';

// Store a simple string
await setCache('foo', 'bar');

// Get a simple string
const value = await getCache('foo');
console.log(value); // 'bar'

// Store with expiration (in seconds)
await setCache('session:123', 'user-data', 3600); // Expires in 1 hour

// Store JSON data
await setCacheJSON('user:123', { name: 'John', email: 'john@example.com' }, 3600);

// Get JSON data
const user = await getCacheJSON<{ name: string; email: string }>('user:123');
console.log(user?.name); // 'John'
```

### Direct Redis Client Usage

For advanced operations, you can use the Redis client directly:

```typescript
import { getRedisClient } from '../config/redis.js';

const client = getRedisClient();

if (client) {
  // Set a value
  await client.set('key', 'value');
  
  // Get a value
  const result = await client.get('key');
  
  // Set with expiration
  await client.setEx('key', 3600, 'value'); // Expires in 1 hour
  
  // Delete a key
  await client.del('key');
  
  // Check if key exists
  const exists = await client.exists('key');
  
  // Increment a counter
  await client.incr('counter');
  
  // Hash operations
  await client.hSet('user:123', 'name', 'John');
  await client.hGet('user:123', 'name');
  
  // List operations
  await client.lPush('queue', 'item1');
  await client.rPop('queue');
}
```

## Common Use Cases

### 1. Caching API Responses

```typescript
import { getCacheJSON, setCacheJSON } from '../utils/cache.js';

export async function getCourses() {
  const cacheKey = 'courses:all';
  
  // Try to get from cache first
  const cached = await getCacheJSON(cacheKey);
  if (cached) {
    return cached;
  }
  
  // If not in cache, fetch from database
  const courses = await prisma.course.findMany();
  
  // Store in cache for 5 minutes
  await setCacheJSON(cacheKey, courses, 300);
  
  return courses;
}
```

### 2. Rate Limiting

```typescript
import { getRedisClient } from '../config/redis.js';

export async function checkRateLimit(userId: string): Promise<boolean> {
  const client = getRedisClient();
  if (!client) return true; // Allow if Redis is not available
  
  const key = `ratelimit:${userId}`;
  const count = await client.incr(key);
  
  if (count === 1) {
    // Set expiration on first request
    await client.expire(key, 60); // 60 seconds window
  }
  
  return count <= 100; // Max 100 requests per minute
}
```

### 3. Session Storage

```typescript
import { setCacheJSON, getCacheJSON, deleteCache } from '../utils/cache.js';

export async function createSession(userId: string, sessionData: any) {
  const sessionId = generateSessionId();
  const key = `session:${sessionId}`;
  
  await setCacheJSON(key, { userId, ...sessionData }, 86400); // 24 hours
  
  return sessionId;
}

export async function getSession(sessionId: string) {
  const key = `session:${sessionId}`;
  return await getCacheJSON(key);
}

export async function deleteSession(sessionId: string) {
  const key = `session:${sessionId}`;
  await deleteCache(key);
}
```

### 4. Invalidating Cache

```typescript
import { deleteCache, deleteCachePattern } from '../utils/cache.js';

// Delete a specific cache entry
await deleteCache('courses:all');

// Delete all course-related cache entries
await deleteCachePattern('courses:*');
```

## Best Practices

1. **Always handle Redis failures gracefully** - Your app should work even if Redis is unavailable
2. **Use appropriate expiration times** - Don't cache data forever
3. **Use meaningful key names** - Follow a pattern like `resource:id:field`
4. **Invalidate cache when data changes** - Update or delete cache entries when the underlying data is modified
5. **Don't store sensitive data** - Redis is not encrypted by default

## Testing Redis Connection

You can test your Redis connection by running:

```typescript
import { getRedisClient } from './config/redis.js';

const client = getRedisClient();
if (client) {
  await client.set('test', 'Hello Redis!');
  const result = await client.get('test');
  console.log(result); // Should print: Hello Redis!
}
```
