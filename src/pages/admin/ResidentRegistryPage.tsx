import ResidentRegistryPanel from '../../components/ResidentRegistryPanel'

export default function ResidentRegistryPage() {
  return (
    <main className="page-stack">
      <section className="resident-hero">
        <div>
          <p className="report-subtitle">Resident Registry</p>
          <h2>Population analytics</h2>
          <p>Track total residents, vulnerable populations, and family distribution by purok.</p>
        </div>
      </section>

      <ResidentRegistryPanel />
    </main>
  )
}
