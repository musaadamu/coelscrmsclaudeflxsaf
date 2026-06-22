<<<<<<< HEAD
import { useAuth } from './useAuth';

export function usePermission(requiredRoles: string | string[]) {
  const { hasRole, isAuthenticated } = useAuth();

  if (!isAuthenticated) return false;

  return hasRole(requiredRoles);
=======
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
>>>>>>> 8e59fd705bf9514513ad1c34b00061d692a81a7f
}
