import React, { useRef } from 'react';
import {
  UploadCloud,
  CheckCircle2,
  Trash2,
  Layers,
  FileCheck2,
  AlertCircle,
  Sparkles,
  ArrowRight,
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
  selectedPattern,
  onPatternSelect,
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

  const patterns: {
    id: ResultPattern;
    title: string;
    sub: string;
    template: string;
    filesNeeded: number;
  }[] = [
    {
      id: 'pattern1',
      title: 'University Results Only',
      sub: 'University Result Excel',
      template: 'template_university.docx',
      filesNeeded: 1,
    },
    {
      id: 'pattern2',
      title: 'Univ + CIE 1',
      sub: 'University + CIE 1 Excel',
      template: 'template_cie1.docx',
      filesNeeded: 2,
    },
    {
      id: 'pattern3',
      title: 'Univ + CIE 1 + CIE 2',
      sub: 'University + CIE 1 + CIE 2 Excel',
      template: 'template_cie1_cie2.docx',
      filesNeeded: 3,
    },
    {
      id: 'pattern4',
      title: 'Univ + CIE 1 + CIE 2 + Model',
      sub: 'University + CIE 1 + CIE 2 + Model Excel',
      template: 'template_cie1_cie2_model.docx',
      filesNeeded: 4,
    },
  ];

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

  const activeRequiredKeys: ('univ' | 'cie1' | 'cie2' | 'model')[] =
    selectedPattern === 'pattern1'
      ? ['univ']
      : selectedPattern === 'pattern2'
      ? ['univ', 'cie1']
      : selectedPattern === 'pattern3'
      ? ['univ', 'cie1', 'cie2']
      : ['univ', 'cie1', 'cie2', 'model'];

  const allRequiredFilesUploaded = activeRequiredKeys.every(
    (k) => fileSlots[k] && fileSlots[k].file !== null
  );

  return (
    <div className="w-full flex flex-col gap-6">

      {/* STEP 1: Select Result Pattern (4 Cards) */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 hover:shadow-md transition-all duration-300">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shadow-md ring-4 ring-blue-50 shrink-0">
              1
            </div>
            <h3 className="text-sm font-extrabold text-blue-950 tracking-tight font-poppins">
              Select Result Workflow Pattern
            </h3>
          </div>
          <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            4 Automated Patterns Available
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {patterns.map((p) => {
            const isSelected = selectedPattern === p.id;
            return (
              <div
                key={p.id}
                onClick={() => onPatternSelect(p.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-600 bg-gradient-to-b from-blue-50/80 via-blue-50/30 to-white shadow-md ring-2 ring-blue-500/20 scale-[1.02]'
                    : 'border-slate-200/90 bg-white hover:border-blue-300 hover:bg-slate-50/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full ${
                      isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {p.filesNeeded} {p.filesNeeded === 1 ? 'Excel File' : 'Excel Files'}
                    </span>

                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    )}
                  </div>

                  <h4 className="text-xs font-extrabold text-slate-900 tracking-tight mb-1">
                    {p.title}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium mb-3">
                    {p.sub}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Auto Template:</span>
                  <span className="font-bold text-blue-700 truncate max-w-[120px]">
                    {p.template}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 2: Upload Excel File Slots */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 hover:shadow-md transition-all duration-300">
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shadow-md ring-4 ring-blue-50 shrink-0">
              2
            </div>
            <h3 className="text-sm font-extrabold text-blue-950 tracking-tight font-poppins">
              Upload Required Excel Files
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onDownloadSampleTemplate}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
            >
              📥 Download Sample Template
            </button>
            <span className="text-slate-300">•</span>
            <button
              type="button"
              onClick={onLoadSampleData}
              className="text-xs font-semibold text-slate-500 hover:text-blue-700 hover:underline transition-colors"
            >
              ⚡ Load Demo Data
            </button>
          </div>
        </div>

        {/* Upload Slots Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeRequiredKeys.map((key) => {
            const slot = fileSlots[key] || {
              key,
              label: key === 'univ' ? 'University Result Excel' : key.toUpperCase() + ' Excel',
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

            return (
              <div
                key={key}
                className={`rounded-2xl border p-4 transition-all duration-300 ${
                  isUploaded
                    ? 'border-emerald-300 bg-emerald-50/20'
                    : 'border-blue-200/90 bg-gradient-to-b from-blue-50/30 to-transparent hover:border-blue-400'
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
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                      isUploaded ? 'bg-emerald-600 text-white' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {key === 'univ' ? 'U' : key.toUpperCase()}
                    </div>
                    <h5 className="text-xs font-extrabold text-blue-950">{slot.label}</h5>
                  </div>

                  {isUploaded ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Uploaded
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      Required
                    </span>
                  )}
                </div>

                {!isUploaded ? (
                  <div
                    onClick={() => inputRef.current?.click()}
                    className="border-2 border-dashed border-blue-300/80 hover:border-blue-500 rounded-xl p-5 text-center cursor-pointer bg-white hover:bg-blue-50/40 transition-all group"
                  >
                    <UploadCloud className="w-6 h-6 text-blue-500 mx-auto mb-1.5 group-hover:scale-110 transition-transform" />
                    <p className="text-xs font-bold text-slate-800">
                      Browse or Drop {slot.label}
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

        {/* Action: Run Excel Merge Engine */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onRunMerge}
            disabled={!allRequiredFilesUploaded || isProcessing}
            className="px-7 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white text-xs font-black shadow-md hover:shadow-xl transition-all flex items-center gap-2.5 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01]"
          >
            <Layers className="w-4 h-4" />
            <span>Run Excel Merge Engine</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* STEP 3: Merge Validation Summary & Auto Template Selection */}
      {mergeResult && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-600 text-white font-extrabold text-xs flex items-center justify-center shadow-md ring-4 ring-emerald-50 shrink-0">
                3
              </div>
              <h3 className="text-sm font-extrabold text-blue-950 tracking-tight font-poppins">
                Excel Merge Validation & Auto Template Selection
              </h3>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-mono text-xs font-bold border border-emerald-300">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Template: {mergeResult.templateFile}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="bg-slate-50 border border-slate-200/90 p-3 rounded-xl">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Univ Students</p>
              <p className="text-base font-black text-blue-950 font-mono mt-0.5">{mergeResult.univCount}</p>
            </div>
            <div className="bg-slate-50 border border-slate-200/90 p-3 rounded-xl">
              <p className="text-[10px] font-bold text-slate-500 uppercase">CIE 1 Students</p>
              <p className="text-base font-black text-blue-950 font-mono mt-0.5">{mergeResult.cie1Count || '-'}</p>
            </div>
            <div className="bg-slate-50 border border-slate-200/90 p-3 rounded-xl">
              <p className="text-[10px] font-bold text-slate-500 uppercase">CIE 2 Students</p>
              <p className="text-base font-black text-blue-950 font-mono mt-0.5">{mergeResult.cie2Count || '-'}</p>
            </div>
            <div className="bg-slate-50 border border-slate-200/90 p-3 rounded-xl">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Model Students</p>
              <p className="text-base font-black text-blue-950 font-mono mt-0.5">{mergeResult.modelCount || '-'}</p>
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

      {/* STEP 4: Download Generated Documents Section */}
      {mergeResult && mergeResult.isReadyForPreview && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shadow-md ring-4 ring-blue-50 shrink-0">
              4
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
