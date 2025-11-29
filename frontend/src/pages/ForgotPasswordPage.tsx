import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';
import GlassmorphicCard from '../components/common/GlassmorphicCard';
import GlassmorphicInput from '../components/common/GlassmorphicInput';
import GlassmorphicButton from '../components/common/GlassmorphicButton';
import CamoBackground from '../components/common/CamoBackground';
import { useToast } from '../contexts/ToastContext';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { showToast } = useToast();

  const validateEmail = (): boolean => {
    if (!email) {
      setError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email is invalid');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail()) {
      return;
    }

    setIsLoading(true);

    try {
      const message = await authService.forgotPassword(email);
      setIsSubmitted(true);
      showToast(message, 'success');
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'Failed to send reset email. Please try again.';
      showToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <CamoBackground variant="animated" opacity={0.3} />

        <GlassmorphicCard className="w-full max-w-md p-8 relative z-10 text-center" holographicBorder>
          <div className="mb-6">
            <div className="w-16 h-16 bg-success-teal/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-success-teal"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Check Your Email
            </h1>
            <p className="text-white/70">
              If an account exists with <span className="text-hot-pink">{email}</span>, you will receive a password reset link shortly.
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-white/60">
              Didn't receive the email? Check your spam folder or try again.
            </p>
            <Link to="/login">
              <GlassmorphicButton variant="secondary" size="md" className="w-full">
                Back to Login
              </GlassmorphicButton>
            </Link>
          </div>
        </GlassmorphicCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <CamoBackground variant="animated" opacity={0.3} />

      <GlassmorphicCard className="w-full max-w-md p-8 relative z-10" holographicBorder>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Forgot Password?
          </h1>
          <p className="text-white/70">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <GlassmorphicInput
            type="email"
            label="Email"
            placeholder="your.email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error}
            autoComplete="email"
          />

          <GlassmorphicButton
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            loading={isLoading}
            disabled={isLoading}
          >
            Send Reset Link
          </GlassmorphicButton>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-hot-pink hover:text-hot-pink/80 transition-colors text-sm"
          >
            ← Back to Login
          </Link>
        </div>
      </GlassmorphicCard>
    </div>
  );
};

export default ForgotPasswordPage;
