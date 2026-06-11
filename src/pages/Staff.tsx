import StaffVerificationPanel from '../components/StaffVerificationPanel'

export default function StaffPage() {
  return (
    <main className="page-stack">
      <div className="resident-hero">
        <div>
          <p className="report-subtitle">Staff Dashboard</p>
          <h2>Incident verification</h2>
          <p>Review incoming incident requests and keep resident reports moving through verification, response, and resolution.</p>
        </div>
      </div>

      <StaffVerificationPanel />
    </main>
  )
}
