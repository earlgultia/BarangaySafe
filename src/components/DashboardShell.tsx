import { AnimatePresence, motion } from 'framer-motion'
import { ShieldCheck, LayoutDashboard, Bell, User, Settings } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import AlertBanner from './AlertBanner'
import AlertToast from './AlertToast'
import FullscreenAlertModal from './FullscreenAlertModal'
import NotificationToast, { type NotificationItem } from './NotificationToast'
import { fetchActiveAlerts, subscribeToAlerts, type EmergencyAlert } from '../lib/alerts'
import { ThemeToggle } from './ThemeToggle'

interface DashboardShellProps {
  title: string
  children: React.ReactNode
}

const navItems = [
  { title: 'Resident Overview', path: '/resident', icon: LayoutDashboard, roles: ['resident'] },
  { title: 'Staff Workspace', path: '/staff', icon: ShieldCheck, roles: ['staff'] },
  { title: 'Admin Command', path: '/admin', icon: Settings, roles: ['admin'] },
]

export default function DashboardShell({ title, children }: DashboardShellProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { role, user, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([])
  const [toastAlert, setToastAlert] = useState<EmergencyAlert | null>(null)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [toastNotification, setToastNotification] = useState<NotificationItem | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const activePath = location.pathname

  const activeAlerts = alerts.filter((alert) => alert.active)
  const criticalAlert = activeAlerts.find((alert) => alert.critical)
  const notificationCount = activeAlerts.length + notifications.length
  const visibleNavItems = useMemo(
    () => navItems.filter((navItem) => (role ? navItem.roles.includes(role) : true)),
    [role],
  )
  const roleLabel = role ? `${role.charAt(0).toUpperCase()}${role.slice(1)}` : title.replace(' Dashboard', '')
  const accountLabel = user?.email ?? roleLabel

  function pushNotification(notification: NotificationItem) {
    setNotifications((current) => [notification, ...current].slice(0, 8))
    setToastNotification(notification)
  }

  useEffect(() => {
    async function loadAlerts() {
      const { data, error } = await fetchActiveAlerts()
      if (!error && data) {
        setAlerts(data)
      }
    }

    loadAlerts()

    const channel = subscribeToAlerts((payload) => {
      if (payload?.new?.active) {
        setToastAlert(payload.new)
        pushNotification({
          id: `alert-${payload.new.id}`,
          type: 'New Alert',
          title: payload.new.title,
          message: payload.new.description,
          created_at: new Date().toISOString(),
        })
      }
      loadAlerts()
    })

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    const channel = supabase
      .channel('dashboard_notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'announcements' },
        (payload) => {
          if (payload?.new) {
            pushNotification({
              id: `announcement-${payload.new.id}`,
              type: 'Announcement Posted',
              title: payload.new.title,
              message: 'A new announcement has been posted.',
              created_at: new Date().toISOString(),
            })
          }
        },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'incident_reports' },
        (payload) => {
          const report = payload?.new
          const previous = payload?.old
          if (!report || !previous) return

          if (previous.status !== report.status) {
            if (report.status === 'verified' || report.status === 'resolved') {
              pushNotification({
                id: `report-${report.id}-${report.status}-${Date.now()}`,
                type: report.status === 'verified' ? 'Report Verified' : 'Report Resolved',
                title: `Report ${report.status}`,
                message: `Incident report #${report.id} is now ${report.status}.`, 
                created_at: new Date().toISOString(),
              })
            }
          }
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    if (criticalAlert) {
      setModalOpen(true)
    }
  }, [criticalAlert])

  useEffect(() => {
    if (!toastAlert) {
      return
    }

    const timeout = window.setTimeout(() => setToastAlert(null), 6000)
    return () => window.clearTimeout(timeout)
  }, [toastAlert])

  useEffect(() => {
    if (!toastNotification) {
      return
    }

    const timeout = window.setTimeout(() => setToastNotification(null), 6000)
    return () => window.clearTimeout(timeout)
  }, [toastNotification])

  async function handleSignOut() {
    await signOut()
    navigate('/auth/login', { replace: true })
  }

  const userMenuItems = [
    { label: accountLabel, action: () => undefined },
    { label: 'Sign out', action: handleSignOut },
  ]

  return (
    <div className="dashboard-shell">
      <motion.aside
        className="dashboard-sidebar"
        initial={{ opacity: 0, x: -80 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <div className="sidebar-brand">
          <div className="brand-icon">
            <ShieldCheck strokeWidth={2} />
          </div>
          <div>
            <p>eAmping</p>
            <span>Community dashboard</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {visibleNavItems.map((navItem) => {
            const Icon = navItem.icon
            const isActive = activePath === navItem.path

            return (
              <Link
                key={navItem.path}
                to={navItem.path}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
              >
                <Icon className="sidebar-icon" />
                <span>{navItem.title}</span>
              </Link>
            )
          })}
        </nav>

        <motion.div
          className="sidebar-footer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p className="footer-title">Project status</p>
          <div className="status-pill">Live</div>
        </motion.div>
      </motion.aside>

      <div className="dashboard-main">
        <AlertBanner alert={activeAlerts[0] ?? null} />
        <FullscreenAlertModal
          alert={criticalAlert ?? null}
          open={modalOpen}
          onDismiss={() => setModalOpen(false)}
        />
        <AlertToast alert={toastAlert} />
        <NotificationToast notification={toastNotification} />

        <motion.header
          className="dashboard-topbar"
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div>
            <p className="topbar-subtitle">Welcome back</p>
            <h1>{title}</h1>
          </div>

          <div className="topbar-actions">
            <ThemeToggle />

            <motion.button
              type="button"
              className="icon-button"
              aria-label="Open notifications"
              title="Open notifications"
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.03 }}
              onClick={() => setNotificationOpen((state) => !state)}
            >
              <Bell size={18} />
              {notificationCount > 0 ? <span className="badge">{notificationCount}</span> : null}
            </motion.button>

            <AnimatePresence>
              {notificationOpen ? (
                <motion.div
                  className="notification-panel"
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="panel-header">
                    <strong>Notifications</strong>
                    <span>{notificationCount} new</span>
                  </div>
                  {activeAlerts.length === 0 && notifications.length === 0 ? (
                    <div className="panel-empty">No notifications.</div>
                  ) : (
                    <div className="panel-list">
                      {activeAlerts.slice(0, 3).map((alert) => (
                        <div key={`alert-${alert.id}`} className="panel-item">
                          <div>
                            <strong>{alert.alert_type}</strong>
                            <p>{alert.title}</p>
                          </div>
                          {alert.critical ? <span className="alert-pill critical">Critical</span> : null}
                        </div>
                      ))}
                      {notifications.slice(0, 4).map((notification) => (
                        <div key={notification.id} className="panel-item">
                          <div>
                            <strong>{notification.type}</strong>
                            <p>{notification.title}</p>
                          </div>
                          <small>{notification.message}</small>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ) : null}
            </AnimatePresence>

            <div className="user-menu-wrapper">
              <button
                type="button"
                className="user-chip"
                onClick={() => setMenuOpen((state) => !state)}
              >
                <User size={18} />
                <span>{roleLabel}</span>
              </button>

              <AnimatePresence>
                {menuOpen ? (
                  <motion.div
                    className="user-menu"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {userMenuItems.map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        className="menu-item"
                        onClick={() => {
                          item.action()
                          setMenuOpen(false)
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        </motion.header>

        <motion.main
          className="dashboard-content"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          {children}
        </motion.main>
      </div>
    </div>
  )
}
