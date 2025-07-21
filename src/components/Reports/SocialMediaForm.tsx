import React, { useState } from 'react'
import { supabase } from '../../services/supabase'

interface SocialMediaFormProps {
  onSuccess: () => void
}

const SocialMediaForm: React.FC<SocialMediaFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    month: '',
    follower_count: '',
    post_count: '',
    most_engagement_link: '',
    least_engagement_link: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Kullanıcı bulunamadı')

      const { error } = await supabase.from('social_media_reports').insert({
        user_id: user.id,
        month: formData.month,
        follower_count: parseInt(formData.follower_count),
        post_count: parseInt(formData.post_count),
        most_engagement_link: formData.most_engagement_link,
        least_engagement_link: formData.least_engagement_link
      })

      if (error) throw error
      
      setFormData({
        month: '',
        follower_count: '',
        post_count: '',
        most_engagement_link: '',
        least_engagement_link: ''
      })
      onSuccess()
    } catch (error: any) {
      alert('Hata: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Sosyal Medya Raporu</h3>
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
          <label className="block text-sm font-medium text-gray-700">Takipçi Sayısı</label>
          <input
            type="number"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={formData.follower_count}
            onChange={(e) => setFormData({...formData, follower_count: e.target.value})}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Gönderi Sayısı</label>
          <input
            type="number"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={formData.post_count}
            onChange={(e) => setFormData({...formData, post_count: e.target.value})}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">En Çok Etkileşim Alan Gönderi Linki</label>
          <input
            type="url"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={formData.most_engagement_link}
            onChange={(e) => setFormData({...formData, most_engagement_link: e.target.value})}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">En Az Etkileşim Alan Gönderi Linki</label>
          <input
            type="url"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={formData.least_engagement_link}
            onChange={(e) => setFormData({...formData, least_engagement_link: e.target.value})}
          />
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

export default SocialMediaForm 