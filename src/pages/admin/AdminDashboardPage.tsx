export default function AdminDashboardPage() {
  return (
    <main className="page-stack">
      <section className="resident-hero">
        <div>
          <p className="report-subtitle">Admin Dashboard</p>
          <h2>Overview</h2>
          <p>Monitor alerts, announcements, relief operations, and community updates from one place.</p>
        </div>
      </section>

      <section className="card-grid">
        <article className="panel-card">
          <h3>Current Situation</h3>
          <p>Stay updated on the latest emergency conditions and community response priorities.</p>
        </article>
        <article className="panel-card">
          <h3>Announcements</h3>
          <p>Share updates, reminders, and critical information with residents quickly.</p>
        </article>
        <article className="panel-card">
          <h3>Relief Tracking</h3>
          <p>Review beneficiary progress and ensure aid distribution remains on schedule.</p>
        </article>
      </section>

      <section className="panel-card">
        <h3>Quick overview</h3>
        <p>Use the sidebar to jump to alerts, announcements, analytics, registry, relief, and map views for deeper management.</p>
      </section>
    </main>
  )
}
