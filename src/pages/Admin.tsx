import AdminAlertPanel from '../components/AdminAlertPanel'
import AnnouncementAdminPanel from '../components/AnnouncementAdminPanel'
import CommunityMap from '../components/CommunityMap'
import ResidentRegistryPanel from '../components/ResidentRegistryPanel'
import AnalyticsDashboard from '../components/AnalyticsDashboard'
import ReliefDistributionPanel from '../components/ReliefDistributionPanel'

export default function AdminPage() {
  return (
    <main className="page-stack">
      <section id="admin-dashboard" className="resident-hero">
        <div>
          <p className="report-subtitle">Admin Dashboard</p>
          <h2>Emergency and announcement center</h2>
          <p>Create alerts and announcements for the community from a single dashboard.</p>
        </div>
      </section>

      <section id="create-alert">
        <AdminAlertPanel />
      </section>
      <section id="announcement-center">
        <AnnouncementAdminPanel />
      </section>
      <section id="analytics-dashboard">
        <AnalyticsDashboard />
      </section>
      <section id="relief-distribution">
        <ReliefDistributionPanel />
      </section>
      <div className="admin-grid">
        <section id="resident-registry">
          <ResidentRegistryPanel />
        </section>
        <section id="community-map">
          <CommunityMap />
        </section>
      </div>
    </main>
  )
}
