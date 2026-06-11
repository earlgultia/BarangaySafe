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
  distance?: number
}

export async function fetchEvacuationCenters() {
  const { data, error } = await supabase
    .from('evacuation_centers')
    .select('id, name, capacity, current_occupancy, contact_number, latitude, longitude, address')
    .order('name', { ascending: true })

  return { data, error }
}

// Calculate distance between two coordinates (Haversine formula)
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Geocode address to coordinates using OpenStreetMap Nominatim
export async function geocodeAddress(address: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`
    )
    const data = await response.json()
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
      }
    }
    return null
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}
