import React from 'react';
import { FileCheck } from 'lucide-react';

interface DownloadSectionProps {
  onDownloadWord: () => void;
  onDownloadPDF: () => void;
  isProcessing: boolean;
  totalStudents: number;
}

export const DownloadSection: React.FC<DownloadSectionProps> = ({
  onDownloadWord,
  onDownloadPDF,
  isProcessing,
  totalStudents,
}) => {
  return (
    <section className="max-w-[1600px] mx-auto px-6 mb-8">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100/90">
        
        {/* Step Badge Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
            3
          </div>
          <h3 className="text-sm font-extrabold text-blue-900 tracking-tight font-poppins">
            Download All Student Reports
          </h3>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          
          {/* Left Description with Icon */}
          <div className="flex items-start gap-4 max-w-2xl">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
              <FileCheck className="w-6 h-6" />
            </div>
            <p className="text-xs text-slate-500 leading-relaxed pt-1">
              Each student's details from the uploaded Excel file will automatically populate the report template. A separate report will be created for every student and all reports will be combined into one file.
            </p>
          </div>

          {/* Right TWO LARGE BUTTONS ONLY */}
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto shrink-0">
            
            {/* Button 1: Download All Reports (Word) */}
            <button
              onClick={onDownloadWord}
              disabled={isProcessing}
              className="px-6 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg flex items-center gap-4 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 min-w-[260px]"
            >
              {/* Blue MS Word W Icon Box */}
              <div className="w-11 h-11 rounded-xl bg-white text-blue-600 flex items-center justify-center font-extrabold text-xl font-serif shadow-sm shrink-0 border border-blue-100">
                W
              </div>
              <div className="text-left">
                <span className="block text-sm font-extrabold text-white tracking-wide">
                  Download All Reports (Word)
                </span>
                <span className="block text-xs font-semibold text-blue-200 mt-0.5">
                  .docx
                </span>
              </div>
            </button>

            {/* Button 2: Download All Reports (PDF) */}
            <button
              onClick={onDownloadPDF}
              disabled={isProcessing}
              className="px-6 py-4 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-md hover:shadow-lg flex items-center gap-4 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 min-w-[260px]"
            >
              {/* Red PDF Icon Box */}
              <div className="w-11 h-11 rounded-xl bg-white text-red-600 flex flex-col items-center justify-center font-extrabold text-[10px] leading-tight shadow-sm shrink-0 border border-red-100">
                <span className="text-[8px] tracking-tighter text-red-500">📄</span>
                <span>PDF</span>
              </div>
              <div className="text-left">
                <span className="block text-sm font-extrabold text-white tracking-wide">
                  Download All Reports (PDF)
                </span>
                <span className="block text-xs font-semibold text-red-200 mt-0.5">
                  .pdf
                </span>
              </div>
            </button>

          </div>

        </div>

      </div>
    </section>
  );
};
