import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { useForm } from 'react-hook-form'
import { BarChart3, Plus, Edit2, Trash2, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

interface SocialMediaReport {
  id?: string
  month_year: string
  follower_count: number
  post_count: number
  highest_engagement_link: string
  lowest_engagement_link: string
  created_at?: string
}

const SocialMedia: React.FC = () => {
  const { profile } = useAuth()
  const [reports, setReports] = useState<SocialMediaReport[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<SocialMediaReport>()

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      let query = supabase.from('social_media_reports').select('*')
      
      if (profile?.role !== 'admin') {
        query = query.eq('user_id', profile?.id)
      }

      const { data, error } = await query.order('created_at', { ascending: false })
      
      if (error) throw error
      setReports(data || [])
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: SocialMediaReport) => {
    if (!profile) return
    
    setSaving(true)
    try {
      const reportData = {
        ...data,
        user_id: profile.id
      }

      if (editingId) {
        const { error } = await supabase
          .from('social_media_reports')
          .update(reportData)
          .eq('id', editingId)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('social_media_reports')
          .insert([reportData])
        if (error) throw error
      }

      await fetchReports()
      handleCancel()
    } catch (error) {
      console.error('Error saving report:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (report: SocialMediaReport) => {
    setEditingId(report.id!)
    reset(report)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu raporu silmek istediğinizden emin misiniz?')) return

    try {
      const { error } = await supabase
        .from('social_media_reports')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      await fetchReports()
    } catch (error) {
      console.error('Error deleting report:', error)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    reset()
  }

  const getCurrentMonth = () => {
    const now = new Date()
    return format(now, 'yyyy-MM')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sosyal Medya Raporları</h1>
              <p className="text-gray-600">Sosyal medya performans raporlarınızı yönetin</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Rapor</span>
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            {editingId ? 'Raporu Düzenle' : 'Yeni Rapor Ekle'}
          </h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İlgili Ay
                </label>
                <input
                  type="month"
                  defaultValue={getCurrentMonth()}
                  {...register('month_year', { required: 'Bu alan zorunludur' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.month_year && (
                  <p className="mt-1 text-sm text-red-600">{errors.month_year.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Takipçi Sayısı
                </label>
                <input
                  type="number"
                  min="0"
                  {...register('follower_count', { 
                    required: 'Bu alan zorunludur',
                    min: { value: 0, message: 'Takipçi sayısı pozitif olmalıdır' }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.follower_count && (
                  <p className="mt-1 text-sm text-red-600">{errors.follower_count.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gönderi Sayısı
                </label>
                <input
                  type="number"
                  min="0"
                  {...register('post_count', { 
                    required: 'Bu alan zorunludur',
                    min: { value: 0, message: 'Gönderi sayısı pozitif olmalıdır' }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.post_count && (
                  <p className="mt-1 text-sm text-red-600">{errors.post_count.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  En Çok Etkileşim Alan Gönderi
                </label>
                <input
                  type="url"
                  {...register('highest_engagement_link')}
                  placeholder="https://..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  En Az Etkileşim Alan Gönderi
                </label>
                <input
                  type="url"
                  {...register('lowest_engagement_link')}
                  placeholder="https://..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Kaydediliyor...' : (editingId ? 'Güncelle' : 'Kaydet')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Kayıtlı Raporlar</h2>
        </div>
        
        <div className="overflow-x-auto">
          {reports.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">Henüz rapor bulunmuyor</p>
              <p className="text-gray-400 text-sm">İlk sosyal medya raporunuzu ekleyin</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ay
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Takipçi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gönderi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    En Yüksek
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    En Düşük
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {format(new Date(report.month_year + '-01'), 'MMMM yyyy', { locale: tr })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {report.follower_count.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {report.post_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {report.highest_engagement_link ? (
                        <a 
                          href={report.highest_engagement_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 truncate block max-w-32"
                        >
                          Link
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {report.lowest_engagement_link ? (
                        <a 
                          href={report.lowest_engagement_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 truncate block max-w-32"
                        >
                          Link
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(report)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(report.id!)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

export default SocialMedia