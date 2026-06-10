import { supabase } from './supabase'

export type EvacuationCenter = {
  id: number
  name: string
  capacity: number
  current_occupancy: number
  contact_number: string
  latitude: number
  longitude: number
  address?: string
}

export async function fetchEvacuationCenters() {
  const { data, error } = await supabase
    .from('evacuation_centers')
    .select('id, name, capacity, current_occupancy, contact_number, latitude, longitude, address')
    .order('name', { ascending: true })

  return { data, error }
}
