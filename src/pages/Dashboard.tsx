import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { BarChart3, Newspaper, Globe, Bot, Users, TrendingUp, Calendar, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Stats {
  socialMediaReports: number
  mediaReports: number
  websiteAnalytics: number
  rpaReports: number
  totalUsers?: number
}

const Dashboard: React.FC = () => {
  const { profile } = useAuth()
  const [stats, setStats] = useState<Stats>({
    socialMediaReports: 0,
    mediaReports: 0,
    websiteAnalytics: 0,
    rpaReports: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [profile])

  const fetchStats = async () => {
    if (!profile) return

    try {
      const userId = profile.role === 'admin' ? undefined : profile.id

      // Fetch report counts
      const queries = [
        supabase.from('social_media_reports').select('id', { count: 'exact' })
          .conditional('user_id', userId ? { eq: userId } : {}),
        supabase.from('media_reports').select('id', { count: 'exact' })
          .conditional('user_id', userId ? { eq: userId } : {}),
        supabase.from('website_analytics').select('id', { count: 'exact' })
          .conditional('user_id', userId ? { eq: userId } : {}),
        supabase.from('rpa_reports').select('id', { count: 'exact' })
          .conditional('user_id', userId ? { eq: userId } : {})
      ]

      if (profile.role === 'admin') {
        queries.push(supabase.from('profiles').select('id', { count: 'exact' }))
      }

      const results = await Promise.all(queries)

      setStats({
        socialMediaReports: results[0].count || 0,
        mediaReports: results[1].count || 0,
        websiteAnalytics: results[2].count || 0,
        rpaReports: results[3].count || 0,
        ...(profile.role === 'admin' && { totalUsers: results[4]?.count || 0 })
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    {
      title: 'Sosyal Medya Raporu',
      description: 'Yeni sosyal medya raporu ekle',
      href: '/social-media',
      icon: BarChart3,
      color: 'bg-blue-500',
      count: stats.socialMediaReports
    },
    {
      title: 'Basın Haberleri',
      description: 'Basın haberleri raporu ekle',
      href: '/media-reports',
      icon: Newspaper,
      color: 'bg-green-500',
      count: stats.mediaReports
    },
    {
      title: 'Web Analitik',
      description: 'Website analitik raporu ekle',
      href: '/website-analytics',
      icon: Globe,
      color: 'bg-purple-500',
      count: stats.websiteAnalytics
    },
    {
      title: 'RPA Raporu',
      description: 'RPA automation raporu ekle',
      href: '/rpa-reports',
      icon: Bot,
      color: 'bg-orange-500',
      count: stats.rpaReports
    }
  ]

  if (profile?.role === 'admin') {
    quickActions.push({
      title: 'Kullanıcı Yönetimi',
      description: 'Kullanıcıları yönet',
      href: '/admin/users',
      icon: Users,
      color: 'bg-red-500',
      count: stats.totalUsers || 0
    })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Hoş Geldiniz, {profile?.email}
            </h1>
            <p className="text-gray-600 mt-1">
              {profile?.role === 'admin' ? 'Yönetici Paneli' : 'Personel Paneli'}
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>{new Date().toLocaleDateString('tr-TR', { 
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickActions.map((action) => {
          const Icon = action.icon
          return (
            <div key={action.title} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  {loading ? (
                    <div className="animate-pulse bg-gray-200 rounded w-8 h-6"></div>
                  ) : (
                    <span className="text-2xl font-bold text-gray-900">{action.count}</span>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{action.description}</p>
                <Link
                  to={action.href}
                  className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Görüntüle
                  <TrendingUp className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <FileText className="w-5 h-5 text-gray-400 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Son Aktiviteler</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse flex space-x-4">
                    <div className="rounded-full bg-gray-200 h-8 w-8"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Henüz aktivite bulunmuyor</p>
                <p className="text-sm mt-1">Rapor eklemeye başlayın</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard