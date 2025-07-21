import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Users, Edit2, Shield, User, Calendar, Search, Filter } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

interface Profile {
  id: string
  email: string
  role: 'admin' | 'personel'
  created_at: string
  updated_at: string
}

const UserManagement: React.FC = () => {
  const { profile } = useAuth()
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'personel'>('all')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (userId: string, newRole: 'admin' | 'personel') => {
    if (!confirm(`Bu kullanıcının rolünü ${newRole === 'admin' ? 'yönetici' : 'personel'} olarak değiştirmek istediğinizden emin misiniz?`)) {
      return
    }

    setUpdating(userId)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          role: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) throw error
      await fetchUsers()
    } catch (error) {
      console.error('Error updating user role:', error)
      alert('Rol güncelleme sırasında hata oluştu')
    } finally {
      setUpdating(null)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  if (profile?.role !== 'admin') {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
        <Shield className="w-12 h-12 text-red-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Erişim Yetkisi Yok</h2>
        <p className="text-gray-600">Bu sayfaya erişmek için yönetici yetkileriniz bulunmuyor.</p>
      </div>
    )
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
            <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Kullanıcı Yönetimi</h1>
              <p className="text-gray-600">Sistem kullanıcılarını yönetin ve rollerini düzenleyin</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{users.length}</div>
            <div className="text-sm text-gray-500">Toplam Kullanıcı</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="E-posta ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-80"
            />
          </div>
          <div className="flex items-center space-x-3">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as 'all' | 'admin' | 'personel')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tüm Roller</option>
              <option value="admin">Yönetici</option>
              <option value="personel">Personel</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Kullanıcılar ({filteredUsers.length})
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              {searchTerm || roleFilter !== 'all' ? (
                <>
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg mb-2">Arama kriterlerine uygun kullanıcı bulunamadı</p>
                  <button
                    onClick={() => {
                      setSearchTerm('')
                      setRoleFilter('all')
                    }}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    Filtreleri temizle
                  </button>
                </>
              ) : (
                <>
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg mb-2">Henüz kullanıcı bulunmuyor</p>
                </>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kullanıcı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kayıt Tarihi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Son Güncelleme
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                          <User className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.email}</div>
                          <div className="text-sm text-gray-500">ID: {user.id.slice(0, 8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role === 'admin' ? (
                          <div className="flex items-center space-x-1">
                            <Shield className="w-3 h-3" />
                            <span>Yönetici</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span>Personel</span>
                          </div>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        {format(new Date(user.created_at), 'dd MMM yyyy', { locale: tr })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(user.updated_at), 'dd MMM yyyy', { locale: tr })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {user.id === profile.id ? (
                        <span className="text-gray-400">Kendi hesabınız</span>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateUserRole(user.id, user.role === 'admin' ? 'personel' : 'admin')}
                            disabled={updating === user.id}
                            className="text-blue-600 hover:text-blue-900 disabled:opacity-50 flex items-center space-x-1"
                          >
                            <Edit2 className="w-4 h-4" />
                            <span>
                              {updating === user.id 
                                ? 'Güncelleniyor...' 
                                : `${user.role === 'admin' ? 'Personel Yap' : 'Admin Yap'}`
                              }
                            </span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Yönetici</p>
              <p className="text-2xl font-semibold text-gray-900">
                {users.filter(u => u.role === 'admin').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Personel</p>
              <p className="text-2xl font-semibold text-gray-900">
                {users.filter(u => u.role === 'personel').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Toplam</p>
              <p className="text-2xl font-semibold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserManagement