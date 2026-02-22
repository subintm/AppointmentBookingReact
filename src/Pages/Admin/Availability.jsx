import React, { useState, useEffect, useRef } from 'react'
import { toast } from 'react-toastify'
import Axioscall from '../../Services/Axioscall'

function OpenEditModal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-semibold text-base" style={{ fontFamily: "'Georgia', serif" }}>
            {title}
          </h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white text-xl leading-none">×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default function Availability() {
  const [availabilities, setAvailabilities] = useState([])
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [selectedServiceId, setSelectedServiceId] = useState('')

  const fetchAvailabilities = async () => {
    try {
      setLoading(true)
      const data = await Axioscall('GET', 'api/availability/GettallAvailability')
      setAvailabilities(data.data.data || [])
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchServices = async () => {
    try {
      const data = await Axioscall('GET', 'api/services/getAllServices')
      setServices(data.data || [])
    } catch (err) {
      toast.error(err.message)
    }
  }

  useEffect(() => {
    fetchAvailabilities()
    fetchServices()
  }, [])

  const handleAdd = async (formData) => {
    setSubmitting(true)
    try {
      await Axioscall('POST', 'api/availability/InsertAvailability', {
        serviceId: selectedServiceId,
        workingDays: formData.workingDays,
        startTime: formData.startTime,
        endTime: formData.endTime
      })
      toast.success('Availability added')
      setShowAdd(false)
      setSelectedServiceId('')
      fetchAvailabilities()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = async (formData) => {
    setSubmitting(true)
    try {
      await Axioscall('PUT', `api/availability/updateAvailability/${editTarget._id}`, {
        serviceId: editTarget.serviceId._id,
        workingDays: formData.workingDays,
        startTime: formData.startTime,
        endTime: formData.endTime
      })
      toast.success('Availability updated')
      setEditTarget(null)
      setShowAdd(false)
      fetchAvailabilities()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setSubmitting(true)
    try {
      await Axioscall('DELETE', `api/availability/deleteAvailability/${deleteTarget._id}`)
      toast.success('Availability deleted')
      setDeleteTarget(null)
      fetchAvailabilities()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const openAdd = (serviceId) => {
    const existing = availabilities.find(a => a.serviceId._id === serviceId)
    if (existing) {
      toast.error(`Service "${services.find(s => s._id === serviceId)?.name}" already has availability!`)
      return
    }
    setSelectedServiceId(serviceId)
    setShowAdd(true)
    setEditTarget(null)
  }

  const openEditModal = (availability) => {
    setEditTarget(availability)
    setShowAdd(true)
  }

  const DAY_SHORT = { Monday: 'Mo', Tuesday: 'Tu', Wednesday: 'We', Thursday: 'Th', Friday: 'Fr', Saturday: 'Sa', Sunday: 'Su' }
  const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  const AvailabilityForm = ({ onSubmit, label, initialData = {}, serviceName }) => {
    const [selectedDays, setSelectedDays] = useState(initialData.workingDays || [])
    const startTimeRef = useRef(null)
    const endTimeRef = useRef(null)

    const handleDayChange = (day) => {
      setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])
    }

    const handleSubmit = (e) => {
      e.preventDefault()
      const formData = {
        workingDays: selectedDays,
        startTime: startTimeRef.current?.value || '',
        endTime: endTimeRef.current?.value || ''
      }
      if (selectedDays.length === 0 || !formData.startTime || !formData.endTime) {
        toast.error('Please select days and times')
        return
      }
      onSubmit(formData)
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        {serviceName && (
          <div className="p-3 bg-zinc-800/50 border border-zinc-700 rounded-xl">
            <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-1">Service</label>
            <div className="text-white font-medium text-sm">{serviceName}</div>
          </div>
        )}
        <div className="space-y-1.5">
          <label className="block text-zinc-400 text-xs uppercase tracking-widest">Working Days</label>
          <div className="flex flex-wrap gap-2 p-3 bg-zinc-800/50 border border-zinc-700 rounded-xl">
            {ALL_DAYS.map(day => (
              <button
                type="button"
                key={day}
                onClick={() => handleDayChange(day)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  selectedDays.includes(day)
                    ? 'bg-white text-zinc-900 border-white'
                    : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-500 hover:text-zinc-200'
                }`}
              >
                {DAY_SHORT[day]}
              </button>
            ))}
          </div>
          {selectedDays.length > 0 && (
            <p className="text-xs text-zinc-500">{selectedDays.length} day{selectedDays.length > 1 ? 's' : ''} selected</p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="block text-zinc-400 text-xs uppercase tracking-widest">Start Time</label>
            <input ref={startTimeRef} type="time" defaultValue={initialData.startTime || ''}
              className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-zinc-500 transition-all" />
          </div>
          <div className="space-y-1.5">
            <label className="block text-zinc-400 text-xs uppercase tracking-widest">End Time</label>
            <input ref={endTimeRef} type="time" defaultValue={initialData.endTime || ''}
              className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-zinc-500 transition-all" />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => setShowAdd(false)}
            className="flex-1 bg-zinc-800 border border-zinc-700 text-zinc-300 text-sm rounded-lg py-3 hover:bg-zinc-700 transition-all">
            Cancel
          </button>
          <button type="submit" disabled={submitting}
            className="flex-1 bg-white text-zinc-950 font-semibold text-sm rounded-lg py-3 hover:bg-zinc-100 active:scale-[0.98] transition-all disabled:opacity-50">
            {submitting ? 'Saving...' : label}
          </button>
        </div>
      </form>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950">
  
      <header className="border-b border-zinc-800 px-4 sm:px-8 py-4 sticky top-0 bg-zinc-950 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-white font-semibold text-lg" style={{ fontFamily: "'Georgia', serif" }}>
              Manage Availability
            </h1>
            <p className="text-zinc-500 text-xs mt-0.5">{availabilities.length} schedule{availabilities.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-8 py-6 max-w-5xl mx-auto space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
          </div>
        ) : availabilities.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-zinc-500 text-sm mb-4">No availability schedules yet</p>
            <div className="flex flex-wrap gap-2 justify-center max-w-md mx-auto">
              {services.map((service) => (
                <button key={service._id} onClick={() => openAdd(service._id)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm rounded-lg border border-zinc-700 transition-all">
                  + {service.name}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
           
            <div className="flex flex-col gap-3">
              {availabilities.map((availability) => (
                <div key={availability._id}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 hover:border-zinc-700 transition-all">

                 
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-zinc-500 text-xs uppercase tracking-widest mb-0.5">Service</p>
                      <p className="text-white font-semibold text-sm">{availability.serviceId?.name || 'Unknown'}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ml-4">
                      <button onClick={() => openEditModal(availability)}
                        className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
                        title="Edit">✏️</button>
                      <button onClick={() => setDeleteTarget(availability)}
                        className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-950 transition-all"
                        title="Delete">🗑️</button>
                    </div>
                  </div>

                  
                  <div className="flex flex-row items-start gap-4">
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-zinc-500 text-xs uppercase tracking-widest mb-1.5">Working Days</p>
                      <div className="flex flex-wrap gap-1">
                        {ALL_DAYS.map(day => {
                          const active = availability.workingDays?.includes(day)
                          return (
                            <span key={day}
                              className={`px-2 py-0.5 rounded-md text-xs font-medium border ${
                                active
                                  ? 'bg-white/10 text-white border-white/20'
                                  : 'bg-transparent text-zinc-700 border-zinc-800'
                              }`}>
                              {DAY_SHORT[day]}
                            </span>
                          )
                        })}
                      </div>
                    </div>

                   
                    <div className="w-px self-stretch bg-zinc-800 shrink-0" />

                    {/* Hours */}
                    <div className="shrink-0">
                      <p className="text-zinc-500 text-xs uppercase tracking-widest mb-0.5">Hours</p>
                      <p className="text-white font-semibold text-sm tabular-nums whitespace-nowrap">
                        {availability.startTime} – {availability.endTime}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          
            <div className="pt-2 flex flex-wrap gap-2">
              {services.map((service) => {
                const hasAvailability = availabilities.some(a => a.serviceId._id === service._id)
                return (
                  <button key={service._id} onClick={() => openAdd(service._id)} disabled={hasAvailability}
                    className={`px-4 py-2 text-xs rounded-lg border transition-all flex items-center gap-1.5 ${
                      hasAvailability
                        ? 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700 hover:border-zinc-600'
                    }`}>
                    <span>{hasAvailability ? '✓' : '+'}</span>
                    {service.name}
                  </button>
                )
              })}
            </div>
          </>
        )}
      </main>

     
      {showAdd && (
        <OpenEditModal isOpen={showAdd} onClose={() => { setShowAdd(false); setSelectedServiceId(''); setEditTarget(null) }}
          title={editTarget ? 'Edit Availability' : 'Add Availability'}>
          <AvailabilityForm
            onSubmit={editTarget ? handleEdit : handleAdd}
            label={editTarget ? 'Save Changes' : 'Add Schedule'}
            initialData={editTarget || {}}
            serviceName={services.find(s => s._id === selectedServiceId || s._id === editTarget?.serviceId?._id)?.name}
          />
        </OpenEditModal>
      )}

    
      {deleteTarget && (
        <OpenEditModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Schedule">
          <div className="text-center">
            <p className="text-zinc-400 text-sm mb-6">
              Delete <span className="text-white font-medium">"{deleteTarget.serviceId?.name}"</span> schedule?
              <br /><span className="text-zinc-600 text-xs">This cannot be undone.</span>
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)}
                className="flex-1 bg-zinc-800 border border-zinc-700 text-zinc-300 text-sm rounded-lg py-3 hover:bg-zinc-700 transition-all">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={submitting}
                className="flex-1 bg-red-900 border border-red-700 text-red-200 text-sm font-semibold rounded-lg py-3 hover:bg-red-800 transition-all disabled:opacity-50">
                {submitting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </OpenEditModal>
      )}
    </div>
  )
}