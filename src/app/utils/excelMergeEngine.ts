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

  // Base student dataset comes from University Results or any uploaded file slot
  const baseStudents = univCount > 0 ? univStudents : (cie1Count > 0 ? cie1Students : (cie2Count > 0 ? cie2Students : modelStudents));

  const mergedStudentsMap = new Map<string, StudentRecord>();
  let duplicateRegNosCount = 0;
  let missingGpaCount = 0;
  let missingSubjectsCount = 0;

  baseStudents.forEach((s) => {
    const key = normalizeRegNo(s.regNo);
    if (!key) return;

    if (mergedStudentsMap.has(key)) {
      duplicateRegNosCount++;
      validationWarnings.push(`Duplicate Register Number: ${s.regNo} (${s.name})`);
    } else {
      if (!s.cgpa && !s.gpa && univCount > 0) {
        missingGpaCount++;
      }

      mergedStudentsMap.set(key, {
        id: s.id,
        regNo: s.regNo,
        name: s.name,
        department: s.department,
        regulation: s.regulation,
        universityResults: univCount > 0 ? (s.universityResults || []).map((ur) => ({ ...ur })) : [],
        internalEvalResults: [],
        gpa: univCount > 0 ? s.gpa : undefined,
        cgpa: univCount > 0 ? s.cgpa : undefined,
        classObtained: univCount > 0 ? s.classObtained : '',
        arrears: univCount > 0 ? (s.arrears || {}) : {},
        gpaBySem: univCount > 0 ? (s.gpaBySem || {}) : {},
        cgpaBySem: univCount > 0 ? (s.cgpaBySem || {}) : {},
      });
    }
  });

  let missingRecordsCount = 0;

const evaluateCiePassFail = (markVal: any): 'PASS' | 'FAIL' | '' => {
  if (markVal === undefined || markVal === null) return '';
  const str = String(markVal).trim().toUpperCase();
  if (!str) return '';

  if (/^(O|A\+|A|B\+|B|C|D|P|PASS)$/.test(str)) return 'PASS';
  if (/^(RA|U|AB|ABSENT|FAIL|F)$/.test(str)) return 'FAIL';

  const num = Number(str);
  if (!isNaN(num)) {
    return num >= 50 ? 'PASS' : 'FAIL';
  }
  return '';
};

  // Merge CIE 1 Excel
  if (cie1Count > 0) {
    const cie1Map = new Map<string, StudentRecord>();
    cie1Students.forEach((s) => {
      if (s.regNo) cie1Map.set(normalizeRegNo(s.regNo), s);
    });

    mergedStudentsMap.forEach((student, regKey) => {
      let cie1Match = cie1Map.get(regKey);
      if (!cie1Match && student.name) {
        const cleanName = student.name.trim().toLowerCase().replace(/[^a-z]/g, '');
        cie1Match = cie1Students.find(
          (cs) => cs.name && cs.name.trim().toLowerCase().replace(/[^a-z]/g, '') === cleanName
        );
      }

      if (cie1Match) {
        // Collect CIE 1 subjects from either internalEvalResults or universityResults
        const cie1SubList: { code: string; title: string; mark: number | string }[] = [];

        if (cie1Match.internalEvalResults && cie1Match.internalEvalResults.length > 0) {
          cie1Match.internalEvalResults.forEach((ie) => {
            cie1SubList.push({
              code: ie.code,
              title: ie.title,
              mark: ie.cie1Marks !== undefined && ie.cie1Marks !== null ? ie.cie1Marks : '',
            });
          });
        } else if (cie1Match.universityResults && cie1Match.universityResults.length > 0) {
          cie1Match.universityResults.forEach((ur) => {
            cie1SubList.push({
              code: ur.code,
              title: ur.title,
              mark: ur.mark !== undefined && ur.mark !== null && ur.mark !== '' ? ur.mark : (ur.grade !== undefined && ur.grade !== null ? ur.grade : ''),
            });
          });
        }

        if (student.internalEvalResults.length === 0) {
          // Build internalEvalResults directly from uploaded CIE 1 Excel!
          student.internalEvalResults = cie1SubList.map((cs) => ({
            sem: 'VI',
            code: cs.code,
            title: cs.title,
            cie1Marks: cs.mark,
            cie2Marks: '',
            modelMarks: '',
            passFail: evaluateCiePassFail(cs.mark),
          }));
        } else {
          // Update existing internalEvalResults
          student.internalEvalResults = student.internalEvalResults.map((ie) => {
            const matchSub = cie1SubList.find(
              (cSub) => normalizeRegNo(cSub.code) === normalizeRegNo(ie.code)
            );
            const mark = matchSub ? matchSub.mark : ie.cie1Marks;
            return {
              ...ie,
              cie1Marks: mark,
              passFail: evaluateCiePassFail(mark) || ie.passFail,
            };
          });
        }
      } else {
        missingRecordsCount++;
      }
    });
  }

  // Merge CIE 2 Excel (Optional)
  if (cie2Count > 0) {
    const cie2Map = new Map<string, StudentRecord>();
    cie2Students.forEach((s) => {
      if (s.regNo) cie2Map.set(normalizeRegNo(s.regNo), s);
    });

    mergedStudentsMap.forEach((student, regKey) => {
      let cie2Match = cie2Map.get(regKey);
      if (!cie2Match && student.name) {
        const cleanName = student.name.trim().toLowerCase().replace(/[^a-z]/g, '');
        cie2Match = cie2Students.find(
          (cs) => cs.name && cs.name.trim().toLowerCase().replace(/[^a-z]/g, '') === cleanName
        );
      }

      if (cie2Match) {
        const cie2SubList: { code: string; title: string; mark: number | string }[] = [];
        if (cie2Match.internalEvalResults && cie2Match.internalEvalResults.length > 0) {
          cie2Match.internalEvalResults.forEach((ie) => {
            cie2SubList.push({
              code: ie.code,
              title: ie.title,
              mark: ie.cie2Marks !== undefined ? ie.cie2Marks : (ie.cie1Marks !== undefined ? ie.cie1Marks : ''),
            });
          });
        } else if (cie2Match.universityResults && cie2Match.universityResults.length > 0) {
          cie2Match.universityResults.forEach((ur) => {
            cie2SubList.push({
              code: ur.code,
              title: ur.title,
              mark: ur.mark !== undefined && ur.mark !== null && ur.mark !== '' ? ur.mark : (ur.grade !== undefined ? ur.grade : ''),
            });
          });
        }

        if (student.internalEvalResults.length === 0) {
          student.internalEvalResults = cie2SubList.map((cs) => ({
            sem: 'VI',
            code: cs.code,
            title: cs.title,
            cie1Marks: '',
            cie2Marks: cs.mark,
            modelMarks: '',
            passFail: cs.mark !== '' ? (Number(cs.mark) >= 50 ? 'PASS' : 'FAIL') : '',
          }));
        } else {
          student.internalEvalResults = student.internalEvalResults.map((ie) => {
            const matchSub = cie2SubList.find(
              (cSub) => normalizeRegNo(cSub.code) === normalizeRegNo(ie.code)
            );
            return {
              ...ie,
              cie2Marks: matchSub ? matchSub.mark : ie.cie2Marks,
            };
          });
        }
      }
    });
  }

  // Merge Model Exam Excel (Optional)
  if (modelCount > 0) {
    const modelMap = new Map<string, StudentRecord>();
    modelStudents.forEach((s) => {
      if (s.regNo) modelMap.set(normalizeRegNo(s.regNo), s);
    });

    mergedStudentsMap.forEach((student, regKey) => {
      let modelMatch = modelMap.get(regKey);
      if (!modelMatch && student.name) {
        const cleanName = student.name.trim().toLowerCase().replace(/[^a-z]/g, '');
        modelMatch = modelStudents.find(
          (ms) => ms.name && ms.name.trim().toLowerCase().replace(/[^a-z]/g, '') === cleanName
        );
      }

      if (modelMatch) {
        const modelSubList: { code: string; title: string; mark: number | string }[] = [];
        if (modelMatch.internalEvalResults && modelMatch.internalEvalResults.length > 0) {
          modelMatch.internalEvalResults.forEach((ie) => {
            modelSubList.push({
              code: ie.code,
              title: ie.title,
              mark: ie.modelMarks !== undefined ? ie.modelMarks : (ie.cie1Marks !== undefined ? ie.cie1Marks : ''),
            });
          });
        } else if (modelMatch.universityResults && modelMatch.universityResults.length > 0) {
          modelMatch.universityResults.forEach((ur) => {
            modelSubList.push({
              code: ur.code,
              title: ur.title,
              mark: ur.mark !== undefined && ur.mark !== null && ur.mark !== '' ? ur.mark : (ur.grade !== undefined ? ur.grade : ''),
            });
          });
        }

        if (student.internalEvalResults.length === 0) {
          student.internalEvalResults = modelSubList.map((ms) => ({
            sem: 'VI',
            code: ms.code,
            title: ms.title,
            cie1Marks: '',
            cie2Marks: '',
            modelMarks: ms.mark,
            passFail: ms.mark !== '' ? (Number(ms.mark) >= 50 ? 'PASS' : 'FAIL') : '',
          }));
        } else {
          student.internalEvalResults = student.internalEvalResults.map((ie) => {
            const matchSub = modelSubList.find(
              (mSub) => normalizeRegNo(mSub.code) === normalizeRegNo(ie.code)
            );
            return {
              ...ie,
              modelMarks: matchSub ? matchSub.mark : ie.modelMarks,
            };
          });
        }
      }
    });
  }

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
