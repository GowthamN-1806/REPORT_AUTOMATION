import React, { useRef } from 'react';
import { UploadCloud, CheckCircle2, Trash2, FileText } from 'lucide-react';
import { UploadSummary } from '../types';

interface UploadSectionProps {
  onFileUpload: (file: File) => void;
  onLoadSampleData: () => void;
  onDownloadSampleTemplate: () => void;
  onDeleteFile: () => void;
  onDownloadWord: () => void;
  onDownloadPDF: () => void;
  summary: UploadSummary | null;
  uploadedFile: { name: string; size: string } | null;
  isProcessing: boolean;
  regulation?: string;
  onRegulationChange?: (val: string) => void;
}

export const UploadSection: React.FC<UploadSectionProps> = ({
  onFileUpload,
  onLoadSampleData,
  onDownloadSampleTemplate,
  onDeleteFile,
  onDownloadWord,
  onDownloadPDF,
  summary,
  uploadedFile,
  isProcessing,
  regulation = '2021',
  onRegulationChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        onFileUpload(file);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="w-full flex flex-col gap-5">
      
      {/* Upload Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 hover:shadow-md transition-all duration-300 relative">
        
        {/* Step Badge Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shadow-md ring-4 ring-blue-50 shrink-0">
            1
          </div>
          <h3 className="text-sm font-extrabold text-blue-950 tracking-tight font-poppins">
            Upload Excel File
          </h3>
        </div>

        {/* Drag & Drop Dropzone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-blue-300 hover:border-blue-500 rounded-2xl p-8 text-center bg-gradient-to-b from-blue-50/40 via-blue-50/20 to-transparent hover:from-blue-50/70 hover:to-blue-100/40 transition-all duration-300 cursor-pointer group shadow-inner"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xlsx,.xls"
            className="hidden"
          />

          {/* Cloud Icon */}
          <div className="w-14 h-14 rounded-2xl bg-blue-100/80 text-blue-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
            <UploadCloud className="w-7 h-7" />
          </div>

          <h4 className="text-xs font-bold text-slate-800 mb-1">
            Drag & Drop Excel File Here
          </h4>
          <p className="text-[11px] text-slate-400 mb-3">or</p>

          <button
            type="button"
            className="px-6 py-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all"
          >
            Browse File
          </button>

          <p className="text-[10px] text-slate-400 mt-3 font-semibold">
            Only .xlsx files are supported
          </p>
        </div>

        {/* Quick Helper Actions when no file uploaded */}
        {!uploadedFile && (
          <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDownloadSampleTemplate();
              }}
              className="text-blue-600 hover:text-blue-800 font-semibold hover:underline flex items-center gap-1.5 transition-colors"
            >
              <span>📥</span> Download Excel Template
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onLoadSampleData();
              }}
              className="text-slate-500 hover:text-blue-700 font-medium hover:underline transition-colors"
            >
              Load Demo Excel Data
            </button>
          </div>
        )}

        {/* Uploaded File Banner */}
        {uploadedFile && (
          <div className="mt-4 bg-slate-50 border border-slate-200/90 rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-500 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-sm">
                X
              </div>

              <div className="min-w-0">
                <p className="text-xs font-bold text-blue-950 font-mono truncate">
                  {uploadedFile.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-slate-500 font-medium">
                    {uploadedFile.size} • {summary?.totalStudents || 512} Students
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Uploaded Successfully
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onDeleteFile}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
              title="Delete File"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Editable Regulation Setting Field */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm">⚙️</span>
            <label className="text-xs font-bold text-slate-700">
              Regulation:
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={regulation}
              onChange={(e) => onRegulationChange && onRegulationChange(e.target.value)}
              placeholder="2021 / 2024"
              className="w-28 text-xs font-bold font-mono px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 transition-all text-center"
            />
          </div>
        </div>

      </div>

      {/* Step 2: Download All Student Reports Section */}
      {summary && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 hover:shadow-md transition-all duration-300">
          
          {/* Step 2 Badge Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shadow-md ring-4 ring-blue-50 shrink-0">
              2
            </div>
            <h3 className="text-sm font-extrabold text-blue-950 tracking-tight font-poppins">
              Download All Student Reports
            </h3>
          </div>

          <div className="flex flex-row gap-3">
            {/* Button 1: Download Word */}
            <button
              onClick={onDownloadWord}
              disabled={isProcessing}
              className="flex-1 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-md hover:shadow-xl flex items-center gap-3 cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
            >
              {/* Word W Icon */}
              <div className="w-10 h-10 rounded-xl bg-white text-blue-700 flex items-center justify-center font-black text-lg font-serif shadow-sm shrink-0 border border-blue-100">
                W
              </div>
              <div className="text-left min-w-0 flex-1">
                <span className="block text-sm font-black text-white tracking-wide truncate">
                  Download Word
                </span>
                <span className="block text-[11px] font-bold text-blue-200 mt-0.5">
                  .docx
                </span>
              </div>
            </button>

            {/* Button 2: Download PDF */}
            <button
              onClick={onDownloadPDF}
              disabled={isProcessing}
              className="flex-1 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white shadow-md hover:shadow-xl flex items-center gap-3 cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
            >
              {/* PDF Icon */}
              <div className="w-10 h-10 rounded-xl bg-white text-red-600 flex flex-col items-center justify-center font-black text-[9px] leading-tight shadow-sm shrink-0 border border-red-100">
                <span className="text-[8px]">📄</span>
                <span>PDF</span>
              </div>
              <div className="text-left min-w-0 flex-1">
                <span className="block text-sm font-black text-white tracking-wide truncate">
                  Download PDF
                </span>
                <span className="block text-[11px] font-bold text-red-200 mt-0.5">
                  .pdf
                </span>
              </div>
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
