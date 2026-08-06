import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Header } from '../components/Header';
import { StatsGrid } from '../components/StatsGrid';
import { UploadSection } from '../components/UploadSection';
import { AcrobatDocumentViewer } from '../components/AcrobatDocumentViewer';
import { Footer } from '../components/Footer';
import { ProcessingModal } from '../components/ProcessingModal';
import { ToastContainer, ToastMessage } from '../components/Toast';
import { StudentRecord, UploadSummary, SystemStats, ResultPattern, UploadedFileSlotInfo } from '../types';
import { defaultSampleStudents } from '../data/sampleStudents';
import { parseExcelFile } from '../utils/excelParser';
import { downloadSampleExcel } from '../utils/excelGenerator';
import { generateCombinedWordDocument } from '../utils/docGenerator';
import { generateCombinedPDF } from '../utils/pdfGenerator';
import { mergeExcelDatasets, MergeEngineResult, getTemplateForPattern } from '../utils/excelMergeEngine';

export const Dashboard: React.FC = () => {
  // Pattern Selection State
  const [selectedPattern, setSelectedPattern] = useState<ResultPattern>('pattern1');

  // File Slots State
  const [fileSlots, setFileSlots] = useState<Record<string, UploadedFileSlotInfo>>({
    univ: {
      key: 'univ',
      label: 'University Result Excel',
      file: null,
      name: '',
      size: '',
      studentCount: 0,
      isValid: false,
      missingCount: 0,
      duplicateCount: 0,
      students: [],
    },
    cie1: {
      key: 'cie1',
      label: 'CIE 1 Excel',
      file: null,
      name: '',
      size: '',
      studentCount: 0,
      isValid: false,
      missingCount: 0,
      duplicateCount: 0,
      students: [],
    },
    cie2: {
      key: 'cie2',
      label: 'CIE 2 Excel',
      file: null,
      name: '',
      size: '',
      studentCount: 0,
      isValid: false,
      missingCount: 0,
      duplicateCount: 0,
      students: [],
    },
    model: {
      key: 'model',
      label: 'Model Exam Excel',
      file: null,
      name: '',
      size: '',
      studentCount: 0,
      isValid: false,
      missingCount: 0,
      duplicateCount: 0,
      students: [],
    },
  });

  // Merged Dataset State
  const [mergeResult, setMergeResult] = useState<MergeEngineResult | null>(null);
  const [mergedStudents, setMergedStudents] = useState<StudentRecord[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);

  const [summary, setSummary] = useState<UploadSummary | null>(null);
  const [stats, setStats] = useState<SystemStats>({
    totalStudents: 0,
    reportsGenerated: 0,
    pdfPages: 0,
    department: '-',
    academicYear: '-',
    uploadStatus: 'Pending Upload',
  });

  // Editable Regulation State
  const [regulation, setRegulation] = useState<string>(() => localStorage.getItem('jit_regulation') || '2021');

  const handleRegulationChange = (val: string) => {
    setRegulation(val);
    localStorage.setItem('jit_regulation', val);
  };

  // Processing Dialog State
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [stepMessage, setStepMessage] = useState<string>('Reading Excel file...');
  const [processedCount, setProcessedCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(512);
  const [progressPercent, setProgressPercent] = useState<number>(0);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    const newToast: ToastMessage = {
      id: `toast-${Date.now()}-${Math.random()}`,
      type,
      title,
      message,
    };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Upload File to Specific Slot
  const handleSlotFileUpload = async (slotKey: 'univ' | 'cie1' | 'cie2' | 'model', file: File) => {
    try {
      addToast('info', 'Reading Excel...', `Parsing ${file.name}`);
      const parsed = await parseExcelFile(file);

      if (parsed && parsed.length > 0) {
        const sizeStr = `${(file.size / 1024).toFixed(0)} KB`;

        const newSlotData = {
          ...fileSlots[slotKey],
          file,
          name: file.name,
          size: sizeStr,
          studentCount: parsed.length,
          isValid: true,
          students: parsed,
        };

        const updatedSlots = {
          ...fileSlots,
          [slotKey]: newSlotData,
        };

        setFileSlots(updatedSlots);

        // Instantly run merge engine so live preview updates immediately upon uploading
        const univList = updatedSlots.univ.students;
        const cie1List = updatedSlots.cie1.students;
        const cie2List = updatedSlots.cie2.students;
        const modelList = updatedSlots.model.students;

        const res = mergeExcelDatasets(selectedPattern, univList, cie1List, cie2List, modelList);
        setMergeResult(res);
        setMergedStudents(res.mergedStudents);
        setCurrentPageIndex(0);

        const deptName = res.mergedStudents[0]?.department || 'Computer Science & Engg.';
        const acadYear = '2025 - 2026';
        const subCount = (res.mergedStudents[0]?.universityResults?.length || 0) + (res.mergedStudents[0]?.internalEvalResults?.length || 0);

        setSummary({
          fileName: file.name,
          fileSize: sizeStr,
          department: deptName,
          academicYear: acadYear,
          totalStudents: res.mergedStudents.length,
          subjectsPerStudent: subCount,
          reportsCount: res.mergedStudents.length,
          templateUsed: res.templateFile,
          uploadedDate: new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
          status: 'Ready for Download',
        });

        setStats({
          totalStudents: res.mergedStudents.length,
          reportsGenerated: res.mergedStudents.length,
          pdfPages: res.mergedStudents.length * 2,
          department: deptName,
          academicYear: acadYear,
          uploadStatus: 'Success',
        });

        addToast('success', 'File Uploaded & Preview Updated', `${file.name} parsed (${parsed.length} Students). Report preview loaded.`);
      } else {
        addToast('error', 'Invalid Excel', 'No student records found in uploaded file.');
      }
    } catch (err: any) {
      addToast('error', 'Upload Failed', typeof err === 'string' ? err : err?.message || 'Failed to read Excel file.');
    }
  };

  // Remove File from Slot
  const handleSlotFileRemove = (slotKey: 'univ' | 'cie1' | 'cie2' | 'model') => {
    setFileSlots((prev) => ({
      ...prev,
      [slotKey]: {
        ...prev[slotKey],
        file: null,
        name: '',
        size: '',
        studentCount: 0,
        isValid: false,
        students: [],
      },
    }));
    setMergeResult(null);
    setMergedStudents([]);
    setSummary(null);
    addToast('info', 'File Removed', `Cleared ${slotKey.toUpperCase()} Excel slot.`);
  };

  // Run Excel Merge Engine
  const handleRunMerge = async () => {
    setIsProcessing(true);
    setStepMessage('Initializing Excel Merge Engine...');
    setProgressPercent(10);

    await new Promise((r) => setTimeout(r, 300));
    setProgressPercent(40);
    setStepMessage('Matching student records by Register Number...');

    const univList = fileSlots.univ.students;
    const cie1List = fileSlots.cie1.students;
    const cie2List = fileSlots.cie2.students;
    const modelList = fileSlots.model.students;

    const res = mergeExcelDatasets(selectedPattern, univList, cie1List, cie2List, modelList);

    await new Promise((r) => setTimeout(r, 400));
    setProgressPercent(80);
    setStepMessage(`Selecting Template ${res.templateFile}...`);

    await new Promise((r) => setTimeout(r, 200));
    setProgressPercent(100);
    setIsProcessing(false);

    setMergeResult(res);
    setMergedStudents(res.mergedStudents);
    setCurrentPageIndex(0);

    const deptName = res.mergedStudents[0]?.department || 'Computer Science & Engg.';
    const acadYear = '2025 - 2026';
    const subCount = (res.mergedStudents[0]?.universityResults?.length || 0) + (res.mergedStudents[0]?.internalEvalResults?.length || 0);

    setSummary({
      fileName: fileSlots.univ.name || 'Merged_Results.xlsx',
      fileSize: fileSlots.univ.size || '120 KB',
      department: deptName,
      academicYear: acadYear,
      totalStudents: res.mergedStudents.length,
      subjectsPerStudent: subCount,
      reportsCount: res.mergedStudents.length,
      templateUsed: res.templateFile,
      uploadedDate: new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
      status: 'Ready for Download',
    });

    setStats({
      totalStudents: res.mergedStudents.length,
      reportsGenerated: res.mergedStudents.length,
      pdfPages: res.mergedStudents.length * 2,
      department: deptName,
      academicYear: acadYear,
      uploadStatus: 'Success',
    });

    addToast('success', 'Excel Files Merged!', `Unified ${res.mergedStudents.length} student records into template ${res.templateFile}.`);

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
    });
  };

  // Load Demo Data
  const handleLoadSampleData = () => {
    setFileSlots((prev) => ({
      ...prev,
      univ: {
        ...prev.univ,
        file: new File([], 'CSE_III_YEAR_UNIV_RESULTS.xlsx'),
        name: 'CSE_III_YEAR_UNIV_RESULTS.xlsx',
        size: '125 KB',
        studentCount: defaultSampleStudents.length,
        isValid: true,
        students: defaultSampleStudents,
      },
      cie1: {
        ...prev.cie1,
        file: new File([], 'CSE_III_YEAR_CIE1_MARKS.xlsx'),
        name: 'CSE_III_YEAR_CIE1_MARKS.xlsx',
        size: '98 KB',
        studentCount: defaultSampleStudents.length,
        isValid: true,
        students: defaultSampleStudents,
      },
    }));

    addToast('success', 'Demo Data Loaded', 'Loaded University & CIE 1 sample datasets.');
  };

  // Download Sample Template
  const handleDownloadSampleTemplate = () => {
    downloadSampleExcel(defaultSampleStudents);
    addToast('success', 'Template Downloaded', 'Saved as JIT_PARENTS_Mark_Sheet_Template.xlsx');
  };

  // In-Memory Edit Student Handler
  const handleUpdateStudent = (updatedStudent: StudentRecord) => {
    setMergedStudents((prev) =>
      prev.map((s) => (s.id === updatedStudent.id || s.regNo === updatedStudent.regNo ? updatedStudent : s))
    );
    addToast('success', 'Student Updated', `Saved in-memory changes for ${updatedStudent.name} (${updatedStudent.regNo}).`);
  };

  // Document Generation Handler
  const handleGenerateDocuments = async () => {
    if (!mergedStudents || mergedStudents.length === 0) {
      addToast('error', 'No Merged Data', 'Please merge Excel files first.');
      return;
    }

    setIsProcessing(true);
    setTotalCount(mergedStudents.length);
    setProcessedCount(0);
    setProgressPercent(10);
    setStepMessage(`Loading template ${mergeResult?.templateFile || getTemplateForPattern(selectedPattern)}...`);

    const total = mergedStudents.length;
    for (let i = 1; i <= total; i += Math.ceil(total / 5)) {
      const current = Math.min(i, total);
      setProcessedCount(current);
      const pct = 20 + Math.round((current / total) * 70);
      setProgressPercent(pct);
      setStepMessage(`Generating Result Letters for Student ${current} / ${total}...`);
      await new Promise((r) => setTimeout(r, 100));
    }

    setProgressPercent(100);
    setStepMessage('Result Letters Generated!');
    await new Promise((r) => setTimeout(r, 200));

    setIsProcessing(false);
    addToast('success', 'Generation Complete', `Generated result letters for ${mergedStudents.length} students.`);
  };

  // Download Word
  const handleDownloadWord = async () => {
    if (!mergedStudents || mergedStudents.length === 0) {
      addToast('error', 'No Merged Reports', 'Please merge Excel files first.');
      return;
    }
    try {
      addToast('info', 'Word Download Started', `Generating Word (.docx) for ${mergedStudents.length} student reports...`);
      await generateCombinedWordDocument(mergedStudents, regulation);
      addToast('success', 'Word Document Ready', `JEPPIAAR_IT_Mark_Reports_${selectedPattern.toUpperCase()}.docx downloaded.`);
    } catch (err: any) {
      addToast('error', 'Download Failed', 'Could not create Word document.');
    }
  };

  // Download PDF
  const handleDownloadPDF = async () => {
    if (!mergedStudents || mergedStudents.length === 0) {
      addToast('error', 'No Merged Reports', 'Please merge Excel files first.');
      return;
    }
    try {
      addToast('info', 'PDF Download Started', `Generating PDF (.pdf) for ${mergedStudents.length} student reports...`);
      await generateCombinedPDF(mergedStudents, null, undefined, regulation);
      addToast('success', 'PDF Document Ready', `JEPPIAAR_IT_Mark_Reports_${selectedPattern.toUpperCase()}.pdf downloaded.`);
    } catch (err: any) {
      addToast('error', 'Download Failed', 'Could not generate PDF document.');
    }
  };

  const isMergedReady = mergeResult && mergeResult.isReadyForPreview && mergedStudents.length > 0;

  return (
    <div className="min-h-screen bg-[#F7FAFF] text-slate-800 pb-8 font-sans selection:bg-blue-500 selection:text-white">
      
      {/* Top Header */}
      <Header />

      {/* Top Statistics Bar (4 Cards Grid) */}
      <StatsGrid stats={stats} />

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-6 mb-8">
        {!isMergedReady ? (
          /* Centered Upload Section before Excel files are merged */
          <div className="max-w-4xl mx-auto py-4">
            <UploadSection
              selectedPattern={selectedPattern}
              onPatternSelect={(pat) => {
                setSelectedPattern(pat);
                setMergeResult(null);
              }}
              fileSlots={fileSlots}
              onFileUploadToSlot={handleSlotFileUpload}
              onRemoveSlotFile={handleSlotFileRemove}
              onLoadSampleData={handleLoadSampleData}
              onDownloadSampleTemplate={handleDownloadSampleTemplate}
              onRunMerge={handleRunMerge}
              onGenerateDocuments={handleGenerateDocuments}
              onDownloadWord={handleDownloadWord}
              onDownloadPDF={handleDownloadPDF}
              mergeResult={mergeResult}
              isProcessing={isProcessing}
              regulation={regulation}
              onRegulationChange={handleRegulationChange}
            />
          </div>
        ) : (
          /* Split Screen Layout (35% Left / 65% Right) after Excel files are merged */
          <div className="flex flex-col lg:flex-row gap-6 items-stretch">
            {/* Left Controls & File Upload Slots Column (35% width) */}
            <div className="w-full lg:w-[35%] shrink-0">
              <UploadSection
                selectedPattern={selectedPattern}
                onPatternSelect={(pat) => {
                  setSelectedPattern(pat);
                  setMergeResult(null);
                }}
                fileSlots={fileSlots}
                onFileUploadToSlot={handleSlotFileUpload}
                onRemoveSlotFile={handleSlotFileRemove}
                onLoadSampleData={handleLoadSampleData}
                onDownloadSampleTemplate={handleDownloadSampleTemplate}
                onRunMerge={handleRunMerge}
                onGenerateDocuments={handleGenerateDocuments}
                onDownloadWord={handleDownloadWord}
                onDownloadPDF={handleDownloadPDF}
                mergeResult={mergeResult}
                isProcessing={isProcessing}
                regulation={regulation}
                onRegulationChange={handleRegulationChange}
              />
            </div>

            {/* Right Live Preview & Student Record Editor Column (65% width) */}
            <div className="w-full lg:w-[65%] flex-1 min-w-0">
              <AcrobatDocumentViewer
                students={mergedStudents}
                currentPageIndex={currentPageIndex}
                onPageChange={(idx) => setCurrentPageIndex(idx)}
                regulation={regulation}
                onUpdateStudent={handleUpdateStudent}
                activeTemplate={mergeResult?.templateFile || getTemplateForPattern(selectedPattern)}
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Processing Modal Dialog */}
      <ProcessingModal
        isOpen={isProcessing}
        stepMessage={stepMessage}
        processedCount={processedCount}
        totalCount={totalCount}
        progressPercent={progressPercent}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

    </div>
  );
};
