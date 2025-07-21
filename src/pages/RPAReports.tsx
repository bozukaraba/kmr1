import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { useForm, useFieldArray } from 'react-hook-form'
import { Bot, Plus, Edit2, Trash2, Calendar, X } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

interface RPAReport {
  id?: string
  month_year: string
  incoming_mail_count: number
  distributed_mail_count: number
  top_departments: string[]
  created_at?: string
}

const RPAReports: React.FC = () => {
  const { profile } = useAuth()
  const [reports, setReports] = useState<RPAReport[]>([])
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
  } = useForm<RPAReport>({
    defaultValues: {
      top_departments: ['', '', '']
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'top_departments'
  })

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      let query = supabase.from('rpa_reports').select('*')
      
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

  const onSubmit = async (data: RPAReport) => {
    if (!profile) return
    
    setSaving(true)
    try {
      const reportData = {
        ...data,
        user_id: profile.id,
        top_departments: data.top_departments.filter(dept => dept.trim() !== '')
      }

      if (editingId) {
        const { error } = await supabase
          .from('rpa_reports')
          .update(reportData)
          .eq('id', editingId)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('rpa_reports')
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

  const handleEdit = (report: RPAReport) => {
    setEditingId(report.id!)
    reset({
      ...report,
      top_departments: [...report.top_departments, '', '', ''].slice(0, 3)
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu raporu silmek istediğinizden emin misiniz?')) return

    try {
      const { error } = await supabase
        .from('rpa_reports')
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
    reset({ top_departments: ['', '', ''] })
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
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">RPA Raporları</h1>
              <p className="text-gray-600">Robotic Process Automation raporlarınızı yönetin</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Rapor</span>
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            {editingId ? 'RPA Raporunu Düzenle' : 'Yeni RPA Raporu Ekle'}
          </h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İlgili Ay
                </label>
                <input
                  type="month"
                  defaultValue={getCurrentMonth()}
                  {...register('month_year', { required: 'Bu alan zorunludur' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                {errors.month_year && (
                  <p className="mt-1 text-sm text-red-600">{errors.month_year.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gelen Mail Sayısı
                </label>
                <input
                  type="number"
                  min="0"
                  {...register('incoming_mail_count', { 
                    required: 'Bu alan zorunludur',
                    min: { value: 0, message: 'Pozitif bir sayı giriniz' }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                {errors.incoming_mail_count && (
                  <p className="mt-1 text-sm text-red-600">{errors.incoming_mail_count.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dağıtılan Mail Sayısı
                </label>
                <input
                  type="number"
                  min="0"
                  {...register('distributed_mail_count', { 
                    required: 'Bu alan zorunludur',
                    min: { value: 0, message: 'Pozitif bir sayı giriniz' }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                {errors.distributed_mail_count && (
                  <p className="mt-1 text-sm text-red-600">{errors.distributed_mail_count.message}</p>
                )}
              </div>

              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  En Çok Dağıtılan İlk 3 Birim
                </label>
                <div className="space-y-3">
                  {fields.slice(0, 3).map((field, index) => (
                    <div key={field.id} className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500 w-8">{index + 1}.</span>
                      <input
                        type="text"
                        {...register(`top_departments.${index}` as const)}
                        placeholder={`${index + 1}. birim adı`}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  ))}
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
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Kaydediliyor...' : (editingId ? 'Güncelle' : 'Kaydet')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">RPA Raporları</h2>
        </div>
        
        <div className="overflow-x-auto">
          {reports.length === 0 ? (
            <div className="text-center py-12">
              <Bot className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">Henüz RPA raporu bulunmuyor</p>
              <p className="text-gray-400 text-sm">İlk RPA raporunuzu ekleyin</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ay
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gelen Mail
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dağıtılan Mail
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    En Çok Dağıtılan Birimler
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
                      {report.incoming_mail_count.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {report.distributed_mail_count.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {report.top_departments.length > 0 ? (
                          <div className="space-y-1">
                            {report.top_departments.slice(0, 3).map((dept, index) => (
                              <div key={index} className="text-xs">
                                {index + 1}. {dept}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
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

export default RPAReports