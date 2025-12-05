import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../hooks/useAuth';
import GlassmorphicCard from '../components/common/GlassmorphicCard';
import GlassmorphicButton from '../components/common/GlassmorphicButton';
import CamoBackground from '../components/common/CamoBackground';
import FormInput from '../components/common/FormInput';
import { useToast } from '../contexts/ToastContext';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { loginSchema, LoginFormData } from '../utils/validationSchemas';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { success } = useToast();
  const { handleError } = useErrorHandler({ context: 'Login' });

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur', // Validate on blur for better UX
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
      success('Welcome back! Login successful.');
      navigate(from, { replace: true });
    } catch (error) {
      console.log('Login error caught:', error);
      handleError(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <CamoBackground variant="animated" opacity={0.3} />

      <GlassmorphicCard className="w-full max-w-md p-8 relative z-10" holographicBorder>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome Back
          </h1>
          <p className="text-white/70">
            Sign in to continue your training
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormInput
            type="email"
            label="Email"
            placeholder="your.email@example.com"
            error={errors.email}
            autoComplete="email"
            {...register('email')}
          />

          <FormInput
            type="password"
            label="Password"
            placeholder="Enter your password"
            error={errors.password}
            autoComplete="current-password"
            {...register('password')}
          />

          <div className="flex items-center justify-between text-sm">
            <Link
              to="/forgot-password"
              className="text-hot-pink hover:text-hot-pink/80 transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          <GlassmorphicButton
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            Sign In
          </GlassmorphicButton>
        </form>

        <div className="mt-6 text-center">
          <p className="text-white/70">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-hot-pink hover:text-hot-pink/80 transition-colors font-semibold"
            >
              Sign up
            </Link>
          </p>
        </div>
      </GlassmorphicCard>
    </div>
  );
};

export default LoginPage;
