import * as XLSX from 'xlsx';
import { StudentRecord, SubjectResult, InternalEvalResult } from '../types';

// Subject Master Mapping Dictionary for clean human-readable titles (optional lookup)
const knownTitles: Record<string, string> = {
  NS: 'Network Security',
  OOSE: 'Object Oriented Software Engineering',
  'ESA IOT': 'Embedded Systems & IoT',
  MA: 'Mobile Applications',
  STA: 'Software Testing & Automation',
  DW: 'Data Warehousing & Data Mining',
  OCE351: 'Environment and Social Impact Assessment',
  CS3591: 'Computer Networks',
  CS3501: 'Compiler Design',
  CB3491: 'Cryptography and Cyber Security',
  CS3551: 'Distributed Computing',
  CS3511: 'Object Oriented Software Engineering',
  CS3561: 'Open Source Technologies',
  CS3691: 'Artificial Intelligence',
  CS3601: 'Mobile Computing',
  CS3651: 'Cloud Computing Architecture',
  CS3611: 'Data Analytics Laboratory',
  CS3602: 'Compiler Design & Tools',
  CS3603: 'Design and Analysis of Algorithms',
  CS3604: 'Web Technology',
  CS3605: 'Software Engineering',
  AI: 'Artificial Intelligence',
  ML: 'Machine Learning',
  DBMS: 'Database Management Systems',
  CN: 'Computer Networks',
  OS: 'Operating Systems',
  DSA: 'Data Structures & Algorithms',
  SE: 'Software Engineering',
  ECE: 'Electronics & Communication',
  EEE: 'Electrical & Electronics',
  MECH: 'Mechanical Engineering',
  CIVIL: 'Civil Engineering',
};

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
  'arrears', 'total', 'total marks', 'total_marks', 'percentage', 'result', 'pass/fail', 'passfail', 'status'
];

// Helper to detect if a cell string is an Exam Date
const isDateCell = (str: string): boolean => {
  if (!str) return false;
  const clean = str.trim();
  if (/^\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4}$/.test(clean)) return true;
  if (/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(clean)) return true;
  return false;
};

// Helper to detect if a cell string is a Faculty Name / Staff Title
const isFacultyNameCell = (str: string): boolean => {
  if (!str) return false;
  const clean = str.trim().toLowerCase();
  return /^(mr\.|mrs\.|dr\.|prof\.|ms\.|ap\/|asp\/|hod\/|prof\/)/i.test(clean) ||
         /\b(soloman|dhanalakshmi|raghavan|prof|faculty|staff)\b/i.test(clean);
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

        if (!rawMatrix || rawMatrix.length === 0) {
          throw new Error('Excel sheet is empty or invalid.');
        }

        // STEP 1: Locate Student Table Anchor Row (Header Row containing Reg.No / Name)
        let anchorRowIndex = -1;
        let regNoColIndex = -1;
        let nameColIndex = -1;
        let deptColIndex = -1;
        let reguColIndex = -1;

        for (let r = 0; r < Math.min(25, rawMatrix.length); r++) {
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

        // STEP 2: Locate the true Header Row by counting column header keywords across top rows (0..10)
        let bestHeaderRowIndex = -1;
        let maxHeaderMatches = -1;

        for (let r = 0; r <= Math.min(10, rawMatrix.length - 1); r++) {
          const rowCells = rawMatrix[r] || [];
          let matches = 0;
          for (let c = 0; c < rowCells.length; c++) {
            const txt = String(rowCells[c] || '').trim();
            if (!txt || isPlaceholderToken(txt) || isDateCell(txt) || isFacultyNameCell(txt)) continue;

            // Check if cell looks like a column header (e.g. Code_1, Grade_1, Reg.No, Subject_1, Pass_1)
            if (/^(reg|name|code|subject|grade|pass|cie|sem|gpa|cgpa|arr)/i.test(txt) || /(code|grade|pass|subject|mark)[\s_.-]*\d+/i.test(txt)) {
              matches++;
            }
          }
          if (matches > maxHeaderMatches) {
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

        // Extract metadata strings ONLY if present in top rows of Excel
        let extractedDepartment = '';
        let extractedRegulation = '';

        for (let r = 0; r < Math.max(anchorRowIndex, 5); r++) {
          const rCells = rawMatrix[r] || [];
          for (let c = 0; c < rCells.length; c++) {
            const txt = String(rCells[c] || '').trim();
            if (/dept/i.test(txt) && c + 1 < rCells.length && rCells[c + 1]) {
              const val = String(rCells[c + 1]).trim();
              if (val) extractedDepartment = val;
            } else if (/dept\s*:\s*(.*)/i.test(txt)) {
              const match = txt.match(/dept\s*:\s*(.*)/i);
              if (match && match[1]) extractedDepartment = match[1].trim();
            } else if (/regulation/i.test(txt) && c + 1 < rCells.length && rCells[c + 1]) {
              const val = String(rCells[c + 1]).trim();
              if (val) extractedRegulation = val;
            } else if (/regulation\s*:\s*(.*)/i.test(txt)) {
              const match = txt.match(/regulation\s*:\s*(.*)/i);
              if (match && match[1]) extractedRegulation = match[1].trim();
            }
          }
        }

        // STEP 3: Detect Grouped Subject Suffix Columns (_1, _2, _3 ... _n) for University & CIE
        interface SubjectGroupSpec {
          groupNum: number;
          codeCol: number;
          titleCol: number;
          gradeCol: number;
          passCol: number;
          cie1MarksCol: number;
          cie2MarksCol: number;
          semCol: number;
        }

        const univGroupsMap = new Map<number, SubjectGroupSpec>();
        const cieGroupsMap = new Map<number, SubjectGroupSpec>();

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
          const isCieHeader = cleanPrefix.includes('cie') || /cie/i.test(rawHeader);

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
              semCol: -1,
            });
          }

          const spec = targetMap.get(num)!;

          if (isCieHeader) {
            // Strict CIE Header Classifier (CIE_Code_N, CIE_Subject_N, CIE1_Marks_N, CIE2_Marks_N, CIE_Pass_N)
            if (cleanPrefix.includes('code')) {
              spec.codeCol = c;
            } else if (cleanPrefix.includes('subject') || cleanPrefix.includes('title') || cleanPrefix.includes('name')) {
              spec.titleCol = c;
            } else if (cleanPrefix.includes('cie2') || cleanPrefix.includes('cie_2') || cleanPrefix.includes('cieii') || cleanPrefix.includes('mark2') || cleanPrefix.includes('marks2')) {
              spec.cie2MarksCol = c;
            } else if (cleanPrefix.includes('cie1') || cleanPrefix.includes('cie_1') || cleanPrefix.includes('ciei') || cleanPrefix.includes('mark1') || cleanPrefix.includes('marks1')) {
              spec.cie1MarksCol = c;
            } else if (cleanPrefix.includes('mark') || cleanPrefix.includes('score')) {
              if (spec.cie1MarksCol === -1) spec.cie1MarksCol = c;
              else if (spec.cie2MarksCol === -1 && c !== spec.cie1MarksCol) spec.cie2MarksCol = c;
            } else if (cleanPrefix.includes('pass') || cleanPrefix.includes('fail') || cleanPrefix.includes('result') || cleanPrefix.includes('status')) {
              spec.passCol = c;
            } else if (cleanPrefix.includes('sem')) {
              spec.semCol = c;
            }
          } else {
            // Strict University Header Classifier (Code_N, Subject_N, Grade_N, Pass_N)
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
            }
          }
        }

        // Secondary Pass to ensure Grade_N and CIE marks columns are explicitly resolved if missed
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
        });

        const sortedUnivSpecs = Array.from(univGroupsMap.values()).sort((a, b) => a.groupNum - b.groupNum);
        const sortedCieSpecs = Array.from(cieGroupsMap.values()).sort((a, b) => a.groupNum - b.groupNum);

        // Fallback: Direct Subject Column parsing if no suffixes detected
        const directSubjectCols: { colIndex: number; code: string; title: string }[] = [];

        if (sortedUnivSpecs.length === 0 && sortedCieSpecs.length === 0) {
          for (let c = 0; c < headerNames.length; c++) {
            if (c === regNoColIndex || c === nameColIndex) continue;

            let rawHeader = String(headerNames[c] || '').trim();
            let cleanHeader = rawHeader.toLowerCase();

            if (
              !rawHeader ||
              isDateCell(rawHeader) ||
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
              return cleanK === cleanIk;
            });

            if (isReg || isName || isDept || isRegu || isNonSubHeader) {
              continue;
            }

            const code = rawHeader.toUpperCase();
            const title = knownTitles[code] || rawHeader;
            directSubjectCols.push({ colIndex: c, code, title });
          }
        }

        // STEP 4: Determine Student Data Start Row
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

        // STEP 5: Process Every Student Data Row dynamically
        const parsedStudents: StudentRecord[] = [];

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

          // Skip non-student rows
          if (!regNoStr && !nameStr) continue;

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

          // 1. University Results Table: Read ONLY Code_1..N, Subject_1..N, Grade_1..N, Pass_1..N
          sortedUnivSpecs.forEach((spec) => {
            const codeRaw = spec.codeCol !== -1 ? rowCells[spec.codeCol] : '';
            const titleRaw = spec.titleCol !== -1 ? rowCells[spec.titleCol] : '';
            const gradeRaw = spec.gradeCol !== -1 ? rowCells[spec.gradeCol] : '';
            const passRaw = spec.passCol !== -1 ? rowCells[spec.passCol] : '';
            const semRaw = spec.semCol !== -1 ? rowCells[spec.semCol] : '';

            const codeStr = String(codeRaw || '').trim().toUpperCase();
            let titleStr = String(titleRaw || '').trim();
            const gradeStr = String(gradeRaw || '').trim().toUpperCase();
            const passStr = String(passRaw || '').trim().toUpperCase();

            if (!codeStr && !titleStr && !gradeStr && !passStr) return;

            if (!titleStr && codeStr) {
              titleStr = knownTitles[codeStr] || codeStr;
            }

            const passFail = evaluatePassFail(passStr, gradeStr);
            const sem = semRaw ? String(semRaw).trim().toUpperCase() : 'V';

            universityResults.push({
              sem,
              code: codeStr,
              title: titleStr,
              grade: gradeStr,
              passFail,
            });
          });

          // 2. CIE Results Table: Read ONLY CIE_Code_1..N, CIE_Subject_1..N, CIE1_Marks_1..N, CIE2_Marks_1..N, CIE_Pass_1..N
          if (sortedCieSpecs.length > 0) {
            sortedCieSpecs.forEach((spec) => {
              const codeRaw = spec.codeCol !== -1 ? rowCells[spec.codeCol] : '';
              const titleRaw = spec.titleCol !== -1 ? rowCells[spec.titleCol] : '';
              const cie1MarksRaw = spec.cie1MarksCol !== -1 ? rowCells[spec.cie1MarksCol] : '';
              const cie2MarksRaw = spec.cie2MarksCol !== -1 ? rowCells[spec.cie2MarksCol] : '';
              const passRaw = spec.passCol !== -1 ? rowCells[spec.passCol] : '';
              const semRaw = spec.semCol !== -1 ? rowCells[spec.semCol] : '';

              const codeStr = String(codeRaw || '').trim().toUpperCase();
              let titleStr = String(titleRaw || '').trim();
              const cie1MarksStr = String(cie1MarksRaw !== undefined && cie1MarksRaw !== null ? cie1MarksRaw : '').trim();
              const cie2MarksStr = String(cie2MarksRaw !== undefined && cie2MarksRaw !== null ? cie2MarksRaw : '').trim();
              const passStr = String(passRaw || '').trim().toUpperCase();

              if (!codeStr && !titleStr && !cie1MarksStr && !cie2MarksStr && !passStr) return;

              if (!titleStr && codeStr) {
                titleStr = knownTitles[codeStr] || codeStr;
              }

              const passFail = evaluatePassFail(passStr, cie1MarksStr);
              const sem = semRaw ? String(semRaw).trim().toUpperCase() : 'VI';

              internalEvalResults.push({
                sem,
                code: codeStr,
                title: titleStr,
                cie1Marks: cie1MarksStr,
                cie2Marks: cie2MarksStr,
                passFail,
              });
            });
          }

          // Fallback if no separate CIE specs found but University specs exist
          if (sortedCieSpecs.length === 0 && sortedUnivSpecs.length > 0) {
            universityResults.forEach((sub) => {
              internalEvalResults.push({
                sem: 'VI',
                code: sub.code,
                title: sub.title,
                cie1Marks: sub.grade,
                passFail: sub.passFail,
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

              universityResults.push({
                sem: 'V',
                code: sub.code,
                title: sub.title,
                grade,
                passFail,
              });

              internalEvalResults.push({
                sem: 'VI',
                code: sub.code,
                title: sub.title,
                cie1Marks: markNum,
                passFail,
              });
            });
          }

          const rawDeptVal = findCellValue(rowCells, headerNames, [
            'department', 'dept', 'branch', 'dept_name', 'department_name', 'dept name', 'department name'
          ]);

          let studentDept = rawDeptVal !== undefined && rawDeptVal !== null && String(rawDeptVal).trim() !== ''
            ? String(rawDeptVal).trim()
            : (deptColIndex !== -1 && rowCells[deptColIndex] ? String(rowCells[deptColIndex]).trim() : extractedDepartment);

          parsedStudents.push({
            id: `std-dyn-${r}`,
            regNo: regNoStr,
            name: nameStr.toUpperCase(),
            department: studentDept.toUpperCase(),
            regulation: extractedRegulation,
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
