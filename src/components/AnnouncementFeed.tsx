import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { fetchAnnouncements, type Announcement } from '../lib/announcements'

export default function AnnouncementFeed() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data, error } = await fetchAnnouncements()
      setLoading(false)
      if (error) {
        return
      }
      setAnnouncements(data ?? [])
    }

    void load()
  }, [])

  return (
    <section className="announcement-feed">
      <div className="alert-panel-header">
        <div>
          <p className="report-subtitle">Announcements</p>
          <h2>Community news feed</h2>
          <p>See pinned updates and the latest announcements in a Facebook-like card feed.</p>
        </div>
      </div>

      {loading ? (
        <p>Loading announcements…</p>
      ) : announcements.length === 0 ? (
        <p>No announcements yet.</p>
      ) : (
        <div className="announcement-card-grid">
          {announcements.map((announcement) => (
            <motion.article
              key={announcement.id}
              className={`announcement-card ${announcement.pinned ? 'pinned' : ''}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="announcement-card-heading">
                <div>
                  <h4>{announcement.title}</h4>
                  <small>{new Date(announcement.created_at).toLocaleString()}</small>
                </div>
                {announcement.pinned ? <span className="alert-pill critical">Pinned</span> : null}
              </div>
              <p>{announcement.body}</p>
            </motion.article>
          ))}
        </div>
      )}
    </section>
  )
}
