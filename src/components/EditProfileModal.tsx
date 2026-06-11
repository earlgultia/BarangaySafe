import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader } from 'lucide-react'
import { fetchUserProfile, updateUserProfile, type UserProfile } from '../lib/auth'
import { useAuth } from '../contexts/AuthContext'

interface EditProfileModalProps {
  open: boolean
  onClose: () => void
}

export default function EditProfileModal({ open, onClose }: EditProfileModalProps) {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    address: '',
    phone: '',
  })

  useEffect(() => {
    if (open && user) {
      loadProfile()
    }
  }, [open, user])

  async function loadProfile() {
    if (!user?.id) return
    setLoading(true)
    const profileData = await fetchUserProfile(user.id)
    setLoading(false)

    if (profileData) {
      setProfile(profileData)
      setFormData({
        full_name: profileData.full_name || '',
        email: profileData.email || '',
        address: profileData.address || '',
        phone: profileData.phone || '',
      })
    }
  }

  async function handleSave() {
    if (!user?.id) return

    setErrorMessage('')
    setSuccessMessage('')

    if (!formData.full_name.trim()) {
      setErrorMessage('Full name is required.')
      return
    }

    if (!formData.address.trim()) {
      setErrorMessage('Address is required.')
      return
    }

    setSaving(true)
    const result = await updateUserProfile(user.id, {
      full_name: formData.full_name.trim(),
      address: formData.address.trim(),
      phone: formData.phone.trim(),
    })
    setSaving(false)

    if (result.success) {
      setSuccessMessage('Profile updated successfully!')
      setTimeout(() => {
        onClose()
        setSuccessMessage('')
      }, 1500)
    } else {
      const errorMsg = result.error?.message || 'Failed to update profile. Please try again.'
      console.error('Profile update error:', result.error)
      setErrorMessage(errorMsg)
    }
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="edit-profile-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="edit-profile-modal"
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <div className="modal-header">
              <h2>Edit Profile</h2>
              <button
                type="button"
                className="close-button"
                onClick={onClose}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {loading ? (
              <div className="modal-loading">
                <Loader size={24} className="spinner" />
                <p>Loading profile...</p>
              </div>
            ) : (
              <div className="modal-content">
                <form onSubmit={(e) => { e.preventDefault(); void handleSave() }}>
                  <div className="form-group">
                    <label htmlFor="full_name">Full Name *</label>
                    <input
                      id="full_name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.full_name}
                      onChange={(e) =>
                        setFormData({ ...formData, full_name: e.target.value })
                      }
                      disabled={saving}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      id="email"
                      type="email"
                      placeholder="Your email"
                      value={formData.email}
                      disabled
                    />
                    <small>Email cannot be changed</small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="address">Address *</label>
                    <input
                      id="address"
                      type="text"
                      placeholder="Enter your residential address"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      disabled={saving}
                    />
                    <small>Used to find nearest evacuation centers</small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">Phone</label>
                    <input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      disabled={saving}
                    />
                  </div>

                  {errorMessage && (
                    <div className="alert-error">
                      {errorMessage}
                    </div>
                  )}

                  {successMessage && (
                    <div className="alert-success">
                      {successMessage}
                    </div>
                  )}

                  <div className="modal-actions">
                    <button
                      type="button"
                      className="button-outline"
                      onClick={onClose}
                      disabled={saving}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="submit-button"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <Loader size={16} className="spinner" />
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
