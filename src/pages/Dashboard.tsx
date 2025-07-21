import React, { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import SocialMediaForm from '../components/Reports/SocialMediaForm'
import MediaForm from '../components/Reports/MediaForm'
import WebAnalyticsForm from '../components/Reports/WebAnalyticsForm'
import RPAForm from '../components/Reports/RPAForm'

interface DashboardProps {
  onLogout: () => void
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('social')
  const [userProfile, setUserProfile] = useState<any>(null)

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setUserProfile(data)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    onLogout()
  }

  const handleFormSuccess = () => {
    alert('Rapor başarıyla kaydedildi!')
  }

  const tabs = [
    { id: 'social', label: 'Sosyal Medya', component: SocialMediaForm },
    { id: 'media', label: 'Basın Haberleri', component: MediaForm },
    { id: 'analytics', label: 'Web Analitik', component: WebAnalyticsForm },
    { id: 'rpa', label: 'RPA', component: RPAForm }
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Raporlama Sistemi</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {userProfile?.email} ({userProfile?.role})
              </span>
              {userProfile?.role === 'admin' && (
                <a 
                  href="/admin" 
                  className="bg-green-600 text-white px-4 py-2 rounded-md text-sm"
                >
                  Admin Panel
                </a>
              )}
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm"
              >
                Çıkış
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-6">
            {tabs.map((tab) => {
              if (tab.id === activeTab) {
                const Component = tab.component
                return <Component key={tab.id} onSuccess={handleFormSuccess} />
              }
              return null
            })}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard 