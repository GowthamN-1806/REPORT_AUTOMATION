import React, { useState, useRef } from 'react';
import {
  Menu,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Printer,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit3,
  FileCheck2,
} from 'lucide-react';
import { StudentRecord } from '../types';
import { StudentEditorModal } from './StudentEditorModal';

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
  activeTemplate = 'template_university.docx',
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [targetReportIndex, setTargetReportIndex] = useState<string>('');

  // Limit initially rendered items for fast DOM rendering, expand dynamically on scroll
  const [displayLimit, setDisplayLimit] = useState<number>(30);

  // Edit Modal State
  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const reportRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const activeStudents = students && students.length > 0 ? students : [
    {
      id: 'blank-1',
      regNo: '',
      name: '',
      department: '',
      regulation: '',
      universityResults: [],
      internalEvalResults: [],
      gpa: undefined,
      cgpa: undefined,
      classObtained: '',
      arrears: {},
      gpaBySem: {},
      cgpaBySem: {},
    } as unknown as StudentRecord
  ];

  const totalReports = activeStudents.length;

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 10, 140));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 10, 70));

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 900) {
      if (displayLimit < totalReports) {
        setDisplayLimit((prev) => Math.min(prev + 30, totalReports));
      }
    }
  };

  const scrollToReportIndex = (idx: number) => {
    if (idx < 0 || idx >= totalReports) return;
    if (idx >= displayLimit) {
      setDisplayLimit(idx + 20);
    }
    setTimeout(() => {
      const el = reportRefs.current.get(idx);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        onPageChange(idx);
      }
    }, 100);
  };

  const getSemGPA = (student: StudentRecord | undefined, sem: string): string => {
    if (!student || !student.gpaBySem) return '';
    const val = student.gpaBySem[sem] ?? student.gpaBySem[sem.replace(/^0/, '')];
    if (val !== undefined && val !== null && val !== '') return String(val);
    if ((sem === '05' || sem === '5') && student.gpa !== undefined && student.gpa !== null && student.gpa !== '') return String(student.gpa);
    return '';
  };

  const getSemCGPA = (student: StudentRecord | undefined, sem: string): string => {
    if (!student || !student.cgpaBySem) return '';
    const val = student.cgpaBySem[sem] ?? student.cgpaBySem[sem.replace(/^0/, '')];
    if (val !== undefined && val !== null && val !== '') return String(val);
    if ((sem === '05' || sem === '5') && student.cgpa !== undefined && student.cgpa !== null && student.cgpa !== '') return String(student.cgpa);
    return '';
  };

  const getSemArrears = (student: StudentRecord | undefined, sem: string): string => {
    if (!student || !student.arrears) return '';
    const val = student.arrears[sem] ?? student.arrears[sem.replace(/^0/, '')];
    return val !== undefined && val !== null && val !== '' ? String(val) : '';
  };

  const currentFocusedStudent = activeStudents[currentPageIndex] || activeStudents[0];

  return (
    <div
      className={`w-full bg-white rounded-2xl p-6 shadow-sm border border-slate-100/90 flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none p-0 bg-slate-900' : ''
      }`}
    >
      {/* Step Badge Header & Selected Template Indicator */}
      {!isFullscreen && (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
              2
            </div>
            <h3 className="text-sm font-extrabold text-blue-900 tracking-tight font-poppins">
              Merged Student Results Live Preview
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold font-mono">
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
              Template: {activeTemplate}
            </span>

            {onUpdateStudent && (
              <button
                onClick={() => setEditingStudent(currentFocusedStudent)}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-extrabold shadow-sm hover:shadow-md transition-all flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Current Student</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Lighter, Matching Royal Blue Acrobat Toolbar */}
      <div className="bg-gradient-to-r from-blue-800 via-blue-700 to-indigo-800 text-white px-4 py-2.5 rounded-t-xl flex flex-wrap items-center justify-between gap-2 select-none border-b border-blue-600/50 shadow-sm">
        
        {/* Left Controls: Navigation & Student Select Dropdown */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Previous Student Button */}
          <button
            disabled={currentPageIndex <= 0}
            onClick={() => scrollToReportIndex(currentPageIndex - 1)}
            className="p-1 hover:bg-white/15 rounded text-blue-100 hover:text-white transition disabled:opacity-40"
            title="Previous Student"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Student Dropdown Select */}
          <select
            value={currentPageIndex}
            onChange={(e) => scrollToReportIndex(Number(e.target.value))}
            className="bg-blue-950/90 text-blue-5 text-xs font-bold px-2.5 py-1 rounded border border-blue-500/70 focus:outline-none focus:border-white shadow-inner max-w-[200px] truncate"
          >
            {activeStudents.map((s, idx) => (
              <option key={idx} value={idx} className="bg-slate-900 text-white">
                #{idx + 1} - {s.name || 'STUDENT'} ({s.regNo || 'NO REG'})
              </option>
            ))}
          </select>

          {/* Next Student Button */}
          <button
            disabled={currentPageIndex >= totalReports - 1}
            onClick={() => scrollToReportIndex(currentPageIndex + 1)}
            className="p-1 hover:bg-white/15 rounded text-blue-100 hover:text-white transition disabled:opacity-40"
            title="Next Student"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-blue-500/60 mx-1 hidden sm:block"></div>

          {/* Jump to report input */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-blue-200 font-medium hidden sm:inline">Go to:</span>
            <input
              type="number"
              min={1}
              max={totalReports}
              placeholder="#"
              value={targetReportIndex}
              onChange={(e) => {
                const val = e.target.value;
                setTargetReportIndex(val);
                const num = Number(val);
                if (num >= 1 && num <= totalReports) {
                  scrollToReportIndex(num - 1);
                }
              }}
              className="w-12 bg-blue-950/90 text-center text-xs font-mono font-bold py-1 rounded border border-blue-500/70 text-blue-50 focus:outline-none focus:border-white shadow-inner"
            />
          </div>
        </div>

        {/* Right Zoom & Fit Controls */}
        <div className="flex items-center gap-2">
          <button onClick={handleZoomOut} className="p-1 hover:bg-white/15 rounded text-blue-100 hover:text-white transition" title="Zoom Out">
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <span className="text-xs font-mono font-medium text-blue-50 flex items-center gap-1 bg-blue-900/90 px-2.5 py-0.5 rounded border border-blue-500/70">
            {zoomLevel}% <ChevronDown className="w-3 h-3 text-blue-200" />
          </span>

          <button onClick={handleZoomIn} className="p-1 hover:bg-white/15 rounded text-blue-100 hover:text-white transition" title="Zoom In">
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-blue-500/60 mx-1"></div>

          <button
            onClick={() => setZoomLevel(100)}
            className="p-1 hover:bg-white/15 rounded text-blue-100 hover:text-white transition text-[11px] font-bold px-1.5"
            title="Fit Page"
          >
            Fit Page
          </button>

          <button
            onClick={() => window.print()}
            className="p-1 hover:bg-white/15 rounded text-blue-100 hover:text-white transition"
            title="Print Preview"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1 hover:bg-white/15 rounded text-blue-100 hover:text-white transition"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Document Scroll Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="w-full bg-slate-200/90 rounded-b-xl p-4 sm:p-8 overflow-y-auto max-h-[85vh] space-y-12 border border-slate-300/80 shadow-inner"
      >
        {activeStudents.slice(0, displayLimit).map((student, index) => {
          const uResList = student.universityResults || [];
          const iResList = student.internalEvalResults || [];

          return (
            <div
              key={student.id || index}
              ref={(el) => {
                if (el) reportRefs.current.set(index, el);
              }}
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
              className="max-w-[720px] mx-auto bg-white shadow-xl rounded-sm p-8 border border-slate-300 text-slate-900 transition-transform duration-200 relative"
            >
              {/* Report Index Badge Header */}
              <div className="mb-4 pb-2 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500 font-mono">
                <span className="font-bold text-blue-900">
                  Report #{index + 1} of {totalReports}
                </span>
                <span>Reg: {student.regNo || 'N/A'}</span>
              </div>

              {/* Header Logos & Institution Details */}
              <div className="flex items-center justify-between pb-3 border-b-2 border-slate-800 mb-4">
                <div className="w-14 h-14 flex items-center justify-center">
                  <img src="/jit_logo.png" alt="JIT Logo" className="max-h-full max-w-full object-contain" />
                </div>

                <div className="text-center px-2">
                  <h1 className="text-base font-black text-blue-900 tracking-tight font-serif uppercase">
                    JEPPIAAR INSTITUTE OF TECHNOLOGY
                  </h1>
                  <p className="text-[10px] font-bold text-blue-700 italic font-serif">
                    "Self Belief, Self Discipline, Self Respect"
                  </p>
                  <p className="text-[9px] font-bold text-red-600 tracking-wider mt-0.5">
                    ( AN AUTONOMOUS INSTITUTION )
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <img src="/naac_logo.png" alt="NAAC" className="h-10 object-contain" />
                  <img src="/nba_logo.png" alt="NBA" className="h-10 object-contain" />
                </div>
              </div>

              {/* Salutation & Subject Text */}
              <div className="text-xs space-y-2 mb-4 text-slate-800">
                <p>Greetings from Jeppiaar Institute of Technology,</p>
                <div className="flex items-center justify-between">
                  <p>
                    This is to inform you that the results of the Semester End Examination held during{' '}
                    <strong className="font-bold">Nov/Dec 2025</strong> have been released.
                  </p>
                  <div className="font-mono text-xs font-bold text-slate-900 shrink-0 ml-2">
                    Regulation: {regulation || student.regulation || '2021'}
                  </div>
                </div>
              </div>

              {/* Student Identification Table */}
              <table className="w-full border-collapse border border-slate-800 text-xs mb-4">
                <tbody>
                  <tr>
                    <td className="border border-slate-800 p-2 font-medium bg-slate-50 w-36">Register number:</td>
                    <td className="border border-slate-800 p-2 font-bold font-mono text-slate-900">
                      {student.regNo}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-slate-800 p-2 font-medium bg-slate-50">Name of the Student:</td>
                    <td className="border border-slate-800 p-2 font-bold uppercase text-slate-900">
                      {student.name}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* University Results Table */}
              <div className="mb-4">
                <table className="w-full border-collapse border border-slate-800 text-xs text-center">
                  <thead>
                    <tr className="bg-slate-100 font-bold border-b border-slate-800">
                      <th className="border border-slate-800 p-1.5 w-16">Semester</th>
                      <th className="border border-slate-800 p-1.5 w-28">Subject Code</th>
                      <th className="border border-slate-800 p-1.5 text-left">Subject Name</th>
                      <th className="border border-slate-800 p-1.5 w-16">Grade</th>
                      <th className="border border-slate-800 p-1.5 w-20">Pass/Fail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uResList.length > 0 ? (
                      uResList.map((res, i) => (
                        <tr key={i} className="border-b border-slate-300">
                          <td className="border border-slate-800 p-1.5 font-medium">{res.sem || 'V'}</td>
                          <td className="border border-slate-800 p-1.5 font-bold font-mono">{res.code}</td>
                          <td className="border border-slate-800 p-1.5 text-left font-medium">{res.title}</td>
                          <td className={`border border-slate-800 p-1.5 font-bold font-mono ${res.grade === 'RA' || res.grade === 'U' || res.grade === 'F' ? 'text-red-600' : 'text-slate-900'}`}>
                            {res.grade}
                          </td>
                          <td className={`border border-slate-800 p-1.5 font-bold ${res.passFail === 'FAIL' ? 'text-red-600' : 'text-slate-900'}`}>
                            {res.passFail}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="border border-slate-800 p-4 text-slate-400 italic">
                          No University subject results uploaded.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* GPA / CGPA Summary Grid */}
              <div className="mb-6">
                <p className="text-xs font-bold mb-1.5 text-slate-900">
                  Nov/Dec 2025 University Results:-
                </p>
                <p className="text-xs font-bold mb-2 text-slate-900">GPA/CGPA:-</p>

                <table className="w-full border-collapse border border-slate-800 text-[11px] text-center font-mono">
                  <thead>
                    <tr className="bg-slate-100 font-bold border-b border-slate-800">
                      <th className="border border-slate-800 p-1 font-sans text-left">SEMESTER</th>
                      <th className="border border-slate-800 p-1 w-10">01</th>
                      <th className="border border-slate-800 p-1 w-10">02</th>
                      <th className="border border-slate-800 p-1 w-10">03</th>
                      <th className="border border-slate-800 p-1 w-10">04</th>
                      <th className="border border-slate-800 p-1 w-10">05</th>
                      <th className="border border-slate-800 p-1 w-10">06</th>
                      <th className="border border-slate-800 p-1 w-10">07</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-slate-800 p-1 font-sans font-bold text-left bg-slate-50">ARREARS</td>
                      <td className="border border-slate-800 p-1">{getSemArrears(student, '01')}</td>
                      <td className="border border-slate-800 p-1">{getSemArrears(student, '02')}</td>
                      <td className="border border-slate-800 p-1">{getSemArrears(student, '03')}</td>
                      <td className="border border-slate-800 p-1">{getSemArrears(student, '04')}</td>
                      <td className="border border-slate-800 p-1">{getSemArrears(student, '05')}</td>
                      <td className="border border-slate-800 p-1">-</td>
                      <td className="border border-slate-800 p-1">-</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-800 p-1 font-sans font-bold text-left bg-slate-50">GPA</td>
                      <td className="border border-slate-800 p-1">{getSemGPA(student, '01')}</td>
                      <td className="border border-slate-800 p-1">{getSemGPA(student, '02')}</td>
                      <td className="border border-slate-800 p-1">{getSemGPA(student, '03')}</td>
                      <td className="border border-slate-800 p-1">{getSemGPA(student, '04')}</td>
                      <td className="border border-slate-800 p-1 font-bold">{getSemGPA(student, '05')}</td>
                      <td className="border border-slate-800 p-1">-</td>
                      <td className="border border-slate-800 p-1">-</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-800 p-1 font-sans font-bold text-left bg-slate-50">CGPA</td>
                      <td className="border border-slate-800 p-1">{getSemCGPA(student, '01')}</td>
                      <td className="border border-slate-800 p-1">{getSemCGPA(student, '02')}</td>
                      <td className="border border-slate-800 p-1">{getSemCGPA(student, '03')}</td>
                      <td className="border border-slate-800 p-1">{getSemCGPA(student, '04')}</td>
                      <td className="border border-slate-800 p-1 font-bold">{getSemCGPA(student, '05')}</td>
                      <td className="border border-slate-800 p-1">-</td>
                      <td className="border border-slate-800 p-1">-</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Class Obtained Banner */}
              <div className="mb-6 border border-slate-800 p-2 font-mono text-xs text-center font-bold bg-slate-50">
                CLASS OBTAINED: {student.classObtained || 'FIRST CLASS'}
              </div>

              {/* Continuous Internal Evaluation Table */}
              <div className="mb-8">
                <p className="text-xs font-bold mb-2 text-slate-900">
                  Continuous Internal Evaluation Results:-
                </p>
                <table className="w-full border-collapse border border-slate-800 text-xs text-center">
                  <thead>
                    <tr className="bg-slate-100 font-bold border-b border-slate-800">
                      <th className="border border-slate-800 p-1.5 w-16">Semester</th>
                      <th className="border border-slate-800 p-1.5 w-28">Subject Code</th>
                      <th className="border border-slate-800 p-1.5 text-left">Subject Name</th>
                      <th className="border border-slate-800 p-1.5 w-16">CIE 1</th>
                      <th className="border border-slate-800 p-1.5 w-16">CIE 2</th>
                      <th className="border border-slate-800 p-1.5 w-16">Model</th>
                      <th className="border border-slate-800 p-1.5 w-20">Pass/Fail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {iResList.length > 0 ? (
                      iResList.map((ie, i) => (
                        <tr key={i} className="border-b border-slate-300">
                          <td className="border border-slate-800 p-1.5 font-medium">{ie.sem || 'VI'}</td>
                          <td className="border border-slate-800 p-1.5 font-bold font-mono">{ie.code}</td>
                          <td className="border border-slate-800 p-1.5 text-left font-medium">{ie.title}</td>
                          <td className="border border-slate-800 p-1.5 font-bold font-mono">{ie.cie1Marks ?? '-'}</td>
                          <td className="border border-slate-800 p-1.5 font-bold font-mono">{ie.cie2Marks ?? '-'}</td>
                          <td className="border border-slate-800 p-1.5 font-bold font-mono">{ie.modelMarks ?? '-'}</td>
                          <td className={`border border-slate-800 p-1.5 font-bold ${ie.passFail === 'FAIL' ? 'text-red-600' : 'text-slate-900'}`}>
                            {ie.passFail || 'PASS'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="border border-slate-800 p-4 text-slate-400 italic">
                          No internal evaluation results uploaded.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Signatures & Footer */}
              <div className="pt-12 flex items-center justify-between text-xs font-bold text-slate-900">
                <div className="text-center">
                  <div className="w-32 border-b border-slate-800 mb-1"></div>
                  <p>Class Counsellor</p>
                </div>
                <div className="text-center">
                  <div className="w-32 border-b border-slate-800 mb-1"></div>
                  <p>HOD</p>
                </div>
                <div className="text-center">
                  <div className="w-32 border-b border-slate-800 mb-1"></div>
                  <p>Principal</p>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Student Record Editor Modal */}
      {editingStudent && (
        <StudentEditorModal
          student={editingStudent}
          isOpen={!!editingStudent}
          onClose={() => setEditingStudent(null)}
          onSave={(updated) => {
            if (onUpdateStudent) onUpdateStudent(updated);
            setEditingStudent(null);
          }}
        />
      )}
    </div>
  );
};
