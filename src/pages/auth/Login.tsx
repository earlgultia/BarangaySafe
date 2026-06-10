import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, LockKeyhole, Mail, RotateCcw } from 'lucide-react'
import { ThemeToggle } from '../../components/ThemeToggle'
import { supabase } from '../../lib/supabase'
import { fetchProfileRole, getRouteForRole } from '../../lib/auth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setStatus(null)
    setLoading(true)

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (signInError) {
      setError(signInError.message)
      return
    }

    const user = data.user
    if (!user) {
      setStatus('Check your email for a login link or verification message.')
      return
    }

    if (!user.email_confirmed_at) {
      setStatus('Email verification is required. Please confirm your email before continuing.')
      return
    }

    const role = await fetchProfileRole(user.id)
    if (!role) {
      setError('No role found for this account. Contact support.')
      return
    }

    navigate(getRouteForRole(role))
  }

  async function handleResendVerification() {
    setLoading(true)
    setError(null)
    setStatus(null)

    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email,
    })

    setLoading(false)

    if (resendError) {
      setError(resendError.message)
      return
    }

    setStatus('Verification email resent. Check your inbox.')
  }

  return (
    <main className="auth-page">
      <section className="auth-shell auth-shell-single">
        <motion.section
          className="auth-card"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut', delay: 0.08 }}
        >
          <div className="auth-card-header auth-card-header-top">
            <div>
              <p className="report-subtitle">Sign in</p>
              <h2>Access your dashboard</h2>
              <p>Use your verified account email and password.</p>
            </div>
            <ThemeToggle />
          </div>

          <form onSubmit={handleSubmit}>
            <label>
              <span>Email</span>
              <div className="auth-field">
                <Mail size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
            </label>
            <label>
              <span>Password</span>
              <div className="auth-field">
                <LockKeyhole size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>
            </label>
            <button className="submit-button" type="submit" disabled={loading}>
              <span>{loading ? 'Signing in...' : 'Sign in'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {status && <p className="status-message">{status}</p>}
          {error && <p className="error-message">{error}</p>}

          <div className="auth-links">
            <Link to="/auth/register">Create an account</Link>
            <Link to="/auth/forgot-password">Forgot password?</Link>
          </div>

          <button
            className="auth-secondary-button"
            type="button"
            onClick={handleResendVerification}
            disabled={loading || !email}
          >
            <RotateCcw size={16} />
            <span>Resend verification email</span>
          </button>
        </motion.section>
      </section>
    </main>
  )
}
