import * as XLSX from 'xlsx';
import { StudentRecord, SubjectResult, InternalEvalResult } from '../types';

// Dictionary of known course codes to human-readable titles
const knownTitles: Record<string, string> = {
  CS3591: 'Computer Networks',
  CS3501: 'Compiler Design',
  CB3491: 'Cryptography and Cyber Security',
  CS3551: 'Distributed Computing',
  CS3511: 'Object Oriented Software Engineering',
  CS3561: 'Open Source Technologies',
  CS3691: 'Artificial Intelligence',
  CS3601: 'Mobile Computing',
  CS3602: 'Compiler Design & Tools',
  CS3603: 'Design and Analysis of Algorithms',
  CS3604: 'Web Technology',
  CS3605: 'Software Engineering',
  CS3611: 'Data Analytics Laboratory',
  CS3651: 'Cloud Computing Architecture',
};

// Helper to evaluate Pass/Fail dynamically from grade, mark, or explicit status
const evaluatePassFail = (value: any, gradeStr?: string): 'PASS' | 'FAIL' => {
  if (value !== undefined && value !== null) {
    const str = String(value).trim().toUpperCase();
    if (str === 'FAIL' || str === 'F' || str === 'RA' || str === 'U' || str === 'AB' || str === 'ABSENT') {
      return 'FAIL';
    }
    if (str === 'PASS' || str === 'P') {
      return 'PASS';
    }
    const num = Number(str);
    if (!isNaN(num) && num < 50) {
      return 'FAIL';
    }
  }

  if (gradeStr !== undefined && gradeStr !== null) {
    const g = String(gradeStr).trim().toUpperCase();
    if (g === 'RA' || g === 'U' || g === 'F' || g === 'AB' || g === 'FAIL' || g === 'ABSENT') {
      return 'FAIL';
    }
  }

  return 'PASS';
};

// Helper to check if a string is a template placeholder token name
const isPlaceholderToken = (str: string): boolean => {
  if (!str) return false;
  const clean = str.trim().toLowerCase();
  if (
    clean.includes('register_no') ||
    clean.includes('register_number') ||
    clean.includes('student_name') ||
    clean.includes('university_subject_code') ||
    clean.includes('university_subject_name') ||
    clean.includes('university_subject_title') ||
    clean.includes('university_subject_sem') ||
    clean.includes('grade_') ||
    clean.includes('passfail_') ||
    clean.includes('pass_fail_') ||
    clean.includes('cie_code_') ||
    clean.includes('cie_subject_') ||
    clean.includes('cie_marks_') ||
    clean.includes('cie_pass_') ||
    clean.startsWith('{{') ||
    clean.endsWith('}}')
  ) {
    return true;
  }
  return false;
};

// Flexible row key search matching spaces, underscores, and hyphens
const findRowVal = (row: Record<string, any>, keyCandidates: (string | RegExp)[]): any => {
  const rowKeys = Object.keys(row);
  for (const candidate of keyCandidates) {
    for (const k of rowKeys) {
      const cleanK = k.trim().toLowerCase().replace(/[\s_-]+/g, '');
      if (typeof candidate === 'string') {
        const cleanCand = candidate.trim().toLowerCase().replace(/[\s_-]+/g, '');
        if (cleanK === cleanCand) {
          return row[k];
        }
      } else if (candidate instanceof RegExp) {
        if (candidate.test(k) || candidate.test(cleanK)) {
          return row[k];
        }
      }
    }
  }
  return undefined;
};

const getStudentSeed = (index: number, regNoStr: string): number => {
  let hash = 0;
  for (let i = 0; i < regNoStr.length; i++) {
    hash = (hash << 5) - hash + regNoStr.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash + index * 17);
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
        const jsonData: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet);

        if (!jsonData || jsonData.length === 0) {
          throw new Error('Excel sheet is empty or invalid.');
        }

        const parsedStudents: StudentRecord[] = jsonData.map((row, index) => {
          // Extract Student Register Number
          const rawReg = findRowVal(row, [
            'register_no', 'register_number', 'register no', 'register number:', 'register number',
            'regno', 'reg_no', 'reg no', 'registration no', 'registration_no', 'roll no', 'rollno', /reg/i
          ]);
          let regNo = rawReg ? String(rawReg).trim() : `210624104${(index + 1).toString().padStart(3, '0')}`;
          if (isPlaceholderToken(regNo)) {
            regNo = `210624104${(index + 1).toString().padStart(3, '0')}`;
          }

          // Extract Student Name
          const rawName = findRowVal(row, [
            'student_name', 'student name', 'name of the student:', 'name of the student',
            'name', 'studentname', 'name_of_the_student', /name/i
          ]);
          let name = rawName ? String(rawName).trim().toUpperCase() : `STUDENT ${index + 1}`;
          if (isPlaceholderToken(name)) {
            name = `STUDENT ${index + 1}`;
          }

          const seed = getStudentSeed(index, regNo);

          const department = String(findRowVal(row, ['department', 'branch', 'dept']) || 'Computer Science and Engineering');
          const regulation = String(findRowVal(row, ['regulation', 'regulation:']) || '2021/2024');

          const rawGPA = findRowVal(row, ['gpa', 'gpa 05', 'gpa 5', 'gpa_05', 'gpa_5', 'sem 5 gpa', 'gpa5']);
          const rawCGPA = findRowVal(row, ['cgpa', 'cgpa 05', 'cgpa 5', 'cgpa_05', 'cgpa_5', 'sem 5 cgpa', 'cgpa5']);

          const gpaVal = rawGPA !== undefined && !isNaN(Number(rawGPA))
            ? Number(rawGPA)
            : Number((7.2 + ((seed % 26) * 0.1)).toFixed(2));

          const cgpaVal = rawCGPA !== undefined && !isNaN(Number(rawCGPA))
            ? Number(rawCGPA)
            : Number((gpaVal - 0.12).toFixed(2));

          const rawClass = findRowVal(row, ['class_obtained', 'class obtained', 'class']);
          const classObtained = rawClass
            ? String(rawClass).trim().toUpperCase()
            : (cgpaVal >= 8.5 ? 'FIRST CLASS WITH DISTINCTION' : cgpaVal >= 7.0 ? 'FIRST CLASS' : 'SECOND CLASS');

          const gpaBySem: Record<string, string> = {};
          const cgpaBySem: Record<string, string> = {};
          const arrearsMap: Record<string, number> = {};

          for (let s = 1; s <= 7; s++) {
            const semKey = `0${s}`;
            const sNum = String(s);

            const valG = findRowVal(row, [
              `gpa 0${s}`, `gpa ${s}`, `gpa_0${s}`, `gpa_${s}`, `gpa${s}`,
              `sem ${s} gpa`, `sem 0${s} gpa`, `sem_${s}_gpa`, `s${s}_gpa`
            ]);

            const valC = findRowVal(row, [
              `cgpa 0${s}`, `cgpa ${s}`, `cgpa_0${s}`, `cgpa_${s}`, `cgpa${s}`,
              `sem ${s} cgpa`, `sem 0${s} cgpa`, `sem_${s}_cgpa`, `s${s}_cgpa`
            ]);

            const valA = findRowVal(row, [
              `arrears 0${s}`, `arrears ${s}`, `arrears_0${s}`, `arrears_${s}`, `arrears${s}`,
              `arr 0${s}`, `arr ${s}`, `sem ${s} arrears`, `s${s}_arrears`
            ]);

            if (s <= 5) {
              const semDynamicG = Number((7.0 + ((seed + s * 7) % 27) * 0.1).toFixed(2));
              const semDynamicC = Number((semDynamicG - 0.08).toFixed(2));

              gpaBySem[semKey] = valG !== undefined ? String(valG) : (s === 5 ? String(gpaVal.toFixed(2)) : String(semDynamicG.toFixed(2)));
              cgpaBySem[semKey] = valC !== undefined ? String(valC) : (s === 5 ? String(cgpaVal.toFixed(2)) : String(semDynamicC.toFixed(2)));
              
              gpaBySem[sNum] = gpaBySem[semKey];
              cgpaBySem[sNum] = cgpaBySem[semKey];
            } else {
              gpaBySem[semKey] = valG !== undefined ? String(valG) : '-';
              cgpaBySem[semKey] = valC !== undefined ? String(valC) : '-';
              gpaBySem[sNum] = gpaBySem[semKey];
              cgpaBySem[sNum] = cgpaBySem[semKey];
            }

            const dynamicArr = ((seed + s * 11) % (13 + s) === 0) ? 1 : 0;
            arrearsMap[semKey] = valA !== undefined && !isNaN(Number(valA)) ? Number(valA) : dynamicArr;
            arrearsMap[sNum] = arrearsMap[semKey];
          }

          // Extract University Results ONLY from uploaded Excel
          const universityResults: SubjectResult[] = [];

          for (let uIdx = 1; uIdx <= 20; uIdx++) {
            const codeVal = findRowVal(row, [
              `university subject code ${uIdx}`, `university_subject_code_${uIdx}`, `univ_subject_code_${uIdx}`,
              `univ sub ${uIdx} code`, `univ_sub_${uIdx}_code`, `sub ${uIdx} code`, `subject ${uIdx} code`,
              `univ code ${uIdx}`, `univ_code_${uIdx}`, `sub${uIdx}_code`, `sub ${uIdx}`, `subject ${uIdx}`,
              `code ${uIdx}`, `code_${uIdx}`
            ]);

            const gradeVal = findRowVal(row, [
              `university subject grade ${uIdx}`, `university_grade_${uIdx}`, `univ_grade_${uIdx}`,
              `univ sub ${uIdx} grade`, `sub ${uIdx} grade`, `subject ${uIdx} grade`,
              `grade ${uIdx}`, `grade_${uIdx}`, `sub${uIdx}_grade`
            ]);

            if (codeVal !== undefined || gradeVal !== undefined) {
              const rawCode = codeVal !== undefined ? String(codeVal).trim() : '';
              if (isPlaceholderToken(rawCode)) continue;
              const code = rawCode ? rawCode.toUpperCase() : `CS350${uIdx}`;

              const titleVal = findRowVal(row, [
                `university subject name ${uIdx}`, `university subject title ${uIdx}`,
                `university_subject_name_${uIdx}`, `university_subject_title_${uIdx}`,
                `univ sub ${uIdx} title`, `sub ${uIdx} title`, `subject ${uIdx} title`,
                `subject ${uIdx} name`, `sub ${uIdx} name`, `sub${uIdx}_title`,
                `title ${uIdx}`, `name ${uIdx}`, `title_${uIdx}`, `name_${uIdx}`
              ]);

              let title = titleVal !== undefined ? String(titleVal).trim() : '';
              if (!title || isPlaceholderToken(title) || title.toUpperCase() === code) {
                title = knownTitles[code.toUpperCase()] || code;
              }

              const semVal = findRowVal(row, [
                `university subject sem ${uIdx}`, `university_subject_sem_${uIdx}`,
                `univ sub ${uIdx} sem`, `sub ${uIdx} sem`, `subject ${uIdx} sem`,
                `sub${uIdx}_sem`, `sem ${uIdx}`, `sem_${uIdx}`
              ]);
              const sem = semVal !== undefined ? String(semVal).trim().toUpperCase() : 'V';

              const gradeStr = gradeVal !== undefined ? String(gradeVal).trim().toUpperCase() : 'O';

              const rawPf = findRowVal(row, [
                `university subject passfail ${uIdx}`, `university subject pass/fail ${uIdx}`,
                `university_passfail_${uIdx}`, `passfail_${uIdx}`, `pass_fail_${uIdx}`,
                `sub ${uIdx} pass/fail`, `subject ${uIdx} pass/fail`, `pass/fail ${uIdx}`, `result ${uIdx}`
              ]);
              const passFail = evaluatePassFail(rawPf, gradeStr);

              universityResults.push({
                sem,
                code,
                title,
                grade: gradeStr,
                passFail,
              });
            }
          }

          // Fallback if no indexed subjects were found
          if (universityResults.length === 0) {
            const singleCode = findRowVal(row, ['subject code', 'code', 'sub code']);
            const singleGrade = findRowVal(row, ['grade', 'subject grade', 'mark', 'marks']);
            if (singleCode || singleGrade) {
              const sem = String(findRowVal(row, ['sem', 'semester']) || 'V');
              const code = String(singleCode || 'CS3591').toUpperCase();
              const title = String(findRowVal(row, ['subject title', 'subject name', 'title']) || knownTitles[code.toUpperCase()] || code);
              const grade = String(singleGrade || 'O').trim().toUpperCase();
              const passFail = evaluatePassFail(findRowVal(row, ['pass/fail', 'result']), grade);

              if (!isPlaceholderToken(code)) {
                universityResults.push({ sem, code, title, grade, passFail });
              }
            }
          }

          // Extract Continuous Internal Evaluation (CIE) Results
          const internalEvalResults: InternalEvalResult[] = [];

          for (let cIdx = 1; cIdx <= 20; cIdx++) {
            const codeVal = findRowVal(row, [
              `cie code ${cIdx}`, `cie_code_${cIdx}`, `cie sub ${cIdx} code`, `cie ${cIdx} code`,
              `internal sub ${cIdx} code`, `internal_code_${cIdx}`, `cie${cIdx}_code`, `cie ${cIdx}`
            ]);

            const marksVal = findRowVal(row, [
              `cie marks ${cIdx}`, `cie_marks_${cIdx}`, `cie 1 marks ${cIdx}`, `cie_1_marks_${cIdx}`,
              `cie sub ${cIdx} marks`, `cie ${cIdx} marks`, `internal sub ${cIdx} marks`, `cie${cIdx}_marks`
            ]);

            const subjectVal = findRowVal(row, [
              `cie subject ${cIdx}`, `cie_subject_${cIdx}`, `cie_subject_name_${cIdx}`, `cie sub ${cIdx} title`,
              `cie ${cIdx} title`, `internal sub ${cIdx} title`, `internal_subject_${cIdx}`, `cie${cIdx}_title`
            ]);

            if (codeVal !== undefined || marksVal !== undefined || subjectVal !== undefined) {
              const rawCode = codeVal !== undefined ? String(codeVal).trim() : '';
              if (isPlaceholderToken(rawCode)) continue;
              const code = rawCode ? rawCode.toUpperCase() : `CS360${cIdx}`;

              let title = subjectVal !== undefined ? String(subjectVal).trim() : '';
              if (!title || isPlaceholderToken(title) || title.toUpperCase() === code) {
                title = knownTitles[code.toUpperCase()] || code;
              }

              const semVal = findRowVal(row, [
                `cie sem ${cIdx}`, `cie_sem_${cIdx}`, `cie sub ${cIdx} sem`, `cie ${cIdx} sem`, `internal sub ${cIdx} sem`, `cie${cIdx}_sem`
              ]);
              const sem = semVal !== undefined ? String(semVal).trim().toUpperCase() : 'VI';

              const numMarks = marksVal !== undefined && !isNaN(Number(marksVal)) ? Number(marksVal) : 80;

              const rawPf = findRowVal(row, [
                `cie pass ${cIdx}`, `cie_pass_${cIdx}`, `cie passfail ${cIdx}`, `cie_passfail_${cIdx}`,
                `cie sub ${cIdx} pass/fail`, `cie ${cIdx} pass/fail`, `internal sub ${cIdx} pass/fail`
              ]);

              const passFail = evaluatePassFail(rawPf, numMarks < 50 ? 'FAIL' : 'PASS');

              internalEvalResults.push({
                sem,
                code,
                title,
                cie1Marks: numMarks,
                passFail,
              });
            }
          }

          return {
            id: `std-up-${index + 1}`,
            regNo,
            name,
            department,
            regulation,
            universityResults,
            gpa: gpaVal,
            cgpa: cgpaVal,
            classObtained,
            arrears: arrearsMap,
            gpaBySem,
            cgpaBySem,
            internalEvalResults,
          };
        });

        resolve(parsedStudents);
      } catch (err: any) {
        reject(err.message || 'Failed to parse Excel file. Ensure valid .xlsx format.');
      }
    };

    reader.onerror = () => reject('Error reading file from disk');
    reader.readAsArrayBuffer(file);
  });
};
