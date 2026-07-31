import { useState } from 'react';
import { Search, Plus, X, UserCog, Phone, Stethoscope, Shield, User, Users } from 'lucide-react';
import { mockStaff } from '../data/mockData';

const roleConfig: Record<string, { bg: string; text: string; icon: any }> = {
  Doctor: { bg: '#EEF9FB', text: '#3CC0D0', icon: Stethoscope },
  Nurse: { bg: '#F0FDF4', text: '#22C55E', icon: User },
  Admin: { bg: '#EEF2FF', text: '#6366F1', icon: Shield },
  Receptionist: { bg: '#FFF7ED', text: '#F59E0B', icon: Users },
};

const statusConfig: Record<string, { bg: string; text: string }> = {
  Active: { bg: '#F0FDF4', text: '#22C55E' },
  'On Leave': { bg: '#FFF7ED', text: '#F59E0B' },
  Inactive: { bg: '#FEF2F2', text: '#EF4444' },
};

export function Staff() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [showAdd, setShowAdd] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<typeof mockStaff[0] | null>(null);
  const [form, setForm] = useState({
    name: '', role: 'Doctor', department: '', contact: '', specialization: '', status: 'Active',
  });

  const filtered = mockStaff.filter(s =>
    (s.name.toLowerCase().includes(search.toLowerCase()) || s.department.toLowerCase().includes(search.toLowerCase())) &&
    (roleFilter === 'All' || s.role === roleFilter)
  );

  const summary = {
    total: mockStaff.length,
    doctors: mockStaff.filter(s => s.role === 'Doctor').length,
    nurses: mockStaff.filter(s => s.role === 'Nurse').length,
    admin: mockStaff.filter(s => s.role === 'Admin').length,
    active: mockStaff.filter(s => s.status === 'Active').length,
  };

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1F2A5A' }}>Staff Management</h1>
          <p className="text-sm" style={{ color: '#6B7280' }}>{filtered.length} staff members</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium"
          style={{ background: 'linear-gradient(135deg, #1F2A5A, #3CC0D0)', boxShadow: '0 4px 15px rgba(60,192,208,0.35)' }}>
          <Plus size={16} /> Add Staff
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        {[
          { label: 'Total Staff', value: summary.total, color: '#1F2A5A', bg: '#EEF2FF' },
          { label: 'Doctors', value: summary.doctors, color: '#3CC0D0', bg: '#EEF9FB' },
          { label: 'Nurses', value: summary.nurses, color: '#22C55E', bg: '#F0FDF4' },
          { label: 'Admin', value: summary.admin, color: '#6366F1', bg: '#EEF2FF' },
          { label: 'Active', value: summary.active, color: '#F59E0B', bg: '#FFF7ED' },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl p-4" style={{ background: s.bg, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs font-medium mt-0.5" style={{ color: s.color }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Staff Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-4">
        {mockStaff.filter(s => s.role === 'Doctor').map((staff, i) => {
          const rc = roleConfig[staff.role];
          const sc = statusConfig[staff.status];
          const RoleIcon = rc.icon;
          return (
            <div key={i} className="bg-white rounded-2xl p-4 cursor-pointer hover:shadow-md transition-all" style={{ boxShadow: '0 2px 15px rgba(0,0,0,0.06)' }}
              onClick={() => setSelectedStaff(staff)}>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold text-white flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, hsl(${i * 50 + 180}, 55%, 40%), hsl(${i * 50 + 210}, 55%, 50%))` }}>
                  {staff.name.split(' ').slice(-1)[0][0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-sm" style={{ color: '#1F2A5A' }}>{staff.name}</p>
                      <p className="text-xs" style={{ color: '#6B7280' }}>{staff.specialization}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: sc.bg, color: sc.text }}>
                      {staff.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1"
                      style={{ background: rc.bg, color: rc.text }}>
                      <RoleIcon size={10} /> {staff.role}
                    </span>
                    <span className="text-xs" style={{ color: '#9CA3AF' }}>{staff.department}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1.5">
                    <Phone size={11} style={{ color: '#9CA3AF' }} />
                    <span className="text-xs" style={{ color: '#6B7280' }}>{staff.contact}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 mb-4 flex flex-wrap gap-3 items-center" style={{ boxShadow: '0 2px 15px rgba(0,0,0,0.06)' }}>
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} />
          <input type="text" placeholder="Search staff name or department..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl text-sm outline-none"
            style={{ background: '#F4F7FB', border: '1.5px solid #E5E7EB', fontFamily: 'Poppins' }} />
        </div>
        <div className="flex gap-2">
          {['All', 'Doctor', 'Nurse', 'Admin', 'Receptionist'].map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: roleFilter === r ? '#1F2A5A' : '#F4F7FB',
                color: roleFilter === r ? 'white' : '#6B7280',
              }}>
              {r}
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
                {['Staff ID', 'Name', 'Role', 'Department', 'Specialization', 'Contact', 'Status'].map(col => (
                  <th key={col} className="text-left px-5 py-4 text-xs font-semibold" style={{ color: '#6B7280' }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((staff, i) => {
                const rc = roleConfig[staff.role] || roleConfig.Admin;
                const sc = statusConfig[staff.status] || statusConfig.Active;
                const RoleIcon = rc.icon;
                return (
                  <tr key={staff.id} className="border-t hover:bg-blue-50/20 transition-colors cursor-pointer" style={{ borderColor: '#F3F4F6' }}
                    onClick={() => setSelectedStaff(staff)}>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-bold px-2 py-1 rounded-lg" style={{ background: '#EEF2FF', color: '#1F2A5A' }}>{staff.id}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white"
                          style={{ background: `linear-gradient(135deg, hsl(${i * 36 + 200}, 55%, 40%), hsl(${i * 36 + 230}, 55%, 50%))` }}>
                          {staff.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: '#1F2A5A' }}>{staff.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 w-fit"
                        style={{ background: rc.bg, color: rc.text }}>
                        <RoleIcon size={11} /> {staff.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: '#374151' }}>{staff.department}</td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: '#6B7280' }}>{staff.specialization}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Phone size={12} style={{ color: '#9CA3AF' }} />
                        <span className="text-sm" style={{ color: '#374151' }}>{staff.contact}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: sc.bg, color: sc.text }}>
                        {staff.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staff Detail Modal */}
      {selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="relative h-24 rounded-t-2xl" style={{ background: 'linear-gradient(135deg, #1F2A5A, #3CC0D0)' }}>
              <button onClick={() => setSelectedStaff(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
                <X size={16} color="white" />
              </button>
            </div>
            <div className="px-6 pb-6">
              <div className="flex items-end gap-4 mb-5 relative z-10">
                <div className="w-16 h-16 rounded-2xl border-4 border-white flex items-center justify-center text-lg font-bold text-white shadow-lg -mt-8"
                  style={{ background: 'linear-gradient(135deg, #3CC0D0, #1F2A5A)' }}>
                  {selectedStaff.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="pb-2">
                  <h2 className="font-bold text-lg" style={{ color: '#1F2A5A' }}>{selectedStaff.name}</h2>
                  <p className="text-sm" style={{ color: '#6B7280' }}>{selectedStaff.specialization}</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Staff ID', value: selectedStaff.id },
                  { label: 'Role', value: selectedStaff.role },
                  { label: 'Department', value: selectedStaff.department },
                  { label: 'Contact', value: selectedStaff.contact },
                  { label: 'Status', value: selectedStaff.status },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b" style={{ borderColor: '#F3F4F6' }}>
                    <span className="text-sm" style={{ color: '#6B7280' }}>{item.label}</span>
                    <span className="text-sm font-semibold" style={{ color: '#1F2A5A' }}>{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-4">
                <button className="flex-1 py-2.5 rounded-xl text-sm font-medium border hover:bg-gray-50"
                  style={{ borderColor: '#E5E7EB', color: '#6B7280' }}>Edit Profile</button>
                <button className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white"
                  style={{ background: 'linear-gradient(135deg, #1F2A5A, #3CC0D0)' }}>Schedule</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#F3F4F6' }}>
              <h2 className="font-bold text-lg" style={{ color: '#1F2A5A' }}>Add New Staff Member</h2>
              <button onClick={() => setShowAdd(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100">
                <X size={18} style={{ color: '#6B7280' }} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Full Name', key: 'name', placeholder: 'Dr. / Mr. / Ms.' },
                  { label: 'Contact Number', key: 'contact', placeholder: '+91 XXXXX XXXXX' },
                  { label: 'Department', key: 'department', placeholder: 'e.g., Fertility & IVF' },
                  { label: 'Specialization', key: 'specialization', placeholder: 'e.g., Reproductive Medicine' },
                ].map(field => (
                  <div key={field.key}>
                    <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>{field.label}</label>
                    <input type="text" placeholder={field.placeholder}
                      value={(form as any)[field.key]} onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ border: '1.5px solid #E5E7EB', fontFamily: 'Poppins' }} />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>Role</label>
                  <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ border: '1.5px solid #E5E7EB', fontFamily: 'Poppins' }}>
                    <option>Doctor</option><option>Nurse</option><option>Admin</option><option>Receptionist</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ border: '1.5px solid #E5E7EB', fontFamily: 'Poppins' }}>
                    <option>Active</option><option>On Leave</option><option>Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAdd(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium border hover:bg-gray-50"
                  style={{ borderColor: '#E5E7EB', color: '#6B7280' }}>Cancel</button>
                <button onClick={() => setShowAdd(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white"
                  style={{ background: 'linear-gradient(135deg, #1F2A5A, #3CC0D0)' }}>Add Staff</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
