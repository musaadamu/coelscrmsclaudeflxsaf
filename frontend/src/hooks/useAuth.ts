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
}
