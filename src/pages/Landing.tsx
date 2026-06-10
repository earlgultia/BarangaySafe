import { Link } from 'react-router-dom'
import { AlertCircle, Map, Bell, Users, BarChart3, Shield } from 'lucide-react'
import { ThemeToggle } from '../components/ThemeToggle'

export default function Landing() {
  return (
    <div className="landing-page">
      <nav className="landing-header" aria-label="Landing page navigation">
        <div className="landing-container">
          <div className="landing-header-links">
            <a href="#features">Key Features</a>
            <a href="#roles">For Every Role</a>
            <a href="#get-started">Get Started Today</a>
          </div>
          <div className="landing-header-actions">
            <ThemeToggle />
            <Link to="/auth/login" className="button button-primary">
              Sign In
            </Link>
            <Link to="/auth/register" className="button button-secondary">
              Create Account
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="landing-hero">
        <div className="landing-container">
          <div className="hero-content">
            <div className="hero-brand">
              <div className="hero-icon">
                <Shield size={32} />
              </div>
              <h1>SafeBarangay</h1>
              <p className="hero-tagline">Community Emergency Response System</p>
            </div>
            <p className="hero-description">
              Real-time alerts, incident tracking, evacuation coordination, and relief distribution
              all in one secure platform for safer communities.
            </p>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="landing-features" id="features">
        <div className="landing-container">
          <h2>Key Features</h2>
          <div className="features-grid">
            <article className="feature-card">
              <div className="feature-icon">
                <AlertCircle size={24} />
              </div>
              <h3>Emergency Alerts</h3>
              <p>Instant notifications for critical events, disasters, and community emergencies with real-time updates.</p>
            </article>

            <article className="feature-card">
              <div className="feature-icon">
                <Map size={24} />
              </div>
              <h3>Interactive Maps</h3>
              <p>View hazard zones, assembly points, evacuation centers, and incident locations on live-updated layers.</p>
            </article>

            <article className="feature-card">
              <div className="feature-icon">
                <Bell size={24} />
              </div>
              <h3>Incident Reports</h3>
              <p>Submit and track incident reports with photos, locations, and verification status from staff.</p>
            </article>

            <article className="feature-card">
              <div className="feature-icon">
                <Users size={24} />
              </div>
              <h3>Resident Registry</h3>
              <p>Maintain household records and identify vulnerable residents for priority assistance and outreach.</p>
            </article>

            <article className="feature-card">
              <div className="feature-icon">
                <BarChart3 size={24} />
              </div>
              <h3>Analytics Dashboard</h3>
              <p>Track incident trends, population demographics, evacuation status, and response metrics in real-time.</p>
            </article>

            <article className="feature-card">
              <div className="feature-icon">
                <Shield size={24} />
              </div>
              <h3>Role-Based Access</h3>
              <p>Secure role-based dashboards for residents, staff, and administrators with granular permissions.</p>
            </article>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="landing-roles" id="roles">
        <div className="landing-container">
          <h2>For Every Role</h2>
          <div className="roles-grid">
            <div className="role-card">
              <h3>Residents</h3>
              <p>Access alerts, submit incident reports, find evacuation centers, and track community relief efforts.</p>
              <Link to="/auth/register" className="role-link">
                Register as Resident →
              </Link>
            </div>

            <div className="role-card">
              <h3>Staff</h3>
              <p>Verify incident reports, coordinate responses, manage announcements, and track relief distribution.</p>
            </div>

            <div className="role-card">
              <h3>Administrators</h3>
              <p>Oversee all operations, manage user roles, issue emergency alerts, and analyze community-wide data.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing-cta" id="get-started">
        <div className="landing-container">
          <h2>Get Started Today</h2>
          <p>Join your community's emergency response network and help keep neighbors safe.</p>
          <div className="cta-actions">
            <Link to="/auth/login" className="button button-primary button-large">
              Sign In to Dashboard
            </Link>
            <Link to="/auth/register" className="button button-secondary button-large">
              Create New Account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-container">
          <p>SafeBarangay © 2026 — Community Emergency Response System</p>
          <div className="footer-links">
            <a href="#features">Features</a>
            <a href="#roles">Roles</a>
            <a href="/auth/login">Dashboard</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
