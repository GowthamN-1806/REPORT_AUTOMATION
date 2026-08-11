import * as XLSX from 'xlsx';
import { StudentRecord, SubjectResult, InternalEvalResult } from '../types';

// Helper to extract strictly 1-year Academic Year (y2 - y1 === 1), ignoring 4-year Batch spans (e.g. 2024-2028)
const extractAcademicYearFromText = (text: string): string => {
  if (!text) return '';
  const cleanText = text.trim();

  const regex = /\b(20\d{2})\s*[-–—/]\s*(20\d{2}|\d{2})\b/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(cleanText)) !== null) {
    const y1 = parseInt(match[1], 10);
    let y2 = parseInt(match[2], 10);
    if (y2 < 100) {
      y2 = 2000 + y2;
    }

    if (y2 - y1 === 1) {
      return `${y1}–${y2}`;
    }
  }
  return '';
};

// Subject Master Mapping Dictionary (100% dynamically fetched from uploaded Excel files - ZERO hardcoded defaults)
const knownTitles: Record<string, string> = {};

// Non-subject metadata headers to ignore when identifying subject columns
const nonSubjectHeaders = [
  's.no', 's.no.', 'sl.no', 'sl.no.', 'sno', 'slno', 'id', 's_no', 'sl_no',
  'reg.no', 'reg.no.', 'reg no', 'register no', 'register_no', 'register number', 'register number:', 'regno', 'reg_no', 'registration no', 'registration_no', 'roll no', 'rollno',
  'name', 'student name', 'student_name', 'name of the student', 'name of the student:', 'studentname', 'name_of_the_student',
  'academic year', 'academic_year', 'academic year:', 'ay', 'year',
  'date', 'dates', 'date:',
  'staff name', 'staff names', 'staff_name', 'faculty', 'faculty name', 'staff',
  'department', 'department name', 'dept', 'branch', 'department:',
  'regulation', 'regulation:',
  'gpa', 'cgpa', 'class', 'class obtained', 'class_obtained', 'class_obtained:',
  'arrears', 'arears', 'arear', 'no. of arrears', 'no of arrears', 'no.of arrears', 'no_of_arrears', 'no. of arrears:', 'no of arrear', 'no. of arrear', 'no. of arears', 'no of arears', 'no.of arears', 'no_of_arears', 'rank', 'ranking', 'rank:', 'total arrears', 'total arears',
  'total', 'total marks', 'total_marks', 'percentage', 'result', 'pass/fail', 'passfail', 'status',
  'd/h', 'dh', 't/e', 'te', 'day/hosteller', 'theory/elective', 'credit', 'credits', 'cr', 'credit points', 'credit_points', 'cerdit', 'cerdits', 'credit value', 'cerdit value'
];

// Helper to detect if a cell string is a Grade or Pass/Fail status
const isGradeValue = (str: string): boolean => {
  if (!str) return false;
  const clean = str.trim().toUpperCase();
  return /^(O|A\+|A|B\+|B|C|D|P|RA|U|AB|ABSENT|PASS|FAIL)$/.test(clean);
};

// Helper to detect if a cell string is an Exam Date
const isDateCell = (str: string): boolean => {
  if (!str) return false;
  const clean = str.trim();
  if (/^\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4}$/.test(clean)) return true;
  if (/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(clean)) return true;
  return false;
};

// Helper to detect if a cell string is Title, Department Header, Credit row, or Faculty/Staff row metadata
const isFacultyNameCell = (str: string): boolean => {
  if (!str) return false;
  const clean = str.trim().toLowerCase();
  return /^(mr\.|mrs\.|dr\.|prof\.|ms\.|ap\/|asp\/|hod\/|prof\/|dr\s+|prof\s+)/i.test(clean) ||
         /\b(soloman|dhanalakshmi|raghavan|sree|prof|faculty|staff|incharge|counsellor)\b/i.test(clean) ||
         /^(jeppiaar|department|continuous|internal|evaluation|maximum marks|max marks|academic year|year\/sem|test name|credit|credits|cerdit|cerdits|cr\b|d\/h|t\/e|no\.?\s*of\s*ar?rears|rank)/i.test(clean);
};

// Helper to clean and format Semester values (e.g. 5 -> V, 06 -> VI, "Semester VI" -> VI)
const cleanSemesterValue = (val: any): string => {
  if (val === undefined || val === null) return '';
  let str = String(val).trim().toUpperCase();
  if (!str) return '';

  // Strip prefix labels
  str = str.replace(/^(?:semester|sem)\s*[:./-]?\s*/i, '').trim();

  // If number 1..8, map to Roman numerals
  const numMatch = str.match(/^0*([1-8])(?:st|nd|rd|th)?$/i) || str.match(/\b0*([1-8])\b/);
  if (numMatch) {
    const num = parseInt(numMatch[1], 10);
    const romanMap: Record<number, string> = {
      1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI', 7: 'VII', 8: 'VIII'
    };
    if (romanMap[num]) return romanMap[num];
  }

  // If Roman numerals
  const romanMatch = str.match(/\b(VIII|VII|VI|IV|V|III|II|I)\b/i);
  if (romanMatch) {
    return romanMatch[1].toUpperCase();
  }

  return str;
};

// Helper to clean department names and strip redundant prefixes
const cleanDepartmentName = (rawDept: string): string => {
  if (!rawDept) return '';
  let str = rawDept.trim();

  // Strip multiline headers if any
  if (str.includes('\n')) {
    const lines = str.split('\n').map((l) => l.trim()).filter(Boolean);
    const deptLine = lines.find((l) => /department|dept|branch|computer|information|electronics|electrical|mechanical|civil|artificial/i.test(l));
    if (deptLine) str = deptLine;
  }

  // Strip leading "DEPARTMENT OF", "DEPT OF", "BRANCH OF", "DEPARTMENT:", "DEPT:", "BRANCH:"
  str = str.replace(/^(?:department\s+of|dept\s+of|branch\s+of|department|dept|branch)\s*[:.-]?\s*/i, '').trim();
  str = str.replace(/^of\s+/i, '').trim();
  str = str.replace(/[:.-]+$/, '').trim();

  const upper = str.toUpperCase();
  if (upper === 'IT' || upper === 'B.TECH - IT' || upper === 'B.TECH IT' || upper === 'B.TECH. - IT' || upper === 'B.TECH. IT') return 'INFORMATION TECHNOLOGY';
  if (upper === 'CSE' || upper === 'B.E - CSE' || upper === 'B.E CSE' || upper === 'B.E. - CSE' || upper === 'B.E. CSE') return 'COMPUTER SCIENCE AND ENGINEERING';
  if (upper === 'ECE' || upper === 'B.E - ECE' || upper === 'B.E. - ECE') return 'ELECTRONICS AND COMMUNICATION ENGINEERING';
  if (upper === 'EEE' || upper === 'B.E - EEE' || upper === 'B.E. - EEE') return 'ELECTRICAL AND ELECTRONICS ENGINEERING';
  if (upper === 'MECH' || upper === 'MECHANICAL' || upper === 'B.E - MECH') return 'MECHANICAL ENGINEERING';
  if (upper === 'AIDS' || upper === 'AI & DS' || upper === 'AI/DS' || upper === 'AI AND DS') return 'ARTIFICIAL INTELLIGENCE AND DATA SCIENCE';
  if (upper === 'AIML' || upper === 'AI & ML' || upper === 'AI/ML' || upper === 'AI AND ML') return 'ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING';
  if (upper === 'CIVIL' || upper === 'B.E - CIVIL') return 'CIVIL ENGINEERING';

  return upper;
};

// Helper to identify placeholder tokens or __EMPTY strings
const isPlaceholderToken = (str: string): boolean => {
  if (!str) return true;
  const clean = str.trim().toLowerCase();
  if (
    clean.startsWith('empty') ||
    clean.startsWith('__empty') ||
    clean.includes('register_no') ||
    clean.includes('register_number') ||
    clean.includes('student_name') ||
    clean.includes('university_subject_code') ||
    clean.includes('university_subject_name') ||
    clean.includes('grade_') ||
    clean.includes('passfail_') ||
    clean.startsWith('{{') ||
    clean.endsWith('}}')
  ) {
    return true;
  }
  return false;
};

// Helper to strictly validate if a row belongs to a real student (filters out bottom subject reference blocks & HOD footers)
const isNonStudentRow = (regNo: string, name: string, knownSubjectCodes?: Set<string>): boolean => {
  const rawReg = regNo.trim();
  const rawName = name.trim();
  const cleanReg = rawReg.toLowerCase();
  const cleanName = rawName.toLowerCase();
  const upperReg = rawReg.toUpperCase();
  const upperName = rawName.toUpperCase();
  const combined = (cleanReg + ' ' + cleanName).replace(/[\s_.-]+/g, '');

  if (!cleanReg && !cleanName) return true;

  // 1. Check if regNo or name matches any harvested Subject Code from the Excel file
  if (knownSubjectCodes && (knownSubjectCodes.has(upperReg) || knownSubjectCodes.has(upperName))) {
    return true;
  }

  // 2. Check if regNo or name matches Subject Code pattern (e.g. IT401, IT402, CS3591, HJK12)
  if (/^[A-Z]{2,5}\s*\d{2,4}[A-Z]?$/i.test(rawReg) || /^[A-Z]{3,4}\d{3,4}$/i.test(rawReg) ||
      /^[A-Z]{2,5}\s*\d{2,4}[A-Z]?$/i.test(rawName) || /^[A-Z]{3,4}\d{3,4}$/i.test(rawName)) {
    return true;
  }

  // 3. Check if name is a Subject Code or short course acronym (e.g. OS, DBMS, PC, AI&ML, AI&MI, SE1, SE2, CN, AIML, MINI PROJECT)
  if (/^(os|dbms|pc|ai&mi|ai&ml|aiml|cn|se1|se2|dsa|oop|se|lab|miniproject|mini project)$/i.test(rawName) ||
      /^[a-z]{2,4}\d{1,2}$/i.test(cleanName)) {
    return true;
  }

  // 4. Header & metadata label rows
  if (/^(s\.?no\.?|sl\.?no\.?|sno|slno|register|name|reg\.?no|roll\.?no|subject|course|code)/i.test(cleanReg) ||
      /^(s\.?no\.?|sl\.?no\.?|sno|slno|register|name|reg\.?no|roll\.?no|subject|course|code)/i.test(cleanName)) {
    return true;
  }

  // 5. Non-student subject reference block & footer keywords
  const invalidKeywords = [
    'subjectname', 'subname', 'subjectcode', 'subcode', 'coursecode', 'coursename',
    'database', 'operatingsystem', 'computernetwork', 'artificialintelligence',
    'parallelcomputing', 'skillenhancement', 'miniproject', 'hod', 'headof',
    'counsellor', 'staff', 'faculty', 'incharge', 'principal', 'signature',
    'jeppiaar', 'department', 'classcounsellor', 'result', 'academic', 'evaluation',
    'maximummarks', 'maxmarks', 'totalmarks', 'percentage', 'arrear', 'arrears', 'credit'
  ];

  if (invalidKeywords.some((kw) => combined.includes(kw))) {
    return true;
  }

  // 6. Real student regNo must be numeric (e.g. 210625205001). If it contains letters (like IT401), it's not a student regNo.
  if (rawReg && /[a-zA-Z]/.test(rawReg)) {
    return true;
  }

  return false;
};

// Evaluate Pass/Fail dynamically without forcing defaults
const evaluatePassFail = (value: any, gradeStr?: string): 'PASS' | 'FAIL' | '' => {
  const str = String(value || '').trim().toUpperCase();
  const g = String(gradeStr || '').trim().toUpperCase();

  if (!str && !g) return '';

  if (str === 'FAIL' || str === 'F' || str === 'RA' || str === 'U' || str === 'AB' || str === 'ABSENT' ||
      g === 'RA' || g === 'U' || g === 'F' || g === 'AB' || g === 'FAIL' || g === 'ABSENT') {
    return 'FAIL';
  }
  if (str === 'PASS' || str === 'P' || g === 'O' || g === 'A+' || g === 'A' || g === 'B+' || g === 'B' || g === 'C' || g === 'D' || g === 'P') {
    return 'PASS';
  }
  const num = Number(str);
  if (!isNaN(num)) {
    return num >= 50 ? 'PASS' : 'FAIL';
  }
  return '';
};

// Search row or raw cell for candidate key names
const findCellValue = (rowCells: any[], headers: string[], keyCandidates: (string | RegExp)[]): any => {
  for (const candidate of keyCandidates) {
    for (let c = 0; c < headers.length; c++) {
      const headerName = headers[c] || '';
      const cleanH = headerName.trim().toLowerCase().replace(/[\s_.-]+/g, '');
      if (typeof candidate === 'string') {
        const cleanCand = candidate.trim().toLowerCase().replace(/[\s_.-]+/g, '');
        if (cleanH === cleanCand) {
          const val = rowCells[c];
          if (val !== undefined && val !== null && String(val).trim() !== '') {
            return val;
          }
        }
      } else if (candidate instanceof RegExp) {
        if (candidate.test(headerName) || candidate.test(cleanH)) {
          const val = rowCells[c];
          if (val !== undefined && val !== null && String(val).trim() !== '') {
            return val;
          }
        }
      }
    }
  }
  return undefined;
};

// Find matching column index by candidate header names
const findColIndex = (headers: string[], candidates: string[]): number => {
  const cleanHeaders = headers.map((h) => String(h || '').toLowerCase().replace(/[^a-z0-9]/g, ''));
  for (let candidate of candidates) {
    const cleanCand = candidate.toLowerCase().replace(/[^a-z0-9]/g, '');
    const idx = cleanHeaders.findIndex((h) => h === cleanCand || h.includes(cleanCand));
    if (idx !== -1) return idx;
  }
  return -1;
};

export const parseExcelFile = (file: File): Promise<StudentRecord[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Read raw 2D matrix (header: 1)
        const rawMatrix: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

        // STEP 0.1: Extract Academic Year dynamically from Excel sheet (strictly 1-year span, excluding Batch)
        let extractedAcademicYear = '';

        // Priority 1: Search cells explicitly labeled with "Academic Year" or "AY"
        for (let r = 0; r < Math.min(rawMatrix.length, 35); r++) {
          const rowCells = rawMatrix[r] || [];
          for (let c = 0; c < rowCells.length; c++) {
            const cellVal = String(rowCells[c] || '').trim();
            if (!cellVal) continue;
            const lower = cellVal.toLowerCase();

            if ((lower.includes('academic year') || lower.includes('academic_year') || /\bay\b/i.test(lower)) && !lower.includes('batch')) {
              const candidate = cellVal + ' ' + (rowCells[c + 1] ? String(rowCells[c + 1]) : '') + ' ' + (rowCells[c + 2] ? String(rowCells[c + 2]) : '');
              const found = extractAcademicYearFromText(candidate);
              if (found) {
                extractedAcademicYear = found;
                break;
              }
            }
          }
          if (extractedAcademicYear) break;
        }

        // Priority 2: Fallback scan for any 1-year span (y2 - y1 === 1) in top rows, avoiding batch-only cells
        if (!extractedAcademicYear) {
          for (let r = 0; r < Math.min(rawMatrix.length, 35); r++) {
            const rowCells = rawMatrix[r] || [];
            for (let c = 0; c < rowCells.length; c++) {
              const cellVal = String(rowCells[c] || '').trim();
              if (!cellVal) continue;
              const lower = cellVal.toLowerCase();
              if (lower.includes('batch') && !lower.includes('academic')) continue;

              const found = extractAcademicYearFromText(cellVal);
              if (found) {
                extractedAcademicYear = found;
                break;
              }
            }
            if (extractedAcademicYear) break;
          }
        }

        // STEP 0: Extract Subject Code -> Subject Name dictionary & ordered list from Excel sheet (reference block at bottom)
        interface ExcelSubjectRef {
          code: string;
          title: string;
          sem?: string;
        }

        const excelSubjectList: ExcelSubjectRef[] = [];
        const excelSubjectMaster: Record<string, string> = {};

        for (let r = 0; r < rawMatrix.length; r++) {
          const rowCells = rawMatrix[r] || [];
          let codeColIdx = -1;
          let nameColIdx = -1;
          let semColIdx = -1;

          for (let c = 0; c < rowCells.length; c++) {
            const cellText = String(rowCells[c] || '').trim().toLowerCase().replace(/[\s_.-]+/g, '');
            if (
              cellText === 'subjectcode' || cellText === 'subcode' || cellText === 'coursecode' ||
              cellText === 'code' || cellText === 'sub.code' || cellText === 'subject_code'
            ) {
              codeColIdx = c;
            } else if (
              cellText === 'subjectname' || cellText === 'subname' || cellText === 'coursename' ||
              cellText === 'subjecttitle' || cellText === 'coursetitle' || cellText === 'subject' ||
              cellText === 'title' || cellText === 'sub.name' || cellText === 'subject_name'
            ) {
              nameColIdx = c;
            } else if (cellText === 'sem' || cellText === 'semester') {
              semColIdx = c;
            }
          }

          if (codeColIdx !== -1 && nameColIdx !== -1) {
            for (let subR = r + 1; subR < Math.min(r + 40, rawMatrix.length); subR++) {
              const subCells = rawMatrix[subR] || [];
              const rawCode = String(subCells[codeColIdx] || '').trim().toUpperCase();
              const rawName = String(subCells[nameColIdx] || '').trim();
              const rawSem = semColIdx !== -1 ? String(subCells[semColIdx] || '').trim() : '';

              if (
                rawCode &&
                rawName &&
                !isFacultyNameCell(rawCode) &&
                !isGradeValue(rawName) &&
                !/credit|cerdit|value|type|mark|score|grade|status|result|pass|fail|ar?rear|rank/i.test(rawName.toLowerCase())
              ) {
                excelSubjectMaster[rawCode] = rawName;
                if (!excelSubjectList.some((s) => s.code === rawCode)) {
                  excelSubjectList.push({ code: rawCode, title: rawName, sem: rawSem });
                }
              }
            }
          }
        }

        // Universal Subject Code & Title Harvester across the entire Excel Sheet Matrix
        for (let r = 0; r < rawMatrix.length; r++) {
          const rowCells = rawMatrix[r] || [];
          for (let c = 0; c < rowCells.length; c++) {
            const cellVal = String(rowCells[c] || '').trim();
            if (!cellVal) continue;

            // Pattern 1: Combined Code + Title in single cell (e.g. "IT401 - Database Management Systems", "IT401: Operating Systems")
            const combinedMatch = cellVal.match(/^([A-Z0-9]{3,8})\s*[:.-/(]\s*(.+)$/i);
            if (combinedMatch) {
              const code = combinedMatch[1].trim().toUpperCase();
              const title = combinedMatch[2].replace(/[)]$/, '').trim();
              if (
                code &&
                title &&
                title.length > 2 &&
                !/^[A-Z]{2,5}\s*\d{2,4}[A-Z]?$/i.test(title) &&
                !excelSubjectMaster[code]
              ) {
                excelSubjectMaster[code] = title;
                if (!excelSubjectList.some((s) => s.code === code)) {
                  excelSubjectList.push({ code, title });
                }
              }
            }

            // Pattern 2: Cell looks like a Subject Code (e.g. "IT401", "ACS108", "CS3591", "HJK12")
            if (/^[A-Z]{2,5}\s*\d{2,4}[A-Z]?$/i.test(cellVal) || /^[A-Z]{3,4}\d{3,4}$/i.test(cellVal)) {
              const code = cellVal.replace(/\s+/g, '').toUpperCase();

              // Check right adjacent cells (c+1, c+2) for title - MUST NOT BE ANOTHER SUBJECT CODE
              for (const nextC of [c + 1, c + 2]) {
                const candidateTitle = String(rowCells[nextC] || '').trim();
                if (
                  candidateTitle &&
                  candidateTitle.length > 2 &&
                  !/^[A-Z]{2,5}\s*\d{2,4}[A-Z]?$/i.test(candidateTitle) &&
                  !/^[A-Z]{3,4}\d{3,4}$/i.test(candidateTitle) &&
                  !/^[0-9]+$/.test(candidateTitle) &&
                  !isGradeValue(candidateTitle) &&
                  !isDateCell(candidateTitle) &&
                  !isFacultyNameCell(candidateTitle) &&
                  !/ar?rear|rank|gpa|cgpa|total|credit|mark|score|result|pass|fail/i.test(candidateTitle)
                ) {
                  if (!excelSubjectMaster[code]) {
                    excelSubjectMaster[code] = candidateTitle;
                    if (!excelSubjectList.some((s) => s.code === code)) {
                      excelSubjectList.push({ code, title: candidateTitle });
                    }
                  }
                  break;
                }
              }

              // Check down adjacent row (r+1, c) for title if row r is header - MUST NOT BE ANOTHER SUBJECT CODE
              if (r + 1 < rawMatrix.length) {
                const downTitle = String((rawMatrix[r + 1] || [])[c] || '').trim();
                if (
                  downTitle &&
                  downTitle.length > 2 &&
                  !/^[A-Z]{2,5}\s*\d{2,4}[A-Z]?$/i.test(downTitle) &&
                  !/^[A-Z]{3,4}\d{3,4}$/i.test(downTitle) &&
                  !/^[0-9]+$/.test(downTitle) &&
                  !isGradeValue(downTitle) &&
                  !isDateCell(downTitle) &&
                  !isFacultyNameCell(downTitle) &&
                  !/ar?rear|rank|gpa|cgpa|total|credit|mark|score|result|pass|fail/i.test(downTitle)
                ) {
                  if (!excelSubjectMaster[code]) {
                    excelSubjectMaster[code] = downTitle;
                    if (!excelSubjectList.some((s) => s.code === code)) {
                      excelSubjectList.push({ code, title: downTitle });
                    }
                  }
                }
              }
            }
          }
        }

        // Title Resolver Helper
        const resolveSubjectTitle = (code: string, rawTitle?: string): string => {
          const cleanCode = (code || '').trim().toUpperCase();
          let cleanTitle = (rawTitle || '').trim();

          // Reject cleanTitle if it's identical to the code or is another subject code (e.g. "IT402")
          if (
            cleanTitle &&
            (cleanTitle.toUpperCase() === cleanCode ||
              /^[A-Z]{2,5}\s*\d{2,4}[A-Z]?$/i.test(cleanTitle) ||
              /^[A-Z]{3,4}\d{3,4}$/i.test(cleanTitle))
          ) {
            cleanTitle = '';
          }

          if (cleanTitle) {
            return cleanTitle;
          }

          if (excelSubjectMaster[cleanCode]) {
            return excelSubjectMaster[cleanCode];
          }

          if (knownTitles[cleanCode]) {
            return knownTitles[cleanCode];
          }

          return cleanCode;
        };

        // STEP 1: Locate Student Table Anchor Row (Header Row containing Reg.No / Name)
        let anchorRowIndex = -1;
        let regNoColIndex = -1;
        let nameColIndex = -1;
        let deptColIndex = -1;
        let reguColIndex = -1;

        for (let r = 0; r < rawMatrix.length; r++) {
          const rowCells = rawMatrix[r] || [];
          let foundReg = -1;
          let foundName = -1;
          let foundDept = -1;
          let foundRegu = -1;

          for (let c = 0; c < rowCells.length; c++) {
            const cellText = String(rowCells[c] || '').trim().toLowerCase();
            if (cellText === '') continue;

            if (foundReg === -1 && /^(reg|reg\.no|reg_no|regno|roll|roll\.no|rollno|register|registration)/i.test(cellText)) {
              foundReg = c;
            } else if (foundName === -1 && /^(name|student|student_name|candidate|name of the student)/i.test(cellText)) {
              foundName = c;
            } else if (foundDept === -1 && /^(dept|department|branch)/i.test(cellText)) {
              foundDept = c;
            } else if (foundRegu === -1 && /^(regulation)/i.test(cellText)) {
              foundRegu = c;
            }
          }

          if (foundReg !== -1 || foundName !== -1) {
            anchorRowIndex = r;
            regNoColIndex = foundReg;
            nameColIndex = foundName;
            deptColIndex = foundDept;
            reguColIndex = foundRegu;
            break;
          }
        }

        if (anchorRowIndex === -1) {
          anchorRowIndex = 0;
          const r0 = rawMatrix[0] || [];
          if (r0.length > 0) regNoColIndex = 0;
          if (r0.length > 1) nameColIndex = 1;
        }

        // STEP 2: Locate the true Header Row by counting column header keywords across matrix rows
        let bestHeaderRowIndex = -1;
        let maxHeaderMatches = -1;

        for (let r = 0; r < rawMatrix.length; r++) {
          const rowCells = rawMatrix[r] || [];
          let matches = 0;
          let hasCreditOrDhTe = false;

          for (let c = 0; c < rowCells.length; c++) {
            const txt = String(rowCells[c] || '').trim();
            if (!txt || isPlaceholderToken(txt) || isDateCell(txt) || isFacultyNameCell(txt)) continue;

            const cleanTxt = txt.toLowerCase();

            // Ignore credit values / D/H / T/E metadata rows
            if (/^(credit|credits|cr|d\/h|t\/e|dh|te|day\/hosteller|theory\/elective)/i.test(cleanTxt)) {
              hasCreditOrDhTe = true;
              break;
            }

            // Check if cell looks like a column header (e.g. Code_1, Grade_1, Reg.No, Subject_1, Pass_1, Subject Code, Subject Name)
            if (
              /^(reg|name|code|subject|grade|pass|cie|sem|gpa|cgpa|arr)/i.test(txt) ||
              /(code|grade|pass|subject|mark)[\s_.-]*\d+/i.test(txt) ||
              /subject\s*code|subject\s*name/i.test(txt)
            ) {
              matches++;
            }
          }

          if (!hasCreditOrDhTe && matches > maxHeaderMatches) {
            maxHeaderMatches = matches;
            bestHeaderRowIndex = r;
          }
        }

        if (bestHeaderRowIndex === -1) bestHeaderRowIndex = anchorRowIndex;

        const headerRow = rawMatrix[bestHeaderRowIndex] || [];
        const headerNames: string[] = headerRow.map((cell) => String(cell || '').trim());

        // Fill empty header cells from adjacent row if headers are split across 2 rows
        for (let c = 0; c < headerNames.length; c++) {
          if (!headerNames[c]) {
            const nextRowVal = String((rawMatrix[bestHeaderRowIndex + 1] || [])[c] || '').trim();
            if (nextRowVal && !isDateCell(nextRowVal) && !isFacultyNameCell(nextRowVal)) {
              headerNames[c] = nextRowVal;
            }
          }
        }

        let subjectHeaderRowIndex = bestHeaderRowIndex;

        // Line-by-line scanner across ALL rows of rawMatrix to find exact value next to 'Department' / 'Dept' / 'Branch' / 'Academic Year'
        let extractedDepartment = '';
        let extractedRegulation = '';
        let extractedSemester = '';

        for (let r = 0; r < rawMatrix.length; r++) {
          const rCells = rawMatrix[r] || [];
          for (let c = 0; c < rCells.length; c++) {
            const cellText = String(rCells[c] || '').trim();
            if (!cellText) continue;

            // Pattern 1: Inline "Department: IT" or "Dept: CSE" or "Branch: IT"
            const inlineMatch = cellText.match(/(?:department|dept|branch)\s*[:.-]\s*([^\n\r,]+)/i);
            if (inlineMatch && inlineMatch[1] && inlineMatch[1].trim()) {
              const val = cleanDepartmentName(inlineMatch[1]);
              if (val && !extractedDepartment) {
                extractedDepartment = val;
              }
            }

            // Pattern 2: Inline "DEPARTMENT OF INFORMATION TECHNOLOGY" or "DEPARTMENT OF IT"
            const deptOfMatch = cellText.match(/department\s+of\s+([^\n\r,]+)/i);
            if (deptOfMatch && deptOfMatch[1] && deptOfMatch[1].trim()) {
              const val = cleanDepartmentName(deptOfMatch[1]);
              if (val && !extractedDepartment) {
                extractedDepartment = val;
              }
            }

            // Pattern 3: Key cell is "Department" or "Dept" or "Branch", value cell is c + 1
            if (/^(department|dept|branch)$/i.test(cellText)) {
              if (c + 1 < rCells.length && rCells[c + 1]) {
                const nextVal = String(rCells[c + 1]).trim();
                if (nextVal && !extractedDepartment && !/^(of|code|name|sem|no)/i.test(nextVal)) {
                  const cleaned = cleanDepartmentName(nextVal);
                  if (cleaned) extractedDepartment = cleaned;
                }
              }
            }

            // Pattern 4: Standalone department header cell (e.g. "INFORMATION TECHNOLOGY", "COMPUTER SCIENCE AND ENGINEERING") in top 10 rows
            if (!extractedDepartment && r < 10) {
              const cleaned = cleanDepartmentName(cellText);
              if (
                cleaned &&
                /^(INFORMATION TECHNOLOGY|COMPUTER SCIENCE AND ENGINEERING|ELECTRONICS AND COMMUNICATION ENGINEERING|ELECTRICAL AND ELECTRONICS ENGINEERING|MECHANICAL ENGINEERING|ARTIFICIAL INTELLIGENCE AND DATA SCIENCE|CIVIL ENGINEERING)$/i.test(cleaned)
              ) {
                extractedDepartment = cleaned;
              }
            }

            // Pattern 5: Regulation
            const reguMatch = cellText.match(/regulation\s*:?\s*(\d{4})/i);
            if (reguMatch && reguMatch[1] && !extractedRegulation) {
              extractedRegulation = reguMatch[1];
            } else if (/^regulation$/i.test(cellText) && c + 1 < rCells.length && rCells[c + 1]) {
              const nextVal = String(rCells[c + 1]).trim();
              if (nextVal && !extractedRegulation) {
                extractedRegulation = nextVal;
              }
            }

            // Pattern 6: Semester (Inspect inline text or right-side adjacent cells c+1, c+2, c+3)
            if (/^(?:semester|sem)\b/i.test(cellText)) {
              // Case A: Inline text in same cell, e.g. "Semester: 05" or "Sem: VI"
              const inlineSemMatch = cellText.match(/(?:semester|sem)\s*[:.-]?\s*([a-z0-9]+)/i);
              if (inlineSemMatch && inlineSemMatch[1] && !/^(no|name|code|register|roll)/i.test(inlineSemMatch[1])) {
                const cleaned = cleanSemesterValue(inlineSemMatch[1]);
                if (cleaned && !extractedSemester) {
                  extractedSemester = cleaned;
                }
              }

              // Case B: Cell has label ("Semester:", "Sem:", "Semester", "Sem", "Sem/Year"), value is in right-side cell c+1, c+2, or c+3
              if (!extractedSemester) {
                for (let offset = 1; offset <= 3; offset++) {
                  if (c + offset < rCells.length && rCells[c + offset] !== undefined && rCells[c + offset] !== null) {
                    const targetVal = String(rCells[c + offset]).trim();
                    if (targetVal && !/^(of|code|name|no|register|roll)/i.test(targetVal)) {
                      const cleaned = cleanSemesterValue(targetVal);
                      if (cleaned) {
                        extractedSemester = cleaned;
                        break;
                      }
                    }
                  }
                }
              }
            }

            // Pattern 6: Academic Year (e.g. "Academic Year : 2026-2027 Even", "Academic Year: 2025-2026", "AY 2024-2025")
            if (!extractedAcademicYear) {
              const inlineAyMatch = cellText.match(/(?:academic\s*year|academic_year|academicyear|acad\s*year|\bay\b)\s*[:.-]?\s*(\d{4}\s*[-–/]\s*(?:\d{4}|\d{2}))/i);
              if (inlineAyMatch && inlineAyMatch[1]) {
                const rawYearPair = inlineAyMatch[1].replace(/\s+/g, '');
                const parts = rawYearPair.split(/[-–/]/);
                if (parts.length === 2) {
                  const startYr = parts[0];
                  let endYr = parts[1];
                  if (endYr.length === 2) endYr = startYr.substring(0, 2) + endYr;
                  extractedAcademicYear = `${startYr}-${endYr}`;
                } else {
                  extractedAcademicYear = rawYearPair;
                }
              }

              if (!extractedAcademicYear && /^(academic\s*year|academicyear|academic_year|acad\s*year|ay)\s*:?$/i.test(cellText)) {
                for (let offset = 1; offset <= 3; offset++) {
                  if (c + offset < rCells.length && rCells[c + offset] !== undefined && rCells[c + offset] !== null) {
                    const targetVal = String(rCells[c + offset]).trim();
                    const yrMatch = targetVal.match(/(\d{4}\s*[-–/]\s*(?:\d{4}|\d{2}))/);
                    if (yrMatch && yrMatch[1]) {
                      const rawYearPair = yrMatch[1].replace(/\s+/g, '');
                      const parts = rawYearPair.split(/[-–/]/);
                      if (parts.length === 2) {
                        const startYr = parts[0];
                        let endYr = parts[1];
                        if (endYr.length === 2) endYr = startYr.substring(0, 2) + endYr;
                        extractedAcademicYear = `${startYr}-${endYr}`;
                      } else {
                        extractedAcademicYear = rawYearPair;
                      }
                      break;
                    }
                  }
                }
              }

              if (!extractedAcademicYear && /^(academic\s*year|academicyear|academic_year|ay)/i.test(cellText)) {
                const yrMatch = cellText.match(/(\d{4}\s*[-–/]\s*(?:\d{4}|\d{2}))/);
                if (yrMatch && yrMatch[1]) {
                  const rawYearPair = yrMatch[1].replace(/\s+/g, '');
                  const parts = rawYearPair.split(/[-–/]/);
                  if (parts.length === 2) {
                    const startYr = parts[0];
                    let endYr = parts[1];
                    if (endYr.length === 2) endYr = startYr.substring(0, 2) + endYr;
                    extractedAcademicYear = `${startYr}-${endYr}`;
                  } else {
                    extractedAcademicYear = rawYearPair;
                  }
                }
              }
            }
          }
        }

        // Fallback 1: Deduce Department from File Name if not found in cells
        if (!extractedDepartment && file && file.name) {
          const fn = file.name.toUpperCase();
          if (/\bIT\b|_IT_|_IT\b|\bINFORMATION\b/i.test(fn)) extractedDepartment = 'INFORMATION TECHNOLOGY';
          else if (/\bCSE\b|_CSE_|_CSE\b|\bCOMPUTER\b/i.test(fn)) extractedDepartment = 'COMPUTER SCIENCE AND ENGINEERING';
          else if (/\bECE\b|_ECE_|_ECE\b|\bELECTRONICS\b/i.test(fn)) extractedDepartment = 'ELECTRONICS AND COMMUNICATION ENGINEERING';
          else if (/\bEEE\b|_EEE_|_EEE\b|\bELECTRICAL\b/i.test(fn)) extractedDepartment = 'ELECTRICAL AND ELECTRONICS ENGINEERING';
          else if (/\bMECH\b|_MECH_|_MECH\b|\bMECHANICAL\b/i.test(fn)) extractedDepartment = 'MECHANICAL ENGINEERING';
          else if (/\bAIDS\b|_AIDS_|_AIDS\b|\bAI_DS\b/i.test(fn)) extractedDepartment = 'ARTIFICIAL INTELLIGENCE AND DATA SCIENCE';
        }

        // Fallback 2: Deduce Department from Subject Codes if not found
        if (!extractedDepartment) {
          const allCodes = Array.from(knownSubjectCodes);
          const hasIT = allCodes.some((c) => c.startsWith('IT'));
          const hasCS = allCodes.some((c) => c.startsWith('CS'));
          const hasEC = allCodes.some((c) => c.startsWith('EC'));
          const hasEE = allCodes.some((c) => c.startsWith('EE'));
          const hasME = allCodes.some((c) => c.startsWith('ME'));
          const hasAD = allCodes.some((c) => c.startsWith('AD') || c.startsWith('AI'));

          if (hasIT) extractedDepartment = 'INFORMATION TECHNOLOGY';
          else if (hasCS) extractedDepartment = 'COMPUTER SCIENCE AND ENGINEERING';
          else if (hasEC) extractedDepartment = 'ELECTRONICS AND COMMUNICATION ENGINEERING';
          else if (hasEE) extractedDepartment = 'ELECTRICAL AND ELECTRONICS ENGINEERING';
          else if (hasME) extractedDepartment = 'MECHANICAL ENGINEERING';
          else if (hasAD) extractedDepartment = 'ARTIFICIAL INTELLIGENCE AND DATA SCIENCE';
        }

        // STEP 2.5: Determine Student Data Start Row
        let studentDataStartRowIndex = anchorRowIndex + 1;

        while (studentDataStartRowIndex < rawMatrix.length) {
          const rCells = rawMatrix[studentDataStartRowIndex] || [];
          const txtReg = regNoColIndex !== -1 ? String(rCells[regNoColIndex] || '').trim() : '';
          const txtName = nameColIndex !== -1 ? String(rCells[nameColIndex] || '').trim() : '';

          if (
            isFacultyNameCell(txtReg) ||
            isFacultyNameCell(txtName) ||
            isDateCell(txtReg) ||
            isDateCell(txtName) ||
            /^(marks|cie|grade|max marks|register|name|code)/i.test(txtReg) ||
            /^(marks|cie|grade|max marks|register|name|code)/i.test(txtName)
          ) {
            studentDataStartRowIndex++;
            continue;
          }

          if (txtReg || txtName) {
            break;
          }

          studentDataStartRowIndex++;
        }

        // STEP 3: Detect Grouped Subject Suffix Columns (_1, _2, _3 ... _n) for University & CIE
        interface UnivGroupSpec {
          groupNum: number;
          codeCol: number;
          titleCol: number;
          gradeCol: number;
          passCol: number;
          semCol: number;
          markCol: number;
        }

        interface CieGroupSpec {
          groupNum: number;
          codeCol: number;
          titleCol: number;
          cie1MarksCol: number;
          cie2MarksCol: number;
          modelMarksCol: number;
          passCol: number;
          semCol: number;
        }

        const univGroupsMap = new Map<number, UnivGroupSpec>();
        const cieGroupsMap = new Map<number, CieGroupSpec>();

        for (let c = 0; c < headerNames.length; c++) {
          if (c === regNoColIndex || c === nameColIndex) continue;

          const rawHeader = String(headerNames[c] || '').trim();
          if (!rawHeader || isPlaceholderToken(rawHeader)) continue;

          // Match trailing digit group index N (e.g. Code_1 -> N=1, CIE_Code_7 -> N=7, CIE1_Marks_2 -> N=2)
          const match = rawHeader.match(/^(.*?)(?:[\s_.-]+)?(\d+)$/i);
          if (!match) continue;

          const rawPrefix = match[1].trim();
          const num = Number(match[2]);
          const cleanPrefix = rawPrefix.toLowerCase().replace(/[^a-z0-9]/g, '');
          const isCieHeader = cleanPrefix.includes('cie') || cleanPrefix.includes('model') || /cie|model|internal/i.test(rawHeader);

          // Check if prefix is a recognized group keyword before creating a grouped spec
          const isGroupKeyword = /(code|subject|sub|title|name|grade|pass|fail|result|status|sem|cie|model|mark|score|univ|university)/i.test(cleanPrefix) ||
                                 /cie|model|univ|university/i.test(rawHeader);
          if (!isGroupKeyword) continue;

          const targetMap = isCieHeader ? cieGroupsMap : univGroupsMap;

          if (!targetMap.has(num)) {
            targetMap.set(num, {
              groupNum: num,
              codeCol: -1,
              titleCol: -1,
              gradeCol: -1,
              passCol: -1,
              cie1MarksCol: -1,
              cie2MarksCol: -1,
              modelMarksCol: -1,
              semCol: -1,
            });
          }

          const spec = targetMap.get(num)!;

          if (isCieHeader) {
            // Strict CIE / Model Exam Header Classifier
            if (cleanPrefix.includes('code')) {
              spec.codeCol = c;
            } else if (cleanPrefix.includes('subject') || cleanPrefix.includes('title') || cleanPrefix.includes('name')) {
              spec.titleCol = c;
            } else if (cleanPrefix.includes('model') || cleanPrefix.includes('mod') || cleanPrefix.includes('mark3') || cleanPrefix.includes('marks3')) {
              spec.modelMarksCol = c;
            } else if (cleanPrefix.includes('cie2') || cleanPrefix.includes('cie_2') || cleanPrefix.includes('cieii') || cleanPrefix.includes('mark2') || cleanPrefix.includes('marks2')) {
              spec.cie2MarksCol = c;
            } else if (cleanPrefix.includes('cie1') || cleanPrefix.includes('cie_1') || cleanPrefix.includes('ciei') || cleanPrefix.includes('mark1') || cleanPrefix.includes('marks1')) {
              spec.cie1MarksCol = c;
            } else if (cleanPrefix.includes('mark') || cleanPrefix.includes('score')) {
              if (/model/i.test(rawHeader) || cleanPrefix.includes('model')) spec.modelMarksCol = c;
              else if (spec.cie1MarksCol === -1) spec.cie1MarksCol = c;
              else if (spec.cie2MarksCol === -1 && c !== spec.cie1MarksCol) spec.cie2MarksCol = c;
            } else if (cleanPrefix.includes('pass') || cleanPrefix.includes('fail') || cleanPrefix.includes('result') || cleanPrefix.includes('status')) {
              spec.passCol = c;
            } else if (cleanPrefix.includes('sem')) {
              spec.semCol = c;
            }
          } else {
            // Strict University Header Classifier (Code_N, Subject_N, Grade_N, Pass_N, Mark_N)
            if (cleanPrefix.includes('code')) {
              spec.codeCol = c;
            } else if (cleanPrefix.includes('subject') || cleanPrefix.includes('title') || cleanPrefix.includes('name')) {
              spec.titleCol = c;
            } else if (cleanPrefix.includes('grade')) {
              spec.gradeCol = c;
            } else if (cleanPrefix.includes('pass') || cleanPrefix.includes('fail') || cleanPrefix.includes('result') || cleanPrefix.includes('status')) {
              spec.passCol = c;
            } else if (cleanPrefix.includes('sem')) {
              spec.semCol = c;
            } else if (cleanPrefix.includes('mark') || cleanPrefix.includes('score')) {
              spec.markCol = c;
            }
          }
        }

        // Secondary Pass to ensure Grade_N, CIE, and Model marks columns are explicitly resolved if missed
        univGroupsMap.forEach((spec, gNum) => {
          if (spec.gradeCol === -1) {
            for (let c = 0; c < headerNames.length; c++) {
              const h = headerNames[c].toLowerCase().replace(/[^a-z0-9]/g, '');
              if (h === `grade${gNum}` || h === `grade0${gNum}` || h.startsWith(`grade${gNum}`)) {
                spec.gradeCol = c;
                break;
              }
            }
          }
        });

        cieGroupsMap.forEach((spec, gNum) => {
          if (spec.cie1MarksCol === -1) {
            for (let c = 0; c < headerNames.length; c++) {
              const h = headerNames[c].toLowerCase().replace(/[^a-z0-9]/g, '');
              if (h === `cie1marks${gNum}` || h === `cie1mark${gNum}` || h.includes(`cie1marks${gNum}`) || h.includes(`cie1_marks_${gNum}`)) {
                spec.cie1MarksCol = c;
                break;
              }
            }
          }
          if (spec.cie2MarksCol === -1) {
            for (let c = 0; c < headerNames.length; c++) {
              const h = headerNames[c].toLowerCase().replace(/[^a-z0-9]/g, '');
              if (h === `cie2marks${gNum}` || h === `cie2mark${gNum}` || h.includes(`cie2marks${gNum}`) || h.includes(`cie2_marks_${gNum}`)) {
                spec.cie2MarksCol = c;
                break;
              }
            }
          }
          if (spec.modelMarksCol === -1) {
            for (let c = 0; c < headerNames.length; c++) {
              const h = headerNames[c].toLowerCase().replace(/[^a-z0-9]/g, '');
              if (h === `modelmarks${gNum}` || h === `modelmark${gNum}` || h === `model${gNum}` || h.includes(`modelmarks${gNum}`) || h.includes(`model_marks_${gNum}`)) {
                spec.modelMarksCol = c;
                break;
              }
            }
          }
        });

        // Merge split groups (e.g. Subject_1 went to univGroupsMap, CIE1_Marks_1 went to cieGroupsMap)
        for (const [gNum, cieSpec] of Array.from(cieGroupsMap.entries())) {
          const univSpec = univGroupsMap.get(gNum);
          if (univSpec) {
            if (cieSpec.codeCol === -1) cieSpec.codeCol = univSpec.codeCol;
            if (cieSpec.titleCol === -1) cieSpec.titleCol = univSpec.titleCol;
            if (univSpec.markCol === -1) {
              univSpec.markCol = cieSpec.cie1MarksCol !== -1 ? cieSpec.cie1MarksCol : cieSpec.cie2MarksCol;
            }
          }
        }

        // Clean up empty specs with no mapped columns
        for (const [gNum, spec] of Array.from(univGroupsMap.entries())) {
          if (spec.codeCol === -1 && spec.titleCol === -1 && spec.gradeCol === -1 && spec.passCol === -1 && spec.markCol === -1) {
            univGroupsMap.delete(gNum);
          }
        }
        for (const [gNum, spec] of Array.from(cieGroupsMap.entries())) {
          if (spec.codeCol === -1 && spec.titleCol === -1 && spec.cie1MarksCol === -1 && spec.cie2MarksCol === -1 && spec.passCol === -1) {
            cieGroupsMap.delete(gNum);
          }
        }

        const sortedUnivSpecs = Array.from(univGroupsMap.values()).sort((a, b) => a.groupNum - b.groupNum);
        const sortedCieSpecs = Array.from(cieGroupsMap.values()).sort((a, b) => a.groupNum - b.groupNum);

        // Fallback: Direct Subject Column parsing if no suffixes detected
        const directSubjectCols: { colIndex: number; code: string; title: string }[] = [];

        if (sortedUnivSpecs.length === 0 && sortedCieSpecs.length === 0) {
          const candidateCols: number[] = [];

          for (let c = 0; c < headerNames.length; c++) {
            if (c === regNoColIndex || c === nameColIndex) continue;

            let rawHeader = String(headerNames[c] || '').trim();
            let cleanHeader = rawHeader.toLowerCase();

            if (
              !rawHeader ||
              isFacultyNameCell(rawHeader) ||
              isPlaceholderToken(rawHeader) ||
              cleanHeader.startsWith('__empty')
            ) {
              continue;
            }

            const isReg = c === regNoColIndex || /^(reg|reg\.no|reg_no|regno|roll|roll\.no|rollno|register|registration)/i.test(cleanHeader);
            const isName = c === nameColIndex || /^(name|student|student_name|candidate|name of the student)/i.test(cleanHeader);
            const isDept = c === deptColIndex || /^(dept|department|branch)/i.test(cleanHeader);
            const isRegu = c === reguColIndex || /^(regulation)/i.test(cleanHeader);
            const isNonSubHeader = nonSubjectHeaders.some((ik) => {
              const cleanIk = ik.trim().toLowerCase().replace(/[\s_.-]+/g, '');
              const cleanK = cleanHeader.replace(/[\s_.-]+/g, '');
              return cleanK === cleanIk || cleanK.includes(cleanIk);
            }) || /ar?rear|rank|gpa|cgpa|total|credit|cerdit|d\/h|t\/e/i.test(cleanHeader);

            if (isReg || isName || isDept || isRegu || isNonSubHeader) {
              continue;
            }

            candidateCols.push(c);
          }

          candidateCols.forEach((c, idx) => {
            let finalCode = '';
            let rawTitle = '';

            // Priority 1: Positional mapping from excelSubjectList if available
            if (excelSubjectList[idx]) {
              finalCode = excelSubjectList[idx].code;
              rawTitle = excelSubjectList[idx].title;
            } else {
              const rawHeader = String(headerNames[c] || '').trim();
              const baseCode = rawHeader.toUpperCase();
              finalCode = baseCode;
              rawTitle = excelSubjectMaster[baseCode] || rawHeader;
            }

            const finalTitle = resolveSubjectTitle(finalCode, rawTitle);
            directSubjectCols.push({ colIndex: c, code: finalCode, title: finalTitle });
          });
        }

        // STEP 5: Process Every Student Data Row dynamically
        const parsedStudents: StudentRecord[] = [];

        const knownSubjectCodes = new Set<string>();
        Object.keys(excelSubjectMaster).forEach((k) => knownSubjectCodes.add(k.toUpperCase()));
        excelSubjectList.forEach((s) => knownSubjectCodes.add(s.code.toUpperCase()));
        directSubjectCols.forEach((s) => knownSubjectCodes.add(s.code.toUpperCase()));

        for (let r = studentDataStartRowIndex; r < rawMatrix.length; r++) {
          const rowCells = rawMatrix[r] || [];

          const hasAnyData = rowCells.some((cell) => cell !== undefined && cell !== null && String(cell).trim() !== '');
          if (!hasAnyData) continue;

          // Read Register Number & Name strictly from Excel row
          const rawRegVal = regNoColIndex !== -1 ? rowCells[regNoColIndex] : rowCells[0];
          const rawNameVal = nameColIndex !== -1 ? rowCells[nameColIndex] : rowCells[1];

          let regNoStr = String(rawRegVal || '').trim();
          let nameStr = String(rawNameVal || '').trim();

          if (isDateCell(regNoStr) || isFacultyNameCell(regNoStr) || isPlaceholderToken(regNoStr)) regNoStr = '';
          if (isDateCell(nameStr) || isFacultyNameCell(nameStr) || isPlaceholderToken(nameStr)) nameStr = '';

          // Skip non-student rows (header labels, bottom subject reference block, HOD footers)
          if (isNonStudentRow(regNoStr, nameStr, knownSubjectCodes)) {
            continue;
          }

          // Read GPA / CGPA / Class Obtained strictly from Excel
          const rawGPA = findCellValue(rowCells, headerNames, ['gpa', 'gpa_05', 'gpa 5', 'gpa_5', 'sem 5 gpa', 'gpa5']);
          const rawCGPA = findCellValue(rowCells, headerNames, ['cgpa', 'cgpa_05', 'cgpa 5', 'cgpa_5', 'sem 5 cgpa', 'cgpa5']);
          const rawClass = findCellValue(rowCells, headerNames, ['class_obtained', 'class obtained', 'class']);

          const gpaVal = rawGPA !== undefined && rawGPA !== null && String(rawGPA).trim() !== '' ? (isNaN(Number(rawGPA)) ? String(rawGPA) : Number(rawGPA)) : undefined;
          const cgpaVal = rawCGPA !== undefined && rawCGPA !== null && String(rawCGPA).trim() !== '' ? (isNaN(Number(rawCGPA)) ? String(rawCGPA) : Number(rawCGPA)) : undefined;
          const classObtained = rawClass !== undefined && rawClass !== null ? String(rawClass).trim().toUpperCase() : '';

          // Read Semester GPAs, CGPAs, Arrears strictly from Excel
          const gpaBySem: Record<string, number | string> = {};
          const cgpaBySem: Record<string, number | string> = {};
          const arrearsMap: Record<string, number | string> = {};

          for (let s = 1; s <= 7; s++) {
            const semKey = `0${s}`;
            const sNum = String(s);

            const valG = findCellValue(rowCells, headerNames, [
              `gpa0${s}`, `gpa 0${s}`, `gpa ${s}`, `gpa_0${s}`, `gpa_${s}`, `gpa${s}`,
              `sem ${s} gpa`, `sem 0${s} gpa`, `sem_${s}_gpa`, `s${s}_gpa`
            ]);

            const valC = findCellValue(rowCells, headerNames, [
              `cgpa0${s}`, `cgpa 0${s}`, `cgpa ${s}`, `cgpa_0${s}`, `cgpa_${s}`, `cgpa${s}`,
              `sem ${s} cgpa`, `sem 0${s} cgpa`, `sem_${s}_cgpa`, `s${s}_cgpa`
            ]);

            const valA = findCellValue(rowCells, headerNames, [
              `arrears0${s}`, `arrears 0${s}`, `arrears ${s}`, `arrears_0${s}`, `arrears_${s}`, `arrears${s}`,
              `arr 0${s}`, `arr ${s}`, `sem ${s} arrears`, `s${s}_arrears`
            ]);

            gpaBySem[semKey] = valG !== undefined && valG !== null && String(valG).trim() !== '' ? String(valG) : '';
            cgpaBySem[semKey] = valC !== undefined && valC !== null && String(valC).trim() !== '' ? String(valC) : '';
            arrearsMap[semKey] = valA !== undefined && valA !== null && String(valA).trim() !== '' ? (isNaN(Number(valA)) ? String(valA) : Number(valA)) : '';

            gpaBySem[sNum] = gpaBySem[semKey];
            cgpaBySem[sNum] = cgpaBySem[semKey];
            arrearsMap[sNum] = arrearsMap[semKey];
          }

          // Process Subject Rows (University Top Table & CIE Bottom Table - SEPARATE MAPPINGS)
          const universityResults: SubjectResult[] = [];
          const internalEvalResults: InternalEvalResult[] = [];

          // 1. University Results Table: Read ONLY Code_1..N, Subject_1..N, Grade_1..N, Pass_1..N, Mark_1..N
          sortedUnivSpecs.forEach((spec) => {
            const codeRaw = spec.codeCol !== -1 ? rowCells[spec.codeCol] : '';
            const titleRaw = spec.titleCol !== -1 ? rowCells[spec.titleCol] : '';
            const gradeRaw = spec.gradeCol !== -1 ? rowCells[spec.gradeCol] : '';
            const passRaw = spec.passCol !== -1 ? rowCells[spec.passCol] : '';
            const semRaw = spec.semCol !== -1 ? rowCells[spec.semCol] : '';
            const markRaw = spec.markCol !== -1 ? rowCells[spec.markCol] : '';

            const codeStr = String(codeRaw || '').trim().toUpperCase();
            let titleStr = String(titleRaw || '').trim();
            const gradeStr = String(gradeRaw || '').trim().toUpperCase();
            const passStr = String(passRaw || '').trim().toUpperCase();
            const markStr = String(markRaw !== undefined && markRaw !== null ? markRaw : '').trim();
            const semStr = semRaw ? cleanSemesterValue(semRaw) : '';

            if (!codeStr && !titleStr && !gradeStr && !passStr && !markStr) return;

            titleStr = resolveSubjectTitle(codeStr, titleStr);

            const passFail = evaluatePassFail(passStr, gradeStr);

            universityResults.push({
              sem: semStr || extractedSemester || 'V',
              code: codeStr,
              title: titleStr,
              grade: gradeStr,
              passFail,
              mark: markStr,
            });
          });

          // 2. CIE / Model Results Table: Read CIE_Code_1..N, CIE_Subject_1..N, CIE1_Marks_1..N, CIE2_Marks_1..N, Model_Marks_1..N
          if (sortedCieSpecs.length > 0) {
            sortedCieSpecs.forEach((spec) => {
              const codeRaw = spec.codeCol !== -1 ? rowCells[spec.codeCol] : '';
              const titleRaw = spec.titleCol !== -1 ? rowCells[spec.titleCol] : '';
              const cie1MarksRaw = spec.cie1MarksCol !== -1 ? rowCells[spec.cie1MarksCol] : '';
              const cie2MarksRaw = spec.cie2MarksCol !== -1 ? rowCells[spec.cie2MarksCol] : '';
              const modelMarksRaw = spec.modelMarksCol !== -1 ? rowCells[spec.modelMarksCol] : '';
              const passRaw = spec.passCol !== -1 ? rowCells[spec.passCol] : '';
              const semRaw = spec.semCol !== -1 ? rowCells[spec.semCol] : '';

              const codeStr = String(codeRaw || '').trim().toUpperCase();
              let titleStr = String(titleRaw || '').trim();
              const cie1MarksStr = String(cie1MarksRaw !== undefined && cie1MarksRaw !== null ? cie1MarksRaw : '').trim();
              const cie2MarksStr = String(cie2MarksRaw !== undefined && cie2MarksRaw !== null ? cie2MarksRaw : '').trim();
              const modelMarksStr = String(modelMarksRaw !== undefined && modelMarksRaw !== null ? modelMarksRaw : '').trim();
              const passStr = String(passRaw || '').trim().toUpperCase();
              const semStr = semRaw ? cleanSemesterValue(semRaw) : '';

              if (!codeStr && !titleStr && !cie1MarksStr && !cie2MarksStr && !modelMarksStr && !passStr) return;

              titleStr = resolveSubjectTitle(codeStr, titleStr);

              const cie1Pf = evaluatePassFail(passStr, cie1MarksStr);
              const cie2Pf = evaluatePassFail(passStr, cie2MarksStr);
              const modelPf = evaluatePassFail(passStr, modelMarksStr);

              internalEvalResults.push({
                sem: semStr || extractedSemester || 'VI',
                code: codeStr,
                title: titleStr,
                cie1Marks: cie1MarksStr,
                cie1PassFail: cie1Pf,
                cie2Marks: cie2MarksStr,
                cie2PassFail: cie2Pf,
                modelMarks: modelMarksStr,
                modelPassFail: modelPf,
                passFail: modelPf || cie2Pf || cie1Pf,
              });
            });
          }

          // Fallback for Direct Column Mark Sheet format
          if (sortedUnivSpecs.length === 0 && sortedCieSpecs.length === 0) {
            directSubjectCols.forEach((sub) => {
              const cellVal = rowCells[sub.colIndex];
              let markNum: number | string = '';
              let grade = '';
              let passFail: 'PASS' | 'FAIL' | '' = '';

              if (cellVal !== undefined && cellVal !== null && String(cellVal).trim() !== '') {
                const valStr = String(cellVal).trim();
                const parsedNum = Number(valStr);

                if (!isNaN(parsedNum)) {
                  markNum = parsedNum;
                  passFail = parsedNum >= 50 ? 'PASS' : 'FAIL';

                  if (parsedNum >= 90) grade = 'O';
                  else if (parsedNum >= 81) grade = 'A+';
                  else if (parsedNum >= 73) grade = 'A';
                  else if (parsedNum >= 65) grade = 'B+';
                  else if (parsedNum >= 50) grade = 'B';
                  else {
                    grade = 'RA';
                    passFail = 'FAIL';
                  }
                } else {
                  grade = valStr.toUpperCase();
                  passFail = evaluatePassFail(valStr, grade);
                  markNum = valStr;
                }
              }

              // Resolve title using resolveSubjectTitle
              const resolvedTitle = resolveSubjectTitle(sub.code, sub.title);

              universityResults.push({
                sem: extractedSemester || 'V',
                code: sub.code,
                title: resolvedTitle,
                grade,
                passFail,
                mark: markNum,
              });
            });
          }

          const rawDeptVal = findCellValue(rowCells, headerNames, [
            'department', 'dept', 'branch', 'dept_name', 'department_name', 'dept name', 'department name'
          ]);

          const rawSemVal = findCellValue(rowCells, headerNames, [
            'semester', 'sem', 'sem_name', 'sem name', 'current_sem', 'current sem'
          ]);

          const rawAcadVal = findCellValue(rowCells, headerNames, [
            'academic year', 'academicyear', 'academic_year', 'academic_year:', 'academic year:', 'ay', 'acad year', 'acad_year'
          ]);

          let studentDept = rawDeptVal !== undefined && rawDeptVal !== null && String(rawDeptVal).trim() !== ''
            ? cleanDepartmentName(String(rawDeptVal))
            : (deptColIndex !== -1 && rowCells[deptColIndex] ? cleanDepartmentName(String(rowCells[deptColIndex])) : extractedDepartment);

          if (!studentDept && extractedDepartment) {
            studentDept = extractedDepartment;
          }

          let studentSem = rawSemVal !== undefined && rawSemVal !== null && String(rawSemVal).trim() !== ''
            ? cleanSemesterValue(rawSemVal)
            : extractedSemester;

          let studentAcadYear = rawAcadVal !== undefined && rawAcadVal !== null && String(rawAcadVal).trim() !== ''
            ? String(rawAcadVal).trim()
            : extractedAcademicYear;

          if (studentAcadYear) {
            const yrMatch = studentAcadYear.match(/(\d{4}\s*[-–/]\s*(?:\d{4}|\d{2}))/);
            if (yrMatch && yrMatch[1]) {
              const rawYearPair = yrMatch[1].replace(/\s+/g, '');
              const parts = rawYearPair.split(/[-–/]/);
              if (parts.length === 2) {
                const startYr = parts[0];
                let endYr = parts[1];
                if (endYr.length === 2) endYr = startYr.substring(0, 2) + endYr;
                studentAcadYear = `${startYr}-${endYr}`;
              } else {
                studentAcadYear = rawYearPair;
              }
            }
          }

          parsedStudents.push({
            id: `std-dyn-${r}`,
            regNo: regNoStr,
            name: nameStr.toUpperCase(),
            department: (studentDept || extractedDepartment).toUpperCase(),
            regulation: extractedRegulation,
            currentSemester: studentSem,
            academicYear: studentAcadYear,
            universityResults,
            gpa: gpaVal,
            cgpa: cgpaVal,
            classObtained,
            arrears: arrearsMap,
            gpaBySem,
            cgpaBySem,
            internalEvalResults,
          });
        }

        if (parsedStudents.length === 0) {
          throw new Error('No valid student records found in uploaded Excel file.');
        }

        const hasAcademicYear = parsedStudents.some((s) => Boolean(s.academicYear)) || Boolean(extractedAcademicYear);
        if (!hasAcademicYear) {
          throw new Error('Academic Year missing in uploaded Excel file. Please ensure a cell or column for Academic Year (e.g. "Academic Year", "AY") is included.');
        }

        // BROWSER CONSOLE LOGGING AS SPECIFIED BY USER
        console.log('==============================================');
        console.log('Detected Columns:', headerNames.filter((h) => Boolean(h)));
        console.log('==============================================');
        console.log('Generated Object for Student 1:', parsedStudents[0]);
        console.log('==============================================');

        if (regNoColIndex === -1) {
          console.warn('Placeholder Warning:', {
            Placeholder: '{{REGISTER_NO}}',
            ExpectedColumn: 'Register No / Reg.No / RegNo',
            MatchedColumn: 'None',
            Reason: 'No column matching Register Number found in Excel header',
          });
        }
        if (nameColIndex === -1) {
          console.warn('Placeholder Warning:', {
            Placeholder: '{{STUDENT_NAME}}',
            ExpectedColumn: 'Name / Student Name / Candidate Name',
            MatchedColumn: 'None',
            Reason: 'No column matching Student Name found in Excel header',
          });
        }

        if (sortedUnivSpecs.length === 0 && directSubjectCols.length === 0) {
          console.warn('Placeholder Warning:', {
            Placeholder: '{{SEM}}, {{CODE}}, {{TITLE}}, {{GRADE}}, {{PASS_FAIL}}',
            ExpectedColumn: 'Code_1, Subject_1, Grade_1, Pass_1',
            MatchedColumn: 'None',
            Reason: 'No University subject groups detected in uploaded Excel',
          });
        }

        if (sortedCieSpecs.length === 0) {
          console.warn('Placeholder Warning:', {
            Placeholder: '{{CODE}}, {{TITLE}}, {{CIE_MARKS}}, {{PASS_FAIL}}',
            ExpectedColumn: 'CIE_Code_1, CIE_Subject_1, CIE_Marks_1, CIE_Pass_1',
            MatchedColumn: sortedUnivSpecs.length > 0 ? 'Fallback to University Subject Groups' : 'None',
            Reason: sortedUnivSpecs.length > 0 ? 'Separate CIE columns missing in Excel; using University subject groups fallback' : 'No CIE subject columns detected',
          });
        }

        resolve(parsedStudents);
      } catch (err: any) {
        reject(err.message || 'Failed to parse Excel file. Ensure valid .xlsx format.');
      }
    };

    reader.onerror = () => reject('Error reading file from disk');
    reader.readAsArrayBuffer(file);
  });
};
