import { supabase } from './supabase'

export type Announcement = {
  id: number
  title: string
  body: string
  pinned: boolean
  created_at: string
  updated_at: string
}

export async function fetchAnnouncements() {
  const { data, error } = await supabase
    .from('announcements')
    .select('id, title, body, pinned, created_at, updated_at')
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false })

  return { data, error }
}

export async function createAnnouncement(announcement: {
  title: string
  body: string
  pinned: boolean
}) {
  const { data, error } = await supabase
    .from('announcements')
    .insert([
      {
        title: announcement.title,
        body: announcement.body,
        pinned: announcement.pinned,
      },
    ])
    .select()

  return { data, error }
}

export async function updateAnnouncement(announcement: {
  id: number
  title: string
  body: string
}) {
  const { data, error } = await supabase
    .from('announcements')
    .update({ title: announcement.title, body: announcement.body })
    .eq('id', announcement.id)
    .select()

  return { data, error }
}

export async function deleteAnnouncement(id: number) {
  const { error } = await supabase.from('announcements').delete().eq('id', id)
  return { error }
}

export async function toggleAnnouncementPin(id: number, pinned: boolean) {
  const { data, error } = await supabase
    .from('announcements')
    .update({ pinned })
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
