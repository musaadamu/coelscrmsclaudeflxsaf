<<<<<<< HEAD
import { useAuthStore } from '@/stores/authStore';

export function useAuth() {
  const { user, isAuthenticated, logout } = useAuthStore();

  return {
    user,
    isAuthenticated,
    logout,
    // Helper to check roles
    hasRole: (roles: string | string[]) => {
      if (!user) return false;
      const rolesArray = Array.isArray(roles) ? roles : [roles];
      // admin always has all roles essentially, but let's stick to strict check or specific super_admin check
      if (user.roles.includes('super_admin')) return true;
      return user.roles.some((role) => rolesArray.includes(role));
    },
  };
=======
import { useQuery } from '@tanstack/react-query'
import api from '../services/api'
import { JwtPayload } from '@coels-crms/shared'

interface AuthContextType {
  user: JwtPayload | null
  loading: boolean
  error: Error | null
  logout: () => void
}

export function useAuth(): AuthContextType {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['auth', 'current-user'],
    queryFn: async () => {
      const { data } = await api.get('/auth/me')
      return data.data as JwtPayload
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
  })

  const logout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    window.location.href = '/login'
  }

  return {
    user: user || null,
    loading: isLoading,
    error: error instanceof Error ? error : null,
    logout,
  }
>>>>>>> 8e59fd705bf9514513ad1c34b00061d692a81a7f
}
