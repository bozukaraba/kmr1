import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './services/supabase'
import Login from './components/Auth/Login'
import Dashboard from './pages/Dashboard'
import Admin from './pages/Admin'
import './App.css'

function App() {
  const [session, setSession] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        fetchUserProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        fetchUserProfile(session.user.id)
      } else {
        setUserProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setUserProfile(data)
    } catch (error) {
      console.error('Error fetching user profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAuthChange = () => {
    // This will trigger the auth state change listener
  }

  const handleLogout = () => {
    setSession(null)
    setUserProfile(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Yükleniyor...</div>
      </div>
    )
  }

  if (!session || !userProfile) {
    return <Login onAuthChange={handleAuthChange} />
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Navigate to="/dashboard" replace />} />
        <Route 
          path="/dashboard" 
          element={<Dashboard onLogout={handleLogout} />} 
        />
        <Route 
          path="/admin" 
          element={
            userProfile.role === 'admin' ? (
              <Admin onLogout={handleLogout} />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          } 
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  )
}

export default App
