import api from './api';
import type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  User,
  ApiResponse,
} from '@/types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    return data.data;
  },

  async register(registerData: RegisterData): Promise<AuthResponse> {
    const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/register', registerData);
    return data.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
  },

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    const { data } = await api.post<ApiResponse<{ accessToken: string }>>('/auth/refresh', {
      refreshToken,
    });
    return data.data;
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const { data } = await api.post<ApiResponse<{ message: string }>>('/auth/forgot-password', { email });
    return data.data;
  },

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const { data } = await api.post<ApiResponse<{ message: string }>>('/auth/reset-password', {
      token,
      newPassword,
    });
    return data.data;
  },

  async googleLogin(): Promise<void> {
    window.location.href = `${api.defaults.baseURL}/auth/google`;
  },

  async linkedinLogin(): Promise<void> {
    window.location.href = `${api.defaults.baseURL}/auth/linkedin`;
  },

  async getProfile(): Promise<User> {
    const { data } = await api.get<ApiResponse<User>>('/auth/me');
    return data.data;
  },

  async updateProfile(profileData: Partial<User>): Promise<User> {
    const { data } = await api.put<ApiResponse<User>>('/auth/me', profileData);
    return data.data;
  },
};
