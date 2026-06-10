import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, LockKeyhole, Mail } from 'lucide-react'
import { ThemeToggle } from '../../components/ThemeToggle'
import { supabase } from '../../lib/supabase'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setStatus(null)
    setLoading(true)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/login`,
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data?.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email,
        role: 'resident',
      })

      setStatus('Registration successful. Check your email to verify your account.')
    }

    setLoading(false)
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
              <p className="report-subtitle">Register</p>
              <h2>Create resident account</h2>
              <p>Use an active email address for verification.</p>
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
              <span>{loading ? 'Creating account...' : 'Register'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {status && <p className="status-message">{status}</p>}
          {error && <p className="error-message">{error}</p>}

          <div className="auth-links">
            <Link to="/auth/login">Already have an account?</Link>
          </div>
        </motion.section>
      </section>
    </main>
  )
}
