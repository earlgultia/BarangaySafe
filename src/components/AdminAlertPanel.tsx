import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Megaphone, Trash2 } from 'lucide-react'
import { createEmergencyAlert, deleteEmergencyAlert, fetchActiveAlerts, type EmergencyAlert, type EmergencyAlertType } from '../lib/alerts'

const alertTypes: EmergencyAlertType[] = [
  'Typhoon',
  'Flood',
  'Earthquake',
  'Fire',
  'Landslide',
  'Tsunami',
  'Storm Surge',
  'Disease Outbreak',
  'Other',
]

export default function AdminAlertPanel() {
  const [type, setType] = useState<EmergencyAlertType>('Typhoon')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [critical, setCritical] = useState(false)
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([])
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [removingId, setRemovingId] = useState<number | null>(null)

  async function loadAlerts() {
    const { data, error } = await fetchActiveAlerts()
    if (!error && data) {
      setAlerts(data)
    }
  }

  useEffect(() => {
    loadAlerts()
  }, [])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage(null)
    setStatusMessage(null)

    if (!title.trim() || !description.trim()) {
      setErrorMessage('Title and description are required.')
      return
    }

    setLoading(true)
    const { error } = await createEmergencyAlert({
      alert_type: type,
      title: title.trim(),
      description: description.trim(),
      critical,
    })

    setLoading(false)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    setStatusMessage('Alert created successfully.')
    setTitle('')
    setDescription('')
    setCritical(false)
    await loadAlerts()
  }

  async function handleRemoveAlert(id: number) {
    setErrorMessage(null)
    setStatusMessage(null)
    setRemovingId(id)

    const { error } = await deleteEmergencyAlert(id)
    setRemovingId(null)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    setStatusMessage('Alert removed successfully.')
    await loadAlerts()
  }

  return (
    <motion.section
      className="admin-alert-panel"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="alert-panel-header">
        <div>
          <p className="report-subtitle">Create Alert</p>
          <h2>Emergency alert center</h2>
          <p>Publish a new alert with the correct category. Mark critical alerts to elevate them to fullscreen.</p>
        </div>
      </div>

      <form className="alert-form" onSubmit={handleSubmit}>
        <label>
          <span>Alert type</span>
          <select value={type} onChange={(event) => setType(event.target.value as EmergencyAlertType)}>
            {alertTypes.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Title</span>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Enter alert headline"
          />
        </label>

        <label>
          <span>Description</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Describe the alert and any immediate actions needed."
            rows={4}
          />
        </label>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={critical}
            onChange={(event) => setCritical(event.target.checked)}
          />
          <span>Mark as critical fullscreen alert</span>
        </label>

        <button type="submit" className="submit-button" disabled={loading}>
          <Megaphone size={16} />
          <span>{loading ? 'Publishing alert...' : 'Create Alert'}</span>
        </button>

        {statusMessage ? <p className="success-message">{statusMessage}</p> : null}
        {errorMessage ? <p className="error-message">{errorMessage}</p> : null}
      </form>

      <div className="alert-list">
        <h3>Active alerts</h3>
        {alerts.length === 0 ? (
          <p>No active alerts at the moment.</p>
        ) : (
          <div className="alert-list-grid">
            {alerts.map((alert) => (
              <article key={alert.id} className="alert-card">
                <div>
                  <span className="alert-type">{alert.alert_type}</span>
                  {alert.critical ? <span className="alert-pill critical">Critical</span> : null}
                </div>
                <h4>{alert.title}</h4>
                <p>{alert.description}</p>
                <button
                  type="button"
                  className="submit-button"
                  style={{ marginTop: '0.85rem', width: 'fit-content' }}
                  onClick={() => handleRemoveAlert(alert.id)}
                  disabled={removingId === alert.id}
                >
                  <Trash2 size={16} />
                  <span>{removingId === alert.id ? 'Removing...' : 'Remove'}</span>
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </motion.section>
  )
}
