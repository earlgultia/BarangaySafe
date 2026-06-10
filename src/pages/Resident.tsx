import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, LogOut } from 'lucide-react'
import { supabase } from '../lib/supabase'
import IncidentReportForm from '../components/IncidentReportForm'
import AnnouncementFeed from '../components/AnnouncementFeed'
import EvacuationCenters from '../components/EvacuationCenters'

export default function ResidentPage() {
  const navigate = useNavigate()

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/auth/login')
  }

  function scrollToReport() {
    document.getElementById('incident-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

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

        <div className="resident-hero-actions">
          <button type="button" className="button-outline" onClick={scrollToReport}>
            <ArrowRight size={16} />
            <span>Submit an incident</span>
          </button>
          <button className="signout-button" onClick={handleSignOut}>
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </div>
      </motion.section>

      <motion.section
        className="resident-summary-grid"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut', delay: 0.1 }}
      >
        <article className="dashboard-card">
          <span className="card-label">Fast reporting</span>
          <h3>Submit verified incidents</h3>
          <p>Use the quick action button to report issues directly from the dashboard with a photo and pinned location.</p>
          <button type="button" className="button-secondary" onClick={scrollToReport}>
            Go to report form
          </button>
        </article>

        <article className="dashboard-card">
          <span className="card-label">Community updates</span>
          <h3>Stay informed instantly</h3>
          <p>Review the latest announcements and evacuation updates without leaving your resident dashboard.</p>
        </article>
      </motion.section>

      <AnnouncementFeed />
      <EvacuationCenters />
      <IncidentReportForm />
    </main>
  )
}
