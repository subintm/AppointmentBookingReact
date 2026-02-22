import React, { useState } from 'react';
import Axioscall from '../../Services/Axioscall'; 
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await Axioscall('POST', 'api/auth/register', form, false);

      const data = res.data || res;

      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      alert('Registration successful! Please sign in.');
      navigate('/'); 

    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
              Register
            </h1>
          </div>

        
          <form onSubmit={handleSubmit} className="space-y-4">
           
            <div className="space-y-1.5">
              <label
                className="block text-zinc-400 text-xs font-medium tracking-widest uppercase"
                style={{ letterSpacing: '0.1em' }}
              >
                Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                autoComplete="name"
                placeholder="Enter your name"
                className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-4 py-3 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all duration-200"
              />
            </div>

           
            <div className="space-y-1.5">
              <label
                className="block text-zinc-400 text-xs font-medium tracking-widest uppercase"
                style={{ letterSpacing: '0.1em' }}
              >
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
                placeholder="name@example.com"
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
                autoComplete="new-password"
                placeholder="Create a password"
                className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-4 py-3 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all duration-200"
              />
            </div>

            <p className="text-xs text-zinc-500">
              Already have an account?{' '}
              <Link
                to="/"
                className="text-zinc-300 hover:text-white transition-colors duration-150"
              >
                Sign in
              </Link>
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
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        </div>

   
        <div className="h-[3px] w-full bg-gradient-to-r from-transparent via-white to-transparent mt-8 opacity-10 rounded-full" />
      </div>
    </div>
  );
}