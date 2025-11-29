import { api, setAccessToken } from './api';
import { LoginCredentials, RegisterCredentials, AuthResponse, User } from '../types/auth';

export const authService = {
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await api.post('/auth/register', credentials);
    const { user, accessToken } = response.data.data;
    setAccessToken(accessToken);
    return { user, accessToken };
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post('/auth/login', credentials);
    const { user, accessToken } = response.data.data;
    setAccessToken(accessToken);
    return { user, accessToken };
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
    setAccessToken(null);
  },

  async refreshToken(): Promise<string> {
    const response = await api.post('/auth/refresh');
    const { accessToken } = response.data.data;
    setAccessToken(accessToken);
    return accessToken;
  },

  async getMe(): Promise<User> {
    const response = await api.get('/auth/me');
    return response.data.data.user;
  },

  async forgotPassword(email: string): Promise<string> {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data.data.message;
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await api.post('/auth/reset-password', { token, password });
  },
};
