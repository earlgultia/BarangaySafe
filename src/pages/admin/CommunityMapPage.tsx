import CommunityMap from '../../components/CommunityMap'

export default function CommunityMapPage() {
  return (
    <main className="page-stack">
      <section className="resident-hero">
        <div>
          <p className="report-subtitle">Community Map</p>
          <h2>Layered hazard and shelter map</h2>
          <p>Toggle evacuation centers, flood areas, landslide zones, assembly points, and incident reports.</p>
        </div>
      </section>

      <CommunityMap />
    </main>
  )
}
