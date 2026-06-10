import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { supabase } from '../lib/supabase'
import AdminAlertPanel from '../components/AdminAlertPanel'
import AnnouncementAdminPanel from '../components/AnnouncementAdminPanel'
import CommunityMap from '../components/CommunityMap'
import ResidentRegistryPanel from '../components/ResidentRegistryPanel'
import AnalyticsDashboard from '../components/AnalyticsDashboard'
import ReliefDistributionPanel from '../components/ReliefDistributionPanel'

export default function AdminPage() {
  const navigate = useNavigate()

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/auth/login')
  }

  return (
    <main className="page-stack">
      <div className="resident-hero">
        <div>
          <p className="report-subtitle">Admin Dashboard</p>
          <h2>Emergency and announcement center</h2>
          <p>Create alerts and announcements for the community from a single dashboard.</p>
        </div>

        <button className="signout-button" onClick={handleSignOut}>
          <LogOut size={16} />
          <span>Sign out</span>
        </button>
      </div>

      <AdminAlertPanel />
      <AnnouncementAdminPanel />
      <AnalyticsDashboard />
      <ReliefDistributionPanel />
      <div className="admin-grid">
        <ResidentRegistryPanel />
        <CommunityMap />
      </div>
    </main>
  )
}
