import React, { useState } from 'react'
import { supabase } from '../../services/supabase'

interface MediaFormProps {
  onSuccess: () => void
}

const MediaForm: React.FC<MediaFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    month: '',
    status: 'olumlu' as 'olumlu' | 'olumsuz' | 'kritik',
    news_topic: '',
    access_link: '',
    news_sources: ['']
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Kullanıcı bulunamadı')

      const { error } = await supabase.from('media_reports').insert({
        user_id: user.id,
        month: formData.month,
        status: formData.status,
        news_topic: formData.news_topic,
        access_link: formData.access_link,
        news_sources: formData.news_sources.filter(source => source.trim() !== '')
      })

      if (error) throw error
      
      setFormData({
        month: '',
        status: 'olumlu',
        news_topic: '',
        access_link: '',
        news_sources: ['']
      })
      onSuccess()
    } catch (error: any) {
      alert('Hata: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const addNewsSource = () => {
    setFormData({...formData, news_sources: [...formData.news_sources, '']})
  }

  const removeNewsSource = (index: number) => {
    setFormData({
      ...formData, 
      news_sources: formData.news_sources.filter((_, i) => i !== index)
    })
  }

  const updateNewsSource = (index: number, value: string) => {
    const newSources = [...formData.news_sources]
    newSources[index] = value
    setFormData({...formData, news_sources: newSources})
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Basın Haberleri Raporu</h3>
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
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Durum</label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={formData.status}
            onChange={(e) => setFormData({...formData, status: e.target.value as any})}
          >
            <option value="olumlu">Olumlu</option>
            <option value="olumsuz">Olumsuz</option>
            <option value="kritik">Kritik</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Haber Bahsi</label>
          <textarea
            required
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={formData.news_topic}
            onChange={(e) => setFormData({...formData, news_topic: e.target.value})}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Erişim Linki</label>
          <input
            type="url"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={formData.access_link}
            onChange={(e) => setFormData({...formData, access_link: e.target.value})}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Haber Kaynakları</label>
          {formData.news_sources.map((source, index) => (
            <div key={index} className="flex mt-2">
              <input
                type="text"
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Kaynak adı"
                value={source}
                onChange={(e) => updateNewsSource(index, e.target.value)}
              />
              {formData.news_sources.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeNewsSource(index)}
                  className="ml-2 px-3 py-2 bg-red-600 text-white rounded-md"
                >
                  Sil
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addNewsSource}
            className="mt-2 px-4 py-2 bg-gray-600 text-white rounded-md"
          >
            + Kaynak Ekle
          </button>
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

export default MediaForm 