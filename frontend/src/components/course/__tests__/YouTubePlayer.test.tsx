import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import YouTubePlayer from '../YouTubePlayer';

// Mock YouTube IFrame API
const mockPlayer = {
  playVideo: vi.fn(),
  pauseVideo: vi.fn(),
  seekTo: vi.fn(),
  getCurrentTime: vi.fn(() => 0),
  getDuration: vi.fn(() => 100),
  getVolume: vi.fn(() => 100),
  setVolume: vi.fn(),
  getPlaybackRate: vi.fn(() => 1),
  setPlaybackRate: vi.fn(),
  getPlayerState: vi.fn(() => -1), // UNSTARTED
  destroy: vi.fn(),
};

describe('YouTubePlayer', () => {
  beforeEach(() => {
    // Setup YouTube API mock
    global.window.YT = {
      Player: vi.fn(() => mockPlayer) as any,
      PlayerState: {
        UNSTARTED: -1,
        ENDED: 0,
        PLAYING: 1,
        PAUSED: 2,
        BUFFERING: 3,
        CUED: 5,
      },
    } as any;

    global.window.onYouTubeIframeAPIReady = undefined;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders video player container', () => {
    render(<YouTubePlayer videoId="test-video-id" />);
    const container = document.querySelector('[class*="glassmorphic"]');
    expect(container).toBeInTheDocument();
  });

  it('initializes YouTube player with correct video ID', async () => {
    render(<YouTubePlayer videoId="test-video-id" />);
    
    await waitFor(() => {
      expect(global.window.YT.Player).toHaveBeenCalled();
    });
  });

  it('calls onProgress callback when video is playing', async () => {
    const onProgress = vi.fn();
    render(<YouTubePlayer videoId="test-video-id" onProgress={onProgress} />);

    await waitFor(() => {
      // Simulate player ready
      const playerInstance = (global.window.YT.Player as any).mock.results[0].value;
      if (playerInstance) {
        // Trigger state change to PLAYING
        const onStateChange = (global.window.YT.Player as any).mock.calls[0][1].events.onStateChange;
        onStateChange({ data: 1 }); // PLAYING state
      }
    });

    // Wait for progress tracking interval
    await waitFor(() => {
      expect(mockPlayer.getCurrentTime).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  it('calls onComplete callback when video ends', async () => {
    const onComplete = vi.fn();
    render(<YouTubePlayer videoId="test-video-id" onComplete={onComplete} />);

    await waitFor(() => {
      const playerInstance = (global.window.YT.Player as any).mock.results[0].value;
      if (playerInstance) {
        const onStateChange = (global.window.YT.Player as any).mock.calls[0][1].events.onStateChange;
        onStateChange({ data: 0 }); // ENDED state
      }
    });

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled();
    });
  });

  it('seeks to startTime when provided', async () => {
    render(<YouTubePlayer videoId="test-video-id" startTime={30} />);

    await waitFor(() => {
      const playerInstance = (global.window.YT.Player as any).mock.results[0].value;
      if (playerInstance) {
        const onReady = (global.window.YT.Player as any).mock.calls[0][1].events.onReady;
        onReady();
      }
    });

    await waitFor(() => {
      expect(mockPlayer.seekTo).toHaveBeenCalledWith(30, true);
    });
  });

  it('displays error message when video fails to load', async () => {
    const mockErrorPlayer = {
      ...mockPlayer,
    };

    (global.window.YT.Player as any) = vi.fn(() => {
      const onError = (global.window.YT.Player as any).mock.calls[0][1].events.onError;
      setTimeout(() => onError({ data: 100 }), 0); // Video not found error
      return mockErrorPlayer;
    });

    render(<YouTubePlayer videoId="invalid-video-id" />);

    await waitFor(() => {
      expect(screen.getByText(/Video not found or private/i)).toBeInTheDocument();
    });
  });

  it('cleans up player on unmount', async () => {
    const { unmount } = render(<YouTubePlayer videoId="test-video-id" />);

    await waitFor(() => {
      expect(global.window.YT.Player).toHaveBeenCalled();
    });

    unmount();

    await waitFor(() => {
      expect(mockPlayer.destroy).toHaveBeenCalled();
    });
  });
});

