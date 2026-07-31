import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="max-w-[1600px] mx-auto px-6 pt-6 mb-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 hover:shadow-md transition-all duration-300 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        
        {/* Top subtle gradient line accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600"></div>

        {/* Left: Official College Logo Image & Title */}
        <div className="flex items-center gap-5 shrink-0">
          <div className="relative flex items-center justify-center p-2 bg-gradient-to-b from-slate-50 to-blue-50/30 rounded-2xl border border-slate-200/90 shadow-sm">
            {/* Official JIT Logo Image */}
            <img
              src="/jit_logo.png"
              alt="Jeppiaar Institute of Technology Logo"
              className="w-20 h-24 object-contain transition-transform duration-300 hover:scale-105"
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black tracking-wider uppercase bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200/80">
                AN AUTONOMOUS INSTITUTION
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-blue-950 tracking-tight font-poppins uppercase">
              JEPPIAAR INSTITUTE OF TECHNOLOGY
            </h1>
            <h2 className="text-xs sm:text-sm font-extrabold text-blue-600 tracking-wider mt-0.5 uppercase">
              STUDENT MARK REPORT AUTOMATION SYSTEM
            </h2>
            <p className="text-xs text-slate-500 font-semibold tracking-wide mt-1">
              Automate • Generate • Simplify
            </p>
          </div>
        </div>

        {/* Right: Modern Academic Graphic Badge */}
        <div className="shrink-0 relative hidden sm:flex items-center">
          <div className="w-56 h-24 relative flex items-center justify-end">
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-48 h-20 bg-gradient-to-r from-blue-50 to-indigo-50/60 rounded-2xl flex items-center justify-end pr-4 backdrop-blur-sm border border-blue-100/80 shadow-inner">
              <svg className="w-40 h-20" viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="10" y="55" width="12" height="30" rx="3" fill="#3B82F6" opacity="0.8" />
                <rect x="28" y="40" width="12" height="45" rx="3" fill="#2563EB" />
                <rect x="46" y="25" width="12" height="60" rx="3" fill="#1D4ED8" />
                <rect x="64" y="35" width="12" height="50" rx="3" fill="#60A5FA" />
                
                <rect x="85" y="15" width="45" height="65" rx="4" fill="#FFFFFF" stroke="#3B82F6" strokeWidth="2" />
                <line x1="93" y1="28" x2="120" y2="28" stroke="#93C5FD" strokeWidth="3" strokeLinecap="round" />
                <line x1="93" y1="38" x2="115" y2="38" stroke="#BFDBFE" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="93" y1="46" x2="118" y2="46" stroke="#BFDBFE" strokeWidth="2.5" strokeLinecap="round" />
                
                <path d="M140 22 L175 35 L140 48 L105 35 Z" fill="#1E3A8A" />
                <path d="M118 41 L118 58 C118 63, 162 63, 162 58 L162 41" fill="#2563EB" />
                <path d="M172 36 L180 50 L180 62" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="180" cy="64" r="3" fill="#F59E0B" />
              </svg>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
};
