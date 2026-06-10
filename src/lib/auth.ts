import { supabase } from './supabase'

export type UserRole = 'resident' | 'staff' | 'admin'

export async function fetchProfileRole(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    return null
  }

  return data?.role ?? null
}

export async function createResidentProfile(userId: string, email?: string | null) {
  const { error } = await supabase
    .from('profiles')
    .upsert({ id: userId, email, role: 'resident' }, { onConflict: 'id' })

  if (error) {
    return null
  }

  return 'resident' as UserRole
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
