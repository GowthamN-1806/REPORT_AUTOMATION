import { StudentRecord } from '../types';
import {
  generateDynamicSingleWordDocument,
  generateDynamicCombinedWordDocument,
} from './dynamicDocxGenerator';

/**
 * Downloads a single student's Word (.docx) report dynamically generated
 * directly from the Live Preview report data/structure.
 * No external .docx templates are fetched or merged.
 */
export const generateSingleWordDocument = async (
  student: StudentRecord,
  _templateFile: string = 'template_cie1.docx',
  regulation: string = '2021'
): Promise<void> => {
  const docBytes = await generateDynamicSingleWordDocument(student, regulation);

  const blob = new Blob([docBytes], {
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
 * Generates Word (.docx) reports for all merged students into ONE single combined document
 * dynamically generated directly from the Live Preview report structure.
 * No external .docx templates are fetched or merged.
 */
export const generateCombinedWordDocument = async (
  students: StudentRecord[],
  _templateFile: string = 'template_cie1.docx',
  regulation: string = '2021'
): Promise<void> => {
  if (!students || students.length === 0) return;

  const mergedDocBytes = await generateDynamicCombinedWordDocument(students, regulation);

  const blob = new Blob([mergedDocBytes], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });

  const fileName = `JEPPIAAR_IT_ALL_STUDENT_MARKS_REPORTS.docx`;
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(blobUrl);
};
