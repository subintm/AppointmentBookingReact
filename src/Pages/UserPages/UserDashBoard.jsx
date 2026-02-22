import React, { useState, useEffect } from 'react';
import Axioscall from '../../Services/Axioscall';
import { toast } from 'react-toastify';
import { WorkingDayCalendar } from '../../Component/WorkingDayCalendar';
import { formatDate, getMinDate } from '../../Services/helpers';


function UserDashboard() {
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedViewDate, setSelectedViewDate] = useState(() => new Date().toISOString().split('T')[0]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [serviceDetails, setServiceDetails] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    mobile: '',
    address: '',
    amount: '',
  });

  const UserId = localStorage.getItem('UserId');

  const fetchServices = async () => {
    try {
      const res = await Axioscall('GET', 'api/services/getAllServices');
      setServices(res.data || []);
    } catch (err) {
      toast.error('Failed to load services');
    }
  };

  const fetchBookings = async (date) => {
    if (!UserId || !date) return;
    setLoading(true);
    try {
      const res = await Axioscall(
        'GET',
        `api/appointments/getAllappointments/user/${UserId}/${date}`
      );

      console.log('Bookings response:', res);

      if (res?.status === 200 || res?.success) {
        setBookings(res.data?.data || res.data || []);
      } else {
        setBookings([]);
      }
    } catch (err) {
      toast.error('Could not load appointments');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
    fetchBookings(selectedViewDate);
  }, []);

  useEffect(() => {
    fetchBookings(selectedViewDate);
  }, [selectedViewDate]);

  const openNewModal = () => {
    setEditingAppointment(null);
    setSelectedService(null);
    setServiceDetails(null);
    setSelectedDate('');
    setSelectedSlot('');
    setAvailableSlots([]);
    setFormData({ name: '', age: '', mobile: '', address: '', amount: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (booking) => {
    setEditingAppointment(booking);

    setFormData({
      name: booking.name || '',
      age: booking.age ? String(booking.age) : '',
      mobile: booking.mobile || '',
      address: booking.address || '',
      amount: booking.amount ? String(booking.amount) : '',
    });

    const service = services.find(s => s._id === booking.serviceId);
    setSelectedService(service || null);

    const dateStr = booking.date ? new Date(booking.date).toISOString().split('T')[0] : '';
    setSelectedDate(dateStr);
    setSelectedSlot(booking.slot || '');

    if (service) {
      handleViewSlotsForService(service._id);
    }

    setIsModalOpen(true);
  };

  const handleViewSlotsForService = async (serviceId) => {
    try {
      setLoading(true);
      const res = await Axioscall('GET', `api/availability/GetAvailabilityserviceId/${serviceId}`);
      setServiceDetails(res.data);
      const slots = res.data?.slots || res.data?.availableSlots || [];
      setAvailableSlots(slots);
    } catch (err) {
      console.warn('Failed to load slots during edit');
    } finally {
      setLoading(false);
    }
  };

  const handleServiceChange = (e) => {
    const serviceId = e.target.value;
    const service = services.find((s) => s._id === serviceId);
    setSelectedService(service);
    setServiceDetails(null);
    setFormData((prev) => ({ ...prev, amount: service?.price || '' }));
    setSelectedDate('');
    setSelectedSlot('');
    setAvailableSlots([]);
  };

  const getWorkingDays = () => {
    return serviceDetails?.workingDays || selectedService?.workingDays || [];
  };

  const handleViewSlots = async () => {
    if (!selectedService) {
      toast.warn('Please select a service first');
      return;
    }
    try {
      setLoading(true);
      const url = `api/availability/GetAvailabilityserviceId/${selectedService._id}`;
      const res = await Axioscall('GET', url);
      setServiceDetails(res.data);
      const slots = res.data?.slots || res.data?.availableSlots || selectedService?.slots || [];
      setAvailableSlots(slots);
      if (slots.length === 0) toast.info('No time slots configured');
      else toast.success('Slots loaded');
    } catch (err) {
      toast.error('Failed to load availability');
      setAvailableSlots(selectedService?.slots || []);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedService || !selectedDate || !selectedSlot) {
      toast.error('Service, date and time slot are required');
      return;
    }
    if (!formData.name || !formData.age || !formData.mobile || !formData.address) {
      toast.error('Please fill all personal details');
      return;
    }

    const payload = {
      UserId,
      name: formData.name,
      age: Number(formData.age),
      date: selectedDate,
      slot: selectedSlot,
      serviceName: selectedService?.serviceName || selectedService?.name || 'Service',
      serviceId: selectedService?._id,
      mobile: formData.mobile,
      address: formData.address,
      amount: Number(formData.amount || selectedService?.price || 0),
      Status: 'BOOKED',
    };

    try {
      setLoading(true);

      if (editingAppointment) {
        await Axioscall(
          'PUT',
          `api/appointments/updateAppointment/${editingAppointment._id}`,
          payload
        );
        toast.success('Appointment updated!');
      } else {
        await Axioscall('POST', 'api/appointments/insertAppointment', payload);
        toast.success('Booking confirmed!');
      }

      closeModal();
      fetchBookings(selectedViewDate);
    } catch (err) {
      toast.error(err.response?.data?.message || (editingAppointment ? 'Update failed' : 'Booking failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Cancel this appointment?')) return;

    try {
      await Axioscall('PUT', `api/appointments/updateAppointment/${appointmentId}`, {
        Status: 'Canceled',
      });
      toast.success('Appointment cancelled');
      fetchBookings(selectedViewDate);
    } catch (err) {
      toast.error('Failed to cancel appointment');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAppointment(null);
    setSelectedService(null);
    setServiceDetails(null);
    setSelectedDate('');
    setSelectedSlot('');
    setAvailableSlots([]);
    setFormData({ name: '', age: '', mobile: '', address: '', amount: '' });
  };



  useEffect(() => {
    if (!selectedService || !selectedDate) {
      setAvailableSlots([]);
      return;
    }

  const fetchSlots = async () => {
  try {
    setLoading(true);

    const url = `api/availability/getAvailabilityByServiceIdANDDate/${selectedService._id}/${selectedDate}`;
    const res = await Axioscall('GET', url);

    let slots = res.data?.AvailableSlots || [];
    const isToday = res.data?.IsToday;

    if (isToday) {
      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();

      slots = slots.filter((slot) => {
        const [hours, minutes] = slot.split(":").map(Number);

        if (hours > currentHours) return true;
        if (hours === currentHours && minutes > currentMinutes) return true;

        return false;
      });
    }

    console.log("Filtered Slots:", slots);
    setAvailableSlots(slots);

  } catch (err) {
    toast.error('Failed to load slots for selected date');
    setAvailableSlots([]);
  } finally {
    setLoading(false);
  }
};

    fetchSlots();
  }, [selectedService?._id, selectedDate]);


  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold">My Dashboard</h1>
          <button
            onClick={openNewModal}
            className="bg-white text-zinc-950 px-6 py-3 rounded-lg font-semibold hover:bg-zinc-200 transition"
          >
            Book a New Slot
          </button>
        </div>

        <div className="mb-10 bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <label className="block text-zinc-400 text-sm mb-2 font-medium">
            View Appointments for Date
          </label>
          <input
            type="date"
            value={selectedViewDate}
            onChange={(e) => setSelectedViewDate(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-zinc-500 w-full max-w-xs"
          />
          <p className="mt-2 text-xs text-zinc-500">
            Showing: <strong>{formatDate(selectedViewDate)}</strong>
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl mb-12">
          <h2 className="text-xl font-semibold mb-5">My Appointments</h2>

          {loading ? (
            <div className="text-center py-12 text-zinc-400">Loading...</div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              No appointments on {formatDate(selectedViewDate)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left text-zinc-300">
                <thead className="text-xs uppercase bg-zinc-800">
                  <tr>
                    <th className="px-6 py-4">Service</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Time</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {bookings.map((b) => {
                    const status = (b.Status || b.status || '').toUpperCase();

                    return (
                      <tr key={b._id} className="hover:bg-zinc-800/50 transition">
                        <td className="px-6 py-4">{b.serviceName || '—'}</td>
                        <td className="px-6 py-4">{formatDate(b.date)}</td>
                        <td className="px-6 py-4">{b.slot || '—'}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${status === 'CANCELED' || status === 'CANCELLED'
                                ? 'bg-red-900/50 text-red-300'
                                : status === 'COMPLETED'
                                  ? 'bg-blue-900/50 text-blue-300'
                                  : 'bg-green-900/50 text-green-300'
                              }`}
                          >
                            {status || 'BOOKED'}
                          </span>
                        </td>
                        <td className="px-6 py-4 flex gap-4">
                          {status === 'BOOKED' && (
                            <>
                              <button
                                onClick={() => openEditModal(b)}
                                className="text-blue-400 hover:text-blue-300 font-medium underline"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleCancelAppointment(b._id)}
                                className="text-red-400 hover:text-red-300 font-medium underline"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-semibold mb-6 text-center">
              {editingAppointment ? 'Edit Appointment' : 'Book an Appointment'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-zinc-400 text-sm mb-1.5 uppercase tracking-wider">
                  Service
                </label>
                <select
                  value={selectedService?._id || ''}
                  onChange={handleServiceChange}

                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-zinc-500 disabled:opacity-60 disabled:cursor-not-allowed"
                  required
                >
                  <option value="">Select a service</option>
                  {services.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.serviceName || s.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleViewSlots}
                disabled={!selectedService || loading}
                className="w-full bg-zinc-700 hover:bg-zinc-600 text-white py-3 rounded-lg font-medium disabled:opacity-50 transition"
              >
                {loading ? 'Loading...' : 'View Available Slots'}
              </button>

              {selectedService && (
                <div className="bg-zinc-800/80 border border-zinc-600 rounded-lg p-4 text-center">
                  <p className="text-zinc-300 text-sm mb-2">Available only on:</p>
                  <div className="flex flex-wrap justify-center gap-3">
                    {getWorkingDays().map((day) => (
                      <span key={day} className="bg-zinc-700 text-white px-4 py-1.5 rounded-full text-sm font-medium">
                        {day}
                      </span>
                    ))}
                    {getWorkingDays().length === 0 && (
                      <span className="text-yellow-400">No working days specified</span>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-zinc-400 text-sm mb-1.5 uppercase tracking-wider">
                  Preferred Date
                </label>
                {!selectedService ? (
                  <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6 text-center text-zinc-500 text-sm">
                    Select a service first
                  </div>
                ) : (
                  <WorkingDayCalendar
                    value={selectedDate}
                    onChange={(dateStr) => {
                      setSelectedDate(dateStr);
                      setSelectedSlot('');
                    }}
                    minDate={getMinDate()}
                    workingDays={getWorkingDays()}
                  />
                )}

                {selectedDate && (
                  <p className="text-green-400 text-xs mt-2 text-center">
                    Selected: {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                )}
              </div>

              {availableSlots.length > 0 && (
                <div>
                  <label className="block text-zinc-400 text-sm mb-2 uppercase tracking-wider">
                    Time Slots
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-2.5 px-4 rounded-lg text-sm font-medium transition ${selectedSlot === slot ? 'bg-white text-zinc-950 shadow-md' : 'bg-zinc-800 hover:bg-zinc-700'
                          }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedService && availableSlots.length === 0 && !loading && (
                <p className="text-yellow-400 text-center py-2">No time slots available</p>
              )}

              <div className="space-y-4 pt-4 border-t border-zinc-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-400 text-sm mb-1">Full Name</label>
                    <input name="name" value={formData.name} onChange={handleInputChange} required className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3" />
                  </div>
                  <div>
                    <label className="block text-zinc-400 text-sm mb-1">Age</label>
                    <input name="age" type="number" min="1" value={formData.age} onChange={handleInputChange} required className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 text-sm mb-1">Mobile Number</label>
                  <input name="mobile" value={formData.mobile} onChange={handleInputChange} required className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3" />
                </div>

                <div>
                  <label className="block text-zinc-400 text-sm mb-1">Address</label>
                  <textarea name="address" value={formData.address} onChange={handleInputChange} required rows={2} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3" />
                </div>

                <div>
                  <label className="block text-zinc-400 text-sm mb-1">Amount (₹)</label>
                  <input name="amount" type="number" value={formData.amount} readOnly className="w-full bg-zinc-800/70 border border-zinc-700 rounded-lg px-4 py-3 cursor-not-allowed text-zinc-300" />
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={closeModal} className="flex-1 bg-zinc-700 hover:bg-zinc-600 py-3 rounded-lg transition">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !selectedService || !selectedDate || !selectedSlot}
                  className="flex-1 bg-green-600 hover:bg-green-700 py-3 rounded-lg font-semibold transition disabled:opacity-50"
                >
                  {loading ? 'Saving...' : editingAppointment ? 'Update Appointment' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserDashboard;