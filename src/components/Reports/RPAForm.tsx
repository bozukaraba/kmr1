import React, { useState } from 'react'
import { supabase } from '../../services/supabase'

interface RPAFormProps {
  onSuccess: () => void
}

const RPAForm: React.FC<RPAFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    month: '',
    incoming_mail_count: '',
    distributed_mail_count: '',
    top_distribution_units: ['', '', '']
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Kullanıcı bulunamadı')

      const { error } = await supabase.from('rpa_reports').insert({
        user_id: user.id,
        month: formData.month,
        incoming_mail_count: parseInt(formData.incoming_mail_count),
        distributed_mail_count: parseInt(formData.distributed_mail_count),
        top_distribution_units: formData.top_distribution_units.filter(unit => unit.trim() !== '')
      })

      if (error) throw error
      
      setFormData({
        month: '',
        incoming_mail_count: '',
        distributed_mail_count: '',
        top_distribution_units: ['', '', '']
      })
      onSuccess()
    } catch (error: any) {
      alert('Hata: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const updateUnit = (index: number, value: string) => {
    const newUnits = [...formData.top_distribution_units]
    newUnits[index] = value
    setFormData({...formData, top_distribution_units: newUnits})
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">RPA Raporlama</h3>
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
          <label className="block text-sm font-medium text-gray-700">Gelen Mail Sayısı</label>
          <input
            type="number"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={formData.incoming_mail_count}
            onChange={(e) => setFormData({...formData, incoming_mail_count: e.target.value})}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Dağıtılan Mail Sayısı</label>
          <input
            type="number"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={formData.distributed_mail_count}
            onChange={(e) => setFormData({...formData, distributed_mail_count: e.target.value})}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">En Çok Dağıtılan İlk 3 Birim</label>
          {formData.top_distribution_units.map((unit, index) => (
            <input
              key={index}
              type="text"
              className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder={`${index + 1}. birim adı`}
              value={unit}
              onChange={(e) => updateUnit(index, e.target.value)}
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

export default RPAForm 