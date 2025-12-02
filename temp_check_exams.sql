SELECT
  c.title,
  fe.title as exam_title,
  COUNT(eq.id) as question_count
FROM Course c
LEFT JOIN FinalExam fe ON c.id = fe.courseId
LEFT JOIN ExamQuestion eq ON fe.id = eq.examId
GROUP BY c.id, c.title, fe.title
ORDER BY c.courseNumber;
