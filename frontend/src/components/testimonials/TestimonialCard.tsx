import GlassmorphicCard from '../common/GlassmorphicCard';

interface TestimonialCardProps {
  name: string;
  role: string;
  avatar?: string;
  quote: string;
  achievement: string;
  rating?: number;
}

const TestimonialCard = ({
  name,
  role,
  avatar,
  quote,
  achievement,
  rating = 5,
}: TestimonialCardProps) => {
  return (
    <GlassmorphicCard variant="default" className="h-full camo-overlay">
      <div className="p-6 sm:p-8 flex flex-col h-full">
        {/* Rating Stars */}
        <div className="flex gap-1 mb-4">
          {[...Array(5)].map((_, index) => (
            <svg
              key={index}
              className={`w-5 h-5 ${
                index < rating ? 'text-hot-pink' : 'text-gray-500'
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        
        {/* Quote */}
        <blockquote className="flex-1 mb-6">
          <p className="text-white text-base sm:text-lg leading-relaxed italic">
            "{quote}"
          </p>
        </blockquote>
        
        {/* Achievement Badge */}
        <div className="mb-6 p-3 bg-gradient-to-r from-hot-pink to-success-teal bg-opacity-20 rounded-lg border border-hot-pink border-opacity-30">
          <div className="flex items-center gap-2">
            <svg 
              className="w-5 h-5 text-hot-pink flex-shrink-0" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" 
              />
            </svg>
            <span className="text-white text-sm font-semibold">
              {achievement}
            </span>
          </div>
        </div>
        
        {/* Author Info */}
        <div className="flex items-center gap-4 pt-4 border-t border-white border-opacity-10">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-hot-pink to-success-teal flex-shrink-0">
            {avatar ? (
              <img 
                src={avatar} 
                alt={name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                {name.charAt(0)}
              </div>
            )}
          </div>
          
          {/* Name and Role */}
          <div>
            <div className="text-white font-semibold">
              {name}
            </div>
            <div className="text-gray-400 text-sm">
              {role}
            </div>
          </div>
        </div>
      </div>
    </GlassmorphicCard>
  );
};

export default TestimonialCard;
