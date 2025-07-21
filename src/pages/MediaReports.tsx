import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { useForm, useFieldArray } from 'react-hook-form'
import { Newspaper, Plus, Edit2, Trash2, Calendar, Link as LinkIcon, X } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

interface MediaReport {
  id?: string
  month_year: string
  status: 'olumlu' | 'olumsuz' | 'kritik'
  news_subject: string
  access_link: string
  news_sources: string[]
  created_at?: string
}

const statusColors = {
  olumlu: 'bg-green-100 text-green-800',
  olumsuz: 'bg-red-100 text-red-800',
  kritik: 'bg-yellow-100 text-yellow-800'
}

const statusLabels = {
  olumlu: 'Olumlu',
  olumsuz: 'Olumsuz',
  kritik: 'Kritik'
}

const MediaReports: React.FC = () => {
  const { profile } = useAuth()
  const [reports, setReports] = useState<MediaReport[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors }
  } = useForm<MediaReport>({
    defaultValues: {
      news_sources: ['']
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'news_sources'
  })

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      let query = supabase.from('media_reports').select('*')
      
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

  const onSubmit = async (data: MediaReport) => {
    if (!profile) return
    
    setSaving(true)
    try {
      const reportData = {
        ...data,
        user_id: profile.id,
        news_sources: data.news_sources.filter(source => source.trim() !== '')
      }

      if (editingId) {
        const { error } = await supabase
          .from('media_reports')
          .update(reportData)
          .eq('id', editingId)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('media_reports')
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

  const handleEdit = (report: MediaReport) => {
    setEditingId(report.id!)
    reset({
      ...report,
      news_sources: report.news_sources.length > 0 ? report.news_sources : ['']
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu raporu silmek istediğinizden emin misiniz?')) return

    try {
      const { error } = await supabase
        .from('media_reports')
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
    reset({ news_sources: [''] })
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
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <Newspaper className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Basın Haberleri</h1>
              <p className="text-gray-600">Basın haberlerinizi takip edin ve raporlayın</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Haber</span>
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            {editingId ? 'Haberi Düzenle' : 'Yeni Haber Ekle'}
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                {errors.month_year && (
                  <p className="mt-1 text-sm text-red-600">{errors.month_year.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durum
                </label>
                <select
                  {...register('status', { required: 'Bu alan zorunludur' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Seçiniz</option>
                  <option value="olumlu">Olumlu</option>
                  <option value="olumsuz">Olumsuz</option>
                  <option value="kritik">Kritik</option>
                </select>
                {errors.status && (
                  <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Haber Başlığı/Konusu
                </label>
                <input
                  type="text"
                  {...register('news_subject', { required: 'Bu alan zorunludur' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                {errors.news_subject && (
                  <p className="mt-1 text-sm text-red-600">{errors.news_subject.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Erişim Linki
                </label>
                <input
                  type="url"
                  {...register('access_link')}
                  placeholder="https://..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Haber Kaynakları
                </label>
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center space-x-2">
                      <input
                        type="text"
                        {...register(`news_sources.${index}` as const)}
                        placeholder={`Kaynak ${index + 1}`}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="p-2 text-red-600 hover:text-red-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => append('')}
                    className="text-sm text-green-600 hover:text-green-800 flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Kaynak Ekle</span>
                  </button>
                </div>
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
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Kaydediliyor...' : (editingId ? 'Güncelle' : 'Kaydet')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Kayıtlı Haberler</h2>
        </div>
        
        <div className="overflow-x-auto">
          {reports.length === 0 ? (
            <div className="text-center py-12">
              <Newspaper className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">Henüz haber bulunmuyor</p>
              <p className="text-gray-400 text-sm">İlk basın haberinizi ekleyin</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ay
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Haber Konusu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kaynaklar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Link
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[report.status]}`}>
                        {statusLabels[report.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {report.news_subject}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {report.news_sources.length > 0 ? (
                          <span>{report.news_sources.join(', ')}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {report.access_link ? (
                        <a 
                          href={report.access_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          <LinkIcon className="w-4 h-4" />
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

export default MediaReports