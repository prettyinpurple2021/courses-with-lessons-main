import { useEffect, useRef, useState, useCallback } from 'react';

interface YouTubePlayerProps {
  videoId: string;
  startTime?: number;
  onProgress?: (currentTime: number) => void;
  onComplete?: () => void;
  className?: string;
}

// YouTube Player State enum
enum PlayerState {
  UNSTARTED = -1,
  ENDED = 0,
  PLAYING = 1,
  PAUSED = 2,
  BUFFERING = 3,
  CUED = 5,
}

// Declare YouTube IFrame API types
declare global {
  interface Window {
    YT: {
      Player: new (elementId: string | HTMLElement, config: any) => YTPlayer;
      PlayerState: typeof PlayerState;
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getCurrentTime(): number;
  getDuration(): number;
  getVolume(): number;
  setVolume(volume: number): void;
  getPlaybackRate(): number;
  setPlaybackRate(rate: number): void;
  getPlayerState(): number;
  destroy(): void;
}

export default function YouTubePlayer({
  videoId,
  startTime = 0,
  onProgress,
  onComplete,
  className = '',
}: YouTubePlayerProps) {
  const playerRef = useRef<YTPlayer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Custom controls state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [showControls, setShowControls] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  
  const playbackSpeeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  useEffect(() => {
    // Load YouTube IFrame API
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        initializePlayer();
      };
    } else {
      initializePlayer();
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [videoId]);

  const initializePlayer = () => {
    if (!containerRef.current) return;

    try {
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          controls: 0, // Hide default controls, we'll use custom ones
          modestbranding: 1,
          rel: 0,
          start: Math.floor(startTime),
          fs: 1, // Enable fullscreen button
          iv_load_policy: 3, // Hide video annotations
        },
        events: {
          onReady: handlePlayerReady,
          onStateChange: handleStateChange,
          onError: handleError,
        },
      });
    } catch (err) {
      setError('Failed to load video player');
      if (import.meta.env.DEV) {
        console.error('YouTube Player Error:', err);
      }
    }
  };

  const handlePlayerReady = () => {
    setIsReady(true);
    if (playerRef.current) {
      const videoDuration = playerRef.current.getDuration();
      setDuration(videoDuration);
      setVolume(playerRef.current.getVolume());
      
      if (startTime > 0) {
        playerRef.current.seekTo(startTime, true);
        setCurrentTime(startTime);
      }
    }
  };

  const handleStateChange = (event: any) => {
    const state = event.data;

    // Update playing state
    setIsPlaying(state === PlayerState.PLAYING);

    // YT.PlayerState.PLAYING = 1
    if (state === PlayerState.PLAYING) {
      startProgressTracking();
    }
    // YT.PlayerState.PAUSED = 2 or YT.PlayerState.ENDED = 0
    else if (state === PlayerState.PAUSED || state === PlayerState.ENDED) {
      stopProgressTracking();
    }

    // YT.PlayerState.ENDED = 0
    if (state === PlayerState.ENDED && onComplete) {
      onComplete();
    }
  };

  const handleError = (event: any) => {
    const errorCode = event.data;
    let errorMessage = 'Failed to load video';

    switch (errorCode) {
      case 2:
        errorMessage = 'Invalid video ID';
        break;
      case 5:
        errorMessage = 'HTML5 player error';
        break;
      case 100:
        errorMessage = 'Video not found or private';
        break;
      case 101:
      case 150:
        errorMessage = 'Video cannot be embedded';
        break;
    }

    setError(errorMessage);
    if (import.meta.env.DEV) {
      console.error('YouTube Player Error:', errorCode, errorMessage);
    }
  };

  const startProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    progressIntervalRef.current = setInterval(() => {
      if (playerRef.current) {
        const time = playerRef.current.getCurrentTime();
        setCurrentTime(time);
        if (onProgress) {
          onProgress(time);
        }
      }
    }, 2000); // Update every 2 seconds
  };

  const stopProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    // Save final position when paused
    if (playerRef.current) {
      const time = playerRef.current.getCurrentTime();
      setCurrentTime(time);
      if (onProgress) {
        onProgress(time);
      }
    }
  };

  // Custom control handlers
  const togglePlayPause = useCallback(() => {
    if (!playerRef.current) return;
    
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  }, [isPlaying]);

  const handleSeek = useCallback((newTime: number) => {
    if (!playerRef.current) return;
    playerRef.current.seekTo(newTime, true);
    setCurrentTime(newTime);
  }, []);

  const handleVolumeChange = useCallback((newVolume: number) => {
    if (!playerRef.current) return;
    playerRef.current.setVolume(newVolume);
    setVolume(newVolume);
  }, []);

  const handlePlaybackSpeedChange = useCallback((speed: number) => {
    if (!playerRef.current) return;
    playerRef.current.setPlaybackRate(speed);
    setPlaybackSpeed(speed);
    setShowSpeedMenu(false);
  }, []);

  const skipForward = useCallback(() => {
    if (!playerRef.current) return;
    const newTime = Math.min(currentTime + 10, duration);
    handleSeek(newTime);
  }, [currentTime, duration, handleSeek]);

  const skipBackward = useCallback(() => {
    if (!playerRef.current) return;
    const newTime = Math.max(currentTime - 10, 0);
    handleSeek(newTime);
  }, [currentTime, handleSeek]);

  const toggleFullscreen = useCallback(() => {
    if (!playerContainerRef.current) return;

    if (!isFullscreen) {
      if (playerContainerRef.current.requestFullscreen) {
        playerContainerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, [isFullscreen]);

  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  }, [isPlaying]);

  // Format time helper
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Show controls when not playing
  useEffect(() => {
    if (!isPlaying) {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    }
  }, [isPlaying]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'arrowleft':
          e.preventDefault();
          skipBackward();
          break;
        case 'arrowright':
          e.preventDefault();
          skipForward();
          break;
        case 'arrowup':
          e.preventDefault();
          handleVolumeChange(Math.min(volume + 10, 100));
          break;
        case 'arrowdown':
          e.preventDefault();
          handleVolumeChange(Math.max(volume - 10, 0));
          break;
        case 'm':
          e.preventDefault();
          handleVolumeChange(volume > 0 ? 0 : 100);
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9': {
          e.preventDefault();
          const percent = parseInt(e.key) * 10;
          handleSeek((duration * percent) / 100);
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [
    togglePlayPause,
    skipBackward,
    skipForward,
    handleVolumeChange,
    toggleFullscreen,
    handleSeek,
    volume,
    duration,
  ]);

  if (error) {
    return (
      <div className={`glassmorphic p-8 text-center ${className}`}>
        <div className="text-red-400 mb-4">
          <svg
            className="w-16 h-16 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-lg font-semibold">{error}</p>
        </div>
        <p className="text-gray-400 text-sm">
          Please contact support if this problem persists.
        </p>
      </div>
    );
  }

  return (
    <div 
      ref={playerContainerRef}
      className={`relative ${className}`}
      onMouseMove={showControlsTemporarily}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <div className="glassmorphic overflow-hidden rounded-lg">
        <div className="relative pt-[56.25%]">
          {/* 16:9 aspect ratio */}
          <div ref={containerRef} className="absolute top-0 left-0 w-full h-full" />
          
          {/* Custom Glassmorphic Controls Overlay */}
          {isReady && (
            <div
              className={`absolute inset-0 flex flex-col justify-end transition-opacity duration-300 ${
                showControls ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {/* Gradient overlay for better control visibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
              
              {/* Controls Container */}
              <div className="relative z-10 p-4 space-y-3">
                {/* Progress Bar */}
                <div className="group">
                  <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    value={currentTime}
                    onChange={(e) => handleSeek(Number(e.target.value))}
                    className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
                      [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-hot-pink 
                      [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:holographic
                      [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full 
                      [&::-moz-range-thumb]:bg-hot-pink [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer
                      hover:h-2 transition-all"
                    style={{
                      background: `linear-gradient(to right, #FF1493 0%, #FF1493 ${(currentTime / duration) * 100}%, rgba(255,255,255,0.2) ${(currentTime / duration) * 100}%, rgba(255,255,255,0.2) 100%)`
                    }}
                  />
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Play/Pause Button */}
                    <button
                      onClick={togglePlayPause}
                      className="glassmorphic p-2 rounded-full hover:bg-white/20 transition-all holographic-border"
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? (
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </button>

                    {/* Time Display */}
                    <div className="text-white text-sm font-medium">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Skip Backward Button */}
                    <button
                      onClick={skipBackward}
                      className="glassmorphic p-2 rounded-full hover:bg-white/20 transition-all"
                      aria-label="Skip backward 10 seconds"
                      title="← or J"
                    >
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.99 5V1l-5 5 5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6h-2c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8zm-1.1 11h-.85v-3.26l-1.01.31v-.69l1.77-.63h.09V16zm4.28-1.76c0 .32-.03.6-.1.82s-.17.42-.29.57-.28.26-.45.33-.37.1-.59.1-.41-.03-.59-.1-.33-.18-.46-.33-.23-.34-.3-.57-.11-.5-.11-.82v-.74c0-.32.03-.6.1-.82s.17-.42.29-.57.28-.26.45-.33.37-.1.59-.1.41.03.59.1.33.18.46.33.23.34.3.57.11.5.11.82v.74zm-.85-.86c0-.19-.01-.35-.04-.48s-.07-.23-.12-.31-.11-.14-.19-.17-.16-.05-.25-.05-.18.02-.25.05-.14.09-.19.17-.09.18-.12.31-.04.29-.04.48v.97c0 .19.01.35.04.48s.07.24.12.32.11.14.19.17.16.05.25.05.18-.02.25-.05.14-.09.19-.17.09-.19.11-.32.04-.29.04-.48v-.97z" />
                      </svg>
                    </button>

                    {/* Skip Forward Button */}
                    <button
                      onClick={skipForward}
                      className="glassmorphic p-2 rounded-full hover:bg-white/20 transition-all"
                      aria-label="Skip forward 10 seconds"
                      title="→ or L"
                    >
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M15.95 10.78c.03-.25.05-.51.05-.78s-.02-.53-.06-.78l1.69-1.32c.15-.12.19-.34.1-.51l-1.6-2.77c-.1-.18-.31-.24-.49-.18l-1.99.8c-.42-.32-.86-.58-1.35-.78L12 2.34c-.03-.2-.2-.34-.4-.34H8.4c-.2 0-.36.14-.39.34l-.3 2.12c-.49.2-.94.47-1.35.78l-1.99-.8c-.18-.07-.39 0-.49.18l-1.6 2.77c-.1.18-.06.39.1.51l1.69 1.32c-.04.25-.07.52-.07.78s.02.53.06.78L2.37 12.1c-.15.12-.19.34-.1.51l1.6 2.77c.1.18.31.24.49.18l1.99-.8c.42.32.86.58 1.35.78l.3 2.12c.04.2.2.34.4.34h3.2c.2 0 .37-.14.39-.34l.3-2.12c.49-.2.94-.47 1.35-.78l1.99.8c.18.07.39 0 .49-.18l1.6-2.77c.1-.18.06-.39-.1-.51l-1.67-1.32zM10 13c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3zm8-2h3v2h-3v3h-2v-3h-3v-2h3V8h2v3z" />
                      </svg>
                    </button>

                    {/* Playback Speed Control */}
                    <div className="relative">
                      <button
                        onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                        className="glassmorphic px-3 py-2 rounded-full hover:bg-white/20 transition-all text-white text-sm font-medium"
                        aria-label="Playback speed"
                      >
                        {playbackSpeed}x
                      </button>
                      {showSpeedMenu && (
                        <div className="absolute bottom-full mb-2 right-0 glassmorphic rounded-lg overflow-hidden min-w-[80px]">
                          {playbackSpeeds.map((speed) => (
                            <button
                              key={speed}
                              onClick={() => handlePlaybackSpeedChange(speed)}
                              className={`w-full px-4 py-2 text-sm text-white hover:bg-white/20 transition-all ${
                                speed === playbackSpeed ? 'bg-hot-pink/30 font-bold' : ''
                              }`}
                            >
                              {speed}x
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Volume Control */}
                    <div className="flex items-center gap-2 group">
                      <button
                        onClick={() => handleVolumeChange(volume > 0 ? 0 : 100)}
                        className="glassmorphic p-2 rounded-full hover:bg-white/20 transition-all"
                        aria-label={volume > 0 ? 'Mute' : 'Unmute'}
                        title="M"
                      >
                        {volume > 0 ? (
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                          </svg>
                        )}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={(e) => handleVolumeChange(Number(e.target.value))}
                        className="w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity
                          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 
                          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white 
                          [&::-webkit-slider-thumb]:cursor-pointer
                          [&::-moz-range-thumb]:w-2 [&::-moz-range-thumb]:h-2 [&::-moz-range-thumb]:rounded-full 
                          [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                      />
                    </div>

                    {/* Fullscreen Button */}
                    <button
                      onClick={toggleFullscreen}
                      className="glassmorphic p-2 rounded-full hover:bg-white/20 transition-all"
                      aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                      title="F"
                    >
                      {isFullscreen ? (
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
          <div className="holographic-spinner w-12 h-12"></div>
        </div>
      )}
    </div>
  );
}
