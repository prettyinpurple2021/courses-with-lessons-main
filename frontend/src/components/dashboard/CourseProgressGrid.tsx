import { useQuery } from '@tanstack/react-query';
import { getAllCourses } from '../../services/courseService';
import CourseProgressCard from './CourseProgressCard';
import CourseProgressCardSkeleton from './CourseProgressCardSkeleton';

export default function CourseProgressGrid() {
  const {
    data: courses,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['courses'],
    queryFn: getAllCourses,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }, (_, index) => (
          <CourseProgressCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="glassmorphic rounded-lg p-8 text-center">
        <p className="text-white/70">Failed to load courses. Please try again later.</p>
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="glassmorphic rounded-lg p-8 text-center">
        <p className="text-white/70">No courses available yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <CourseProgressCard key={course.id} course={course} />
      ))}
    </div>
  );
}
