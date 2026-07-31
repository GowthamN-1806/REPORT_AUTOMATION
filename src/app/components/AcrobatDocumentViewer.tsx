import React, { useState, useRef } from 'react';
import {
  Menu,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Printer,
  ChevronDown,
} from 'lucide-react';
import { StudentRecord } from '../types';
import { defaultUnivSubjects, defaultInternalSubjects } from '../data/sampleStudents';

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
  const [targetReportIndex, setTargetReportIndex] = useState<string>('');

  // Limit initially rendered items for fast DOM rendering, expand dynamically on scroll
  const [displayLimit, setDisplayLimit] = useState<number>(30);

  const containerRef = useRef<HTMLDivElement>(null);
  const reportRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const activeStudents = students && students.length > 0 ? students : [
    {
      id: 'demo-1',
      regNo: '210624104000',
      name: 'YYYYY',
      department: 'Computer Science and Engineering',
      regulation: '2021/2024',
      universityResults: defaultUnivSubjects,
      internalEvalResults: defaultInternalSubjects,
      gpa: 8.2,
      cgpa: 8.2,
      classObtained: 'FIRST CLASS',
      arrears: { '01': 0, '02': 0, '03': 0, '04': 0, '05': 0, '06': 0, '07': 0 },
      gpaBySem: { '01': '8.20', '02': '8.20', '03': '8.20', '04': '8.20', '05': '8.20', '06': '-', '07': '-' },
      cgpaBySem: { '01': '8.20', '02': '8.20', '03': '8.20', '04': '8.20', '05': '8.20', '06': '-', '07': '-' },
    } as StudentRecord
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
          </div>
        </div>
      )}

      {/* Lighter, Matching Royal Blue Acrobat Toolbar */}
      <div className="bg-gradient-to-r from-blue-800 via-blue-700 to-indigo-800 text-white px-4 py-2.5 rounded-t-xl flex items-center justify-between select-none border-b border-blue-600/50 shadow-sm">
        
        {/* Left Acrobat Controls */}
        <div className="flex items-center gap-3">
          <button className="p-1 hover:bg-white/15 rounded text-blue-100 hover:text-white transition">
            <Menu className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-blue-500/60 mx-1"></div>

          {/* Continuous Scroll View Status Badge */}
          <div className="flex items-center gap-2 bg-blue-950/80 border border-blue-500/60 px-3 py-1 rounded-md text-xs font-mono font-bold text-blue-100">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Continuous Scroll</span>
            <span className="bg-blue-800 text-blue-100 px-2 py-0.5 rounded text-[10px] border border-blue-600/60 font-sans">
              {totalReports} {totalReports === 1 ? 'Report' : 'Reports'} Total
            </span>
          </div>

          {/* Jump to specific report */}
          <div className="flex items-center gap-1.5 ml-2">
            <span className="text-xs text-blue-200 font-medium">Go to report:</span>
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
              className="w-14 bg-blue-950/90 text-center text-xs font-mono font-bold py-1 rounded border border-blue-500/70 text-blue-50 focus:outline-none focus:border-white shadow-inner"
            />
          </div>
        </div>

        {/* Center/Right Zoom Controls */}
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

      {/* Document Canvas Container with Continuous Vertical Scroll */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="bg-slate-200/70 p-6 rounded-b-xl border border-t-0 border-slate-200 flex flex-col items-center gap-8 overflow-y-auto min-h-[640px] max-h-[85vh] scroll-smooth"
      >
        {activeStudents.slice(0, displayLimit).map((student, idx) => (
          <div
            key={student.id || idx}
            ref={(el) => {
              if (el) reportRefs.current.set(idx, el);
              else reportRefs.current.delete(idx);
            }}
            className="flex flex-col items-center gap-2 group shrink-0"
          >
            {/* Header Badge for each Student Report Page */}
            <div className="flex items-center gap-2.5 bg-slate-800/90 text-white text-[11px] font-mono px-3.5 py-1 rounded-full shadow-md backdrop-blur-sm border border-slate-700/80">
              <span className="font-extrabold text-sky-300">Report {idx + 1} of {totalReports}</span>
              <span className="text-slate-500">•</span>
              <span className="font-semibold text-slate-200">{student.name}</span>
              <span className="text-slate-400 font-mono">({student.regNo})</span>
            </div>

            {/* Render Page 1 or Page 2 with A4 Page Border Frame */}
            {previewPage === 1 ? (
              /* PAGE 1: MARKS REPORT */
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
                        Regulation:{student?.regulation || '2021/2024'}
                      </div>

                      {/* Register number / Student Name Table */}
                      <table className="w-full border-collapse text-[11px] font-serif mb-2.5 border border-slate-900">
                        <tbody>
                          <tr>
                            <td className="border border-slate-900 px-2.5 py-1 w-44 font-normal">
                              Register number:
                            </td>
                            <td className="border border-slate-900 px-2.5 py-1 font-bold font-mono">
                              {student?.regNo}
                            </td>
                          </tr>
                          <tr>
                            <td className="border border-slate-900 px-2.5 py-1 font-normal">
                              Name of the Student:
                            </td>
                            <td className="border border-slate-900 px-2.5 py-1 font-bold uppercase">
                              {student?.name}
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
                          {(student?.universityResults || []).map((sub, sIdx) => (
                            <tr key={sIdx} className="h-5">
                              <td className="border border-slate-900 py-0.5 px-1">{sub.sem}</td>
                              <td className="border border-slate-900 py-0.5 px-1 font-bold font-mono">{sub.code}</td>
                              <td className="border border-slate-900 py-0.5 px-1.5 text-left">{sub.title}</td>
                              <td className="border border-slate-900 py-0.5 px-1 font-bold">{sub.grade}</td>
                              <td className="border border-slate-900 py-0.5 px-1 font-bold">{sub.passFail}</td>
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
                                {getSemArrears(student, sem)}
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="border border-slate-900 py-0.5 px-1.5 text-left font-bold">GPA</td>
                            {['01', '02', '03', '04', '05', '06', '07'].map((sem) => (
                              <td key={sem} className="border border-slate-900 py-0.5 px-1 font-bold">
                                {getSemGPA(student, sem)}
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="border border-slate-900 py-0.5 px-1.5 text-left font-bold">CGPA</td>
                            {['01', '02', '03', '04', '05', '06', '07'].map((sem) => (
                              <td key={sem} className="border border-slate-900 py-0.5 px-1 font-bold">
                                {getSemCGPA(student, sem)}
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="border border-slate-900 py-0.5 px-1.5 text-left font-bold">CLASS OBTAINED</td>
                            <td colSpan={7} className="border border-slate-900 py-0.5 text-left font-bold px-2.5">
                              {student?.classObtained || 'FIRST CLASS'}
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
                          {(student?.internalEvalResults || []).map((sub, sIdx) => (
                            <tr key={sIdx} className="h-5">
                              <td className="border border-slate-900 py-0.5 px-1">{sub.sem}</td>
                              <td className="border border-slate-900 py-0.5 px-1 font-bold font-mono">{sub.code}</td>
                              <td className="border border-slate-900 py-0.5 px-1.5 text-left">{sub.title}</td>
                              <td className="border border-slate-900 py-0.5 px-1 font-bold">{sub.cie1Marks}</td>
                              <td className="border border-slate-900 py-0.5 px-1 font-bold">{sub.passFail}</td>
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
              /* PAGE 2: ACKNOWLEDGEMENT FORM */
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
                        The Class Counsellor, Department of {student?.department || 'Computer Science and Engineering'} ,
                      </div>

                      <p className="text-xs mb-8 text-center">
                        Jeppiaar Institute of Technology, Kunnam, Sunguvarchatram, Sriperumbudur (T.K), Chennai - 631604.
                      </p>

                      <p className="text-xs leading-relaxed mb-10 text-justify">
                        Progress report of my Son / Daughter Name:{' '}
                        <span className="font-bold uppercase">
                          {showPlaceholders ? 'NAME OF THE STUDENT – Reg. REGNO' : `${student?.name} – Reg. ${student?.regNo}`}
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
        ))}

        {/* Dynamic Loading Indicator for continuous scroll */}
        {displayLimit < totalReports && (
          <div className="py-4 text-center text-xs font-bold text-slate-600 bg-white/80 px-6 py-2 rounded-full border border-slate-300 shadow-sm animate-pulse">
            Scroll down to view remaining {totalReports - displayLimit} student reports...
          </div>
        )}
      </div>

    </div>
  );
};
