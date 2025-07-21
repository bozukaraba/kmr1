import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import SocialMedia from './pages/SocialMedia'
import MediaReports from './pages/MediaReports'
import WebsiteAnalytics from './pages/WebsiteAnalytics'
import RPAReports from './pages/RPAReports'
import UserManagement from './pages/UserManagement'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/social-media"
            element={
              <ProtectedRoute>
                <Layout>
                  <SocialMedia />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/media-reports"
            element={
              <ProtectedRoute>
                <Layout>
                  <MediaReports />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/website-analytics"
            element={
              <ProtectedRoute>
                <Layout>
                  <WebsiteAnalytics />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/rpa-reports"
            element={
              <ProtectedRoute>
                <Layout>
                  <RPAReports />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute adminOnly>
                <Layout>
                  <UserManagement />
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App