import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="max-w-[1600px] mx-auto px-6 pt-6 mb-6">
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm shadow-slate-200/60 border border-slate-200/90 hover:shadow-md transition-all duration-300 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        
        {/* Top subtle blue gradient accent line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600"></div>

        {/* Soft abstract background blur shape */}
        <div className="absolute -right-16 -top-16 w-72 h-72 bg-blue-100/40 rounded-full blur-3xl pointer-events-none"></div>

        {/* Left: Official College Logo & University Typography */}
        <div className="flex items-center gap-4 sm:gap-5 shrink-0 z-10">
          <div className="relative flex items-center justify-center p-2.5 bg-gradient-to-b from-slate-50 to-blue-50/40 rounded-2xl border border-slate-200/90 shadow-sm shrink-0">
            {/* Official JIT Logo Image (Kept Unchanged) */}
            <img
              src="/jit_logo.png"
              alt="Jeppiaar Institute of Technology Logo"
              className="w-16 sm:w-20 h-20 sm:h-24 object-contain transition-transform duration-300 hover:scale-105"
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-extrabold tracking-wider uppercase bg-blue-50 text-[#2563eb] px-2.5 py-0.5 rounded-full border border-blue-200/70 shadow-2xs">
                AN AUTONOMOUS INSTITUTION
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight font-poppins uppercase leading-tight">
              JEPPIAAR INSTITUTE OF TECHNOLOGY
            </h1>
            <h2 className="text-xs sm:text-sm font-extrabold text-[#2563eb] tracking-wider mt-0.5 uppercase">
              STUDENT MARK REPORT AUTOMATION SYSTEM
            </h2>
            <p className="text-xs text-slate-500 font-semibold tracking-wide mt-1">
              Automate • Generate • Simplify
            </p>
          </div>
        </div>

        {/* Right: Premium Glassmorphism Academic Illustration */}
        <div className="shrink-0 relative hidden lg:flex items-center z-10">
          <div className="bg-gradient-to-r from-blue-50/90 via-sky-50/70 to-indigo-50/90 backdrop-blur-md border border-blue-100/90 rounded-2xl px-5 py-3.5 shadow-inner flex items-center gap-5">
            
            {/* Analytics Bar Chart */}
            <div className="flex items-end gap-1.5 h-11">
              <div className="w-2.5 bg-blue-400/90 rounded-t-sm h-6"></div>
              <div className="w-2.5 bg-blue-500 rounded-t-sm h-10"></div>
              <div className="w-2.5 bg-blue-600 rounded-t-sm h-8"></div>
              <div className="w-2.5 bg-[#2563eb] rounded-t-sm h-11"></div>
            </div>

            {/* Document Sheet & Graduation Cap Icon Group */}
            <div className="relative flex items-center justify-center">
              {/* Document Sheet */}
              <div className="w-10 h-13 bg-white rounded-md border-2 border-blue-500 shadow-sm p-1.5 flex flex-col gap-1">
                <div className="h-1 bg-blue-400 rounded w-full"></div>
                <div className="h-1 bg-blue-200 rounded w-3/4"></div>
                <div className="h-1 bg-blue-200 rounded w-5/6"></div>
                <div className="h-1 bg-blue-200 rounded w-2/3"></div>
              </div>

              {/* Graduation Cap Badge */}
              <div className="absolute -top-3.5 -right-3.5">
                <svg className="w-9 h-9 drop-shadow-md" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <polygon points="20,8 36,16 20,24 4,16" fill="#2563EB" />
                  <path d="M10,20 L10,27 C10,31 30,31 30,27 L30,20" fill="#1E3A8A" />
                  <path d="M32,17 L36,25 L36,30" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="36" cy="31" r="1.5" fill="#F59E0B" />
                </svg>
              </div>
            </div>

          </div>
        </div>

      </div>
    </header>
  );
};

