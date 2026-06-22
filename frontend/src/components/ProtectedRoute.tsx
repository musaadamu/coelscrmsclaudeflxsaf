import { ReactNode } from 'react'
import { usePermission } from '../hooks/usePermission'
import { useAuth } from '../hooks/useAuth'
import { Navigate } from 'react-router-dom'

interface ProtectedRouteProps {
  layout: React.ComponentType<{ children: ReactNode }>
  roles: string[]
  children?: ReactNode
}

export default function ProtectedRoute({ layout: Layout, roles }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const hasPermission = usePermission(roles)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!hasPermission) {
    return <Navigate to="/dashboard" replace />
  }

  return <Layout>{null}</Layout>
}
