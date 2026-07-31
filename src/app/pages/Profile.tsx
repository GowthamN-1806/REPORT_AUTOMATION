import { useState } from 'react';
import { User, Mail, Phone, Shield, Building2, Edit3, Save, X, Camera, CheckCircle } from 'lucide-react';
const acutixLogo = "/assets/acutix-logo.png";

const profileData = {
  name: 'Dr. Riya Desai',
  role: 'Administrator',
  department: 'Hospital Administration',
  email: 'riya.desai@acutix.com',
  phone: '+91 43210 66666',
  employeeId: 'S006',
  joinDate: '2021-04-01',
  location: 'ACUTIX Main Hospital, Mumbai',
  bio: 'Senior Hospital Administrator with 5+ years of experience managing hospital operations, staff coordination, and patient services at ACUTIX.',
};

export function Profile() {
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState(profileData);

  const handleSave = () => {
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleCancel = () => {
    setForm(profileData);
    setEditing(false);
  };

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1F2A5A' }}>My Profile</h1>
          <p className="text-sm" style={{ color: '#6B7280' }}>
            <span style={{ color: '#9CA3AF' }}>Dashboard</span> &rsaquo; My Profile
          </p>
        </div>
        {saved && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
            style={{ background: '#ECFDF5', color: '#22C55E', border: '1px solid #A7F3D0' }}>
            <CheckCircle size={15} /> Profile Updated Successfully
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Profile Card */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 2px 15px rgba(0,0,0,0.06)' }}>
            {/* Cover */}
            <div className="h-24 relative" style={{ background: 'linear-gradient(135deg, #1F2A5A 0%, #3CC0D0 100%)' }}>
              <div className="absolute inset-0 opacity-20"
                style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, #F6C177 0%, transparent 50%)' }} />
            </div>

            {/* Avatar */}
            <div className="px-6 pb-6">
              <div className="flex justify-center -mt-12 mb-4 relative">
                <div className="relative">
                  <div className="w-24 h-24 rounded-2xl border-4 border-white flex items-center justify-center text-3xl font-bold text-white shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #1F2A5A, #3CC0D0)' }}>
                    RD
                  </div>
                  <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg flex items-center justify-center shadow-md"
                    style={{ background: '#3CC0D0' }}>
                    <Camera size={12} color="white" />
                  </button>
                </div>
              </div>

              <div className="text-center mb-4">
                <h2 className="font-bold text-lg" style={{ color: '#1F2A5A' }}>{form.name}</h2>
                <p className="text-sm" style={{ color: '#6B7280' }}>{form.role}</p>
                <span className="inline-block mt-1.5 text-xs px-3 py-1 rounded-full font-medium"
                  style={{ background: '#EEF2FF', color: '#1F2A5A' }}>
                  {form.department}
                </span>
              </div>

              {/* Quick Info */}
              <div className="space-y-2.5">
                {[
                  { icon: Shield, label: 'Employee ID', value: form.employeeId },
                  { icon: Building2, label: 'Location', value: form.location },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-xl" style={{ background: '#F8F9FB' }}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: '#EEF2FF' }}>
                        <Icon size={13} style={{ color: '#1F2A5A' }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs" style={{ color: '#9CA3AF' }}>{item.label}</p>
                        <p className="text-xs font-semibold truncate" style={{ color: '#374151' }}>{item.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ACUTIX badge */}
              <div className="mt-4 flex items-center gap-2 p-3 rounded-xl" style={{ background: '#F8F9FB', border: '1px solid #E5E7EB' }}>
                <img src={acutixLogo} alt="ACUTIX" className="w-8 h-8 object-contain" />
                <div>
                  <p className="text-xs font-bold" style={{ color: '#1F2A5A' }}>ACUTIX</p>
                  <p className="text-xs" style={{ color: '#9CA3AF' }}>Hospital Management</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Profile Details */}
        <div className="xl:col-span-2 space-y-5">
          {/* Personal Info */}
          <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 2px 15px rgba(0,0,0,0.06)' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold" style={{ color: '#1F2A5A' }}>Personal Information</h3>
              {!editing ? (
                <button onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:opacity-80"
                  style={{ background: '#EEF2FF', color: '#1F2A5A' }}>
                  <Edit3 size={13} /> Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={handleCancel}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all hover:bg-gray-50"
                    style={{ borderColor: '#E5E7EB', color: '#6B7280' }}>
                    <X size={13} /> Cancel
                  </button>
                  <button onClick={handleSave}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #1F2A5A, #3CC0D0)' }}>
                    <Save size={13} /> Save Changes
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Full Name', key: 'name', icon: User },
                { label: 'Role', key: 'role', icon: Shield },
                { label: 'Department', key: 'department', icon: Building2 },
                { label: 'Email Address', key: 'email', icon: Mail },
                { label: 'Phone Number', key: 'phone', icon: Phone },
              ].map((field) => {
                const Icon = field.icon;
                return (
                  <div key={field.key}>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>
                      {field.label}
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        value={(form as any)[field.key]}
                        onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
                        style={{
                          border: '1.5px solid #3CC0D0',
                          background: '#F9FAFB',
                          color: '#1F2A5A',
                          fontFamily: 'Poppins',
                        }}
                      />
                    ) : (
                      <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl" style={{ background: '#F8F9FB' }}>
                        <Icon size={14} style={{ color: '#3CC0D0', flexShrink: 0 }} />
                        <span className="text-sm" style={{ color: '#374151' }}>{(form as any)[field.key]}</span>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Bio - full width */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>Bio</label>
                {editing ? (
                  <textarea
                    value={form.bio}
                    onChange={e => setForm({ ...form, bio: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all resize-none"
                    style={{ border: '1.5px solid #3CC0D0', background: '#F9FAFB', color: '#1F2A5A', fontFamily: 'Poppins' }}
                  />
                ) : (
                  <div className="px-3 py-2.5 rounded-xl text-sm" style={{ background: '#F8F9FB', color: '#374151', lineHeight: 1.7 }}>
                    {form.bio}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Activity Summary */}
          <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 2px 15px rgba(0,0,0,0.06)' }}>
            <h3 className="font-bold mb-4" style={{ color: '#1F2A5A' }}>Account Activity</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Patients Managed', value: '2,847', color: '#3CC0D0' },
                { label: 'Reports Generated', value: '126', color: '#F6C177' },
                { label: 'Days Active', value: '1,800+', color: '#1F2A5A' },
              ].map((stat, i) => (
                <div key={i} className="text-center p-4 rounded-xl" style={{ background: '#F8F9FB' }}>
                  <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                  <p className="text-xs mt-1" style={{ color: '#6B7280' }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Security */}
          <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 2px 15px rgba(0,0,0,0.06)' }}>
            <h3 className="font-bold mb-4" style={{ color: '#1F2A5A' }}>Security</h3>
            <div className="space-y-3">
              {[
                { label: 'Change Password', desc: 'Update your account password', action: 'Update' },
                { label: 'Two-Factor Authentication', desc: 'Add an extra layer of security', action: 'Enable' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3.5 rounded-xl" style={{ background: '#F8F9FB' }}>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#1F2A5A' }}>{item.label}</p>
                    <p className="text-xs" style={{ color: '#6B7280' }}>{item.desc}</p>
                  </div>
                  <button className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
                    style={{ background: '#EEF2FF', color: '#1F2A5A' }}>
                    {item.action}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
