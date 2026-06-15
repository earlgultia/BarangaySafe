import { AnimatePresence, motion } from 'framer-motion'
import { ShieldCheck, LayoutDashboard, Bell, User, Settings, MapPin, AlertCircle, Menu, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import AlertBanner from './AlertBanner'
import AlertToast from './AlertToast'
import BrandLogo from './BrandLogo'
import FullscreenAlertModal from './FullscreenAlertModal'
import NotificationToast, { type NotificationItem } from './NotificationToast'
import EditProfileModal from './EditProfileModal'
import { fetchActiveAlerts, subscribeToAlerts, type EmergencyAlert } from '../lib/alerts'

interface DashboardShellProps {
  title: string
  children: React.ReactNode
}

const navItems = [
  { title: 'Resident Overview', path: '/resident', icon: LayoutDashboard, roles: ['resident'] },
  { title: 'Announcements', path: '/resident/announcements', icon: Bell, roles: ['resident'] },
  { title: 'Evacuation Centers', path: '/resident/evacuation', icon: MapPin, roles: ['resident'] },
  { title: 'Report Incident', path: '/resident/report', icon: AlertCircle, roles: ['resident'] },
  { title: 'Staff Workspace', path: '/staff', icon: ShieldCheck, roles: ['staff'] },
  { title: 'Admin Dashboard', path: '/admin/dashboard', icon: Settings, roles: ['admin'] },
  { title: 'Create Alert', path: '/admin/alerts', icon: AlertCircle, roles: ['admin'] },
  { title: 'Announcement Center', path: '/admin/announcements', icon: Bell, roles: ['admin'] },
  { title: 'Analytics Dashboard', path: '/admin/analytics', icon: LayoutDashboard, roles: ['admin'] },
  { title: 'Relief Distribution', path: '/admin/relief', icon: ShieldCheck, roles: ['admin'] },
  { title: 'Resident Registry', path: '/admin/registry', icon: User, roles: ['admin'] },
  { title: 'Community Map', path: '/admin/map', icon: MapPin, roles: ['admin'] },
]

export default function DashboardShell({ title, children }: DashboardShellProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { role, user, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [editProfileOpen, setEditProfileOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
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
  const activeNavItem = visibleNavItems.find((navItem) => navItem.path === activePath)
  const pageTitle = activeNavItem?.title ?? title
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

  const userMenuItems = [
    { label: accountLabel, action: () => { setMenuOpen(false); setEditProfileOpen(true); } },
    { label: 'Sign out', action: () => { setMenuOpen(false); setLogoutOpen(true); } },
  ]

  async function confirmSignOut() {
    setLogoutOpen(false)
    await signOut()
    navigate('/auth/login', { replace: true })
  }

  return (
    <div className="dashboard-shell">
      <AnimatePresence>
        {sidebarOpen ? (
          <motion.div
            className="sidebar-overlay show"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSidebarOpen(false)}
          />
        ) : null}
      </AnimatePresence>

      <motion.aside
        className={`dashboard-sidebar ${sidebarOpen ? 'mobile-open' : ''}`}
        initial={{ opacity: 0, x: -80 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <div className="sidebar-brand">
          <div className="brand-icon">
            <BrandLogo size={34} />
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
                onClick={() => setSidebarOpen(false)}
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
            <h1>{pageTitle}</h1>
          </div>

          <div className="topbar-toggle-left">
            <motion.button
              type="button"
              className="sidebar-toggle"
              aria-label="Toggle sidebar"
              title="Toggle sidebar"
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.03 }}
              onClick={() => setSidebarOpen((state) => !state)}
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </motion.button>
          </div>

          <div className="topbar-actions">
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
            <AnimatePresence>
              {logoutOpen ? (
                <motion.div
                  className="logout-confirm-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  <motion.div
                    className="logout-confirm-modal"
                    initial={{ scale: 0.96, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.96, opacity: 0 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                  >
                    <h3>Are you sure you want to logout?</h3>
                    <p className="muted">You will be signed out of your account.</p>
                    <div className="confirm-actions">
                      <button type="button" className="button-outline" onClick={() => setLogoutOpen(false)}>No</button>
                      <button type="button" className="submit-button" onClick={() => { void confirmSignOut() }}>Yes</button>
                    </div>
                  </motion.div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </motion.header>

        <motion.main
          className="dashboard-content"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          {children ?? <Outlet />}
        </motion.main>
      </div>
      <EditProfileModal open={editProfileOpen} onClose={() => setEditProfileOpen(false)} />
    </div>
  )
}
