# Production Readiness Report

**Generated:** 2025-12-01T03:36:54.436Z

## Summary

- ✅ Passed: 0/3
- ❌ Failed: 3/3
- ⚠️  Warnings: 0/3

## ❌ Status: NOT READY FOR PRODUCTION

Critical errors found. Please fix all errors before deploying.

---

## ❌ Production Readiness Check

### Errors

- Command failed: tsx scripts/production-readiness-check.ts

<details>
<summary>Full Output</summary>

```
🚀 Production Readiness Check

============================================================

📋 Checking Environment Variables...


📋 Checking Database...


📋 Checking YouTube Videos...


📋 Checking External Services...


📋 Checking Security Configuration...


📋 Checking Content...


============================================================

📊 Summary:

✅ Passed: 45
❌ Failed: 4
⚠️  Warnings: 3

❌ Critical Issues (must fix before production):

   Env: NODE_ENV: Invalid value
      → Check configuration
   Env: CORS_ORIGIN: Invalid value
      → Check configuration
   Env: FRONTEND_URL: Invalid value
      → Check configuration
   HTTPS Configuration: CORS origin does not use HTTPS
      → Production must use HTTPS

⚠️  Warnings (recommended to fix):

   Env: SENTRY_DSN: Not set
      → Recommended for production error tracking
   YouTube Videos: Found 10 potentially invalid video IDs
      → Verify all video IDs are valid
   Error Tracking: Sentry not configured
      → Recommended for production

❌ Please fix critical issues before deploying to production.


```

</details>

---

## ❌ Content Completeness Verification

### Errors

- Command failed: tsx scripts/verify-content-completeness.ts

<details>
<summary>Full Output</summary>

```
🔍 Content Completeness Verification

======================================================================

📚 Verifying Courses...

✅ Verified 7 courses

🔍 Verifying Database Integrity...


📊 Generating Report...

======================================================================
CONTENT COMPLETENESS REPORT
======================================================================

❌ Errors: 8
⚠️  Warnings: 84
ℹ️  Info: 0

❌ ERRORS (Must Fix Before Production):

1. [Course 1] Final exam for "Foundation: Business Fundamentals" has no questions
   → Add questions to final exam
   Course: 1

2. [Course 2] Final exam for "Marketing Mastery" has no questions
   → Add questions to final exam
   Course: 2

3. [Course 3] Final exam for "Financial Intelligence" has no questions
   → Add questions to final exam
   Course: 3

4. [Course 4] Final exam for "Sales & Conversion" has no questions
   → Add questions to final exam
   Course: 4

5. [Course 5] Final exam for "Operations & Systems" has no questions
   → Add questions to final exam
   Course: 5

6. [Course 6] Final exam for "Leadership & Team Building" has no questions
   → Add questions to final exam
   Course: 6

7. [Course 7] Final exam for "Growth & Scaling" has no questions
   → Add questions to final exam
   Course: 7

8. [Database Integrity] Failed to check database integrity
   → 
Invalid `prisma.lesson.findMany()` invocation in
C:\Users\prett\OneDrive\Desktop\courses-with-lessons-main\scripts\verify-content-completeness.ts:285:54

  282 
  283 try {
  284   // Check for orphaned records
→ 285   const lessonsWithoutCourse = await prisma.lesson.findMany({
          where: {
        +   course: {
        +     is: CourseWhereInput,
        +     isNot: CourseWhereInput
        +   }
          }
        })

Argument `course` must not be null.


⚠️  WARNINGS (Recommended to Fix):

1. [Course 1 - Lesson 1] Lesson "Lesson 1: Foundation: Business Fundamentals - Part 1" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 1
   Lesson: 1

2. [Course 1 - Lesson 2] Lesson "Lesson 2: Foundation: Business Fundamentals - Part 2" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 1
   Lesson: 2

3. [Course 1 - Lesson 3] Lesson "Lesson 3: Foundation: Business Fundamentals - Part 3" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 1
   Lesson: 3

4. [Course 1 - Lesson 4] Lesson "Lesson 4: Foundation: Business Fundamentals - Part 4" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 1
   Lesson: 4

5. [Course 1 - Lesson 5] Lesson "Lesson 5: Foundation: Business Fundamentals - Part 5" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 1
   Lesson: 5

6. [Course 1 - Lesson 6] Lesson "Lesson 6: Foundation: Business Fundamentals - Part 6" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 1
   Lesson: 6

7. [Course 1 - Lesson 7] Lesson "Lesson 7: Foundation: Business Fundamentals - Part 7" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 1
   Lesson: 7

8. [Course 1 - Lesson 8] Lesson "Lesson 8: Foundation: Business Fundamentals - Part 8" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 1
   Lesson: 8

9. [Course 1 - Lesson 9] Lesson "Lesson 9: Foundation: Business Fundamentals - Part 9" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 1
   Lesson: 9

10. [Course 1 - Lesson 10] Lesson "Lesson 10: Foundation: Business Fundamentals - Part 10" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 1
   Lesson: 10

11. [Course 1 - Lesson 11] Lesson "Lesson 11: Foundation: Business Fundamentals - Part 11" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 1
   Lesson: 11

12. [Course 1 - Lesson 12] Lesson "Lesson 12: Foundation: Business Fundamentals - Part 12" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 1
   Lesson: 12

13. [Course 2 - Lesson 1] Lesson "Lesson 1: Marketing Mastery - Part 1" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 2
   Lesson: 1

14. [Course 2 - Lesson 2] Lesson "Lesson 2: Marketing Mastery - Part 2" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 2
   Lesson: 2

15. [Course 2 - Lesson 3] Lesson "Lesson 3: Marketing Mastery - Part 3" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 2
   Lesson: 3

16. [Course 2 - Lesson 4] Lesson "Lesson 4: Marketing Mastery - Part 4" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 2
   Lesson: 4

17. [Course 2 - Lesson 5] Lesson "Lesson 5: Marketing Mastery - Part 5" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 2
   Lesson: 5

18. [Course 2 - Lesson 6] Lesson "Lesson 6: Marketing Mastery - Part 6" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 2
   Lesson: 6

19. [Course 2 - Lesson 7] Lesson "Lesson 7: Marketing Mastery - Part 7" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 2
   Lesson: 7

20. [Course 2 - Lesson 8] Lesson "Lesson 8: Marketing Mastery - Part 8" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 2
   Lesson: 8

21. [Course 2 - Lesson 9] Lesson "Lesson 9: Marketing Mastery - Part 9" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 2
   Lesson: 9

22. [Course 2 - Lesson 10] Lesson "Lesson 10: Marketing Mastery - Part 10" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 2
   Lesson: 10

23. [Course 2 - Lesson 11] Lesson "Lesson 11: Marketing Mastery - Part 11" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 2
   Lesson: 11

24. [Course 2 - Lesson 12] Lesson "Lesson 12: Marketing Mastery - Part 12" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 2
   Lesson: 12

25. [Course 3 - Lesson 1] Lesson "Lesson 1: Financial Intelligence - Part 1" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 3
   Lesson: 1

26. [Course 3 - Lesson 2] Lesson "Lesson 2: Financial Intelligence - Part 2" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 3
   Lesson: 2

27. [Course 3 - Lesson 3] Lesson "Lesson 3: Financial Intelligence - Part 3" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 3
   Lesson: 3

28. [Course 3 - Lesson 4] Lesson "Lesson 4: Financial Intelligence - Part 4" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 3
   Lesson: 4

29. [Course 3 - Lesson 5] Lesson "Lesson 5: Financial Intelligence - Part 5" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 3
   Lesson: 5

30. [Course 3 - Lesson 6] Lesson "Lesson 6: Financial Intelligence - Part 6" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 3
   Lesson: 6

31. [Course 3 - Lesson 7] Lesson "Lesson 7: Financial Intelligence - Part 7" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 3
   Lesson: 7

32. [Course 3 - Lesson 8] Lesson "Lesson 8: Financial Intelligence - Part 8" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 3
   Lesson: 8

33. [Course 3 - Lesson 9] Lesson "Lesson 9: Financial Intelligence - Part 9" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 3
   Lesson: 9

34. [Course 3 - Lesson 10] Lesson "Lesson 10: Financial Intelligence - Part 10" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 3
   Lesson: 10

35. [Course 3 - Lesson 11] Lesson "Lesson 11: Financial Intelligence - Part 11" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 3
   Lesson: 11

36. [Course 3 - Lesson 12] Lesson "Lesson 12: Financial Intelligence - Part 12" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 3
   Lesson: 12

37. [Course 4 - Lesson 1] Lesson "Lesson 1: Sales & Conversion - Part 1" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 4
   Lesson: 1

38. [Course 4 - Lesson 2] Lesson "Lesson 2: Sales & Conversion - Part 2" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 4
   Lesson: 2

39. [Course 4 - Lesson 3] Lesson "Lesson 3: Sales & Conversion - Part 3" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 4
   Lesson: 3

40. [Course 4 - Lesson 4] Lesson "Lesson 4: Sales & Conversion - Part 4" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 4
   Lesson: 4

41. [Course 4 - Lesson 5] Lesson "Lesson 5: Sales & Conversion - Part 5" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 4
   Lesson: 5

42. [Course 4 - Lesson 6] Lesson "Lesson 6: Sales & Conversion - Part 6" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 4
   Lesson: 6

43. [Course 4 - Lesson 7] Lesson "Lesson 7: Sales & Conversion - Part 7" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 4
   Lesson: 7

44. [Course 4 - Lesson 8] Lesson "Lesson 8: Sales & Conversion - Part 8" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 4
   Lesson: 8

45. [Course 4 - Lesson 9] Lesson "Lesson 9: Sales & Conversion - Part 9" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 4
   Lesson: 9

46. [Course 4 - Lesson 10] Lesson "Lesson 10: Sales & Conversion - Part 10" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 4
   Lesson: 10

47. [Course 4 - Lesson 11] Lesson "Lesson 11: Sales & Conversion - Part 11" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 4
   Lesson: 11

48. [Course 4 - Lesson 12] Lesson "Lesson 12: Sales & Conversion - Part 12" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 4
   Lesson: 12

49. [Course 5 - Lesson 1] Lesson "Lesson 1: Operations & Systems - Part 1" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 5
   Lesson: 1

50. [Course 5 - Lesson 2] Lesson "Lesson 2: Operations & Systems - Part 2" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 5
   Lesson: 2

51. [Course 5 - Lesson 3] Lesson "Lesson 3: Operations & Systems - Part 3" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 5
   Lesson: 3

52. [Course 5 - Lesson 4] Lesson "Lesson 4: Operations & Systems - Part 4" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 5
   Lesson: 4

53. [Course 5 - Lesson 5] Lesson "Lesson 5: Operations & Systems - Part 5" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 5
   Lesson: 5

54. [Course 5 - Lesson 6] Lesson "Lesson 6: Operations & Systems - Part 6" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 5
   Lesson: 6

55. [Course 5 - Lesson 7] Lesson "Lesson 7: Operations & Systems - Part 7" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 5
   Lesson: 7

56. [Course 5 - Lesson 8] Lesson "Lesson 8: Operations & Systems - Part 8" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 5
   Lesson: 8

57. [Course 5 - Lesson 9] Lesson "Lesson 9: Operations & Systems - Part 9" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 5
   Lesson: 9

58. [Course 5 - Lesson 10] Lesson "Lesson 10: Operations & Systems - Part 10" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 5
   Lesson: 10

59. [Course 5 - Lesson 11] Lesson "Lesson 11: Operations & Systems - Part 11" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 5
   Lesson: 11

60. [Course 5 - Lesson 12] Lesson "Lesson 12: Operations & Systems - Part 12" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 5
   Lesson: 12

61. [Course 6 - Lesson 1] Lesson "Lesson 1: Leadership & Team Building - Part 1" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 6
   Lesson: 1

62. [Course 6 - Lesson 2] Lesson "Lesson 2: Leadership & Team Building - Part 2" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 6
   Lesson: 2

63. [Course 6 - Lesson 3] Lesson "Lesson 3: Leadership & Team Building - Part 3" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 6
   Lesson: 3

64. [Course 6 - Lesson 4] Lesson "Lesson 4: Leadership & Team Building - Part 4" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 6
   Lesson: 4

65. [Course 6 - Lesson 5] Lesson "Lesson 5: Leadership & Team Building - Part 5" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 6
   Lesson: 5

66. [Course 6 - Lesson 6] Lesson "Lesson 6: Leadership & Team Building - Part 6" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 6
   Lesson: 6

67. [Course 6 - Lesson 7] Lesson "Lesson 7: Leadership & Team Building - Part 7" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 6
   Lesson: 7

68. [Course 6 - Lesson 8] Lesson "Lesson 8: Leadership & Team Building - Part 8" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 6
   Lesson: 8

69. [Course 6 - Lesson 9] Lesson "Lesson 9: Leadership & Team Building - Part 9" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 6
   Lesson: 9

70. [Course 6 - Lesson 10] Lesson "Lesson 10: Leadership & Team Building - Part 10" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 6
   Lesson: 10

71. [Course 6 - Lesson 11] Lesson "Lesson 11: Leadership & Team Building - Part 11" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 6
   Lesson: 11

72. [Course 6 - Lesson 12] Lesson "Lesson 12: Leadership & Team Building - Part 12" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 6
   Lesson: 12

73. [Course 7 - Lesson 1] Lesson "Lesson 1: Growth & Scaling - Part 1" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 7
   Lesson: 1

74. [Course 7 - Lesson 2] Lesson "Lesson 2: Growth & Scaling - Part 2" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 7
   Lesson: 2

75. [Course 7 - Lesson 3] Lesson "Lesson 3: Growth & Scaling - Part 3" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 7
   Lesson: 3

76. [Course 7 - Lesson 4] Lesson "Lesson 4: Growth & Scaling - Part 4" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 7
   Lesson: 4

77. [Course 7 - Lesson 5] Lesson "Lesson 5: Growth & Scaling - Part 5" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 7
   Lesson: 5

78. [Course 7 - Lesson 6] Lesson "Lesson 6: Growth & Scaling - Part 6" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 7
   Lesson: 6

79. [Course 7 - Lesson 7] Lesson "Lesson 7: Growth & Scaling - Part 7" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 7
   Lesson: 7

80. [Course 7 - Lesson 8] Lesson "Lesson 8: Growth & Scaling - Part 8" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 7
   Lesson: 8

81. [Course 7 - Lesson 9] Lesson "Lesson 9: Growth & Scaling - Part 9" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 7
   Lesson: 9

82. [Course 7 - Lesson 10] Lesson "Lesson 10: Growth & Scaling - Part 10" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 7
   Lesson: 10

83. [Course 7 - Lesson 11] Lesson "Lesson 11: Growth & Scaling - Part 11" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 7
   Lesson: 11

84. [Course 7 - Lesson 12] Lesson "Lesson 12: Growth & Scaling - Part 12" has potentially invalid video ID: dQw4w9WgXcQ
   → Verify this is a real YouTube video ID
   Course: 7
   Lesson: 12


📋 Summary by Category:

❌ Course 1: 1 errors, 0 warnings
⚠️ Course 1 - Lesson 1: 0 errors, 1 warnings
⚠️ Course 1 - Lesson 2: 0 errors, 1 warnings
⚠️ Course 1 - Lesson 3: 0 errors, 1 warnings
⚠️ Course 1 - Lesson 4: 0 errors, 1 warnings
⚠️ Course 1 - Lesson 5: 0 errors, 1 warnings
⚠️ Course 1 - Lesson 6: 0 errors, 1 warnings
⚠️ Course 1 - Lesson 7: 0 errors, 1 warnings
⚠️ Course 1 - Lesson 8: 0 errors, 1 warnings
⚠️ Course 1 - Lesson 9: 0 errors, 1 warnings
⚠️ Course 1 - Lesson 10: 0 errors, 1 warnings
⚠️ Course 1 - Lesson 11: 0 errors, 1 warnings
⚠️ Course 1 - Lesson 12: 0 errors, 1 warnings
❌ Course 2: 1 errors, 0 warnings
⚠️ Course 2 - Lesson 1: 0 errors, 1 warnings
⚠️ Course 2 - Lesson 2: 0 errors, 1 warnings
⚠️ Course 2 - Lesson 3: 0 errors, 1 warnings
⚠️ Course 2 - Lesson 4: 0 errors, 1 warnings
⚠️ Course 2 - Lesson 5: 0 errors, 1 warnings
⚠️ Course 2 - Lesson 6: 0 errors, 1 warnings
⚠️ Course 2 - Lesson 7: 0 errors, 1 warnings
⚠️ Course 2 - Lesson 8: 0 errors, 1 warnings
⚠️ Course 2 - Lesson 9: 0 errors, 1 warnings
⚠️ Course 2 - Lesson 10: 0 errors, 1 warnings
⚠️ Course 2 - Lesson 11: 0 errors, 1 warnings
⚠️ Course 2 - Lesson 12: 0 errors, 1 warnings
❌ Course 3: 1 errors, 0 warnings
⚠️ Course 3 - Lesson 1: 0 errors, 1 warnings
⚠️ Course 3 - Lesson 2: 0 errors, 1 warnings
⚠️ Course 3 - Lesson 3: 0 errors, 1 warnings
⚠️ Course 3 - Lesson 4: 0 errors, 1 warnings
⚠️ Course 3 - Lesson 5: 0 errors, 1 warnings
⚠️ Course 3 - Lesson 6: 0 errors, 1 warnings
⚠️ Course 3 - Lesson 7: 0 errors, 1 warnings
⚠️ Course 3 - Lesson 8: 0 errors, 1 warnings
⚠️ Course 3 - Lesson 9: 0 errors, 1 warnings
⚠️ Course 3 - Lesson 10: 0 errors, 1 warnings
⚠️ Course 3 - Lesson 11: 0 errors, 1 warnings
⚠️ Course 3 - Lesson 12: 0 errors, 1 warnings
❌ Course 4: 1 errors, 0 warnings
⚠️ Course 4 - Lesson 1: 0 errors, 1 warnings
⚠️ Course 4 - Lesson 2: 0 errors, 1 warnings
⚠️ Course 4 - Lesson 3: 0 errors, 1 warnings
⚠️ Course 4 - Lesson 4: 0 errors, 1 warnings
⚠️ Course 4 - Lesson 5: 0 errors, 1 warnings
⚠️ Course 4 - Lesson 6: 0 errors, 1 warnings
⚠️ Course 4 - Lesson 7: 0 errors, 1 warnings
⚠️ Course 4 - Lesson 8: 0 errors, 1 warnings
⚠️ Course 4 - Lesson 9: 0 errors, 1 warnings
⚠️ Course 4 - Lesson 10: 0 errors, 1 warnings
⚠️ Course 4 - Lesson 11: 0 errors, 1 warnings
⚠️ Course 4 - Lesson 12: 0 errors, 1 warnings
❌ Course 5: 1 errors, 0 warnings
⚠️ Course 5 - Lesson 1: 0 errors, 1 warnings
⚠️ Course 5 - Lesson 2: 0 errors, 1 warnings
⚠️ Course 5 - Lesson 3: 0 errors, 1 warnings
⚠️ Course 5 - Lesson 4: 0 errors, 1 warnings
⚠️ Course 5 - Lesson 5: 0 errors, 1 warnings
⚠️ Course 5 - Lesson 6: 0 errors, 1 warnings
⚠️ Course 5 - Lesson 7: 0 errors, 1 warnings
⚠️ Course 5 - Lesson 8: 0 errors, 1 warnings
⚠️ Course 5 - Lesson 9: 0 errors, 1 warnings
⚠️ Course 5 - Lesson 10: 0 errors, 1 warnings
⚠️ Course 5 - Lesson 11: 0 errors, 1 warnings
⚠️ Course 5 - Lesson 12: 0 errors, 1 warnings
❌ Course 6: 1 errors, 0 warnings
⚠️ Course 6 - Lesson 1: 0 errors, 1 warnings
⚠️ Course 6 - Lesson 2: 0 errors, 1 warnings
⚠️ Course 6 - Lesson 3: 0 errors, 1 warnings
⚠️ Course 6 - Lesson 4: 0 errors, 1 warnings
⚠️ Course 6 - Lesson 5: 0 errors, 1 warnings
⚠️ Course 6 - Lesson 6: 0 errors, 1 warnings
⚠️ Course 6 - Lesson 7: 0 errors, 1 warnings
⚠️ Course 6 - Lesson 8: 0 errors, 1 warnings
⚠️ Course 6 - Lesson 9: 0 errors, 1 warnings
⚠️ Course 6 - Lesson 10: 0 errors, 1 warnings
⚠️ Course 6 - Lesson 11: 0 errors, 1 warnings
⚠️ Course 6 - Lesson 12: 0 errors, 1 warnings
❌ Course 7: 1 errors, 0 warnings
⚠️ Course 7 - Lesson 1: 0 errors, 1 warnings
⚠️ Course 7 - Lesson 2: 0 errors, 1 warnings
⚠️ Course 7 - Lesson 3: 0 errors, 1 warnings
⚠️ Course 7 - Lesson 4: 0 errors, 1 warnings
⚠️ Course 7 - Lesson 5: 0 errors, 1 warnings
⚠️ Course 7 - Lesson 6: 0 errors, 1 warnings
⚠️ Course 7 - Lesson 7: 0 errors, 1 warnings
⚠️ Course 7 - Lesson 8: 0 errors, 1 warnings
⚠️ Course 7 - Lesson 9: 0 errors, 1 warnings
⚠️ Course 7 - Lesson 10: 0 errors, 1 warnings
⚠️ Course 7 - Lesson 11: 0 errors, 1 warnings
⚠️ Course 7 - Lesson 12: 0 errors, 1 warnings
❌ Database Integrity: 1 errors, 0 warnings

======================================================================

❌ Please fix errors before deploying to production.


```

</details>

---

## ❌ YouTube Video Verification

<details>
<summary>Full Output</summary>

```
🎥 YouTube Video Verification

============================================================

📊 Found 84 lessons to verify

📹 Verifying 1 unique video IDs...

============================================================

📊 Results:

✅ Valid: 84
❌ Invalid: 0


📋 Summary by Course:

✅ Course 1: Foundation: Business Fundamentals: 12/12 valid
✅ Course 2: Marketing Mastery: 12/12 valid
✅ Course 3: Financial Intelligence: 12/12 valid
✅ Course 4: Sales & Conversion: 12/12 valid
✅ Course 5: Operations & Systems: 12/12 valid
✅ Course 6: Leadership & Team Building: 12/12 valid
✅ Course 7: Growth & Scaling: 12/12 valid

✅ All videos are valid!


```

</details>

---

## Action Items

- [ ] Fix errors in: Production Readiness Check
- [ ] Fix errors in: Content Completeness Verification
- [ ] Fix errors in: YouTube Video Verification

## Next Steps

1. Fix all critical errors listed above
2. Re-run this report: `npm run report:production`
3. Complete testing checklist
4. Configure production environment
5. Deploy to production

---

*Report generated by SoloSuccess Intel Academy Production Readiness Tools*
