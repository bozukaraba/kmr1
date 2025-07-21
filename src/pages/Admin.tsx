import React, { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import SocialMediaChart from '../components/Charts/SocialMediaChart'
import MediaChart from '../components/Charts/MediaChart'
import { SocialMediaReport, MediaReport, WebsiteAnalytics, RPAReport, Profile } from '../services/supabase'

interface AdminProps {
  onLogout: () => void
}

const Admin: React.FC<AdminProps> = ({ onLogout }) => {
  const [reports, setReports] = useState({
    social: [] as SocialMediaReport[],
    media: [] as MediaReport[],
    analytics: [] as WebsiteAnalytics[],
    rpa: [] as RPAReport[]
  })
  const [users, setUsers] = useState<Profile[]>([])
  const [filters, setFilters] = useState({
    month: '',
    user_id: '',
    report_type: 'all'
  })
  const [chartType, setChartType] = useState<'line' | 'bar'>('line')

  useEffect(() => {
    fetchReports()
    fetchUsers()
  }, [filters])

  const fetchUsers = async () => {
    const { data } = await supabase.from('profiles').select('*')
    if (data) setUsers(data)
  }

  const fetchReports = async () => {
    let socialQuery = supabase.from('social_media_reports').select('*')
    let mediaQuery = supabase.from('media_reports').select('*')
    let analyticsQuery = supabase.from('website_analytics').select('*')
    let rpaQuery = supabase.from('rpa_reports').select('*')

    if (filters.month) {
      socialQuery = socialQuery.eq('month', filters.month)
      mediaQuery = mediaQuery.eq('month', filters.month)
      analyticsQuery = analyticsQuery.eq('month', filters.month)
      rpaQuery = rpaQuery.eq('month', filters.month)
    }

    if (filters.user_id) {
      socialQuery = socialQuery.eq('user_id', filters.user_id)
      mediaQuery = mediaQuery.eq('user_id', filters.user_id)
      analyticsQuery = analyticsQuery.eq('user_id', filters.user_id)
      rpaQuery = rpaQuery.eq('user_id', filters.user_id)
    }

    const [socialData, mediaData, analyticsData, rpaData] = await Promise.all([
      socialQuery,
      mediaQuery,
      analyticsQuery,
      rpaQuery
    ])

    setReports({
      social: socialData.data || [],
      media: mediaData.data || [],
      analytics: analyticsData.data || [],
      rpa: rpaData.data || []
    })
  }

  const exportData = (format: 'csv' | 'json') => {
    const allData = {
      social_media: reports.social,
      media_reports: reports.media,
      website_analytics: reports.analytics,
      rpa_reports: reports.rpa
    }

    if (format === 'json') {
      const dataStr = JSON.stringify(allData, null, 2)
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
      const exportFileDefaultName = `reports_${new Date().toISOString().split('T')[0]}.json`
      
      const linkElement = document.createElement('a')
      linkElement.setAttribute('href', dataUri)
      linkElement.setAttribute('download', exportFileDefaultName)
      linkElement.click()
    } else {
      // CSV export for social media (example)
      const csvContent = [
        ['Ay', 'Takipçi', 'Gönderi', 'En Çok Etkileşim', 'En Az Etkileşim'].join(','),
        ...reports.social.map(item => [
          item.month,
          item.follower_count,
          item.post_count,
          item.most_engagement_link,
          item.least_engagement_link
        ].join(','))
      ].join('\n')

      const dataUri = 'data:text/csv;charset=utf-8,'+ encodeURIComponent(csvContent)
      const exportFileDefaultName = `social_media_reports_${new Date().toISOString().split('T')[0]}.csv`
      
      const linkElement = document.createElement('a')
      linkElement.setAttribute('href', dataUri)
      linkElement.setAttribute('download', exportFileDefaultName)
      linkElement.click()
    }
  }

  const updateUserRole = async (userId: string, newRole: 'admin' | 'personel') => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)
    
    if (!error) {
      fetchUsers()
      alert('Kullanıcı rolü güncellendi!')
    } else {
      alert('Hata: ' + error.message)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    onLogout()
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Admin Panel</h1>
            </div>
            <div className="flex items-center space-x-4">
              <a 
                href="/dashboard" 
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
              >
                Dashboard
              </a>
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
        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-medium mb-4">Filtreler</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Ay</label>
              <input
                type="month"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={filters.month}
                onChange={(e) => setFilters({...filters, month: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Personel</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={filters.user_id}
                onChange={(e) => setFilters({...filters, user_id: e.target.value})}
              >
                <option value="">Tümü</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.email}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Grafik Tipi</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={chartType}
                onChange={(e) => setChartType(e.target.value as 'line' | 'bar')}
              >
                <option value="line">Çizgi</option>
                <option value="bar">Bar</option>
              </select>
            </div>
            <div className="flex space-x-2 items-end">
              <button
                onClick={() => exportData('csv')}
                className="bg-green-600 text-white px-4 py-2 rounded-md text-sm"
              >
                CSV İndir
              </button>
              <button
                onClick={() => exportData('json')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
              >
                JSON İndir
              </button>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <SocialMediaChart data={reports.social} chartType={chartType} />
          <MediaChart data={reports.media} />
        </div>

        {/* User Management */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">Kullanıcı Yönetimi</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map(user => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => updateUserRole(user.id, user.role === 'admin' ? 'personel' : 'admin')}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        {user.role === 'admin' ? 'Personel Yap' : 'Admin Yap'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Admin 