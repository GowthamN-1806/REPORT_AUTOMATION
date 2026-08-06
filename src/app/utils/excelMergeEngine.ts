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

const normalizeRegNo = (regNo: string): string => {
  return String(regNo || '').trim().replace(/[\s_.-]+/g, '').toUpperCase();
};

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

  // Backend Automatic Template Selection Rules:
  // Rule 1: University + CIE 1 => template_cie1.docx
  // Rule 2: University + CIE 1 + CIE 2 => template_cie1_cie2.docx
  // Rule 3: University + CIE 1 + CIE 2 + Model Exam => template_cie1_cie2_model.docx
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

  // Master map of merged students keyed strictly by normalizeRegNo(regNo)
  const mergedStudentsMap = new Map<string, StudentRecord>();
  let duplicateRegNosCount = 0;
  let missingGpaCount = 0;
  let missingSubjectsCount = 0;

  const getOrCreateStudent = (regNo: string, rawName: string): StudentRecord => {
    const key = normalizeRegNo(regNo);
    if (!mergedStudentsMap.has(key)) {
      mergedStudentsMap.set(key, {
        id: `std-merged-${key}`,
        regNo: String(regNo || '').trim(),
        name: String(rawName || '').trim().toUpperCase(),
        department: '',
        regulation: '',
        universityResults: [],
        internalEvalResults: [],
        gpaBySem: {},
        cgpaBySem: {},
        arrears: {},
      });
    }
    return mergedStudentsMap.get(key)!;
  };

  // 1. Populate University Result Excel data (Semester Results section only)
  univStudents.forEach((u) => {
    const key = normalizeRegNo(u.regNo);
    if (!key) return;

    if (mergedStudentsMap.has(key)) {
      duplicateRegNosCount++;
      validationWarnings.push(`Duplicate Register Number in University file: ${u.regNo} (${u.name})`);
    }

    const student = getOrCreateStudent(u.regNo, u.name);
    if (u.name) student.name = u.name.toUpperCase();
    if (u.department) student.department = u.department;
    if (u.regulation) student.regulation = u.regulation;

    student.gpa = u.gpa;
    student.cgpa = u.cgpa;
    student.classObtained = u.classObtained;
    student.gpaBySem = u.gpaBySem || {};
    student.cgpaBySem = u.cgpaBySem || {};
    student.arrears = u.arrears || {};
    student.universityResults = (u.universityResults || []).map((ur) => ({ ...ur }));
  });

  // 2. Populate CIE 1 Excel data (CIE I section only)
  cie1Students.forEach((c1) => {
    const key = normalizeRegNo(c1.regNo);
    if (!key) return;

    const student = getOrCreateStudent(c1.regNo, c1.name);
    if (!student.department && c1.department) student.department = c1.department;

    (c1.internalEvalResults || []).forEach((cSub) => {
      let targetSub = student.internalEvalResults.find(
        (ie) => (cSub.code && normalizeRegNo(ie.code) === normalizeRegNo(cSub.code)) ||
                (cSub.title && normalizeRegNo(ie.title) === normalizeRegNo(cSub.title))
      );

      if (!targetSub) {
        targetSub = {
          sem: cSub.sem || 'VI',
          code: cSub.code || '',
          title: cSub.title || '',
          cie1Marks: '',
          cie2Marks: '',
          modelMarks: '',
          passFail: cSub.passFail || '',
        };
        student.internalEvalResults.push(targetSub);
      }

      if (cSub.cie1Marks !== undefined && cSub.cie1Marks !== null && String(cSub.cie1Marks).trim() !== '') {
        targetSub.cie1Marks = String(cSub.cie1Marks).trim();
      }
      if (cSub.passFail) {
        targetSub.passFail = cSub.passFail;
      }
    });
  });

  // 3. Populate CIE 2 Excel data (CIE II section only)
  cie2Students.forEach((c2) => {
    const key = normalizeRegNo(c2.regNo);
    if (!key) return;

    const student = getOrCreateStudent(c2.regNo, c2.name);

    (c2.internalEvalResults || []).forEach((cSub) => {
      let targetSub = student.internalEvalResults.find(
        (ie) => (cSub.code && normalizeRegNo(ie.code) === normalizeRegNo(cSub.code)) ||
                (cSub.title && normalizeRegNo(ie.title) === normalizeRegNo(cSub.title))
      );

      if (!targetSub) {
        targetSub = {
          sem: cSub.sem || 'VI',
          code: cSub.code || '',
          title: cSub.title || '',
          cie1Marks: '',
          cie2Marks: '',
          modelMarks: '',
          passFail: cSub.passFail || '',
        };
        student.internalEvalResults.push(targetSub);
      }

      const markVal = cSub.cie2Marks !== undefined && String(cSub.cie2Marks).trim() !== '' ? cSub.cie2Marks : cSub.cie1Marks;
      if (markVal !== undefined && markVal !== null && String(markVal).trim() !== '') {
        targetSub.cie2Marks = String(markVal).trim();
      }
    });
  });

  // 4. Populate Model Exam Excel data (Model section only)
  modelStudents.forEach((m) => {
    const key = normalizeRegNo(m.regNo);
    if (!key) return;

    const student = getOrCreateStudent(m.regNo, m.name);

    (m.internalEvalResults || []).forEach((mSub) => {
      let targetSub = student.internalEvalResults.find(
        (ie) => (mSub.code && normalizeRegNo(ie.code) === normalizeRegNo(mSub.code)) ||
                (mSub.title && normalizeRegNo(ie.title) === normalizeRegNo(mSub.title))
      );

      if (!targetSub) {
        targetSub = {
          sem: mSub.sem || 'VI',
          code: mSub.code || '',
          title: mSub.title || '',
          cie1Marks: '',
          cie2Marks: '',
          modelMarks: '',
          passFail: mSub.passFail || '',
        };
        student.internalEvalResults.push(targetSub);
      }

      const markVal = mSub.modelMarks !== undefined && String(mSub.modelMarks).trim() !== '' ? mSub.modelMarks : mSub.cie1Marks;
      if (markVal !== undefined && markVal !== null && String(markVal).trim() !== '') {
        targetSub.modelMarks = String(markVal).trim();
      }
    });
  });

  // Check validation metrics
  let missingRecordsCount = 0;
  mergedStudentsMap.forEach((student) => {
    if (!student.gpa && !student.cgpa) missingGpaCount++;
    if ((student.universityResults?.length || 0) === 0 && (student.internalEvalResults?.length || 0) === 0) {
      missingSubjectsCount++;
    }
  });

  const mergedStudents = Array.from(mergedStudentsMap.values());
  const isReadyForPreview = mergedStudents.length > 0;

  return {
    pattern: activePattern,
    detectedPatternName,
    templateFile,
    univCount,
    cie1Count,
    cie2Count,
    modelCount,
    mergedCount: mergedStudents.length,
    missingRecordsCount,
    duplicateRegNosCount,
    missingGpaCount,
    missingSubjectsCount,
    invalidRowsCount: 0,
    validationWarnings,
    isReadyForPreview,
    mergedStudents,
  };
};
