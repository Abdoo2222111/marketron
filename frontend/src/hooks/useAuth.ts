import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/endpoints';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import type { User } from '@/types';

export function useAuth() {
  const { user, isAuthenticated, isLoading, setUser, setLoading, logout: storeLogout } = useAuthStore();
  const navigate = useNavigate();

  const { data: profileData } = useQuery({
    queryKey: ['auth-profile'],
    queryFn: async () => {
      try {
        const { data } = await authService.getProfile();
        return data;
      } catch {
        return null;
      }
    },
    enabled: !!localStorage.getItem('auth_token'),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (profileData) {
      setUser(profileData as User);
    } else if (!localStorage.getItem('auth_token')) {
      setLoading(false);
    }
  }, [profileData, setUser, setLoading]);

  const loginMutation = useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      authService.login(credentials.email, credentials.password),
    onSuccess: (res) => {
      const { token, refreshToken, user: userData } = res.data;
      localStorage.setItem('auth_token', token);
      localStorage.setItem('refresh_token', refreshToken);
      setUser(userData);
      navigate('/dashboard');
    },
  });

  const logout = () => {
    storeLogout();
    navigate('/login');
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login: loginMutation.mutate,
    loginError: loginMutation.error,
    isLoginPending: loginMutation.isPending,
    logout,
    profileData,
  };
}
