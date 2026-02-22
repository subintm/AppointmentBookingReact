import React, { useState, useEffect } from 'react';
import Axioscall from '../../Services/Axioscall'; 
import { toast } from 'react-toastify';
import { formatDate } from '../../Services/helpers';

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

 
  const fetchAppointments = async (date) => {
    setLoading(true);
    try {
      const res = await Axioscall(
        'GET',
        `api/appointments/getAllappointments/by-date?date=${date}`
      );

      if (res?.status === 200 || res?.success) {
        setAppointments(res.data?.data || res.data || []);
      } else {
        setAppointments([]);
        toast.info('No appointments found for this date');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load appointments');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };


  const updateStatus = async (appointmentId, newStatus) => {
    const actionWord = newStatus === 'COMPLETED' ? 'complete' : 'cancel';

    if (!window.confirm(`Are you sure you want to ${actionWord} this appointment?`)) {
      return;
    }

    try {
      await Axioscall('PUT', `api/appointments/updateAppointment/${appointmentId}`, {
        Status: newStatus, 
      });

      toast.success(`Appointment marked as ${newStatus}`);
      fetchAppointments(selectedDate); 
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${actionWord} appointment`);
    }
  };

  
  useEffect(() => {
    fetchAppointments(selectedDate);
  }, [selectedDate]);
 
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin - All Appointments</h1>

        <div className="mb-10 bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <label className="block text-zinc-400 text-sm mb-2 font-medium">
            Select Date to View Appointments
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-zinc-500 w-full max-w-xs"
          />
          <p className="mt-2 text-xs text-zinc-500">
            Showing appointments for: <strong>{formatDate(selectedDate)}</strong>
          </p>
        </div>

      
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold mb-5">Appointments List</h2>

          {loading ? (
            <div className="text-center py-12 text-zinc-400">Loading appointments...</div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              No appointments found for {formatDate(selectedDate)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left text-zinc-300">
                <thead className="text-xs uppercase bg-zinc-800">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Service</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Time</th>
                    <th className="px-6 py-4">Mobile</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {appointments.map((appt) => {
                    const status = (appt.Status || appt.status || '').toUpperCase();

                    return (
                      <tr key={appt._id} className="hover:bg-zinc-800/50 transition">
                        <td className="px-6 py-4">{appt.name || '—'}</td>
                        <td className="px-6 py-4">{appt.serviceName || '—'}</td>
                        <td className="px-6 py-4">{formatDate(appt.date)}</td>
                        <td className="px-6 py-4">{appt.slot || '—'}</td>
                        <td className="px-6 py-4">{appt.mobile || '—'}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              status === 'CANCELED' || status === 'CANCELLED'
                                ? 'bg-red-900/50 text-red-300'
                                : status === 'COMPLETED'
                                ? 'bg-blue-900/50 text-blue-300'
                                : status === 'BOOKED' || status === 'PENDING' || status === 'CONFIRMED'
                                ? 'bg-green-900/50 text-green-300'
                                : 'bg-gray-900/50 text-gray-300'
                            }`}
                          >
                            {status || 'BOOKED'}
                          </span>
                        </td>
                        <td className="px-6 py-4 flex gap-3">
                          {status !== 'CANCELED' && status !== 'COMPLETED' && (
                            <>
                              <button
                                onClick={() => updateStatus(appt._id, 'COMPLETED')}
                                className="text-blue-400 hover:text-blue-300 text-sm font-medium underline"
                              >
                                Complete
                              </button>
                              <button
                                onClick={() => updateStatus(appt._id, 'Canceled')}
                                className="text-red-400 hover:text-red-300 text-sm font-medium underline"
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
    </div>
  );
}

export default Appointments;