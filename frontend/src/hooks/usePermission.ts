import { useAuth } from './useAuth'

export function usePermission(roles: string | string[]) {
  const { user } = useAuth()
  
  if (!user) return false
  
  const roleArray = Array.isArray(roles) ? roles : [roles]
  return user.roles.some(r => roleArray.includes(r))
}

export function useHasPermission(permission: string) {
  const { user } = useAuth()
  return user?.permissions?.includes(permission) || false
}
