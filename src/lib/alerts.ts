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
  critical?: boolean
  active?: boolean
  created_at: string
}

const alertTypeToDbValue: Record<EmergencyAlertType, string> = {
  Typhoon: 'typhoon',
  Flood: 'flood',
  Earthquake: 'earthquake',
  Fire: 'fire',
  Landslide: 'landslide',
  Tsunami: 'tsunami',
  'Storm Surge': 'storm_surge',
  'Disease Outbreak': 'disease_outbreak',
  Other: 'other',
}

const dbValueToAlertType: Record<string, EmergencyAlertType> = Object.fromEntries(
  Object.entries(alertTypeToDbValue).map(([key, value]) => [value, key as EmergencyAlertType]),
) as Record<string, EmergencyAlertType>

function normalizeAlertType(value: string | null | undefined): EmergencyAlertType {
  if (!value) return 'Other'

  return dbValueToAlertType[value.toLowerCase()] ?? 'Other'
}

export async function createEmergencyAlert(alert: {
  alert_type: EmergencyAlertType
  title: string
  description: string
  critical: boolean
}) {
  const payload: Record<string, unknown> = {
    alert_type: alertTypeToDbValue[alert.alert_type],
    title: alert.title,
    description: alert.description,
  }

  try {
    const { data, error } = await supabase.from('emergency_alerts').insert([payload]).select()
    return { data, error }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

export async function fetchActiveAlerts() {
  const { data, error } = await supabase
    .from('emergency_alerts')
    .select('id, alert_type, title, description, created_at')
    .order('created_at', { ascending: false })

  const normalizedData = (data ?? []).map((alert) => ({
    ...alert,
    alert_type: normalizeAlertType(alert.alert_type as string | null | undefined),
    critical: false,
    active: true,
  }))

  return { data: normalizedData, error }
}

export async function deleteEmergencyAlert(id: number) {
  const { error } = await supabase.from('emergency_alerts').delete().eq('id', id)
  return { error }
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
