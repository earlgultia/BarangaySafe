import { supabase } from './supabase'

export type UserRole = 'resident' | 'staff' | 'admin'

export type UserProfile = {
  id: string
  email?: string
  full_name?: string
  role: UserRole
  address?: string
  phone?: string
  created_at?: string
  updated_at?: string
}

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

export async function fetchUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    console.error('Profile fetch error:', error)
    return null
  }

  return data as UserProfile | null
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>) {
  try {
    // Use regular UPDATE (not upsert) to avoid NOT NULL constraint issues
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)

    if (error) {
      console.error('Profile update error:', error)
      return { 
        success: false, 
        error: {
          message: error.message || 'Failed to update profile',
          code: error.code,
          details: error.details
        }
      }
    }

    return { success: true }
  } catch (err) {
    console.error('Profile update exception:', err)
    return { 
      success: false, 
      error: {
        message: err instanceof Error ? err.message : 'An unexpected error occurred'
      }
    }
  }
}

export async function createResidentProfile(userId: string, email?: string | null, fullName?: string | null) {
  const nameToUse = fullName || email?.split('@')[0] || 'Resident'
  
  const { error } = await supabase
    .from('profiles')
    .upsert({ id: userId, email, full_name: nameToUse, role: 'resident' }, { onConflict: 'id' })

  if (error) {
    console.error('Profile creation error:', error)
    return null
  }

  return 'resident' as UserRole
}

export async function ensureResidentProfile(userId: string, email?: string | null, fullName?: string | null) {
  const fetchedRole = await fetchProfileRole(userId)
  if (fetchedRole) {
    return fetchedRole
  }

  return await createResidentProfile(userId, email, fullName)
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
