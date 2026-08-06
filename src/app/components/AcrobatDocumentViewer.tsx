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
  Sparkles,
  RefreshCw,
  Download,
  FileText,
  ListChecks,
  AlertTriangle,
  Bug,
  Code2,
} from 'lucide-react';
import { StudentRecord } from '../types';
import { populateOfficialDocxTemplateWithLogs, DocxPopulationResult } from '../utils/officialDocxProcessor';
import { generateSingleWordDocument } from '../utils/docGenerator';
import { generateCombinedPDF } from '../utils/pdfGenerator';

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
  activeTemplate = 'template_cie1.docx',
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [targetReportIndex, setTargetReportIndex] = useState<string>('');
  const [isLoadingDocx, setIsLoadingDocx] = useState<boolean>(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [populationResult, setPopulationResult] = useState<DocxPopulationResult | null>(null);
  const [showDebugPanel, setShowDebugPanel] = useState<boolean>(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);

  const activeStudents = students && students.length > 0 ? students : [];
  const currentStudent = activeStudents[currentPageIndex] || activeStudents[0];
  const totalReports = activeStudents.length;

  const cleanTemplateName = (activeTemplate || 'template_cie1.docx')
    .replace(/^\/?(backend\/templates\/|templates\/)?/, '');

  const [basePdfBlobUrl, setBasePdfBlobUrl] = useState<string | null>(null);

  // Render combined live PDF preview for ALL students whenever activeStudents or regulation changes
  useEffect(() => {
    let isMounted = true;

    async function loadPdfPreview() {
      if (!activeStudents || activeStudents.length === 0) return;

      try {
        setIsLoadingDocx(true);
        setPreviewError(null);

        // Generate combined PDF Blob URL for ALL active students so user can scroll continuously through all reports
        const pdfUrl = await generateCombinedPDF(activeStudents, null, undefined, regulation, true);

        if (!isMounted) return;

        if (typeof pdfUrl === 'string') {
          setBasePdfBlobUrl(pdfUrl);
          const targetPage = currentPageIndex * 2 + 1;
          setPdfPreviewUrl(`${pdfUrl}#page=${targetPage}`);
        }

        // Run debug mapping in background for panel metrics
        const result = await populateOfficialDocxTemplateWithLogs(cleanTemplateName, currentStudent, regulation);
        if (isMounted) {
          setPopulationResult(result);
        }
      } catch (err: any) {
        console.error('Live preview generation error:', err);
        if (isMounted) {
          setPreviewError(err?.message || 'Error generating live report preview.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingDocx(false);
        }
      }
    }

    loadPdfPreview();

    return () => {
      isMounted = false;
    };
  }, [activeStudents.length, activeTemplate, regulation]);

  // Jump preview iframe page when user changes page dropdown/navigation
  useEffect(() => {
    if (basePdfBlobUrl) {
      const targetPage = currentPageIndex * 2 + 1;
      setPdfPreviewUrl(`${basePdfBlobUrl}#page=${targetPage}`);
    }
  }, [currentPageIndex, basePdfBlobUrl]);

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

  const handleDownloadSingleDocx = async () => {
    if (currentStudent) {
      await generateSingleWordDocument(currentStudent, cleanTemplateName, regulation);
    }
  };

  const handleDownloadSinglePdf = async () => {
    if (currentStudent) {
      await generateCombinedPDF([currentStudent], null, undefined, regulation);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className={`w-full flex flex-col bg-white rounded-2xl overflow-hidden shadow-xl border border-blue-200/80 transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'h-[920px]'
      }`}
    >
      {/* Top Toolbar */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-white shadow-md">
        
        {/* Left: Live Preview Badge & Student Select Dropdown */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-blue-900/60 text-blue-200 text-xs font-mono font-bold px-3 py-1.5 rounded-xl border border-blue-700/60 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Live Preview</span>
          </div>

          {totalReports > 0 && (
            <div className="relative">
              <select
                value={currentPageIndex}
                onChange={(e) => onPageChange(Number(e.target.value))}
                className="bg-slate-800/90 hover:bg-slate-700 text-white font-mono text-xs font-bold px-3 py-1.5 pr-8 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all appearance-none shadow-sm"
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
              className="p-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
              title="Previous Student"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-mono font-bold text-slate-200 bg-slate-800/80 px-3 py-1 rounded-xl border border-slate-700/60 shadow-sm">
              Report {currentPageIndex + 1} of {totalReports}
            </span>

            <button
              onClick={handleNextStudent}
              disabled={currentPageIndex === totalReports - 1}
              className="p-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
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
                className="w-14 text-xs font-mono px-2 py-1 bg-slate-800/90 border border-slate-700 rounded-lg text-white text-center focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
              />
            </form>
          </div>
        )}

        {/* Right: Actions (Debug Panel, Download DOCX/PDF, Zoom, Fullscreen, Print) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDebugPanel(!showDebugPanel)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-indigo-300 text-xs font-bold transition-all flex items-center gap-1 border border-slate-700 shadow-sm"
            title="Toggle Debug & Data Binding Panel"
          >
            <Bug className="w-3.5 h-3.5 text-indigo-400" />
            <span>Debug Panel</span>
          </button>

          {currentStudent && (
            <>
              <button
                onClick={handleDownloadSingleDocx}
                className="px-2.5 py-1.5 rounded-xl bg-blue-900/80 hover:bg-blue-800 text-blue-200 text-xs font-bold transition-all flex items-center gap-1 border border-blue-700/70 shadow-sm"
                title="Download Current Student DOCX"
              >
                <Download className="w-3.5 h-3.5 text-blue-300" />
                <span>DOCX</span>
              </button>

              <button
                onClick={handleDownloadSinglePdf}
                className="px-2.5 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-200 text-xs font-bold transition-all flex items-center gap-1 border border-rose-800/70 shadow-sm"
                title="Download Current Student PDF"
              >
                <FileText className="w-3.5 h-3.5 text-rose-300" />
                <span>PDF</span>
              </button>
            </>
          )}

          <div className="flex items-center bg-slate-800/90 rounded-xl p-1 border border-slate-700 shadow-sm">
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
            className="p-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 transition-colors shadow-sm"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={handlePrint}
            className="p-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 transition-colors shadow-sm"
            title="Print Preview"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Debug & Data Binding Panel */}
      {showDebugPanel && populationResult && (
        <div className="bg-slate-950 border-b border-slate-800 p-5 text-xs font-mono text-slate-300 max-h-72 overflow-auto">
          <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
            <h5 className="font-bold text-white uppercase text-[11px] tracking-wider flex items-center gap-2">
              <Bug className="w-4 h-4 text-indigo-400" />
              Data Binding & Placeholder Debug Panel
            </h5>
            <button
              onClick={() => setShowDebugPanel(false)}
              className="text-[11px] text-slate-400 hover:text-white underline"
            >
              Close Panel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Selected Template</span>
              <span className="font-bold text-blue-300 text-xs">{cleanTemplateName}</span>
            </div>

            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Student Count</span>
              <span className="font-bold text-emerald-300 text-xs">{totalReports} Records</span>
            </div>

            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Selected Student</span>
              <span className="font-bold text-amber-300 text-xs truncate block">{currentStudent?.name} ({currentStudent?.regNo})</span>
            </div>

            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Placeholder Metrics</span>
              <span className="font-bold text-white text-xs">
                Mapped: <span className="text-emerald-400">{populationResult.mappedCount}</span> | Unmapped: <span className="text-rose-400">{populationResult.unmappedCount}</span>
              </span>
            </div>
          </div>

          {/* Placeholders Lists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-slate-900 p-3 rounded-xl border border-emerald-900/60">
              <h6 className="font-bold text-emerald-400 text-[11px] mb-2 flex items-center gap-1.5">
                <ListChecks className="w-3.5 h-3.5" />
                Mapped Placeholders ({populationResult.mappedPlaceholders.length})
              </h6>
              <div className="flex flex-wrap gap-1">
                {populationResult.mappedPlaceholders.map((ph, idx) => (
                  <span key={idx} className="bg-emerald-950 text-emerald-300 text-[10px] px-2 py-0.5 rounded border border-emerald-800 font-mono">
                    {ph}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 p-3 rounded-xl border border-rose-900/60">
              <h6 className="font-bold text-rose-400 text-[11px] mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Unmapped / Pending Placeholders ({populationResult.unmappedPlaceholders.length})
              </h6>
              {populationResult.unmappedPlaceholders.length === 0 ? (
                <p className="text-[10px] text-slate-400">All scanned template placeholders mapped successfully!</p>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {populationResult.unmappedPlaceholders.map((ph, idx) => (
                    <span key={idx} className="bg-rose-950 text-rose-300 text-[10px] px-2 py-0.5 rounded border border-rose-800 font-mono">
                      {ph}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Raw Extracted Student Data Object */}
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
            <h6 className="font-bold text-slate-300 text-[11px] mb-1 flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-indigo-400" />
              Extracted Student Data Object (studentData)
            </h6>
            <pre className="text-[10px] text-emerald-400 bg-slate-950 p-3 rounded-lg overflow-x-auto border border-slate-800">
              {JSON.stringify(populationResult.studentData, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Main Document Display Container */}
      <div className="flex-1 bg-[#F2F6FC] border-t border-slate-200/80 overflow-auto p-4 flex justify-center relative shadow-inner">
        {isLoadingDocx && (
          <div className="absolute inset-0 z-20 bg-slate-900/40 backdrop-blur-sm flex flex-col items-center justify-center text-white gap-3">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-xs font-bold font-mono bg-blue-950/90 text-blue-200 px-4 py-2 rounded-xl shadow-lg border border-blue-800">
              Generating live report preview for {currentStudent?.name} ({currentStudent?.regNo})...
            </p>
          </div>
        )}

        {previewError ? (
          <div className="w-full max-w-2xl m-auto bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-900 shadow-md">
            <p className="text-sm font-bold mb-2">Error loading live report preview.</p>
            <p className="text-xs font-mono text-red-600 mb-4">{previewError}</p>
          </div>
        ) : pdfPreviewUrl ? (
          <div
            className="transition-transform duration-200 origin-top flex justify-center w-full h-full"
            style={{ transform: `scale(${zoomLevel / 100})` }}
          >
            <iframe
              src={pdfPreviewUrl}
              title={`Live Preview - ${currentStudent?.name}`}
              className="w-full max-w-[880px] min-h-[1150px] bg-white rounded-xl shadow-[0_12px_40px_rgba(30,58,138,0.15)] border border-slate-200/90"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};
