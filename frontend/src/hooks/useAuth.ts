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
}
