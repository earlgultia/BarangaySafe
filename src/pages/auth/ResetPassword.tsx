import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Lock, CheckCircle, AlertCircle } from 'lucide-react'
import { ThemeToggle } from '../../components/ThemeToggle'
import { supabase } from '../../lib/supabase'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState<string | null>(null)
  const [tokenValid, setTokenValid] = useState(true)

  useEffect(() => {
    // Check if user has a valid session from the reset link
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        setTokenValid(false)
        setMessage('Reset link is invalid or expired. Please request a new one.')
      }
    }

    checkSession()
  }, [])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(null)
    setStatus('loading')

    // Validate passwords
    if (password !== confirmPassword) {
      setStatus('error')
      setMessage('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setStatus('error')
      setMessage('Password must be at least 8 characters')
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) {
        setStatus('error')
        setMessage(error.message)
        return
      }

      setStatus('success')
      setMessage('Password updated successfully!')
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/auth/login')
      }, 2000)
    } catch (err) {
      setStatus('error')
      setMessage('An unexpected error occurred. Please try again.')
    }
  }

  if (!tokenValid) {
    return (
      <main className="auth-page">
        <section className="auth-shell">
          <motion.aside
            className="auth-brand-panel"
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            <div className="auth-brand">
              <div className="brand-icon">
                <Lock size={22} />
              </div>
              <div>
                <strong>SafeBarangay</strong>
                <span>Community Emergency System</span>
              </div>
            </div>

            <div className="auth-brand-copy">
              <p className="report-subtitle">Reset password</p>
              <h1>Invalid or expired link</h1>
              <p>Your reset link has expired. Request a new one to continue.</p>
            </div>
          </motion.aside>

          <motion.section
            className="auth-card"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut', delay: 0.08 }}
          >
            <div className="auth-card-header auth-card-header-top">
              <div>
                <p className="report-subtitle">Link expired</p>
                <h2>Request a new reset link</h2>
              </div>
              <ThemeToggle />
            </div>

            <div className="auth-card-actions">
              <Link to="/auth/forgot-password" className="submit-button">
                <span>Request new reset link</span>
                <ArrowRight size={18} />
              </Link>
            </div>

            <div className="auth-card-footer">
              <Link to="/auth/login">Return to sign in</Link>
            </div>
          </motion.section>
        </section>
      </main>
    )
  }

  return (
    <main className="auth-page">
      <section className="auth-shell">
        <motion.aside
          className="auth-brand-panel"
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          <div className="auth-brand">
            <div className="brand-icon">
              <Lock size={22} />
            </div>
            <div>
              <strong>SafeBarangay</strong>
              <span>Community Emergency System</span>
            </div>
          </div>

          <div className="auth-brand-copy">
            <p className="report-subtitle">Reset password</p>
            <h1>Create new password</h1>
            <p>Set a new strong password to secure your account and regain access.</p>
          </div>

          <div className="auth-metric-row">
            <div className="auth-metric">
              <strong>Strong</strong>
              <span>Password</span>
            </div>
            <div className="auth-metric">
              <strong>Confirm</strong>
              <span>Match</span>
            </div>
            <div className="auth-metric">
              <strong>Secure</strong>
              <span>Access</span>
            </div>
          </div>
        </motion.aside>

        <motion.section
          className="auth-card"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut', delay: 0.08 }}
        >
          <div className="auth-card-header auth-card-header-top">
            <div>
              <p className="report-subtitle">Reset password</p>
              <h2>Set your new password</h2>
              <p>Choose a strong password with at least 8 characters.</p>
            </div>
            <ThemeToggle />
          </div>

          {status === 'success' ? (
            <div className="auth-success-message">
              <CheckCircle size={24} />
              <p>{message}</p>
              <p className="text-muted">Redirecting to login...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <label>
                <span>New Password</span>
                <div className="auth-field">
                  <Lock size={18} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    required
                  />
                </div>
              </label>

              <label>
                <span>Confirm Password</span>
                <div className="auth-field">
                  <Lock size={18} />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    required
                  />
                </div>
              </label>

              {status === 'error' && message && (
                <div className="auth-error-message">
                  <AlertCircle size={16} />
                  <span>{message}</span>
                </div>
              )}

              <button className="submit-button" type="submit" disabled={status === 'loading'}>
                <span>{status === 'loading' ? 'Updating password...' : 'Update password'}</span>
                <ArrowRight size={18} />
              </button>
            </form>
          )}

          <div className="auth-card-footer">
            <Link to="/auth/login">Back to sign in</Link>
          </div>
        </motion.section>
      </section>
    </main>
  )
}
