import * as XLSX from 'xlsx';
import { StudentRecord, SubjectResult, InternalEvalResult } from '../types';

// Subject Master Mapping Dictionary for resolving clean human-readable titles from Subject Codes
const knownTitles: Record<string, string> = {
  // CSE / IT / AI&DS
  ACS108: 'Network Security',
  ACS109: 'Embedded Systems & IoT',
  ACS110: 'Mobile Applications Laboratory',
  ACS111: 'Software Testing & Automation',
  CS503: 'Design and Analysis of Algorithms',
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
  CS3491: 'Artificial Intelligence and Machine Learning',
  CS3451: 'Introduction to Operating Systems',
  CS3492: 'Database Management Systems',
  CS3401: 'Algorithms',
  CS3391: 'Object Oriented Programming',
  CS3351: 'Digital Principles and Computer Organization',
  CS3301: 'Data Structures',

  // General Engineering / Maths / Science
  GE3151: 'Problem Solving and Python Programming',
  MA3151: 'Matrices and Calculus',
  PH3151: 'Engineering Physics',
  CY3151: 'Engineering Chemistry',
  GE3152: 'Heritage of Tamils',
  GE3171: 'Problem Solving and Python Programming Laboratory',
  BS3171: 'Physics and Chemistry Laboratory',
  GE3172: 'English Laboratory',
  MA3251: 'Statistics and Numerical Methods',
  MA3354: 'Discrete Mathematics',
  MA3391: 'Probability and Statistics',
  GE3251: 'Professional English - II',
  GE3252: 'Tamils and Technology',

  // Short Codes / Abbreviations
  NS: 'Network Security',
  OOSE: 'Object Oriented Software Engineering',
  'ESA IOT': 'Embedded Systems & IoT',
  MA: 'Mobile Applications',
  STA: 'Software Testing & Automation',
  DW: 'Data Warehousing & Data Mining',
  OCE351: 'Environment and Social Impact Assessment',
  AI: 'Artificial Intelligence',
  ML: 'Machine Learning',
  DBMS: 'Database Management Systems',
  CN: 'Computer Networks',
  OS: 'Operating Systems',
  DSA: 'Data Structures & Algorithms',
  SE: 'Software Engineering',
};

// Helper to detect if a cell string is an Exam Date
const isDateCell = (str: string): boolean => {
  if (!str) return false;
  const clean = str.trim();
  if (/^\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4}$/.test(clean)) return true;
  if (/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(clean)) return true;
  return false;
};

// Helper to detect if a cell string is Title, Logo, Department Header, Credit Row, or Faculty metadata
const isMetadataRowCell = (str: string): boolean => {
  if (!str) return false;
  const clean = str.trim().toLowerCase();
  return /^(mr\.|mrs\.|dr\.|prof\.|ms\.|ap\/|asp\/|hod\/|prof\/)/i.test(clean) ||
         /\b(soloman|dhanalakshmi|raghavan|prof|faculty|staff|incharge|counsellor)\b/i.test(clean) ||
         /^(jeppiaar|department|continuous|internal|evaluation|maximum marks|max marks|credit value|credit|academic year|year\/sem|test name|result analysis)/i.test(clean);
};

/**
 * Normalizes Register Numbers to ensure exact matching across independent Excel files.
 * Handles numeric values, floats, strings with spaces, hyphens, and leading zeros.
 */
export const normalizeRegNo = (regNo: any): string => {
  if (regNo === undefined || regNo === null) return '';
  let str = typeof regNo === 'number' ? String(Math.floor(regNo)) : String(regNo);
  return str.trim().replace(/[\s_.-]+/g, '').toUpperCase();
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

// Evaluate Pass/Fail dynamically from grade or status without forcing defaults
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

// Search matching column index by candidate header names
const findColIndex = (headers: string[], candidates: string[]): number => {
  const cleanHeaders = headers.map((h) => String(h || '').toLowerCase().replace(/[^a-z0-9]/g, ''));
  for (let candidate of candidates) {
    const cleanCand = candidate.toLowerCase().replace(/[^a-z0-9]/g, '');
    const idx = cleanHeaders.findIndex((h) => h === cleanCand || h.includes(cleanCand));
    if (idx !== -1) return idx;
  }
  return -1;
};

/**
 * Universal Dynamic Excel Parser
 * Reads Subject Code and Grade for every subject, resolving Subject Name from Subject Master.
 * Maps UNIVERSITY_SUBJECTS strictly matching uploaded Excel without shifting grades or hardcoding names.
 */
export const parseExcelFile = (file: File): Promise<StudentRecord[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const fileName = (file.name || '').toLowerCase();
        const isCieFile = fileName.includes('cie') || fileName.includes('internal') || fileName.includes('eval');

        const allStudentsMap = new Map<string, StudentRecord>();

        // Filter out summary/statistics sheets (e.g. Table 3, Summary, Abstract)
        const validSheetNames = workbook.SheetNames.filter((sName) => {
          const cleanS = sName.trim().toLowerCase();
          if (
            /^(table\s*3|summary|statistic|stats|abstract|analytics|overview|consolidated)/i.test(cleanS) ||
            cleanS.includes('summary') || cleanS.includes('statistic') || cleanS.includes('abstract')
          ) {
            return false;
          }
          return true;
        });

        const targetSheetNames = validSheetNames.length > 0 ? validSheetNames : [workbook.SheetNames[0]];

        targetSheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          if (!worksheet) return;

          const rawMatrix: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
          if (!rawMatrix || rawMatrix.length === 0) return;

          // STEP 1: Dynamically locate Header Row containing "Reg No" / "REG.NO" / "Register No" and "Name"
          let headerRowIndex = -1;
          let regNoColIndex = -1;
          let nameColIndex = -1;
          let deptColIndex = -1;
          let reguColIndex = -1;

          for (let r = 0; r < Math.min(50, rawMatrix.length); r++) {
            const rowCells = rawMatrix[r] || [];
            let foundReg = -1;
            let foundName = -1;

            for (let c = 0; c < rowCells.length; c++) {
              const cellText = String(rowCells[c] || '').trim().toLowerCase();
              if (cellText === '') continue;

              // Ignore title rows, logo rows, branch rows, credit value rows
              if (isMetadataRowCell(cellText)) continue;

              if (foundReg === -1 && /^(reg|reg\.?\s*no|reg_no|regno|roll|roll\.?\s*no|rollno|register|registration|register\s*no|register\s*number)/i.test(cellText)) {
                foundReg = c;
              } else if (foundName === -1 && /^(name|student|student_name|candidate|name of the student|student name|candidate name)/i.test(cellText)) {
                foundName = c;
              } else if (deptColIndex === -1 && /^(dept|department|branch)/i.test(cellText)) {
                deptColIndex = c;
              } else if (reguColIndex === -1 && /^(regulation)/i.test(cellText)) {
                reguColIndex = c;
              }
            }

            if (foundReg !== -1 || foundName !== -1) {
              headerRowIndex = r;
              regNoColIndex = foundReg;
              nameColIndex = foundName;
              break;
            }
          }

          if (headerRowIndex === -1) {
            headerRowIndex = 0;
            const r0 = rawMatrix[0] || [];
            if (r0.length > 0) regNoColIndex = 0;
            if (r0.length > 1) nameColIndex = 1;
          }

          const headerRow = rawMatrix[headerRowIndex] || [];
          const headerNames: string[] = headerRow.map((cell) => String(cell || '').trim());

          // Fill empty header cells from adjacent rows (multi-row headers)
          for (let c = 0; c < headerNames.length; c++) {
            if (!headerNames[c]) {
              const prevVal = String((rawMatrix[Math.max(0, headerRowIndex - 1)] || [])[c] || '').trim();
              const nextVal = String((rawMatrix[headerRowIndex + 1] || [])[c] || '').trim();
              const combined = prevVal || nextVal;
              if (combined && !isDateCell(combined) && !isMetadataRowCell(combined)) {
                headerNames[c] = combined;
              }
            }
          }

          // Dynamic Metadata Extraction across any department
          let extractedDepartment = '';
          let extractedRegulation = '';
          let extractedSemester = '';

          for (let r = 0; r < headerRowIndex; r++) {
            const rCells = rawMatrix[r] || [];
            for (let c = 0; c < rCells.length; c++) {
              const txt = String(rCells[c] || '').trim();
              if (/department\s+of\s+([A-Za-z0-9\s&,.-]+)/i.test(txt)) {
                const match = txt.match(/department\s+of\s+([A-Za-z0-9\s&,.-]+)/i);
                if (match && match[1]) extractedDepartment = `Department of ${match[1].trim()}`;
              } else if (/dept\s*:\s*(.*)/i.test(txt)) {
                const match = txt.match(/dept\s*:\s*(.*)/i);
                if (match && match[1]) extractedDepartment = match[1].trim();
              } else if (/branch\s*:\s*(.*)/i.test(txt)) {
                const match = txt.match(/branch\s*:\s*(.*)/i);
                if (match && match[1]) extractedDepartment = match[1].trim();
              } else if (/regulation/i.test(txt) && c + 1 < rCells.length && rCells[c + 1]) {
                const val = String(rCells[c + 1]).trim();
                if (val) extractedRegulation = val;
              } else if (/regulation\s*:\s*(.*)/i.test(txt)) {
                const match = txt.match(/regulation\s*:\s*(.*)/i);
                if (match && match[1]) extractedRegulation = match[1].trim();
              } else if (/sem(ester)?\s*:\s*([A-Za-z0-9]+)/i.test(txt)) {
                const match = txt.match(/sem(ester)?\s*:\s*([A-Za-z0-9]+)/i);
                if (match && match[2]) extractedSemester = match[2].trim().toUpperCase();
              }
            }
          }

          // Grouped Subject Suffix Columns (_1, _2, _3 ... _n)
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

            const match = rawHeader.match(/^(.*?)(?:[\s_.-]+)?(\d+)$/i);
            if (!match) continue;

            const rawPrefix = match[1].trim();
            const num = Number(match[2]);
            const cleanPrefix = rawPrefix.toLowerCase().replace(/[^a-z0-9]/g, '');
            const isCieHeader = cleanPrefix.includes('cie') || /cie/i.test(rawHeader) || isCieFile;

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
              if (cleanPrefix.includes('code')) spec.codeCol = c;
              else if (cleanPrefix.includes('subject') || cleanPrefix.includes('title') || cleanPrefix.includes('name')) spec.titleCol = c;
              else if (cleanPrefix.includes('cie2') || cleanPrefix.includes('cie_2') || cleanPrefix.includes('cieii') || cleanPrefix.includes('mark2')) spec.cie2MarksCol = c;
              else if (cleanPrefix.includes('cie1') || cleanPrefix.includes('cie_1') || cleanPrefix.includes('ciei') || cleanPrefix.includes('mark1') || cleanPrefix.includes('mark')) spec.cie1MarksCol = c;
              else if (cleanPrefix.includes('pass') || cleanPrefix.includes('fail') || cleanPrefix.includes('result') || cleanPrefix.includes('status')) spec.passCol = c;
              else if (cleanPrefix.includes('sem')) spec.semCol = c;
            } else {
              if (cleanPrefix.includes('code')) spec.codeCol = c;
              else if (cleanPrefix.includes('subject') || cleanPrefix.includes('title') || cleanPrefix.includes('name')) spec.titleCol = c;
              else if (cleanPrefix.includes('grade')) spec.gradeCol = c;
              else if (cleanPrefix.includes('pass') || cleanPrefix.includes('fail') || cleanPrefix.includes('result') || cleanPrefix.includes('status')) spec.passCol = c;
              else if (cleanPrefix.includes('sem')) spec.semCol = c;
            }
          }

          const sortedUnivSpecs = Array.from(univGroupsMap.values()).sort((a, b) => a.groupNum - b.groupNum);
          const sortedCieSpecs = Array.from(cieGroupsMap.values()).sort((a, b) => a.groupNum - b.groupNum);

          // Direct Subject Columns Detection (Headers containing Subject Codes like ACS108, CS3591, etc.)
          const directSubjectCols: { colIndex: number; code: string; title: string }[] = [];
          
          for (let c = 0; c < headerNames.length; c++) {
            if (c === regNoColIndex || c === nameColIndex || c === deptColIndex || c === reguColIndex) continue;
            const txt = headerNames[c];
            if (!txt || isPlaceholderToken(txt) || isDateCell(txt) || isMetadataRowCell(txt)) continue;

            const cleanH = txt.toLowerCase().replace(/[^a-z0-9]/g, '');
            
            // Skip non-subject metadata columns
            if (
              /^(reg|name|sno|slno|gpa|cgpa|arr|class|total|dept|regulation|status|result|pass|fail|overall|remarks|percentage|rank|credit)/i.test(cleanH) ||
              cleanH.startsWith('gpa') || cleanH.startsWith('cgpa') || cleanH.startsWith('arr') || cleanH.startsWith('class') || cleanH.startsWith('rank')
            ) {
              continue;
            }

            // Extract subject code from header string
            const codeMatch = txt.match(/\b([A-Za-z]{2,5}\s*\d{3,5}[A-Za-z]?)\b/);
            const codeStr = codeMatch ? codeMatch[1].replace(/\s+/g, '').toUpperCase() : txt.toUpperCase();
            const cleanCodeStr = codeStr.replace(/\s+/g, '');

            // Resolve Subject Name strictly from Subject Master dictionary
            const titleStr = knownTitles[codeStr] || knownTitles[cleanCodeStr] || txt;

            directSubjectCols.push({
              colIndex: c,
              code: codeStr,
              title: titleStr,
            });
          }

          // Locate GPA / CGPA / Arrears / Class Column Indices for Debug Logging
          const gpaColIdx = findColIndex(headerNames, ['gpa', 'gpa_05', 'gpa 5', 'sem 5 gpa', 'gpa5', 'sgpa']);
          const cgpaColIdx = findColIndex(headerNames, ['cgpa', 'cgpa_05', 'cgpa 5', 'sem 5 cgpa', 'cgpa5']);
          const arrearsColIdx = findColIndex(headerNames, ['arrears', 'no of arrears', 'no. of arrears', 'arr', 'total arrears', 'arrear']);

          // Console Logs for Dynamic Header Row & Student Table Detection Debugging
          console.log('=================== DYNAMIC SUBJECT MAPPING DEBUG ===================');
          console.log(`[Parser Debug] Sheet Analyzed: "${sheetName}"`);
          console.log(`[Parser Debug] Header Row Detected: Row Index ${headerRowIndex + 1}`);
          console.log(`[Parser Debug] Subject Columns Mapped (${directSubjectCols.length}):`, directSubjectCols.map(s => `${s.code} -> "${s.title}" (Col ${s.colIndex})`));
          console.log('=====================================================================');

          // Read Student Rows starting after headerRowIndex until table ends
          const studentDataStartRowIndex = headerRowIndex + 1;
          let parsedRowCount = 0;

          for (let r = studentDataStartRowIndex; r < rawMatrix.length; r++) {
            const rowCells = rawMatrix[r] || [];
            const hasAnyData = rowCells.some((cell) => cell !== undefined && cell !== null && String(cell).trim() !== '');
            if (!hasAnyData) continue;

            const rawRegVal = regNoColIndex !== -1 ? rowCells[regNoColIndex] : rowCells[0];
            const rawNameVal = nameColIndex !== -1 ? rowCells[nameColIndex] : rowCells[1];

            let regNoStr = normalizeRegNo(rawRegVal);
            let nameStr = String(rawNameVal || '').trim();

            if (isDateCell(regNoStr) || isMetadataRowCell(regNoStr) || isPlaceholderToken(regNoStr)) regNoStr = '';
            if (isDateCell(nameStr) || isMetadataRowCell(nameStr) || isPlaceholderToken(nameStr)) nameStr = '';

            // Filter out summary, staff, date, total, statistics label rows (End of Student Table)
            if (
              /^(s\.?no\.?|sl\.?no\.?|sno|slno|register|name|reg\.?no|roll\.?no|total|summary|statistic|stats|percentage|pass|fail|staff|faculty|date|counsellor|incharge|credit)/i.test(regNoStr) ||
              /^(s\.?no\.?|sl\.?no\.?|sno|slno|register|name|reg\.?no|roll\.?no|total|summary|statistic|stats|percentage|pass|fail|staff|faculty|date|counsellor|incharge|credit)/i.test(nameStr)
            ) {
              continue;
            }

            // Stop reading sheet when Reg No and Name columns are empty
            if (!regNoStr && !nameStr) continue;

            const studentKey = regNoStr || normalizeRegNo(nameStr);
            if (!studentKey) continue;

            parsedRowCount++;

            // Read GPA / CGPA / Class Obtained strictly from Excel without hardcoded defaults
            const rawGPA = findCellValue(rowCells, headerNames, ['gpa', 'gpa_05', 'gpa 5', 'gpa_5', 'sem 5 gpa', 'gpa5', 'sgpa', /gpa/i]);
            const rawCGPA = findCellValue(rowCells, headerNames, ['cgpa', 'cgpa_05', 'cgpa 5', 'cgpa_5', 'sem 5 cgpa', 'cgpa5', /cgpa/i]);
            const rawClass = findCellValue(rowCells, headerNames, ['class_obtained', 'class obtained', 'class', 'classification', /class/i]);

            const gpaVal = rawGPA !== undefined && rawGPA !== null && String(rawGPA).trim() !== '' ? (isNaN(Number(rawGPA)) ? String(rawGPA) : Number(rawGPA)) : undefined;
            const cgpaVal = rawCGPA !== undefined && rawCGPA !== null && String(rawCGPA).trim() !== '' ? (isNaN(Number(rawCGPA)) ? String(rawCGPA) : Number(rawCGPA)) : undefined;
            const classObtained = rawClass !== undefined && rawClass !== null ? String(rawClass).trim().toUpperCase() : '';

            // Read Semester GPAs, CGPAs, Arrears strictly for Semesters 1-7
            const gpaBySem: Record<string, number | string> = {};
            const cgpaBySem: Record<string, number | string> = {};
            const arrearsMap: Record<string, number | string> = {};

            for (let s = 1; s <= 7; s++) {
              const semKey = `0${s}`;
              const sNum = String(s);
              const romanSem = s === 1 ? 'i' : s === 2 ? 'ii' : s === 3 ? 'iii' : s === 4 ? 'iv' : s === 5 ? 'v' : s === 6 ? 'vi' : 'vii';

              const valG = findCellValue(rowCells, headerNames, [
                `gpa0${s}`, `gpa 0${s}`, `gpa ${s}`, `gpa_0${s}`, `gpa_${s}`, `gpa${s}`,
                `sem ${s} gpa`, `sem 0${s} gpa`, `sem_${s}_gpa`, `s${s}_gpa`, `gpa_sem_${s}`,
                `sem_${romanSem}_gpa`, `gpa_${romanSem}`, `gpa (${romanSem})`, `gpa (sem ${romanSem})`
              ]);

              const valC = findCellValue(rowCells, headerNames, [
                `cgpa0${s}`, `cgpa 0${s}`, `cgpa ${s}`, `cgpa_0${s}`, `cgpa_${s}`, `cgpa${s}`,
                `sem ${s} cgpa`, `sem 0${s} cgpa`, `sem_${s}_cgpa`, `s${s}_cgpa`,
                `sem_${romanSem}_cgpa`, `cgpa_${romanSem}`, `cgpa (${romanSem})`, `cgpa (sem ${romanSem})`
              ]);

              const valA = findCellValue(rowCells, headerNames, [
                `arrears0${s}`, `arrears 0${s}`, `arrears ${s}`, `arrears_0${s}`, `arrears_${s}`, `arrears${s}`,
                `arr 0${s}`, `arr ${s}`, `sem ${s} arrears`, `s${s}_arrears`, `arrear0${s}`, `arrear ${s}`,
                `arrears_${romanSem}`, `arr_${romanSem}`, `arr (${romanSem})`, `arrears (${romanSem})`
              ]);

              if (valG !== undefined && valG !== null && String(valG).trim() !== '') {
                gpaBySem[semKey] = String(valG).trim();
                gpaBySem[sNum] = String(valG).trim();
              }
              if (valC !== undefined && valC !== null && String(valC).trim() !== '') {
                cgpaBySem[semKey] = String(valC).trim();
                cgpaBySem[sNum] = String(valC).trim();
              }
              if (valA !== undefined && valA !== null && String(valA).trim() !== '') {
                arrearsMap[semKey] = isNaN(Number(valA)) ? String(valA).trim() : Number(valA);
                arrearsMap[sNum] = arrearsMap[semKey];
              }
            }

            // Build University Subjects strictly matching uploaded Excel (NO GRADE SHIFTING, NO HARDCODED NAMES)
            const universityResults: SubjectResult[] = [];
            const internalEvalResults: InternalEvalResult[] = [];

            // 1. Grouped Specs (Subject Code 1, Grade 1...)
            sortedUnivSpecs.forEach((spec) => {
              const codeRaw = spec.codeCol !== -1 ? rowCells[spec.codeCol] : '';
              const titleRaw = spec.titleCol !== -1 ? rowCells[spec.titleCol] : '';
              const gradeRaw = spec.gradeCol !== -1 ? rowCells[spec.gradeCol] : '';
              const passRaw = spec.passCol !== -1 ? rowCells[spec.passCol] : '';
              const semRaw = spec.semCol !== -1 ? rowCells[spec.semCol] : '';

              const codeStr = String(codeRaw || '').trim().toUpperCase();
              const cleanCodeStr = codeStr.replace(/\s+/g, '');
              let titleStr = String(titleRaw || '').trim();
              const gradeStr = String(gradeRaw || '').trim().toUpperCase();
              const passStr = String(passRaw || '').trim().toUpperCase();

              if (!codeStr && !titleStr && !gradeStr && !passStr) return;
              if (!titleStr && codeStr) titleStr = knownTitles[codeStr] || knownTitles[cleanCodeStr] || codeStr;

              const passFail = evaluatePassFail(passStr, gradeStr);
              const sem = semRaw ? String(semRaw).trim().toUpperCase() : (extractedSemester || '');

              universityResults.push({
                sem,
                code: codeStr,
                title: titleStr,
                grade: gradeStr,
                passFail,
              });
            });

            // 2. CIE Grouped Specs
            if (sortedCieSpecs.length > 0) {
              sortedCieSpecs.forEach((spec) => {
                const codeRaw = spec.codeCol !== -1 ? rowCells[spec.codeCol] : '';
                const titleRaw = spec.titleCol !== -1 ? rowCells[spec.titleCol] : '';
                const cie1MarksRaw = spec.cie1MarksCol !== -1 ? rowCells[spec.cie1MarksCol] : '';
                const cie2MarksRaw = spec.cie2MarksCol !== -1 ? rowCells[spec.cie2MarksCol] : '';
                const passRaw = spec.passCol !== -1 ? rowCells[spec.passCol] : '';
                const semRaw = spec.semCol !== -1 ? rowCells[spec.semCol] : '';

                const codeStr = String(codeRaw || '').trim().toUpperCase();
                const cleanCodeStr = codeStr.replace(/\s+/g, '');
                let titleStr = String(titleRaw || '').trim();
                const cie1MarksStr = String(cie1MarksRaw !== undefined && cie1MarksRaw !== null ? cie1MarksRaw : '').trim();
                const cie2MarksStr = String(cie2MarksRaw !== undefined && cie2MarksRaw !== null ? cie2MarksRaw : '').trim();
                const passStr = String(passRaw || '').trim().toUpperCase();

                if (!codeStr && !titleStr && !cie1MarksStr && !cie2MarksStr && !passStr) return;
                if (!titleStr && codeStr) titleStr = knownTitles[codeStr] || knownTitles[cleanCodeStr] || codeStr;

                const passFail = evaluatePassFail(passStr, cie1MarksStr);
                const sem = semRaw ? String(semRaw).trim().toUpperCase() : (extractedSemester || '');

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

            // 3. Direct Subject Columns (Reads Grade for each column index without grade shifting)
            if (sortedUnivSpecs.length === 0 || isCieFile) {
              directSubjectCols.forEach((sub) => {
                const cellVal = rowCells[sub.colIndex];
                if (cellVal !== undefined && cellVal !== null && String(cellVal).trim() !== '') {
                  const valStr = String(cellVal).trim();
                  const gradeUpper = valStr.toUpperCase();
                  if (isCieFile) {
                    internalEvalResults.push({
                      sem: extractedSemester || '',
                      code: sub.code,
                      title: sub.title,
                      cie1Marks: valStr,
                      cie2Marks: '',
                      passFail: evaluatePassFail('', valStr),
                    });
                  } else {
                    universityResults.push({
                      sem: extractedSemester || '',
                      code: sub.code,
                      title: sub.title,
                      grade: gradeUpper,
                      passFail: evaluatePassFail('', gradeUpper),
                    });
                  }
                }
              });
            }

            // Student Record Storage & Consolidation
            let existing = allStudentsMap.get(studentKey);
            if (!existing) {
              existing = {
                id: `std-${studentKey}`,
                regNo: regNoStr,
                name: nameStr,
                department: extractedDepartment || '',
                regulation: extractedRegulation || '',
                semester: extractedSemester || '',
                universityResults: [],
                gpa: gpaVal,
                cgpa: cgpaVal,
                classObtained,
                arrears: arrearsMap,
                gpaBySem,
                cgpaBySem,
                internalEvalResults: [],
              };
              allStudentsMap.set(studentKey, existing);
            }

            if (universityResults.length > 0) {
              existing.universityResults.push(...universityResults);
            }
            if (internalEvalResults.length > 0) {
              existing.internalEvalResults.push(...internalEvalResults);
            }
            if (gpaVal !== undefined) existing.gpa = gpaVal;
            if (cgpaVal !== undefined) existing.cgpa = cgpaVal;
            if (classObtained) existing.classObtained = classObtained;

            console.log(`[Parser Debug] Student ${regNoStr} (${nameStr}) mapped ${universityResults.length} University Subjects strictly matching Excel.`);
          }

          console.log(`[Parser Debug] Sheet "${sheetName}" Parsed ${parsedRowCount} Student Rows Successfully.`);
        });

        const students = Array.from(allStudentsMap.values());
        console.log('==============================================');
        console.log(`Excel Parser Extracted ${students.length} Total Students Across Valid Sheets.`);
        console.log('==============================================');

        resolve(students);
      } catch (err: any) {
        console.error('Error parsing Excel file:', err);
        reject(err?.message || 'Failed to parse Excel file.');
      }
    };

    reader.onerror = () => reject('Error reading Excel file');
    reader.readAsArrayBuffer(file);
  });
};
