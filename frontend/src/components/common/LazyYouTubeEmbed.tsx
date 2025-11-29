import React, { useState, useRef, useEffect } from 'react';

interface LazyYouTubeEmbedProps {
  videoId: string;
  title: string;
  className?: string;
  onReady?: () => void;
}

/**
 * Lazy-loaded YouTube embed that only loads the iframe when clicked
 * This significantly improves initial page load performance
 */
const LazyYouTubeEmbed: React.FC<LazyYouTubeEmbedProps> = ({
  videoId,
  title,
  className = '',
  onReady,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Use Intersection Observer to detect when video enters viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '100px', // Start loading 100px before entering viewport
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleClick = () => {
    setIsLoaded(true);
    onReady?.();
  };

  // YouTube thumbnail URL (high quality)
  const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <div
      ref={containerRef}
      className={`relative w-full aspect-video ${className}`}
      onClick={handleClick}
    >
      {!isLoaded ? (
        <>
          {/* Thumbnail with play button overlay */}
          {isInView && (
            <>
              <img
                src={thumbnailUrl}
                alt={`${title} thumbnail`}
                className="absolute inset-0 w-full h-full object-cover rounded-lg"
                loading="lazy"
              />
              
              {/* Play button overlay */}
              <button
                className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors cursor-pointer group"
                aria-label={`Play ${title}`}
                type="button"
              >
                <div className="w-20 h-20 bg-hot-pink rounded-full flex items-center justify-center group-hover:scale-110 transition-transform holographic-border">
                  <svg
                    className="w-10 h-10 text-white ml-1"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </button>
              
              {/* Loading hint */}
              <div className="absolute bottom-4 left-4 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
                Click to load video
              </div>
            </>
          )}
        </>
      ) : (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full rounded-lg"
        />
      )}
    </div>
  );
};

export default LazyYouTubeEmbed;
