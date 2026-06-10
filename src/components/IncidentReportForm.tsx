import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Send } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { createIncidentReport, fetchIncidentReportsForUser, uploadIncidentPhoto } from '../lib/incident'

const defaultCoordinates = { latitude: 14.5995, longitude: 120.9842 }

export default function IncidentReportForm() {
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [address, setAddress] = useState('')
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [reports, setReports] = useState<any[]>([])
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data?.session?.user?.id ?? null)
    })
  }, [])

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

  useEffect(() => {
    if (!userId) return

    fetchIncidentReportsForUser(userId).then(({ data, error }) => {
      if (!error && data) {
        setReports(data)
      }
    })
  }, [userId])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage(null)
    setStatusMessage(null)

    if (!userId) {
      setErrorMessage('Unable to determine your profile. Please refresh and try again.')
      return
    }

    if (!description.trim()) {
      setErrorMessage('Add a description before submitting the report.')
      return
    }

    if (!address.trim()) {
      setErrorMessage('Enter the incident address.')
      return
    }

    setLoading(true)

    try {
      let imageUrl: string | undefined
      if (file) {
        imageUrl = await uploadIncidentPhoto(userId, file)
      }

      const { error } = await createIncidentReport({
        user_id: userId,
        description: description.trim(),
        image_url: imageUrl,
        latitude: defaultCoordinates.latitude,
        longitude: defaultCoordinates.longitude,
        address: address.trim(),
      })

      if (error) {
        throw error
      }

      setStatusMessage('Incident report submitted successfully. Staff will review it shortly.')
      setDescription('')
      setFile(null)
      setAddress('')
      setReports((current) => [
        {
          id: Date.now(),
          description,
          image_url: imageUrl,
          address: address.trim(),
          status: 'pending',
          created_at: new Date().toISOString(),
        },
        ...current,
      ])
    } catch (error) {
      setErrorMessage((error as Error).message || 'Unable to submit the report.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.section
      id="incident-form"
      className="incident-report-panel"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <div className="report-header">
        <div>
          <p className="report-subtitle">Incident Reporting</p>
          <h2>Submit a new incident</h2>
          <p className="report-copy">
            Upload a photo, describe the issue, and provide the exact address so staff can verify quickly.
          </p>
        </div>
      </div>

      <form className="report-form" onSubmit={handleSubmit}>
        <label className="form-row">
          <span>Description</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Describe what happened and why it needs attention."
            rows={5}
          />
        </label>

        <label className="form-row">
          <span>Photo upload</span>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => {
              const selected = event.target.files?.[0] ?? null
              setFile(selected)
            }}
          />
          {previewUrl ? (
            <img className="file-preview" src={previewUrl} alt="Selected incident" />
          ) : (
            <small>Optional, but a photo helps verification.</small>
          )}
        </label>

        <label className="form-row">
          <span>Location address</span>
          <input
            type="text"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            placeholder="Enter the exact address of the incident."
          />
          <small>Provide a detailed address so staff can quickly locate and verify the issue.</small>
        </label>

        <div className="report-actions">
          <button type="submit" className="submit-button" disabled={loading}>
            <Send size={16} />
            <span>{loading ? 'Submitting report...' : 'Submit report'}</span>
          </button>
          <span className="status-hint">Staff will verify your report and update the status.</span>
        </div>

        {statusMessage && <p className="success-message">{statusMessage}</p>}
        {errorMessage && <p className="error-message">{errorMessage}</p>}
      </form>

      {reports.length > 0 ? (
        <div className="report-list">
          <h3>Recent submissions</h3>
          {reports.slice(0, 4).map((report) => (
            <motion.div
              key={report.id}
              className="report-card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div>
                <p>{report.description}</p>
                <div className="status-pill">{report.status}</div>
              </div>
              <small>{new Date(report.created_at).toLocaleString()}</small>
            </motion.div>
          ))}
        </div>
      ) : null}
    </motion.section>
  )
}
