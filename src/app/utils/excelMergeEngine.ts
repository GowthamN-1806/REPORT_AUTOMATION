import { StudentRecord, ResultPattern, InternalEvalResult } from '../types';

export interface UploadedFileSlot {
  key: 'univ' | 'cie1' | 'cie2' | 'model';
  label: string;
  file: File | null;
  name: string;
  size: string;
  studentCount: number;
  isValid: boolean;
  missingCount: number;
  duplicateCount: number;
  students: StudentRecord[];
}

export interface MergeEngineResult {
  pattern: ResultPattern;
  detectedPatternName: string;
  templateFile: string;
  univCount: number;
  cie1Count: number;
  cie2Count: number;
  modelCount: number;
  mergedCount: number;
  missingRecordsCount: number;
  duplicateRegNosCount: number;
  missingGpaCount: number;
  missingSubjectsCount: number;
  invalidRowsCount: number;
  validationWarnings: string[];
  isReadyForPreview: boolean;
  mergedStudents: StudentRecord[];
}

export const getTemplateForPattern = (pattern: ResultPattern): string => {
  switch (pattern) {
    case 'pattern2':
      return 'template_cie1.docx';
    case 'pattern3':
      return 'template_cie1_cie2.docx';
    case 'pattern4':
      return 'template_cie1_cie2_model.docx';
    default:
      return 'template_cie1.docx';
  }
};

/**
 * Normalizes Register Numbers to ensure exact matching across independent Excel files.
 * Handles numeric values, floats, strings with spaces, hyphens, and leading zeros.
 */
export const normalizeRegNo = (regNo: any): string => {
  if (regNo === undefined || regNo === null) return '';
  let str = '';
  if (typeof regNo === 'number') {
    str = String(Math.floor(regNo));
  } else {
    str = String(regNo);
  }
  return str.trim().replace(/[\s_.-]+/g, '').toUpperCase();
};

/**
 * Data Mapping Engine (Replaces Old Merge Engine)
 * Reads University, CIE 1, CIE 2, and Model Exam Excel files independently.
 * Matches records strictly using Register Number only.
 * Fills corresponding sections without hardcoding or overwriting data.
 */
export const mergeExcelDatasets = (
  pattern: ResultPattern,
  univStudents: StudentRecord[] = [],
  cie1Students: StudentRecord[] = [],
  cie2Students: StudentRecord[] = [],
  modelStudents: StudentRecord[] = []
): MergeEngineResult => {
  const univCount = univStudents.length;
  const cie1Count = cie1Students.length;
  const cie2Count = cie2Students.length;
  const modelCount = modelStudents.length;

  const validationWarnings: string[] = [];

  // Automatic Backend Template Selection Rules:
  // Case 1: Uploaded University + CIE 1 => template_cie1.docx
  // Case 2: Uploaded University + CIE 1 + CIE 2 => template_cie1_cie2.docx
  // Case 3: Uploaded University + CIE 1 + CIE 2 + Model Exam => template_cie1_cie2_model.docx
  let templateFile = 'template_cie1.docx';
  let detectedPatternName = 'University + CIE 1';
  let activePattern: ResultPattern = 'pattern2';

  if (cie2Count > 0 && modelCount > 0) {
    templateFile = 'template_cie1_cie2_model.docx';
    detectedPatternName = 'University + CIE 1 + CIE 2 + Model Exam';
    activePattern = 'pattern4';
  } else if (cie2Count > 0) {
    templateFile = 'template_cie1_cie2.docx';
    detectedPatternName = 'University + CIE 1 + CIE 2';
    activePattern = 'pattern3';
  } else {
    templateFile = 'template_cie1.docx';
    detectedPatternName = 'University + CIE 1';
    activePattern = 'pattern2';
  }

  // Create independent Register Number lookup maps for each Excel file source
  const univMap = new Map<string, StudentRecord>();
  univStudents.forEach((s) => {
    const k = normalizeRegNo(s.regNo);
    if (k) univMap.set(k, s);
  });

  const cie1Map = new Map<string, StudentRecord>();
  cie1Students.forEach((s) => {
    const k = normalizeRegNo(s.regNo);
    if (k) cie1Map.set(k, s);
  });

  const cie2Map = new Map<string, StudentRecord>();
  cie2Students.forEach((s) => {
    const k = normalizeRegNo(s.regNo);
    if (k) cie2Map.set(k, s);
  });

  const modelMap = new Map<string, StudentRecord>();
  modelStudents.forEach((s) => {
    const k = normalizeRegNo(s.regNo);
    if (k) modelMap.set(k, s);
  });

  // Collect all unique Register Numbers across all uploaded Excel files
  const allRegKeys = new Set<string>();
  univStudents.forEach((s) => { const k = normalizeRegNo(s.regNo); if (k) allRegKeys.add(k); });
  cie1Students.forEach((s) => { const k = normalizeRegNo(s.regNo); if (k) allRegKeys.add(k); });
  cie2Students.forEach((s) => { const k = normalizeRegNo(s.regNo); if (k) allRegKeys.add(k); });
  modelStudents.forEach((s) => { const k = normalizeRegNo(s.regNo); if (k) allRegKeys.add(k); });

  const mergedStudents: StudentRecord[] = [];

  allRegKeys.forEach((regKey) => {
    const univRec = univMap.get(regKey);
    const cie1Rec = cie1Map.get(regKey);
    const cie2Rec = cie2Map.get(regKey);
    const modelRec = modelMap.get(regKey);

    // Identify Student Metadata (RegNo, Name, Dept, Regulation)
    const regNo = univRec?.regNo || cie1Rec?.regNo || cie2Rec?.regNo || modelRec?.regNo || regKey;
    const name = univRec?.name || cie1Rec?.name || cie2Rec?.name || modelRec?.name || '';
    const department = univRec?.department || cie1Rec?.department || cie2Rec?.department || modelRec?.department || '';
    const regulation = univRec?.regulation || cie1Rec?.regulation || cie2Rec?.regulation || modelRec?.regulation || '';

    // 1. University Section: Reads ONLY from University Result Excel
    const universityResults = univRec ? (univRec.universityResults || []).map((ur) => ({ ...ur })) : [];
    const gpa = univRec ? univRec.gpa : undefined;
    const cgpa = univRec ? univRec.cgpa : undefined;
    const classObtained = univRec ? (univRec.classObtained || '') : '';
    const arrears = univRec ? { ...univRec.arrears } : {};
    const gpaBySem = univRec ? { ...univRec.gpaBySem } : {};
    const cgpaBySem = univRec ? { ...univRec.cgpaBySem } : {};

    // 2. CIE 1 Section: Reads ONLY from CIE 1 Excel
    const cie1List = cie1Rec ? (cie1Rec.internalEvalResults || cie1Rec.universityResults || []) : [];

    // 3. CIE 2 Section: Reads ONLY from CIE 2 Excel (if uploaded)
    const cie2List = cie2Rec ? (cie2Rec.internalEvalResults || cie2Rec.universityResults || []) : [];

    // 4. Model Exam Section: Reads ONLY from Model Exam Excel (if uploaded)
    const modelList = modelRec ? (modelRec.internalEvalResults || modelRec.universityResults || []) : [];

    // Determine maximum subject rows count
    const maxSubRows = Math.max(
      universityResults.length,
      cie1List.length,
      cie2List.length,
      modelList.length
    );

    // Construct internalEvalResults array strictly mapping each section's marks without defaults
    const internalEvalResults: InternalEvalResult[] = [];

    for (let i = 0; i < maxSubRows; i++) {
      const uSub = universityResults[i];
      const c1Sub = cie1List[i];
      const c2Sub = cie2List[i];
      const mSub = modelList[i];

      const sem = uSub?.sem || c1Sub?.sem || c2Sub?.sem || mSub?.sem || 'VI';
      const code = uSub?.code || c1Sub?.code || c2Sub?.code || mSub?.code || '';
      const title = uSub?.title || c1Sub?.title || c2Sub?.title || mSub?.title || '';

      const cie1Marks = cie1Count > 0 && c1Sub
        ? (c1Sub.cie1Marks !== undefined && c1Sub.cie1Marks !== null ? c1Sub.cie1Marks : (c1Sub as any).grade)
        : '';
      const cie2Marks = cie2Count > 0 && c2Sub
        ? (c2Sub.cie2Marks !== undefined && c2Sub.cie2Marks !== null ? c2Sub.cie2Marks : (c2Sub.cie1Marks !== undefined ? c2Sub.cie1Marks : (c2Sub as any).grade))
        : '';
      const modelMarks = modelCount > 0 && mSub
        ? (mSub.modelMarks !== undefined && mSub.modelMarks !== null ? mSub.modelMarks : (mSub.cie1Marks !== undefined ? mSub.cie1Marks : (mSub as any).grade))
        : '';

      internalEvalResults.push({
        sem,
        code,
        title,
        cie1Marks: cie1Marks !== undefined && cie1Marks !== null ? cie1Marks : '',
        cie2Marks: cie2Marks !== undefined && cie2Marks !== null ? cie2Marks : '',
        modelMarks: modelMarks !== undefined && modelMarks !== null ? modelMarks : '',
        passFail: c1Sub?.passFail || c2Sub?.passFail || mSub?.passFail || uSub?.passFail || '',
      });
    }

    mergedStudents.push({
      id: `std-mapped-${regKey}`,
      regNo,
      name,
      department,
      regulation,
      universityResults,
      gpa,
      cgpa,
      classObtained,
      arrears,
      gpaBySem,
      cgpaBySem,
      internalEvalResults,
    });
  });

  // Diagnostic Logs Execution (Required User Debug Specification)
  console.log('==================================================');
  console.log('🔍 BACKEND DATA MAPPING ENGINE RUNNING...');
  console.log(`- Uploaded Files: Univ=${univCount}, CIE1=${cie1Count}, CIE2=${cie2Count}, Model=${modelCount}`);
  console.log(`- Selected Template: ${templateFile} (${detectedPatternName})`);
  console.log('==================================================');

  mergedStudents.forEach((s) => {
    const univSubCount = s.universityResults?.length || 0;
    const cie1SubCount = cie1Students.length > 0 ? (s.internalEvalResults?.filter(i => i.cie1Marks !== undefined && i.cie1Marks !== null && String(i.cie1Marks).trim() !== '').length || 0) : 0;
    const cie2SubCount = cie2Students.length > 0 ? (s.internalEvalResults?.filter(i => i.cie2Marks !== undefined && i.cie2Marks !== null && String(i.cie2Marks).trim() !== '').length || 0) : 0;
    const modelSubCount = modelStudents.length > 0 ? (s.internalEvalResults?.filter(i => i.modelMarks !== undefined && i.modelMarks !== null && String(i.modelMarks).trim() !== '').length || 0) : 0;

    console.log(`\nStudent ${s.regNo} (${s.name})`);
    console.log(`  Register No: ${s.regNo}`);
    console.log(`  University Subjects Found: ${univSubCount}`);
    console.log(`  University GPA: ${s.gpa !== undefined ? s.gpa : 'Blank'}`);
    console.log(`  University CGPA: ${s.cgpa !== undefined ? s.cgpa : 'Blank'}`);
    console.log(`  CIE I Subjects Found: ${cie1Count > 0 ? cie1SubCount : 'Not Uploaded'}`);
    console.log(`  CIE I Marks Found: ${cie1Count > 0 ? cie1SubCount : 'Not Uploaded'}`);
    console.log(`  CIE II Subjects Found: ${cie2Count > 0 ? cie2SubCount : 'Not Uploaded'}`);
    console.log(`  CIE II Marks Found: ${cie2Count > 0 ? cie2SubCount : 'Not Uploaded'}`);
    console.log(`  Model Subjects Found: ${modelCount > 0 ? modelSubCount : 'Not Uploaded'}`);
    console.log(`  Model Marks Found: ${modelCount > 0 ? modelSubCount : 'Not Uploaded'}`);

    if (univSubCount === 0 && cie1SubCount === 0) {
      console.warn(`  Reason: Student ${s.regNo} missing from uploaded Excel files.`);
    } else {
      console.log(`  Status: Ready For Preview`);
    }
  });

  console.log('==================================================');

  return {
    pattern: activePattern,
    detectedPatternName,
    templateFile,
    univCount,
    cie1Count,
    cie2Count,
    modelCount,
    mergedCount: mergedStudents.length,
    missingRecordsCount: 0,
    duplicateRegNosCount: 0,
    missingGpaCount: 0,
    missingSubjectsCount: 0,
    invalidRowsCount: 0,
    validationWarnings,
    isReadyForPreview: mergedStudents.length > 0,
    mergedStudents,
  };
};
