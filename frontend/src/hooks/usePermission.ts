import { useAuth } from './useAuth';

export function usePermission(requiredRoles: string | string[]) {
  const { hasRole, isAuthenticated } = useAuth();

  if (!isAuthenticated) return false;

  return hasRole(requiredRoles);
}
