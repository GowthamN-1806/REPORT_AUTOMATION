import { useState } from 'react';
import { Search, Plus, X, ChevronLeft, ChevronRight, Clock, User, Calendar } from 'lucide-react';
import { mockAppointments } from '../data/mockData';

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  Scheduled: { bg: '#EEF9FB', text: '#0B8294', dot: '#3CC0D0' },
  'Checked-In': { bg: '#FFF7ED', text: '#B45E0B', dot: '#F6A623' },
  Completed: { bg: '#F0FDF4', text: '#15803D', dot: '#22C55E' },
  Cancelled: { bg: '#FEF2F2', text: '#B91C1C', dot: '#EF4444' },
};

const doctors = ['All Doctors', 'Dr. Priya Sharma', 'Dr. Anil Kapoor', 'Dr. Rekha Nair'];

const timeSlots = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
];

const bookedSlots = ['09:00 AM', '10:30 AM', '02:00 PM'];

export function Appointments() {
  const [search, setSearch] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('All Doctors');
  const [showAdd, setShowAdd] = useState(false);
  const [selectedDate, setSelectedDate] = useState(12);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [form, setForm] = useState({
    patient: '', doctor: 'Dr. Priya Sharma', serviceType: '', session: 'Morning', date: '2026-03-12',
  });

  const filtered = mockAppointments.filter(a =>
    (a.patientName.toLowerCase().includes(search.toLowerCase()) || a.patientId.toLowerCase().includes(search.toLowerCase())) &&
    (doctorFilter === 'All Doctors' || a.doctor === doctorFilter)
  );

  const calendarDays = Array.from({ length: 31 }, (_, i) => i + 1);
  const today = 12;

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1F2A5A' }}>Appointments</h1>
          <p className="text-sm" style={{ color: '#6B7280' }}>{filtered.length} total appointments</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium"
          style={{ background: 'linear-gradient(135deg, #1F2A5A, #3CC0D0)', boxShadow: '0 4px 15px rgba(60,192,208,0.35)' }}>
          <Plus size={16} /> Add Appointment
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 mb-4 flex flex-wrap gap-3 items-center" style={{ boxShadow: '0 2px 15px rgba(0,0,0,0.06)' }}>
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} />
          <input type="text" placeholder="Search patient name or ID..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl text-sm outline-none"
            style={{ background: '#F4F7FB', border: '1.5px solid #E5E7EB', fontFamily: 'Poppins' }} />
        </div>
        <select value={doctorFilter} onChange={e => setDoctorFilter(e.target.value)}
          className="px-3 py-2 rounded-xl text-sm outline-none" style={{ border: '1.5px solid #E5E7EB', fontFamily: 'Poppins', color: '#374151' }}>
          {doctors.map(d => <option key={d}>{d}</option>)}
        </select>
        <input type="date" defaultValue="2026-03-12"
          className="px-3 py-2 rounded-xl text-sm outline-none" style={{ border: '1.5px solid #E5E7EB', fontFamily: 'Poppins', color: '#374151' }} />
        {/* Status Filter */}
        <div className="flex gap-1.5">
          {Object.entries(statusColors).map(([status, colors]) => (
            <span key={status} className="text-xs px-2.5 py-1 rounded-full font-medium cursor-pointer"
              style={{ background: colors.bg, color: colors.text }}>
              {status}
            </span>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 2px 15px rgba(0,0,0,0.06)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: '#F8F9FB' }}>
                {['Patient Name', 'Patient ID', 'Service Type', 'Doctor', 'Date', 'Time', 'Session', 'Status'].map(col => (
                  <th key={col} className="text-left px-5 py-4 text-xs font-semibold" style={{ color: '#6B7280' }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((appt, i) => {
                const sc = statusColors[appt.status] || statusColors.Scheduled;
                return (
                  <tr key={appt.id} className="border-t hover:bg-blue-50/20 transition-colors" style={{ borderColor: '#F3F4F6' }}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                          style={{ background: `linear-gradient(135deg, hsl(${i * 40}, 55%, 45%), hsl(${i * 40 + 30}, 55%, 55%))` }}>
                          {appt.patientName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-sm font-medium" style={{ color: '#1F2A5A' }}>{appt.patientName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-bold px-2 py-1 rounded-lg" style={{ background: '#EEF2FF', color: '#1F2A5A' }}>{appt.patientId}</span>
                    </td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: '#374151' }}>{appt.serviceType}</td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: '#374151' }}>{appt.doctor}</td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: '#6B7280' }}>{appt.date}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1 text-sm" style={{ color: '#6B7280' }}>
                        <Clock size={12} /> {appt.time}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: '#F4F7FB', color: '#6B7280' }}>
                        {appt.session}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: sc.dot }} />
                        <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: sc.bg, color: sc.text }}>
                          {appt.status}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Appointment Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#F3F4F6' }}>
              <div>
                <h2 className="font-bold text-lg" style={{ color: '#1F2A5A' }}>Book New Appointment</h2>
                <p className="text-xs" style={{ color: '#6B7280' }}>Select a doctor and available time slot</p>
              </div>
              <button onClick={() => setShowAdd(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100">
                <X size={18} style={{ color: '#6B7280' }} />
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>Patient Name</label>
                  <input type="text" placeholder="Search patient..." value={form.patient} onChange={e => setForm({ ...form, patient: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ border: '1.5px solid #E5E7EB', fontFamily: 'Poppins' }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>Select Doctor</label>
                  <select value={form.doctor} onChange={e => setForm({ ...form, doctor: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ border: '1.5px solid #E5E7EB', fontFamily: 'Poppins' }}>
                    <option>Dr. Priya Sharma</option>
                    <option>Dr. Anil Kapoor</option>
                    <option>Dr. Rekha Nair</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>Service Type</label>
                  <select value={form.serviceType} onChange={e => setForm({ ...form, serviceType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ border: '1.5px solid #E5E7EB', fontFamily: 'Poppins' }}>
                    <option value="">Select service...</option>
                    <option>Fertility Consultation</option>
                    <option>IVF Procedure</option>
                    <option>IUI Procedure</option>
                    <option>Scan</option>
                    <option>Prenatal Care</option>
                    <option>General Checkup</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>Session</label>
                  <div className="flex gap-2">
                    {['Morning', 'Afternoon', 'Evening'].map(s => (
                      <button key={s} type="button" onClick={() => setForm({ ...form, session: s })}
                        className="flex-1 py-2 rounded-xl text-xs font-medium transition-all"
                        style={{
                          background: form.session === s ? '#1F2A5A' : '#F4F7FB',
                          color: form.session === s ? 'white' : '#6B7280',
                        }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                {selectedSlot && (
                  <div className="p-3 rounded-xl" style={{ background: '#F0FDF9' }}>
                    <p className="text-xs font-semibold" style={{ color: '#3CC0D0' }}>Selected Slot</p>
                    <p className="text-sm font-bold mt-0.5" style={{ color: '#1F2A5A' }}>March {selectedDate}, 2026 at {selectedSlot}</p>
                  </div>
                )}
                <button
                  onClick={() => setShowAdd(false)}
                  className="w-full py-2.5 rounded-xl text-sm font-medium text-white"
                  style={{ background: 'linear-gradient(135deg, #1F2A5A, #3CC0D0)' }}>
                  Confirm Appointment
                </button>
              </div>

              {/* Calendar + Time Slots */}
              <div>
                {/* Mini Calendar */}
                <div className="bg-white border rounded-2xl p-4 mb-4" style={{ borderColor: '#E5E7EB' }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold" style={{ color: '#1F2A5A' }}>March 2026</span>
                    <div className="flex gap-1">
                      <button className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-gray-100"><ChevronLeft size={12} /></button>
                      <button className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-gray-100"><ChevronRight size={12} /></button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                      <div key={d} className="text-center text-xs font-semibold py-1" style={{ color: '#9CA3AF' }}>{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: 2 }).map((_, i) => <div key={`empty-${i}`} />)}
                    {calendarDays.map(day => (
                      <button key={day} onClick={() => setSelectedDate(day)}
                        className="text-center text-xs py-1.5 rounded-lg transition-all font-medium"
                        style={{
                          background: selectedDate === day ? '#1F2A5A' : day === today ? '#EEF9FB' : 'transparent',
                          color: selectedDate === day ? 'white' : day === today ? '#3CC0D0' : day < today ? '#D1D5DB' : '#374151',
                          cursor: day < today ? 'not-allowed' : 'pointer',
                        }}>
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Slots */}
                <div>
                  <p className="text-xs font-semibold mb-2" style={{ color: '#374151' }}>Available Slots — March {selectedDate}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map(slot => {
                      const isBooked = bookedSlots.includes(slot);
                      const isSelected = selectedSlot === slot;
                      return (
                        <button key={slot} onClick={() => !isBooked && setSelectedSlot(slot)}
                          disabled={isBooked}
                          className="py-2 rounded-xl text-xs font-medium transition-all"
                          style={{
                            background: isSelected ? '#1F2A5A' : isBooked ? '#F3F4F6' : '#EEF9FB',
                            color: isSelected ? 'white' : isBooked ? '#D1D5DB' : '#3CC0D0',
                            cursor: isBooked ? 'not-allowed' : 'pointer',
                            border: isSelected ? '1.5px solid #1F2A5A' : isBooked ? '1.5px solid #E5E7EB' : '1.5px solid #3CC0D020',
                          }}>
                          {slot}
                          {isBooked && <span className="block text-xs opacity-60">Booked</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
