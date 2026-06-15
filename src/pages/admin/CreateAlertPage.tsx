import AdminAlertPanel from '../../components/AdminAlertPanel'

export default function CreateAlertPage() {
  return (
    <main className="page-stack">
      <section className="resident-hero">
        <div>
          <p className="report-subtitle">Create Alert</p>
          <h2>Emergency alert center</h2>
          <p>Publish a new alert with the correct category and mark critical alerts to elevate them to fullscreen.</p>
        </div>
      </section>

      <AdminAlertPanel />
    </main>
  )
}
