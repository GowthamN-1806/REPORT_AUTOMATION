import { StudentRecord } from '../types';
import { populateOfficialDocxTemplate } from './officialDocxProcessor';
import JSZip from 'jszip';

/**
 * Downloads a single student's filled official DOCX report.
 */
export const generateSingleWordDocument = async (
  student: StudentRecord,
  templateFile: string = 'template_cie1.docx',
  regulation: string = '2021'
): Promise<void> => {
  const docxBytes = await populateOfficialDocxTemplate(templateFile, student, regulation);
  const blob = new Blob([docxBytes], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });

  const fileName = `${student.regNo}_${student.name.replace(/\s+/g, '_')}_REPORT.docx`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Generates official DOCX reports for all merged students and downloads them as a ZIP archive.
 */
export const generateCombinedWordDocument = async (
  students: StudentRecord[],
  templateFile: string = 'template_cie1.docx',
  regulation: string = '2021'
): Promise<void> => {
  if (!students || students.length === 0) return;

  if (students.length === 1) {
    await generateSingleWordDocument(students[0], templateFile, regulation);
    return;
  }

  const zip = new JSZip();

  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    const docxBytes = await populateOfficialDocxTemplate(templateFile, student, regulation);
    const fileName = `${student.regNo}_${student.name.replace(/\s+/g, '_')}_REPORT.docx`;
    zip.file(fileName, docxBytes);
  }

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = `JEPPIAAR_IT_STUDENT_MARKS_WORD_REPORTS_${templateFile.replace('.docx', '')}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
