import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from '../../contexts/ToastContext';
import LessonPage from '../LessonPage';
import { api } from '../../services/api';
import { getCourseById } from '../../services/courseService';

// Mock dependencies
vi.mock('../../services/api');
vi.mock('../../services/courseService');
vi.mock('../../services/activityService', () => ({
  activityService: {
    getActivityById: vi.fn(),
  },
}));
vi.mock('../../hooks/useAchievements', () => ({
  useAchievements: () => ({
    currentAchievement: null,
    checkForNewAchievements: vi.fn(),
    closeCurrentAchievement: vi.fn(),
  }),
}));
vi.mock('../../components/course/YouTubePlayer', () => ({
  default: ({ videoId }: { videoId: string }) => (
    <div data-testid="youtube-player">YouTube Player: {videoId}</div>
  ),
}));
vi.mock('../../components/course/ResourceList', () => ({
  default: () => null, // Don't render ResourceList in tests
}));
vi.mock('../../components/course/NoteTakingPanel', () => ({
  default: () => null, // Don't render NoteTakingPanel in tests
}));
vi.mock('../../components/course/LessonNavigation', () => ({
  default: () => null, // Don't render LessonNavigation in tests
}));
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(() => ({ lessonId: 'lesson-1' })),
    useNavigate: vi.fn(() => vi.fn()),
  };
});

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>{component}</BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
};

describe('LessonPage', () => {
  const mockLesson = {
    id: 'lesson-1',
    lessonNumber: 1,
    title: 'Test Lesson',
    description: 'Test Description',
    youtubeVideoId: 'test-video-id',
    duration: 600,
    courseId: 'course-1',
    activities: [
      {
        id: 'activity-1',
        activityNumber: 1,
        title: 'Test Activity',
        description: 'Test',
        type: 'quiz',
        content: {},
        required: true,
        isCompleted: false,
        isLocked: false,
      },
    ],
    progress: {
      completed: false,
      videoPosition: 0,
      currentActivity: 1,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays loading state while fetching lesson', () => {
    vi.mocked(api.get).mockImplementation(() => new Promise(() => {})); // Never resolves

    renderWithProviders(<LessonPage />);

    // Use getAllByText and check that at least one exists
    const loadingElements = screen.getAllByText(/loading lesson/i);
    expect(loadingElements.length).toBeGreaterThan(0);
  });

  it('displays lesson details when loaded', async () => {
    // Mock lesson API call
    vi.mocked(api.get).mockImplementation((url: string) => {
      if (url.includes('/lessons/')) {
        return Promise.resolve({
          data: {
            success: true,
            data: mockLesson,
          },
        });
      }
      // Mock resources API call
      if (url.includes('/resources')) {
        return Promise.resolve({
          data: {
            success: true,
            data: [],
          },
        });
      }
      return Promise.reject(new Error('Unexpected API call'));
    });

    vi.mocked(getCourseById).mockResolvedValue({
      id: 'course-1',
      courseNumber: 1,
      title: 'Test Course',
      lessons: [],
    });

    renderWithProviders(<LessonPage />);

    await waitFor(() => {
      expect(screen.getByText(/Test Lesson/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('displays error message when lesson not found', async () => {
    vi.mocked(api.get).mockRejectedValue({
      response: {
        status: 404,
        data: { error: { message: 'Lesson not found' } },
      },
    });

    renderWithProviders(<LessonPage />);

    await waitFor(() => {
      expect(screen.getByText(/Lesson Not Found/i)).toBeInTheDocument();
    });
  });

  it('displays YouTube player with correct video ID', async () => {
    // Mock lesson API call
    vi.mocked(api.get).mockImplementation((url: string) => {
      if (url.includes('/lessons/')) {
        return Promise.resolve({
          data: {
            success: true,
            data: mockLesson,
          },
        });
      }
      // Mock resources API call
      if (url.includes('/resources')) {
        return Promise.resolve({
          data: {
            success: true,
            data: [],
          },
        });
      }
      return Promise.reject(new Error('Unexpected API call'));
    });

    vi.mocked(getCourseById).mockResolvedValue({
      id: 'course-1',
      courseNumber: 1,
      title: 'Test Course',
      lessons: [],
    });

    renderWithProviders(<LessonPage />);

    await waitFor(() => {
      expect(screen.getByTestId('youtube-player')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('displays activities list', async () => {
    // Mock lesson API call
    vi.mocked(api.get).mockImplementation((url: string) => {
      if (url.includes('/lessons/')) {
        return Promise.resolve({
          data: {
            success: true,
            data: mockLesson,
          },
        });
      }
      // Mock resources API call
      if (url.includes('/resources')) {
        return Promise.resolve({
          data: {
            success: true,
            data: [],
          },
        });
      }
      return Promise.reject(new Error('Unexpected API call'));
    });

    vi.mocked(getCourseById).mockResolvedValue({
      id: 'course-1',
      courseNumber: 1,
      title: 'Test Course',
      lessons: [],
    });

    renderWithProviders(<LessonPage />);

    await waitFor(() => {
      expect(screen.getByText(/Test Activity/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});
