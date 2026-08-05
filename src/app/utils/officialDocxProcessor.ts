import PizZip from 'pizzip';
import { StudentRecord } from '../types';

/**
 * Escapes special XML characters to prevent XML parsing syntax errors in Word & docx-preview
 */
function escapeXml(str: any): string {
  return String(str !== undefined && str !== null ? str : '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Updates text inside a Word XML cell <w:tc>
 */
function updateCellText(cellXml: string, text: any): string {
  const str = escapeXml(text);
  if (!str) return cellXml;

  // If <w:t> tag already exists in cell, replace text inside <w:t>
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

  // If no <w:t> tag exists, append run inside cell's paragraph before </w:p>
  const runXml = `<w:r><w:rPr><w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr><w:t>${str}</w:t></w:r></w:p>`;
  return cellXml.replace(/<\/w:p>/, runXml);
}

/**
 * Updates cells of a row by splitting rowXml into cell chunks
 */
function updateRowCells(rowXml: string, values: any[]): string {
  const parts = rowXml.split(/(<w:tc[\s\S]*?<\/w:tc>)/g);
  let cellIdx = 0;

  for (let i = 0; i < parts.length; i++) {
    if (parts[i].startsWith('<w:tc')) {
      const val = values[cellIdx] !== undefined ? values[cellIdx] : '';
      cellIdx++;
      parts[i] = updateCellText(parts[i], val);
    }
  }

  return parts.join('');
}

/**
 * Updates rows of a table by splitting tblXml into row chunks
 */
function updateTableRows(tblXml: string, rowValuesList: any[][], headerRowsCount: number = 1): string {
  const trParts = tblXml.split(/(<w:tr[\s\S]*?<\/w:tr>)/g);
  let trIdx = 0;

  for (let i = 0; i < trParts.length; i++) {
    if (trParts[i].startsWith('<w:tr')) {
      const currentTr = trIdx;
      trIdx++;
      if (currentTr >= headerRowsCount) {
        const values = rowValuesList[currentTr - headerRowsCount] || [];
        trParts[i] = updateRowCells(trParts[i], values);
      }
    }
  }

  return trParts.join('');
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

  // 1. Replace Top Placeholders with XML-Escaped Values
  xml = xml.replace(/\{\{REGISTER_NUMBER\}\}/g, escapeXml(student.regNo || ''));
  xml = xml.replace(/\{\{STUDENT_NAME\}\}/g, escapeXml(student.name || ''));
  xml = xml.replace(/\{\{DEPARTMENT\}\}/g, escapeXml(student.department || 'Computer Science and Engineering'));
  xml = xml.replace(/\{\{EXAM_SESSION\}\}/g, 'Nov/Dec 2025');
  xml = xml.replace(/\{\{REGULATION\}\}/g, escapeXml(regulation || student.regulation || '2021'));
  xml = xml.replace(/\{\{ACADEMIC_YEAR\}\}/g, '2025 - 2026');

  // 2. Split XML into Table Chunks & Update Tables Immutably
  const isModel = cleanName.includes('model');
  const isCie2 = cleanName.includes('cie1_cie2');

  const tblParts = xml.split(/(<w:tbl[\s\S]*?<\/w:tbl>)/g);
  let tblIdx = 0;

  for (let i = 0; i < tblParts.length; i++) {
    if (tblParts[i].startsWith('<w:tbl')) {
      const currentTbl = tblIdx;
      tblIdx++;

      if (currentTbl === 1) {
        // Table 2: University Results Table
        const univRows = (student.universityResults || []).map((r) => [
          r.sem || 'VI',
          r.code,
          r.title,
          r.grade,
          r.passFail,
        ]);
        tblParts[i] = updateTableRows(tblParts[i], univRows, 1);
      } else if (currentTbl === 2) {
        // Table 3: GPA & CGPA Summary Table
        const cgpaVal = student.cgpa ? student.cgpa.toFixed(2) : '8.42';
        const classVal = student.classObtained || 'FIRST CLASS';
        const gpaRows = [
          [],
          [],
          [],
          ['CGPA', cgpaVal],
          ['CLASS OBTAINED', classVal],
        ];
        tblParts[i] = updateTableRows(tblParts[i], gpaRows, 0);
      } else if (currentTbl === 3) {
        // Table 4: Internal Evaluation Marks Table
        const intRows = (student.internalEvalResults || []).map((r) => {
          if (isModel) {
            return [
              r.sem || 'VI',
              r.code,
              r.title,
              r.cie1Marks !== undefined ? r.cie1Marks : '',
              r.cie1Marks !== undefined ? (r.cie1Marks >= 50 ? 'PASS' : 'FAIL') : '',
              r.cie2Marks !== undefined ? r.cie2Marks : '',
              r.cie2Marks !== undefined ? (r.cie2Marks >= 50 ? 'PASS' : 'FAIL') : '',
              r.modelMarks !== undefined ? r.modelMarks : '',
              r.modelMarks !== undefined ? (r.modelMarks >= 50 ? 'PASS' : 'FAIL') : '',
            ];
          } else if (isCie2) {
            return [
              r.sem || 'VI',
              r.code,
              r.title,
              r.cie1Marks !== undefined ? r.cie1Marks : '',
              r.cie1Marks !== undefined ? (r.cie1Marks >= 50 ? 'PASS' : 'FAIL') : '',
              r.cie2Marks !== undefined ? r.cie2Marks : '',
              r.cie2Marks !== undefined ? (r.cie2Marks >= 50 ? 'PASS' : 'FAIL') : '',
            ];
          } else {
            return [
              r.sem || 'VI',
              r.code,
              r.title,
              r.cie1Marks !== undefined ? r.cie1Marks : '',
              r.cie1Marks !== undefined ? (r.cie1Marks >= 50 ? 'PASS' : 'FAIL') : '',
            ];
          }
        });
        tblParts[i] = updateTableRows(tblParts[i], intRows, 2);
      }
    }
  }

  xml = tblParts.join('');

  zip.file('word/document.xml', xml);
  return zip.generate({ type: 'uint8array' });
}
