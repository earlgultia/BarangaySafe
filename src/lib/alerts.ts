import { supabase } from './supabase'

export type EmergencyAlertType =
  | 'Typhoon'
  | 'Flood'
  | 'Earthquake'
  | 'Fire'
  | 'Landslide'
  | 'Tsunami'
  | 'Storm Surge'
  | 'Disease Outbreak'
  | 'Other'

export type EmergencyAlert = {
  id: number
  alert_type: EmergencyAlertType
  title: string
  description: string
  critical: boolean
  active: boolean
  created_at: string
}

export async function createEmergencyAlert(alert: {
  alert_type: EmergencyAlertType
  title: string
  description: string
  critical: boolean
}) {
  const { data, error } = await supabase
    .from('emergency_alerts')
    .insert([
      {
        alert_type: alert.alert_type,
        title: alert.title,
        description: alert.description,
        critical: alert.critical,
        active: true,
      },
    ])
    .select()

  return { data, error }
}

export async function fetchActiveAlerts() {
  const { data, error } = await supabase
    .from('emergency_alerts')
    .select('id, alert_type, title, description, critical, active, created_at')
    .eq('active', true)
    .order('created_at', { ascending: false })

  return { data, error }
}

export function subscribeToAlerts(callback: (payload: any) => void) {
  return supabase
    .channel('emergency_alerts_updates')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'emergency_alerts' },
      (payload) => {
        callback(payload)
      },
    )
    .subscribe()
}
