import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="max-w-[1600px] mx-auto px-4 sm:px-6 pt-6 mb-6">
      <div className="bg-white/95 rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-200/80 hover:shadow-md transition-all duration-300 flex flex-col lg:flex-row items-center justify-between gap-6 relative overflow-hidden backdrop-blur-md">
        
        {/* Top vivid blue gradient line accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600"></div>

        {/* Soft Abstract Blue Wave Pattern Background */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-30 z-0"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          viewBox="0 0 1200 120"
        >
          <defs>
            <linearGradient id="header-wave-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.05" />
              <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.08" />
            </linearGradient>
          </defs>
          <path
            d="M0,0 C150,90 350,-40 500,50 C650,140 900,10 1200,60 L1200,0 L0,0 Z"
            fill="url(#header-wave-grad)"
          />
        </svg>

        {/* Left: Official College Logo Image & Title Section */}
        <div className="flex items-center gap-5 sm:gap-6 shrink-0 relative z-10">
          <div className="relative flex items-center justify-center p-2.5 bg-gradient-to-b from-slate-50 to-blue-50/40 rounded-2xl border border-slate-200/90 shadow-sm shrink-0">
            {/* Official JIT Logo Image */}
            <img
              src="/jit_logo.png"
              alt="Jeppiaar Institute of Technology Logo"
              className="w-20 h-24 object-contain transition-transform duration-300 hover:scale-105"
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-black tracking-widest uppercase bg-blue-50 text-blue-700 px-3 py-0.5 rounded-full border border-blue-200/80 shadow-2xs">
                AN AUTONOMOUS INSTITUTION
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-black text-blue-950 tracking-tight font-poppins uppercase leading-tight">
              JEPPIAAR INSTITUTE OF TECHNOLOGY
            </h1>
            <h2 className="text-xs sm:text-sm font-extrabold text-blue-600 tracking-wider mt-1 uppercase">
              STUDENT MARK REPORT AUTOMATION SYSTEM
            </h2>
            <p className="text-xs text-slate-500 font-semibold tracking-wide mt-1.5 flex items-center gap-1.5">
              <span>Automate</span>
              <span className="text-blue-400 font-bold">•</span>
              <span>Generate</span>
              <span className="text-blue-400 font-bold">•</span>
              <span>Simplify</span>
            </p>
          </div>
        </div>

        {/* Right: Modern University ERP Illustration Graphic */}
        <div className="shrink-0 relative hidden sm:flex items-center z-10">
          <div className="w-80 h-24 relative flex items-center justify-end">
            <div className="w-full h-full bg-gradient-to-r from-blue-50/40 via-sky-50/60 to-indigo-50/50 rounded-2xl flex items-center justify-between px-5 backdrop-blur-md border border-blue-100/80 shadow-inner overflow-hidden relative">
              
              {/* Soft decorative background leaf/shape vectors */}
              <svg className="absolute -left-4 -bottom-6 w-24 h-24 opacity-25 text-blue-400" viewBox="0 0 100 100" fill="currentColor">
                <path d="M10,90 Q50,10 90,90 Q50,70 10,90 Z" />
              </svg>
              <svg className="absolute -right-4 -top-6 w-28 h-28 opacity-20 text-indigo-400" viewBox="0 0 100 100" fill="currentColor">
                <circle cx="50" cy="50" r="40" />
              </svg>

              {/* Graphic SVG Illustration (Analytics, Document, Graduation Cap & Tassel) */}
              <svg className="w-full h-full relative z-10" viewBox="0 0 280 90" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Bar Chart Analytics Graphic */}
                <rect x="15" y="52" width="10" height="26" rx="3" fill="#60A5FA" />
                <rect x="30" y="38" width="10" height="40" rx="3" fill="#3B82F6" />
                <rect x="45" y="24" width="10" height="54" rx="3" fill="#2563EB" />
                <rect x="60" y="32" width="10" height="46" rx="3" fill="#1D4ED8" />

                {/* Report Document Sheet Card */}
                <rect x="85" y="16" width="55" height="66" rx="6" fill="#FFFFFF" stroke="#3B82F6" strokeWidth="2" />
                <line x1="95" y1="28" x2="128" y2="28" stroke="#93C5FD" strokeWidth="3" strokeLinecap="round" />
                <line x1="95" y1="38" x2="122" y2="38" stroke="#BFDBFE" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="95" y1="46" x2="125" y2="46" stroke="#BFDBFE" strokeWidth="2.5" strokeLinecap="round" />
                
                {/* Secondary Stacked Document */}
                <rect x="135" y="24" width="45" height="58" rx="5" fill="#F8FAFC" stroke="#60A5FA" strokeWidth="1.5" />
                <line x1="143" y1="35" x2="168" y2="35" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="143" y1="43" x2="163" y2="43" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />

                {/* Graduation Cap (Mortarboard) */}
                <g transform="translate(165, 8)">
                  {/* Diamond Top Cap */}
                  <path d="M45 10 L85 24 L45 38 L5 24 Z" fill="#1E3A8A" />
                  <path d="M45 12 L80 24 L45 36 L10 24 Z" fill="#2563EB" />
                  
                  {/* Cap Skull Base */}
                  <path d="M22 30 L22 46 C22 52, 68 52, 68 46 L68 30" fill="#1D4ED8" />
                  <path d="M25 32 L25 44 C25 49, 65 49, 65 44 L65 32" fill="#3B82F6" />

                  {/* Golden Tassel Button & Cord */}
                  <circle cx="45" cy="24" r="3.5" fill="#F59E0B" />
                  <path d="M45 24 C55 26, 76 34, 76 46" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  
                  {/* Hanging Tassel Fringe */}
                  <polygon points="73,46 79,46 81,58 71,58" fill="#D97706" />
                  <circle cx="76" cy="58" r="2.5" fill="#F59E0B" />
                </g>

                {/* Abstract Blue Botanical Leaves */}
                <path d="M255 65 C265 50, 275 40, 270 30 C260 40, 250 50, 255 65 Z" fill="#93C5FD" opacity="0.8" />
                <path d="M245 70 C258 60, 268 55, 265 45 C255 52, 245 60, 245 70 Z" fill="#3B82F6" opacity="0.7" />
              </svg>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
};
