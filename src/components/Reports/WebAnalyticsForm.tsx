import React, { useState } from 'react'
import { supabase } from '../../services/supabase'

interface WebAnalyticsFormProps {
  onSuccess: () => void
}

const WebAnalyticsForm: React.FC<WebAnalyticsFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    month: '',
    visitor_count: '',
    page_views: '',
    bounce_rate: '',
    avg_session_duration: '',
    conversions: '',
    top_pages: ['', '', '']
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Kullanıcı bulunamadı')

      const { error } = await supabase.from('website_analytics').insert({
        user_id: user.id,
        month: formData.month,
        visitor_count: parseInt(formData.visitor_count),
        page_views: parseInt(formData.page_views),
        bounce_rate: parseFloat(formData.bounce_rate),
        avg_session_duration: parseFloat(formData.avg_session_duration),
        conversions: parseInt(formData.conversions),
        top_pages: formData.top_pages.filter(page => page.trim() !== '')
      })

      if (error) throw error
      
      setFormData({
        month: '',
        visitor_count: '',
        page_views: '',
        bounce_rate: '',
        avg_session_duration: '',
        conversions: '',
        top_pages: ['', '', '']
      })
      onSuccess()
    } catch (error: any) {
      alert('Hata: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const updateTopPage = (index: number, value: string) => {
    const newPages = [...formData.top_pages]
    newPages[index] = value
    setFormData({...formData, top_pages: newPages})
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Web Sitesi Analitiği</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">İlgili Ay</label>
          <input
            type="month"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={formData.month}
            onChange={(e) => setFormData({...formData, month: e.target.value})}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Ziyaretçi Sayısı</label>
            <input
              type="number"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={formData.visitor_count}
              onChange={(e) => setFormData({...formData, visitor_count: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Sayfa Görüntüleme</label>
            <input
              type="number"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={formData.page_views}
              onChange={(e) => setFormData({...formData, page_views: e.target.value})}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Hemen Çıkma Oranı (%)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={formData.bounce_rate}
              onChange={(e) => setFormData({...formData, bounce_rate: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Ortalama Oturum Süresi (dakika)</label>
            <input
              type="number"
              step="0.01"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={formData.avg_session_duration}
              onChange={(e) => setFormData({...formData, avg_session_duration: e.target.value})}
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Dönüşüm</label>
          <input
            type="number"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={formData.conversions}
            onChange={(e) => setFormData({...formData, conversions: e.target.value})}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">En Popüler 3 Sayfa URL</label>
          {formData.top_pages.map((page, index) => (
            <input
              key={index}
              type="url"
              className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder={`${index + 1}. sayfa URL`}
              value={page}
              onChange={(e) => updateTopPage(index, e.target.value)}
            />
          ))}
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </form>
    </div>
  )
}

export default WebAnalyticsForm 