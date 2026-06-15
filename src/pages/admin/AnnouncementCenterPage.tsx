import AnnouncementAdminPanel from '../../components/AnnouncementAdminPanel'

export default function AnnouncementCenterPage() {
  return (
    <main className="page-stack">
      <section className="resident-hero">
        <div>
          <p className="report-subtitle">Announcement Center</p>
          <h2>Create announcement</h2>
          <p>Publish announcements for residents with pinning, editing, and deletion support.</p>
        </div>
      </section>

      <AnnouncementAdminPanel />
    </main>
  )
}
