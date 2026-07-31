import React from 'react';
import { Users, FileCheck, FileText, ShieldCheck } from 'lucide-react';
import { SystemStats } from '../types';

interface StatsGridProps {
  stats: SystemStats;
}

export const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  const isUploaded = stats.totalStudents > 0 || stats.uploadStatus === 'Success';

  const cards = [
    {
      title: 'Total Students',
      value: stats.totalStudents.toString(),
      subtext: isUploaded ? 'In Uploaded File' : 'No File Uploaded',
      icon: Users,
      iconBg: 'bg-gradient-to-tr from-blue-600 to-blue-500 text-white',
      accentColor: 'border-t-blue-500',
    },
    {
      title: 'Total Reports',
      value: stats.reportsGenerated.toString(),
      subtext: isUploaded ? 'All Students' : 'No Reports Generated',
      icon: FileCheck,
      iconBg: 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white',
      accentColor: 'border-t-emerald-500',
    },
    {
      title: 'Total PDF Pages',
      value: stats.pdfPages.toString(),
      subtext: isUploaded ? '(2 Pages Per Student)' : 'Pending Excel Upload',
      icon: FileText,
      iconBg: 'bg-gradient-to-tr from-purple-600 to-indigo-500 text-white',
      accentColor: 'border-t-purple-500',
    },
    {
      title: 'Upload Status',
      value: isUploaded ? 'Success' : 'Pending',
      subtext: isUploaded ? 'Excel File Uploaded' : 'Awaiting Excel File',
      icon: ShieldCheck,
      iconBg: isUploaded
        ? 'bg-gradient-to-tr from-emerald-600 to-green-500 text-white'
        : 'bg-gradient-to-tr from-amber-500 to-orange-500 text-white',
      valueColor: isUploaded ? 'text-emerald-600 font-black' : 'text-amber-600 font-black',
      accentColor: isUploaded ? 'border-t-emerald-500' : 'border-t-amber-500',
    },
  ];

  return (
    <section className="max-w-[1600px] mx-auto px-6 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`bg-white rounded-2xl p-4.5 shadow-sm border border-slate-200/80 border-t-4 ${card.accentColor} hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-3.5`}
            >
              <div className={`w-11 h-11 rounded-xl ${card.iconBg} flex items-center justify-center shrink-0 shadow-sm`}>
                <Icon className="w-5.5 h-5.5" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider truncate">
                  {card.title}
                </p>
                <h3 className={`text-lg font-black tracking-tight truncate ${card.valueColor || 'text-slate-900'}`}>
                  {card.value}
                </h3>
                <p className="text-[10px] font-semibold text-slate-400 truncate mt-0.5">
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
