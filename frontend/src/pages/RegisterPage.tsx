import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../hooks/useAuth';
import GlassmorphicCard from '../components/common/GlassmorphicCard';
import GlassmorphicButton from '../components/common/GlassmorphicButton';
import CamoBackground from '../components/common/CamoBackground';
import FormInput from '../components/common/FormInput';
import { useToast } from '../contexts/ToastContext';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { registerSchema, RegisterFormData } from '../utils/validationSchemas';

const RegisterPage: React.FC = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const { success } = useToast();
  const { handleError } = useErrorHandler({ context: 'Registration' });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      // Remove confirmPassword before sending to API
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...registrationData } = data;
      await registerUser(registrationData);
      success('Registration successful! Welcome to SoloSuccess Intel Academy.');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      handleError(error, 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <CamoBackground variant="animated" opacity={0.3} />

      <GlassmorphicCard className="w-full max-w-md p-8 relative z-10" holographicBorder>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Join the Academy
          </h1>
          <p className="text-white/70">
            Start your bootcamp training today
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              type="text"
              label="First Name"
              placeholder="Jane"
              error={errors.firstName}
              autoComplete="given-name"
              {...register('firstName')}
            />

            <FormInput
              type="text"
              label="Last Name"
              placeholder="Doe"
              error={errors.lastName}
              autoComplete="family-name"
              {...register('lastName')}
            />
          </div>

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
            placeholder="Create a strong password"
            error={errors.password}
            autoComplete="new-password"
            helperText="Min 8 characters, 1 uppercase, 1 lowercase, 1 number"
            {...register('password')}
          />

          <FormInput
            type="password"
            label="Confirm Password"
            placeholder="Re-enter your password"
            error={errors.confirmPassword}
            autoComplete="new-password"
            {...register('confirmPassword')}
          />

          <GlassmorphicButton
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            Create Account
          </GlassmorphicButton>
        </form>

        <div className="mt-6 text-center">
          <p className="text-white/70">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-hot-pink hover:text-hot-pink/80 transition-colors font-semibold"
            >
              Sign in
            </Link>
          </p>
        </div>
      </GlassmorphicCard>
    </div>
  );
};

export default RegisterPage;
