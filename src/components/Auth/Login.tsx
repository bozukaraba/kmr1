import React, { useState } from 'react'
import { supabase } from '../../services/supabase'

interface LoginProps {
  onAuthChange: () => void
}

const Login: React.FC<LoginProps> = ({ onAuthChange }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        
        // Create profile
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase.from('profiles').insert({
            id: user.id,
            email: user.email,
            role: 'personel'
          })
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
      }
      onAuthChange()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isSignUp ? 'Kayıt Ol' : 'Giriş Yap'}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleAuth}>
          <div>
            <input
              type="email"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Email adresi"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <input
              type="password"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Şifre"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'İşleniyor...' : (isSignUp ? 'Kayıt Ol' : 'Giriş Yap')}
            </button>
          </div>
          
          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-indigo-600 hover:text-indigo-500"
            >
              {isSignUp ? 'Zaten hesabın var mı? Giriş yap' : 'Hesabın yok mu? Kayıt ol'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login 