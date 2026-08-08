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

  // Render live PDF preview for the currently selected student whenever currentPageIndex or student data changes
  useEffect(() => {
    let isMounted = true;

    async function loadPdfPreview() {
      if (!currentStudent) return;

      try {
        setIsLoadingDocx(true);
        setPreviewError(null);

        // Generate PDF Blob URL for the currently selected student report
        const pdfUrl = await generateCombinedPDF([currentStudent], null, undefined, regulation, true);

        if (!isMounted) return;

        if (typeof pdfUrl === 'string') {
          setPdfPreviewUrl(pdfUrl);
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
  }, [currentPageIndex, students, activeTemplate, regulation]);

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
    if (!pdfPreviewUrl) {
      window.print();
      return;
    }

    // Try direct iframe print
    const existingIframe = document.getElementById('preview-pdf-iframe') as HTMLIFrameElement;
    if (existingIframe && existingIframe.contentWindow) {
      try {
        existingIframe.contentWindow.focus();
        existingIframe.contentWindow.print();
        return;
      } catch (err) {
        console.warn('Direct iframe print error, using dedicated print frame:', err);
      }
    }

    // Create a dedicated hidden print iframe for the PDF blob URL
    const pFrame = document.createElement('iframe');
    pFrame.style.position = 'fixed';
    pFrame.style.right = '0';
    pFrame.style.bottom = '0';
    pFrame.style.width = '0';
    pFrame.style.height = '0';
    pFrame.style.border = '0';
    pFrame.src = pdfPreviewUrl;
    document.body.appendChild(pFrame);

    pFrame.onload = () => {
      setTimeout(() => {
        try {
          pFrame.contentWindow?.focus();
          pFrame.contentWindow?.print();
        } catch (e) {
          console.error('Print iframe error:', e);
        }
        setTimeout(() => {
          if (document.body.contains(pFrame)) {
            document.body.removeChild(pFrame);
          }
        }, 2000);
      }, 300);
    };
  };

  return (
    <div
      className={`w-full flex flex-col bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-200/90 transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'h-[920px]'
      }`}
    >
      {/* Top Toolbar: Solid Blue #2563EB Theme with Clean Contrast */}
      <div className="bg-[#2563EB] px-4 py-3 border-b border-blue-700/60 flex flex-wrap items-center justify-between gap-3 text-white shadow-md rounded-t-2xl transition-all duration-300">
        
        {/* Left: Live Preview Badge & Student Select Dropdown */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-blue-500/80 text-white text-xs font-mono font-black px-3 py-1.5 rounded-xl border border-blue-400/60 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>Live Preview</span>
          </div>

          {totalReports > 0 && (
            <div className="relative">
              <select
                value={currentPageIndex}
                onChange={(e) => onPageChange(Number(e.target.value))}
                className="bg-blue-700/80 hover:bg-blue-700 text-white font-mono text-xs font-bold px-3 py-1.5 pr-8 rounded-xl border border-blue-500/80 focus:outline-none focus:ring-2 focus:ring-white cursor-pointer transition-all duration-200 appearance-none shadow-sm"
              >
                {activeStudents.map((s, idx) => (
                  <option key={s.id || idx} value={idx} className="bg-blue-900 text-white">
                    #{idx + 1} - {s.name} ({s.regNo})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-white absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}
        </div>

        {/* Center: Student Navigation Controls (< >) */}
        {totalReports > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevStudent}
              disabled={currentPageIndex === 0}
              className="p-1.5 rounded-xl bg-blue-700/80 hover:bg-blue-700 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:scale-[1.02] active:scale-[0.98]"
              title="Previous Student"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-mono font-black text-white bg-blue-700/80 px-3 py-1 rounded-xl border border-blue-500/80 shadow-sm">
              Report {currentPageIndex + 1} of {totalReports}
            </span>

            <button
              onClick={handleNextStudent}
              disabled={currentPageIndex === totalReports - 1}
              className="p-1.5 rounded-xl bg-blue-700/80 hover:bg-blue-700 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:scale-[1.02] active:scale-[0.98]"
              title="Next Student"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Right: Actions (Zoom, Fullscreen, Print) */}
        <div className="flex items-center gap-2">

          <div className="flex items-center bg-blue-700/80 rounded-xl p-1 border border-blue-500/80 shadow-sm">
            <button
              onClick={handleZoomOut}
              className="p-1 text-white hover:bg-blue-600 rounded-lg transition-colors duration-200"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono font-bold text-white px-2">
              {zoomLevel}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1 text-white hover:bg-blue-600 rounded-lg transition-colors duration-200"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-xl bg-blue-700/80 hover:bg-blue-700 text-white transition-all duration-200 shadow-sm hover:scale-[1.02] active:scale-[0.98]"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={handlePrint}
            className="p-1.5 rounded-xl bg-blue-700/80 hover:bg-blue-700 text-white transition-all duration-200 shadow-sm hover:scale-[1.02] active:scale-[0.98]"
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
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 mt-4">
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

      {/* Main Document Display Area: Light Blue-Gray #F8FAFC Background with Pure White Document Page */}
      <div className="flex-1 bg-[#F8FAFC] border-t border-slate-200/90 overflow-auto p-5 flex justify-center relative shadow-inner">
        {isLoadingDocx && (
          <div className="absolute inset-0 z-20 bg-slate-900/30 backdrop-blur-xs flex flex-col items-center justify-center text-white gap-3">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-xs font-bold font-mono bg-blue-600 text-white px-4 py-2 rounded-xl shadow-lg border border-blue-500">
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
            <div className="w-full max-w-[880px] h-[1150px] overflow-hidden rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-slate-200/90 bg-white relative">
              <iframe
                id="preview-pdf-iframe"
                src={`${pdfPreviewUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                title={`Live Preview - ${currentStudent?.name}`}
                className="w-full h-[calc(100%+54px)] -mt-[54px] border-none bg-white"
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
