import React, { useRef } from 'react';
import {
  UploadCloud,
  CheckCircle2,
  Trash2,
  Layers,
  FileCheck2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
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
  onLoadSampleData,
  onDownloadSampleTemplate,
  onRunMerge,
  onGenerateDocuments,
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

  // Enable merge engine strictly when mandatory University Result Excel is uploaded
  const isUnivUploaded = !!fileSlots.univ?.file;
  const hasAnyFileUploaded = allSlotKeys.some((k) => !!fileSlots[k]?.file);

  return (
    <div className="w-full flex flex-col gap-6">

      {/* STEP 1: Upload Excel File Slots (University Result Excel Mandatory, CIE 1 / CIE 2 / Model Optional) */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 hover:shadow-md transition-all duration-300">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shadow-md ring-4 ring-blue-50 shrink-0">
              1
            </div>
            <h3 className="text-sm font-extrabold text-blue-950 tracking-tight font-poppins">
              Upload Required Excel Files
            </h3>
          </div>
        </div>

        {/* Upload Slots Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            const isMandatory = key === 'univ';

            const slotLabel =
              key === 'univ'
                ? 'University Result Excel'
                : key === 'cie1'
                ? 'CIE 1 Excel'
                : key === 'cie2'
                ? 'CIE 2 Excel'
                : 'Model Exam Excel';

            const slotBadgeText = key === 'univ' ? 'U' : key === 'cie1' ? 'CIE1' : key === 'cie2' ? 'CIE2' : 'MODEL';

            return (
              <div
                key={key}
                className={`rounded-2xl border p-4 transition-all duration-300 ${
                  isUploaded
                    ? 'border-emerald-300 bg-emerald-50/20'
                    : isMandatory
                    ? 'border-red-300/90 bg-gradient-to-b from-red-50/30 to-transparent hover:border-red-400'
                    : 'border-slate-200 bg-slate-50/30 hover:border-slate-300'
                }`}
              >
                <input
                  type="file"
                  ref={inputRef}
                  onChange={(e) => handleFileInputChange(key, e)}
                  accept=".xlsx,.xls"
                  className="hidden"
                />

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`px-2 py-0.5 rounded-lg flex items-center justify-center text-[10px] font-extrabold font-mono ${
                      isUploaded ? 'bg-emerald-600 text-white' : isMandatory ? 'bg-red-600 text-white' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {slotBadgeText}
                    </div>
                    <h5 className="text-xs font-extrabold text-blue-950">
                      {slotLabel} {isMandatory && <span className="text-red-500 font-black">*</span>}
                    </h5>
                  </div>

                  {isMandatory && !isUploaded && (
                    <span className="inline-flex items-center text-[10px] font-extrabold text-red-600 bg-red-100 px-2 py-0.5 rounded-full border border-red-300">
                      Mandatory *
                    </span>
                  )}
                  {isUploaded && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Uploaded
                    </span>
                  )}
                </div>

                {!isUploaded ? (
                  <div
                    onClick={() => inputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer bg-white transition-all group ${
                      isMandatory
                        ? 'border-red-300 hover:border-red-500 hover:bg-red-50/30'
                        : 'border-blue-300/80 hover:border-blue-500 hover:bg-blue-50/40'
                    }`}
                  >
                    <UploadCloud className={`w-6 h-6 mx-auto mb-1.5 group-hover:scale-110 transition-transform ${isMandatory ? 'text-red-500' : 'text-blue-500'}`} />
                    <p className="text-xs font-bold text-slate-800">
                      Browse or Drop {slotLabel}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Supports .xlsx files</p>
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3 shadow-sm">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-blue-950 font-mono truncate">
                        {slot.name}
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                        {slot.size} • {slot.studentCount} Students Extracted
                      </p>
                    </div>

                    <button
                      onClick={() => onRemoveSlotFile(key)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                      title="Remove file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Regulation Setting Field */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm">⚙️</span>
            <label className="text-xs font-bold text-slate-700">
              Regulation Code:
            </label>
          </div>
          <input
            type="text"
            value={regulation}
            onChange={(e) => onRegulationChange && onRegulationChange(e.target.value)}
            placeholder="2021 / 2024"
            className="w-28 text-xs font-bold font-mono px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 transition-all text-center"
          />
        </div>

        {/* Action: Run Excel Merge Engine Button */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] text-slate-500 font-medium">
            {!isUnivUploaded ? '⚠️ University Result Excel is mandatory to merge' : 'University Result Excel uploaded. Ready to merge.'}
          </p>

          <button
            type="button"
            onClick={onRunMerge}
            disabled={!isUnivUploaded || isProcessing}
            className="px-7 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white text-xs font-black shadow-md hover:shadow-xl transition-all flex items-center gap-2.5 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01]"
          >
            <Layers className="w-4 h-4" />
            <span>Run Excel Merge Engine</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* STEP 2: Automatic Pattern Status Card & Merge Validation Display */}
      {mergeResult && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 hover:shadow-md transition-all duration-300">
          
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-600 text-white font-extrabold text-xs flex items-center justify-center shadow-md ring-4 ring-emerald-50 shrink-0">
                2
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-blue-950 tracking-tight font-poppins">
                  Automatic Backend Template Selection & Validation
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Status Card: Backend detected pattern and selected master template
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-900 font-mono text-xs font-extrabold border border-emerald-300 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Status: Automatically Selected
            </span>
          </div>

          {/* Status Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 mb-5">
            <div className="bg-slate-50 border border-slate-200/90 p-3.5 rounded-xl">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Detected Pattern</p>
              <p className="text-xs font-black text-blue-950 font-mono mt-1">{mergeResult.detectedPatternName || 'University + CIE 1'}</p>
            </div>

            <div className="bg-slate-50 border border-slate-200/90 p-3.5 rounded-xl">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Selected Template</p>
              <p className="text-xs font-black text-emerald-700 font-mono mt-1">{mergeResult.templateFile}</p>
            </div>

            <div className="bg-slate-50 border border-slate-200/90 p-3.5 rounded-xl">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ready For Preview</p>
              <p className="text-xs font-black text-emerald-600 font-mono mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Ready (100%)
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200/90 p-3.5 rounded-xl">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Merged Students</p>
              <p className="text-base font-black text-blue-950 font-mono mt-0.5">{mergeResult.mergedCount}</p>
            </div>

            <div className="bg-slate-50 border border-slate-200/90 p-3.5 rounded-xl">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Missing Students</p>
              <p className="text-base font-black text-slate-700 font-mono mt-0.5">{mergeResult.missingRecordsCount}</p>
            </div>

            <div className="bg-slate-50 border border-slate-200/90 p-3.5 rounded-xl">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Duplicate Reg Numbers</p>
              <p className="text-base font-black text-slate-700 font-mono mt-0.5">{mergeResult.duplicateRegNosCount}</p>
            </div>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                ✓
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-emerald-950">
                  Unified Dataset Created ({mergeResult.mergedCount} Merged Records)
                </h4>
                <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                  Primary Key: REGISTER NUMBER • In-Memory Dataset • Ready for Live Preview
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onGenerateDocuments}
                disabled={isProcessing}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>Generate Result Letters</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Download Generated Documents Section */}
      {mergeResult && mergeResult.isReadyForPreview && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shadow-md ring-4 ring-blue-50 shrink-0">
              3
            </div>
            <h3 className="text-sm font-extrabold text-blue-950 tracking-tight font-poppins">
              Download Result Letters (All Merged Students)
            </h3>
          </div>

          <div className="flex flex-row gap-3">
            {/* Button 1: Download Word */}
            <button
              onClick={onDownloadWord}
              disabled={isProcessing}
              className="flex-1 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-md hover:shadow-xl flex items-center gap-3 cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
            >
              <div className="w-10 h-10 rounded-xl bg-white text-blue-700 flex items-center justify-center font-black text-lg font-serif shadow-sm shrink-0 border border-blue-100">
                W
              </div>
              <div className="text-left min-w-0 flex-1">
                <span className="block text-sm font-black text-white tracking-wide truncate">
                  Download Word (.docx)
                </span>
                <span className="block text-[11px] font-bold text-blue-200 mt-0.5">
                  Selected Template: {mergeResult.templateFile}
                </span>
              </div>
            </button>

            {/* Button 2: Download PDF */}
            <button
              onClick={onDownloadPDF}
              disabled={isProcessing}
              className="flex-1 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white shadow-md hover:shadow-xl flex items-center gap-3 cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
            >
              <div className="w-10 h-10 rounded-xl bg-white text-red-600 flex flex-col items-center justify-center font-black text-[9px] leading-tight shadow-sm shrink-0 border border-red-100">
                <span className="text-[8px]">📄</span>
                <span>PDF</span>
              </div>
              <div className="text-left min-w-0 flex-1">
                <span className="block text-sm font-black text-white tracking-wide truncate">
                  Download PDF (.pdf)
                </span>
                <span className="block text-[11px] font-bold text-red-200 mt-0.5">
                  Combined & Individual PDF Reports
                </span>
              </div>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
