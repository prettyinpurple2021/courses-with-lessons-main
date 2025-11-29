# PowerShell Quick Start Guide

## ⚠️ Important: PowerShell Syntax

In PowerShell, you **MUST** use quotes around IDs and values. PowerShell interprets `<` and `>` as redirection operators, which causes errors.

## Step-by-Step Instructions

### Step 1: Find Lesson IDs

First, list all lessons to find the IDs you need:

```powershell
cd backend
npm run list-lessons
```

This will show output like:
```
📚 All Courses and Lessons:

================================================================================

📖 Course 1: Business Fundamentals
   Course ID: 123e4567-e89b-12d3-a456-426614174000
   Lessons: 12
--------------------------------------------------------------------------------
   Lesson 1: Strategic Foundations
   └─ Lesson ID: abc12345-6789-1234-5678-901234567890
   └─ Activities: 0
```

### Step 2: Copy a Lesson ID

Copy one of the Lesson IDs from the output (the long UUID string).

### Step 3: Generate Content (Dry Run First)

Test with dry-run mode first to preview without saving:

```powershell
npm run generate-content -- --lesson-id "abc12345-6789-1234-5678-901234567890" --dry-run
```

**Important**: Notice the quotes around the lesson ID!

### Step 4: Generate Content (Save to Database)

If the preview looks good, generate and save:

```powershell
npm run generate-content -- --lesson-id "abc12345-6789-1234-5678-901234567890"
```

## Common Commands

### Generate for a Single Lesson
```powershell
npm run generate-content -- --lesson-id "YOUR_LESSON_ID_HERE"
```

### Generate for an Entire Course
```powershell
npm run generate-content -- --course-id "YOUR_COURSE_ID_HERE"
```

### Generate for All Courses
```powershell
npm run generate-content -- --all
```

### Preview Without Saving (Dry Run)
```powershell
npm run generate-content -- --lesson-id "YOUR_LESSON_ID_HERE" --dry-run
```

## Common Errors

### Error: "The '<' operator is reserved for future use"

**Problem**: You forgot quotes around the ID.

**Wrong:**
```powershell
npm run generate-content -- --lesson-id <lessonId>
```

**Correct:**
```powershell
npm run generate-content -- --lesson-id "abc12345-6789-1234-5678-901234567890"
```

### Error: "Lesson not found"

**Problem**: The lesson ID is incorrect or doesn't exist.

**Solution**: Run `npm run list-lessons` to get the correct IDs.

## Tips

1. **Always use quotes** around IDs in PowerShell
2. **Start with dry-run** to preview before saving
3. **Use list-lessons** to find IDs easily
4. **Copy-paste IDs** from the list-lessons output to avoid typos

## Example Workflow

```powershell
# 1. List all lessons
npm run list-lessons

# 2. Copy a lesson ID from the output (e.g., "abc12345-6789-1234-5678-901234567890")

# 3. Preview (dry run)
npm run generate-content -- --lesson-id "abc12345-6789-1234-5678-901234567890" --dry-run

# 4. If preview looks good, generate and save
npm run generate-content -- --lesson-id "abc12345-6789-1234-5678-901234567890"
```

---

**Remember**: In PowerShell, always use quotes around IDs! `"YOUR_ID_HERE"` not `<lessonId>`

