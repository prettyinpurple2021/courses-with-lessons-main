import { Component, ErrorInfo, ReactNode } from 'react';
import { logError } from '../../utils/errorHandler';
import { ErrorType } from '../../types/error';
import GlassmorphicCard from './GlassmorphicCard';
import GlassmorphicButton from './GlassmorphicButton';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error
    logError(
      {
        type: ErrorType.UNKNOWN_ERROR,
        message: error.message,
        timestamp: new Date(),
        details: { error, errorInfo },
      },
      'React Error Boundary'
    );

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI with glassmorphic styling
      return (
        <div className="min-h-screen flex items-center justify-center p-4 camo-background">
          <GlassmorphicCard className="max-w-lg w-full p-8 text-center">
            <div className="mb-6">
              <svg
                className="w-20 h-20 mx-auto text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-white mb-4">
              Oops! Something went wrong
            </h1>

            <p className="text-white/80 mb-6">
              We encountered an unexpected error. Don't worry, our team has been notified.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <div className="mb-6 p-4 bg-black/30 rounded-lg text-left">
                <p className="text-red-400 text-sm font-mono break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <GlassmorphicButton
                onClick={this.handleReset}
                variant="primary"
              >
                Try Again
              </GlassmorphicButton>

              <GlassmorphicButton
                onClick={() => (window.location.href = '/')}
                variant="secondary"
              >
                Go Home
              </GlassmorphicButton>
            </div>
          </GlassmorphicCard>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
