import { motion } from 'framer-motion'
import AnnouncementFeed from '../components/AnnouncementFeed'
import EvacuationCenters from '../components/EvacuationCenters'

export default function ResidentPage() {

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
          <h2>Report issues, view alerts, and stay prepared.</h2>
          <p>
            Submit community incidents with photos and location, track your reports, and monitor nearby evacuation centers in a single, easy-to-use workspace.
          </p>
        </div>
      </motion.section>

      <motion.section
        className="resident-summary-grid"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut', delay: 0.1 }}
      >
        <article className="dashboard-card">
          <span className="card-label">Quick Report</span>
          <h3>Report incidents in seconds</h3>
          <p>Capture a photo, pin the location, and submit — our team will review and verify reports quickly so help can arrive sooner.</p>
        </article>

        <article className="dashboard-card">
          <span className="card-label">Local Safety</span>
          <h3>Find help and stay prepared</h3>
          <p>Access nearby evacuation centers, active alerts, and community resources — all from your dashboard for faster response.</p>
        </article>
      </motion.section>

      <AnnouncementFeed />
      <EvacuationCenters />
    </main>
  )
}
