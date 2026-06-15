import AnalyticsDashboard from '../../components/AnalyticsDashboard'

export default function AnalyticsDashboardPage() {
  return (
    <main className="page-stack">
      <section className="resident-hero">
        <div>
          <p className="report-subtitle">Analytics Dashboard</p>
          <h2>Community incident and relief insights</h2>
          <p>Track trends for incidents, disasters, relief, and population vulnerabilities.</p>
        </div>
      </section>

      <AnalyticsDashboard />
    </main>
  )
}
