import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  Home, 
  BarChart3, 
  Newspaper, 
  Globe, 
  Bot, 
  Users, 
  LogOut, 
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, profile, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const navigation = [
    { name: 'Ana Sayfa', href: '/dashboard', icon: Home },
    { name: 'Sosyal Medya', href: '/social-media', icon: BarChart3 },
    { name: 'Basın Haberleri', href: '/media-reports', icon: Newspaper },
    { name: 'Web Analitik', href: '/website-analytics', icon: Globe },
    { name: 'RPA Raporu', href: '/rpa-reports', icon: Bot },
    ...(profile?.role === 'admin' ? [
      { name: 'Kullanıcı Yönetimi', href: '/admin/users', icon: Users }
    ] : [])
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 lg:hidden z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Raporlama Sistemi</h1>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center mb-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{profile?.email}</p>
              <p className="text-xs text-gray-500 capitalize">
                {profile?.role === 'admin' ? 'Yönetici' : 'Personel'}
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <LogOut className="mr-3 h-4 w-4" />
            Çıkış Yap
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Mobile header */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="text-gray-600 hover:text-gray-900"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Raporlama</h1>
            <div className="w-6" />
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout