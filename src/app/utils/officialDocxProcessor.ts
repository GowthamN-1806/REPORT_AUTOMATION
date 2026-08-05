import PizZip from 'pizzip';
import { StudentRecord } from '../types';

/**
 * Helper to update or insert text inside a Word XML table cell <w:tc>
 */
function updateCellText(cellXml: string, text: any): string {
  const str = String(text !== undefined && text !== null ? text : '');
  if (!str) return cellXml;

  // If <w:t> tag already exists in cell, update text inside <w:t>
  if (cellXml.includes('<w:t')) {
    let replaced = false;
    return cellXml.replace(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g, () => {
      if (!replaced) {
        replaced = true;
        return `<w:t>${str}</w:t>`;
      }
      return '<w:t></w:t>';
    });
  }

  // If no <w:t> exists inside cell's paragraph, append run before </w:p>
  const runXml = `<w:r><w:rPr><w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr><w:t>${str}</w:t></w:r>`;
  return cellXml.replace('</w:p>', `${runXml}</w:p>`);
}

/**
 * Helper to process cells of a table row <w:tr> sequentially
 */
function processRow(rXml: string, values: any[]): string {
  let cellCount = 0;
  return rXml.replace(/<w:tc[\s\S]*?<\/w:tc>/g, (cellXml) => {
    const val = values[cellCount] !== undefined ? values[cellCount] : '';
    cellCount++;
    return updateCellText(cellXml, val);
  });
}

/**
 * Loads an official master DOCX template from public/templates/
 * and populates all placeholders & tables for a single student.
 */
export async function populateOfficialDocxTemplate(
  templateFileName: string,
  student: StudentRecord,
  regulation: string = '2021'
): Promise<Uint8Array> {
  const cleanName = templateFileName.replace(/^\/?(backend\/templates\/|templates\/)?/, '');
  const url = `/templates/${cleanName}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load official template ${cleanName} from ${url}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const zip = new PizZip(arrayBuffer);
  let xml = zip.file('word/document.xml')?.asText() || '';

  // 1. Replace Top Placeholders
  xml = xml.replace(/\{\{REGISTER_NUMBER\}\}/g, student.regNo || '');
  xml = xml.replace(/\{\{STUDENT_NAME\}\}/g, student.name || '');
  xml = xml.replace(/\{\{DEPARTMENT\}\}/g, student.department || 'Computer Science and Engineering');
  xml = xml.replace(/\{\{EXAM_SESSION\}\}/g, 'Nov/Dec 2025');
  xml = xml.replace(/\{\{REGULATION\}\}/g, regulation || student.regulation || '2021');
  xml = xml.replace(/\{\{ACADEMIC_YEAR\}\}/g, '2025 - 2026');

  // 2. Populate Tables
  let tblCount = 0;
  xml = xml.replace(/<w:tbl[\s\S]*?<\/w:tbl>/g, (tblXml) => {
    tblCount++;

    // TABLE 2: University Results
    if (tblCount === 2) {
      let rIdx = 0;
      return tblXml.replace(/<w:tr[\s\S]*?<\/w:tr>/g, (rXml) => {
        if (rIdx === 0) {
          rIdx++;
          return rXml; // Header row
        }
        const item = (student.universityResults || [])[rIdx - 1];
        rIdx++;
        if (item) {
          return processRow(rXml, [item.sem || 'VI', item.code, item.title, item.grade, item.passFail]);
        }
        return processRow(rXml, ['', '', '', '', '']);
      });
    }

    // TABLE 3: GPA & CGPA Summary Table
    if (tblCount === 3) {
      let rIdx = 0;
      return tblXml.replace(/<w:tr[\s\S]*?<\/w:tr>/g, (rXml) => {
        const currentIdx = rIdx;
        rIdx++;

        // Row 3 = CGPA, Row 4 = CLASS OBTAINED
        if (currentIdx === 3) {
          const cgpaVal = student.cgpa ? student.cgpa.toFixed(2) : '8.42';
          return processRow(rXml, ['CGPA', cgpaVal]);
        }
        if (currentIdx === 4) {
          const classVal = student.classObtained || 'FIRST CLASS';
          return processRow(rXml, ['CLASS OBTAINED', classVal]);
        }
        return rXml;
      });
    }

    // TABLE 4: Internal Evaluation Marks Table
    if (tblCount === 4) {
      let rIdx = 0;
      const isModel = cleanName.includes('model');
      const isCie2 = cleanName.includes('cie1_cie2');

      return tblXml.replace(/<w:tr[\s\S]*?<\/w:tr>/g, (rXml) => {
        if (rIdx < 2) {
          rIdx++;
          return rXml; // Header rows 0 and 1
        }
        const item = (student.internalEvalResults || [])[rIdx - 2];
        rIdx++;

        if (item) {
          if (isModel) {
            return processRow(rXml, [
              item.sem || 'VI',
              item.code,
              item.title,
              item.cie1Marks !== undefined ? item.cie1Marks : '',
              item.cie1Marks !== undefined ? (item.cie1Marks >= 50 ? 'PASS' : 'FAIL') : '',
              item.cie2Marks !== undefined ? item.cie2Marks : '',
              item.cie2Marks !== undefined ? (item.cie2Marks >= 50 ? 'PASS' : 'FAIL') : '',
              item.modelMarks !== undefined ? item.modelMarks : '',
              item.modelMarks !== undefined ? (item.modelMarks >= 50 ? 'PASS' : 'FAIL') : '',
            ]);
          } else if (isCie2) {
            return processRow(rXml, [
              item.sem || 'VI',
              item.code,
              item.title,
              item.cie1Marks !== undefined ? item.cie1Marks : '',
              item.cie1Marks !== undefined ? (item.cie1Marks >= 50 ? 'PASS' : 'FAIL') : '',
              item.cie2Marks !== undefined ? item.cie2Marks : '',
              item.cie2Marks !== undefined ? (item.cie2Marks >= 50 ? 'PASS' : 'FAIL') : '',
            ]);
          } else {
            return processRow(rXml, [
              item.sem || 'VI',
              item.code,
              item.title,
              item.cie1Marks !== undefined ? item.cie1Marks : '',
              item.cie1Marks !== undefined ? (item.cie1Marks >= 50 ? 'PASS' : 'FAIL') : '',
            ]);
          }
        }

        return processRow(rXml, ['', '', '', '', '', '', '', '', '']);
      });
    }

    return tblXml;
  });

  zip.file('word/document.xml', xml);
  return zip.generate({ type: 'uint8array' });
}
