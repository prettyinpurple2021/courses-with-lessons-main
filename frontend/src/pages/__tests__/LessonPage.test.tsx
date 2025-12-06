import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
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
      <BrowserRouter>{component}</BrowserRouter>
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

    expect(screen.getByText(/loading lesson/i)).toBeInTheDocument();
  });

  it('displays lesson details when loaded', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: {
        success: true,
        data: mockLesson,
      },
    });

    vi.mocked(getCourseById).mockResolvedValue({
      id: 'course-1',
      courseNumber: 1,
      title: 'Test Course',
      lessons: [],
    });

    // Mock useParams
    vi.mock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom');
      return {
        ...actual,
        useParams: () => ({ lessonId: 'lesson-1' }),
      };
    });

    renderWithProviders(<LessonPage />);

    await waitFor(() => {
      expect(screen.getByText(/Test Lesson/i)).toBeInTheDocument();
    });
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
    vi.mocked(api.get).mockResolvedValue({
      data: {
        success: true,
        data: mockLesson,
      },
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
    });
  });

  it('displays activities list', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: {
        success: true,
        data: mockLesson,
      },
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
    });
  });
});

