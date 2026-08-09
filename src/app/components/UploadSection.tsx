import React, { useRef, useState } from 'react';
import {
  Trash2,
  Layers,
  FileCheck2,
  Sparkles,
  ArrowRight,
  Loader2,
  FileSpreadsheet,
  CheckCircle2,
  FileText,
  Download,
} from 'lucide-react';
import { ResultPattern, UploadedFileSlotInfo } from '../types';
import { MergeEngineResult } from '../utils/excelMergeEngine';

interface UploadSectionProps {
  selectedPattern: ResultPattern;
  onPatternSelect: (pattern: ResultPattern) => void;
  fileSlots: Record<string, UploadedFileSlotInfo>;
  onFileUploadToSlot: (slotKey: 'univ' | 'cie1' | 'cie2' | 'model', file: File) => void;
  onRemoveSlotFile: (slotKey: 'univ' | 'cie1' | 'cie2' | 'model') => void;
  onLoadSampleData: () => void;
  onDownloadSampleTemplate: () => void;
  onRunMerge: () => void;
  onGenerateDocuments: () => void;
  onDownloadWord: () => void;
  onDownloadPDF: () => void;
  mergeResult: MergeEngineResult | null;
  isProcessing: boolean;
  regulation?: string;
  onRegulationChange?: (val: string) => void;
}

export const UploadSection: React.FC<UploadSectionProps> = ({
  fileSlots,
  onFileUploadToSlot,
  onRemoveSlotFile,
  onRunMerge,
  onDownloadWord,
  onDownloadPDF,
  mergeResult,
  isProcessing,
  regulation = '2021',
  onRegulationChange,
}) => {
  const univInputRef = useRef<HTMLInputElement>(null);
  const cie1InputRef = useRef<HTMLInputElement>(null);
  const cie2InputRef = useRef<HTMLInputElement>(null);
  const modelInputRef = useRef<HTMLInputElement>(null);

  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null);

  const handleFileInputChange = (
    key: 'univ' | 'cie1' | 'cie2' | 'model',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      onFileUploadToSlot(key, e.target.files[0]);
    }
  };

  const getSlotRef = (key: string) => {
    switch (key) {
      case 'univ': return univInputRef;
      case 'cie1': return cie1InputRef;
      case 'cie2': return cie2InputRef;
      case 'model': return modelInputRef;
      default: return univInputRef;
    }
  };

  const allSlotKeys: ('univ' | 'cie1' | 'cie2' | 'model')[] = ['univ', 'cie1', 'cie2', 'model'];

  // RUN button is enabled immediately when required University Result Excel is uploaded
  const isUnivUploaded = !!fileSlots.univ?.file;
  // Downloads are enabled once merge engine runs and generates preview
  const isReadyToDownload = mergeResult && mergeResult.isReadyForPreview;

  return (
    <div className="w-full">
      {/* Main Combined Workflow Excel Upload Card */}
      <div className="bg-white rounded-2xl p-4.5 sm:p-5 shadow-sm border border-slate-200/90 hover:shadow-md transition-all duration-300">
        
        {/* Section Header with Regulation Code on Top-Right */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-md ring-4 ring-blue-50 shrink-0">
              1
            </div>
            <h3 className="text-base font-black text-slate-950 tracking-tight font-poppins">
              Upload Required Excel Files
            </h3>
          </div>

          {/* Regulation Code Box placed at Top-Right */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/90 px-3 py-1 rounded-xl shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <label className="text-xs font-extrabold text-slate-700">
              Regulation Code:
            </label>
            <input
              type="text"
              value={regulation}
              onChange={(e) => onRegulationChange && onRegulationChange(e.target.value)}
              placeholder="2021"
              className="w-16 text-xs font-black font-mono px-2 py-0.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 text-center shadow-xs"
            />
          </div>
        </div>

        {/* 2 × 2 Desktop & Tablet Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {allSlotKeys.map((key) => {
            const slot = fileSlots[key] || {
              key,
              label:
                key === 'univ'
                  ? 'University Result Excel'
                  : key === 'cie1'
                  ? 'CIE 1 Excel'
                  : key === 'cie2'
                  ? 'CIE 2 Excel'
                  : 'Model Exam Excel',
              file: null,
              name: '',
              size: '',
              studentCount: 0,
              isValid: false,
              missingCount: 0,
              duplicateCount: 0,
              students: [],
            };

            const inputRef = getSlotRef(key);
            const isUploaded = slot.file !== null;
            const isDragging = dragOverSlot === key;
            const isMandatory = key === 'univ';

            const slotLabel =
              key === 'univ'
                ? 'University Result Excel'
                : key === 'cie1'
                ? 'CIE 1 Excel'
                : key === 'cie2'
                ? 'CIE 2 Excel'
                : 'Model Exam Excel';

            const slotBadgeText = key === 'univ' ? 'UNIV' : key === 'cie1' ? 'CIE 1' : key === 'cie2' ? 'CIE 2' : 'MODEL';
            const badgeColor =
              key === 'univ'
                ? 'bg-red-600 text-white'
                : key === 'cie1'
                ? 'bg-teal-600 text-white'
                : key === 'cie2'
                ? 'bg-purple-600 text-white'
                : 'bg-amber-500 text-white';

            return (
              <div
                key={key}
                className={`group relative rounded-2xl border p-4 h-[160px] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer flex flex-col justify-between ${
                  isUploaded
                    ? 'border-emerald-400/90 bg-emerald-50/20'
                    : isDragging
                    ? 'border-blue-500 bg-blue-50/40 ring-2 ring-blue-400/50'
                    : isMandatory
                    ? 'border-red-300/90 bg-gradient-to-b from-red-50/30 via-white to-red-50/10 hover:border-red-500 hover:shadow-red-100/50'
                    : 'border-slate-200/90 bg-white hover:border-blue-400'
                }`}
              >
                <input
                  type="file"
                  ref={inputRef}
                  onChange={(e) => handleFileInputChange(key, e)}
                  accept=".xlsx,.xls"
                  className="hidden"
                />

                {/* Card Header Bar */}
                <div className="flex items-center justify-between min-w-0 shrink-0 gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className={`px-2 py-0.5 rounded-lg flex items-center justify-center text-[10px] font-black font-mono shadow-xs shrink-0 ${badgeColor}`}>
                      {slotBadgeText}
                    </div>
                    <h5 className="text-xs sm:text-sm font-black text-slate-950 truncate" title={slotLabel}>
                      {slotLabel}
                    </h5>
                  </div>

                  {isUploaded ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300 shrink-0 shadow-xs">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Uploaded
                    </span>
                  ) : isMandatory ? (
                    <span className="inline-flex items-center text-[11px] font-black text-red-700 bg-red-100/90 px-2 py-0.5 rounded-full border border-red-200 shrink-0 shadow-xs">
                      Required *
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 shrink-0">
                      Optional
                    </span>
                  )}
                </div>

                {/* Empty State Dropzone */}
                {!isUploaded ? (
                  <div
                    onClick={() => inputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragOverSlot(key); }}
                    onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragOverSlot(null); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDragOverSlot(null);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        onFileUploadToSlot(key, e.dataTransfer.files[0]);
                      }
                    }}
                    className={`flex-1 flex flex-col items-center justify-center text-center p-2.5 mt-2 border-2 border-dashed rounded-xl transition-all duration-200 group/drop cursor-pointer ${
                      isMandatory
                        ? 'border-red-200 bg-red-50/20 hover:border-red-500 hover:bg-red-50/30'
                        : 'border-slate-200 bg-slate-50/40 hover:border-blue-500 hover:bg-blue-50/30'
                    }`}
                  >
                    <div className={`w-8 h-8 mx-auto mb-1 rounded-xl flex items-center justify-center transition-all duration-200 shadow-xs ${
                      isMandatory
                        ? 'bg-red-100 text-red-600 group-hover/drop:scale-105 group-hover/drop:bg-red-600 group-hover/drop:text-white'
                        : 'bg-blue-50 text-blue-600 group-hover/drop:scale-105 group-hover/drop:bg-blue-600 group-hover/drop:text-white'
                    }`}>
                      <FileSpreadsheet className="w-4.5 h-4.5" />
                    </div>

                    <p className={`text-xs font-black transition-colors ${
                      isMandatory ? 'text-red-950 group-hover/drop:text-red-700' : 'text-slate-800 group-hover/drop:text-blue-600'
                    }`}>
                      {isDragging ? 'Drop Excel File Here' : 'Drag & Drop Excel File Here'}
                    </p>

                    <button
                      type="button"
                      className={`mt-1.5 text-[11px] font-black text-white px-3 py-1 rounded-xl shadow-sm transition-all duration-200 inline-flex items-center gap-1.5 tracking-wide ${
                        isMandatory ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      Choose Excel File
                    </button>
                  </div>
                ) : (
                  /* Uploaded State Compact Card */
                  <div className="flex-1 flex items-center justify-between p-2.5 mt-2 bg-white rounded-xl border border-emerald-200/90 shadow-xs w-full overflow-hidden">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-inner">
                        <FileCheck2 className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-black text-slate-950 truncate" title={slot.name}>
                          {slot.name}
                        </p>
                        <p className="text-[11px] font-black text-emerald-700 mt-0.5 truncate flex items-center gap-1">
                          <span>✓ Uploaded Successfully</span>
                        </p>
                        <p className="text-[10px] font-extrabold text-slate-600 mt-0.5 truncate">
                          {slot.studentCount || 0} Students Detected
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveSlotFile(key);
                      }}
                      title="Remove file"
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0 ml-2 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* RUN Button Section (Above Download Buttons) */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onRunMerge}
            disabled={!isUnivUploaded || isProcessing}
            title={
              !isUnivUploaded
                ? 'Upload University Result Excel to enable RUN button'
                : isProcessing
                ? 'Processing student reports...'
                : 'Click to generate all student reports and preview'
            }
            className={`px-7 py-2.5 rounded-2xl text-xs font-black transition-all duration-200 flex items-center gap-2 ${
              !isUnivUploaded || isProcessing
                ? 'bg-slate-200 text-slate-400 border border-slate-300/80 cursor-not-allowed opacity-60 shadow-none'
                : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-md hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Layers className="w-4 h-4" />
                <span>RUN</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Integrated Side-by-Side Word & PDF Download Buttons */}
        <div className="mt-3.5 pt-3.5 border-t border-slate-100 flex flex-row gap-3">
          {/* Word Download Button */}
          <button
            type="button"
            onClick={onDownloadWord}
            disabled={!isReadyToDownload || isProcessing}
            title={isReadyToDownload ? "Download Word (.docx) Report" : "Run merge engine to enable Word download"}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-sm hover:shadow-md flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
          >
            <FileText className="w-4 h-4 text-blue-100" />
            <div className="text-left leading-none">
              <span className="block text-xs font-black tracking-wide">Download Word</span>
              <span className="block text-[9px] font-bold text-blue-200 mt-0.5">.DOCX</span>
            </div>
            <Download className="w-3.5 h-3.5 ml-auto text-blue-200 shrink-0" />
          </button>

          {/* PDF Download Button */}
          <button
            type="button"
            onClick={onDownloadPDF}
            disabled={!isReadyToDownload || isProcessing}
            title={isReadyToDownload ? "Download PDF (.pdf) Report" : "Run merge engine to enable PDF download"}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 via-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white shadow-sm hover:shadow-md flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
          >
            <FileCheck2 className="w-4 h-4 text-red-100" />
            <div className="text-left leading-none">
              <span className="block text-xs font-black tracking-wide">Download PDF</span>
              <span className="block text-[9px] font-bold text-red-200 mt-0.5">.PDF</span>
            </div>
            <Download className="w-3.5 h-3.5 ml-auto text-red-200 shrink-0" />
          </button>
        </div>

      </div>
    </div>
  );
};
