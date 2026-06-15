import { supabase } from './supabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL

export type IncidentReportPayload = {
  user_id: string
  incident_type: string
  description: string
  image_url?: string
  latitude: number
  longitude: number
  location?: string
}

export type IncidentReportUpdatePayload = {
  id: number
  incident_type: string
  description: string
  location?: string
}

export async function uploadIncidentPhoto(userId: string, file: File) {
  const safeFileName = file.name.replace(/\s+/g, '-')
  const filePath = `incident_reports/${userId}/${Date.now()}-${safeFileName}`

  // Ensure we have an authenticated session (storage buckets may be private)
  const { data: sessionData } = await supabase.auth.getSession()
  const accessToken = sessionData?.session?.access_token
  if (!accessToken) {
    throw new Error('No authenticated session available for file upload. Please sign in again.')
  }

  const { error: uploadError } = await supabase.storage
    .from('incident-photos')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (uploadError) {
    const message = uploadError.message?.toString() ?? ''
    const status = (uploadError as any)?.status
    // If the bucket does not exist, return undefined so caller can handle gracefully
    if (message.includes('Bucket not found') || message.includes('bucket not found')) {
      console.warn('Storage bucket not found: incident-photos')
      return undefined
    }
    // In dev, attempt a direct fetch to capture raw response for debugging
    if (import.meta.env.DEV && supabaseUrl) {
      try {
        const { data: sessionData } = await supabase.auth.getSession()
        const token = sessionData?.session?.access_token
        const uploadUrl = `${supabaseUrl.replace(/\/+$/,'')}/storage/v1/object/incident-photos/${filePath}`

        const resp = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
          body: file as any,
        })

        const text = await resp.text()
        console.error('Direct fetch upload response', { status: resp.status, body: text })
        throw new Error(`Photo upload failed (${status ?? 'unknown status'}): ${message} -- fetch response: ${text}`)
      } catch (fetchErr) {
        console.error('Direct fetch upload attempt failed', fetchErr)
        throw new Error(`Photo upload failed (${status ?? 'unknown status'}): ${message}`)
      }
    }

    // Re-throw with more context
    throw new Error(`Photo upload failed (${status ?? 'unknown status'}): ${message}`)
  }

  const { data } = supabase.storage.from('incident-photos').getPublicUrl(filePath)

  if (!data?.publicUrl) {
    throw new Error('Unable to generate public URL for incident photo.')
  }

  return data.publicUrl
}

export async function createIncidentReport(report: IncidentReportPayload) {
  // Ensure we use the authenticated session's user id to satisfy RLS checks
  const { data: sessionData } = await supabase.auth.getSession()
  const sessionUserId = sessionData?.session?.user?.id

  if (!sessionUserId) {
    return { data: null, error: new Error('No authenticated user session available') }
  }

  const { data, error } = await supabase
    .from('incident_reports')
    .insert([
      {
        // Set both fields for compatibility with different schema versions
        reporter_id: sessionUserId,
        user_id: sessionUserId,
        incident_type: report.incident_type,
        description: report.description,
        photo_urls: report.image_url ? [report.image_url] : null,
        latitude: report.latitude,
        longitude: report.longitude,
        location: report.location,
        status: 'pending',
      },
    ])

  return { data, error }
}

export async function fetchIncidentReportsForUser(userId: string) {
  // Support schemas that use either `reporter_id` or `user_id`
  const filter = `reporter_id.eq.${userId},user_id.eq.${userId}`
  const { data, error } = await supabase
    .from('incident_reports')
    .select('id, incident_type, description, photo_urls, latitude, longitude, location, status, created_at')
    .or(filter)
    .order('created_at', { ascending: false })

  return { data, error }
}

export async function fetchIncidentReportsByStatus(status: string) {
  const { data, error } = await supabase
    .from('incident_reports')
    .select('id, reporter_id, description, photo_urls, latitude, longitude, location, status, created_at')
    .eq('status', status)
    .order('created_at', { ascending: false })

  return { data, error }
}

export async function updateIncidentReport(report: IncidentReportUpdatePayload) {
  const { data, error } = await supabase
    .from('incident_reports')
    .update({
      incident_type: report.incident_type,
      description: report.description,
      location: report.location ?? null,
    })
    .eq('id', report.id)
    .select()

  return { data, error }
}

export async function deleteIncidentReport(reportId: number) {
  const { error } = await supabase.from('incident_reports').delete().eq('id', reportId)
  return { error }
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
