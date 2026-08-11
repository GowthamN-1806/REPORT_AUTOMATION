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
  studentData: any;
  mappedCount: number;
  unmappedCount: number;
  mappedPlaceholders: string[];
  unmappedPlaceholders: string[];
}

/**
 * Escapes special XML characters to prevent Word XML document corruption.
 * (&, <, >, ", ')
 */
export function escapeXml(str: any): string {
  if (str === undefined || str === null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Helper to update text inside a Word XML cell <w:tc>
 * Performs true in-place XML text updates on existing template cell elements,
 * preserving 100% of master template cell properties (<w:tcPr>), text run properties (<w:rPr>),
 * font family (Times New Roman), font size, bold weights, borders, cell margins, and alignments.
 * Enforces zero paragraph spacing (before=0, after=0, single line spacing)
 * so downloaded Word reports match the Live Preview report layout exactly.
 */
function setCellContent(cellXml: string, textValue: any): string {
  const str = textValue !== undefined && textValue !== null ? String(textValue).trim() : '';
  const escapedStr = escapeXml(str);

  // 1. Enforce zero paragraph spacing inside <w:pPr> while preserving all existing alignment and paragraph properties
  const zeroSpacing = '<w:spacing w:before="0" w:after="0" w:line="240" w:lineRule="auto"/>';
  if (cellXml.includes('<w:pPr>')) {
    if (cellXml.includes('<w:spacing')) {
      cellXml = cellXml.replace(/<w:spacing[\s\S]*?\/>/gi, zeroSpacing);
    } else {
      cellXml = cellXml.replace('<w:pPr>', `<w:pPr>${zeroSpacing}`);
    }
  } else if (cellXml.includes('<w:p>')) {
    cellXml = cellXml.replace('<w:p>', `<w:p><w:pPr>${zeroSpacing}</w:pPr>`);
  }

  // 2. Update existing <w:t> elements in-place to preserve all original <w:rPr>, <w:tcPr>, fonts, sizes, and styling
  if (cellXml.includes('<w:t')) {
    let written = false;
    return cellXml.replace(/<w:t(?=[\s>])[\s\S]*?<\/w:t>/gi, () => {
      if (!written) {
        written = true;
        return `<w:t xml:space="preserve">${escapedStr}</w:t>`;
      }
      return '<w:t></w:t>';
    });
  }

  // 3. If no <w:t> element exists in the template cell, append a text run into paragraph
  const pEndIndex = cellXml.lastIndexOf('</w:p>');
  if (pEndIndex !== -1) {
    const runXml = `<w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="19"/><w:szCs w:val="19"/></w:rPr><w:t xml:space="preserve">${escapedStr}</w:t></w:r>`;
    return cellXml.slice(0, pEndIndex) + runXml + cellXml.slice(pEndIndex);
  }

  return cellXml;
}

/**
 * Updates cells inside a table row (<w:tr>) positionally, stripping fixed row heights so Word uses automatic compact heights
 */
function updateRowCells(rowXml: string, cellValues: string[]): string {
  let colIndex = 0;
  // Remove fixed row heights to keep row heights automatic and compact
  const cleanedRow = rowXml.replace(/<w:trHeight[\s\S]*?\/>/gi, '');
  return cleanedRow.replace(/<w:tc(?=[\s>])[\s\S]*?<\/w:tc>/gi, (cellXml) => {
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
  // Validate student data object
  if (!student || (!student.regNo && !student.name && (!student.universityResults || student.universityResults.length === 0))) {
    console.error('=== ERROR: Student Data Object is empty! ===', student);
    throw new Error('No data was bound to the template. Check placeholder mapping.');
  }

  // Construct structured Student Data Object for logging & binding
  const studentData = {
    register_number: student.regNo || '',
    student_name: student.name || '',
    department: student.department || 'Computer Science and Engineering',
    semester: student.semester || 'VI',
    exam_session: 'Nov/Dec 2025',
    academic_year: student.academicYear || '',
    regulation: regulation || student.regulation || '2021',
    cgpa: student.cgpa || 8.42,
    gpa: student.gpaBySem || {},
    class_obtained: student.classObtained || 'FIRST CLASS',
    university_results: student.universityResults || [],
    internal_results: student.internalEvalResults || [],
  };

  console.log('=== POPULATING DOCX WITH STUDENT DATA ===', studentData);

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
  const mappedPlaceholders: string[] = [];
  const unmappedPlaceholders: string[] = [];

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
      val = studentData.regulation;
      foundCol = 'Regulation';
    } else if (cleanPh.includes('registernumber') || cleanPh.includes('regno') || cleanPh === 'reg' || cleanPh.includes('register')) {
      val = studentData.register_number || 'Not Available';
      foundCol = 'Register Number';
    } else if (cleanPh.includes('studentname') || cleanPh.includes('name')) {
      val = studentData.student_name || 'Not Available';
      foundCol = 'Student Name';
    } else if (cleanPh.includes('department') || cleanPh.includes('dept')) {
      val = studentData.department || '';
      foundCol = 'Department';
    } else if (cleanPh.includes('examsession') || cleanPh.includes('session')) {
      val = studentData.exam_session;
      foundCol = 'Exam Session';
    } else if (cleanPh.includes('academicyear') || cleanPh.includes('year')) {
      val = studentData.academic_year;
      foundCol = 'Academic Year';
    } else if (cleanPh.includes('semester') || cleanPh.includes('sem')) {
      val = studentData.semester;
      foundCol = 'Semester';
    } else {
      // Dynamic Subject placeholder matching
      const sub = studentData.internal_results.find(
        (s: any) => s.code.toLowerCase().replace(/[\s_.-]+/g, '') === cleanPh
      );
      if (sub) {
        val = String(sub.cie1Marks !== undefined ? sub.cie1Marks : 'Pending');
        foundCol = sub.code;
      } else {
        val = 'Pending';
        reason = 'No matching Excel column or subject dataset found';
      }
    }

    const isSuccess = val && val !== 'Pending' && val !== 'Not Available';

    if (isSuccess) {
      mappedPlaceholders.push(`{{${ph}}}`);
    } else {
      unmappedPlaceholders.push(`{{${ph}}}`);
    }

    const status: 'SUCCESS' | 'PENDING' | 'NOT_AVAILABLE' = isSuccess
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

    // Replace in XML using regex that matches even if Word split the placeholder across XML tags
    const escapedPh = ph.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const replaceRegex = new RegExp(`\\{\\{(?:<[^>]+>)*?${escapedPh}(?:<[^>]+>)*?\\}\\}`, 'gi');
    const fillValue = val !== undefined && val !== null ? String(val) : '';
    
    xml = xml.replace(replaceRegex, (m) => {
      if (m.includes('<w:t')) {
        let written = false;
        return m.replace(/<w:t(?=[\s>])[\s\S]*?<\/w:t>/gi, () => {
          if (!written) {
            written = true;
            return `<w:t xml:space="preserve">${escapeXml(fillValue)}</w:t>`;
          }
          return '<w:t></w:t>';
        });
      }
      return escapeXml(fillValue);
    });
  });

  // Helper to resolve numeric semester (1..7) from Roman numerals or string
  const getSemesterNumber = (semVal: any): number => {
    if (!semVal) return 0;
    const s = String(semVal).trim().toUpperCase();
    if (/^(iv|4|04)$/i.test(s)) return 4;
    if (/^(v|5|05)$/i.test(s)) return 5;
    if (/^(vi|6|06)$/i.test(s)) return 6;
    if (/^(vii|7|07)$/i.test(s)) return 7;
    if (/^(iii|3|03)$/i.test(s)) return 3;
    if (/^(ii|2|02)$/i.test(s)) return 2;
    if (/^(i|1|01)$/i.test(s)) return 1;
    const m = s.match(/([1-7])/);
    return m ? parseInt(m[1], 10) : 0;
  };

  const activeSemNum = getSemesterNumber(student.semester) ||
                       getSemesterNumber(studentData.semester) ||
                       getSemesterNumber(student.universityResults?.[0]?.sem) ||
                       4;

  // Helper for Table 3 semester matrix values
  const getSemVal = (map: Record<string, any> | undefined, sem: number, fallback: any = ''): string => {
    if (map) {
      const key1 = `0${sem}`;
      const key2 = `${sem}`;
      const val = map[key1] !== undefined ? map[key1] : map[key2];
      if (val !== undefined && val !== null && String(val).trim() !== '') {
        return String(val);
      }
    }
    if (sem === activeSemNum && fallback !== undefined && fallback !== null && String(fallback).trim() !== '') {
      return String(fallback);
    }
    return '';
  };

  const isModel = cleanName.includes('model');
  const isCie2 = cleanName.includes('cie1_cie2');

  // 2. Populate Template Tables with studentData atomically in a single pass
  let tableIndex = 0;
  xml = xml.replace(/<w:tbl(?=[\s>])[\s\S]*?<\/w:tbl>/gi, (tblXml) => {
    const currentIdx = tableIndex++;
    let rows = tblXml.match(/<w:tr(?=[\s>])[\s\S]*?<\/w:tr>/gi) || [];
    if (rows.length === 0) return tblXml;

    const tblPrMatch = tblXml.match(/<w:tblPr[\s\S]*?<\/w:tblPr>/i);
    const tblPrXml = tblPrMatch ? tblPrMatch[0] : '';
    const tblGridMatch = tblXml.match(/<w:tblGrid[\s\S]*?<\/w:tblGrid>/i);
    const tblGridXml = tblGridMatch ? tblGridMatch[0] : '';

    if (currentIdx === 0 && rows.length >= 2) {
      // TABLE 1: Student Information Table (Register Number & Name)
      rows[0] = rows[0].replace(/<w:tc(?=[\s>])[\s\S]*?<\/w:tc>/gi, (cellXml, cIdx) => {
        if (cIdx === 1) return setCellContent(cellXml, studentData.register_number);
        return cellXml;
      });
      rows[1] = rows[1].replace(/<w:tc(?=[\s>])[\s\S]*?<\/w:tc>/gi, (cellXml, cIdx) => {
        if (cIdx === 1) return setCellContent(cellXml, studentData.student_name);
        return cellXml;
      });
      return `<w:tbl>${tblPrXml}${tblGridXml}${rows.join('')}</w:tbl>`;
    }

    if (currentIdx === 1 && rows.length > 1) {
      // TABLE 2: University Results Table (Header = rows[0], Data Rows = rows[1..10])
      const univList = studentData.university_results || [];
      const updatedRows: string[] = [rows[0]];

      for (let r = 1; r < rows.length; r++) {
        const item = univList[r - 1];
        if (item) {
          const vals = [
            item.sem || 'V',
            item.code || '',
            item.title || '',
            item.grade || '',
            item.passFail || ''
          ];
          updatedRows.push(updateRowCells(rows[r], vals));
        } else {
          updatedRows.push(updateRowCells(rows[r], ['', '', '', '', '']));
        }
      }
      return `<w:tbl>${tblPrXml}${tblGridXml}${updatedRows.join('')}</w:tbl>`;
    }

    if (currentIdx === 2 && rows.length >= 5) {
      // TABLE 3: GPA & CGPA Summary Matrix Table (5 Rows)
      // Row 1: ARREARS
      const arrearsVals = ['ARREARS'];
      for (let c = 1; c <= 7; c++) {
        arrearsVals.push(getSemVal(student.arrears, c, ''));
      }
      rows[1] = updateRowCells(rows[1], arrearsVals);

      // Row 2: GPA
      const gpaVals = ['GPA'];
      for (let c = 1; c <= 7; c++) {
        gpaVals.push(getSemVal(student.gpaBySem || (studentData as any).gpa, c, student.gpa));
      }
      rows[2] = updateRowCells(rows[2], gpaVals);

      // Row 3: CGPA
      const cgpaVals = ['CGPA'];
      for (let c = 1; c <= 7; c++) {
        cgpaVals.push(getSemVal(student.cgpaBySem, c, student.cgpa));
      }
      rows[3] = updateRowCells(rows[3], cgpaVals);

      // Row 4: CLASS OBTAINED
      let r4 = rows[4];
      const classVal = studentData.class_obtained || '';
      r4 = r4.replace(/<w:tc(?=[\s>])[\s\S]*?<\/w:tc>/gi, (cellXml, cIdx) => {
        if (cIdx === 1) return setCellContent(cellXml, classVal);
        return cellXml;
      });
      rows[4] = r4;

      return `<w:tbl>${tblPrXml}${tblGridXml}${rows.join('')}</w:tbl>`;
    }

    if (currentIdx === 3 && rows.length > 1) {
      // TABLE 4: Internal Evaluation Marks Table
      const internalList = studentData.internal_results || [];
      const updatedRows: string[] = [rows[0]];

      for (let r = 1; r < rows.length; r++) {
        const item = internalList[r - 1];
        if (item) {
          const cie1Str = item && item.cie1Marks !== undefined && item.cie1Marks !== null && String(item.cie1Marks).trim() !== '' ? String(item.cie1Marks) : '';
          const cie2Str = item && item.cie2Marks !== undefined && item.cie2Marks !== null && String(item.cie2Marks).trim() !== '' ? String(item.cie2Marks) : '';
          const modelStr = item && item.modelMarks !== undefined && item.modelMarks !== null && String(item.modelMarks).trim() !== '' ? String(item.modelMarks) : '';

          let vals: string[] = [];
          if (isModel) {
            vals = [
              item.sem || student.currentSemester || 'VI',
              item.code || '',
              item.title || '',
              cie1Str,
              cie2Str,
              modelStr,
              item.passFail || (cie1Str || cie2Str || modelStr ? 'PASS' : ''),
            ];
          } else if (isCie2) {
            vals = [
              item.sem || student.currentSemester || 'VI',
              item.code || '',
              item.title || '',
              cie1Str,
              cie2Str,
              item.passFail || (cie1Str || cie2Str ? 'PASS' : ''),
            ];
          } else {
            vals = [
              item.sem || student.currentSemester || 'VI',
              item.code || '',
              item.title || '',
              cie1Str,
              item.passFail || (cie1Str ? 'PASS' : ''),
            ];
          }
          updatedRows.push(updateRowCells(rows[r], vals));
        } else {
          const emptyColsCount = isModel ? 7 : isCie2 ? 6 : 5;
          updatedRows.push(updateRowCells(rows[r], Array(emptyColsCount).fill('')));
        }
      }
      return `<w:tbl>${tblPrXml}${tblGridXml}${updatedRows.join('')}</w:tbl>`;
    }

    return tblXml;
  });

  // 3. Pre-export XML DOM Validation Check
  if (typeof DOMParser !== 'undefined') {
    const parser = new DOMParser();
    const parsedDoc = parser.parseFromString(xml, 'text/xml');
    const errors = parsedDoc.getElementsByTagName('parsererror');
    if (errors && errors.length > 0) {
      const errDetail = errors[0].textContent || 'Malformed XML';
      console.error('=== DOCX XML VALIDATION ERROR ===', errDetail);
      throw new Error(`Generated DOCX document.xml is malformed: ${errDetail}`);
    }
  }

  // 4. Verify required Office Open XML ZIP structure
  const requiredParts = [
    '[Content_Types].xml',
    'word/document.xml',
    'word/_rels/document.xml.rels',
    '_rels/.rels',
    'word/styles.xml'
  ];
  for (const part of requiredParts) {
    if (!zip.file(part)) {
      throw new Error(`DOCX package is missing required part: ${part}`);
    }
  }

  zip.file('word/document.xml', xml);
  const docBytes = zip.generate({ type: 'uint8array' });

  if (!docBytes || docBytes.length === 0) {
    throw new Error('No data was bound to the template. Check placeholder mapping.');
  }

  return {
    docBytes,
    mappingLogs,
    studentData,
    mappedCount: mappedPlaceholders.length,
    unmappedCount: unmappedPlaceholders.length,
    mappedPlaceholders,
    unmappedPlaceholders,
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
