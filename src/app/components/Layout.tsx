import { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router';
import {
  LayoutDashboard, Users, Calendar, CreditCard, Package, BedDouble,
  Heart, UserCog, BarChart3, LineChart, Bell, Search, ChevronDown,
  ChevronRight, LogOut, Settings, Menu, User, X
} from 'lucide-react';
const acutixLogo = "/assets/acutix-logo.png";
import { useTheme } from '../ThemeContext';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { label: 'Patients', icon: Users, path: '/patients' },
  { label: 'Appointments', icon: Calendar, path: '/appointments' },
  { label: 'Patient Billing', icon: CreditCard, path: '/billing' },
  { label: 'Drug Inventory', icon: Package, path: '/inventory' },
  { label: 'In-Patients', icon: BedDouble, path: '/in-patients' },
  { label: 'Fertility', icon: Heart, path: '/fertility' },
  {
    label: 'Staff', icon: UserCog, path: '/staff',
    children: [
      { label: 'Doctors', path: '/staff?role=Doctor' },
      { label: 'Nurses', path: '/staff?role=Nurse' },
      { label: 'Admin', path: '/staff?role=Admin' },
    ]
  },
  { label: 'Reports', icon: BarChart3, path: '/reports' },
  { label: 'Charts', icon: LineChart, path: '/charts' },
];

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [staffExpanded, setStaffExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const { darkMode } = useTheme();

  const handleLogout = () => {
    navigate('/login');
  };

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden" style={{ fontFamily: 'Poppins, sans-serif', background: 'var(--acutix-page-bg)' }}>
      {/* Sidebar */}
      <aside
        className="flex flex-col transition-all duration-300 relative z-20"
        style={{
          width: sidebarOpen ? '240px' : '72px',
          background: darkMode
            ? 'linear-gradient(180deg, #12141f 0%, #161929 40%, #101320 100%)'
            : 'linear-gradient(180deg, #1a2347 0%, #1F2A5A 40%, #162040 100%)',
          minHeight: '100vh',
          boxShadow: '4px 0 20px rgba(0,0,0,0.15)',
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-3 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.08)' }}>
            <img src={acutixLogo} alt="ACUTIX" className="w-9 h-9 object-contain" />
          </div>
          {sidebarOpen && (
            <div>
              <span className="text-white font-bold text-lg tracking-wide">ACUTIX</span>
              <p className="text-xs" style={{ color: '#3CC0D0' }}>Hospital Management</p>
            </div>
          )}
        </div>

        {/* Toggle button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-16 w-6 h-6 rounded-full flex items-center justify-center shadow-lg z-30 transition-colors"
          style={{ background: '#3CC0D0', color: 'white' }}
        >
          {sidebarOpen ? <ChevronRight size={12} /> : <ChevronDown size={12} style={{ transform: 'rotate(-90deg)' }} />}
        </button>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isStaff = item.label === 'Staff';

            if (isStaff) {
              return (
                <div key={item.label}>
                  <button
                    onClick={() => {
                      setStaffExpanded(!staffExpanded);
                      navigate('/staff');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 group"
                    style={{ color: 'rgba(255,255,255,0.75)' }}
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                      style={{ background: 'rgba(60,192,208,0.1)' }}>
                      <Icon size={18} />
                    </div>
                    {sidebarOpen && (
                      <>
                        <span className="flex-1 text-sm font-medium">{item.label}</span>
                        {staffExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </>
                    )}
                  </button>
                  {staffExpanded && sidebarOpen && (
                    <div className="ml-12 pr-4 space-y-1 pb-1">
                      {item.children?.map(child => (
                        <NavLink key={child.label} to={child.path}
                          className="block text-xs py-1.5 px-3 rounded-lg transition-colors"
                          style={{ color: 'rgba(255,255,255,0.6)' }}
                        >
                          {child.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 mx-2 mb-1 rounded-xl transition-all duration-200 group relative ${isActive ? 'active-nav' : ''}`
                }
                style={({ isActive }) => ({
                  background: isActive ? 'linear-gradient(135deg, #3CC0D0, #2DA8B8)' : 'transparent',
                  color: isActive ? 'white' : 'rgba(255,255,255,0.7)',
                  boxShadow: isActive ? '0 4px 15px rgba(60,192,208,0.35)' : 'none',
                })}
              >
                {({ isActive }) => (
                  <>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors`}
                      style={{ background: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(60,192,208,0.1)' }}>
                      <Icon size={18} />
                    </div>
                    {sidebarOpen && (
                      <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
                    )}
                    {isActive && sidebarOpen && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-white opacity-80" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <NavLink
            to="/settings"
            className="flex items-center gap-3 w-full px-3 py-2 rounded-xl transition-colors mb-1"
            style={({ isActive }) => ({
              color: isActive ? '#3CC0D0' : 'rgba(255,255,255,0.6)',
              background: isActive ? 'rgba(60,192,208,0.12)' : 'transparent',
            })}
          >
            <Settings size={18} />
            {sidebarOpen && <span className="text-sm">Settings</span>}
          </NavLink>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-xl transition-colors"
            style={{ color: 'rgba(255,255,255,0.6)' }}
          >
            <LogOut size={18} />
            {sidebarOpen && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex items-center gap-4 px-6 py-3.5 z-10" style={{ background: 'var(--acutix-header-bg)', boxShadow: 'var(--acutix-card-shadow)', flexShrink: 0 }}>
          {/* Search */}
          <div className="flex-1 max-w-md relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--acutix-text-muted)' }} />
            <input
              type="text"
              placeholder="Search patients, doctors, appointments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl text-sm outline-none transition-all"
              style={{
                background: 'var(--acutix-input-bg)',
                border: '1.5px solid var(--acutix-input-border)',
                color: 'var(--acutix-text-body)',
                fontFamily: 'Poppins, sans-serif',
              }}
            />
          </div>

          <div className="flex items-center gap-2.5 ml-auto">
            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
                style={{ background: 'var(--acutix-input-bg)' }}
              >
                <Bell size={18} style={{ color: 'var(--acutix-text-secondary)' }} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: '#EF4444' }} />
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-12 w-76 rounded-xl shadow-xl border z-50 overflow-hidden" style={{ borderColor: 'var(--acutix-input-border)', width: '300px', background: 'var(--acutix-card-bg)' }}>
                  <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--acutix-table-border)' }}>
                    <h3 className="font-semibold text-sm" style={{ color: 'var(--acutix-text-primary)' }}>Notifications</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: '#FEE2E2', color: '#EF4444' }}>3 New</span>
                  </div>
                  {[
                    { title: 'Low Drug Stock', desc: 'Folic Acid running low (5 units)', time: '5 min ago', color: '#F6C177' },
                    { title: 'New Appointment', desc: 'Aisha Mehta - Dr. Priya Sharma', time: '15 min ago', color: '#3CC0D0' },
                    { title: 'Drug Expired', desc: 'Dydrogesterone expired', time: '1 hr ago', color: '#EF4444' },
                  ].map((n, i) => (
                    <div key={i} className="px-4 py-3 cursor-pointer border-b last:border-0 flex gap-3 transition-colors" style={{ borderColor: 'var(--acutix-table-border)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--acutix-hover-bg)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: n.color }} />
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--acutix-text-primary)' }}>{n.title}</p>
                        <p className="text-xs" style={{ color: 'var(--acutix-text-secondary)' }}>{n.desc}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--acutix-text-muted)' }}>{n.time}</p>
                      </div>
                    </div>
                  ))}
                  <div className="px-4 py-2.5 text-center border-t" style={{ borderColor: 'var(--acutix-table-border)' }}>
                    <button className="text-xs font-medium" style={{ color: '#3CC0D0' }}>View All Notifications</button>
                  </div>
                </div>
              )}
            </div>

            {/* Settings shortcut */}
            <button
              onClick={() => navigate('/settings')}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
              style={{ background: 'var(--acutix-input-bg)' }}
            >
              <Settings size={18} style={{ color: 'var(--acutix-text-secondary)' }} />
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                className="flex items-center gap-2 pl-2 border-l transition-all"
                style={{ borderColor: 'var(--acutix-input-border)' }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #1F2A5A, #3CC0D0)' }}>
                  RD
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold" style={{ color: 'var(--acutix-text-primary)' }}>Dr. Riya</p>
                  <p className="text-xs" style={{ color: 'var(--acutix-text-secondary)' }}>Administrator</p>
                </div>
                <ChevronDown size={14} style={{ color: 'var(--acutix-text-secondary)', transition: 'transform 0.2s', transform: profileOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-12 w-52 rounded-xl shadow-xl border z-50 overflow-hidden" style={{ borderColor: 'var(--acutix-input-border)', background: 'var(--acutix-card-bg)' }}>
                  {/* Profile header */}
                  <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--acutix-table-border)', background: 'var(--acutix-table-header-bg)' }}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #1F2A5A, #3CC0D0)' }}>
                        RD
                      </div>
                      <div>
                        <p className="text-sm font-bold" style={{ color: 'var(--acutix-text-primary)' }}>Dr. Riya Desai</p>
                        <p className="text-xs" style={{ color: 'var(--acutix-text-secondary)' }}>Administrator</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  {[
                    { icon: User, label: 'My Profile', path: '/profile' },
                    { icon: Settings, label: 'Settings', path: '/settings' },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.path}
                        onClick={() => { navigate(item.path); setProfileOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--acutix-hover-bg)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <Icon size={15} style={{ color: 'var(--acutix-text-secondary)' }} />
                        <span className="text-sm" style={{ color: 'var(--acutix-text-body)' }}>{item.label}</span>
                      </button>
                    );
                  })}

                  <div className="border-t" style={{ borderColor: 'var(--acutix-table-border)' }}>
                    <button
                      onClick={() => { handleLogout(); setProfileOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={15} style={{ color: '#EF4444' }} />
                      <span className="text-sm" style={{ color: '#EF4444' }}>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
