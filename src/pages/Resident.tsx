import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
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

  return (
    <main className="page-stack">
      <div className="resident-hero">
        <div>
          <p className="report-subtitle">Resident Dashboard</p>
          <h2>Incident reporting</h2>
          <p>Submit community issues for staff verification and status updates.</p>
        </div>

        <button className="signout-button" onClick={handleSignOut}>
          <LogOut size={16} />
          <span>Sign out</span>
        </button>
      </div>

      <AnnouncementFeed />
      <EvacuationCenters />
      <IncidentReportForm />
    </main>
  )
}
