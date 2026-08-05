import PizZip from 'pizzip';
import { StudentRecord } from '../types';

/**
 * Helper to update text inside a Word XML cell <w:tc>
 * Preserves all original cell properties (<w:tcPr>), paragraph properties (<w:pPr>), and text styling (<w:rPr>).
 */
function setCellContent(cellXml: string, textValue: any): string {
  const str = textValue !== undefined && textValue !== null ? String(textValue).trim() : '';

  if (cellXml.includes('<w:t')) {
    let hasWritten = false;
    return cellXml.replace(/<w:t[^>]*>([\s\S]*?)<\/w:t>/gi, (match, innerText) => {
      if (!hasWritten) {
        hasWritten = true;
        return match.replace(innerText, str);
      } else {
        return match.replace(innerText, '');
      }
    });
  } else {
    const pEndIndex = cellXml.lastIndexOf('</w:p>');
    if (pEndIndex !== -1) {
      const runXml = `<w:r><w:t>${str}</w:t></w:r>`;
      return cellXml.slice(0, pEndIndex) + runXml + cellXml.slice(pEndIndex);
    }
  }
  return cellXml;
}

/**
 * Updates cells inside a table row (<w:tr>) positionally using regex replacement
 */
function updateRowCells(rowXml: string, cellValues: string[]): string {
  let colIndex = 0;
  return rowXml.replace(/<w:tc[\s\S]*?<\/w:tc>/gi, (cellXml) => {
    const val = cellValues[colIndex] !== undefined ? cellValues[colIndex] : '';
    const updated = setCellContent(cellXml, val);
    colIndex++;
    return updated;
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

  // 1. Replace Top Header Placeholders
  const regNo = student.regNo || '';
  const studentName = student.name || '';
  const dept = student.department || 'Computer Science and Engineering';
  const regCode = regulation || student.regulation || '2021';
  const session = 'Nov/Dec 2025';
  const acadYear = '2025 - 2026';

  xml = xml.replace(/\{\{REGISTER_NUMBER\}\}/g, regNo);
  xml = xml.replace(/\{\{STUDENT_NAME\}\}/g, studentName);
  xml = xml.replace(/\{\{DEPARTMENT\}\}/g, dept);
  xml = xml.replace(/\{\{EXAM_SESSION\}\}/g, session);
  xml = xml.replace(/\{\{REGULATION\}\}/g, regCode);
  xml = xml.replace(/\{\{ACADEMIC_YEAR\}\}/g, acadYear);

  // 2. Populate Tables
  const tableMatches = xml.match(/<w:tbl[\s\S]*?<\/w:tbl>/gi) || [];

  if (tableMatches.length >= 4) {
    // TABLE 2: University Results
    let tbl2 = tableMatches[1];
    let rows2 = tbl2.match(/<w:tr[\s\S]*?<\/w:tr>/gi) || [];
    const univList = student.universityResults || [];

    rows2.slice(1).forEach((rXml, idx) => {
      const item = univList[idx];
      const vals = item
        ? [item.sem || 'VI', item.code || '', item.title || '', item.grade || '', item.passFail || '']
        : ['', '', '', '', ''];
      const updatedRow = updateRowCells(rXml, vals);
      tbl2 = tbl2.replace(rXml, updatedRow);
    });
    xml = xml.replace(tableMatches[1], tbl2);

    // TABLE 3: GPA & CGPA Summary Table
    let tbl3 = tableMatches[2];
    let rows3 = tbl3.match(/<w:tr[\s\S]*?<\/w:tr>/gi) || [];
    // Row 2 = GPA, Row 3 = CGPA, Row 4 = CLASS OBTAINED
    if (rows3.length >= 5) {
      // CGPA row (Row 3)
      let r3 = rows3[3];
      const cgpaVal = student.cgpa ? student.cgpa.toFixed(2) : '8.42';
      r3 = r3.replace(/<w:tc[\s\S]*?<\/w:tc>/gi, (cellXml, cIdx) => {
        if (cIdx === 1) return setCellContent(cellXml, cgpaVal);
        return cellXml;
      });
      tbl3 = tbl3.replace(rows3[3], r3);

      // Class Obtained row (Row 4)
      let r4 = rows3[4];
      const classVal = student.classObtained || 'FIRST CLASS';
      r4 = r4.replace(/<w:tc[\s\S]*?<\/w:tc>/gi, (cellXml, cIdx) => {
        if (cIdx === 1) return setCellContent(cellXml, classVal);
        return cellXml;
      });
      tbl3 = tbl3.replace(rows3[4], r4);
    }
    xml = xml.replace(tableMatches[2], tbl3);

    // TABLE 4: Internal Evaluation Marks Table
    let tbl4 = tableMatches[3];
    let rows4 = tbl4.match(/<w:tr[\s\S]*?<\/w:tr>/gi) || [];
    const internalList = student.internalEvalResults || [];
    const isModel = cleanName.includes('model');
    const isCie2 = cleanName.includes('cie1_cie2');

    // Data rows start at index 2 (row 0 and row 1 are table headers)
    rows4.slice(2).forEach((rXml, idx) => {
      const item = internalList[idx];
      let vals: string[] = [];

      if (isModel) {
        vals = item
          ? [
              item.sem || 'VI',
              item.code || '',
              item.title || '',
              item.cie1Marks !== undefined ? String(item.cie1Marks) : '',
              item.cie1Marks !== undefined ? (item.cie1Marks >= 50 ? 'PASS' : 'FAIL') : '',
              item.cie2Marks !== undefined ? String(item.cie2Marks) : '',
              item.cie2Marks !== undefined ? (item.cie2Marks >= 50 ? 'PASS' : 'FAIL') : '',
              item.modelMarks !== undefined ? String(item.modelMarks) : '',
              item.modelMarks !== undefined ? (item.modelMarks >= 50 ? 'PASS' : 'FAIL') : '',
            ]
          : ['', '', '', '', '', '', '', '', ''];
      } else if (isCie2) {
        vals = item
          ? [
              item.sem || 'VI',
              item.code || '',
              item.title || '',
              item.cie1Marks !== undefined ? String(item.cie1Marks) : '',
              item.cie1Marks !== undefined ? (item.cie1Marks >= 50 ? 'PASS' : 'FAIL') : '',
              item.cie2Marks !== undefined ? String(item.cie2Marks) : '',
              item.cie2Marks !== undefined ? (item.cie2Marks >= 50 ? 'PASS' : 'FAIL') : '',
            ]
          : ['', '', '', '', '', '', ''];
      } else {
        vals = item
          ? [
              item.sem || 'VI',
              item.code || '',
              item.title || '',
              item.cie1Marks !== undefined ? String(item.cie1Marks) : '',
              item.cie1Marks !== undefined ? (item.cie1Marks >= 50 ? 'PASS' : 'FAIL') : '',
            ]
          : ['', '', '', '', ''];
      }

      const updatedRow = updateRowCells(rXml, vals);
      tbl4 = tbl4.replace(rXml, updatedRow);
    });
    xml = xml.replace(tableMatches[3], tbl4);
  }

  zip.file('word/document.xml', xml);
  return zip.generate({ type: 'uint8array' });
}
