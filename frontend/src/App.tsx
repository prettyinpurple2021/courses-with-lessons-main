import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import Navigation from './components/layout/Navigation';
import SkipToContent from './components/common/SkipToContent';
import KeyboardShortcutsHelp from './components/common/KeyboardShortcutsHelp';
import AccessibilityChecker from './components/common/AccessibilityChecker';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingSpinner from './components/common/LoadingSpinner';
import PerformanceMonitor from './components/common/PerformanceMonitor';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import Chatbot from './components/ai/Chatbot';

// Eager load critical pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Lazy load non-critical pages with route-based code splitting
const ComponentShowcase = lazy(() => import('./pages/ComponentShowcase'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const AdminCoursesPage = lazy(() => import('./pages/AdminCoursesPage'));
const AdminCourseEditPage = lazy(() => import('./pages/AdminCourseEditPage'));
const AdminLessonsPage = lazy(() => import('./pages/AdminLessonsPage'));
const AdminLessonEditPage = lazy(() => import('./pages/AdminLessonEditPage'));
const AdminActivitiesPage = lazy(() => import('./pages/AdminActivitiesPage'));
const AdminActivityEditPage = lazy(() => import('./pages/AdminActivityEditPage'));
const AdminFinalProjectEditPage = lazy(() => import('./pages/AdminFinalProjectEditPage'));
const AdminFinalExamEditPage = lazy(() => import('./pages/AdminFinalExamEditPage'));
const AdminUsersPage = lazy(() => import('./pages/AdminUsersPage'));
const AdminUserDetailPage = lazy(() => import('./pages/AdminUserDetailPage'));
const CoursePage = lazy(() => import('./pages/CoursePage'));
const LessonPage = lazy(() => import('./pages/LessonPage'));
const FinalProjectPage = lazy(() => import('./pages/FinalProjectPage'));
const FinalExamPage = lazy(() => import('./pages/FinalExamPage'));
const CertificatePage = lazy(() => import('./pages/CertificatePage'));
const CertificateVerificationPage = lazy(() => import('./pages/CertificateVerificationPage'));
const ForumPage = lazy(() => import('./pages/ForumPage'));
const ThreadDetailPage = lazy(() => import('./pages/ThreadDetailPage'));
const CreateThreadPage = lazy(() => import('./pages/CreateThreadPage'));
const MemberDirectoryPage = lazy(() => import('./pages/MemberDirectoryPage'));
const MemberProfilePage = lazy(() => import('./pages/MemberProfilePage'));
const EventCalendarPage = lazy(() => import('./pages/EventCalendarPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsOfServicePage = lazy(() => import('./pages/TermsOfServicePage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes - data is considered fresh
      gcTime: 10 * 60 * 1000, // 10 minutes - garbage collection time (formerly cacheTime)
      refetchOnMount: false, // Don't refetch on component mount if data is fresh
      refetchOnReconnect: true, // Refetch when connection is restored
    },
    mutations: {
      retry: 1,
    },
  },
});

// Component to conditionally show navigation
function AppContent() {
  const location = useLocation();
  const hideNavOnPages = ['/'];
  const shouldShowNav = !hideNavOnPages.includes(location.pathname);

  return (
    <div className="min-h-screen bg-gradient-to-br from-girly-pink via-steel-grey to-glossy-black">
      <SkipToContent />
      {shouldShowNav && <Navigation />}
      <KeyboardShortcutsHelp />
      <AccessibilityChecker />
      <main id="main-content" tabIndex={-1}>
        <Suspense fallback={<LoadingSpinner fullScreen />}>
          <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/showcase" element={<ComponentShowcase />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
                <Route path="/terms" element={<TermsOfServicePage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/courses/:courseId"
                  element={
                    <ProtectedRoute>
                      <CoursePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/lessons/:lessonId"
                  element={
                    <ProtectedRoute>
                      <LessonPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/courses/:courseId/final-project"
                  element={
                    <ProtectedRoute>
                      <FinalProjectPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/courses/:courseId/final-exam"
                  element={
                    <ProtectedRoute>
                      <FinalExamPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/certificates/:id"
                  element={
                    <ProtectedRoute>
                      <CertificatePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/certificates/verify/:verificationCode"
                  element={<CertificateVerificationPage />}
                />
                <Route
                  path="/community"
                  element={
                    <ProtectedRoute>
                      <ForumPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/community/threads/new"
                  element={
                    <ProtectedRoute>
                      <CreateThreadPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/community/threads/:threadId"
                  element={
                    <ProtectedRoute>
                      <ThreadDetailPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/community/members"
                  element={
                    <ProtectedRoute>
                      <MemberDirectoryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/community/members/:memberId"
                  element={
                    <ProtectedRoute>
                      <MemberProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/community/events"
                  element={
                    <ProtectedRoute>
                      <EventCalendarPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  }
                />
                
                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route element={<AdminRoute />}>
                  <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                  <Route path="/admin/courses" element={<AdminCoursesPage />} />
                  <Route path="/admin/courses/:id" element={<AdminCourseEditPage />} />
                  <Route path="/admin/courses/:courseId/lessons" element={<AdminLessonsPage />} />
                  <Route path="/admin/courses/:courseId/lessons/:lessonId/edit" element={<AdminLessonEditPage />} />
                  <Route path="/admin/courses/:courseId/lessons/:lessonId/activities" element={<AdminActivitiesPage />} />
                  <Route path="/admin/courses/:courseId/lessons/:lessonId/activities/:activityId/edit" element={<AdminActivityEditPage />} />
                  <Route path="/admin/courses/:courseId/final-project/edit" element={<AdminFinalProjectEditPage />} />
                  <Route path="/admin/courses/:courseId/final-exam/edit" element={<AdminFinalExamEditPage />} />
                  <Route path="/admin/users" element={<AdminUsersPage />} />
                  <Route path="/admin/users/:userId" element={<AdminUserDetailPage />} />
                </Route>
              </Routes>
        </Suspense>
      </main>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <AuthProvider>
            <Router>
              <AppContent />
              <PerformanceMonitor />
              <Chatbot />
            </Router>
          </AuthProvider>
        </ToastProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
