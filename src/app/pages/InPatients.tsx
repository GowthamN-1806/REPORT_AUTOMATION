import { useState } from 'react';
import { Search, Plus, X, BedDouble, Clock, User, Building2, Activity } from 'lucide-react';
import { mockInPatients } from '../data/mockData';

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  Admitted: { bg: '#EEF9FB', text: '#0B8294', dot: '#3CC0D0' },
  'In Surgery': { bg: '#FFF7ED', text: '#B45309', dot: '#F59E0B' },
  Completed: { bg: '#F0FDF4', text: '#15803D', dot: '#22C55E' },
  Scheduled: { bg: '#EEF2FF', text: '#4338CA', dot: '#6366F1' },
  Discharged: { bg: '#F4F7FB', text: '#374151', dot: '#9CA3AF' },
};

export function InPatients() {
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [viewPatient, setViewPatient] = useState<typeof mockInPatients[0] | null>(null);
  const [statusFilter, setStatusFilter] = useState('All');
  
  const defaultForm = {
    patientId: '', patientName: '', procedure: '', hospital: 'ACUTIX Main', date: '', time: '', status: 'Scheduled'
  };
  const [form, setForm] = useState(defaultForm);

  const handleEditClick = (patient: typeof mockInPatients[0]) => {
    setForm({
      patientId: patient.patientId,
      patientName: patient.patientName,
      procedure: patient.procedure,
      hospital: patient.hospital,
      date: patient.date,
      time: patient.time,
      status: patient.status
    });
    setIsEditing(true);
    setShowAdd(true);
  };

  const handleAddClick = () => {
    setForm(defaultForm);
    setIsEditing(false);
    setShowAdd(true);
  };

  const filtered = mockInPatients.filter(p =>
    (p.patientName.toLowerCase().includes(search.toLowerCase()) || p.patientId.toLowerCase().includes(search.toLowerCase())) &&
    (statusFilter === 'All' || p.status === statusFilter)
  );

  const summary = {
    total: mockInPatients.length,
    admitted: mockInPatients.filter(p => p.status === 'Admitted').length,
    inSurgery: mockInPatients.filter(p => p.status === 'In Surgery').length,
    scheduled: mockInPatients.filter(p => p.status === 'Scheduled').length,
    discharged: mockInPatients.filter(p => p.status === 'Discharged').length,
  };

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1F2A5A' }}>In-Patient Management</h1>
          <p className="text-sm" style={{ color: '#6B7280' }}>{filtered.length} in-patient records</p>
        </div>
        <button onClick={handleAddClick}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium"
          style={{ background: 'linear-gradient(135deg, #1F2A5A, #3CC0D0)', boxShadow: '0 4px 15px rgba(60,192,208,0.35)' }}>
          <Plus size={16} /> Add In-Patient
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        {[
          { label: 'Total', value: summary.total, color: '#1F2A5A', bg: '#EEF2FF' },
          { label: 'Admitted', value: summary.admitted, color: '#3CC0D0', bg: '#EEF9FB' },
          { label: 'In Surgery', value: summary.inSurgery, color: '#F59E0B', bg: '#FFF7ED' },
          { label: 'Scheduled', value: summary.scheduled, color: '#6366F1', bg: '#EEF2FF' },
          { label: 'Discharged', value: summary.discharged, color: '#6B7280', bg: '#F4F7FB' },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl p-4" style={{ background: s.bg, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs font-medium mt-0.5" style={{ color: s.color }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Ward/Bed Visual */}
      <div className="bg-white rounded-2xl p-5 mb-4" style={{ boxShadow: '0 2px 15px rgba(0,0,0,0.06)' }}>
        <h3 className="font-semibold mb-3" style={{ color: '#1F2A5A' }}>Ward Occupancy Overview</h3>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
          {Array.from({ length: 24 }, (_, i) => {
            const occupied = i < summary.admitted + summary.inSurgery;
            const scheduled = i >= summary.admitted + summary.inSurgery && i < summary.admitted + summary.inSurgery + summary.scheduled;
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="w-full h-12 rounded-xl flex items-center justify-center transition-colors"
                  style={{
                    background: occupied ? '#1F2A5A' : scheduled ? '#EEF9FB' : '#F4F7FB',
                    border: occupied ? '1.5px solid #1F2A5A' : scheduled ? '1.5px solid #3CC0D0' : '1.5px solid #E5E7EB',
                  }}>
                  <BedDouble size={16} style={{ color: occupied ? 'white' : scheduled ? '#3CC0D0' : '#D1D5DB' }} />
                </div>
                <span className="text-xs" style={{ color: '#9CA3AF' }}>B{i + 1}</span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-3">
          {[
            { color: '#1F2A5A', label: 'Occupied' },
            { color: '#3CC0D0', label: 'Scheduled' },
            { color: '#E5E7EB', label: 'Available' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded" style={{ background: l.color }} />
              <span className="text-xs" style={{ color: '#6B7280' }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 mb-4 flex flex-wrap gap-3 items-center" style={{ boxShadow: '0 2px 15px rgba(0,0,0,0.06)' }}>
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} />
          <input type="text" placeholder="Search patient name or ID..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl text-sm outline-none"
            style={{ background: '#F4F7FB', border: '1.5px solid #E5E7EB', fontFamily: 'Poppins' }} />
        </div>
        <div className="flex gap-2">
          {['All', 'Admitted', 'In Surgery', 'Scheduled', 'Completed', 'Discharged'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: statusFilter === s ? '#1F2A5A' : '#F4F7FB',
                color: statusFilter === s ? 'white' : '#6B7280',
              }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 2px 15px rgba(0,0,0,0.06)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: '#F8F9FB' }}>
                {['Patient ID', 'Patient Name', 'Procedure', 'Hospital', 'Date', 'Time', 'Status', 'Actions'].map(col => (
                  <th key={col} className="text-left px-5 py-4 text-xs font-semibold" style={{ color: '#6B7280' }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((patient, i) => {
                const sc = statusConfig[patient.status] || statusConfig.Scheduled;
                return (
                  <tr key={patient.id} className="border-t hover:bg-blue-50/20 transition-colors" style={{ borderColor: '#F3F4F6' }}>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-bold px-2 py-1 rounded-lg" style={{ background: '#EEF2FF', color: '#1F2A5A' }}>{patient.patientId}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white"
                          style={{ background: `linear-gradient(135deg, hsl(${i * 50}, 55%, 45%), hsl(${i * 50 + 30}, 55%, 55%))` }}>
                          {patient.patientName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-sm font-medium" style={{ color: '#1F2A5A' }}>{patient.patientName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Activity size={13} style={{ color: '#3CC0D0' }} />
                        <span className="text-sm" style={{ color: '#374151' }}>{patient.procedure}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Building2 size={13} style={{ color: '#6B7280' }} />
                        <span className="text-sm" style={{ color: '#6B7280' }}>{patient.hospital}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: '#6B7280' }}>{patient.date}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1 text-sm" style={{ color: '#6B7280' }}>
                        <Clock size={12} /> {patient.time}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: sc.dot }} />
                        <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: sc.bg, color: sc.text }}>
                          {patient.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-2">
                        <button onClick={() => setViewPatient(patient)} className="text-xs px-2.5 py-1 rounded-lg font-medium hover:opacity-80 transition-opacity" style={{ background: '#EEF2FF', color: '#1F2A5A' }}>View</button>
                        <button onClick={() => handleEditClick(patient)} className="text-xs px-2.5 py-1 rounded-lg font-medium hover:opacity-80 transition-opacity" style={{ background: '#F0FDF9', color: '#3CC0D0' }}>Update</button>
                        <button className="text-xs px-2.5 py-1 rounded-lg font-medium" style={{ background: '#FEF2F2', color: '#EF4444' }}>Discharge</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#F3F4F6' }}>
              <div>
                <h2 className="font-bold text-lg" style={{ color: '#1F2A5A' }}>{isEditing ? 'Edit In-Patient Details' : 'Add In-Patient'}</h2>
                <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
                  {isEditing ? 'Update the selected patient information' : 'Fill in the admission details'}
                </p>
              </div>
              <button onClick={() => setShowAdd(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100">
                <X size={18} style={{ color: '#6B7280' }} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Patient ID', key: 'patientId', placeholder: 'e.g., P001' },
                  { label: 'Patient Name', key: 'patientName', placeholder: 'Full name' },
                  { label: 'Procedure', key: 'procedure', placeholder: 'e.g., IVF Retrieval' },
                  { label: 'Hospital', key: 'hospital', placeholder: 'ACUTIX Main' },
                  { label: 'Date', key: 'date', type: 'date' },
                  { label: 'Time', key: 'time', type: 'time' },
                ].map(field => (
                  <div key={field.key}>
                    <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>{field.label}</label>
                    <input
                      type={field.type || 'text'}
                      placeholder={field.placeholder}
                      value={(form as any)[field.key]}
                      onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                      style={{ border: '1.5px solid #E5E7EB', fontFamily: 'Poppins' }}
                    />
                  </div>
                ))}
              </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ border: '1.5px solid #E5E7EB', fontFamily: 'Poppins' }}>
                    <option>Admitted</option><option>In Surgery</option><option>Scheduled</option><option>Completed</option><option>Discharged</option>
                  </select>
                </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAdd(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium border hover:bg-gray-50"
                  style={{ borderColor: '#E5E7EB', color: '#6B7280' }}>Cancel</button>
                <button onClick={() => setShowAdd(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white"
                  style={{ background: 'linear-gradient(135deg, #1F2A5A, #3CC0D0)' }}>{isEditing ? 'Save Changes' : 'Add Patient'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View In-Patient Modal */}
      {viewPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="relative h-24 rounded-t-2xl" style={{ background: 'linear-gradient(135deg, #1F2A5A, #3CC0D0)' }}>
              <button onClick={() => setViewPatient(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
                <X size={16} color="white" />
              </button>
            </div>
            <div className="px-6 pb-6">
              <div className="flex items-end gap-4 mb-5 relative z-10">
                <div className="w-16 h-16 rounded-2xl border-4 border-white flex items-center justify-center text-lg font-bold text-white shadow-lg -mt-8"
                  style={{ background: 'linear-gradient(135deg, #3CC0D0, #1F2A5A)' }}>
                  {viewPatient.patientName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="pb-2">
                  <h2 className="font-bold text-lg" style={{ color: '#1F2A5A' }}>{viewPatient.patientName}</h2>
                  <p className="text-sm" style={{ color: '#6B7280' }}>{viewPatient.patientId}</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Procedure', value: viewPatient.procedure },
                  { label: 'Hospital', value: viewPatient.hospital },
                  { label: 'Date', value: viewPatient.date },
                  { label: 'Time', value: viewPatient.time },
                  { label: 'Status', value: viewPatient.status },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b" style={{ borderColor: '#F3F4F6' }}>
                    <span className="text-sm" style={{ color: '#6B7280' }}>{item.label}</span>
                    <span className="text-sm font-semibold" style={{ color: '#1F2A5A' }}>{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => { handleEditClick(viewPatient); setViewPatient(null); }} className="flex-1 py-2.5 rounded-xl text-sm font-medium border hover:bg-gray-50"
                  style={{ borderColor: '#E5E7EB', color: '#6B7280' }}>Update Records</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
