import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="max-w-[1600px] mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 text-xs font-medium border-t border-slate-200/60 mt-4">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-blue-600" />
        <span className="text-slate-600 font-semibold">Jeppiaar Institute of Technology</span>
        <span>|</span>
        <span className="text-slate-500">Student Mark Report Automation System</span>
      </div>

      <div>
        © 2026 All Rights Reserved.
      </div>
    </footer>
  );
};
