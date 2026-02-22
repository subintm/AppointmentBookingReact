import React, { useEffect, useState } from 'react'
import Axioscall from '../../Services/Axioscall'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

export default function AdminLogin() {
  const [form, setForm] = useState({ name: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await Axioscall('POST', 'api/admin/adminLogin', form, false)

   
      const data = res.data || res

      localStorage.setItem('token', data.token)
      localStorage.setItem('UserId', data?.UserId)


      if (data.role === "admin") {
        navigate('/admindashboard')
      } else { 
        navigate('/userdashboard')
      }
      toast.success('Login successful!')

    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
     localStorage.clear()
      navigate('/')
  }, [])

  return (
    <div className="min-h-screen w-full bg-zinc-950 flex items-center justify-center px-4">
      
      <div
        className="fixed inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative w-full max-w-sm">
       
        <div className="h-[3px] w-full bg-gradient-to-r from-transparent via-white to-transparent mb-8 opacity-30 rounded-full" />

       
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
    
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 mb-4">
              <div className="w-4 h-4 bg-white rounded-sm opacity-90" />
            </div>
            <h1
              className="text-white text-2xl font-semibold tracking-tight"
              style={{ fontFamily: "'Georgia', serif", letterSpacing: '-0.02em' }}
            >
              Login
            </h1>
          </div>

       
          <form onSubmit={handleSubmit} className="space-y-4">
           
            <div className="space-y-1.5">
              <label
                className="block text-zinc-400 text-xs font-medium tracking-widest uppercase"
                style={{ letterSpacing: '0.1em' }}
              >
                Username
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                autoComplete="username"
                placeholder="Enter username"
                className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-4 py-3 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all duration-200"
              />
            </div>

          
            <div className="space-y-1.5">
              <label
                className="block text-zinc-400 text-xs font-medium tracking-widest uppercase"
                style={{ letterSpacing: '0.1em' }}
              >
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                placeholder="Enter password"
                className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-4 py-3 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all duration-200"
              />
            </div>
            <p>
              <Link to="register" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors duration-150">
                Not an admin and don’t have an account yet? Create one here              </Link>
            </p>
          
            {error && (
              <div className="bg-red-950 border border-red-800 text-red-300 text-xs px-4 py-2.5 rounded-lg">
                {error}
              </div>
            )}

          
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-white text-zinc-950 font-semibold text-sm rounded-lg py-3 hover:bg-zinc-100 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed tracking-wide"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-zinc-400 border-t-zinc-800 rounded-full animate-spin inline-block" />
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

       
        <div className="h-[3px] w-full bg-gradient-to-r from-transparent via-white to-transparent mt-8 opacity-10 rounded-full" />
      </div>
    </div>
  )
}