import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../hooks/useToast';
import { adminService } from '../services/adminService';
import { setAccessToken } from '../services/api';
import GlassmorphicCard from '../components/common/GlassmorphicCard';
import GlassmorphicButton from '../components/common/GlassmorphicButton';

const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    
    console.log('Form submitted', { email, password: '***' });
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setIsLoading(true);

    try {
      console.log('Calling admin service login...');
      // Use admin service which handles API URL correctly
      const result = await adminService.login(email, password);
      console.log('Login successful', result);

      // Store token and user data
      setAccessToken(result.accessToken);
      localStorage.setItem('accessToken', result.accessToken);
      localStorage.setItem('user', JSON.stringify(result.user));

      // Update auth context directly with admin user data
      // Don't call regular login() as it would overwrite the admin token
      setUser(result.user);

      toast.success('Admin login successful');
      setRateLimitError(null); // Clear rate limit error on success
      // Use push to allow back button navigation
      navigate('/admin/dashboard', { replace: false });
    } catch (error: any) {
      console.error('Admin login error:', error);
      
      // Handle different error types
      let errorMessage = 'Admin login failed';
      
      if (error.response) {
        // HTTP error response
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 429) {
          // Extract retry-after header if available
          const retryAfter = error.response.headers['retry-after'] || error.response.headers['x-ratelimit-reset'];
          if (retryAfter) {
            const waitTime = parseInt(retryAfter);
            const minutes = Math.ceil(waitTime / 60);
            errorMessage = `Too many login attempts. Please wait ${minutes} minute${minutes > 1 ? 's' : ''} before trying again.`;
            setRateLimitError(`Rate limit exceeded. Please wait ${minutes} minute${minutes > 1 ? 's' : ''} before trying again.`);
          } else {
            errorMessage = 'Too many login attempts. Please wait 15 minutes before trying again.';
            setRateLimitError('Rate limit exceeded. Please wait 15 minutes before trying again.');
          }
        } else if (status === 401) {
          setRateLimitError(null); // Clear rate limit error on other errors
          errorMessage = data?.error?.message || 'Invalid email or password';
        } else if (status === 403) {
          setRateLimitError(null);
          errorMessage = 'Access denied. Admin privileges required.';
        } else if (data?.error?.message) {
          setRateLimitError(null);
          errorMessage = data.error.message;
        } else if (data?.message) {
          setRateLimitError(null);
          errorMessage = data.message;
        } else {
          setRateLimitError(null);
          errorMessage = `Login failed (${status}). Please try again.`;
        }
      } else if (error.message) {
        // Network or other error
        setRateLimitError(null); // Clear rate limit error on network/other errors
        if (error.message.includes('Network Error') || error.message.includes('Failed to fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 camo-background">
      <div className="w-full max-w-md">
        <GlassmorphicCard className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-hot-pink mb-2">
              Admin Portal
            </h1>
            <p className="text-steel-grey">
              Sign in to access the admin dashboard
            </p>
          </div>

          {rateLimitError && (
            <div className="mb-6 p-4 rounded-lg bg-yellow-500/20 border border-yellow-500/50">
              <p className="text-sm text-yellow-900 dark:text-yellow-200 font-semibold">
                ⚠️ {rateLimitError}
              </p>
              <p className="text-xs text-yellow-800 dark:text-yellow-300 mt-2">
                This is a security feature to prevent brute force attacks. The limit will reset automatically.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-glossy-black mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setRateLimitError(null); // Clear rate limit error when user types
                }}
                required
                className="w-full px-4 py-3 rounded-lg glassmorphic-input focus:outline-none focus:ring-2 focus:ring-hot-pink"
                placeholder="admin@solosuccess.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-glossy-black mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setRateLimitError(null); // Clear rate limit error when user types
                }}
                required
                className="w-full px-4 py-3 rounded-lg glassmorphic-input focus:outline-none focus:ring-2 focus:ring-hot-pink"
                placeholder="Enter your password"
              />
            </div>

            <GlassmorphicButton
              type="submit"
              variant="primary"
              size="lg"
              disabled={isLoading || !!rateLimitError}
              loading={isLoading}
              className="w-full"
            >
              {isLoading ? 'Signing in...' : rateLimitError ? 'Rate Limited' : 'Sign In'}
            </GlassmorphicButton>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-steel-grey hover:text-hot-pink transition-colors"
            >
              ← Back to main site
            </button>
          </div>
        </GlassmorphicCard>
      </div>
    </div>
  );
};

export default AdminLoginPage;
