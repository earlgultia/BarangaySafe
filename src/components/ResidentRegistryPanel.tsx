import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { fetchHouseholds, fetchTotalResidents, fetchVulnerableResidents } from '../lib/registry'

type FamilyCountPerPurok = {
  purok: string
  families: number
}

export default function ResidentRegistryPanel() {
  const [households, setHouseholds] = useState<Array<{ id: number; family_name: string; purok: string }>>([])
  const [vulnerableResidents, setVulnerableResidents] = useState<Array<{ id: number; name: string; vulnerable_type: string; purok: string }>>([])
  const [totalResidents, setTotalResidents] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadRegistry() {
      setLoading(true)
      const [householdResult, vulnerableResult, totalResult] = await Promise.all([
        fetchHouseholds(),
        fetchVulnerableResidents(),
        fetchTotalResidents(),
      ])

      if (householdResult.error || vulnerableResult.error || totalResult.error) {
        setError('Unable to load resident registry analytics. Please refresh.')
        setLoading(false)
        return
      }

      setHouseholds(householdResult.data ?? [])
      setVulnerableResidents(vulnerableResult.data ?? [])
      setTotalResidents(totalResult.count ?? 0)
      setLoading(false)
    }

    void loadRegistry()
  }, [])

  const familiesPerPurok = useMemo<FamilyCountPerPurok[]>(() => {
    const counts = households.reduce<Record<string, number>>((acc, household) => {
      acc[household.purok] = (acc[household.purok] ?? 0) + 1
      return acc
    }, {})

    return Object.entries(counts)
      .map(([purok, families]) => ({ purok, families }))
      .sort((a, b) => a.purok.localeCompare(b.purok))
  }, [households])

  return (
    <motion.section
      className="registry-panel"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <div className="panel-header">
        <div>
          <p className="report-subtitle">Resident registry</p>
          <h2>Population analytics</h2>
          <p>Track total residents, vulnerable populations, and family distribution by purok.</p>
        </div>
      </div>

      {loading ? (
        <div className="alert-empty">Loading registry metrics…</div>
      ) : error ? (
        <div className="alert-empty">{error}</div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <span>Total Residents</span>
              <strong>{totalResidents}</strong>
            </div>
            <div className="stat-card">
              <span>Vulnerable Residents</span>
              <strong>{vulnerableResidents.length}</strong>
            </div>
            <div className="stat-card">
              <span>Households Registered</span>
              <strong>{households.length}</strong>
            </div>
          </div>

          <div className="registry-analytics-card">
            <div className="card-title">
              <h3>Families per purok</h3>
              <p>Distribution of registered households by purok.</p>
            </div>
            <div className="purok-list">
              {familiesPerPurok.map((row) => (
                <div key={row.purok} className="purok-row">
                  <span>{row.purok}</span>
                  <strong>{row.families}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="vulnerable-list-card">
            <div className="card-title">
              <h3>Vulnerable households</h3>
              <p>Recent vulnerable population entries.</p>
            </div>
            <div className="vulnerable-list">
              {vulnerableResidents.slice(0, 6).map((resident) => (
                <div key={resident.id} className="vulnerable-row">
                  <span>{resident.name}</span>
                  <span>{resident.vulnerable_type}</span>
                  <strong>{resident.purok}</strong>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </motion.section>
  )
}
