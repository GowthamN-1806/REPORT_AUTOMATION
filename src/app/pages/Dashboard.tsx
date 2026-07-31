import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Header } from '../components/Header';
import { StatsGrid } from '../components/StatsGrid';
import { UploadSection } from '../components/UploadSection';
import { AcrobatDocumentViewer } from '../components/AcrobatDocumentViewer';
import { Footer } from '../components/Footer';
import { ProcessingModal } from '../components/ProcessingModal';
import { ToastContainer, ToastMessage } from '../components/Toast';
import { StudentRecord, UploadSummary, SystemStats } from '../types';
import { defaultSampleStudents } from '../data/sampleStudents';
import { parseExcelFile } from '../utils/excelParser';
import { downloadSampleExcel } from '../utils/excelGenerator';
import { generateCombinedWordDocument } from '../utils/docGenerator';
import { generateCombinedPDF } from '../utils/pdfGenerator';

export const Dashboard: React.FC = () => {
  // Persistence helpers
  const getInitialState = () => {
    const isDeleted = localStorage.getItem('jit_is_deleted') === 'true';
    if (isDeleted) {
      return {
        students: [],
        uploadedFile: null,
        summary: null,
        stats: {
          totalStudents: 0,
          reportsGenerated: 0,
          pdfPages: 0,
          department: '-',
          academicYear: '-',
          uploadStatus: 'Pending Upload',
        },
      };
    }

    const savedStudents = localStorage.getItem('jit_students');
    const savedFile = localStorage.getItem('jit_uploaded_file');
    const savedSummary = localStorage.getItem('jit_summary');
    const savedStats = localStorage.getItem('jit_stats');

    if (savedStudents && savedFile && savedSummary && savedStats) {
      try {
        return {
          students: JSON.parse(savedStudents),
          uploadedFile: JSON.parse(savedFile),
          summary: JSON.parse(savedSummary),
          stats: JSON.parse(savedStats),
        };
      } catch (e) {}
    }

    return {
      students: [],
      uploadedFile: null,
      summary: null,
      stats: {
        totalStudents: 0,
        reportsGenerated: 0,
        pdfPages: 0,
        department: '-',
        academicYear: '-',
        uploadStatus: 'Pending Upload',
      },
    };
  };

  const initial = getInitialState();

  const [students, setStudents] = useState<StudentRecord[]>(initial.students);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string } | null>(initial.uploadedFile);

  const [summary, setSummary] = useState<UploadSummary | null>(initial.summary);

  const [stats, setStats] = useState<SystemStats>(initial.stats);

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

  const processStudentRecords = async (newStudents: StudentRecord[], fileName: string, fileSizeStr: string) => {
    setIsProcessing(true);
    setTotalCount(newStudents.length);
    setProcessedCount(0);
    setProgressPercent(5);
    setStepMessage('Reading Excel file (.xlsx)...');

    await new Promise((r) => setTimeout(r, 400));
    setProgressPercent(25);
    setStepMessage('Validating student records & subjects...');

    await new Promise((r) => setTimeout(r, 300));
    setStepMessage('Populating PARENTS.docx template...');
    
    const total = newStudents.length;
    for (let i = 1; i <= total; i += Math.ceil(total / 5)) {
      const current = Math.min(i, total);
      setProcessedCount(current);
      const pct = 30 + Math.round((current / total) * 50);
      setProgressPercent(pct);
      setStepMessage(`Processing Student ${current} / ${total}...`);
      await new Promise((r) => setTimeout(r, 120));
    }

    setProgressPercent(90);
    setStepMessage('Merging reports into combined Word & PDF documents...');
    await new Promise((r) => setTimeout(r, 400));

    setProgressPercent(100);
    setStepMessage('Download Ready!');
    await new Promise((r) => setTimeout(r, 200));

    setIsProcessing(false);

    setStudents(newStudents);
    setCurrentPageIndex(0);
    const newFile = { name: fileName, size: fileSizeStr };
    setUploadedFile(newFile);

    const deptName = newStudents[0]?.department || 'Computer Science & Engg.';
    const acadYear = '2025 - 2026';
    const subCount = (newStudents[0]?.universityResults?.length || 0) + (newStudents[0]?.internalEvalResults?.length || 0);

    const newSummary: UploadSummary = {
      fileName,
      fileSize: fileSizeStr,
      department: deptName,
      academicYear: acadYear,
      totalStudents: newStudents.length,
      subjectsPerStudent: subCount,
      reportsCount: newStudents.length,
      templateUsed: 'PARENTS.docx',
      uploadedDate: new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
      status: 'Ready for Download',
    };

    const newStats: SystemStats = {
      totalStudents: newStudents.length,
      reportsGenerated: newStudents.length,
      pdfPages: newStudents.length,
      department: deptName,
      academicYear: acadYear,
      uploadStatus: 'Success',
    };

    setSummary(newSummary);
    setStats(newStats);

    // Persist to localStorage
    localStorage.setItem('jit_is_deleted', 'false');
    localStorage.setItem('jit_students', JSON.stringify(newStudents));
    localStorage.setItem('jit_uploaded_file', JSON.stringify(newFile));
    localStorage.setItem('jit_summary', JSON.stringify(newSummary));
    localStorage.setItem('jit_stats', JSON.stringify(newStats));

    addToast('success', 'Excel Uploaded Successfully', `Processed ${newStudents.length} student records automatically.`);

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 }
    });
  };

  const handleFileUpload = async (file: File) => {
    try {
      addToast('info', 'Reading Excel...', `Parsing ${file.name}`);
      const parsed = await parseExcelFile(file);
      if (parsed && parsed.length > 0) {
        const sizeStr = `${(file.size / 1024).toFixed(0)} KB`;
        await processStudentRecords(parsed, file.name, sizeStr);
      } else {
        addToast('error', 'Invalid Excel', 'No student records found in uploaded file.');
      }
    } catch (err: any) {
      addToast('error', 'Upload Failed', typeof err === 'string' ? err : err?.message || 'Failed to read Excel file.');
    }
  };

  const handleLoadSampleData = async () => {
    await processStudentRecords(defaultSampleStudents, 'CSE_III_YEAR_ALL_STUDENTS.xlsx', '125 KB');
  };

  const handleDownloadSampleTemplate = () => {
    downloadSampleExcel(defaultSampleStudents);
    addToast('success', 'Template Downloaded', 'Saved as JIT_PARENTS_Mark_Sheet_Template.xlsx');
  };

  const handleDeleteFile = () => {
    // Clear localStorage & mark as deleted
    localStorage.setItem('jit_is_deleted', 'true');
    localStorage.removeItem('jit_students');
    localStorage.removeItem('jit_uploaded_file');
    localStorage.removeItem('jit_summary');
    localStorage.removeItem('jit_stats');

    setUploadedFile(null);
    setSummary(null);
    setStudents([]);
    setStats({
      totalStudents: 0,
      reportsGenerated: 0,
      pdfPages: 0,
      department: '-',
      academicYear: '-',
      uploadStatus: 'Pending Upload',
    });
    addToast('info', 'File Removed', 'Upload state reset. Please upload an Excel file.');
  };

  const handleDownloadWord = async () => {
    if (!students || students.length === 0) {
      addToast('error', 'No Reports Found', 'Please upload an Excel file first.');
      return;
    }
    try {
      addToast('info', 'Word Download Started', `Generating Word (.docx) for ${students.length} student reports...`);
      await generateCombinedWordDocument(students);
      addToast('success', 'Word Document Ready', 'JEPPIAAR_IT_PARENTS_Mark_Reports_Combined.docx downloaded.');
    } catch (err: any) {
      addToast('error', 'Download Failed', 'Could not create Word document.');
    }
  };

  const handleDownloadPDF = async () => {
    if (!students || students.length === 0) {
      addToast('error', 'No Reports Found', 'Please upload an Excel file first.');
      return;
    }
    try {
      addToast('info', 'PDF Download Started', `Generating Adobe PDF (.pdf) for ${students.length} student reports...`);
      await generateCombinedPDF(students);
      addToast('success', 'PDF Document Ready', 'JEPPIAAR_IT_PARENTS_Mark_Reports_Combined.pdf downloaded.');
    } catch (err: any) {
      addToast('error', 'Download Failed', 'Could not generate PDF document.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FAFF] text-slate-800 pb-8 font-sans selection:bg-blue-500 selection:text-white">
      
      {/* Top Header */}
      <Header />

      {/* Top Statistics Bar (6 Cards Grid) */}
      <StatsGrid stats={stats} />

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-6 mb-8">
        {!uploadedFile ? (
          /* Centered Upload Section before Excel file is uploaded */
          <div className="max-w-xl mx-auto py-6">
            <UploadSection
              onFileUpload={handleFileUpload}
              onLoadSampleData={handleLoadSampleData}
              onDownloadSampleTemplate={handleDownloadSampleTemplate}
              onDeleteFile={handleDeleteFile}
              onDownloadWord={handleDownloadWord}
              onDownloadPDF={handleDownloadPDF}
              summary={summary}
              uploadedFile={uploadedFile}
              isProcessing={isProcessing}
            />
          </div>
        ) : (
          /* Split Screen Layout (35% Left / 65% Right) after Excel file is uploaded */
          <div className="flex flex-col lg:flex-row gap-6 items-stretch">
            {/* Step 1 & Step 3: Upload Excel File Column + Download Buttons (35% width) */}
            <div className="w-full lg:w-[35%] shrink-0">
              <UploadSection
                onFileUpload={handleFileUpload}
                onLoadSampleData={handleLoadSampleData}
                onDownloadSampleTemplate={handleDownloadSampleTemplate}
                onDeleteFile={handleDeleteFile}
                onDownloadWord={handleDownloadWord}
                onDownloadPDF={handleDownloadPDF}
                summary={summary}
                uploadedFile={uploadedFile}
                isProcessing={isProcessing}
              />
            </div>

            {/* Step 2: Report Template Preview Column (65% width) */}
            <div className="w-full lg:w-[65%] flex-1 min-w-0">
              <AcrobatDocumentViewer
                students={students}
                currentPageIndex={currentPageIndex}
                onPageChange={(idx) => setCurrentPageIndex(idx)}
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
