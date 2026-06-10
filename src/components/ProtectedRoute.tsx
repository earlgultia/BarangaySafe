import type { ReactNode } from 'react'
import { useLocation, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getRouteForRole } from '../lib/auth'

interface ProtectedRouteProps {
  allowedRoles: string[]
  children: ReactNode
}

export default function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { user, role, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="skeleton-page">Loading authentication status...</div>
  }

  if (!user || !role) {
    return <Navigate to="/auth/login" replace state={{ from: location.pathname }} />
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to={getRouteForRole(role)} replace />
  }

  return children
}
