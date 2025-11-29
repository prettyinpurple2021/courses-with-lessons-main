import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/authService';
import GlassmorphicCard from '../components/common/GlassmorphicCard';
import GlassmorphicInput from '../components/common/GlassmorphicInput';
import GlassmorphicButton from '../components/common/GlassmorphicButton';
import CamoBackground from '../components/common/CamoBackground';
import { useToast } from '../contexts/ToastContext';

interface FormErrors {
  password?: string;
  confirmPassword?: string;
}

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { showToast } = useToast();

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one lowercase letter';
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      showToast('Invalid reset link. Please request a new one.', 'error');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await authService.resetPassword(token, formData.password);
      showToast('Password reset successful! You can now log in.', 'success');
      navigate('/login', { replace: true });
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'Password reset failed. Please try again.';
      showToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <CamoBackground variant="animated" opacity={0.3} />

        <GlassmorphicCard className="w-full max-w-md p-8 relative z-10 text-center" holographicBorder>
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Invalid Reset Link
            </h1>
            <p className="text-white/70">
              This password reset link is invalid or has expired.
            </p>
          </div>

          <Link to="/forgot-password">
            <GlassmorphicButton variant="primary" size="md" className="w-full">
              Request New Link
            </GlassmorphicButton>
          </Link>
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
            Reset Password
          </h1>
          <p className="text-white/70">
            Enter your new password below
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <GlassmorphicInput
            type="password"
            name="password"
            label="New Password"
            placeholder="Create a strong password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            autoComplete="new-password"
            helperText="Min 8 characters, 1 uppercase, 1 lowercase, 1 number"
          />

          <GlassmorphicInput
            type="password"
            name="confirmPassword"
            label="Confirm Password"
            placeholder="Re-enter your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            autoComplete="new-password"
          />

          <GlassmorphicButton
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            loading={isLoading}
            disabled={isLoading}
          >
            Reset Password
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

export default ResetPasswordPage;
