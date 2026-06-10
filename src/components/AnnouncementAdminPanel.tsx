import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Trash2, Pin, Edit3, Save, Send } from 'lucide-react'
import {
  createAnnouncement,
  deleteAnnouncement,
  fetchAnnouncements,
  toggleAnnouncementPin,
  updateAnnouncement,
  type Announcement,
} from '../lib/announcements'

type EditDraft = {
  title: string
  body: string
}

export default function AnnouncementAdminPanel() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [pinned, setPinned] = useState(false)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editDrafts, setEditDrafts] = useState<Record<number, EditDraft>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function loadAnnouncements() {
    setIsLoading(true)
    const { data, error } = await fetchAnnouncements()
    setIsLoading(false)
    if (error) {
      setErrorMessage(error.message)
      return
    }
    setAnnouncements(data ?? [])
  }

  useEffect(() => {
    void loadAnnouncements()
  }, [])

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage(null)
    setStatusMessage(null)

    if (!title.trim() || !body.trim()) {
      setErrorMessage('Please add a title and announcement body.')
      return
    }

    setIsLoading(true)
    const { error } = await createAnnouncement({ title: title.trim(), body: body.trim(), pinned })
    setIsLoading(false)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    setStatusMessage('Announcement created.')
    setTitle('')
    setBody('')
    setPinned(false)
    await loadAnnouncements()
  }

  async function handleDelete(id: number) {
    setErrorMessage(null)
    setIsLoading(true)
    const { error } = await deleteAnnouncement(id)
    setIsLoading(false)
    if (error) {
      setErrorMessage(error.message)
      return
    }
    await loadAnnouncements()
  }

  async function handlePin(id: number, value: boolean) {
    setErrorMessage(null)
    setIsLoading(true)
    const { error } = await toggleAnnouncementPin(id, value)
    setIsLoading(false)
    if (error) {
      setErrorMessage(error.message)
      return
    }
    await loadAnnouncements()
  }

  async function handleStartEditing(announcement: Announcement) {
    setEditingId(announcement.id)
    setEditDrafts((current) => ({
      ...current,
      [announcement.id]: { title: announcement.title, body: announcement.body },
    }))
  }

  async function handleUpdate(id: number) {
    const draft = editDrafts[id]
    if (!draft || !draft.title.trim() || !draft.body.trim()) {
      setErrorMessage('Announcement title and body cannot be empty.')
      return
    }

    setErrorMessage(null)
    setIsLoading(true)
    const { error } = await updateAnnouncement({ id, title: draft.title.trim(), body: draft.body.trim() })
    setIsLoading(false)
    if (error) {
      setErrorMessage(error.message)
      return
    }
    setEditingId(null)
    await loadAnnouncements()
  }

  return (
    <motion.section
      className="announcement-admin-panel"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="alert-panel-header">
        <div>
          <p className="report-subtitle">Announcement center</p>
          <h2>Create announcement</h2>
          <p>Publish announcements for residents with pinning, editing, and deletion support.</p>
        </div>
      </div>

      <form className="alert-form" onSubmit={handleCreate}>
        <label>
          <span>Title</span>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Type the announcement headline"
          />
        </label>

        <label>
          <span>Message</span>
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Write announcement content here."
            rows={4}
          />
        </label>

        <label className="checkbox-row">
          <input type="checkbox" checked={pinned} onChange={(event) => setPinned(event.target.checked)} />
          <span>Pin announcement</span>
        </label>

        <button type="submit" className="submit-button" disabled={isLoading}>
          <Send size={16} />
          <span>Post announcement</span>
        </button>

        {statusMessage ? <p className="success-message">{statusMessage}</p> : null}
        {errorMessage ? <p className="error-message">{errorMessage}</p> : null}
      </form>

      <div className="alert-list">
        <h3>Announcements feed</h3>
        {isLoading ? (
          <p>Loading announcements…</p>
        ) : announcements.length === 0 ? (
          <p>No announcements yet.</p>
        ) : (
          <div className="announcement-card-grid">
            {announcements.map((announcement) => (
              <motion.article
                key={announcement.id}
                className={`announcement-card ${announcement.pinned ? 'pinned' : ''}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                <div className="announcement-card-heading">
                  <div>
                    <h4>{announcement.title}</h4>
                    <small>{new Date(announcement.created_at).toLocaleString()}</small>
                  </div>
                  <button
                    type="button"
                    className="pin-toggle"
                    onClick={() => void handlePin(announcement.id, !announcement.pinned)}
                  >
                    <Pin size={16} /> {announcement.pinned ? 'Unpin' : 'Pin'}
                  </button>
                </div>

                {editingId === announcement.id ? (
                  <div className="edit-panel">
                    <input
                      type="text"
                      value={editDrafts[announcement.id]?.title ?? announcement.title}
                      onChange={(event) =>
                        setEditDrafts((current) => ({
                          ...current,
                          [announcement.id]: {
                            ...(current[announcement.id] ?? { title: announcement.title, body: announcement.body }),
                            title: event.target.value,
                          },
                        }))
                      }
                    />
                    <textarea
                      rows={4}
                      value={editDrafts[announcement.id]?.body ?? announcement.body}
                      onChange={(event) =>
                        setEditDrafts((current) => ({
                          ...current,
                          [announcement.id]: {
                            ...(current[announcement.id] ?? { title: announcement.title, body: announcement.body }),
                            body: event.target.value,
                          },
                        }))
                      }
                    />
                    <div className="announcement-card-actions">
                      <button type="button" className="action-button verify" onClick={() => void handleUpdate(announcement.id)}>
                        <Save size={16} /> Save
                      </button>
                      <button type="button" className="action-button reject" onClick={() => setEditingId(null)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p>{announcement.body}</p>
                    <div className="announcement-card-actions">
                      <button type="button" className="action-button verify" onClick={() => void handleStartEditing(announcement)}>
                        <Edit3 size={16} /> Edit
                      </button>
                      <button type="button" className="action-button reject" onClick={() => void handleDelete(announcement.id)}>
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  </>
                )}
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </motion.section>
  )
}
