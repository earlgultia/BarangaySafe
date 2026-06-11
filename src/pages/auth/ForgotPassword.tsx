import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Mail } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setStatus(null)
    setLoading(true)

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/login`,
    })

    setLoading(false)

    if (resetError) {
      setError(resetError.message)
      return
    }

    setStatus('Password reset email sent. Check your inbox and follow the instructions.')
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
              <p className="report-subtitle">Forgot password</p>
              <h2>Send reset email</h2>
              <p>Enter the email address connected to your account.</p>
            </div>
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
            <button className="submit-button" type="submit" disabled={loading}>
              <span>{loading ? 'Sending reset email...' : 'Send reset email'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {status && <p className="status-message">{status}</p>}
          {error && <p className="error-message">{error}</p>}

          <div className="auth-links">
            <Link to="/auth/login">Back to login</Link>
          </div>
        </motion.section>
      </section>
    </main>
  )
}
