import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import Landing from './pages/Landing'
import LoginPage from './pages/auth/Login'
import RegisterPage from './pages/auth/Register'
import ForgotPasswordPage from './pages/auth/ForgotPassword'
import ResetPasswordPage from './pages/auth/ResetPassword'
import ResidentPage from './pages/Resident'
import StaffPage from './pages/Staff'
import AdminPage from './pages/Admin'
import AnnouncementFeed from './components/AnnouncementFeed'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import CreateAlertPage from './pages/admin/CreateAlertPage'
import AnnouncementCenterPage from './pages/admin/AnnouncementCenterPage'
import AnalyticsDashboardPage from './pages/admin/AnalyticsDashboardPage'
import ReliefDistributionPage from './pages/admin/ReliefDistributionPage'
import ResidentRegistryPage from './pages/admin/ResidentRegistryPage'
import CommunityMapPage from './pages/admin/CommunityMapPage'
import EvacuationCenters from './components/EvacuationCenters'
import IncidentReportForm from './components/IncidentReportForm'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardShell from './components/DashboardShell'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import './App.css'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
          <Route
            path="/resident"
            element={
              <ProtectedRoute allowedRoles={['resident']}>
                <DashboardShell title="Resident Dashboard">
                  <Outlet />
                </DashboardShell>
              </ProtectedRoute>
            }
          >
            <Route index element={<ResidentPage />} />
            <Route path="announcements" element={<AnnouncementFeed />} />
            <Route path="evacuation" element={<EvacuationCenters />} />
            <Route path="report" element={<IncidentReportForm />} />
          </Route>
          <Route
            path="/staff"
            element={
              <ProtectedRoute allowedRoles={['staff']}>
                <DashboardShell title="Staff Dashboard">
                  <StaffPage />
                </DashboardShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardShell title="Admin Dashboard">
                  <Outlet />
                </DashboardShell>
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminPage />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="alerts" element={<CreateAlertPage />} />
            <Route path="announcements" element={<AnnouncementCenterPage />} />
            <Route path="analytics" element={<AnalyticsDashboardPage />} />
            <Route path="relief" element={<ReliefDistributionPage />} />
            <Route path="registry" element={<ResidentRegistryPage />} />
            <Route path="map" element={<CommunityMapPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
