import * as XLSX from 'xlsx';
import { StudentRecord } from '../types';

export const downloadSampleExcel = (students: StudentRecord[]) => {
  const rows = students.map((std) => {
    const rowObj: Record<string, any> = {
      'Register No': std.regNo,
      'Student Name': std.name,
      'Department': std.department || 'Computer Science and Engineering',
      'Regulation': std.regulation || '2021/2024',
      'GPA': std.gpa,
      'CGPA': std.cgpa,
      'Class Obtained': std.classObtained,
    };

    // Add Semester 01 - 07 GPAs, CGPAs, and Arrears
    for (let s = 1; s <= 7; s++) {
      const semKey = `0${s}`;
      rowObj[`GPA ${semKey}`] = std.gpaBySem?.[semKey] || (s === 5 ? std.gpa : '-');
      rowObj[`CGPA ${semKey}`] = std.cgpaBySem?.[semKey] || (s === 5 ? std.cgpa : '-');
      rowObj[`Arrears ${semKey}`] = std.arrears?.[semKey] ?? 0;
    }

    // Add University Results
    (std.universityResults || []).forEach((sub, i) => {
      rowObj[`Univ Sub ${i + 1} Sem`] = sub.sem;
      rowObj[`Univ Sub ${i + 1} Code`] = sub.code;
      rowObj[`Univ Sub ${i + 1} Title`] = sub.title;
      rowObj[`Univ Sub ${i + 1} Grade`] = sub.grade;
      rowObj[`Univ Sub ${i + 1} Pass/Fail`] = sub.passFail;
    });

    // Add CIE Results
    (std.internalEvalResults || []).forEach((sub, i) => {
      rowObj[`CIE Sub ${i + 1} Sem`] = sub.sem;
      rowObj[`CIE Sub ${i + 1} Code`] = sub.code;
      rowObj[`CIE Sub ${i + 1} Title`] = sub.title;
      rowObj[`CIE Sub ${i + 1} Marks`] = sub.cie1Marks;
      rowObj[`CIE Sub ${i + 1} Pass/Fail`] = sub.passFail;
    });

    return rowObj;
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);

  const colWidths = [
    { wch: 18 }, { wch: 26 }, { wch: 32 }, { wch: 14 }, { wch: 10 }, { wch: 10 }, { wch: 28 },
    { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 },
    { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 },
    { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 },
    { wch: 12 }, { wch: 14 }, { wch: 32 }, { wch: 12 }, { wch: 12 },
    { wch: 12 }, { wch: 14 }, { wch: 32 }, { wch: 12 }, { wch: 12 },
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'JIT_Student_Marks');

  XLSX.writeFile(workbook, 'JIT_PARENTS_Mark_Sheet_Template.xlsx');
};
