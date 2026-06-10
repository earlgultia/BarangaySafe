import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  fetchDashboardCounts,
  fetchDisasterFrequency,
  fetchIncidentTrends,
  fetchPopulationBreakdown,
  type AlertFrequencyPoint,
  type CategoryPoint,
  type IncidentTrendPoint,
} from '../lib/analytics'
import { fetchReliefDistributions, type ReliefDistributionRecord } from '../lib/relief'

const counterItems = [
  { label: 'Total Residents', key: 'totalResidents' },
  { label: 'Open Incidents', key: 'openIncidents' },
  { label: 'Active Alerts', key: 'activeAlerts' },
  { label: 'Evacuation Centers', key: 'evacuationCenters' },
] as const

function AnimatedCounter({ value }: { value: number }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    let start = 0
    const duration = 500
    const stepTime = Math.max(10, Math.floor(duration / Math.max(value, 1)))
    const increment = Math.ceil(value / (duration / stepTime))
    const interval = window.setInterval(() => {
      start += increment
      if (start >= value) {
        setDisplay(value)
        window.clearInterval(interval)
      } else {
        setDisplay(start)
      }
    }, stepTime)

    return () => window.clearInterval(interval)
  }, [value])

  return <strong>{display}</strong>
}

export default function AnalyticsDashboard() {
  const [counts, setCounts] = useState({ totalResidents: 0, openIncidents: 0, activeAlerts: 0, evacuationCenters: 0 })
  const [incidentTrends, setIncidentTrends] = useState<IncidentTrendPoint[]>([])
  const [disasterFrequency, setDisasterFrequency] = useState<AlertFrequencyPoint[]>([])
  const [populationBreakdown, setPopulationBreakdown] = useState<CategoryPoint[]>([])
  const [reliefDistribution, setReliefDistribution] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [countsResult, incidentResult, disasterResult, populationResult, reliefResult] = await Promise.all([
        fetchDashboardCounts(),
        fetchIncidentTrends(),
        fetchDisasterFrequency(),
        fetchPopulationBreakdown(),
        fetchReliefDistributions(),
      ])

      if (
        'error' in countsResult && countsResult.error ||
        incidentResult.error ||
        disasterResult.error ||
        populationResult.error ||
        reliefResult.error
      ) {
        setError('Unable to load analytics data. Refresh the page to try again.')
        setLoading(false)
        return
      }

      setCounts({
        totalResidents: countsResult.totalResidents,
        openIncidents: countsResult.openIncidents,
        activeAlerts: countsResult.activeAlerts,
        evacuationCenters: countsResult.evacuationCenters,
      })
      setIncidentTrends(incidentResult.data)
      setDisasterFrequency(disasterResult.data)
      setPopulationBreakdown(populationResult.data)
      setReliefDistribution(
        reliefResult.data.reduce<Record<string, number>>((acc, entry) => {
          const status = entry.claim_status ?? 'Unknown'
          acc[status] = (acc[status] ?? 0) + 1
          return acc
        }, {}),
      )
      setLoading(false)
    }

    void load()
  }, [])

  const reliefChartData = useMemo(
    () => Object.entries(reliefDistribution).map(([status, count]) => ({ status, count })),
    [reliefDistribution],
  )

  const populationChartData = useMemo(
    () => populationBreakdown.map((item) => ({ name: item.category, value: item.count })),
    [populationBreakdown],
  )

  return (
    <section className="analytics-dashboard">
      <div className="panel-header">
        <div>
          <p className="report-subtitle">Analytics dashboard</p>
          <h2>Community incident and relief insights</h2>
          <p>Track trends for incidents, disasters, relief, and population vulnerabilities.</p>
        </div>
      </div>

      {loading ? (
        <div className="alert-empty">Loading analytics…</div>
      ) : error ? (
        <div className="alert-empty">{error}</div>
      ) : (
        <>
          <div className="analytics-counters">
            {counterItems.map((item) => (
              <div key={item.key} className="analytics-counter-card">
                <span>{item.label}</span>
                <AnimatedCounter value={counts[item.key]} />
              </div>
            ))}
          </div>

          <div className="analytics-charts-grid">
            <div className="chart-card">
              <h3>Incident trends</h3>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={incidentTrends} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#7c3aed" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h3>Disaster frequency</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={disasterFrequency} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="alert_type" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#f97316">
                    {disasterFrequency.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#f97316' : '#fb923c'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h3>Relief distribution</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={reliefChartData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2563eb">
                    {reliefChartData.map((entry, index) => (
                      <Cell key={`cell-relief-${index}`} fill={index % 2 === 0 ? '#2563eb' : '#60a5fa'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h3>Population breakdown</h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={populationChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} fill="#8b5cf6" label />
                  <Legend verticalAlign="bottom" height={36} />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </section>
  )
}
