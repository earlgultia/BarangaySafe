import { supabase } from './supabase'

export type IncidentReportPayload = {
  user_id: string
  description: string
  image_url?: string
  latitude: number
  longitude: number
  address?: string
}

export async function uploadIncidentPhoto(userId: string, file: File) {
  const safeFileName = file.name.replace(/\s+/g, '-')
  const filePath = `incident_reports/${userId}/${Date.now()}-${safeFileName}`

  const { error: uploadError } = await supabase.storage
    .from('incident-photos')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (uploadError) {
    const message = uploadError.message?.toString() ?? ''
    if (message.includes('Bucket not found') || message.includes('bucket not found')) {
      return undefined
    }
    throw uploadError
  }

  const { data } = supabase.storage.from('incident-photos').getPublicUrl(filePath)

  if (!data?.publicUrl) {
    throw new Error('Unable to generate public URL for incident photo.')
  }

  return data.publicUrl
}

export async function createIncidentReport(report: IncidentReportPayload) {
  const { data, error } = await supabase
    .from('incident_reports')
    .insert([
      {
        user_id: report.user_id,
        description: report.description,
        image_url: report.image_url,
        latitude: report.latitude,
        longitude: report.longitude,
        address: report.address,
        status: 'pending',
      },
    ])
    .select()

  return { data, error }
}

export async function fetchIncidentReportsForUser(userId: string) {
  const { data, error } = await supabase
    .from('incident_reports')
    .select('id, description, image_url, latitude, longitude, status, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return { data, error }
}

export async function fetchIncidentReportsByStatus(status: string) {
  const { data, error } = await supabase
    .from('incident_reports')
    .select('id, user_id, description, image_url, latitude, longitude, status, created_at')
    .eq('status', status)
    .order('created_at', { ascending: false })

  return { data, error }
}

export async function updateIncidentReportStatus(reportId: number, status: string) {
  const { data, error } = await supabase
    .from('incident_reports')
    .update({ status })
    .eq('id', reportId)
    .select()

  return { data, error }
}

export async function addIncidentUpdate(reportId: number, updateText: string, status: string) {
  const { data, error } = await supabase
    .from('incident_updates')
    .insert([
      {
        incident_report_id: reportId,
        update_text: updateText,
        status,
      },
    ])
    .select()

  return { data, error }
}

export async function fetchIncidentUpdates(reportId: number) {
  const { data, error } = await supabase
    .from('incident_updates')
    .select('id, update_text, status, created_at')
    .eq('incident_report_id', reportId)
    .order('created_at', { ascending: true })

  return { data, error }
}
