import PizZip from 'pizzip';
import { StudentRecord } from '../types';

/**
 * Helper to update or insert text inside a Word XML table cell <w:tc>
 */
function updateCellText(cellXml: string, text: any): string {
  const str = String(text !== undefined && text !== null ? text : '');
  if (cellXml.includes('<w:t')) {
    let replaced = false;
    return cellXml.replace(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g, (match, p1) => {
      if (!replaced) {
        replaced = true;
        return match.replace(p1, str);
      } else {
        return match.replace(p1, '');
      }
    });
  } else {
    const pEnd = cellXml.indexOf('</w:p>');
    if (pEnd !== -1) {
      const run = `<w:r><w:t>${str}</w:t></w:r>`;
      return cellXml.slice(0, pEnd) + run + cellXml.slice(pEnd);
    }
  }
  return cellXml;
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
  // Ensure template path is correctly resolved from /templates/
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
  const tableMatches = xml.match(/<w:tbl[\s\S]*?<\/w:tbl>/g) || [];

  if (tableMatches.length >= 4) {
    // TABLE 2: University Results
    let tbl2 = tableMatches[1];
    let rows2 = tbl2.match(/<w:tr[\s\S]*?<\/w:tr>/g) || [];
    const univList = student.universityResults || [];

    rows2.slice(1).forEach((rXml, idx) => {
      const item = univList[idx];
      let newR = rXml;
      let cells = newR.match(/<w:tc[\s\S]*?<\/w:tc>/g) || [];
      if (cells.length >= 5) {
        const c0 = updateCellText(cells[0], item ? item.sem || 'VI' : '');
        const c1 = updateCellText(cells[1], item ? item.code : '');
        const c2 = updateCellText(cells[2], item ? item.title : '');
        const c3 = updateCellText(cells[3], item ? item.grade : '');
        const c4 = updateCellText(cells[4], item ? item.passFail : '');
        newR = newR
          .replace(cells[0], c0)
          .replace(cells[1], c1)
          .replace(cells[2], c2)
          .replace(cells[3], c3)
          .replace(cells[4], c4);
        tbl2 = tbl2.replace(rXml, newR);
      }
    });
    xml = xml.replace(tableMatches[1], tbl2);

    // TABLE 3: GPA & CGPA Summary Table
    let tbl3 = tableMatches[2];
    let rows3 = tbl3.match(/<w:tr[\s\S]*?<\/w:tr>/g) || [];
    // Row 2 = GPA, Row 3 = CGPA, Row 4 = CLASS OBTAINED
    if (rows3.length >= 5) {
      // CGPA row (Row 3)
      let r3 = rows3[3];
      let cells3 = r3.match(/<w:tc[\s\S]*?<\/w:tc>/g) || [];
      if (cells3.length >= 2) {
        const cgpaVal = student.cgpa ? student.cgpa.toFixed(2) : '8.42';
        const newC1 = updateCellText(cells3[1], cgpaVal);
        r3 = r3.replace(cells3[1], newC1);
        tbl3 = tbl3.replace(rows3[3], r3);
      }

      // Class Obtained row (Row 4)
      let r4 = rows3[4];
      let cells4 = r4.match(/<w:tc[\s\S]*?<\/w:tc>/g) || [];
      if (cells4.length >= 2) {
        const classVal = student.classObtained || 'FIRST CLASS';
        const newC1 = updateCellText(cells4[1], classVal);
        r4 = r4.replace(cells4[1], newC1);
        tbl3 = tbl3.replace(rows3[4], r4);
      }
    }
    xml = xml.replace(tableMatches[2], tbl3);

    // TABLE 4: Internal Evaluation Marks Table
    let tbl4 = tableMatches[3];
    let rows4 = tbl4.match(/<w:tr[\s\S]*?<\/w:tr>/g) || [];
    const internalList = student.internalEvalResults || [];
    const isModel = cleanName.includes('model');
    const isCie2 = cleanName.includes('cie1_cie2');

    // Data rows start at index 2 (row 0 and row 1 are headers)
    rows4.slice(2).forEach((rXml, idx) => {
      const item = internalList[idx];
      let newR = rXml;
      let cells = newR.match(/<w:tc[\s\S]*?<\/w:tc>/g) || [];

      if (cells.length >= 4) {
        const c0 = updateCellText(cells[0], item ? item.sem || 'VI' : '');
        const c1 = updateCellText(cells[1], item ? item.code : '');
        const c2 = updateCellText(cells[2], item ? item.title : '');
        newR = newR.replace(cells[0], c0).replace(cells[1], c1).replace(cells[2], c2);

        if (isModel && cells.length >= 9) {
          const c3 = updateCellText(cells[3], item && item.cie1Marks !== undefined ? item.cie1Marks : '');
          const c4 = updateCellText(cells[4], item && item.cie1Marks !== undefined ? (item.cie1Marks >= 50 ? 'PASS' : 'FAIL') : '');
          const c5 = updateCellText(cells[5], item && item.cie2Marks !== undefined ? item.cie2Marks : '');
          const c6 = updateCellText(cells[6], item && item.cie2Marks !== undefined ? (item.cie2Marks >= 50 ? 'PASS' : 'FAIL') : '');
          const c7 = updateCellText(cells[7], item && item.modelMarks !== undefined ? item.modelMarks : '');
          const c8 = updateCellText(cells[8], item && item.modelMarks !== undefined ? (item.modelMarks >= 50 ? 'PASS' : 'FAIL') : '');

          newR = newR
            .replace(cells[3], c3)
            .replace(cells[4], c4)
            .replace(cells[5], c5)
            .replace(cells[6], c6)
            .replace(cells[7], c7)
            .replace(cells[8], c8);
        } else if (isCie2 && cells.length >= 7) {
          const c3 = updateCellText(cells[3], item && item.cie1Marks !== undefined ? item.cie1Marks : '');
          const c4 = updateCellText(cells[4], item && item.cie1Marks !== undefined ? (item.cie1Marks >= 50 ? 'PASS' : 'FAIL') : '');
          const c5 = updateCellText(cells[5], item && item.cie2Marks !== undefined ? item.cie2Marks : '');
          const c6 = updateCellText(cells[6], item && item.cie2Marks !== undefined ? (item.cie2Marks >= 50 ? 'PASS' : 'FAIL') : '');

          newR = newR
            .replace(cells[3], c3)
            .replace(cells[4], c4)
            .replace(cells[5], c5)
            .replace(cells[6], c6);
        } else if (cells.length >= 5) {
          const c3 = updateCellText(cells[3], item && item.cie1Marks !== undefined ? item.cie1Marks : '');
          const c4 = updateCellText(cells[4], item && item.cie1Marks !== undefined ? (item.cie1Marks >= 50 ? 'PASS' : 'FAIL') : '');
          newR = newR.replace(cells[3], c3).replace(cells[4], c4);
        }

        tbl4 = tbl4.replace(rXml, newR);
      }
    });
    xml = xml.replace(tableMatches[3], tbl4);
  }

  zip.file('word/document.xml', xml);
  return zip.generate({ type: 'uint8array' });
}
