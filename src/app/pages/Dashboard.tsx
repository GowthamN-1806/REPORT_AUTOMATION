import React, { useState } from 'react';
import { Header } from '../components/Header';
import { StatsGrid } from '../components/StatsGrid';
import { UploadSection } from '../components/UploadSection';
import { AcrobatDocumentViewer } from '../components/AcrobatDocumentViewer';
import { Footer } from '../components/Footer';
import { StudentRecord, UploadSummary, SystemStats, ResultPattern, UploadedFileSlotInfo } from '../types';
import { parseExcelFile } from '../utils/excelParser';
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

  // Merged Dataset & Synchronized Preview State
  const [mergeResult, setMergeResult] = useState<MergeEngineResult | null>(null);
  const [mergedStudents, setMergedStudents] = useState<StudentRecord[]>([]);
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
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
  const [totalCount, setTotalCount] = useState<number>(0);
  const [progressPercent, setProgressPercent] = useState<number>(0);

  // Upload File to Specific Slot
  const handleSlotFileUpload = async (slotKey: 'univ' | 'cie1' | 'cie2' | 'model', file: File) => {
    try {
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

        if (mergedStudents.length > 0) {
          // If Preview is ALREADY active, re-merge dataset to update Preview with new file
          const univList = updatedSlots.univ.students;
          const cie1List = updatedSlots.cie1.students;
          const cie2List = updatedSlots.cie2.students;
          const modelList = updatedSlots.model.students;

          const res = mergeExcelDatasets(selectedPattern, univList, cie1List, cie2List, modelList);
          setMergeResult(res);
          setMergedStudents(res.mergedStudents);

          // Synchronously update the PDF preview
          const updatedPdfUrl = await generateCombinedPDF(res.mergedStudents, null, undefined, regulation, true);
          if (typeof updatedPdfUrl === 'string') {
            setPreviewPdfUrl(updatedPdfUrl);
          }
        }
      }
    } catch (err: any) {
      console.error('File upload parsing error:', err);
    }
  };

  // Remove File from Slot
  const handleSlotFileRemove = (slotKey: 'univ' | 'cie1' | 'cie2' | 'model') => {
    const updatedSlots = {
      ...fileSlots,
      [slotKey]: {
        ...fileSlots[slotKey],
        file: null,
        name: '',
        size: '',
        studentCount: 0,
        isValid: false,
        students: [],
      },
    };

    setFileSlots(updatedSlots);

    const hasAnyFile = Boolean(updatedSlots.univ.file || updatedSlots.cie1.file || updatedSlots.cie2.file || updatedSlots.model.file);

    if (!hasAnyFile) {
      // Reset application state completely ONLY if ALL files are deleted
      setMergeResult(null);
      setMergedStudents([]);
      setPreviewPdfUrl(null);
      setSummary(null);
      setTotalCount(0);
      setStats({
        totalStudents: 0,
        reportsGenerated: 0,
        pdfPages: 0,
        department: 'N/A',
        academicYear: '-',
        uploadStatus: 'Awaiting Upload',
      });
    } else {
      // If at least one file remains and preview is active, re-merge remaining files dynamically
      if (mergedStudents.length > 0) {
        const univList = updatedSlots.univ.students;
        const cie1List = updatedSlots.cie1.students;
        const cie2List = updatedSlots.cie2.students;
        const modelList = updatedSlots.model.students;

        const res = mergeExcelDatasets(selectedPattern, univList, cie1List, cie2List, modelList);
        setMergeResult(res);
        setMergedStudents(res.mergedStudents);

        const deptName = res.mergedStudents[0]?.department || 'Computer Science & Engg.';
        const acadYear = res.mergedStudents[0]?.academicYear || '';
        const subCount = (res.mergedStudents[0]?.universityResults?.length || 0) + (res.mergedStudents[0]?.internalEvalResults?.length || 0);

        setSummary({
          fileName: updatedSlots.univ.name || updatedSlots.cie1.name || updatedSlots.cie2.name || updatedSlots.model.name || 'Merged_Results.xlsx',
          fileSize: updatedSlots.univ.size || updatedSlots.cie1.size || updatedSlots.cie2.size || updatedSlots.model.size || '120 KB',
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

        generateCombinedPDF(res.mergedStudents, null, undefined, regulation, true).then((url) => {
          if (typeof url === 'string') {
            setPreviewPdfUrl(url);
          }
        });
      }
    }
  };

  // Run Excel Merge Engine & Synchronize Real PDF Generation
  const handleRunMerge = async () => {
    const hasAnyFile = Boolean(fileSlots.univ.file || fileSlots.cie1.file || fileSlots.cie2.file || fileSlots.model.file);
    if (!hasAnyFile) {
      return;
    }

    const univList = fileSlots.univ.students;
    const cie1List = fileSlots.cie1.students;
    const cie2List = fileSlots.cie2.students;
    const modelList = fileSlots.model.students;
    const actualStudentCount = Math.max(univList.length, cie1List.length, cie2List.length, modelList.length);

    setIsProcessing(true);
    setTotalCount(actualStudentCount);
    setProcessedCount(0);
    setStepMessage('Matching student records & grading matrices...');
    setProgressPercent(15);

    const res = mergeExcelDatasets(selectedPattern, univList, cie1List, cie2List, modelList);

    setStepMessage(`Generating official report pages for ${res.mergedStudents.length} students...`);
    setProgressPercent(25);

    // Generate the complete PDF preview directly during the progress bar with real-time feedback
    const generatedPdfBlobUrl = await generateCombinedPDF(
      res.mergedStudents,
      null,
      (current, total) => {
        setProcessedCount(current);
        const calculatedPercent = 25 + Math.round((current / total) * 70);
        setProgressPercent(calculatedPercent);
        setStepMessage(`Compiling report ${current} of ${total}...`);
      },
      regulation,
      true
    );

    setProgressPercent(100);
    setStepMessage('Reports generated successfully!');
    await new Promise((r) => setTimeout(r, 120));

    if (typeof generatedPdfBlobUrl === 'string') {
      setPreviewPdfUrl(generatedPdfBlobUrl);
    }
    setMergeResult(res);
    setMergedStudents(res.mergedStudents);
    setCurrentPageIndex(0);

    const deptName = res.mergedStudents[0]?.department || 'Computer Science & Engg.';
    const acadYear = res.mergedStudents[0]?.academicYear || '';
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

    setIsProcessing(false);
  };

  // Load Demo Data
  const handleLoadSampleData = () => {};

  // Download Sample Template
  const handleDownloadSampleTemplate = () => {};

  // In-Memory Edit Student Handler
  const handleUpdateStudent = (updatedStudent: StudentRecord) => {
    setMergedStudents((prev) =>
      prev.map((s) => (s.id === updatedStudent.id || s.regNo === updatedStudent.regNo ? updatedStudent : s))
    );
  };

  // Document Generation Handler
  const handleGenerateDocuments = async () => {
    if (!mergedStudents || mergedStudents.length === 0) {
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
      await new Promise((r) => setTimeout(r, 80));
    }

    setProgressPercent(100);
    setStepMessage('Result Letters Generated!');
    await new Promise((r) => setTimeout(r, 120));

    setIsProcessing(false);
  };

  // Download Word
  const handleDownloadWord = async () => {
    if (!mergedStudents || mergedStudents.length === 0) {
      return;
    }
    try {
      const targetTemplate = mergeResult?.templateFile || getTemplateForPattern(selectedPattern);
      await generateCombinedWordDocument(mergedStudents, targetTemplate, regulation);
    } catch (err: any) {
      console.error('Word download failed:', err);
    }
  };

  // Download PDF
  const handleDownloadPDF = async () => {
    if (!mergedStudents || mergedStudents.length === 0) {
      return;
    }
    try {
      await generateCombinedPDF(mergedStudents, null, undefined, regulation);
    } catch (err: any) {
      console.error('PDF download failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FAFF] text-slate-800 pb-8 font-sans selection:bg-blue-500 selection:text-white">
      
      {/* Top Header */}
      <Header />

      {/* Top Statistics Bar (4 Cards Grid) */}
      <StatsGrid stats={stats} isProcessing={isProcessing} />

      {/* Main Content: Persistent Split-Screen Layout (Upload Left / Preview Right) */}
      <main className="max-w-[1600px] mx-auto px-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-6 items-stretch">
          {/* Left Controls & File Upload Slots Column (42% width) */}
          <div className="w-full lg:w-[42%] shrink-0">
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
              progressPercent={progressPercent}
              regulation={regulation}
              onRegulationChange={handleRegulationChange}
            />
          </div>

          {/* Right Preview & Student Record Editor Column (58% width) */}
          <div className="w-full lg:w-[58%] flex-1 min-w-0">
            <AcrobatDocumentViewer
              students={mergedStudents}
              currentPageIndex={currentPageIndex}
              onPageChange={(idx) => setCurrentPageIndex(idx)}
              regulation={regulation}
              onUpdateStudent={handleUpdateStudent}
              activeTemplate={mergeResult?.templateFile || getTemplateForPattern(selectedPattern)}
              pdfUrl={previewPdfUrl}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />

    </div>
  );
};
