import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Bell, Camera, MapPin, ShieldCheck } from 'lucide-react'

export default function ResidentPage() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('[ResidentPage] mounted')
    setLoading(false)
  }, [])

  return (
    <main className="page-stack resident-page">
      <motion.section
        className="resident-hero"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <div className="resident-hero-copy">
          <p className="report-subtitle">Resident dashboard</p>
          <h2>Quick actions for your community.</h2>
          <p className="hero-note">One tap to report, monitor alerts, and find nearby shelters.</p>

          <div className="resident-hero-actions">
            <button type="button" className="action-button">
              <Camera size={18} />
              Report
            </button>
            <button type="button" className="button-secondary">
              <Bell size={18} />
              Alerts
            </button>
          </div>

          <div className="resident-hero-features">
            <div className="feature-pill">
              <MapPin size={16} />
              Shelters
            </div>
            <div className="feature-pill">
              <ShieldCheck size={16} />
              Secure
            </div>
            <div className="feature-pill">
              <AlertTriangle size={16} />
              Alerts
            </div>
          </div>
        </div>

        <div className="resident-hero-panel">
          <div className="hero-card compact-card">
            <div className="hero-card-icon">
              <ShieldCheck size={18} />
            </div>
            <div>
              <strong>Mobile-ready</strong>
              <span>Fast response UI</span>
            </div>
          </div>

          <div className="hero-card compact-card">
            <div className="hero-card-icon">
              <AlertTriangle size={18} />
            </div>
            <div>
              <strong>Live alerts</strong>
              <span>Instant warning feed</span>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        className="resident-status-grid"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut', delay: 0.12 }}
      >
        <div className="status-card">
          <div className="status-card-icon status-alert">
            <AlertTriangle size={20} />
          </div>
          <div>
            <strong>{loading ? '—' : 12}</strong>
            <span>Active alerts</span>
          </div>
        </div>
        <div className="status-card">
          <div className="status-card-icon status-shelter">
            <MapPin size={20} />
          </div>
          <div>
            <strong>{loading ? '—' : 8}</strong>
            <span>Nearby shelters</span>
          </div>
        </div>
        <div className="status-card">
          <div className="status-card-icon status-report">
            <Camera size={20} />
          </div>
          <div>
            <strong>{loading ? '—' : 4}</strong>
            <span>Reports pending</span>
          </div>
        </div>
      </motion.section>

      <motion.section
        className="resident-summary-grid"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut', delay: 0.28 }}
      >
        <article className="dashboard-card compact-summary-card">
          <div className="dashboard-card-icon">
            <Camera size={18} />
          </div>
          <strong>Quick report</strong>
          <span className="card-note">Capture and submit in one tap.</span>
        </article>

        <article className="dashboard-card compact-summary-card">
          <div className="dashboard-card-icon">
            <MapPin size={18} />
          </div>
          <strong>Safety map</strong>
          <span className="card-note">Locate centers instantly.</span>
        </article>
      </motion.section>
    </main>
  )
}
