import React, { useState, useRef, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Printer,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Sparkles,
  FileCheck2,
  RefreshCw,
} from 'lucide-react';
import { renderAsync } from 'docx-preview';
import { StudentRecord } from '../types';
import { StudentEditorModal } from './StudentEditorModal';
import { populateOfficialDocxTemplate } from '../utils/officialDocxProcessor';

interface AcrobatDocumentViewerProps {
  students: StudentRecord[];
  currentPageIndex: number;
  onPageChange: (index: number) => void;
  regulation?: string;
  onUpdateStudent?: (updatedStudent: StudentRecord) => void;
  activeTemplate?: string;
}

export const AcrobatDocumentViewer: React.FC<AcrobatDocumentViewerProps> = ({
  students,
  currentPageIndex,
  onPageChange,
  regulation = '2021',
  onUpdateStudent,
  activeTemplate = 'template_cie1.docx',
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [targetReportIndex, setTargetReportIndex] = useState<string>('');
  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(null);
  const [isLoadingDocx, setIsLoadingDocx] = useState<boolean>(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const docxContainerRef = useRef<HTMLDivElement>(null);

  const activeStudents = students && students.length > 0 ? students : [];
  const currentStudent = activeStudents[currentPageIndex] || activeStudents[0];
  const totalReports = activeStudents.length;

  const cleanTemplateName = (activeTemplate || 'template_cie1.docx')
    .replace(/^\/?(backend\/templates\/|templates\/)?/, '');

  // Render official DOCX template in preview whenever current student or active template changes
  useEffect(() => {
    let isMounted = true;

    async function loadOfficialDocxPreview() {
      if (!docxContainerRef.current || !currentStudent) return;

      try {
        setIsLoadingDocx(true);
        setPreviewError(null);

        // Populate official master template from public/templates/
        const filledBytes = await populateOfficialDocxTemplate(cleanTemplateName, currentStudent, regulation);
        
        if (!isMounted) return;

        if (docxContainerRef.current) {
          docxContainerRef.current.innerHTML = '';
          await renderAsync(filledBytes.buffer, docxContainerRef.current, undefined, {
            className: 'official-docx-preview-canvas',
            inWrapper: true,
            ignoreWidth: false,
            ignoreHeight: false,
            breakPages: true,
            useBase64URL: true,
          });
        }
      } catch (err: any) {
        console.error('Official DOCX preview error:', err);
        if (isMounted) {
          setPreviewError(err?.message || 'Failed to render official DOCX template in preview.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingDocx(false);
        }
      }
    }

    loadOfficialDocxPreview();

    return () => {
      isMounted = false;
    };
  }, [currentStudent, cleanTemplateName, regulation]);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 10, 140));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 10, 70));

  const handlePrevStudent = () => {
    if (currentPageIndex > 0) {
      onPageChange(currentPageIndex - 1);
    }
  };

  const handleNextStudent = () => {
    if (currentPageIndex < totalReports - 1) {
      onPageChange(currentPageIndex + 1);
    }
  };

  const handleJumpToReport = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(targetReportIndex, 10);
    if (!isNaN(val) && val >= 1 && val <= totalReports) {
      onPageChange(val - 1);
      setTargetReportIndex('');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className={`w-full flex flex-col bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'h-[900px]'
      }`}
    >
      {/* Top Toolbar */}
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-white">
        
        {/* Left: Template Badge & Student Select Dropdown */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-blue-950/80 text-blue-300 text-xs font-mono font-bold px-3 py-1.5 rounded-xl border border-blue-800/60 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Master Template: {cleanTemplateName}</span>
          </div>

          {totalReports > 0 && (
            <div className="relative">
              <select
                value={currentPageIndex}
                onChange={(e) => onPageChange(Number(e.target.value))}
                className="bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold px-3 py-1.5 pr-8 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all appearance-none"
              >
                {activeStudents.map((s, idx) => (
                  <option key={s.id || idx} value={idx}>
                    #{idx + 1} - {s.name} ({s.regNo})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}
        </div>

        {/* Center: Student Navigation Controls (< >) */}
        {totalReports > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevStudent}
              disabled={currentPageIndex === 0}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Previous Student"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-mono font-bold text-slate-300 bg-slate-800/70 px-3 py-1 rounded-xl border border-slate-700/60">
              Report {currentPageIndex + 1} of {totalReports}
            </span>

            <button
              onClick={handleNextStudent}
              disabled={currentPageIndex === totalReports - 1}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Next Student"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <form onSubmit={handleJumpToReport} className="flex items-center gap-1 ml-2">
              <input
                type="number"
                min={1}
                max={totalReports}
                placeholder="Go #"
                value={targetReportIndex}
                onChange={(e) => setTargetReportIndex(e.target.value)}
                className="w-14 text-xs font-mono px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-white text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </form>
          </div>
        )}

        {/* Right: Actions (Edit Record, Zoom, Fullscreen, Print) */}
        <div className="flex items-center gap-2">
          {currentStudent && onUpdateStudent && (
            <button
              onClick={() => setEditingStudent(currentStudent)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Record</span>
            </button>
          )}

          <div className="flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700">
            <button
              onClick={handleZoomOut}
              className="p-1 text-slate-300 hover:text-white rounded-lg hover:bg-slate-700 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono font-bold text-slate-300 px-2">
              {zoomLevel}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1 text-slate-300 hover:text-white rounded-lg hover:bg-slate-700 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={handlePrint}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Print Preview"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Document Display Container */}
      <div className="flex-1 bg-slate-950 overflow-auto p-6 flex justify-center relative">
        {isLoadingDocx && (
          <div className="absolute inset-0 z-20 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center text-white gap-3">
            <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
            <p className="text-xs font-bold font-mono">Loading official template preview ({cleanTemplateName})...</p>
          </div>
        )}

        {previewError ? (
          <div className="w-full max-w-2xl m-auto bg-red-950/40 border border-red-800 rounded-2xl p-6 text-center text-red-200">
            <p className="text-sm font-bold mb-2">Failed to render official DOCX template in preview</p>
            <p className="text-xs font-mono text-red-400 mb-4">{previewError}</p>
          </div>
        ) : (
          <div
            className="transition-transform duration-200 origin-top flex justify-center w-full"
            style={{ transform: `scale(${zoomLevel / 100})` }}
          >
            <div
              ref={docxContainerRef}
              className="w-full max-w-[850px] min-h-[1100px] bg-white rounded-xl shadow-2xl p-2 text-slate-900 border border-slate-200"
            />
          </div>
        )}
      </div>

      {/* In-Memory Student Record Editor Modal */}
      {editingStudent && (
        <StudentEditorModal
          student={editingStudent}
          isOpen={!!editingStudent}
          onClose={() => setEditingStudent(null)}
          onSave={(updated) => {
            if (onUpdateStudent) {
              onUpdateStudent(updated);
            }
            setEditingStudent(null);
          }}
        />
      )}
    </div>
  );
};
