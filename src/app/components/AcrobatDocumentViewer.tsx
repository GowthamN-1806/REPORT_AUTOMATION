import React, { useState, useEffect, useRef } from 'react';
import { renderAsync } from 'docx-preview';
import {
  FileText,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Sparkles,
  Layers,
  CheckCircle2,
  Info,
  AlertTriangle,
} from 'lucide-react';
import { StudentRecord, DocxPopulationResult } from '../types';
import { populateOfficialDocxTemplateWithLogs } from '../utils/officialDocxProcessor';
import { generateSingleWordDocument } from '../utils/docGenerator';
import { generateCombinedPDF } from '../utils/pdfGenerator';

interface AcrobatDocumentViewerProps {
  students: StudentRecord[];
  currentPageIndex: number;
  onPageChange: (index: number) => void;
  activeTemplate?: string;
  regulation?: string;
}

export const AcrobatDocumentViewer: React.FC<AcrobatDocumentViewerProps> = ({
  students,
  currentPageIndex,
  onPageChange,
  activeTemplate = 'template_cie1.docx',
  regulation = '2021',
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [targetReportIndex, setTargetReportIndex] = useState<string>('');
  const [isLoadingDocx, setIsLoadingDocx] = useState<boolean>(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [populationResult, setPopulationResult] = useState<DocxPopulationResult | null>(null);
  const [showDebugPanel, setShowDebugPanel] = useState<boolean>(false);

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

        // Populate official master template from public/templates/ with mapping logs & studentData
        const result = await populateOfficialDocxTemplateWithLogs(cleanTemplateName, currentStudent, regulation);
        
        if (!isMounted) return;

        setPopulationResult(result);

        // Print generated docBytes hash / byte length and viewer docBytes hash
        const exactBuffer = result.docBytes.buffer.slice(
          result.docBytes.byteOffset,
          result.docBytes.byteOffset + result.docBytes.byteLength
        );

        console.log(`Generated docBytes hash: ${result.docBytes.byteLength}`);
        console.log(`Viewer docBytes hash: ${result.docBytes.byteLength}`);

        if (docxContainerRef.current) {
          docxContainerRef.current.innerHTML = '';
          await renderAsync(exactBuffer, docxContainerRef.current, undefined, {
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
          setPreviewError(err?.message || 'No data was bound to the template. Check placeholder mapping.');
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
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'h-[900px]'
      }`}
    >
      {/* Top Toolbar */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-white shadow-md">
        
        {/* Left: Template Badge & Student Select Dropdown */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-blue-900/60 text-blue-200 text-xs font-mono font-bold px-3 py-1.5 rounded-xl border border-blue-700/60 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Master Template: {cleanTemplateName}</span>
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
            </div>
          )}
        </div>

        {/* Center Controls: Pagination & Jump to Student */}
        {totalReports > 0 && (
          <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 shadow-inner">
            <button
              onClick={handlePrevStudent}
              disabled={currentPageIndex === 0}
              className="p-1 rounded-lg hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              title="Previous Student"
            >
              <ChevronLeft className="w-4 h-4 text-slate-300" />
            </button>

            <span className="font-mono text-xs text-slate-300 px-2 font-medium">
              Student <strong className="text-white font-bold">{currentPageIndex + 1}</strong> of{' '}
              <strong className="text-slate-400 font-bold">{totalReports}</strong>
            </span>

            <button
              onClick={handleNextStudent}
              disabled={currentPageIndex >= totalReports - 1}
              className="p-1 rounded-lg hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              title="Next Student"
            >
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </button>

            <div className="h-4 w-px bg-slate-700 mx-1" />

            <form onSubmit={handleJumpToReport} className="flex items-center gap-1">
              <input
                type="text"
                placeholder="#"
                value={targetReportIndex}
                onChange={(e) => setTargetReportIndex(e.target.value)}
                className="w-10 bg-slate-950 text-center font-mono text-xs py-1 px-1 rounded border border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 text-white"
              />
              <button
                type="submit"
                className="text-[10px] uppercase font-bold bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded transition-colors"
              >
                Go
              </button>
            </form>
          </div>
        )}

        {/* Right Controls: Zoom & Debug Panel Toggle & Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-900/90 rounded-xl border border-slate-800 p-0.5 shadow-inner">
            <button
              onClick={handleZoomOut}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-xs px-2 text-slate-300 font-medium min-w-[42px] text-center">
              {zoomLevel}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => setShowDebugPanel((prev) => !prev)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl border transition-all ${
              showDebugPanel
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title="Toggle Pipeline Debug Logs"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Debug Log</span>
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          <button
            onClick={handleDownloadSingleDocx}
            className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl shadow-sm transition-all"
            title="Download Word Document"
          >
            <Download className="w-3.5 h-3.5" />
            <span>DOCX</span>
          </button>

          <button
            onClick={handleDownloadSinglePdf}
            className="flex items-center gap-1.5 text-xs font-semibold bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-xl shadow-sm transition-all"
            title="Download PDF Document"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>PDF</span>
          </button>

          <button
            onClick={handlePrint}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors"
            title="Print"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsFullscreen((prev) => !prev)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-slate-100/90 overflow-auto p-4 flex justify-center relative">
        {isLoadingDocx && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-slate-700">Binding Student Data to Template...</p>
          </div>
        )}

        {previewError ? (
          <div className="m-auto max-w-md bg-red-50 border border-red-200 rounded-2xl p-6 text-center shadow-lg">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-red-900 mb-1">Preview Generation Failed</h3>
            <p className="text-xs text-red-700 mb-4">{previewError}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-xs font-bold bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl transition-all"
            >
              Retry Loading Template
            </button>
          </div>
        ) : (
          <div
            className="transition-transform duration-200 origin-top flex justify-center w-full"
            style={{ transform: `scale(${zoomLevel / 100})` }}
          >
            <div
              ref={docxContainerRef}
              className="bg-white shadow-2xl rounded-xl p-2 min-h-[842px] max-w-[900px] w-full border border-slate-200"
            />
          </div>
        )}
      </div>

      {/* Slide-over Pipeline Debug Panel */}
      {showDebugPanel && populationResult && (
        <div className="border-t border-slate-200 bg-slate-900 text-slate-200 p-4 max-h-[300px] overflow-auto font-mono text-xs">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
            <span className="font-bold text-amber-400 flex items-center gap-2">
              <Info className="w-4 h-4" /> Placeholder Mapping & Pipeline Diagnostics
            </span>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="text-emerald-400">Mapped: {populationResult.mappedCount}</span>
              <span className="text-slate-400">Unmapped: {populationResult.unmappedCount}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-[11px] font-bold text-slate-400 uppercase mb-1">Student Data Object</h4>
              <pre className="bg-slate-950 p-2 rounded border border-slate-800 text-[10px] overflow-auto max-h-[160px] text-blue-300">
                {JSON.stringify(populationResult.studentData, null, 2)}
              </pre>
            </div>
            <div>
              <h4 className="text-[11px] font-bold text-slate-400 uppercase mb-1">Mapped Placeholders</h4>
              <div className="bg-slate-950 p-2 rounded border border-slate-800 text-[10px] overflow-auto max-h-[160px] flex flex-wrap gap-1">
                {populationResult.mappedPlaceholders.map((ph, i) => (
                  <span key={i} className="bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800/50">
                    {ph}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
