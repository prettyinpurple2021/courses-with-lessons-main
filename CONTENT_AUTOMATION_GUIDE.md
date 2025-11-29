# Content Automation Guide

This guide explains how to use the AI-powered content generation system to automatically create interactive activities for your eLearning platform.

## Overview

The automation system uses Google's Gemini AI to generate:
- **Quizzes** (opening, mid-lesson, closing)
- **Exercises** (guided practice activities)
- **Practical Tasks** (real-world applications)
- **Reflections** (deep learning questions)

## Prerequisites

1. **GEMINI_API_KEY** must be set in your `.env` file
2. Admin access to the platform
3. Lessons must exist in the database

## Usage Methods

### Method 1: Command Line Script (Recommended for Batch Operations)

The CLI script allows you to generate content for individual lessons, entire courses, or all courses.

#### Find Lesson IDs First

Before generating content, you need to find lesson IDs:

```bash
cd backend
npm run list-lessons
```

This will show all courses and lessons with their IDs.

#### Generate for a Single Lesson

**PowerShell (Windows):**
```powershell
npm run generate-content -- --lesson-id "123e4567-e89b-12d3-a456-426614174000"
```

**Bash/Linux/Mac:**
```bash
npm run generate-content -- --lesson-id "123e4567-e89b-12d3-a456-426614174000"
```

⚠️ **PowerShell Note**: Always use quotes around the lesson ID, otherwise PowerShell will interpret `<` as a redirection operator.

#### Generate for an Entire Course

**PowerShell:**
```powershell
npm run generate-content -- --course-id "123e4567-e89b-12d3-a456-426614174001"
```

**Bash:**
```bash
npm run generate-content -- --course-id "123e4567-e89b-12d3-a456-426614174001"
```

You can find course IDs using:
```bash
npm run list-lessons
```

#### Generate for All Courses

```bash
npm run generate-content -- --all
```

⚠️ **Warning**: This will generate content for all 84 lessons (7 courses × 12 lessons). This can take a long time and use significant API quota.

#### Dry Run (Preview Without Saving)

Add `--dry-run` to preview generated content without saving to the database:

**PowerShell:**
```powershell
npm run generate-content -- --lesson-id "YOUR_LESSON_ID" --dry-run
```

**Bash:**
```bash
npm run generate-content -- --lesson-id "YOUR_LESSON_ID" --dry-run
```

### Method 2: API Endpoints (Recommended for Integration)

All API endpoints require admin authentication.

#### Generate a Single Activity

```http
POST /api/admin/lessons/:lessonId/generate-activity
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "activityType": "quiz",
  "activityNumber": 1,
  "position": "opening"  // optional: "opening" | "mid" | "closing" (for quizzes)
}
```

**Activity Types:**
- `quiz` - Multiple choice questions
- `exercise` - Guided practice with steps
- `practical_task` - Real-world application task
- `reflection` - Deep learning questions

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "activity-id",
    "activityNumber": 1,
    "title": "Opening Knowledge Check",
    "description": "Test your understanding of key concepts...",
    "type": "quiz",
    "content": { ... }
  },
  "message": "Activity generated and saved successfully"
}
```

#### Generate Full Lesson Plan (Multiple Activities)

```http
POST /api/admin/lessons/:lessonId/generate-activities
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "activityPlan": [
    { "type": "quiz", "position": "opening" },
    { "type": "exercise" },
    { "type": "quiz", "position": "mid" },
    { "type": "practical_task" },
    { "type": "quiz", "position": "closing" }
  ],
  "dryRun": false  // optional: set to true to preview without saving
}
```

**Default Activity Plan** (if not specified):
1. Opening Quiz (3-5 questions)
2. Exercise (guided practice)
3. Mid-Lesson Quiz (5-7 questions)
4. Practical Task (real-world application)
5. Closing Quiz (5-8 questions)

**Response:**
```json
{
  "success": true,
  "data": {
    "lesson": {
      "id": "lesson-id",
      "title": "Lesson Title",
      "course": "Course Title"
    },
    "activities": [ ... ],
    "count": 5
  },
  "message": "Successfully generated and saved 5 activities"
}
```

#### Generate for All Lessons in a Course

```http
POST /api/admin/courses/:courseId/generate-activities
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "dryRun": false  // optional: set to true to preview without saving
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "course": {
      "id": "course-id",
      "title": "Course Title",
      "courseNumber": 1
    },
    "results": [
      {
        "lessonId": "lesson-id",
        "lessonTitle": "Lesson 1",
        "lessonNumber": 1,
        "activitiesGenerated": 5,
        "status": "success"
      },
      ...
    ],
    "totalLessons": 12,
    "successful": 12,
    "failed": 0
  }
}
```

## Activity Types Explained

### Quiz Activities

**Opening Quiz:**
- 3-5 questions
- Tests prior knowledge
- Introduces key concepts
- Position: `"opening"`

**Mid-Lesson Quiz:**
- 5-7 questions
- Reinforces video content
- Scenario-based questions
- Position: `"mid"`

**Closing Quiz:**
- 5-8 questions
- Comprehensive assessment
- Mixed difficulty levels
- Position: `"closing"`

### Exercise Activities

- Guided practice with 3-5 steps
- Hands-on application of concepts
- Includes checklists and hints
- Helps students practice skills

### Practical Task Activities

- Real-world business scenarios
- Clear objectives and deliverables
- Success criteria
- Portfolio-building activities

### Reflection Activities

- 2-4 open-ended questions
- Encourages deep thinking
- Connects learning to personal experience
- Self-assessment focused

## Best Practices

### 1. Start Small

Test with a single lesson first:
```bash
npm run generate-content -- --lesson-id <lessonId> --dry-run
```

Review the generated content, then save it:
```bash
npm run generate-content -- --lesson-id <lessonId>
```

### 2. Review Generated Content

Always review AI-generated content before publishing:
- Check accuracy of quiz answers
- Verify exercise steps are clear
- Ensure practical tasks are realistic
- Confirm reflections are meaningful

### 3. Customize as Needed

The AI generates good starting content, but you may want to:
- Adjust quiz questions for your specific curriculum
- Add more detailed explanations
- Include additional resources
- Modify practical task scenarios

### 4. Monitor API Usage

Gemini API has usage limits. For large batches:
- Use delays between requests (built into the script)
- Monitor your API quota
- Consider generating in smaller batches

### 5. Handle Existing Activities

If a lesson already has activities:
- New activities will be added (not replaced)
- Activity numbers will continue from existing count
- Review for duplicates or conflicts

## Troubleshooting

### "AI client is not configured"

**Solution:** Set `GEMINI_API_KEY` in your `.env` file:
```env
GEMINI_API_KEY=your-api-key-here
```

### "Invalid JSON structure"

**Solution:** The AI sometimes returns markdown-wrapped JSON. The system automatically cleans this, but if issues persist:
- Check your API quota
- Try generating again (AI responses can vary)
- Use dry-run mode to preview first

### "Rate limiting errors"

**Solution:** 
- The script includes automatic delays
- For large batches, generate in smaller chunks
- Wait between API calls if needed

### "Activity number already exists"

**Solution:**
- Check existing activities for the lesson
- The system will continue numbering from existing activities
- Delete conflicting activities if needed

## Example Workflow

### Complete Content Generation for One Course

1. **Preview first lesson (dry run):**
   ```bash
   npm run generate-content -- --lesson-id <firstLessonId> --dry-run
   ```

2. **Review the output** and adjust if needed

3. **Generate for first lesson:**
   ```bash
   npm run generate-content -- --lesson-id <firstLessonId>
   ```

4. **Review in admin panel** to ensure quality

5. **Generate for entire course:**
   ```bash
   npm run generate-content -- --course-id <courseId>
   ```

6. **Review all lessons** in admin panel

7. **Make manual adjustments** as needed

## API Rate Limits & Costs

- **Gemini 1.5 Pro**: Used for content generation (higher quality)
- **Gemini 1.5 Flash**: Used for metadata generation (faster, cheaper)
- Each activity generation = 1-2 API calls
- Full lesson (5 activities) = ~6-10 API calls
- Full course (12 lessons) = ~72-120 API calls
- All courses (84 lessons) = ~504-840 API calls

**Recommendation:** Start with individual lessons or courses, not all at once.

## Integration with Admin Panel

Generated activities appear in the admin panel at:
- `/admin/courses/:courseId/lessons/:lessonId/activities`

You can:
- Edit generated content
- Delete activities
- Reorder activities
- Add additional activities manually

## Next Steps

1. **Set up GEMINI_API_KEY** in your `.env` file
2. **Test with one lesson** using dry-run mode
3. **Review generated content** quality
4. **Generate for a full course** if satisfied
5. **Review and refine** as needed
6. **Scale to all courses** when ready

---

**Remember:** AI-generated content is a starting point. Always review and customize to match your specific curriculum and teaching style!

