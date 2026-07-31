import React, { useState } from 'react';
import {
  Menu,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Printer,
  ChevronDown,
} from 'lucide-react';
import { StudentRecord } from '../types';

interface AcrobatDocumentViewerProps {
  students: StudentRecord[];
  currentPageIndex: number;
  onPageChange: (index: number) => void;
}

export const AcrobatDocumentViewer: React.FC<AcrobatDocumentViewerProps> = ({
  students,
  currentPageIndex,
  onPageChange,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [previewPage, setPreviewPage] = useState<1 | 2>(1);
  const [showPlaceholders, setShowPlaceholders] = useState<boolean>(false);

  const totalPages = students.length || 512;
  const currentStudent = students[currentPageIndex] || students[0];

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 10, 140));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 10, 70));

  const getSemGPA = (student: StudentRecord | undefined, sem: string): string => {
    if (!student || !student.gpaBySem) return '-';
    const val = student.gpaBySem[sem] || student.gpaBySem[sem.replace(/^0/, '')];
    if (val !== undefined && val !== null && val !== '') return String(val);
    if (sem === '05' || sem === '5') return String(student.gpa);
    return '-';
  };

  const getSemCGPA = (student: StudentRecord | undefined, sem: string): string => {
    if (!student || !student.cgpaBySem) return '-';
    const val = student.cgpaBySem[sem] || student.cgpaBySem[sem.replace(/^0/, '')];
    if (val !== undefined && val !== null && val !== '') return String(val);
    if (sem === '05' || sem === '5') return String(student.cgpa);
    return '-';
  };

  const getSemArrears = (student: StudentRecord | undefined, sem: string): string => {
    if (!student || !student.arrears) return '0';
    const val = student.arrears[sem] ?? student.arrears[sem.replace(/^0/, '')];
    return val !== undefined && val !== null ? String(val) : '0';
  };

  return (
    <div
      className={`w-full bg-white rounded-2xl p-6 shadow-sm border border-slate-100/90 flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none p-0 bg-slate-900' : ''
      }`}
    >
      {/* Step Badge Header */}
      {!isFullscreen && (
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
              2
            </div>
            <h3 className="text-sm font-extrabold text-blue-900 tracking-tight font-poppins">
              Report Template Preview (template.pdf)
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setPreviewPage(1)}
                className={`px-3 py-1 rounded-md transition ${previewPage === 1 ? 'bg-white shadow-sm text-blue-700 font-bold' : 'text-slate-600'}`}
              >
                Page 1: Marks Report
              </button>
              <button
                onClick={() => setPreviewPage(2)}
                className={`px-3 py-1 rounded-md transition ${previewPage === 2 ? 'bg-white shadow-sm text-blue-700 font-bold' : 'text-slate-600'}`}
              >
                Page 2: Acknowledgement
              </button>
            </div>

            <button
              onClick={() => setShowPlaceholders(!showPlaceholders)}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 transition"
            >
              {showPlaceholders ? 'Show Live Data' : 'Show Template Tokens'}
            </button>
          </div>
        </div>
      )}

      {/* Lighter, Matching Royal Blue Acrobat Toolbar */}
      <div className="bg-gradient-to-r from-blue-800 via-blue-700 to-indigo-800 text-white px-4 py-2.5 rounded-t-xl flex items-center justify-between select-none border-b border-blue-600/50 shadow-sm">
        
        {/* Left Acrobat Controls */}
        <div className="flex items-center gap-2">
          <button className="p-1 hover:bg-white/15 rounded text-blue-100 hover:text-white transition">
            <Menu className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-blue-500/60 mx-1"></div>

          <button
            onClick={() => onPageChange(0)}
            disabled={currentPageIndex === 0}
            className="p-1 hover:bg-white/15 rounded text-blue-100 hover:text-white disabled:opacity-30 transition"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => onPageChange(Math.max(0, currentPageIndex - 1))}
            disabled={currentPageIndex === 0}
            className="p-1 hover:bg-white/15 rounded text-blue-100 hover:text-white disabled:opacity-30 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5 mx-1">
            <input
              type="text"
              readOnly
              value={`${currentPageIndex + 1} / ${totalPages}`}
              className="w-16 bg-blue-900/90 text-center text-xs font-mono font-bold py-1 rounded border border-blue-500/70 text-blue-50 shadow-inner"
            />
          </div>

          <button
            onClick={() => onPageChange(Math.min(totalPages - 1, currentPageIndex + 1))}
            disabled={currentPageIndex >= totalPages - 1}
            className="p-1 hover:bg-white/15 rounded text-blue-100 hover:text-white disabled:opacity-30 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onPageChange(totalPages - 1)}
            disabled={currentPageIndex >= totalPages - 1}
            className="p-1 hover:bg-white/15 rounded text-blue-100 hover:text-white disabled:opacity-30 transition"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>

        {/* Center/Right Zoom */}
        <div className="flex items-center gap-2">
          <button onClick={handleZoomOut} className="p-1 hover:bg-white/15 rounded text-blue-100 hover:text-white transition">
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <span className="text-xs font-mono font-medium text-blue-50 flex items-center gap-1 bg-blue-900/90 px-2.5 py-0.5 rounded border border-blue-500/70">
            {zoomLevel}% <ChevronDown className="w-3 h-3 text-blue-200" />
          </span>

          <button onClick={handleZoomIn} className="p-1 hover:bg-white/15 rounded text-blue-100 hover:text-white transition">
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-blue-500/60 mx-1"></div>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1 hover:bg-white/15 rounded text-blue-100 hover:text-white transition"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button onClick={() => window.print()} className="p-1 hover:bg-white/15 rounded text-blue-100 hover:text-white transition">
            <Printer className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Document Canvas Container */}
      <div className="bg-slate-200/60 p-6 rounded-b-xl border border-t-0 border-slate-200 flex justify-center items-start overflow-auto min-h-[640px] max-h-[85vh]">
        
        {/* Render Page 1 or Page 2 with Exact A4 Page Border Frame */}
        {previewPage === 1 ? (
          /* PAGE 1: MARKS REPORT WITH PAGE BORDER */
          <div
            className="bg-white w-[680px] h-[960px] p-3 rounded shadow-xl border border-slate-300 font-sans transition-transform duration-200 text-slate-900 relative shrink-0 box-border flex flex-col justify-between"
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
          >
            {/* Outer Page Border Line */}
            <div className="border-2 border-slate-900 w-full h-full p-1 flex flex-col box-border">
              
              {/* Inner Page Border Inset Box */}
              <div className="border border-slate-900 w-full h-full p-4 flex flex-col justify-between box-border overflow-hidden">
                
                <div>
                  {/* Header Banner */}
                  <div className="flex items-start justify-between gap-3 pb-2 border-b border-slate-200">
                    <div className="w-14 h-16 shrink-0 flex items-center justify-center">
                      <img
                        src="/jit_logo.png"
                        alt="Official JIT Logo"
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="text-center flex-1">
                      <h2 className="text-lg font-extrabold text-[#0284c7] uppercase tracking-tight font-poppins leading-tight">
                        JEPPIAAR INSTITUTE OF TECHNOLOGY
                      </h2>
                      <p className="text-[11px] font-semibold text-[#0369a1] italic mt-0.5 font-serif">
                        "Self Belief, Self Discipline, Self Respect"
                      </p>
                      <p className="text-[8px] font-bold text-red-600 tracking-wider mt-0.5 uppercase">
                        ( AN AUTONOMOUS INSTITUTION )
                      </p>
                    </div>

                    <div className="shrink-0 text-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-red-600 text-white flex flex-col items-center justify-center p-1 border-2 border-amber-300 shadow-sm mx-auto">
                        <span className="text-[11px] font-extrabold leading-none">A+</span>
                        <span className="text-[5px] font-bold tracking-widest mt-0.5">NAAC</span>
                      </div>
                    </div>
                  </div>

                  {/* Greetings Line */}
                  <div className="text-[11px] font-serif leading-tight text-slate-900 mt-2">
                    <p>Greetings from Jeppiaar Institute of Technology,</p>
                    <p className="mt-0.5">
                      This is to inform you that the results of the Semester End Examination held during{' '}
                      <span className="font-bold">Nov/Dec 2025</span> have been released.
                    </p>
                  </div>

                  {/* Regulation Line */}
                  <div className="text-right text-[11px] font-bold font-serif my-1 text-slate-900">
                    Regulation:{currentStudent?.regulation || '2021/2024'}
                  </div>

                  {/* Register number / Student Name Table */}
                  <table className="w-full border-collapse text-[11px] font-serif mb-2.5 border border-slate-900">
                    <tbody>
                      <tr>
                        <td className="border border-slate-900 px-2.5 py-1 w-44 font-normal">
                          Register number:
                        </td>
                        <td className="border border-slate-900 px-2.5 py-1 font-bold font-mono">
                          {showPlaceholders ? '{{REGISTER_NO}}' : currentStudent?.regNo || '210624104000'}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-900 px-2.5 py-1 font-normal">
                          Name of the Student:
                        </td>
                        <td className="border border-slate-900 px-2.5 py-1 font-bold uppercase">
                          {showPlaceholders ? '{{STUDENT_NAME}}' : currentStudent?.name || 'YYYYY'}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* University Results Table */}
                  <table className="w-full border-collapse text-[11px] font-serif mb-2.5 text-center border border-slate-900">
                    <thead>
                      <tr className="font-bold border-b border-slate-900 bg-slate-50/50">
                        <th className="border border-slate-900 py-1 px-1.5 w-16">Semester</th>
                        <th className="border border-slate-900 py-1 px-1.5 w-24">Subject Code</th>
                        <th className="border border-slate-900 py-1 px-1.5 text-left">Subject Name</th>
                        <th className="border border-slate-900 py-1 px-1.5 w-16">Grade</th>
                        <th className="border border-slate-900 py-1 px-1.5 w-20">Pass/Fail</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(currentStudent?.universityResults || []).map((sub, idx) => (
                        <tr key={idx} className="h-5">
                          <td className="border border-slate-900 py-0.5 px-1">{showPlaceholders ? '{{SEM}}' : sub.sem}</td>
                          <td className="border border-slate-900 py-0.5 px-1 font-bold font-mono">{showPlaceholders ? '{{CODE}}' : sub.code}</td>
                          <td className="border border-slate-900 py-0.5 px-1.5 text-left">{showPlaceholders ? '{{TITLE}}' : sub.title}</td>
                          <td className="border border-slate-900 py-0.5 px-1 font-bold">{showPlaceholders ? '{{GRADE}}' : sub.grade}</td>
                          <td className="border border-slate-900 py-0.5 px-1 font-bold">{showPlaceholders ? '{{PASS_FAIL}}' : sub.passFail}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* University Results Header */}
                  <div className="text-[11px] font-serif font-bold space-y-0.5 mb-1.5 text-slate-900">
                    <p>Nov/Dec 2025 University Results:-</p>
                    <p>GPA/CGPA:-</p>
                  </div>

                  {/* GPA/CGPA Matrix Table */}
                  <table className="w-full border-collapse text-[11px] font-serif mb-2.5 text-center border border-slate-900">
                    <thead>
                      <tr className="font-bold bg-slate-50/50">
                        <th className="border border-slate-900 py-1 px-1.5 text-left w-32">SEMESTER</th>
                        <th className="border border-slate-900 py-1 px-1">01</th>
                        <th className="border border-slate-900 py-1 px-1">02</th>
                        <th className="border border-slate-900 py-1 px-1">03</th>
                        <th className="border border-slate-900 py-1 px-1">04</th>
                        <th className="border border-slate-900 py-1 px-1">05</th>
                        <th className="border border-slate-900 py-1 px-1">06</th>
                        <th className="border border-slate-900 py-1 px-1">07</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-900 py-0.5 px-1.5 text-left font-bold">ARREARS</td>
                        {['01', '02', '03', '04', '05', '06', '07'].map((sem) => (
                          <td key={sem} className="border border-slate-900 py-0.5 px-1">
                            {showPlaceholders ? '0' : getSemArrears(currentStudent, sem)}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="border border-slate-900 py-0.5 px-1.5 text-left font-bold">GPA</td>
                        {['01', '02', '03', '04', '05', '06', '07'].map((sem) => (
                          <td key={sem} className="border border-slate-900 py-0.5 px-1 font-bold">
                            {showPlaceholders ? '8.20' : getSemGPA(currentStudent, sem)}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="border border-slate-900 py-0.5 px-1.5 text-left font-bold">CGPA</td>
                        {['01', '02', '03', '04', '05', '06', '07'].map((sem) => (
                          <td key={sem} className="border border-slate-900 py-0.5 px-1 font-bold">
                            {showPlaceholders ? '8.20' : getSemCGPA(currentStudent, sem)}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="border border-slate-900 py-0.5 px-1.5 text-left font-bold">CLASS OBTAINED</td>
                        <td colSpan={7} className="border border-slate-900 py-0.5 text-left font-bold px-2.5">
                          {showPlaceholders ? 'FIRST CLASS WITH DISTINCTION' : currentStudent?.classObtained || 'FIRST CLASS'}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Internal Evaluation Header */}
                  <div className="text-[11px] font-serif font-bold mb-1.5 text-slate-900">
                    Academic Year 2025-2026- Even Sem- Continuous Internal Evaluation Results:
                  </div>

                  {/* Continuous Internal Evaluation Table */}
                  <table className="w-full border-collapse text-[11px] font-serif mb-2 text-center border border-slate-900">
                    <thead>
                      <tr className="font-bold border-b border-slate-900 bg-slate-50/50">
                        <th className="border border-slate-900 py-1 px-1.5 w-16">Semester</th>
                        <th className="border border-slate-900 py-1 px-1.5 w-24">Subject Code</th>
                        <th className="border border-slate-900 py-1 px-1.5 text-left">Subject Name</th>
                        <th className="border border-slate-900 py-1 px-1.5 w-24">CIE I Marks</th>
                        <th className="border border-slate-900 py-1 px-1.5 w-20">Pass/Fail</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(currentStudent?.internalEvalResults || []).map((sub, idx) => (
                        <tr key={idx} className="h-5">
                          <td className="border border-slate-900 py-0.5 px-1">{showPlaceholders ? '{{SEM}}' : sub.sem}</td>
                          <td className="border border-slate-900 py-0.5 px-1 font-bold font-mono">{showPlaceholders ? '{{CODE}}' : sub.code}</td>
                          <td className="border border-slate-900 py-0.5 px-1.5 text-left">{showPlaceholders ? '{{TITLE}}' : sub.title}</td>
                          <td className="border border-slate-900 py-0.5 px-1 font-bold">{showPlaceholders ? '{{CIE_MARKS}}' : sub.cie1Marks}</td>
                          <td className="border border-slate-900 py-0.5 px-1 font-bold">{showPlaceholders ? '{{PASS_FAIL}}' : sub.passFail}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Signature of Counsellor */}
                <div className="text-right text-[11px] font-serif font-bold text-slate-900 pt-2 shrink-0">
                  Signature of Counsellor
                </div>

              </div>
            </div>
          </div>
        ) : (
          /* PAGE 2: ACKNOWLEDGEMENT FORM WITH PAGE BORDER */
          <div
            className="bg-white w-[680px] h-[960px] p-3 rounded shadow-xl border border-slate-300 font-serif transition-transform duration-200 text-slate-900 relative shrink-0 box-border flex flex-col justify-between"
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
          >
            {/* Outer Page Border Line */}
            <div className="border-2 border-slate-900 w-full h-full p-1 flex flex-col box-border">
              
              {/* Inner Page Border Inset Box */}
              <div className="border border-slate-900 w-full h-full p-8 flex flex-col justify-between box-border overflow-hidden">
                <div>
                  <h2 className="text-sm font-sans font-bold text-slate-900 tracking-wide mb-8 text-center uppercase">
                    ACKNOWLEDGEMENT
                  </h2>

                  <p className="text-xs mb-6">To</p>

                  <div className="text-center text-xs font-bold mb-6">
                    The Class Counsellor, Department of {currentStudent?.department || 'Computer Science and Engineering'} ,
                  </div>

                  <p className="text-xs mb-8 text-center">
                    Jeppiaar Institute of Technology, Kunnam, Sunguvarchatram, Sriperumbudur (T.K), Chennai - 631604.
                  </p>

                  <p className="text-xs leading-relaxed mb-10 text-justify">
                    Progress report of my Son / Daughter Name:{' '}
                    <span className="font-bold uppercase">
                      {showPlaceholders ? 'NAME OF THE STUDENT – Reg. REGNO' : `${currentStudent?.name} – Reg. ${currentStudent?.regNo}`}
                    </span>{' '}
                    for Nov/Dec 2025 end Semester exam and 2025-2026 AY – Even Sem- Continuous Internal Evaluation Results have been received.
                  </p>
                </div>

                <div>
                  <div className="text-right text-xs font-bold mb-12">
                    Signature of the Parent
                  </div>

                  <div className="text-xs mb-12">
                    Date:
                  </div>

                  <div className="text-right text-xs font-sans font-bold text-slate-900">
                    JIT/EXAM/FORM-09-b
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

    </div>
  );
};
