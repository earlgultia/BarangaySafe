import { supabase } from './supabase'

export type IncidentTrendPoint = {
  date: string
  count: number
}

export type AlertFrequencyPoint = {
  alert_type: string
  count: number
}

export type CategoryPoint = {
  category: string
  count: number
}

export async function fetchDashboardCounts() {
  const [residentCount, incidentCount, alertCount, centerCount] = await Promise.all([
    supabase.from('residents').select('id', { count: 'exact', head: true }),
    supabase.from('incident_reports').select('id', { count: 'exact', head: true }).neq('status', 'resolved'),
    supabase.from('emergency_alerts').select('id', { count: 'exact', head: true }).eq('active', true),
    supabase.from('evacuation_centers').select('id', { count: 'exact', head: true }),
  ])

  const errors = [residentCount.error, incidentCount.error, alertCount.error, centerCount.error].filter(Boolean)
  if (errors.length > 0) {
    return { error: errors[0] }
  }

  return {
    totalResidents: residentCount.count ?? 0,
    openIncidents: incidentCount.count ?? 0,
    activeAlerts: alertCount.count ?? 0,
    evacuationCenters: centerCount.count ?? 0,
  }
}

export async function fetchIncidentTrends() {
  const { data, error } = await supabase
    .from('incident_reports')
    .select('created_at')
    .order('created_at', { ascending: true })

  if (error || !data) {
    return { data: [] as IncidentTrendPoint[], error }
  }

  const counts = data.reduce<Record<string, number>>((acc, item) => {
    const day = new Date(item.created_at).toISOString().slice(0, 10)
    acc[day] = (acc[day] ?? 0) + 1
    return acc
  }, {})

  const points = Object.entries(counts).map(([date, count]) => ({ date, count }))
  return { data: points, error: null }
}

export async function fetchDisasterFrequency() {
  const { data, error } = await supabase
    .from('emergency_alerts')
    .select('alert_type')

  if (error || !data) {
    return { data: [] as AlertFrequencyPoint[], error }
  }

  const counts = data.reduce<Record<string, number>>((acc, item) => {
    const key = item.alert_type ?? 'Other'
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})

  return {
    data: Object.entries(counts).map(([alert_type, count]) => ({ alert_type, count })),
    error: null,
  }
}

export async function fetchPopulationBreakdown() {
  const { data, error } = await supabase
    .from('residents')
    .select('vulnerable_type')

  if (error || !data) {
    return { data: [] as CategoryPoint[], error }
  }

  const counts = data.reduce<Record<string, number>>((acc, item) => {
    const category = item.vulnerable_type ?? 'General'
    acc[category] = (acc[category] ?? 0) + 1
    return acc
  }, {})

  return {
    data: Object.entries(counts).map(([category, count]) => ({ category, count })),
    error: null,
  }
}
