import ReliefDistributionPanel from '../../components/ReliefDistributionPanel'

export default function ReliefDistributionPage() {
  return (
    <main className="page-stack">
      <section className="resident-hero">
        <div>
          <p className="report-subtitle">Relief Distribution</p>
          <h2>Beneficiaries and claim tracking</h2>
          <p>Monitor distribution status and export the latest relief distribution list.</p>
        </div>
      </section>

      <ReliefDistributionPanel />
    </main>
  )
}
