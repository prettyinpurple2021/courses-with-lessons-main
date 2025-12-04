# YouTube Video Consistency Issues

## Current Problems

### 1. Course 2 (Marketing Mastery) - Wrong Videos
**Issue**: Course 2 uses the same video IDs as Course 1 (Foundation), which are entrepreneurship videos, not marketing videos.

**Current Assignment**:
- Lesson 1: `aozlwC3XwfY` - "Who Even Is An Entrepreneur?" (should be marketing content)
- Lesson 2: `39tQ-GLB6ZE` - "Business Fundamentals for Entrepreneurs" (should be marketing content)
- All 12 lessons use entrepreneurship videos instead of marketing videos

**Impact**: Students learning marketing will see entrepreneurship content, causing confusion and poor learning experience.

### 2. Courses 3-7 - Insufficient Video Variety
**Issue**: These courses only have 2-4 unique videos that repeat across 12 lessons.

**Current State**:
- **Course 3 (Financial Intelligence)**: 4 unique videos repeating (lessons 1-4, 5-8, 9-12 share videos)
- **Course 4 (Sales & Conversion)**: 2 videos alternating (every other lesson has the same video)
- **Course 5 (Operations & Systems)**: 2 videos alternating
- **Course 6 (Leadership & Team Building)**: 2 videos alternating
- **Course 7 (Growth & Scaling)**: 2 videos alternating

**Impact**: Students will see the same videos multiple times, reducing engagement and learning value.

### 3. Generic Lesson Titles
**Issue**: Lesson titles are generic and don't specify topics:
- "Lesson 1: Foundation: Business Fundamentals - Part 1"
- "Lesson 2: Marketing Mastery - Part 2"

**Impact**: Cannot verify video-to-content alignment because lesson topics aren't defined.

### 4. No Content-Based Mapping
**Issue**: Videos are assigned sequentially by array index, with no consideration of:
- Lesson topic/content
- Learning progression
- Video content matching lesson objectives

## Recommendations

### Immediate Fixes Needed

1. **Fix Course 2 Videos**: Replace all 12 video IDs with actual marketing-related educational videos
2. **Add More Videos**: Find 12 unique, topic-specific videos for each course (3-7)
3. **Improve Lesson Titles**: Update seed script to create specific, descriptive lesson titles
4. **Create Video Mapping**: Map videos to specific lesson topics rather than sequential assignment

### Long-Term Improvements

1. **Content Verification Script**: Create a script that validates video titles/descriptions match lesson topics using YouTube API
2. **Video Curation Process**: Establish a process for finding and verifying educational videos
3. **Topic-Based Assignment**: Update seed script to assign videos based on lesson topics, not just course number

## Current Video Assignment Logic

```typescript
// Videos assigned sequentially by index
for (let i = 0; i < course.lessons.length; i++) {
  const videoId = videos[i] || videos[0]; // Falls back to first video
  // No consideration of lesson topic or content
}
```

## Suggested Approach

1. Define specific lesson topics for each course
2. Curate 12 unique videos per course that match those topics
3. Map videos to lessons based on topic alignment
4. Validate using YouTube API to ensure video titles/descriptions match lesson topics

