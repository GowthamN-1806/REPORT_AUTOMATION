import React, { useState, useEffect } from 'react';
import { Users, FileCheck, FileText, ShieldCheck, Loader2, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { SystemStats } from '../types';

interface StatsGridProps {
  stats: SystemStats;
  isProcessing?: boolean;
  isError?: boolean;
}

// Smooth animated counter component for numerical values
const AnimatedCounter: React.FC<{ value: number }> = ({ value }) => {
  const [displayValue, setDisplayValue] = useState<number>(value);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startVal = displayValue;
    const endVal = value;

    if (startVal === endVal) return;

    const duration = 300; // ms transition

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startVal + (endVal - startVal) * easedProgress);
      
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    const animFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animFrame);
  }, [value]);

  return <span>{displayValue.toLocaleString()}</span>;
};

export const StatsGrid: React.FC<StatsGridProps> = ({ stats, isProcessing = false, isError = false }) => {
  const isUploaded = stats.totalStudents > 0;
  const computedPages = stats.totalStudents > 0 ? (stats.pdfPages > stats.totalStudents ? stats.pdfPages : stats.totalStudents * 2) : 0;

  // Determine Upload Status Card details dynamically from state
  let uploadStatusText = 'Pending';
  let uploadSubtext = 'Awaiting Excel File';
  let uploadValueColor = 'text-amber-600 font-black';
  let uploadLeftBorder = 'border-l-amber-500 border-amber-200/90 hover:border-amber-400';
  let uploadIconBg = 'bg-gradient-to-tr from-amber-500 to-orange-500 text-white';
  let UploadStatusIcon = ShieldCheck;
  let uploadBadgeText = 'Awaiting Upload';
  let uploadBadgeClass = 'text-amber-700 bg-amber-50/90 border-amber-200 group-hover:bg-amber-100 group-hover:border-amber-300';
  let uploadBadgeIcon = <Clock className="w-3 h-3 text-amber-600" />;

  if (isProcessing) {
    uploadStatusText = 'Processing';
    uploadSubtext = 'Merging Excel Datasets...';
    uploadValueColor = 'text-blue-600 font-black';
    uploadLeftBorder = 'border-l-blue-500 border-blue-200/90 hover:border-blue-400';
    uploadIconBg = 'bg-gradient-to-tr from-blue-600 to-indigo-500 text-white';
    UploadStatusIcon = Loader2;
    uploadBadgeText = 'Processing...';
    uploadBadgeClass = 'text-blue-700 bg-blue-50/90 border-blue-200 group-hover:bg-blue-100 group-hover:border-blue-300 animate-pulse';
    uploadBadgeIcon = <Loader2 className="w-3 h-3 text-blue-600 animate-spin" />;
  } else if (isError) {
    uploadStatusText = 'Error';
    uploadSubtext = 'Parsing / Merge Failed';
    uploadValueColor = 'text-rose-600 font-black';
    uploadLeftBorder = 'border-l-rose-500 border-rose-200/90 hover:border-rose-400';
    uploadIconBg = 'bg-gradient-to-tr from-rose-600 to-red-500 text-white';
    UploadStatusIcon = AlertTriangle;
    uploadBadgeText = '✕ Error';
    uploadBadgeClass = 'text-rose-700 bg-rose-50/90 border-rose-200 group-hover:bg-rose-100 group-hover:border-rose-300';
    uploadBadgeIcon = <AlertTriangle className="w-3 h-3 text-rose-600 animate-bounce" />;
  } else if (isUploaded) {
    uploadStatusText = 'Success';
    uploadSubtext = 'Excel File Uploaded';
    uploadValueColor = 'text-emerald-600 font-black';
    uploadLeftBorder = 'border-l-emerald-500 border-emerald-200/90 hover:border-emerald-400';
    uploadIconBg = 'bg-gradient-to-tr from-emerald-600 to-green-500 text-white';
    UploadStatusIcon = ShieldCheck;
    uploadBadgeText = '✓ Saved';
    uploadBadgeClass = 'text-emerald-700 bg-emerald-50/90 border-emerald-200 group-hover:bg-emerald-100 group-hover:border-emerald-300 shadow-sm';
    uploadBadgeIcon = <CheckCircle2 className="w-3 h-3 text-emerald-600 animate-pulse" />;
  }

  const cards = [
    {
      id: 'students',
      title: 'TOTAL STUDENTS',
      isNumeric: true,
      numericValue: stats.totalStudents,
      subtext: isUploaded ? 'In Uploaded File' : 'No File Uploaded',
      icon: Users,
      iconBg: 'bg-gradient-to-tr from-blue-600 to-blue-500 text-white',
      borderStyle: 'border-l-4 border-l-blue-500 border-blue-200/90 hover:border-blue-400',
      badgeText: isUploaded ? `${stats.totalStudents} Students` : '0 Students',
      badgeClass: isUploaded
        ? 'text-blue-700 bg-blue-50/90 border-blue-200 group-hover:bg-blue-100 group-hover:border-blue-300'
        : 'text-slate-500 bg-slate-100 border-slate-200',
      badgeIcon: <span className={`w-1.5 h-1.5 rounded-full ${isUploaded ? 'bg-blue-500 animate-ping' : 'bg-slate-400'}`} />,
    },
    {
      id: 'reports',
      title: 'TOTAL REPORTS',
      isNumeric: true,
      numericValue: stats.reportsGenerated,
      subtext: isUploaded ? 'All Students' : 'No Reports Generated',
      icon: FileCheck,
      iconBg: 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white',
      borderStyle: 'border-l-4 border-l-emerald-500 border-emerald-200/90 hover:border-emerald-400',
      badgeText: isUploaded ? `Ready (${stats.reportsGenerated})` : '0 Generated',
      badgeClass: isUploaded
        ? 'text-emerald-700 bg-emerald-50/90 border-emerald-200 group-hover:bg-emerald-100 group-hover:border-emerald-300'
        : 'text-slate-500 bg-slate-100 border-slate-200',
      badgeIcon: null,
    },
    {
      id: 'pages',
      title: 'TOTAL PDF PAGES',
      isNumeric: true,
      numericValue: computedPages,
      subtext: isUploaded ? '2 Pages Per Student' : 'Pending Excel Upload',
      icon: FileText,
      iconBg: 'bg-gradient-to-tr from-purple-600 to-indigo-500 text-white',
      borderStyle: 'border-l-4 border-l-purple-500 border-purple-200/90 hover:border-purple-400',
      badgeText: isUploaded ? `${computedPages} Pages` : '0 Pages',
      badgeClass: isUploaded
        ? 'text-purple-700 bg-purple-50/90 border-purple-200 group-hover:bg-purple-100 group-hover:border-purple-300'
        : 'text-slate-500 bg-slate-100 border-slate-200',
      badgeIcon: null,
    },
    {
      id: 'status',
      title: 'UPLOAD STATUS',
      isNumeric: false,
      textValue: uploadStatusText,
      subtext: uploadSubtext,
      icon: UploadStatusIcon,
      iconBg: uploadIconBg,
      valueColor: uploadValueColor,
      borderStyle: `border-l-4 ${uploadLeftBorder}`,
      badgeText: uploadBadgeText,
      badgeClass: uploadBadgeClass,
      badgeIcon: uploadBadgeIcon,
    },
  ];

  return (
    <section className="max-w-[1600px] mx-auto px-6 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className={`group relative bg-gradient-to-br from-white via-slate-50/40 to-white rounded-2xl p-5 shadow-sm border ${card.borderStyle} hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out cursor-pointer overflow-hidden flex flex-col justify-between`}
            >
              {/* Subtle glass hover backdrop effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/50 to-slate-100/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              {/* Main Content Area */}
              <div className="relative z-10 flex items-center gap-4">
                {/* Large Left Icon Container */}
                <div className={`w-12 h-12 rounded-2xl ${card.iconBg} flex items-center justify-center shrink-0 shadow-md group-hover:scale-[1.08] transition-transform duration-300 ease-out`}>
                  <Icon className={`w-6 h-6 ${isProcessing && card.id === 'status' ? 'animate-spin' : ''}`} />
                </div>

                {/* Right Value & Title Area */}
                <div className="min-w-0 flex-1">
                  <p className="text-[10.5px] font-bold text-slate-400 uppercase tracking-widest truncate">
                    {card.title}
                  </p>

                  <h3 className={`text-2xl font-black tracking-tight truncate mt-0.5 ${card.valueColor || 'text-slate-900'}`}>
                    {card.isNumeric ? (
                      <AnimatedCounter value={card.numericValue!} />
                    ) : (
                      card.textValue
                    )}
                  </h3>

                  <p className="text-xs font-semibold text-slate-500 truncate mt-0.5">
                    {card.subtext}
                  </p>
                </div>
              </div>

              {/* Bottom Badge Bar */}
              <div className="relative z-10 mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                <span className={`inline-flex items-center gap-1.5 text-[10.5px] font-bold px-2.5 py-1 rounded-full border transition-colors duration-300 ${card.badgeClass}`}>
                  {card.badgeIcon}
                  {card.badgeText}
                </span>

                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider group-hover:text-slate-600 transition-colors">
                  System Live
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
