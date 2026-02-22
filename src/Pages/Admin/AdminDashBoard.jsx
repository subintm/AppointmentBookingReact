import React from 'react'
import { useNavigate } from 'react-router-dom'

const cards = [
  {
    title: 'View Appointments',
    description: 'See all scheduled bookings',
    route: '/appointmentPage',
    bg: 'bg-zinc-800',
    hover: 'hover:bg-zinc-700',
    accent: 'bg-white',
  },
  {
    title: 'Manage Services',
    description: 'Add, edit or remove services',
    route: '/servicePage',
    bg: 'bg-zinc-800',
    hover: 'hover:bg-zinc-700',
    accent: 'bg-white',
  },
  {
    title: 'Manage Availability',
    description: 'Set your open time slots',
    route: '/availabilityPage',
    bg: 'bg-zinc-800',
    hover: 'hover:bg-zinc-700',
    accent: 'bg-white',
  },
  {
    title: 'Logout',
    description: 'Sign out of admin portal',
    route: '/',
    bg: 'bg-red-950',
    hover: 'hover:bg-red-900',
    accent: 'bg-red-400',
    danger: true,
  },
]

export default function AdminDashBoard() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/')
  }

  const handleNav = (card) => {
    if (card.danger) {
      handleLogout()
    } else {
      navigate(card.route)
    }
  }

  return (
    <div className="min-h-screen w-full bg-zinc-950 flex flex-col">
      
      <header className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-white rounded-md flex items-center justify-center">
            <div className="w-3 h-3 bg-zinc-950 rounded-sm" />
          </div>
          <span
            className="text-white text-lg font-semibold tracking-tight"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            Admin Portal
          </span>
        </div>
        <span className="text-zinc-500 text-xs tracking-widest uppercase">Dashboard</span>
      </header>

  
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
       
        <div className="text-center mb-10">
          <h2
            className="text-white text-3xl font-semibold mb-2"
            style={{ fontFamily: "'Georgia', serif", letterSpacing: '-0.02em' }}
          >
            Welcome back
          </h2>
          <p className="text-zinc-500 text-sm">Select an option to get started</p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl">
          {cards.map((card) => (
            <button
              key={card.title}
              onClick={() => handleNav(card)}
              className={`
                ${card.bg} ${card.hover}
                border border-zinc-700/50
                rounded-2xl p-6 text-left
                transition-all duration-200
                active:scale-[0.97]
                group cursor-pointer
                flex flex-col gap-3
                ${card.danger ? 'border-red-900/50' : ''}
              `}
            >
           
              <div className={`w-2.5 h-2.5 rounded-full ${card.accent} opacity-80`} />

              <div>
                <h3 className={`font-semibold text-base mb-1 ${card.danger ? 'text-red-300' : 'text-white'}`}>
                  {card.title}
                </h3>
                <p className={`text-xs leading-relaxed ${card.danger ? 'text-red-500/70' : 'text-zinc-500'}`}>
                  {card.description}
                </p>
              </div>

              
              <div className={`text-xs mt-1 tracking-wide ${card.danger ? 'text-red-400' : 'text-zinc-400'} group-hover:translate-x-1 transition-transform duration-150`}>
                {card.danger ? 'Sign out →' : 'Open →'}
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  )
}