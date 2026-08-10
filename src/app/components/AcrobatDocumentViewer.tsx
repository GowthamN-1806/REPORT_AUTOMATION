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
  pdfUrl?: string | null;
}

const EMPTY_TEMPLATE_STUDENT: StudentRecord = {
  id: 'template-blank-0',
  regNo: '',
  name: '',
  department: 'Computer Science and Engineering',
  semester: '',
  currentSemester: '',
  academicYear: '2025 - 2026',
  regulation: '2021',
  universityResults: [
    { sem: '', code: '', title: '', grade: '', passFail: '' },
    { sem: '', code: '', title: '', grade: '', passFail: '' },
    { sem: '', code: '', title: '', grade: '', passFail: '' },
    { sem: '', code: '', title: '', grade: '', passFail: '' },
    { sem: '', code: '', title: '', grade: '', passFail: '' },
    { sem: '', code: '', title: '', grade: '', passFail: '' },
    { sem: '', code: '', title: '', grade: '', passFail: '' },
  ],
  internalEvalResults: [],
  arrears: {},
  gpaBySem: {},
  cgpaBySem: {},
  gpa: undefined,
  cgpa: undefined,
  classObtained: '',
};

export const AcrobatDocumentViewer: React.FC<AcrobatDocumentViewerProps> = ({
  students,
  currentPageIndex,
  onPageChange,
  regulation = '2021',
  activeTemplate = 'template_cie1.docx',
  pdfUrl = null,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isLoadingDocx, setIsLoadingDocx] = useState<boolean>(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [populationResult, setPopulationResult] = useState<DocxPopulationResult | null>(null);
  const [showDebugPanel, setShowDebugPanel] = useState<boolean>(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);

  const hasRealStudents = students && students.length > 0;
  const activeStudents = hasRealStudents ? students : [EMPTY_TEMPLATE_STUDENT];
  const currentStudent = activeStudents[currentPageIndex] || activeStudents[0];
  const totalReports = activeStudents.length;

  const cleanTemplateName = (activeTemplate || 'template_cie1.docx')
    .replace(/^\/?(backend\/templates\/|templates\/)?/, '');

  const [basePdfBlobUrl, setBasePdfBlobUrl] = useState<string | null>(null);

  // Render combined live PDF preview for ALL students (or default empty template) whenever students, regulation, or preloaded pdfUrl changes
  useEffect(() => {
    let isMounted = true;

    async function loadPdfPreview() {
      // If parent provided pre-generated PDF URL from the synchronized merge engine, use it instantly!
      if (pdfUrl && typeof pdfUrl === 'string') {
        setBasePdfBlobUrl(pdfUrl);
        const targetPage = (hasRealStudents ? currentPageIndex : 0) * 2 + 1;
        setPdfPreviewUrl(`${pdfUrl}#page=${targetPage}&toolbar=0&navpanes=0&scrollbar=1`);
        setIsLoadingDocx(false);
        setPreviewError(null);
        return;
      }

      try {
        setIsLoadingDocx(true);
        setPreviewError(null);

        // Generate combined PDF Blob URL for active students (or empty template)
        const generated = await generateCombinedPDF(activeStudents, null, undefined, regulation, true);

        if (!isMounted) return;

        if (typeof generated === 'string') {
          setBasePdfBlobUrl(generated);
          const targetPage = (hasRealStudents ? currentPageIndex : 0) * 2 + 1;
          setPdfPreviewUrl(`${generated}#page=${targetPage}&toolbar=0&navpanes=0&scrollbar=1`);
        }

        // Run debug mapping in background for panel metrics
        if (hasRealStudents && currentStudent) {
          const result = await populateOfficialDocxTemplateWithLogs(cleanTemplateName, currentStudent, regulation);
          if (isMounted) {
            setPopulationResult(result);
          }
        }
      } catch (err: any) {
        console.error('Preview generation error:', err);
        if (isMounted) {
          setPreviewError(err?.message || 'Error generating report preview.');
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
  }, [students, activeTemplate, regulation, pdfUrl]);

  // Jump preview iframe page when user changes page dropdown/navigation
  useEffect(() => {
    if (basePdfBlobUrl) {
      const targetPage = (hasRealStudents ? currentPageIndex : 0) * 2 + 1;
      setPdfPreviewUrl(`${basePdfBlobUrl}#page=${targetPage}&toolbar=0&navpanes=0&scrollbar=1`);
    }

    if (hasRealStudents && currentStudent) {
      populateOfficialDocxTemplateWithLogs(cleanTemplateName, currentStudent, regulation)
        .then((res) => setPopulationResult(res))
        .catch(() => {});
    }
  }, [currentPageIndex, basePdfBlobUrl, hasRealStudents]);

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
        
        {/* Left: Preview Badge & Student Select Dropdown */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-blue-500/80 text-white text-xs font-mono font-black px-3 py-1.5 rounded-xl border border-blue-400/60 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>Preview</span>
          </div>

          <div className="relative">
            <select
              value={hasRealStudents ? currentPageIndex : 0}
              onChange={(e) => hasRealStudents && onPageChange(Number(e.target.value))}
              disabled={!hasRealStudents}
              className="bg-blue-700/80 hover:bg-blue-700 disabled:hover:bg-blue-700/80 text-white font-mono text-xs font-bold px-3 py-1.5 pr-8 rounded-xl border border-blue-500/80 focus:outline-none focus:ring-2 focus:ring-white cursor-pointer disabled:cursor-default transition-all duration-200 appearance-none shadow-sm"
            >
              {hasRealStudents ? (
                activeStudents.map((s, idx) => (
                  <option key={s.id || idx} value={idx} className="bg-blue-900 text-white">
                    #{idx + 1} - {s.name} ({s.regNo})
                  </option>
                ))
              ) : (
                <option value={0} className="bg-blue-900 text-white">
                  #1 - Blank Report Template
                </option>
              )}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-white absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Center: Student Navigation Controls (< >) */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevStudent}
            disabled={!hasRealStudents || currentPageIndex === 0}
            className="p-1.5 rounded-xl bg-blue-700/80 hover:bg-blue-700 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:scale-[1.02] active:scale-[0.98]"
            title="Previous Student"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs font-mono font-black text-white bg-blue-700/80 px-3 py-1 rounded-xl border border-blue-500/80 shadow-sm">
            {hasRealStudents ? `Report ${currentPageIndex + 1} of ${totalReports}` : 'Report Template (Empty)'}
          </span>

          <button
            onClick={handleNextStudent}
            disabled={!hasRealStudents || currentPageIndex === totalReports - 1}
            className="p-1.5 rounded-xl bg-blue-700/80 hover:bg-blue-700 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:scale-[1.02] active:scale-[0.98]"
            title="Next Student"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

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
        {previewError ? (
          <div className="w-full max-w-2xl m-auto bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-900 shadow-md">
            <p className="text-sm font-bold mb-2">Error loading preview.</p>
            <p className="text-xs font-mono text-red-600 mb-4">{previewError}</p>
          </div>
        ) : pdfPreviewUrl ? (
          <div
            className="transition-transform duration-200 origin-top flex justify-center w-full h-full"
            style={{ transform: `scale(${zoomLevel / 100})` }}
          >
            <div className="w-full max-w-[880px] h-[1150px] overflow-hidden rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-slate-200/90 bg-white relative">
              <iframe
                key={pdfPreviewUrl}
                id="preview-pdf-iframe"
                src={pdfPreviewUrl}
                title={`Preview - All Student Reports`}
                className="w-full h-full border-none bg-white"
              />
            </div>
          </div>
        ) : (
          /* Default Empty Preview Canvas when awaiting Excel upload / Run */
          <div
            className="transition-transform duration-200 origin-top flex justify-center w-full my-auto"
            style={{ transform: `scale(${zoomLevel / 100})` }}
          >
            <div className="w-full max-w-[720px] min-h-[820px] bg-white rounded-xl shadow-lg border border-slate-200/90 p-8 flex flex-col justify-between relative overflow-hidden select-none">
              
              {/* Subtle background decorative watermark */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                <FileText className="w-96 h-96 text-slate-900" />
              </div>

              {/* Simulated Document Header */}
              <div className="text-center border-b-2 border-slate-900/80 pb-4 relative z-10">
                <div className="inline-block px-3 py-1 bg-blue-50 text-blue-700 font-mono text-[10px] font-black rounded-md uppercase tracking-wider mb-2 border border-blue-200/80">
                  Official Report Template Preview
                </div>
                <h4 className="text-base font-black text-slate-900 tracking-wide font-serif uppercase">
                  JEPPIAAR INSTITUTE OF TECHNOLOGY
                </h4>
                <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-widest mt-0.5">
                  Kunnam, Sunguvarchatram, Sriperumbudur, Chennai - 631604
                </p>
                <p className="text-[11px] font-black text-slate-900 uppercase tracking-wider mt-1">
                  DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING
                </p>
                <div className="mt-2 py-1 bg-slate-100 rounded text-[11px] font-black text-slate-800 tracking-wider">
                  STUDENT PERFORMANCE & PROGRESS REPORT
                </div>
              </div>

              {/* Simulated Student Information Block */}
              <div className="my-4 p-3.5 bg-slate-50/70 rounded-lg border border-dashed border-slate-300 relative z-10 text-xs">
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700">Register No:</span>
                    <span className="h-3.5 w-28 bg-slate-200 rounded animate-pulse" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700">Student Name:</span>
                    <span className="h-3.5 w-36 bg-slate-200 rounded animate-pulse" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700">Degree & Branch:</span>
                    <span className="h-3.5 w-32 bg-slate-200 rounded animate-pulse" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700">Academic Year:</span>
                    <span className="h-3.5 w-24 bg-slate-200 rounded animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Simulated Academic Performance Table */}
              <div className="relative z-10 my-2">
                <div className="text-[11px] font-black text-slate-800 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Academic Evaluation Matrix</span>
                  <span className="text-[10px] text-slate-400 font-normal">Page 1 of 2</span>
                </div>
                <div className="border border-slate-300 rounded-lg overflow-hidden text-xs">
                  <div className="bg-slate-100 font-bold text-slate-700 grid grid-cols-6 p-2 text-center text-[10px] border-b border-slate-300">
                    <span className="col-span-1">Sub Code</span>
                    <span className="col-span-2 text-left pl-2">Subject Name</span>
                    <span>CIE 1</span>
                    <span>CIE 2</span>
                    <span>Model / Grade</span>
                  </div>
                  {[1, 2, 3, 4, 5].map((row) => (
                    <div key={row} className="grid grid-cols-6 p-2 text-center text-[10px] border-b border-slate-100 last:border-0 items-center">
                      <span className="h-2.5 w-12 bg-slate-200/80 rounded mx-auto" />
                      <span className="col-span-2 h-2.5 w-3/4 bg-slate-200/80 rounded ml-2" />
                      <span className="h-2.5 w-8 bg-slate-200/80 rounded mx-auto" />
                      <span className="h-2.5 w-8 bg-slate-200/80 rounded mx-auto" />
                      <span className="h-2.5 w-10 bg-slate-200/80 rounded mx-auto" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Central Guidance Card Overlay */}
              <div className="relative z-10 my-4 p-5 bg-gradient-to-br from-blue-50/90 via-white to-indigo-50/90 rounded-2xl border-2 border-dashed border-blue-300 text-center shadow-xs">
                <div className="w-12 h-12 mx-auto mb-2.5 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <h5 className="text-sm font-black text-slate-900 tracking-tight">
                  Document Preview Canvas Ready
                </h5>
                <p className="text-xs text-slate-600 max-w-md mx-auto mt-1 leading-relaxed">
                  Upload your <strong className="text-blue-700 font-bold">University Result Excel</strong> on the left and click <strong className="text-blue-700 font-bold">GENERATE REPORT</strong> to populate the live, scrollable 2-page report for all students.
                </p>

                {/* 3 Quick Step Badges */}
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-black text-blue-800 bg-blue-100/90 px-2.5 py-1 rounded-full border border-blue-200 shadow-2xs">
                    1. Upload Excel
                  </span>
                  <span className="text-slate-300">→</span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-black text-indigo-800 bg-indigo-100/90 px-2.5 py-1 rounded-full border border-indigo-200 shadow-2xs">
                    2. Click GENERATE REPORT
                  </span>
                  <span className="text-slate-300">→</span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-800 bg-emerald-100/90 px-2.5 py-1 rounded-full border border-emerald-200 shadow-2xs">
                    3. Preview & Export
                  </span>
                </div>
              </div>

              {/* Simulated Document Footer & Signatures */}
              <div className="pt-4 border-t border-slate-200 grid grid-cols-3 text-center text-[10px] font-bold text-slate-600 relative z-10">
                <div>
                  <div className="h-6 border-b border-dashed border-slate-300 mb-1 mx-4" />
                  <span>Class Incharge</span>
                </div>
                <div>
                  <div className="h-6 border-b border-dashed border-slate-300 mb-1 mx-4" />
                  <span>HOD / CSE</span>
                </div>
                <div>
                  <div className="h-6 border-b border-dashed border-slate-300 mb-1 mx-4" />
                  <span>Principal</span>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};
