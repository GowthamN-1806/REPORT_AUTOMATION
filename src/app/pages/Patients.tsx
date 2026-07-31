import { useState } from 'react';
import { Search, Plus, Eye, Edit2, Filter, X, ChevronDown, User, Calendar, Droplets, MapPin, Stethoscope } from 'lucide-react';
import { mockPatients, patientVisitHistory } from '../data/mockData';
import { useTheme } from '../ThemeContext';

type Patient = typeof mockPatients[0];

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export function Patients() {
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [genderFilter, setGenderFilter] = useState('All');
  const { darkMode } = useTheme();
  
  const defaultForm = {
    title: 'Mrs.', purpose: '', firstName: '', lastName: '', email: '',
    phone: '', gender: 'Female', dob: '', bloodGroup: 'O+',
    area: '', doctor: '', referral: '',
  };
  const [form, setForm] = useState(defaultForm);

  const filtered = mockPatients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  ).filter(p => genderFilter === 'All' || p.gender === genderFilter);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowAdd(false);
    setIsEditing(false);
    setForm(defaultForm);
  };

  const handleEditClick = (patient: Patient) => {
    setForm({
      ...defaultForm,
      purpose: patient.purpose || '',
      firstName: patient.name.split(' ')[0] || '',
      lastName: patient.name.split(' ').slice(1).join(' ') || '',
      email: patient.email || '',
      phone: patient.phone || '',
      gender: patient.gender || 'Female',
      doctor: patient.doctor || '',
    });
    setIsEditing(true);
    setShowAdd(true);
  };

  const handleAddClick = () => {
    setForm(defaultForm);
    setIsEditing(false);
    setShowAdd(true);
  };

  const cardBg = 'var(--acutix-card-bg)';
  const cardShadow = 'var(--acutix-card-shadow)';
  const textPrimary = 'var(--acutix-text-primary)';
  const textSecondary = 'var(--acutix-text-secondary)';
  const textBody = 'var(--acutix-text-body)';
  const inputBg = 'var(--acutix-input-bg)';
  const inputBorder = 'var(--acutix-input-border)';
  const tableBg = 'var(--acutix-table-header-bg)';
  const tableBorder = 'var(--acutix-table-border)';

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: textPrimary }}>Patient Management</h1>
          <p className="text-sm" style={{ color: textSecondary }}>{filtered.length} patients registered</p>
        </div>
        <button
          onClick={handleAddClick}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-all hover:scale-105"
          style={{ background: 'linear-gradient(135deg, #1F2A5A, #3CC0D0)', boxShadow: '0 4px 15px rgba(60,192,208,0.35)' }}
        >
          <Plus size={16} /> Add Patient
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-2xl p-4 mb-4 flex flex-wrap gap-3 items-center" style={{ background: cardBg, boxShadow: cardShadow }}>
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--acutix-text-muted)' }} />
          <input
            type="text" placeholder="Search by name, ID, or email..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl text-sm outline-none"
            style={{ background: inputBg, border: `1.5px solid ${inputBorder}`, color: textBody, fontFamily: 'Poppins' }}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} style={{ color: textSecondary }} />
          {['All', 'Male', 'Female'].map(g => (
            <button key={g} onClick={() => setGenderFilter(g)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: genderFilter === g ? '#1F2A5A' : inputBg,
                color: genderFilter === g ? 'white' : textSecondary,
              }}>
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: cardBg, boxShadow: cardShadow }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: tableBg }}>
                {['Patient ID', 'Name', 'Email', 'Phone Number', 'Date', 'Gender', 'Doctor', 'Actions'].map(col => (
                  <th key={col} className="text-left px-5 py-4 text-xs font-semibold" style={{ color: textSecondary }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((patient, i) => (
                <tr key={patient.id} className="border-t transition-colors"
                  style={{ borderColor: tableBorder }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--acutix-hover-bg)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td className="px-5 py-3.5">
                    <span className="text-xs font-bold px-2 py-1 rounded-lg" style={{ background: 'var(--acutix-badge-bg)', color: textPrimary }}>
                      {patient.id}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 text-white"
                        style={{ background: `linear-gradient(135deg, hsl(${i * 40}, 55%, 45%), hsl(${i * 40 + 30}, 55%, 55%))` }}>
                        {patient.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: textPrimary }}>{patient.name}</p>
                        <p className="text-xs" style={{ color: textSecondary }}>{patient.purpose}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm" style={{ color: textBody }}>{patient.email}</td>
                  <td className="px-5 py-3.5 text-sm" style={{ color: textBody }}>{patient.phone}</td>
                  <td className="px-5 py-3.5 text-sm" style={{ color: textSecondary }}>{patient.date}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs px-2 py-1 rounded-full font-medium"
                      style={{
                        background: patient.gender === 'Female' ? (darkMode ? 'rgba(236,72,153,0.15)' : '#FDF2F8') : (darkMode ? 'rgba(59,130,246,0.15)' : '#EFF6FF'),
                        color: patient.gender === 'Female' ? '#EC4899' : '#3B82F6',
                      }}>
                      {patient.gender}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm" style={{ color: textBody }}>{patient.doctor}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedPatient(patient)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                        style={{ background: darkMode ? 'rgba(255,255,255,0.05)' : '#F3F4F6', color: textPrimary, border: `1px solid ${inputBorder}` }}>
                        <Eye size={14} style={{ color: '#3CC0D0' }} /> View
                      </button>
                      <button 
                        onClick={() => handleEditClick(patient)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                        style={{ background: darkMode ? 'rgba(60,192,208,0.1)' : '#F0FDF9', color: '#3CC0D0', border: '1px solid rgba(60,192,208,0.2)' }}>
                        <Edit2 size={13} /> Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Patient Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" style={{ background: cardBg }}>
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: tableBorder }}>
              <div>
                <h2 className="font-bold text-lg" style={{ color: textPrimary }}>
                  {isEditing ? 'Edit Patient Details' : 'Add New Patient'}
                </h2>
                <p className="text-xs mt-1" style={{ color: textSecondary }}>
                  {isEditing ? 'Update the selected patient registration information' : 'Fill in the patient registration details'}
                </p>
              </div>
              <button onClick={() => setShowAdd(false)} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:opacity-80"
                style={{ background: tableBg }}>
                <X size={18} style={{ color: textSecondary }} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: textBody }}>Title</label>
                  <select value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ border: `1.5px solid ${inputBorder}`, background: inputBg, color: textPrimary, fontFamily: 'Poppins' }}>
                    {['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold mb-1" style={{ color: textBody }}>Purpose</label>
                  <input type="text" placeholder="e.g., Fertility Consultation" value={form.purpose}
                    onChange={e => setForm({ ...form, purpose: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ border: `1.5px solid ${inputBorder}`, background: inputBg, color: textPrimary, fontFamily: 'Poppins' }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: textBody }}>First Name</label>
                  <input type="text" placeholder="First name" value={form.firstName}
                    onChange={e => setForm({ ...form, firstName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ border: `1.5px solid ${inputBorder}`, background: inputBg, color: textPrimary, fontFamily: 'Poppins' }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: textBody }}>Last Name</label>
                  <input type="text" placeholder="Last name" value={form.lastName}
                    onChange={e => setForm({ ...form, lastName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ border: `1.5px solid ${inputBorder}`, background: inputBg, color: textPrimary, fontFamily: 'Poppins' }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: textBody }}>Email</label>
                  <input type="email" placeholder="patient@email.com" value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ border: `1.5px solid ${inputBorder}`, background: inputBg, color: textPrimary, fontFamily: 'Poppins' }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: textBody }}>WhatsApp Mobile</label>
                  <input type="tel" placeholder="+91 98765 XXXXX" value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ border: `1.5px solid ${inputBorder}`, background: inputBg, color: textPrimary, fontFamily: 'Poppins' }} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: textBody }}>Gender</label>
                  <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ border: `1.5px solid ${inputBorder}`, background: inputBg, color: textPrimary, fontFamily: 'Poppins' }}>
                    <option>Female</option><option>Male</option><option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: textBody }}>Date of Birth</label>
                  <input type="date" value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ border: `1.5px solid ${inputBorder}`, background: inputBg, color: textPrimary, fontFamily: 'Poppins' }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: textBody }}>Blood Group</label>
                  <select value={form.bloodGroup} onChange={e => setForm({ ...form, bloodGroup: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ border: `1.5px solid ${inputBorder}`, background: inputBg, color: textPrimary, fontFamily: 'Poppins' }}>
                    {bloodGroups.map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: textBody }}>Area of Residence</label>
                  <input type="text" placeholder="e.g., Bandra West, Mumbai" value={form.area}
                    onChange={e => setForm({ ...form, area: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ border: `1.5px solid ${inputBorder}`, background: inputBg, color: textPrimary, fontFamily: 'Poppins' }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: textBody }}>Doctor Referral</label>
                  <select value={form.doctor} onChange={e => setForm({ ...form, doctor: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ border: `1.5px solid ${inputBorder}`, background: inputBg, color: textPrimary, fontFamily: 'Poppins' }}>
                    <option value="">Select Doctor</option>
                    <option>Dr. Priya Sharma</option>
                    <option>Dr. Anil Kapoor</option>
                    <option>Dr. Rekha Nair</option>
                    <option>Dr. Suresh Babu</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAdd(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors"
                  style={{ borderColor: inputBorder, color: textSecondary, background: 'transparent' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--acutix-hover-bg)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #1F2A5A, #3CC0D0)', boxShadow: '0 4px 15px rgba(60,192,208,0.3)' }}>
                  {isEditing ? 'Save Changes' : 'Register Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Patient Profile Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" style={{ background: cardBg }}>
            <div className="relative h-28 rounded-t-2xl" style={{ background: 'linear-gradient(135deg, #1F2A5A, #3CC0D0)' }}>
              <button onClick={() => setSelectedPatient(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
                <X size={16} color="white" />
              </button>
            </div>
            <div className="px-6 pb-6">
              <div className="flex items-end gap-5 mb-6 relative z-10">
                <div className="w-24 h-24 rounded-2xl border-4 flex items-center justify-center text-3xl font-bold text-white shadow-lg flex-shrink-0 -mt-12"
                  style={{ background: 'linear-gradient(135deg, #3CC0D0, #1F2A5A)', borderColor: cardBg }}>
                  {selectedPatient.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="mb-2">
                  <h2 className="font-bold text-2xl mb-0.5" style={{ color: textPrimary }}>{selectedPatient.name}</h2>
                  <p className="text-sm font-medium" style={{ color: textSecondary }}>{selectedPatient.id} · {selectedPatient.purpose}</p>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { icon: User, label: 'Gender / Age', value: `${selectedPatient.gender}, ${selectedPatient.age} years` },
                  { icon: Droplets, label: 'Blood Group', value: selectedPatient.bloodGroup },
                  { icon: MapPin, label: 'Area', value: selectedPatient.area },
                  { icon: Stethoscope, label: 'Doctor', value: selectedPatient.doctor },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: tableBg }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--acutix-badge-bg)' }}>
                        <Icon size={14} style={{ color: textPrimary }} />
                      </div>
                      <div>
                        <p className="text-xs" style={{ color: textSecondary }}>{item.label}</p>
                        <p className="text-sm font-semibold" style={{ color: textPrimary }}>{item.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Visit History Timeline */}
              <div>
                <h3 className="font-semibold mb-4" style={{ color: textPrimary }}>Visit History Timeline</h3>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5" style={{ background: inputBorder }} />
                  <div className="space-y-4">
                    {patientVisitHistory.map((visit, i) => (
                      <div key={i} className="relative flex gap-4 pl-10">
                        <div className="absolute left-2.5 w-3 h-3 rounded-full border-2 top-1"
                          style={{ background: i === 0 ? '#3CC0D0' : i === 1 ? '#F6C177' : '#1F2A5A', borderColor: cardBg }} />
                        <div className="flex-1 p-3 rounded-xl" style={{ background: tableBg }}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                              style={{
                                background: visit.type === 'Procedure' ? 'var(--acutix-badge-bg)' : visit.type === 'Consultation' ? (darkMode ? 'rgba(60,192,208,0.1)' : '#F0FDF9') : (darkMode ? 'rgba(246,193,119,0.1)' : '#FFF7ED'),
                                color: visit.type === 'Procedure' ? textPrimary : visit.type === 'Consultation' ? '#3CC0D0' : '#F6C177',
                              }}>
                              {visit.type}
                            </span>
                            <span className="text-xs" style={{ color: 'var(--acutix-text-muted)' }}>{visit.month} {visit.year}</span>
                          </div>
                          <p className="text-sm font-medium" style={{ color: textPrimary }}>{visit.event}</p>
                          <p className="text-xs" style={{ color: textSecondary }}>{visit.doctor}</p>
                        </div>
                      </div>
                    ))}
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
