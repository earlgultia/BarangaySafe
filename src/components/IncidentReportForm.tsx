import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Send, Trash2, Edit3, Save } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import {
  createIncidentReport,
  deleteIncidentReport,
  fetchIncidentReportsForUser,
  updateIncidentReport,
  uploadIncidentPhoto,
} from '../lib/incident'

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
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editDescription, setEditDescription] = useState('')
  const [editIncidentType, setEditIncidentType] = useState('other')
  const [editAddress, setEditAddress] = useState('')
  const [editLoading, setEditLoading] = useState(false)

  async function loadReports() {
    if (!user?.id) return

    const { data, error } = await fetchIncidentReportsForUser(user.id)
    if (!error && data) {
      setReports(data)
    }
  }

  useEffect(() => {
    void loadReports()
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

  async function resolveCoordinates(addressValue: string) {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          })
        })

        return {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }
      } catch {
        // Fall back to geocoding below.
      }
    }

    if (addressValue.trim()) {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(addressValue)}`,
          {
            headers: {
              'Accept-Language': 'en',
            },
          },
        )

        const data = await response.json()
        if (Array.isArray(data) && data[0]) {
          return {
            latitude: Number(data[0].lat),
            longitude: Number(data[0].lon),
          }
        }
      } catch {
        // Fall back to the default coordinates.
      }
    }

    return defaultCoordinates
  }

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

      const coordinates = await resolveCoordinates(address.trim())

      const { error } = await createIncidentReport({
        user_id: sessionUserId,
        incident_type: incidentType,
        description: description.trim(),
        image_url: imageUrl,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
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
      await loadReports()
    } catch (error) {
      setErrorMessage((error as Error).message || 'Unable to submit the report.')
    } finally {
      setLoading(false)
    }
  }

  async function handleStartEditing(report: any) {
    setEditingId(report.id)
    setEditDescription(report.description ?? '')
    setEditIncidentType(report.incident_type ?? 'other')
    setEditAddress(report.location ?? '')
  }

  async function handleUpdateReport(reportId: number) {
    if (!editDescription.trim()) {
      setErrorMessage('Description cannot be empty.')
      return
    }

    setEditLoading(true)
    const { error } = await updateIncidentReport({
      id: reportId,
      incident_type: editIncidentType,
      description: editDescription.trim(),
      location: editAddress.trim(),
    })
    setEditLoading(false)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    setEditingId(null)
    await loadReports()
  }

  async function handleDeleteReport(reportId: number) {
    setErrorMessage(null)
    setStatusMessage(null)
    setLoading(true)
    const { error } = await deleteIncidentReport(reportId)
    setLoading(false)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    setReports((current) => current.filter((report) => report.id !== reportId))
    setEditingId((current) => (current === reportId ? null : current))
    setStatusMessage('Incident report removed successfully.')
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
              {editingId === report.id ? (
                <div className="edit-panel">
                  <select value={editIncidentType} onChange={(event) => setEditIncidentType(event.target.value)}>
                    <option value="fire">Fire</option>
                    <option value="flooding">Flooding</option>
                    <option value="fallen_trees">Fallen Trees</option>
                    <option value="landslide">Landslide</option>
                    <option value="missing_persons">Missing Persons</option>
                    <option value="damaged_infrastructure">Damaged Infrastructure</option>
                    <option value="medical_emergency">Medical Emergency</option>
                    <option value="other">Other</option>
                  </select>
                  <textarea
                    rows={3}
                    value={editDescription}
                    onChange={(event) => setEditDescription(event.target.value)}
                  />
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(event) => setEditAddress(event.target.value)}
                    placeholder="Update the incident address"
                  />
                  <div className="announcement-card-actions">
                    <button type="button" className="action-button verify" onClick={() => void handleUpdateReport(report.id)} disabled={editLoading}>
                      <Save size={16} /> {editLoading ? 'Saving...' : 'Save'}
                    </button>
                    <button type="button" className="action-button reject" onClick={() => setEditingId(null)}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <p>{report.description}</p>
                    <div className="status-pill">{report.status}</div>
                    {report.location ? <small className="card-note">{report.location}</small> : null}
                  </div>
                  <div className="announcement-card-actions">
                    <button type="button" className="action-button verify" onClick={() => void handleStartEditing(report)}>
                      <Edit3 size={16} /> Edit
                    </button>
                    <button type="button" className="action-button reject" onClick={() => void handleDeleteReport(report.id)}>
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                  <small>{new Date(report.created_at).toLocaleString()}</small>
                </>
              )}
            </motion.div>
          ))}
        </div>
      ) : null}
    </motion.section>
  )
}
