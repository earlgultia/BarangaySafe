import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { supabase } from '../lib/supabase'
import StaffVerificationPanel from '../components/StaffVerificationPanel'

export default function StaffPage() {
  const navigate = useNavigate()

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/auth/login')
  }

  return (
    <main className="page-stack">
      <div className="resident-hero">
        <div>
          <p className="report-subtitle">Staff Dashboard</p>
          <h2>Incident verification</h2>
          <p>Review incoming incident requests and keep resident reports moving through verification, response, and resolution.</p>
        </div>

        <button className="signout-button" onClick={handleSignOut}>
          <LogOut size={16} />
          <span>Sign out</span>
        </button>
      </div>

      <StaffVerificationPanel />
    </main>
  )
}
