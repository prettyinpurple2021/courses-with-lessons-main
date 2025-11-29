import { Link } from 'react-router-dom';
import GlassmorphicCard from '../common/GlassmorphicCard';
import ProgressiveImage from '../common/ProgressiveImage';

interface CourseCardProps {
  id: string;
  courseNumber: number;
  title: string;
  description: string;
  thumbnail?: string;
  duration: string;
  lessonsCount: number;
  isLocked?: boolean;
}

const CourseCard = ({
  id,
  courseNumber,
  title,
  description,
  thumbnail,
  duration,
  lessonsCount,
  isLocked = false,
}: CourseCardProps) => {
  const CardContent = (
    <GlassmorphicCard 
      variant="elevated" 
      holographicBorder={!isLocked}
      className="h-full transition-all duration-300 hover:scale-105 cursor-pointer group"
    >
      <div className="flex flex-col h-full">
        {/* Thumbnail */}
        <div className="relative w-full h-48 bg-gradient-to-br from-hot-pink to-success-teal rounded-t-lg overflow-hidden">
          {thumbnail ? (
            <ProgressiveImage
              src={thumbnail}
              alt={title}
              className="w-full h-full object-cover"
              placeholderClassName="w-full h-48"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl font-bold text-white opacity-80">
                  {courseNumber}
                </div>
                <div className="text-sm text-white opacity-60 mt-2">
                  Course {courseNumber}
                </div>
              </div>
            </div>
          )}
          
          {/* Lock Overlay */}
          {isLocked && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
              <svg 
                className="w-12 h-12 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-label="Locked course"
                role="img"
              >
                <title>Locked</title>
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                />
              </svg>
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="p-6 flex-1 flex flex-col">
          {/* Title */}
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-hot-pink transition-colors">
            {title}
          </h3>
          
          {/* Description */}
          <p className="text-gray-300 text-sm mb-4 flex-1 line-clamp-3">
            {description}
          </p>
          
          {/* Meta Info */}
          <div className="flex items-center justify-between text-sm text-gray-400 pt-4 border-t border-white border-opacity-10">
            <div className="flex items-center gap-1">
              <svg 
                className="w-4 h-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
                />
              </svg>
              <span>{lessonsCount} Lessons</span>
            </div>
            
            <div className="flex items-center gap-1">
              <svg 
                className="w-4 h-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
              <span>{duration}</span>
            </div>
          </div>
        </div>
      </div>
    </GlassmorphicCard>
  );

  if (isLocked) {
    return (
      <div 
        className="opacity-75" 
        role="article"
        aria-label={`${title} - Locked course`}
      >
        {CardContent}
      </div>
    );
  }

  return (
    <Link 
      to={`/courses/${id}`}
      aria-label={`View ${title} course details`}
    >
      {CardContent}
    </Link>
  );
};

export default CourseCard;
