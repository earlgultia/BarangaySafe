import { supabase } from './supabase'

export type AssemblyPoint = {
  id: number
  name: string
  description?: string
  latitude: number
  longitude: number
}

export type GeoArea = {
  id: number
  name: string
  description?: string
  severity?: string
  coordinates: Array<{ latitude: number; longitude: number }>
}

export type IncidentMapReport = {
  id: number
  description: string
  status: string
  latitude: number
  longitude: number
  created_at: string
}

export async function fetchAssemblyPoints() {
  const { data, error } = await supabase
    .from('assembly_points')
    .select('id, name, description, latitude, longitude')
    .order('name', { ascending: true })

  return { data, error }
}

export async function fetchFloodAreas() {
  const { data, error } = await supabase
    .from('flood_areas')
    .select('id, name, description, severity, coordinates')
    .order('name', { ascending: true })

  return { data, error }
}

export async function fetchLandslideAreas() {
  const { data, error } = await supabase
    .from('landslide_areas')
    .select('id, name, description, severity, coordinates')
    .order('name', { ascending: true })

  return { data, error }
}

export async function fetchIncidentReportsForMap() {
  const { data, error } = await supabase
    .from('incident_reports')
    .select('id, description, status, latitude, longitude, created_at')
    .order('created_at', { ascending: false })

  return { data, error }
}
