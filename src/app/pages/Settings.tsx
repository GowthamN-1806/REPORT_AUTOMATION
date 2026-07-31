// Force HMR to clear Vite cache
import { useState } from 'react';
import {
  Building2, Image, Phone, Mail, Globe, Sun, Moon, Bell, Calendar,
  Clock, Check, Save, ChevronRight, Monitor, AlertTriangle, Package
} from 'lucide-react';
const acutixLogo = "/assets/acutix-logo.png";
import { useTheme } from '../ThemeContext';

const settingsTabs = [
  { key: 'general', label: 'General', icon: Building2 },
  { key: 'appearance', label: 'Appearance', icon: Monitor },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'preferences', label: 'User Preferences', icon: Globe },
];

export function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  const [saved, setSaved] = useState(false);
  const { darkMode, setDarkMode } = useTheme();

  // General settings state
  const [hospitalName, setHospitalName] = useState('ACUTIX Hospital & Fertility Centre');
  const [contactPhone, setContactPhone] = useState('+91 22 4567 8900');
  const [contactEmail, setContactEmail] = useState('info@acutix.com');
  const [address, setAddress] = useState('Plot 12, Medical Hub, Bandra West, Mumbai - 400050');
  const [registrationNo, setRegistrationNo] = useState('MH/HOSP/2019/00452');

  // Appearance state
  const [zoomLevel, setZoomLevel] = useState('100');
  const [compactView, setCompactView] = useState(false);
  const [showAvatars, setShowAvatars] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Notification state
  const [notifSettings, setNotifSettings] = useState({
    appointmentReminders: true,
    newPatients: true,
    inventoryAlerts: true,
    lowStockAlerts: true,
    systemAlerts: true,
    billingAlerts: false,
    fertilityCycleUpdates: true,
    staffUpdates: false,
  });

  // User preferences state
  const [language, setLanguage] = useState('English');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [timeFormat, setTimeFormat] = useState('12-Hour');
  const [currency, setCurrency] = useState('INR (₹)');
  const [timezone, setTimezone] = useState('Asia/Kolkata (IST)');

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const toggleNotif = (key: keyof typeof notifSettings) => {
    setNotifSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const cardBg = 'var(--acutix-card-bg)';
  const cardShadow = 'var(--acutix-card-shadow)';
  const textPrimary = 'var(--acutix-text-primary)';
  const textSecondary = 'var(--acutix-text-secondary)';
  const textBody = 'var(--acutix-text-body)';
  const inputBg = 'var(--acutix-input-bg)';
  const inputBorder = 'var(--acutix-input-border)';
  const tableBg = 'var(--acutix-table-header-bg)';

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: textPrimary }}>Settings</h1>
          <p className="text-sm" style={{ color: textSecondary }}>
            <span style={{ color: 'var(--acutix-text-muted)' }}>Dashboard</span> &rsaquo; Settings
          </p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-all hover:opacity-90"
          style={{ background: saved ? '#22C55E' : 'linear-gradient(135deg, #1F2A5A, #3CC0D0)', boxShadow: '0 4px 15px rgba(60,192,208,0.3)' }}
        >
          {saved ? <><Check size={15} /> Saved!</> : <><Save size={15} /> Save Settings</>}
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Tabs */}
        <div className="flex-shrink-0 w-52">
          <div className="rounded-2xl p-2" style={{ background: cardBg, boxShadow: cardShadow }}>
            {settingsTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl mb-1 last:mb-0 transition-all text-left"
                  style={{
                    background: isActive ? 'linear-gradient(135deg, #1F2A5A, #3CC0D0)' : 'transparent',
                    color: isActive ? 'white' : textSecondary,
                    boxShadow: isActive ? '0 4px 12px rgba(60,192,208,0.3)' : 'none',
                  }}
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: isActive ? 'rgba(255,255,255,0.2)' : tableBg }}>
                    <Icon size={14} style={{ color: isActive ? 'white' : textSecondary }} />
                  </div>
                  <span className="text-sm font-medium">{tab.label}</span>
                  {!isActive && <ChevronRight size={12} className="ml-auto" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-5">
              {/* Hospital Identity */}
              <div className="rounded-2xl p-6" style={{ background: cardBg, boxShadow: cardShadow }}>
                <h3 className="font-bold mb-5" style={{ color: textPrimary }}>Hospital Identity</h3>

                {/* Logo display */}
                <div className="flex items-center gap-5 mb-6 p-4 rounded-xl" style={{ background: tableBg, border: `1.5px dashed ${inputBorder}` }}>
                  <div className="w-16 h-16 rounded-xl flex items-center justify-center overflow-hidden"
                    style={{ background: '#1F2A5A' }}>
                    <img src={acutixLogo} alt="ACUTIX Logo" className="w-14 h-14 object-contain" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: textPrimary }}>ACUTIX Hospital Logo</p>
                    <p className="text-xs mb-2" style={{ color: textSecondary }}>Current logo used across all modules</p>
                    <button className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                      style={{ background: 'var(--acutix-badge-bg)', color: textPrimary }}>
                      <Image size={11} /> Change Logo
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Hospital Name', value: hospitalName, setter: setHospitalName, icon: Building2 },
                    { label: 'Registration No.', value: registrationNo, setter: setRegistrationNo, icon: Check },
                  ].map((field, i) => {
                    const Icon = field.icon;
                    return (
                      <div key={i}>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: textBody }}>
                          {field.label}
                        </label>
                        <div className="relative">
                          <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--acutix-text-muted)' }} />
                          <input
                            type="text"
                            value={field.value}
                            onChange={e => field.setter(e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none transition-all"
                            style={{ border: `1.5px solid ${inputBorder}`, background: inputBg, color: textPrimary, fontFamily: 'Poppins' }}
                            onFocus={e => (e.target.style.borderColor = '#3CC0D0')}
                            onBlur={e => (e.target.style.borderColor = 'var(--acutix-input-border)')}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Contact Information */}
              <div className="rounded-2xl p-6" style={{ background: cardBg, boxShadow: cardShadow }}>
                <h3 className="font-bold mb-5" style={{ color: textPrimary }}>Contact Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: textBody }}>Phone Number</label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--acutix-text-muted)' }} />
                      <input type="tel" value={contactPhone} onChange={e => setContactPhone(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none"
                        style={{ border: `1.5px solid ${inputBorder}`, background: inputBg, color: textPrimary, fontFamily: 'Poppins' }}
                        onFocus={e => (e.target.style.borderColor = '#3CC0D0')}
                        onBlur={e => (e.target.style.borderColor = 'var(--acutix-input-border)')} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: textBody }}>Email Address</label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--acutix-text-muted)' }} />
                      <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none"
                        style={{ border: `1.5px solid ${inputBorder}`, background: inputBg, color: textPrimary, fontFamily: 'Poppins' }}
                        onFocus={e => (e.target.style.borderColor = '#3CC0D0')}
                        onBlur={e => (e.target.style.borderColor = 'var(--acutix-input-border)')} />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: textBody }}>Address</label>
                    <textarea value={address} onChange={e => setAddress(e.target.value)} rows={2}
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
                      style={{ border: `1.5px solid ${inputBorder}`, background: inputBg, color: textPrimary, fontFamily: 'Poppins' }}
                      onFocus={e => (e.target.style.borderColor = '#3CC0D0')}
                      onBlur={e => (e.target.style.borderColor = 'var(--acutix-input-border)')} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Appearance Settings */}
          {activeTab === 'appearance' && (
            <div className="space-y-5">
              <div className="rounded-2xl p-6" style={{ background: cardBg, boxShadow: cardShadow }}>
                <h3 className="font-bold mb-5" style={{ color: textPrimary }}>Theme & Display</h3>

                {/* Dark / Light mode - WORKING toggle */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-3" style={{ color: textBody }}>Color Theme</label>
                  <div className="flex gap-3">
                    {[
                      { label: 'Light Mode', icon: Sun, value: false },
                      { label: 'Dark Mode', icon: Moon, value: true },
                    ].map(theme => {
                      const Icon = theme.icon;
                      const isActive = darkMode === theme.value;
                      return (
                        <button key={theme.label} onClick={() => setDarkMode(theme.value)}
                          className="flex-1 flex items-center gap-3 p-4 rounded-xl border-2 transition-all"
                          style={{
                            borderColor: isActive ? '#3CC0D0' : inputBorder,
                            background: isActive ? (darkMode ? 'rgba(60,192,208,0.1)' : '#EFF9FB') : inputBg,
                          }}>
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                            style={{ background: isActive ? '#3CC0D0' : tableBg }}>
                            <Icon size={16} style={{ color: isActive ? 'white' : textSecondary }} />
                          </div>
                          <span className="text-sm font-semibold" style={{ color: isActive ? textPrimary : textSecondary }}>
                            {theme.label}
                          </span>
                          {isActive && (
                            <div className="ml-auto w-5 h-5 rounded-full flex items-center justify-center"
                              style={{ background: '#3CC0D0' }}>
                              <Check size={11} color="white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Zoom Level */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-2" style={{ color: textBody }}>
                    UI Zoom Level: <span style={{ color: '#3CC0D0' }}>{zoomLevel}%</span>
                  </label>
                  <input type="range" min={80} max={130} step={5} value={zoomLevel}
                    onChange={e => setZoomLevel(e.target.value)}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{ accentColor: '#3CC0D0' }} />
                  <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--acutix-text-muted)' }}>
                    <span>80%</span><span>100%</span><span>130%</span>
                  </div>
                </div>

                {/* Toggle options */}
                <div className="space-y-3">
                  {[
                    { label: 'Compact View', desc: 'Show more content with reduced spacing', value: compactView, setter: setCompactView },
                    { label: 'Show User Avatars', desc: 'Display initials in patient and staff lists', value: showAvatars, setter: setShowAvatars },
                    { label: 'Collapsed Sidebar by Default', desc: 'Start with the sidebar collapsed', value: sidebarCollapsed, setter: setSidebarCollapsed },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3.5 rounded-xl" style={{ background: tableBg }}>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: textPrimary }}>{item.label}</p>
                        <p className="text-xs" style={{ color: textSecondary }}>{item.desc}</p>
                      </div>
                      <button onClick={() => item.setter(!item.value)}
                        className="relative w-11 h-6 rounded-full transition-all flex-shrink-0"
                        style={{ background: item.value ? '#3CC0D0' : darkMode ? '#3a3e52' : '#E5E7EB' }}>
                        <div className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all"
                          style={{ left: item.value ? '22px' : '2px' }} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="space-y-5">
              <div className="rounded-2xl p-6" style={{ background: cardBg, boxShadow: cardShadow }}>
                <h3 className="font-bold mb-5" style={{ color: textPrimary }}>Notification Preferences</h3>
                <div className="space-y-1">
                  {[
                    { key: 'appointmentReminders', label: 'Appointment Reminders', desc: 'Notify before patient appointments', icon: Bell },
                    { key: 'newPatients', label: 'New Patient Registration', desc: 'Alert when a new patient is added', icon: Bell },
                    { key: 'inventoryAlerts', label: 'Inventory Alerts', desc: 'Drug stock update notifications', icon: Package },
                    { key: 'lowStockAlerts', label: 'Low Stock Alerts', desc: 'Alert when drugs reach minimum quantity', icon: AlertTriangle },
                    { key: 'systemAlerts', label: 'System Alerts', desc: 'Critical system notifications', icon: AlertTriangle },
                    { key: 'billingAlerts', label: 'Billing Alerts', desc: 'Payment and billing updates', icon: Bell },
                    { key: 'fertilityCycleUpdates', label: 'Fertility Cycle Updates', desc: 'IVF/IUI treatment progress alerts', icon: Bell },
                    { key: 'staffUpdates', label: 'Staff Updates', desc: 'Staff attendance and leave alerts', icon: Bell },
                  ].map((item) => {
                    const Icon = item.icon;
                    const value = notifSettings[item.key as keyof typeof notifSettings];
                    return (
                      <div key={item.key}
                        className="flex items-center justify-between p-3.5 rounded-xl transition-colors"
                        style={{ background: value ? (darkMode ? 'rgba(60,192,208,0.08)' : '#F0FDF9') : tableBg, borderLeft: value ? '3px solid #3CC0D0' : '3px solid transparent' }}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ background: value ? (darkMode ? 'rgba(34,197,94,0.15)' : '#DCFCE7') : tableBg }}>
                            <Icon size={14} style={{ color: value ? '#22C55E' : 'var(--acutix-text-muted)' }} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold" style={{ color: textPrimary }}>{item.label}</p>
                            <p className="text-xs" style={{ color: textSecondary }}>{item.desc}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleNotif(item.key as keyof typeof notifSettings)}
                          className="relative w-11 h-6 rounded-full transition-all flex-shrink-0"
                          style={{ background: value ? '#3CC0D0' : darkMode ? '#3a3e52' : '#E5E7EB' }}>
                          <div className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all"
                            style={{ left: value ? '22px' : '2px' }} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* User Preferences */}
          {activeTab === 'preferences' && (
            <div className="space-y-5">
              <div className="rounded-2xl p-6" style={{ background: cardBg, boxShadow: cardShadow }}>
                <h3 className="font-bold mb-5" style={{ color: textPrimary }}>Locale & Format Preferences</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {[
                    {
                      label: 'Language', icon: Globe, value: language, setter: setLanguage,
                      options: ['English', 'Hindi', 'Tamil', 'Telugu', 'Marathi', 'Kannada']
                    },
                    {
                      label: 'Date Format', icon: Calendar, value: dateFormat, setter: setDateFormat,
                      options: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD', 'DD-MMM-YYYY']
                    },
                    {
                      label: 'Time Format', icon: Clock, value: timeFormat, setter: setTimeFormat,
                      options: ['12-Hour', '24-Hour']
                    },
                    {
                      label: 'Currency', icon: Globe, value: currency, setter: setCurrency,
                      options: ['INR (₹)', 'USD ($)', 'EUR (€)', 'GBP (£)']
                    },
                    {
                      label: 'Timezone', icon: Globe, value: timezone, setter: setTimezone,
                      options: ['Asia/Kolkata (IST)', 'UTC', 'Asia/Dubai', 'Asia/Singapore']
                    },
                  ].map((field, i) => {
                    const Icon = field.icon;
                    return (
                      <div key={i}>
                        <label className="block text-xs font-semibold mb-1.5 flex items-center gap-1.5" style={{ color: textBody }}>
                          <Icon size={12} style={{ color: textSecondary }} /> {field.label}
                        </label>
                        <select
                          value={field.value}
                          onChange={e => field.setter(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                          style={{ border: `1.5px solid ${inputBorder}`, background: inputBg, color: textPrimary, fontFamily: 'Poppins' }}
                        >
                          {field.options.map(opt => <option key={opt}>{opt}</option>)}
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl p-6" style={{ background: cardBg, boxShadow: cardShadow }}>
                <h3 className="font-bold mb-4" style={{ color: textPrimary }}>Data & Privacy</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Auto-logout Timer', desc: '30 minutes of inactivity', action: 'Configure' },
                    { label: 'Export All Data', desc: 'Download all hospital records as CSV', action: 'Export' },
                    { label: 'Audit Log', desc: 'View all system activity logs', action: 'View Log' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3.5 rounded-xl" style={{ background: tableBg }}>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: textPrimary }}>{item.label}</p>
                        <p className="text-xs" style={{ color: textSecondary }}>{item.desc}</p>
                      </div>
                      <button className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
                        style={{ background: 'var(--acutix-badge-bg)', color: textPrimary }}>
                        {item.action}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
