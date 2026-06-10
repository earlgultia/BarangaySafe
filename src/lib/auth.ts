import { supabase } from './supabase'

export type UserRole = 'resident' | 'staff' | 'admin'

export async function fetchProfileRole(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  if (error || !data?.role) {
    return null
  }

  return data.role as UserRole
}

export function getRouteForRole(role: string | null) {
  switch (role?.toLowerCase()) {
    case 'staff':
      return '/staff'
    case 'admin':
      return '/admin'
    default:
      return '/resident'
  }
}
