import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Send } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { createIncidentReport, fetchIncidentReportsForUser, uploadIncidentPhoto } from '../lib/incident'

const defaultCoordinates = { latitude: 14.5995, longitude: 120.9842 }

export default function IncidentReportForm() {
  const { user } = useAuth()
  const [description, setDescription] = useState('')
  const [incidentType, setIncidentType] = useState('other')
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [address, setAddress] = useState('')
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [reports, setReports] = useState<any[]>([])
  

  useEffect(() => {
    if (!user?.id) return

    fetchIncidentReportsForUser(user.id).then(({ data, error }) => {
      if (!error && data) {
        setReports(data)
      }
    })
  }, [user?.id])

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage(null)
    setStatusMessage(null)

    if (!user?.id) {
      setErrorMessage('Unable to determine your profile. Please refresh and try again.')
      return
    }

    if (!description.trim()) {
      setErrorMessage('Add a description before submitting the report.')
      return
    }

    if (!incidentType) {
      setErrorMessage('Select an incident type.')
      return
    }

    if (!address.trim()) {
      setErrorMessage('Enter the incident address.')
      return
    }

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) {
      console.error('Session check failed:', sessionError)
      setErrorMessage('Unable to verify your authentication session. Please refresh and try again.')
      return
    }

    const sessionUserId = sessionData?.session?.user?.id
    if (!sessionUserId) {
      setErrorMessage('Your authentication session is no longer valid. Please sign out and sign back in.')
      return
    }

    if (sessionUserId !== user.id) {
      console.error('Auth mismatch:', { sessionUserId, contextUserId: user.id })
      setErrorMessage('Authentication mismatch detected. Please refresh and try again.')
      return
    }

    setLoading(true)

    try {
      let imageUrl: string | undefined
      if (file) {
        try {
          const uploaded = await uploadIncidentPhoto(sessionUserId, file)
          if (uploaded === undefined) {
            setErrorMessage('Photo upload bucket not available. Continuing without image.')
            imageUrl = undefined
          } else {
            imageUrl = uploaded
          }
        } catch (uploadErr) {
          console.error('Photo upload error:', uploadErr)
          setErrorMessage((uploadErr as Error).message || 'Photo upload failed. Please try again.')
          setLoading(false)
          return
        }
      }

      const { error } = await createIncidentReport({
        user_id: sessionUserId,
        incident_type: incidentType,
        description: description.trim(),
        image_url: imageUrl,
        latitude: defaultCoordinates.latitude,
        longitude: defaultCoordinates.longitude,
        location: address.trim(),
      })

      if (error) {
        throw error
      }

      setStatusMessage('Incident report submitted successfully. Staff will review it shortly.')
      setDescription('')
      setIncidentType('other')
      setFile(null)
      setAddress('')
      setReports((current) => [
        {
          id: Date.now(),
          description,
          photo_urls: imageUrl ? [imageUrl] : null,
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
          <span>Incident type</span>
          <select
            value={incidentType}
            onChange={(event) => setIncidentType(event.target.value)}
            required
          >
            <option value="">Select an incident type</option>
            <option value="fire">Fire</option>
            <option value="flooding">Flooding</option>
            <option value="fallen_trees">Fallen Trees</option>
            <option value="landslide">Landslide</option>
            <option value="missing_persons">Missing Persons</option>
            <option value="damaged_infrastructure">Damaged Infrastructure</option>
            <option value="medical_emergency">Medical Emergency</option>
            <option value="other">Other</option>
          </select>
        </label>

        <label className="form-row">
          <span>Description</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Describe what happened and why it needs attention."
            rows={5}
            required
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
