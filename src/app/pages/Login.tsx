import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Eye, EyeOff, Heart, Activity, Shield, Stethoscope } from 'lucide-react';
const acutixLogo = "/assets/acutix-logo.png";

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/');
    }, 1200);
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 relative overflow-hidden p-12"
        style={{ background: 'linear-gradient(135deg, #1F2A5A 0%, #162040 50%, #0D1629 100%)' }}>
        {/* Background decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #3CC0D0, transparent)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #F6C177, transparent)', transform: 'translate(-30%, 30%)' }} />
        <div className="absolute top-1/2 right-1/4 w-64 h-64 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #5ED3CF, transparent)' }} />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <img src={acutixLogo} alt="ACUTIX" className="w-12 h-12 object-contain" />
          </div>
          <div>
            <h1 className="text-white text-2xl tracking-widest" style={{ fontWeight: 800 }}>ACUTIX</h1>
            <p className="text-xs" style={{ color: '#3CC0D0' }}>Hospital Management System</p>
          </div>
        </div>

        {/* Center content */}
        <div className="relative z-10">
          <h2 className="text-white text-4xl font-bold mb-4 leading-tight">
            Advanced Healthcare<br />
            <span style={{ background: 'linear-gradient(135deg, #3CC0D0, #F6C177)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Management Platform
            </span>
          </h2>
          <p className="text-base mb-10" style={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.8 }}>
            A comprehensive solution for modern hospitals — manage patients, appointments,
            billing, inventory, fertility treatments, and staff all in one place.
          </p>

          {/* Feature highlights */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Heart, label: 'Fertility Module', desc: 'IVF, IUI & ICSI tracking' },
              { icon: Activity, label: 'Live Analytics', desc: 'Real-time insights' },
              { icon: Shield, label: 'Secure Records', desc: 'HIPAA-compliant storage' },
              { icon: Stethoscope, label: 'Multi-Specialty', desc: 'Complete care management' },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="flex items-start gap-3 p-4 rounded-2xl"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, rgba(60,192,208,0.3), rgba(246,193,119,0.2))' }}>
                    <Icon size={16} style={{ color: '#3CC0D0' }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{feature.label}</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{feature.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom stats */}
        <div className="flex gap-8 relative z-10">
          {[
            { value: '2,800+', label: 'Patients Managed' },
            { value: '98%', label: 'Success Rate' },
            { value: '45+', label: 'Staff Members' },
          ].map((stat, i) => (
            <div key={i}>
              <p className="text-2xl font-bold" style={{ color: '#3CC0D0' }}>{stat.value}</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8" style={{ background: '#F4F7FB' }}>
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden"
              style={{ background: '#1F2A5A', border: '2px solid #3CC0D0' }}>
              <img src={acutixLogo} alt="ACUTIX" className="w-10 h-10 object-contain" />
            </div>
            <div>
              <h1 className="text-2xl" style={{ color: '#1F2A5A', fontWeight: 800, letterSpacing: '0.1em' }}>ACUTIX</h1>
              <p className="text-xs" style={{ color: '#3CC0D0' }}>Hospital Management System</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8" style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}>
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#1F2A5A' }}>Welcome Back</h2>
              <p className="text-sm" style={{ color: '#6B7280' }}>Sign in to your ACUTIX account to continue</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#374151' }}>
                  Email or Username
                </label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@acutix.com"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{
                    border: '1.5px solid #E5E7EB',
                    background: '#F9FAFB',
                    color: '#1F2A5A',
                    fontFamily: 'Poppins, sans-serif',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3CC0D0'}
                  onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#374151' }}>
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••"
                    className="w-full px-4 py-3 pr-12 rounded-xl text-sm outline-none transition-all"
                    style={{
                      border: '1.5px solid #E5E7EB',
                      background: '#F9FAFB',
                      color: '#1F2A5A',
                      fontFamily: 'Poppins, sans-serif',
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3CC0D0'}
                    onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                    style={{ color: '#9CA3AF' }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="flex justify-end">
                <button type="button" className="text-sm font-medium transition-colors"
                  style={{ color: '#3CC0D0' }}>
                  Forgot Password?
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all relative overflow-hidden"
                style={{
                  background: loading ? '#9CA3AF' : 'linear-gradient(135deg, #1F2A5A, #3CC0D0)',
                  boxShadow: loading ? 'none' : '0 4px 20px rgba(60,192,208,0.4)',
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in...
                  </span>
                ) : 'Sign In to ACUTIX'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs" style={{ color: '#9CA3AF' }}>
                Demo: Use any credentials to access the prototype
              </p>
            </div>
          </div>

          <p className="text-center text-xs mt-6" style={{ color: '#9CA3AF' }}>
            © 2026 ACUTIX Hospital Management System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}