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

// Helper to detect if a cell string is Title, Department Header, or Faculty/Staff row metadata
const isFacultyNameCell = (str: string): boolean => {
  if (!str) return false;
  const clean = str.trim().toLowerCase();
  return /^(mr\.|mrs\.|dr\.|prof\.|ms\.|ap\/|asp\/|hod\/|prof\/)/i.test(clean) ||
         /\b(soloman|dhanalakshmi|raghavan|prof|faculty|staff|incharge|counsellor)\b/i.test(clean) ||
         /^(jeppiaar|department|continuous|internal|evaluation|maximum marks|max marks|academic year|year\/sem|test name)/i.test(clean);
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

        const fileName = (file.name || '').toLowerCase();
        const isCieFile = fileName.includes('cie') || fileName.includes('internal') || fileName.includes('eval');

        const allStudentsMap = new Map<string, StudentRecord>();

        // Filter and iterate over valid worksheets (e.g., Table 1, Table 2; ignore Table 3 / Summary)
        const validSheetNames = workbook.SheetNames.filter((sName) => {
          const cleanS = sName.trim().toLowerCase();
          // Explicitly ignore summary/statistics sheets like "Table 3", "Summary", "Statistics", "Abstract"
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

          // Read raw 2D matrix (header: 1)
          const rawMatrix: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
          if (!rawMatrix || rawMatrix.length === 0) return;

          // STEP 1: Dynamically locate the exact Header Row containing "Register No", "Reg No", "REG.NO", "Roll No"
          let headerRowIndex = -1;
          let regNoColIndex = -1;
          let nameColIndex = -1;
          let deptColIndex = -1;
          let reguColIndex = -1;

          for (let r = 0; r < Math.min(30, rawMatrix.length); r++) {
            const rowCells = rawMatrix[r] || [];
            let foundReg = -1;
            let foundName = -1;
            let foundDept = -1;
            let foundRegu = -1;

            for (let c = 0; c < rowCells.length; c++) {
              const cellText = String(rowCells[c] || '').trim().toLowerCase();
              if (cellText === '') continue;

              if (foundReg === -1 && /^(reg|reg\.?\s*no|reg_no|regno|roll|roll\.?\s*no|rollno|register|registration|register\s*no)/i.test(cellText)) {
                foundReg = c;
              } else if (foundName === -1 && /^(name|student|student_name|candidate|name of the student|student name)/i.test(cellText)) {
                foundName = c;
              } else if (foundDept === -1 && /^(dept|department|branch)/i.test(cellText)) {
                foundDept = c;
              } else if (foundRegu === -1 && /^(regulation)/i.test(cellText)) {
                foundRegu = c;
              }
            }

            if (foundReg !== -1 || foundName !== -1) {
              headerRowIndex = r;
              regNoColIndex = foundReg;
              nameColIndex = foundName;
              deptColIndex = foundDept;
              reguColIndex = foundRegu;
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

          // Fill empty header cells from adjacent row if headers are split across 2 rows
          for (let c = 0; c < headerNames.length; c++) {
            if (!headerNames[c]) {
              const nextRowVal = String((rawMatrix[headerRowIndex + 1] || [])[c] || '').trim();
              if (nextRowVal && !isDateCell(nextRowVal) && !isFacultyNameCell(nextRowVal)) {
                headerNames[c] = nextRowVal;
              }
            }
          }

          // Metadata extraction from top title rows (rows above headerRowIndex)
          let extractedDepartment = '';
          let extractedRegulation = '';

          for (let r = 0; r < headerRowIndex; r++) {
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

          // Process Grouped Subject Suffix Columns (_1, _2, _3 ... _n)
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
              if (cleanPrefix.includes('code')) {
                spec.codeCol = c;
              } else if (cleanPrefix.includes('subject') || cleanPrefix.includes('title') || cleanPrefix.includes('name')) {
                spec.titleCol = c;
              } else if (cleanPrefix.includes('cie2') || cleanPrefix.includes('cie_2') || cleanPrefix.includes('cieii') || cleanPrefix.includes('mark2')) {
                spec.cie2MarksCol = c;
              } else if (cleanPrefix.includes('cie1') || cleanPrefix.includes('cie_1') || cleanPrefix.includes('ciei') || cleanPrefix.includes('mark1') || cleanPrefix.includes('mark')) {
                spec.cie1MarksCol = c;
              } else if (cleanPrefix.includes('pass') || cleanPrefix.includes('fail') || cleanPrefix.includes('result') || cleanPrefix.includes('status')) {
                spec.passCol = c;
              } else if (cleanPrefix.includes('sem')) {
                spec.semCol = c;
              }
            } else {
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

          const sortedUnivSpecs = Array.from(univGroupsMap.values()).sort((a, b) => a.groupNum - b.groupNum);
          const sortedCieSpecs = Array.from(cieGroupsMap.values()).sort((a, b) => a.groupNum - b.groupNum);

          // Direct Subject Columns (fallback when no suffix columns exist)
          const directSubjectCols: { colIndex: number; code: string; title: string }[] = [];
          if (sortedUnivSpecs.length === 0 && sortedCieSpecs.length === 0) {
            for (let c = 0; c < headerNames.length; c++) {
              if (c === regNoColIndex || c === nameColIndex || c === deptColIndex || c === reguColIndex) continue;
              const txt = headerNames[c];
              if (!txt || isPlaceholderToken(txt) || isDateCell(txt) || isFacultyNameCell(txt)) continue;

              const cleanH = txt.toLowerCase().replace(/[^a-z0-9]/g, '');
              if (/^(reg|name|sno|slno|gpa|cgpa|arr|class|total|dept|regulation)/i.test(cleanH)) continue;

              directSubjectCols.push({
                colIndex: c,
                code: txt.toUpperCase(),
                title: knownTitles[txt.toUpperCase()] || txt,
              });
            }
          }

          // Process Student Data Rows starting after headerRowIndex
          const studentDataStartRowIndex = headerRowIndex + 1;

          for (let r = studentDataStartRowIndex; r < rawMatrix.length; r++) {
            const rowCells = rawMatrix[r] || [];
            const hasAnyData = rowCells.some((cell) => cell !== undefined && cell !== null && String(cell).trim() !== '');
            if (!hasAnyData) continue;

            const rawRegVal = regNoColIndex !== -1 ? rowCells[regNoColIndex] : rowCells[0];
            const rawNameVal = nameColIndex !== -1 ? rowCells[nameColIndex] : rowCells[1];

            let regNoStr = normalizeRegNo(rawRegVal);
            let nameStr = String(rawNameVal || '').trim();

            if (isDateCell(regNoStr) || isFacultyNameCell(regNoStr) || isPlaceholderToken(regNoStr)) regNoStr = '';
            if (isDateCell(nameStr) || isFacultyNameCell(nameStr) || isPlaceholderToken(nameStr)) nameStr = '';

            // Filter out header label rows (e.g. S.No, Sl.No, Register Number, Name of the Student)
            if (
              /^(s\.?no\.?|sl\.?no\.?|sno|slno|register|name|reg\.?no|roll\.?no)/i.test(regNoStr) ||
              /^(s\.?no\.?|sl\.?no\.?|sno|slno|register|name|reg\.?no|roll\.?no)/i.test(nameStr)
            ) {
              continue;
            }

            if (!regNoStr && !nameStr) continue;

            const studentKey = regNoStr || normalizeRegNo(nameStr);
            if (!studentKey) continue;

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

            // University & CIE Results
            const universityResults: SubjectResult[] = [];
            const internalEvalResults: InternalEvalResult[] = [];

            // 1. University Specs
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
              if (!titleStr && codeStr) titleStr = knownTitles[codeStr] || codeStr;

              const passFail = evaluatePassFail(passStr, gradeStr);
              const sem = semRaw ? String(semRaw).trim().toUpperCase() : 'VI';

              universityResults.push({
                sem,
                code: codeStr,
                title: titleStr,
                grade: gradeStr,
                passFail,
              });
            });

            // 2. CIE Specs
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
                if (!titleStr && codeStr) titleStr = knownTitles[codeStr] || codeStr;

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

            // Direct Subject Columns
            if (sortedUnivSpecs.length === 0 && sortedCieSpecs.length === 0) {
              directSubjectCols.forEach((sub) => {
                const cellVal = rowCells[sub.colIndex];
                if (cellVal !== undefined && cellVal !== null && String(cellVal).trim() !== '') {
                  const valStr = String(cellVal).trim();
                  if (isCieFile) {
                    internalEvalResults.push({
                      sem: 'VI',
                      code: sub.code,
                      title: sub.title,
                      cie1Marks: valStr,
                      cie2Marks: '',
                      passFail: evaluatePassFail('', valStr),
                    });
                  } else {
                    universityResults.push({
                      sem: 'VI',
                      code: sub.code,
                      title: sub.title,
                      grade: valStr,
                      passFail: evaluatePassFail('', valStr),
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
                regulation: extractedRegulation || '2021',
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
          }
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
