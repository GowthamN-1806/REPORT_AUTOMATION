import PizZip from 'pizzip';
import { StudentRecord } from '../types';

export interface PlaceholderMappingLog {
  placeholder: string;
  expectedCol: string;
  actualCol: string;
  value: string;
  status: 'SUCCESS' | 'PENDING' | 'NOT_AVAILABLE';
  reason: string;
}

export interface DocxPopulationResult {
  docBytes: Uint8Array;
  mappingLogs: PlaceholderMappingLog[];
}

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
 * and populates all placeholders & tables dynamically for a single student.
 */
export async function populateOfficialDocxTemplateWithLogs(
  templateFileName: string,
  student: StudentRecord,
  regulation: string = '2021'
): Promise<DocxPopulationResult> {
  const cleanName = templateFileName.replace(/^\/?(backend\/templates\/|templates\/)?/, '');
  const url = `/templates/${cleanName}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load official template ${cleanName} from ${url}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const zip = new PizZip(arrayBuffer);
  let xml = zip.file('word/document.xml')?.asText() || '';

  const mappingLogs: PlaceholderMappingLog[] = [];

  // 1. Dynamic Placeholder Scan & Map
  const placeholderRegex = /\{\{(?:<[^>]+>)*?([A-Za-z0-9_.\s-]+)(?:<[^>]+>)*?\}\}/g;
  let match;
  const scannedPlaceholders = new Set<string>();

  while ((match = placeholderRegex.exec(xml)) !== null) {
    const phName = match[1].replace(/<[^>]+>/g, '').trim();
    if (phName) scannedPlaceholders.add(phName);
  }

  scannedPlaceholders.forEach((ph) => {
    const cleanPh = ph.toLowerCase().replace(/[\s_.-]+/g, '');
    let val = '';
    let foundCol = '';
    let reason = '';

    if (cleanPh.includes('regulation')) {
      val = regulation || student.regulation || '2021';
      foundCol = 'Regulation';
    } else if (cleanPh.includes('registernumber') || cleanPh.includes('regno') || cleanPh === 'reg' || cleanPh.includes('register')) {
      val = student.regNo || 'Not Available';
      foundCol = 'Register Number';
    } else if (cleanPh.includes('studentname') || cleanPh.includes('name')) {
      val = student.name || 'Not Available';
      foundCol = 'Student Name';
    } else if (cleanPh.includes('department') || cleanPh.includes('dept')) {
      val = student.department || 'Computer Science and Engineering';
      foundCol = 'Department';
    } else if (cleanPh.includes('examsession') || cleanPh.includes('session')) {
      val = 'Nov/Dec 2025';
      foundCol = 'Exam Session';
    } else if (cleanPh.includes('academicyear') || cleanPh.includes('year')) {
      val = '2025 - 2026';
      foundCol = 'Academic Year';
    } else {
      // Dynamic Subject placeholder matching
      const sub = (student.internalEvalResults || []).find(
        (s) => s.code.toLowerCase().replace(/[\s_.-]+/g, '') === cleanPh
      );
      if (sub) {
        val = String(sub.cie1Marks !== undefined ? sub.cie1Marks : 'Pending');
        foundCol = sub.code;
      } else {
        val = 'Pending';
        reason = 'No matching Excel column or subject dataset found';
      }
    }

    const status: 'SUCCESS' | 'PENDING' | 'NOT_AVAILABLE' =
      val && val !== 'Pending' && val !== 'Not Available'
        ? 'SUCCESS'
        : val === 'Pending'
        ? 'PENDING'
        : 'NOT_AVAILABLE';

    mappingLogs.push({
      placeholder: `{{${ph}}}`,
      expectedCol: ph,
      actualCol: foundCol || 'None',
      value: val,
      status,
      reason,
    });

    // Replace in XML with fallback value if missing
    const fillValue = val || 'Pending';
    const replaceRegex = new RegExp(`\\{\\{${ph}\\}\\}`, 'gi');
    xml = xml.replace(replaceRegex, fillValue);
  });

  // 2. Populate Tables
  const tableMatches = xml.match(/<w:tbl[\s\S]*?<\/w:tbl>/gi) || [];

  if (tableMatches.length >= 4) {
    // TABLE 2: University Results Table
    let tbl2 = tableMatches[1];
    let rows2 = tbl2.match(/<w:tr[\s\S]*?<\/w:tr>/gi) || [];
    const univList = student.universityResults || [];

    rows2.slice(1).forEach((rXml, idx) => {
      const item = univList[idx];
      const vals = item
        ? [item.sem || 'VI', item.code || 'Not Available', item.title || 'Not Available', item.grade || 'Pending', item.passFail || 'Pending']
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
              item.code || 'Not Available',
              item.title || 'Not Available',
              item.cie1Marks !== undefined ? String(item.cie1Marks) : 'Pending',
              item.cie1Marks !== undefined ? (item.cie1Marks >= 50 ? 'PASS' : 'FAIL') : 'Pending',
              item.cie2Marks !== undefined ? String(item.cie2Marks) : 'Pending',
              item.cie2Marks !== undefined ? (item.cie2Marks >= 50 ? 'PASS' : 'FAIL') : 'Pending',
              item.modelMarks !== undefined ? String(item.modelMarks) : 'Pending',
              item.modelMarks !== undefined ? (item.modelMarks >= 50 ? 'PASS' : 'FAIL') : 'Pending',
            ]
          : ['', '', '', '', '', '', '', '', ''];
      } else if (isCie2) {
        vals = item
          ? [
              item.sem || 'VI',
              item.code || 'Not Available',
              item.title || 'Not Available',
              item.cie1Marks !== undefined ? String(item.cie1Marks) : 'Pending',
              item.cie1Marks !== undefined ? (item.cie1Marks >= 50 ? 'PASS' : 'FAIL') : 'Pending',
              item.cie2Marks !== undefined ? String(item.cie2Marks) : 'Pending',
              item.cie2Marks !== undefined ? (item.cie2Marks >= 50 ? 'PASS' : 'FAIL') : 'Pending',
            ]
          : ['', '', '', '', '', '', ''];
      } else {
        vals = item
          ? [
              item.sem || 'VI',
              item.code || 'Not Available',
              item.title || 'Not Available',
              item.cie1Marks !== undefined ? String(item.cie1Marks) : 'Pending',
              item.cie1Marks !== undefined ? (item.cie1Marks >= 50 ? 'PASS' : 'FAIL') : 'Pending',
            ]
          : ['', '', '', '', ''];
      }

      const updatedRow = updateRowCells(rXml, vals);
      tbl4 = tbl4.replace(rXml, updatedRow);
    });
    xml = xml.replace(tableMatches[3], tbl4);
  }

  zip.file('word/document.xml', xml);
  const docBytes = zip.generate({ type: 'uint8array' });

  return {
    docBytes,
    mappingLogs,
  };
}

/**
 * Backward compatible helper that returns Uint8Array docBytes directly.
 */
export async function populateOfficialDocxTemplate(
  templateFileName: string,
  student: StudentRecord,
  regulation: string = '2021'
): Promise<Uint8Array> {
  const result = await populateOfficialDocxTemplateWithLogs(templateFileName, student, regulation);
  return result.docBytes;
}
