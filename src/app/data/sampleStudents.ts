import { StudentRecord, SubjectResult, InternalEvalResult } from '../types';

export const defaultUnivSubjects: SubjectResult[] = [
  { sem: 'V', code: 'CS3591', title: 'Computer Networks', grade: 'O', passFail: 'PASS' },
  { sem: 'V', code: 'CS3501', title: 'Compiler Design', grade: 'A+', passFail: 'PASS' },
  { sem: 'V', code: 'CB3491', title: 'Cryptography and Cyber Security', grade: 'A', passFail: 'PASS' },
  { sem: 'V', code: 'CS3551', title: 'Distributed Computing', grade: 'B+', passFail: 'PASS' },
  { sem: 'V', code: 'CS3511', title: 'Object Oriented Software Engineering', grade: 'O', passFail: 'PASS' },
  { sem: 'V', code: 'CS3561', title: 'Open Source Technologies', grade: 'A+', passFail: 'PASS' },
];

export const defaultInternalSubjects: InternalEvalResult[] = [
  { sem: 'VI', code: 'CS3691', title: 'Artificial Intelligence', cie1Marks: 85, passFail: 'PASS' },
  { sem: 'VI', code: 'CS3601', title: 'Mobile Computing', cie1Marks: 78, passFail: 'PASS' },
  { sem: 'VI', code: 'CS3651', title: 'Cloud Computing Architecture', cie1Marks: 92, passFail: 'PASS' },
  { sem: 'VI', code: 'CS3611', title: 'Data Analytics Laboratory', cie1Marks: 88, passFail: 'PASS' },
];

const sampleNames = [
  'ARUN KUMAR R',
  'BHAVANA S',
  'CHANDRU M',
  'DIVYA BHARATHI K',
  'ELANGOVAN T',
  'FARHANA PARVEEN S',
  'GOKULAKRISHNAN P',
  'HARINI V',
  'INBATHAMIZHAN K',
  'JEYASRI A',
  'KAVIN RAJ S',
  'LAVANYA G',
  'MANOJ KUMAR N',
  'NIVETHA P',
  'OM PRAKASH K',
  'PRIYADHARSHINI S',
  'RAJESH KANNA M',
  'SANGEETHA R',
  'TAMILARASAN V',
  'UMA MAHESWARI D',
];

export const generateSampleStudents = (count: number = 512): StudentRecord[] => {
  const students: StudentRecord[] = [];

  for (let idx = 0; idx < count; idx++) {
    const name = `${sampleNames[idx % sampleNames.length]}${idx >= sampleNames.length ? ` (${Math.floor(idx / sampleNames.length) + 1})` : ''}`;
    const regNo = `210624104${(idx + 1).toString().padStart(3, '0')}`;

    // Dynamic Grades & Pass/Fail per student
    const universityResults: SubjectResult[] = defaultUnivSubjects.map((sub, sIdx) => {
      const isFailStudent = (idx % 9 === 0 && sIdx === (idx % 6));
      const markScore = isFailStudent ? 42 : (68 + (idx * 5 + sIdx * 9) % 31);

      let grade = 'O';
      let passFail: 'PASS' | 'FAIL' = 'PASS';

      if (markScore < 50 || isFailStudent) {
        grade = 'RA';
        passFail = 'FAIL';
      } else if (markScore >= 90) {
        grade = 'O';
      } else if (markScore >= 81) {
        grade = 'A+';
      } else if (markScore >= 73) {
        grade = 'A';
      } else if (markScore >= 63) {
        grade = 'B+';
      } else {
        grade = 'B';
      }

      return {
        ...sub,
        grade,
        passFail,
      };
    });

    // Dynamic CIE Marks & Pass/Fail per student
    const internalEvalResults: InternalEvalResult[] = defaultInternalSubjects.map((sub, sIdx) => {
      const isCieFail = (idx % 13 === 0 && sIdx === (idx % 4));
      const marks = isCieFail ? 44 : Math.min(100, Math.max(52, 68 + ((idx * 6 + sIdx * 11) % 31)));
      return {
        ...sub,
        cie1Marks: marks,
        passFail: marks < 50 ? 'FAIL' : 'PASS',
      };
    });

    const gpa5 = Number((7.8 + ((idx * 7) % 21) * 0.1).toFixed(2));
    const cgpa5 = Number((gpa5 - 0.12).toFixed(2));

    const gpa01 = Number((7.4 + ((idx * 3) % 19) * 0.1).toFixed(2));
    const gpa02 = Number((7.6 + ((idx * 4) % 19) * 0.1).toFixed(2));
    const gpa03 = Number((7.8 + ((idx * 5) % 19) * 0.1).toFixed(2));
    const gpa04 = Number((8.0 + ((idx * 6) % 19) * 0.1).toFixed(2));

    const cgpa01 = gpa01;
    const cgpa02 = Number(((gpa01 + gpa02) / 2).toFixed(2));
    const cgpa03 = Number(((gpa01 + gpa02 + gpa03) / 3).toFixed(2));
    const cgpa04 = Number(((gpa01 + gpa02 + gpa03 + gpa04) / 4).toFixed(2));

    students.push({
      id: `std-${idx + 1}`,
      regNo,
      name,
      department: 'Computer Science and Engineering',
      regulation: '2021/2024',
      universityResults,
      gpa: gpa5,
      cgpa: cgpa5,
      classObtained: cgpa5 >= 8.5 ? 'FIRST CLASS WITH DISTINCTION' : cgpa5 >= 7.0 ? 'FIRST CLASS' : 'SECOND CLASS',
      arrears: {
        '01': (idx % 17 === 0) ? 1 : 0,
        '02': (idx % 23 === 0) ? 1 : 0,
        '03': (idx % 19 === 0) ? 1 : 0,
        '04': 0,
        '05': 0,
        '06': 0,
        '07': 0,
      },
      gpaBySem: {
        '01': String(gpa01.toFixed(2)),
        '02': String(gpa02.toFixed(2)),
        '03': String(gpa03.toFixed(2)),
        '04': String(gpa04.toFixed(2)),
        '05': String(gpa5.toFixed(2)),
        '06': '-',
        '07': '-',
      },
      cgpaBySem: {
        '01': String(cgpa01.toFixed(2)),
        '02': String(cgpa02.toFixed(2)),
        '03': String(cgpa03.toFixed(2)),
        '04': String(cgpa04.toFixed(2)),
        '05': String(cgpa5.toFixed(2)),
        '06': '-',
        '07': '-',
      },
      internalEvalResults,
    });
  }

  return students;
};

export const defaultSampleStudents = generateSampleStudents(512);
