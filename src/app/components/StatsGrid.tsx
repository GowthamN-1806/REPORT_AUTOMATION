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
      title: 'Total Students',
      isNumeric: true,
      numericValue: stats.totalStudents,
      subtext: isUploaded ? 'In Uploaded File' : 'No File Uploaded',
      icon: Users,
      iconBg: 'bg-blue-600 text-white',
      borderStyle: 'border-l-[3.5px] border-l-blue-500 border-slate-200/90 hover:border-blue-300',
      badgeText: isUploaded ? `${stats.totalStudents} Students` : '0 Students',
      badgeClass: isUploaded
        ? 'text-blue-700 bg-blue-50 border-blue-200'
        : 'text-slate-500 bg-slate-100 border-slate-200',
      badgeIcon: <span className={`w-1.5 h-1.5 rounded-full ${isUploaded ? 'bg-blue-500 animate-ping' : 'bg-slate-400'}`} />,
    },
    {
      id: 'reports',
      title: 'Total Reports',
      isNumeric: true,
      numericValue: stats.reportsGenerated,
      subtext: isUploaded ? 'All Students' : 'No Reports',
      icon: FileCheck,
      iconBg: 'bg-emerald-600 text-white',
      borderStyle: 'border-l-[3.5px] border-l-emerald-500 border-slate-200/90 hover:border-emerald-300',
      badgeText: isUploaded ? `Ready (${stats.reportsGenerated})` : '0 Generated',
      badgeClass: isUploaded
        ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
        : 'text-slate-500 bg-slate-100 border-slate-200',
      badgeIcon: null,
    },
    {
      id: 'pages',
      title: 'Total PDF Pages',
      isNumeric: true,
      numericValue: computedPages,
      subtext: isUploaded ? '2 Pages / Student' : 'Pending Upload',
      icon: FileText,
      iconBg: 'bg-purple-600 text-white',
      borderStyle: 'border-l-[3.5px] border-l-purple-500 border-slate-200/90 hover:border-purple-300',
      badgeText: isUploaded ? `${computedPages} Pages` : '0 Pages',
      badgeClass: isUploaded
        ? 'text-purple-700 bg-purple-50 border-purple-200'
        : 'text-slate-500 bg-slate-100 border-slate-200',
      badgeIcon: null,
    },
    {
      id: 'status',
      title: 'Upload Status',
      isNumeric: false,
      textValue: uploadStatusText,
      subtext: uploadSubtext,
      icon: UploadStatusIcon,
      iconBg: uploadIconBg,
      valueColor: uploadValueColor,
      borderStyle: `border-l-[3.5px] ${uploadLeftBorder}`,
      badgeText: uploadBadgeText,
      badgeClass: uploadBadgeClass,
      badgeIcon: uploadBadgeIcon,
    },
  ];

  return (
    <section className="max-w-[1600px] mx-auto px-6 mb-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className={`group bg-white rounded-xl py-2.5 px-3.5 shadow-xs border ${card.borderStyle} hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ease-out cursor-default flex flex-col justify-between`}
            >
              {/* Top Row: Icon + Title + Status Badge */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-7 h-7 rounded-lg ${card.iconBg} flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform duration-200`}>
                    <Icon className={`w-3.5 h-3.5 ${isProcessing && card.id === 'status' ? 'animate-spin' : ''}`} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
                    {card.title}
                  </span>
                </div>

                <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${card.badgeClass}`}>
                  {card.badgeIcon}
                  {card.badgeText}
                </span>
              </div>

              {/* Bottom Row: Value + Subtext */}
              <div className="flex items-baseline justify-between gap-2 mt-1.5 pt-1 border-t border-slate-100/80">
                <h3 className={`text-lg font-black tracking-tight ${card.valueColor || 'text-slate-900'}`}>
                  {card.isNumeric ? (
                    <AnimatedCounter value={card.numericValue!} />
                  ) : (
                    card.textValue
                  )}
                </h3>

                <p className="text-[11px] font-medium text-slate-400 truncate text-right">
                  {card.subtext}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
