import React, { useState, useEffect, useRef } from 'react'
import { toast } from 'react-toastify'
import Axioscall from '../../Services/Axioscall'

// Modal component
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-2xl p-6 shadow-2xl">
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

export default function Service() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [showAdd, setShowAdd] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const fetchServices = async () => {
    try {
      setLoading(true)
      const data = await Axioscall('GET', 'api/services/getAllServices')
      setServices(data.data || [])
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchServices() }, [])

  const handleDelete = async () => {
    setSubmitting(true)
    try {
      await Axioscall('DELETE', `api/services/DeleteService/${deleteTarget._id}`)
      toast.success('Service deleted')
      setDeleteTarget(null)
      fetchServices()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const openEdit = (svc) => {
    setEditTarget(svc)
    setShowAdd(false)
  }


  const FormFields = ({ onSubmit, label, initialData = {} }) => {
    const nameRef = useRef(null)
    const durationRef = useRef(null)
    const priceRef = useRef(null)

    const handleSubmit = (e) => {
      e.preventDefault()
      const formData = {
        name: nameRef.current?.value || '',
        duration: durationRef.current?.value || '',
        price: priceRef.current?.value || ''
      }
      
      if (!formData.name || !formData.duration || !formData.price) {
        toast.error('All fields required')
        return
      }
      
      onSubmit(formData)
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-zinc-400 text-xs uppercase tracking-widest">Service Name</label>
          <input
            ref={nameRef}
            name="name"
            type="text"
            defaultValue={initialData.name || ''}
            placeholder="e.g. Hair Cut"
            className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-4 py-3 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-all"
            autoComplete="off"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="block text-zinc-400 text-xs uppercase tracking-widest">Duration (min)</label>
            <input
              ref={durationRef}
              name="duration"
              type="number"
              defaultValue={initialData.duration || ''}
              placeholder="30"
              className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-4 py-3 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              autoComplete="off"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-zinc-400 text-xs uppercase tracking-widest">Charge (₹)</label>
            <input
              ref={priceRef}
              name="price"
              type="number"
              defaultValue={initialData.price || ''}
              placeholder="500"
              className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-4 py-3 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              autoComplete="off"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full mt-2 bg-white text-zinc-950 font-semibold text-sm rounded-lg py-3 hover:bg-zinc-100 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {submitting ? 'Saving...' : label}
        </button>
      </form>
    )
  }

  const handleAdd = async (formData) => {
    setSubmitting(true)
    try {
      await Axioscall('POST', 'api/services/insertService', {
        name: formData.name,
        duration: Number(formData.duration),
        price: Number(formData.price)
      })
      toast.success('Service added')
      setShowAdd(false)
      fetchServices()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = async (formData) => {
    setSubmitting(true)
    try {
      await Axioscall('PUT', `api/services/UpdateService/${editTarget._id}`, {
        name: formData.name,
        duration: Number(formData.duration),
        price: Number(formData.price)
      })
      toast.success('Service updated')
      setEditTarget(null)
      setShowAdd(false)
      fetchServices()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="border-b border-zinc-800 px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 bg-zinc-950 z-10">
        <div>
          <h1 className="text-white font-semibold text-lg" style={{ fontFamily: "'Georgia', serif" }}>
            Manage Services
          </h1>
          <p className="text-zinc-500 text-xs mt-0.5">{services.length} total</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-white text-zinc-950 font-semibold text-sm rounded-xl px-4 py-2.5 hover:bg-zinc-100 active:scale-[0.97] transition-all"
        >
          + Add Service
        </button>
      </header>

      <main className="px-4 sm:px-8 py-6 max-w-4xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
          </div>
        ) : services.length === 0 ? (
          <p className="text-zinc-500 text-sm text-center py-20">No services yet. Add one!</p>
        ) : (
          <>
            <div className="hidden sm:block overflow-hidden border border-zinc-800 rounded-2xl">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900">
                    <th className="text-left text-zinc-400 font-medium text-xs uppercase tracking-widest px-5 py-4">#</th>
                    <th className="text-left text-zinc-400 font-medium text-xs uppercase tracking-widest px-5 py-4">Service</th>
                    <th className="text-left text-zinc-400 font-medium text-xs uppercase tracking-widest px-5 py-4">Duration</th>
                    <th className="text-left text-zinc-400 font-medium text-xs uppercase tracking-widest px-5 py-4">Charge</th>
                    <th className="text-right text-zinc-400 font-medium text-xs uppercase tracking-widest px-5 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((svc, i) => (
                    <tr key={svc._id} className="border-b border-zinc-800/60 last:border-0 hover:bg-zinc-900/50 transition-colors">
                      <td className="px-5 py-4 text-zinc-600 text-xs">{i + 1}</td>
                      <td className="px-5 py-4 text-white font-medium">{svc.name}</td>
                      <td className="px-5 py-4">
                        <span className="text-zinc-300 bg-zinc-800 border border-zinc-700 rounded-full px-3 py-1 text-xs">
                          {svc.duration} min
                        </span>
                      </td>
                      <td className="px-5 py-4 text-white font-semibold">₹{svc.price}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(svc)}
                            className="text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs rounded-lg px-3 py-1.5 transition-all"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteTarget(svc)}
                            className="text-red-400 hover:text-red-300 bg-red-950 hover:bg-red-900 border border-red-800 text-xs rounded-lg px-3 py-1.5 transition-all"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="sm:hidden space-y-3">
              {services.map((svc, i) => (
                <div key={svc._id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-white font-semibold">{svc.name}</p>
                      <p className="text-zinc-500 text-xs mt-0.5">{svc.duration} min</p>
                    </div>
                    <span className="text-white font-bold text-lg">₹{svc.price}</span>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => openEdit(svc)}
                      className="text-zinc-400 bg-zinc-800 border border-zinc-700 text-xs rounded-lg px-3 py-1.5"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(svc)}
                      className="text-red-400 bg-red-950 border border-red-800 text-xs rounded-lg px-3 py-1.5"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {showAdd && !editTarget && (
        <Modal title="Add Service" onClose={() => setShowAdd(false)}>
          <FormFields onSubmit={handleAdd} label="Add Service" />
        </Modal>
      )}

      {editTarget && (
        <Modal title="Edit Service" onClose={() => { 
          setEditTarget(null); 
          setShowAdd(false);
        }}>
          <FormFields 
            onSubmit={handleEdit} 
            label="Save Changes" 
            initialData={{
              name: editTarget.name,
              duration: editTarget.duration,
              price: editTarget.price
            }}
          />
        </Modal>
      )}

      {deleteTarget && (
        <Modal title="Delete Service" onClose={() => setDeleteTarget(null)}>
          <p className="text-zinc-400 text-sm mb-6">
            Delete <span className="text-white font-medium">"{deleteTarget.name}"</span>? This cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteTarget(null)}
              className="flex-1 bg-zinc-800 border border-zinc-700 text-zinc-300 text-sm rounded-lg py-3 hover:bg-zinc-700 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={submitting}
              className="flex-1 bg-red-900 border border-red-700 text-red-200 text-sm font-semibold rounded-lg py-3 hover:bg-red-800 transition-all disabled:opacity-50"
            >
              {submitting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
