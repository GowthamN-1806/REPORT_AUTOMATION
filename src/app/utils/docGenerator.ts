import PizZip from 'pizzip';
import { StudentRecord } from '../types';
import { populateOfficialDocxTemplateWithLogs } from './officialDocxProcessor';

/**
 * Downloads a single student's filled official DOCX report generated directly from the master DOCX template.
 * Preserves original logos (word/media/*), headers, footers, table styling, borders, section properties, and margins.
 */
export const generateSingleWordDocument = async (
  student: StudentRecord,
  templateFile: string = 'template_cie1.docx',
  regulation: string = '2021'
): Promise<void> => {
  const result = await populateOfficialDocxTemplateWithLogs(templateFile, student, regulation);

  const blob = new Blob([result.docBytes], {
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
 * Generates official Word (.docx) reports for all merged students into ONE single combined document.
 * Combines each student's populated master DOCX template package into a single .docx package,
 * preserving original JEPPIAAR logos, headers, footers, page borders, table formatting, and section properties.
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

  const cleanName = templateFile.replace(/^\/?(backend\/templates\/|templates\/)?/, '');
  const url = `/templates/${cleanName}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load master template ${cleanName} from ${url}`);
  }

  const masterArrayBuffer = await response.arrayBuffer();
  const masterZip = new PizZip(masterArrayBuffer);

  const masterDocXml = masterZip.file('word/document.xml')?.asText() || '';

  let combinedBodies = '';

  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    const populated = await populateOfficialDocxTemplateWithLogs(templateFile, student, regulation);

    const studentZip = new PizZip(populated.docBytes);
    const studentDocXml = studentZip.file('word/document.xml')?.asText() || '';

    // Extract body content between <w:body> and </w:body>
    const bodyMatch = studentDocXml.match(/<w:body[^>]*>([\s\S]*?)<\/w:body>/i);
    let bodyContent = bodyMatch ? bodyMatch[1] : '';

    if (i < students.length - 1) {
      // Extract section properties from student's body
      const sectPrMatch = bodyContent.match(/<w:sectPr[\s\S]*?<\/w:sectPr>/i);
      const sectPr = sectPrMatch ? sectPrMatch[0] : '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr>';

      // Strip trailing sectPr from student body content
      bodyContent = bodyContent.replace(/<w:sectPr[\s\S]*?<\/w:sectPr>/gi, '');

      // Create valid Section Break (Next Page) element
      const sectionBreakXml = `<w:p><w:pPr>${sectPr.replace('<w:sectPr', '<w:sectPr><w:type w:val="nextPage"/>')}</w:pPr></w:p>`;
      bodyContent += sectionBreakXml;
    }

    combinedBodies += bodyContent;
  }

  // Wrap all combined bodies inside the master document XML structure
  const finalDocumentXml = masterDocXml.replace(
    /<w:body[^>]*>[\s\S]*?<\/w:body>/i,
    `<w:body>${combinedBodies}</w:body>`
  );

  masterZip.file('word/document.xml', finalDocumentXml);

  const mergedDocBytes = masterZip.generate({ type: 'uint8array' });

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
