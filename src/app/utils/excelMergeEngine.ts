import { StudentRecord, ResultPattern, InternalEvalResult } from '../types';
import { evaluatePassFail } from './excelParser';
import { deriveExamSessionFromAyAndSem } from './pdfGenerator';

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

  // Base student dataset comes from University Results Excel if present,
  // or fallback to CIE 1 / CIE 2 / Model Exam Excel dynamically!
  const baseStudents = univCount > 0 ? univStudents :
                       (cie1Count > 0 ? cie1Students :
                       (cie2Count > 0 ? cie2Students : modelStudents));

  if (baseStudents.length === 0) {
    return {
      pattern: activePattern,
      detectedPatternName,
      templateFile,
      mergedStudents: [],
      mergedCount: 0,
      univCount,
      cie1Count,
      cie2Count,
      modelCount,
      missingRecordsCount: 0,
      duplicateRegNosCount: 0,
      missingGpaCount: 0,
      missingSubjectsCount: 0,
      invalidRowsCount: 0,
      validationWarnings: ['Please upload at least one Excel file (University, CIE 1, CIE 2, or Model Exam) to generate reports.'],
      isReadyForPreview: false,
    };
  }

  const mergedStudentsMap = new Map<string, StudentRecord>();
  let duplicateRegNosCount = 0;
  let missingGpaCount = 0;
  let missingSubjectsCount = 0;

  // Helper to extract a valid department string from a student or dataset
  const getValidDept = (dept?: string): string => {
    if (!dept) return '';
    const clean = dept.trim();
    if (clean === 'N/A' || clean === '-' || clean === 'NONE' || clean === 'UNDEFINED') return '';
    return clean;
  };

  const datasetDept =
    getValidDept(univStudents.find((s) => getValidDept(s.department))?.department) ||
    getValidDept(cie1Students.find((s) => getValidDept(s.department))?.department) ||
    getValidDept(cie2Students.find((s) => getValidDept(s.department))?.department) ||
    getValidDept(modelStudents.find((s) => getValidDept(s.department))?.department);

  const extractSlotMeta = (list: StudentRecord[]) => {
    if (!list || list.length === 0) return undefined;
    const sample = list.find((s) => s.academicYear || s.currentSemester || s.cieAcademicYear || s.cieSemester);
    if (!sample) return undefined;
    const ay = sample.cieAcademicYear || sample.academicYear || '';
    const sem = sample.cieSemester || sample.currentSemester || '';
    const session = (sample.examSession && !/nov\/dec 2025/i.test(sample.examSession)) ? sample.examSession : deriveExamSessionFromAyAndSem(ay, sem);
    return {
      academicYear: ay,
      semester: sem,
      term: sample.cie1Metadata?.term || sample.cie2Metadata?.term || sample.modelMetadata?.term || sample.univMetadata?.term,
      examSession: session,
      department: getValidDept(sample.department),
    };
  };

  const univMeta = extractSlotMeta(univStudents);
  const cie1Meta = extractSlotMeta(cie1Students);
  const cie2Meta = extractSlotMeta(cie2Students);
  const modelMeta = extractSlotMeta(modelStudents);

  const cieDatasetSem =
    cie1Meta?.semester ||
    cie2Meta?.semester ||
    modelMeta?.semester ||
    '';

  const cieDatasetAcademicYear =
    cie1Meta?.academicYear ||
    cie2Meta?.academicYear ||
    modelMeta?.academicYear ||
    '';

  const datasetSem =
    univMeta?.semester ||
    cieDatasetSem ||
    '';

  const datasetExamSession =
    univMeta?.examSession ||
    cie1Meta?.examSession ||
    cie2Meta?.examSession ||
    modelMeta?.examSession ||
    '';

  baseStudents.forEach((s) => {
    const key = normalizeRegNo(s.regNo) || (s.name ? s.name.trim().toLowerCase().replace(/[^a-z0-9]/g, '') : '');
    if (!key) return;

    if (mergedStudentsMap.has(key)) {
      duplicateRegNosCount++;
      validationWarnings.push(`Duplicate Record: ${s.regNo || s.name}`);
    } else {
      if (!s.cgpa && !s.gpa && univCount > 0) {
        missingGpaCount++;
      }

      const univMatch = univCount > 0 ? univStudents.find((us) => normalizeRegNo(us.regNo) === key) : undefined;
      const cie1Match = cie1Count > 0 ? cie1Students.find((c1) => normalizeRegNo(c1.regNo) === key) : undefined;
      const cie2Match = cie2Count > 0 ? cie2Students.find((c2) => normalizeRegNo(c2.regNo) === key) : undefined;
      const modelMatch = modelCount > 0 ? modelStudents.find((m) => normalizeRegNo(m.regNo) === key) : undefined;

      mergedStudentsMap.set(key, {
        id: s.id,
        regNo: s.regNo,
        name: s.name,
        department: getValidDept(s.department) || datasetDept,
        regulation: s.regulation,
        univMetadata: univCount > 0 ? (univMatch?.univMetadata || univMeta) : undefined,
        cie1Metadata: cie1Count > 0 ? (cie1Match?.cie1Metadata || cie1Match?.univMetadata || cie1Meta) : undefined,
        cie2Metadata: cie2Count > 0 ? (cie2Match?.cie2Metadata || cie2Match?.univMetadata || cie2Meta) : undefined,
        modelMetadata: modelCount > 0 ? (modelMatch?.modelMetadata || modelMatch?.univMetadata || modelMeta) : undefined,
        academicYear: univMeta?.academicYear || '',
        currentSemester: univMeta?.semester || '',
        cieSemester: cieDatasetSem,
        cieAcademicYear: cieDatasetAcademicYear,
        examSession: univMeta?.examSession || datasetExamSession,
        universityResults: univCount > 0 ? ((univMatch?.universityResults || (s.universityResults && s.universityResults.length > 0 ? s.universityResults : []))).map((ur) => ({
          ...ur,
          passFail: evaluatePassFail(ur.passFail, ur.grade) || ur.passFail,
        })) : [],
        internalEvalResults: (s.internalEvalResults || []).map((ie) => ({ ...ie })),
        gpa: univCount > 0 ? (univMatch?.gpa !== undefined ? univMatch.gpa : s.gpa) : undefined,
        cgpa: univCount > 0 ? (univMatch?.cgpa !== undefined ? univMatch.cgpa : s.cgpa) : undefined,
        classObtained: univCount > 0 ? (univMatch?.classObtained || s.classObtained || '') : '',
        arrears: univCount > 0 ? (univMatch?.arrears && Object.keys(univMatch.arrears).length > 0 ? univMatch.arrears : (s.arrears || {})) : {},
        gpaBySem: univCount > 0 ? (univMatch?.gpaBySem && Object.keys(univMatch.gpaBySem).length > 0 ? univMatch.gpaBySem : (s.gpaBySem || {})) : {},
        cgpaBySem: univCount > 0 ? (univMatch?.cgpaBySem && Object.keys(univMatch.cgpaBySem).length > 0 ? univMatch.cgpaBySem : (s.cgpaBySem || {})) : {},
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
        student.cie1Metadata = cie1Match.cie1Metadata || cie1Match.univMetadata || extractSlotMeta([cie1Match]) || cie1Meta;
        if (!getValidDept(student.department)) {
          const d = getValidDept(cie1Match.department);
          if (d) student.department = d;
        }

        // Collect CIE 1 subjects from either internalEvalResults or universityResults
        const cie1SubList: { code: string; title: string; mark: number | string; sem?: string }[] = [];

        if (cie1Match.internalEvalResults && cie1Match.internalEvalResults.length > 0) {
          cie1Match.internalEvalResults.forEach((ie) => {
            cie1SubList.push({
              code: ie.code,
              title: ie.title,
              mark: ie.cie1Marks !== undefined && ie.cie1Marks !== null ? ie.cie1Marks : '',
              sem: ie.sem,
            });
          });
        } else if (cie1Match.universityResults && cie1Match.universityResults.length > 0) {
          cie1Match.universityResults.forEach((ur) => {
            cie1SubList.push({
              code: ur.code,
              title: ur.title,
              mark: ur.mark !== undefined && ur.mark !== null && ur.mark !== '' ? ur.mark : (ur.grade !== undefined && ur.grade !== null ? ur.grade : ''),
              sem: ur.sem,
            });
          });
        }

        const cie1Sem = cie1Match.cie1Metadata?.semester || cie1Match.univMetadata?.semester || (cie1SubList.find(c => c.sem)?.sem) || cie1Meta?.semester || '';

        if (student.internalEvalResults.length === 0) {
          // Build internalEvalResults directly from uploaded CIE 1 Excel!
          student.internalEvalResults = cie1SubList.map((cs) => ({
            sem: cie1Sem || cs.sem,
            code: cs.code,
            title: cs.title,
            cie1Marks: cs.mark,
            cie1PassFail: evaluateCiePassFail(cs.mark),
            cie2Marks: '',
            cie2PassFail: '',
            modelMarks: '',
            modelPassFail: '',
            passFail: evaluateCiePassFail(cs.mark),
          }));
        } else {
          // Update existing internalEvalResults
          student.internalEvalResults = student.internalEvalResults.map((ie) => {
            const matchSub = cie1SubList.find(
              (cSub) => normalizeRegNo(cSub.code) === normalizeRegNo(ie.code)
            );
            const mark = matchSub ? matchSub.mark : ie.cie1Marks;
            const itemSem = cie1Sem || (matchSub && matchSub.sem) || ie.sem || cieDatasetSem;
            const pf = evaluateCiePassFail(mark);
            return {
              ...ie,
              sem: itemSem,
              cie1Marks: mark,
              cie1PassFail: pf || ie.cie1PassFail,
              passFail: pf || ie.passFail,
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
        student.cie2Metadata = cie2Match.cie2Metadata || cie2Match.univMetadata || extractSlotMeta([cie2Match]) || cie2Meta;
        if (!getValidDept(student.department)) {
          const d = getValidDept(cie2Match.department);
          if (d) student.department = d;
        }

        const cie2SubList: { code: string; title: string; mark: number | string; sem?: string }[] = [];
        if (cie2Match.internalEvalResults && cie2Match.internalEvalResults.length > 0) {
          cie2Match.internalEvalResults.forEach((ie) => {
            cie2SubList.push({
              code: ie.code,
              title: ie.title,
              mark: ie.cie2Marks !== undefined && ie.cie2Marks !== null && String(ie.cie2Marks).trim() !== '' ? ie.cie2Marks : (ie.cie1Marks !== undefined ? ie.cie1Marks : ''),
              sem: ie.sem,
            });
          });
        } else if (cie2Match.universityResults && cie2Match.universityResults.length > 0) {
          cie2Match.universityResults.forEach((ur) => {
            cie2SubList.push({
              code: ur.code,
              title: ur.title,
              mark: ur.mark !== undefined && ur.mark !== null && ur.mark !== '' ? ur.mark : (ur.grade !== undefined ? ur.grade : ''),
              sem: ur.sem,
            });
          });
        }

        const cie2Sem = cie2Match.cie2Metadata?.semester || cie2Match.univMetadata?.semester || (cie2SubList.find(c => c.sem)?.sem) || cie2Meta?.semester || '';

        if (student.internalEvalResults.length === 0) {
          student.internalEvalResults = cie2SubList.map((cs) => ({
            sem: cie2Sem || cs.sem,
            code: cs.code,
            title: cs.title,
            cie1Marks: '',
            cie1PassFail: '',
            cie2Marks: cs.mark,
            cie2PassFail: evaluateCiePassFail(cs.mark),
            modelMarks: '',
            modelPassFail: '',
            passFail: evaluateCiePassFail(cs.mark),
          }));
        } else {
          student.internalEvalResults = student.internalEvalResults.map((ie, ieIdx) => {
            let matchSub = cie2SubList.find(
              (cSub) => cSub.code && ie.code && normalizeRegNo(cSub.code) === normalizeRegNo(ie.code)
            );
            if (!matchSub && ie.title) {
              const cleanIeTitle = ie.title.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
              matchSub = cie2SubList.find(
                (cSub) => cSub.title && cSub.title.trim().toLowerCase().replace(/[^a-z0-9]/g, '') === cleanIeTitle
              );
            }
            if (!matchSub && ieIdx < cie2SubList.length) {
              matchSub = cie2SubList[ieIdx];
            }

            const itemSem = student.cie1Metadata?.semester || cie2Sem || (matchSub && matchSub.sem) || ie.sem || cieDatasetSem;
            const mark = matchSub ? matchSub.mark : ie.cie2Marks;
            const pf = evaluateCiePassFail(mark);

            return {
              ...ie,
              sem: itemSem,
              cie2Marks: mark,
              cie2PassFail: pf || ie.cie2PassFail,
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
        student.modelMetadata = modelMatch.modelMetadata || modelMatch.univMetadata || extractSlotMeta([modelMatch]) || modelMeta;
        if (!getValidDept(student.department)) {
          const d = getValidDept(modelMatch.department);
          if (d) student.department = d;
        }

        const modelSubList: { code: string; title: string; mark: number | string; sem?: string }[] = [];
        if (modelMatch.internalEvalResults && modelMatch.internalEvalResults.length > 0) {
          modelMatch.internalEvalResults.forEach((ie) => {
            const markVal = (ie.modelMarks !== undefined && ie.modelMarks !== null && String(ie.modelMarks).trim() !== '')
              ? ie.modelMarks
              : ((ie.cie1Marks !== undefined && ie.cie1Marks !== null && String(ie.cie1Marks).trim() !== '')
                ? ie.cie1Marks
                : ie.cie2Marks);
            modelSubList.push({
              code: ie.code,
              title: ie.title,
              mark: markVal !== undefined && markVal !== null ? String(markVal).trim() : '',
              sem: ie.sem,
            });
          });
        } else if (modelMatch.universityResults && modelMatch.universityResults.length > 0) {
          modelMatch.universityResults.forEach((ur) => {
            const markVal = ur.mark !== undefined && ur.mark !== null && String(ur.mark).trim() !== ''
              ? ur.mark
              : (ur.grade || '');
            modelSubList.push({
              code: ur.code,
              title: ur.title,
              mark: String(markVal).trim(),
              sem: ur.sem,
            });
          });
        }

        const modelSem = modelMatch.modelMetadata?.semester || modelMatch.univMetadata?.semester || (modelSubList.find(m => m.sem)?.sem) || modelMeta?.semester || '';

        if (student.internalEvalResults.length === 0) {
          student.internalEvalResults = modelSubList.map((ms) => ({
            sem: modelSem || ms.sem,
            code: ms.code,
            title: ms.title,
            cie1Marks: '',
            cie1PassFail: '',
            cie2Marks: '',
            cie2PassFail: '',
            modelMarks: ms.mark,
            modelPassFail: evaluateCiePassFail(ms.mark),
            passFail: evaluateCiePassFail(ms.mark),
          }));
        } else {
          student.internalEvalResults = student.internalEvalResults.map((ie, ieIdx) => {
            // 3-Tier Matcher: Code match -> Title match -> Index-based fallback
            let matchSub = modelSubList.find(
              (mSub) => mSub.code && ie.code && normalizeRegNo(mSub.code) === normalizeRegNo(ie.code)
            );

            if (!matchSub && ie.title) {
              const cleanIeTitle = ie.title.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
              matchSub = modelSubList.find(
                (mSub) => mSub.title && mSub.title.trim().toLowerCase().replace(/[^a-z0-9]/g, '') === cleanIeTitle
              );
            }

            if (!matchSub && ieIdx < modelSubList.length) {
              matchSub = modelSubList[ieIdx];
            }

            const itemSem = student.cie1Metadata?.semester || student.cie2Metadata?.semester || modelSem || (matchSub && matchSub.sem) || ie.sem || cieDatasetSem;
            const modelVal = matchSub && matchSub.mark !== undefined && matchSub.mark !== null && String(matchSub.mark).trim() !== ''
              ? String(matchSub.mark).trim()
              : ie.modelMarks;

            const modelPf = evaluateCiePassFail(modelVal);

            return {
              ...ie,
              sem: itemSem,
              modelMarks: modelVal,
              modelPassFail: modelPf || ie.modelPassFail,
            };
          });
        }
      }
    });
  }

  const mergedStudents = Array.from(mergedStudentsMap.values());
  mergedStudents.forEach((student) => {
    if (!getValidDept(student.department) && datasetDept) {
      student.department = datasetDept;
    }
  });

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
