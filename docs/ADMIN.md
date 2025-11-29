# SoloSuccess Intel Academy - Admin Guide

This guide covers the admin panel features for managing courses, lessons, activities, and users.

## Table of Contents

1. [Accessing the Admin Panel](#accessing-the-admin-panel)
2. [Dashboard Overview](#dashboard-overview)
3. [Course Management](#course-management)
4. [Lesson Management](#lesson-management)
5. [Activity Management](#activity-management)
6. [User Management](#user-management)
7. [YouTube Video Integration](#youtube-video-integration)
8. [Best Practices](#best-practices)

## Accessing the Admin Panel

### Admin Login

1. Navigate to `/admin/login`
2. Enter your admin credentials
3. You'll be redirected to the admin dashboard

### Admin Permissions

Only users with the `admin` role can access the admin panel.

To create an admin user:
```bash
cd backend
npm run create-admin
```

Or update an existing user in the database:
```sql
UPDATE "User" SET role = 'admin' WHERE email = 'admin@example.com';
```

## Dashboard Overview

The admin dashboard provides:
- Total users count
- Total courses count
- Active enrollments
- Recent user activity
- Quick access to management sections

## Course Management

### Viewing All Courses

1. Click "Courses" in the admin navigation
2. View all 7 courses with their details
3. See enrollment statistics for each course

### Editing a Course

1. Click "Edit" on a course card
2. Update course information:
   - Title
   - Description
   - Thumbnail URL
   - Published status
3. Click "Save Changes"

### Course Structure

Each course must have:
- Exactly 12 lessons
- One final project
- One final exam
- Sequential course number (1-7)

## Lesson Management

### Viewing Lessons

1. Click on a course
2. View all 12 lessons in the course
3. See lesson status and completion rates

### Creating a Lesson

1. Click "Add Lesson" in a course
2. Fill in lesson details:
   - Lesson number (1-12)
   - Title
   - Description
   - YouTube Video ID
   - Duration (auto-fetched from YouTube)
3. Click "Create Lesson"

### Editing a Lesson

1. Click "Edit" on a lesson
2. Update lesson information
3. Change YouTube video ID if needed
4. Click "Save Changes"

### YouTube Video Integration

**Important**: Only use the YouTube Video ID, not the full URL.

Example:
- ❌ Wrong: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- ✅ Correct: `dQw4w9WgXcQ`

The system will:
- Validate the video ID
- Fetch video metadata (title, duration, thumbnail)
- Display a preview
- Show error if video is private or deleted

## Activity Management

> **📚 Creating Interactive Content**: For comprehensive guides on creating engaging, interactive activities for all 84 lessons, see:
> - `CONTENT_GENERATION_GUIDE.md` - Complete guide with strategies and templates
> - `INTERACTIVE_CONTENT_EXAMPLES.md` - Ready-to-use examples for each course
> - `CONTENT_CREATION_QUICK_START.md` - Quick start guide and workflow
> - `backend/src/scripts/generateInteractiveContent.ts` - Code templates and generators

### Activity Types

1. **Quiz**: Multiple choice or true/false questions
2. **Exercise**: Practical exercises
3. **Reflection**: Written reflections
4. **Practical Task**: Hands-on tasks

### Creating an Activity

1. Navigate to a lesson
2. Click "Add Activity"
3. Fill in activity details:
   - Activity number (sequential)
   - Title
   - Description
   - Type (quiz, exercise, reflection, practical_task)
   - Content (varies by type)
   - Required (yes/no)
4. Click "Create Activity"

### Quiz Activity Content

```json
{
  "questions": [
    {
      "question": "What is the main concept?",
      "type": "multiple_choice",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "correctAnswer": 0
    }
  ]
}
```

### Exercise Activity Content

```json
{
  "instructions": "Complete the following exercise...",
  "steps": [
    "Step 1: ...",
    "Step 2: ...",
    "Step 3: ..."
  ],
  "submissionType": "text"
}
```

### Editing Activities

1. Click "Edit" on an activity
2. Update activity details
3. Modify content JSON
4. Click "Save Changes"

### Deleting Activities

1. Click "Delete" on an activity
2. Confirm deletion
3. Note: This will affect student progress

## User Management

### Viewing All Users

1. Click "Users" in admin navigation
2. View list of all registered users
3. Search and filter users

### User Details

Click on a user to view:
- Profile information
- Enrolled courses
- Progress across all courses
- Activity completion status
- Certificates earned

### Managing User Progress

1. View user's course progress
2. See detailed lesson and activity completion
3. Manually unlock courses if needed (use sparingly)
4. Reset progress if necessary

### User Actions

- **Suspend User**: Temporarily disable account
- **Activate User**: Re-enable suspended account
- **Reset Password**: Send password reset email
- **View Activity Log**: See user's learning history

## YouTube Video Integration

### Video Validation

The platform includes YouTube video validation:

1. Enter a YouTube video ID
2. System validates the video exists
3. Fetches metadata (title, duration, thumbnail)
4. Shows preview before saving

### Handling Video Issues

**Video Not Found:**
- Check the video ID is correct
- Ensure video is public or unlisted (not private)
- Verify video hasn't been deleted

**Video Metadata:**
- Duration is fetched automatically
- Thumbnail is cached
- Title can be used for reference

### YouTube API Setup

Ensure YouTube API key is configured:
```env
YOUTUBE_API_KEY=your-api-key-here
```

Get an API key:
1. Go to Google Cloud Console
2. Enable YouTube Data API v3
3. Create credentials (API key)
4. Add to environment variables

## Best Practices

### Content Creation

1. **Plan Course Structure**: Outline all 12 lessons before creating
2. **Sequential Logic**: Ensure lessons build on each other
3. **Activity Variety**: Mix different activity types
4. **Clear Instructions**: Write detailed activity instructions
5. **Test Content**: Preview lessons as a student would see them

### Video Selection

1. **Quality**: Use high-quality, professional videos
2. **Length**: Keep videos focused (10-30 minutes ideal)
3. **Relevance**: Ensure videos match lesson objectives
4. **Accessibility**: Use videos with captions when possible
5. **Backup**: Keep a list of video IDs in case of changes

### User Support

1. **Monitor Progress**: Check for students stuck on activities
2. **Respond to Issues**: Address technical problems quickly
3. **Provide Feedback**: Review final projects promptly
4. **Update Content**: Refresh outdated material regularly

### Data Management

1. **Regular Backups**: Backup database regularly
2. **Test Changes**: Test in staging before production
3. **Monitor Analytics**: Track course completion rates
4. **User Feedback**: Collect and act on student feedback

### Security

1. **Protect Admin Access**: Use strong passwords
2. **Limit Admin Users**: Only grant admin to trusted users
3. **Audit Logs**: Review admin actions regularly
4. **Update Dependencies**: Keep platform updated

## Troubleshooting

### Common Issues

**YouTube Video Not Loading:**
- Verify video ID is correct
- Check video is public/unlisted
- Ensure YouTube API key is valid
- Check API quota hasn't been exceeded

**User Can't Access Course:**
- Verify previous course is completed
- Check final exam was passed
- Ensure course is published
- Review progression logic

**Activity Not Unlocking:**
- Confirm previous activity is completed
- Check activity sequence numbers
- Verify lesson progress is tracked

**Performance Issues:**
- Check database query performance
- Review server logs for errors
- Monitor API response times
- Optimize large queries

## Course and Lesson Management Interface

### Admin Pages Overview

#### AdminCoursesPage (`/admin/courses`)
- Lists all 7 courses with statistics
- Shows lesson count, enrollment count, final project/exam status
- Navigate to course edit, lesson management

#### AdminCourseEditPage (`/admin/courses/:id`)
- Create/edit course details (title, description, thumbnail, published status)
- Course number validation (1-7)
- Quick access to Final Project and Final Exam management
- Shows current status of final project and exam

#### AdminLessonsPage (`/admin/courses/:courseId/lessons`)
- Lists all lessons for a course (up to 12)
- Shows lesson number, title, YouTube video ID, duration
- Activity and resource counts
- Navigate to lesson edit, activity management

#### AdminLessonEditPage (`/admin/courses/:courseId/lessons/:lessonId/edit`)
- Create/edit lesson details
- YouTube video ID validation using YouTube API
- Fetches video metadata (title, duration, thumbnail)
- Lesson number validation (1-12)
- Auto-fills duration from YouTube validation

#### AdminActivitiesPage (`/admin/courses/:courseId/lessons/:lessonId/activities`)
- Lists all activities for a lesson
- Shows activity type badges (Quiz, Exercise, Reflection, Practical Task)
- Optional/Required indicators
- Navigate to activity edit

#### AdminActivityEditPage (`/admin/courses/:courseId/lessons/:lessonId/activities/:activityId/edit`)
- Create/edit activity details
- Activity type selection with templates
- JSON content editor for activity-specific data
- Required/optional toggle
- **Activity preview functionality** - visualize how students will see the activity
- Content templates for each activity type

#### AdminFinalProjectEditPage (`/admin/courses/:courseId/final-project/edit`)
- Create/edit final project for a course
- Project title, description, instructions
- JSON requirements editor (deliverables, format, etc.)
- Automatically detects if project exists or needs to be created

#### AdminFinalExamEditPage (`/admin/courses/:courseId/final-exam/edit`)
- Create/edit final exam for a course
- Exam title, description, time limit, passing score
- **Visual question bank editor** - add/edit/remove questions with a user-friendly interface
- **JSON editor mode** - switch between visual and JSON editing
- **Exam preview functionality** - see how students will experience the exam
- Question management with visual option editor
- Automatically detects if exam exists or needs to be created

#### AdminUsersPage (`/admin/users`)
- Lists all users with search and filters
- Search by name or email
- Filter by role (student/admin)
- Shows enrollment count, certificates, and activity submissions
- Pagination support

#### AdminUserDetailPage (`/admin/users/:userId`)
- View user's complete progress across all 7 courses
- Shows enrollment status, lesson progress, activity completion
- Displays final project and final exam status
- Visual progress bars for lessons and activities
- Manually unlock courses for users
- View detailed activity completion status

## Admin API Endpoints

### Course Management
```
GET    /api/admin/courses
POST   /api/admin/courses
PUT    /api/admin/courses/:id
DELETE /api/admin/courses/:id
```

### Lesson Management
```
GET    /api/admin/lessons
POST   /api/admin/lessons
PUT    /api/admin/lessons/:id
DELETE /api/admin/lessons/:id
```

### Activity Management
```
GET    /api/admin/activities
POST   /api/admin/activities
PUT    /api/admin/activities/:id
DELETE /api/admin/activities/:id
```

### User Management
```
GET    /api/admin/users
GET    /api/admin/users/:id
PUT    /api/admin/users/:id
POST   /api/admin/users/:id/suspend
POST   /api/admin/users/:id/activate
```

### YouTube Validation
```
GET    /api/admin/youtube/validate/:videoId
GET    /api/admin/youtube/metadata/:videoId
```

## Support

For admin-specific issues:
- **Technical Support**: tech@solosuccess.com
- **Content Questions**: content@solosuccess.com
- **Emergency**: Call emergency support line

---

**Remember**: With great power comes great responsibility. Always test changes in a staging environment first!
