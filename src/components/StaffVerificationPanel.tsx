import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, MessageSquare, ShieldCheck, Circle, RefreshCcw } from 'lucide-react'
import { supabase } from '../lib/supabase'
import {
  addIncidentUpdate,
  fetchIncidentReportsByStatus,
  updateIncidentReportStatus,
} from '../lib/incident'

const statusLabels = {
  pending: 'Pending',
  verified: 'Verified',
  resolved: 'Resolved',
  rejected: 'Rejected',
}

const statusColors = {
  pending: 'var(--accent)',
  verified: '#0ea5e9',
  resolved: '#16a34a',
  rejected: '#ef4444',
}

type IncidentReport = {
  id: number
  user_id: string
  description: string
  image_url?: string
  latitude: number
  longitude: number
  status: string
  created_at: string
}

const tabs = [
  { value: 'pending', label: 'Pending Reports' },
  { value: 'verified', label: 'Verified Reports' },
  { value: 'resolved', label: 'Resolved Reports' },
]

export default function StaffVerificationPanel() {
  const [activeTab, setActiveTab] = useState('pending')
  const [pendingReports, setPendingReports] = useState<IncidentReport[]>([])
  const [verifiedReports, setVerifiedReports] = useState<IncidentReport[]>([])
  const [resolvedReports, setResolvedReports] = useState<IncidentReport[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [responseDrafts, setResponseDrafts] = useState<Record<number, string>>({})

  const activeReports = useMemo(() => {
    switch (activeTab) {
      case 'verified':
        return verifiedReports
      case 'resolved':
        return resolvedReports
      default:
        return pendingReports
    }
  }, [activeTab, pendingReports, verifiedReports, resolvedReports])

  async function loadReports() {
    setLoading(true)
    setError(null)

    try {
      const [pending, verified, resolved] = await Promise.all([
        fetchIncidentReportsByStatus('pending'),
        fetchIncidentReportsByStatus('verified'),
        fetchIncidentReportsByStatus('resolved'),
      ])

      if (pending.error || verified.error || resolved.error) {
        throw new Error('Unable to load incident reports.')
      }

      setPendingReports(pending.data ?? [])
      setVerifiedReports(verified.data ?? [])
      setResolvedReports(resolved.data ?? [])
    } catch (error) {
      setError((error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReports()

    const channel = supabase
      .channel('incident_reports_updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'incident_reports' },
        () => {
          loadReports()
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [])

  async function handleStatusChange(reportId: number, status: string, actionLabel: string) {
    setError(null)
    setLoading(true)

    try {
      const { error: statusError } = await updateIncidentReportStatus(reportId, status)
      if (statusError) {
        throw statusError
      }

      await addIncidentUpdate(reportId, `${actionLabel} by staff.`, status)
      await loadReports()
    } catch (error) {
      setError((error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  async function handleRespond(event: FormEvent<HTMLFormElement>, report: IncidentReport) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    const message = responseDrafts[report.id]?.trim() ?? ''
    if (!message) {
      setError('Type a response before submitting.')
      setLoading(false)
      return
    }

    try {
      await addIncidentUpdate(report.id, message, report.status)
      setResponseDrafts((current) => ({ ...current, [report.id]: '' }))
      await loadReports()
    } catch (error) {
      setError((error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="staff-verification-panel">
      <div className="staff-panel-header">
        <div>
          <p className="report-subtitle">Verification panel</p>
          <h2>Staff incident review</h2>
          <p>Monitor new reports, verify details, respond to residents, and resolve issues in real time.</p>
        </div>
        <button className="refresh-button" onClick={loadReports} type="button">
          <RefreshCcw size={16} /> Refresh
        </button>
      </div>

      <div className="report-tabs">
        {tabs.map((tab) => {
          const count =
            tab.value === 'pending'
              ? pendingReports.length
              : tab.value === 'verified'
              ? verifiedReports.length
              : resolvedReports.length

          return (
            <button
              key={tab.value}
              type="button"
              className={`tab-button ${activeTab === tab.value ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.value)}
            >
              <span>{tab.label}</span>
              <strong>{count}</strong>
            </button>
          )
        })}
      </div>

      {error ? <p className="error-message">{error}</p> : null}

      <div className="report-list-grid">
        {loading ? (
          <div className="report-empty">Loading reports...</div>
        ) : activeReports.length === 0 ? (
          <div className="report-empty">No reports available in this category.</div>
        ) : (
          activeReports.map((report) => (
            <motion.article
              key={report.id}
              className="report-card"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="report-card-main">
                <div className="report-card-meta">
                  <span className="status-badge" style={{ background: statusColors[report.status] }}>
                    {statusLabels[report.status] ?? report.status}
                  </span>
                  <small>{new Date(report.created_at).toLocaleString()}</small>
                </div>
                <p>{report.description}</p>
                <div className="report-location">
                  <Circle size={14} />
                  <span>
                    {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
                  </span>
                </div>
                {report.image_url ? (
                  <img className="report-image" src={report.image_url} alt="Incident evidence" />
                ) : null}
              </div>

              <div className="report-card-actions">
                {report.status === 'pending' ? (
                  <>
                    <button
                      type="button"
                      className="action-button verify"
                      onClick={() => handleStatusChange(report.id, 'verified', 'Verified')}
                    >
                      <CheckCircle2 size={16} /> Verify
                    </button>
                    <button
                      type="button"
                      className="action-button reject"
                      onClick={() => handleStatusChange(report.id, 'rejected', 'Rejected')}
                    >
                      <XCircle size={16} /> Reject
                    </button>
                  </>
                ) : null}
                {report.status !== 'resolved' ? (
                  <button
                    type="button"
                    className="action-button resolve"
                    onClick={() => handleStatusChange(report.id, 'resolved', 'Resolved')}
                  >
                    <ShieldCheck size={16} /> Resolve
                  </button>
                ) : null}
              </div>

              <form className="response-form" onSubmit={(event) => handleRespond(event, report)}>
                <label>
                  <span>Respond to resident</span>
                  <textarea
                    value={responseDrafts[report.id] ?? ''}
                    placeholder="Add a response message..."
                    onChange={(event) =>
                      setResponseDrafts((current) => ({ ...current, [report.id]: event.target.value }))
                    }
                    rows={3}
                  />
                </label>
                <button type="submit" className="submit-button" disabled={loading}>
                  <MessageSquare size={16} /> Send response
                </button>
              </form>
            </motion.article>
          ))
        )}
      </div>
    </section>
  )
}
