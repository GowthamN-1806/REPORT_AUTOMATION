import PizZip from 'pizzip';
import { StudentRecord, PlaceholderMappingLog, DocxPopulationResult } from '../types';

/**
 * Escapes XML special characters inside text cell values to prevent Word document XML corruption.
 */
function escapeXml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Safely updates or creates text content inside a Word XML table cell (<w:tc>).
 */
function setCellContent(cellXml: string, val: any): string {
  const str = escapeXml(String(val !== undefined && val !== null ? val : ''));

  if (/<w:t[\s\S]*?<\/w:t>/i.test(cellXml)) {
    let replaced = false;
    return cellXml.replace(/<w:t([\s\S]*?)>([\s\S]*?)<\/w:t>/gi, (match, attrs, innerText) => {
      if (!replaced) {
        replaced = true;
        return `<w:t${attrs}>${str}</w:t>`;
      } else {
        return `<w:t${attrs}></w:t>`;
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
 * and populates all placeholders & tables dynamically using Header-Based Dynamic Table Detection.
 */
export async function populateOfficialDocxTemplateWithLogs(
  templateFileName: string,
  student: StudentRecord,
  regulation: string = ''
): Promise<DocxPopulationResult> {
  if (!student) {
    throw new Error('No student data provided for DOCX template rendering.');
  }

  const parsedSubjects = student.universityResults || [];
  const gpa = student.gpaBySem || {};
  const arr = student.arrears || {};

  // Strict Unshifted Semester GPA Mapping (Semester 1->GPA01 .. Semester 7->GPA07)
  const gpa01 = gpa['01'] !== undefined && gpa['01'] !== null ? String(gpa['01']) : (gpa['1'] !== undefined && gpa['1'] !== null ? String(gpa['1']) : '');
  const gpa02 = gpa['02'] !== undefined && gpa['02'] !== null ? String(gpa['02']) : (gpa['2'] !== undefined && gpa['2'] !== null ? String(gpa['2']) : '');
  const gpa03 = gpa['03'] !== undefined && gpa['03'] !== null ? String(gpa['03']) : (gpa['3'] !== undefined && gpa['3'] !== null ? String(gpa['3']) : '');
  const gpa04 = gpa['04'] !== undefined && gpa['04'] !== null ? String(gpa['04']) : (gpa['4'] !== undefined && gpa['4'] !== null ? String(gpa['4']) : '');
  const gpa05 = gpa['05'] !== undefined && gpa['05'] !== null ? String(gpa['05']) : (gpa['5'] !== undefined && gpa['5'] !== null ? String(gpa['5']) : '');
  const gpa06 = gpa['06'] !== undefined && gpa['06'] !== null ? String(gpa['06']) : (gpa['6'] !== undefined && gpa['6'] !== null ? String(gpa['6']) : '');
  const gpa07 = gpa['07'] !== undefined && gpa['07'] !== null ? String(gpa['07']) : (gpa['7'] !== undefined && gpa['7'] !== null ? String(gpa['7']) : '');

  // Strict Semester-Wise Arrears Mapping from uploaded Excel (Semester 1->ARREARS01 .. Semester 7->ARREARS07)
  const arr01 = arr['01'] !== undefined && arr['01'] !== null ? String(arr['01']) : (arr['1'] !== undefined && arr['1'] !== null ? String(arr['1']) : '');
  const arr02 = arr['02'] !== undefined && arr['02'] !== null ? String(arr['02']) : (arr['2'] !== undefined && arr['2'] !== null ? String(arr['2']) : '');
  const arr03 = arr['03'] !== undefined && arr['03'] !== null ? String(arr['03']) : (arr['3'] !== undefined && arr['3'] !== null ? String(arr['3']) : '');
  const arr04 = arr['04'] !== undefined && arr['04'] !== null ? String(arr['04']) : (arr['4'] !== undefined && arr['4'] !== null ? String(arr['4']) : '');
  const arr05 = arr['05'] !== undefined && arr['05'] !== null ? String(arr['05']) : (arr['5'] !== undefined && arr['5'] !== null ? String(arr['5']) : '');
  const arr06 = arr['06'] !== undefined && arr['06'] !== null ? String(arr['06']) : (arr['6'] !== undefined && arr['6'] !== null ? String(arr['6']) : '');
  const arr07 = arr['07'] !== undefined && arr['07'] !== null ? String(arr['07']) : (arr['7'] !== undefined && arr['7'] !== null ? String(arr['7']) : '');

  // Exact Placeholder Object passed to render engine
  const placeholderObject = {
    REGISTER_NO: student.regNo || '',
    register_no: student.regNo || '',
    REGISTER_NUMBER: student.regNo || '',
    register_number: student.regNo || '',

    STUDENT_NAME: student.name || '',
    student_name: student.name || '',

    REGULATION: regulation || student.regulation || '',
    regulation: regulation || student.regulation || '',

    DEPARTMENT: student.department || '',
    department: student.department || '',

    SEMESTER: student.semester || '',
    semester: student.semester || '',

    EXAM_SESSION: '',
    exam_session: '',

    ACADEMIC_YEAR: '',
    academic_year: '',

    UNIVERSITY_SUBJECTS: parsedSubjects
      .filter((ur) => ur.code || ur.title || ur.grade)
      .map((ur) => ({
        SEM: ur.sem || student.semester || '',
        CODE: ur.code || '',
        TITLE: ur.title || '',
        GRADE: ur.grade || '',
        PASS_FAIL: ur.passFail || '',
        sem: ur.sem || student.semester || '',
        code: ur.code || '',
        title: ur.title || '',
        grade: ur.grade || '',
        passFail: ur.passFail || '',
      })),

    GPA01: gpa01,
    GPA02: gpa02,
    GPA03: gpa03,
    GPA04: gpa04,
    GPA05: gpa05,
    GPA06: gpa06,
    GPA07: gpa07,

    CGPA: student.cgpa !== undefined && student.cgpa !== null && String(student.cgpa).trim() !== '' ? String(student.cgpa) : '',

    ARREARS01: arr01,
    ARREARS02: arr02,
    ARREARS03: arr03,
    ARREARS04: arr04,
    ARREARS05: arr05,
    ARREARS06: arr06,
    ARREARS07: arr07,

    CLASS_OBTAINED: student.classObtained || '',
    CLASS: student.classObtained || '',
  };

  const cleanName = (templateFileName || 'template_cie1.docx')
    .replace(/^https?:\/\/[^\/]+/, '')
    .replace(/^\/?(backend\/templates\/|templates\/|public\/templates\/)?/, '');

  const loadedTemplatePath = `${typeof window !== 'undefined' ? window.location.origin : ''}/templates/${cleanName}`;

  const candidateUrls = [
    `/templates/${cleanName}`,
    `./templates/${cleanName}`,
    `templates/${cleanName}`,
    loadedTemplatePath,
  ];

  let arrayBuffer: ArrayBuffer | null = null;

  for (const candidateUrl of candidateUrls) {
    if (!candidateUrl) continue;
    try {
      const response = await fetch(candidateUrl);
      if (response.ok) {
        arrayBuffer = await response.arrayBuffer();
        break;
      }
    } catch (err) {
      // Continue to next candidate URL
    }
  }

  if (!arrayBuffer) {
    console.error(`ERROR: Failed to load template from URL: ${loadedTemplatePath}`);
    throw new Error(`Failed to fetch template "${cleanName}". Ensure file exists in public/templates/.`);
  }

  // 1. Verify DOCX Template Loaded Successfully
  const zip = new PizZip(arrayBuffer);
  let xml = zip.file('word/document.xml')?.asText() || '';
  console.log(`✔ DOCX Template Loaded Successfully: "${loadedTemplatePath}"`);

  // Scan all placeholder keys inside the DOCX template
  const placeholderRegex = /\{\{(?:<[^>]+>)*?([A-Za-z0-9_.\s#\/]+)(?:<[^>]+>)*?\}\}/g;
  let match;
  const foundPlaceholders = new Set<string>();

  while ((match = placeholderRegex.exec(xml)) !== null) {
    const phName = match[1].replace(/<[^>]+>/g, '').trim();
    if (phName) foundPlaceholders.add(phName);
  }

  const mappingLogs: PlaceholderMappingLog[] = [];
  const mappedPlaceholders: string[] = [];
  const unmappedPlaceholders: string[] = [];

  // Top-Level Placeholder Replacement
  xml = xml.replace(/\{\{REGISTER_NO\}\}/gi, placeholderObject.REGISTER_NO);
  xml = xml.replace(/\{\{STUDENT_NAME\}\}/gi, placeholderObject.STUDENT_NAME);
  xml = xml.replace(/\{\{register_number\}\}/gi, placeholderObject.REGISTER_NO);
  xml = xml.replace(/\{\{student_name\}\}/gi, placeholderObject.STUDENT_NAME);
  xml = xml.replace(/\{\{REGULATION\}\}/gi, placeholderObject.REGULATION);
  xml = xml.replace(/\{\{DEPARTMENT\}\}/gi, placeholderObject.DEPARTMENT);
  xml = xml.replace(/\{\{SEMESTER\}\}/gi, placeholderObject.SEMESTER);
  xml = xml.replace(/\{\{EXAM_SESSION\}\}/gi, placeholderObject.EXAM_SESSION);
  xml = xml.replace(/\{\{ACADEMIC_YEAR\}\}/gi, placeholderObject.ACADEMIC_YEAR);

  foundPlaceholders.forEach((ph) => {
    const upperPh = ph.toUpperCase().replace(/[\s_.-]+/g, '');
    let val = '';

    if (upperPh === 'REGISTERNO' || upperPh === 'REGISTERNUMBER' || upperPh === 'REG') val = placeholderObject.REGISTER_NO;
    else if (upperPh === 'STUDENTNAME' || upperPh === 'NAME') val = placeholderObject.STUDENT_NAME;
    else if (upperPh === 'REGULATION') val = placeholderObject.REGULATION;
    else if (upperPh === 'DEPARTMENT' || upperPh === 'DEPT') val = placeholderObject.DEPARTMENT;
    else if (upperPh === 'GPA01') val = placeholderObject.GPA01;
    else if (upperPh === 'GPA02') val = placeholderObject.GPA02;
    else if (upperPh === 'GPA03') val = placeholderObject.GPA03;
    else if (upperPh === 'GPA04') val = placeholderObject.GPA04;
    else if (upperPh === 'GPA05') val = placeholderObject.GPA05;
    else if (upperPh === 'GPA06') val = placeholderObject.GPA06;
    else if (upperPh === 'GPA07') val = placeholderObject.GPA07;
    else if (upperPh === 'CGPA') val = placeholderObject.CGPA;
    else if (upperPh === 'ARREARS01') val = placeholderObject.ARREARS01;
    else if (upperPh === 'ARREARS02') val = placeholderObject.ARREARS02;
    else if (upperPh === 'ARREARS03') val = placeholderObject.ARREARS03;
    else if (upperPh === 'ARREARS04') val = placeholderObject.ARREARS04;
    else if (upperPh === 'ARREARS05') val = placeholderObject.ARREARS05;
    else if (upperPh === 'ARREARS06') val = placeholderObject.ARREARS06;
    else if (upperPh === 'ARREARS07') val = placeholderObject.ARREARS07;
    else if (upperPh === 'CLASSOBTAINED' || upperPh === 'CLASS') val = placeholderObject.CLASS_OBTAINED;

    if (val) {
      mappedPlaceholders.push(`{{${ph}}}`);
      const replaceRegex = new RegExp(`\\{\\{${ph}\\}\\}`, 'gi');
      xml = xml.replace(replaceRegex, () => val);
    }
  });

  // 2. Extract LIVE tables directly from current xml after placeholder replacement!
  const liveTableMatches = xml.match(/<w:tbl[\s\S]*?<\/w:tbl>/gi) || [];
  console.log(`Table Count = ${liveTableMatches.length}`);

  // 3 & 4. Print Table[0], Table[1]... and First Row Text for EVERY table
  liveTableMatches.forEach((tblXml, idx) => {
    const rows = tblXml.match(/<w:tr[\s\S]*?<\/w:tr>/gi) || [];
    const firstRowText = (rows[0] || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    console.log(`Table[${idx}]`);
    console.log(`${firstRowText}`);
  });

  // 5. Locate tables dynamically by checking header text instead of hardcoded indexes
  let univTableIdx = -1;
  let gpaTableIdx = -1;
  let cieTableIdx = -1;

  liveTableMatches.forEach((tblXml, idx) => {
    const rows = tblXml.match(/<w:tr[\s\S]*?<\/w:tr>/gi) || [];
    const firstRowText = (rows[0] || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const fullTblLower = tblXml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();

    // University Table Header Matching: Grade or University Results
    if (univTableIdx === -1 && (/grade/i.test(fullTblLower) || /university/i.test(fullTblLower) || (/subject/i.test(fullTblLower) && /grade/i.test(fullTblLower)))) {
      if (!/cie/i.test(firstRowText.toLowerCase()) && !/internal/i.test(firstRowText.toLowerCase())) {
        univTableIdx = idx;
      }
    }

    // GPA Table Header Matching: GPA or CGPA or Arrears
    if (gpaTableIdx === -1 && (/gpa/i.test(fullTblLower) || /cgpa/i.test(fullTblLower) || /arrear/i.test(fullTblLower))) {
      gpaTableIdx = idx;
    }

    // CIE Table Header Matching: CIE or Internal or Model
    if (cieTableIdx === -1 && (/cie/i.test(fullTblLower) || /internal/i.test(fullTblLower) || /model/i.test(fullTblLower))) {
      if (idx !== univTableIdx) {
        cieTableIdx = idx;
      }
    }
  });

  // Fallbacks if header matching is partial
  if (univTableIdx === -1 && liveTableMatches.length >= 2) univTableIdx = 1;
  if (gpaTableIdx === -1 && liveTableMatches.length >= 3) gpaTableIdx = 2;
  if (cieTableIdx === -1 && liveTableMatches.length >= 4) cieTableIdx = 3;

  // 6. Print table index selected for University, GPA, CIE
  console.log(`University Table Index Selected: Table[${univTableIdx}]`);
  console.log(`GPA Table Index Selected: Table[${gpaTableIdx}]`);
  console.log(`CIE Table Index Selected: Table[${cieTableIdx}]`);

  // 7. Print University Subjects Count and Details Before Writing
  console.log(`University Subjects Count = ${placeholderObject.UNIVERSITY_SUBJECTS.length}`);
  placeholderObject.UNIVERSITY_SUBJECTS.forEach((sub, idx) => {
    console.log(`Subject [${idx + 1}] SEM="${sub.SEM}" CODE="${sub.CODE}" TITLE="${sub.TITLE}" GRADE="${sub.GRADE}" PASS_FAIL="${sub.PASS_FAIL}"`);
  });

  // 8 & 9. Populate University Table dynamically into LIVE XML and print generated XML
  if (univTableIdx !== -1 && liveTableMatches[univTableIdx]) {
    const targetTableXml = liveTableMatches[univTableIdx];
    let rowsUniv = targetTableXml.match(/<w:tr[\s\S]*?<\/w:tr>/gi) || [];
    const univList = placeholderObject.UNIVERSITY_SUBJECTS;

    if (rowsUniv.length >= 2 && univList.length > 0) {
      const headerRowXml = rowsUniv[0];
      const templateRowXml = rowsUniv[1];

      const newRowsXml = univList.map((item) => {
        const vals = [
          item.SEM || '',
          item.CODE || '',
          item.TITLE || '',
          item.GRADE || '',
          item.PASS_FAIL || '',
        ];
        return updateRowCells(templateRowXml, vals);
      });

      const tableInnerContent = [headerRowXml, ...newRowsXml].join('');
      const newTblUnivXml = targetTableXml.replace(/(<w:tbl[\s\S]*?>)[\s\S]*?(<\/w:tbl>)/i, `$1${tableInnerContent}$2`);
      
      // Function-based replacement prevents JavaScript $1..$9 pattern corruption
      xml = xml.replace(targetTableXml, () => newTblUnivXml);
      console.log('✔ University table populated');
      console.log('Generated University Table XML:');
      console.log(newTblUnivXml);
    }
  }

  // Populate GPA Table dynamically into LIVE XML
  if (gpaTableIdx !== -1 && liveTableMatches[gpaTableIdx]) {
    const targetTableXml = liveTableMatches[gpaTableIdx];
    let rowsGpa = targetTableXml.match(/<w:tr[\s\S]*?<\/w:tr>/gi) || [];

    let newRowsGpa = rowsGpa.map((rXml) => {
      let updatedR = rXml;
      const rowTextUpper = rXml.replace(/<[^>]+>/g, '').toUpperCase().trim();

      if (/GPA/i.test(rowTextUpper) && !/CGPA/i.test(rowTextUpper)) {
        const gpaVals = [
          placeholderObject.GPA01, placeholderObject.GPA02, placeholderObject.GPA03,
          placeholderObject.GPA04, placeholderObject.GPA05, placeholderObject.GPA06, placeholderObject.GPA07,
        ];
        let cIdx = 0;
        updatedR = updatedR.replace(/<w:tc[\s\S]*?<\/w:tc>/gi, (cellXml) => {
          if (cIdx >= 1 && cIdx <= 7) {
            const v = gpaVals[cIdx - 1] || '';
            cIdx++;
            return setCellContent(cellXml, v);
          }
          cIdx++;
          return cellXml;
        });
      } else if (/ARREAR/i.test(rowTextUpper)) {
        const arrVals = [
          placeholderObject.ARREARS01, placeholderObject.ARREARS02, placeholderObject.ARREARS03,
          placeholderObject.ARREARS04, placeholderObject.ARREARS05, placeholderObject.ARREARS06, placeholderObject.ARREARS07,
        ];
        let cIdx = 0;
        updatedR = updatedR.replace(/<w:tc[\s\S]*?<\/w:tc>/gi, (cellXml) => {
          if (cIdx >= 1 && cIdx <= 7) {
            const v = arrVals[cIdx - 1] || '';
            cIdx++;
            return setCellContent(cellXml, v);
          }
          cIdx++;
          return cellXml;
        });
      } else if (/CGPA/i.test(rowTextUpper)) {
        let cIdx = 0;
        updatedR = updatedR.replace(/<w:tc[\s\S]*?<\/w:tc>/gi, (cellXml) => {
          if (cIdx === 1) {
            cIdx++;
            return setCellContent(cellXml, placeholderObject.CGPA);
          }
          cIdx++;
          return cellXml;
        });
      } else if (/CLASS/i.test(rowTextUpper)) {
        let cIdx = 0;
        updatedR = updatedR.replace(/<w:tc[\s\S]*?<\/w:tc>/gi, (cellXml) => {
          if (cIdx === 1) {
            cIdx++;
            return setCellContent(cellXml, placeholderObject.CLASS_OBTAINED);
          }
          cIdx++;
          return cellXml;
        });
      }
      return updatedR;
    });

    const newTblGpaXml = targetTableXml.replace(/(<w:tbl[\s\S]*?>)[\s\S]*?(<\/w:tbl>)/i, `$1${newRowsGpa.join('')}$2`);
    xml = xml.replace(targetTableXml, () => newTblGpaXml);
    console.log('✔ GPA table populated');
  }

  // Populate CIE Table (only if CIE exists)
  if (cieTableIdx !== -1 && liveTableMatches[cieTableIdx]) {
    const targetTableXml = liveTableMatches[cieTableIdx];
    let rowsCie = targetTableXml.match(/<w:tr[\s\S]*?<\/w:tr>/gi) || [];
    const internalList = student.internalEvalResults || [];
    const isModel = cleanName.includes('model');
    const isCie2 = cleanName.includes('cie1_cie2');

    if (rowsCie.length >= 3 && internalList.length > 0) {
      const headerRow1 = rowsCie[0];
      const headerRow2 = rowsCie[1];
      const templateRowXml = rowsCie[2];

      const newRowsXml = internalList.map((item) => {
        let vals: string[] = [];
        if (isModel) {
          vals = [
            item.sem || '', item.code || '', item.title || '',
            item.cie1Marks !== undefined && item.cie1Marks !== null ? String(item.cie1Marks) : '',
            item.cie1Marks !== undefined && item.cie1Marks !== null && String(item.cie1Marks).trim() !== '' ? (Number(item.cie1Marks) >= 50 ? 'PASS' : (isNaN(Number(item.cie1Marks)) ? '' : 'FAIL')) : '',
            item.cie2Marks !== undefined && item.cie2Marks !== null ? String(item.cie2Marks) : '',
            item.cie2Marks !== undefined && item.cie2Marks !== null && String(item.cie2Marks).trim() !== '' ? (Number(item.cie2Marks) >= 50 ? 'PASS' : (isNaN(Number(item.cie2Marks)) ? '' : 'FAIL')) : '',
            item.modelMarks !== undefined && item.modelMarks !== null ? String(item.modelMarks) : '',
            item.modelMarks !== undefined && item.modelMarks !== null && String(item.modelMarks).trim() !== '' ? (Number(item.modelMarks) >= 50 ? 'PASS' : (isNaN(Number(item.modelMarks)) ? '' : 'FAIL')) : '',
          ];
        } else if (isCie2) {
          vals = [
            item.sem || '', item.code || '', item.title || '',
            item.cie1Marks !== undefined && item.cie1Marks !== null ? String(item.cie1Marks) : '',
            item.cie1Marks !== undefined && item.cie1Marks !== null && String(item.cie1Marks).trim() !== '' ? (Number(item.cie1Marks) >= 50 ? 'PASS' : (isNaN(Number(item.cie1Marks)) ? '' : 'FAIL')) : '',
            item.cie2Marks !== undefined && item.cie2Marks !== null ? String(item.cie2Marks) : '',
            item.cie2Marks !== undefined && item.cie2Marks !== null && String(item.cie2Marks).trim() !== '' ? (Number(item.cie2Marks) >= 50 ? 'PASS' : (isNaN(Number(item.cie2Marks)) ? '' : 'FAIL')) : '',
          ];
        } else {
          vals = [
            item.sem || '', item.code || '', item.title || '',
            item.cie1Marks !== undefined && item.cie1Marks !== null ? String(item.cie1Marks) : '',
            item.cie1Marks !== undefined && item.cie1Marks !== null && String(item.cie1Marks).trim() !== '' ? (Number(item.cie1Marks) >= 50 ? 'PASS' : (isNaN(Number(item.cie1Marks)) ? '' : 'FAIL')) : '',
          ];
        }
        return updateRowCells(templateRowXml, vals);
      });

      const table4InnerContent = [headerRow1, headerRow2, ...newRowsXml].join('');
      const newTblCieXml = targetTableXml.replace(/(<w:tbl[\s\S]*?>)[\s\S]*?(<\/w:tbl>)/i, `$1${table4InnerContent}$2`);
      xml = xml.replace(targetTableXml, () => newTblCieXml);
      console.log('✔ CIE table populated');
    } else if (internalList.length === 0) {
      // Leave CIE table blank when no CIE Excel uploaded
      const headerRowsXml = rowsCie.slice(0, Math.min(2, rowsCie.length)).join('');
      const newTblCieXml = targetTableXml.replace(/(<w:tbl[\s\S]*?>)[\s\S]*?(<\/w:tbl>)/i, `$1${headerRowsXml}$2`);
      xml = xml.replace(targetTableXml, () => newTblCieXml);
    }
  }

  // Save rendered placeholder JSON to window.__LAST_DEBUG_JSON__
  try {
    if (typeof window !== 'undefined') {
      (window as any).__LAST_DEBUG_JSON__ = placeholderObject;
    }
  } catch (err) {
    console.error('Failed to attach debug.json:', err);
  }

  zip.file('word/document.xml', xml);
  const docBytes = zip.generate({ type: 'uint8array' });

  if (!docBytes || docBytes.length === 0) {
    throw new Error('No data was bound to the template. Check placeholder mapping.');
  }

  return {
    docBytes,
    mappingLogs,
    studentData: placeholderObject as any,
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
  regulation: string = ''
): Promise<DocxPopulationResult> {
  return populateOfficialDocxTemplateWithLogs(templateFileName, student, regulation);
}
