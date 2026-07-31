import React from 'react';
import { Loader2, FileSpreadsheet, Layers, Sparkles, CheckCircle2 } from 'lucide-react';

interface ProcessingModalProps {
  isOpen: boolean;
  stepMessage: string;
  processedCount: number;
  totalCount: number;
  progressPercent: number;
}

export const ProcessingModal: React.FC<ProcessingModalProps> = ({
  isOpen,
  stepMessage,
  processedCount,
  totalCount,
  progressPercent,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-[24px] p-8 max-w-md w-full shadow-2xl border border-slate-100 text-center relative overflow-hidden">
        
        {/* Top Glow bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500"></div>

        {/* Animated Spinner Icon */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
          <div
            className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"
            style={{ animationDuration: '1s' }}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center text-blue-600">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        </div>

        <h3 className="text-xl font-extrabold text-slate-900 mb-1 font-poppins">
          Processing Examination Data
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          Jeppiaar IT Automated Report Generator Engine
        </p>

        {/* Status Message */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-6">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
            <span className="flex items-center gap-1.5 text-blue-600">
              <Sparkles className="w-4 h-4 animate-pulse text-amber-500" />
              {stepMessage}
            </span>
            <span className="font-mono text-slate-900 font-bold">
              {processedCount} / {totalCount}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 rounded-full transition-all duration-300 shadow-md"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>

          <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-2">
            <span>0%</span>
            <span>{Math.round(progressPercent)}% Completed</span>
            <span>100%</span>
          </div>
        </div>

        <div className="space-y-2 text-left text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Reading & validating Excel sheet data</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Auto-populating PARENTS.docx Template</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className={`w-4 h-4 shrink-0 ${progressPercent > 70 ? 'text-emerald-500' : 'text-slate-300'}`} />
            <span>Merging reports into combined Word & PDF files</span>
          </div>
        </div>

      </div>
    </div>
  );
};
