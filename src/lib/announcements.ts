import { supabase } from './supabase'

const contentColumnCandidates = ['content', 'message'] as const

type AnnouncementRow = Record<string, unknown> & {
  id?: string | number
  title?: string
  body?: string
  message?: string
  content?: string
  details?: string
  description?: string
  pinned?: boolean
  created_at?: string
  updated_at?: string
}

export type Announcement = {
  id: string
  title: string
  body: string
  pinned: boolean
  created_at: string
  updated_at: string
}

function normalizeAnnouncement(row: AnnouncementRow): Announcement {
  const body = ['content', 'message', 'body', 'details', 'description']
    .map((column) => row[column as keyof AnnouncementRow])
    .find((value): value is string => typeof value === 'string' && value.trim().length > 0) ?? ''

  const idValue = typeof row.id === 'string' ? row.id : typeof row.id === 'number' ? String(row.id) : ''

  return {
    id: idValue,
    title: typeof row.title === 'string' ? row.title : '',
    body,
    pinned: row.pinned === true,
    created_at: typeof row.created_at === 'string' ? row.created_at : '',
    updated_at: typeof row.updated_at === 'string' ? row.updated_at : '',
  }
}

export async function fetchAnnouncements() {
  const { data, error } = await supabase.from('announcements').select('*')

  if (error) {
    return { data: [] as Announcement[], error }
  }

  const normalizedData = (data ?? []).map((announcement) => normalizeAnnouncement(announcement as AnnouncementRow))
  normalizedData.sort((a, b) => {
    if (Number(a.pinned) !== Number(b.pinned)) {
      return Number(b.pinned) - Number(a.pinned)
    }

    const aTime = a.created_at ? Date.parse(a.created_at) : 0
    const bTime = b.created_at ? Date.parse(b.created_at) : 0
    return bTime - aTime
  })

  return { data: normalizedData, error: null }
}

export async function createAnnouncement(announcement: {
  title: string
  body: string
  pinned: boolean
}) {
  const contentValue = announcement.body?.trim() || announcement.title?.trim() || 'Announcement'
  const basePayload = {
    title: announcement.title,
    ...(typeof announcement.pinned === 'boolean' ? { pinned: announcement.pinned } : {}),
  }

  let lastError: Error | null = null

  for (const column of contentColumnCandidates) {
    const { data, error } = await supabase
      .from('announcements')
      .insert([{ ...basePayload, [column]: contentValue }])
      .select('*')

    if (!error && data) {
      return { data: data.map((row) => normalizeAnnouncement(row as AnnouncementRow)), error: null }
    }

    lastError = error as Error | null
  }

  return { data: null, error: lastError }
}

export async function updateAnnouncement(announcement: {
  id: string
  title: string
  body: string
}) {
  let lastError: Error | null = null

  for (const column of contentColumnCandidates) {
    const { data, error } = await supabase
      .from('announcements')
      .update({ title: announcement.title, [column]: announcement.body?.trim() || announcement.title?.trim() || 'Announcement' })
      .eq('id', announcement.id)
      .select('*')

    if (!error && data) {
      return { data: data.map((row) => normalizeAnnouncement(row as AnnouncementRow)), error: null }
    }

    lastError = error as Error | null
  }

  return { data: null, error: lastError }
}

export async function deleteAnnouncement(id: string) {
  if (!id) {
    return { error: new Error('Invalid announcement id') }
  }

  const { error } = await supabase.from('announcements').delete().eq('id', id)
  return { error }
}

export async function toggleAnnouncementPin(id: string, pinned: boolean) {
  const { data, error } = await supabase
    .from('announcements')
    .update({ ...(typeof pinned === 'boolean' ? { pinned } : {}) })
    .eq('id', id)
    .select()

  return { data, error }
}

export function subscribeToAnnouncements(callback: (payload: any) => void) {
  return supabase
    .channel('announcements_updates')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'announcements' },
      (payload) => {
        callback(payload)
      },
    )
    .subscribe()
}
