import { supabase } from './supabase'

export type Household = {
  id: number
  family_name: string
  purok: string
}

export type VulnerableResident = {
  id: number
  name: string
  vulnerable_type: 'Senior Citizen' | 'PWD' | 'Pregnant Woman' | string
  purok: string
}

export async function fetchHouseholds() {
  const { data, error } = await supabase
    .from('households')
    .select('id, family_name, purok')
    .order('purok', { ascending: true })

  return { data, error }
}

export async function fetchVulnerableResidents() {
  const { data, error } = await supabase
    .from('residents')
    .select('id, name, vulnerable_type, purok')
    .in('vulnerable_type', ['Senior Citizen', 'PWD', 'Pregnant Woman'])
    .order('name', { ascending: true })

  return { data, error }
}

export async function fetchTotalResidents() {
  const { count, error } = await supabase
    .from('residents')
    .select('id', { count: 'exact', head: true })

  return { count: count ?? 0, error }
}
