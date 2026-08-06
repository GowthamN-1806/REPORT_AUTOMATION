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
 * and populates all placeholders & tables dynamically for a single student.
 */
export async function populateOfficialDocxTemplateWithLogs(
  templateFileName: string,
  student: StudentRecord,
  regulation: string = '2021'
): Promise<DocxPopulationResult> {
  if (!student) {
    throw new Error('No student data provided for DOCX template rendering.');
  }

  const parsedSubjects = student.universityResults || [];
  const gpa = student.gpaBySem || {};
  const arr = student.arrears || {};

  // STEP 8 — GPA Mapping: Semester 1->GPA01 .. Semester 7->GPA07 strictly without shifting or forced fallbacks
  const gpa01 = gpa['01'] || gpa['1'] || '';
  const gpa02 = gpa['02'] || gpa['2'] || '';
  const gpa03 = gpa['03'] || gpa['3'] || '';
  const gpa04 = gpa['04'] || gpa['4'] || '';
  const gpa05 = gpa['05'] || gpa['5'] || '';
  const gpa06 = gpa['06'] || gpa['6'] || '';
  const gpa07 = gpa['07'] || gpa['7'] || '';

  // STEP 9 — Arrears Mapping: Semester 1->ARREARS01 .. Semester 7->ARREARS07 strictly without default values
  const arr01 = arr['01'] !== undefined && arr['01'] !== null ? String(arr['01']) : (arr['1'] !== undefined ? String(arr['1']) : '');
  const arr02 = arr['02'] !== undefined && arr['02'] !== null ? String(arr['02']) : (arr['2'] !== undefined ? String(arr['2']) : '');
  const arr03 = arr['03'] !== undefined && arr['03'] !== null ? String(arr['03']) : (arr['3'] !== undefined ? String(arr['3']) : '');
  const arr04 = arr['04'] !== undefined && arr['04'] !== null ? String(arr['04']) : (arr['4'] !== undefined ? String(arr['4']) : '');
  const arr05 = arr['05'] !== undefined && arr['05'] !== null ? String(arr['05']) : (arr['5'] !== undefined ? String(arr['5']) : '');
  const arr06 = arr['06'] !== undefined && arr['06'] !== null ? String(arr['06']) : (arr['6'] !== undefined ? String(arr['6']) : '');
  const arr07 = arr['07'] !== undefined && arr['07'] !== null ? String(arr['07']) : (arr['7'] !== undefined ? String(arr['7']) : '');

  // STEP 5 — Build Placeholder Object for Docxtemplater & XML table rendering
  const placeholderObject = {
    REGISTER_NO: student.regNo || '',
    STUDENT_NAME: student.name || '',
    REGULATION: regulation || student.regulation || '2021',
    DEPARTMENT: student.department || 'Computer Science and Engineering',
    SEMESTER: student.semester || 'VI',
    EXAM_SESSION: 'Nov/Dec 2025',
    ACADEMIC_YEAR: '2025 - 2026',

    UNIVERSITY_SUBJECTS: parsedSubjects.map((ur) => ({
      SEM: ur.sem || student.semester || 'VI',
      CODE: ur.code || '',
      TITLE: ur.title || '',
      GRADE: ur.grade || '',
      PASS_FAIL: ur.passFail || '',
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
  };

  // STEP 10 — Debug Before Rendering
  console.log('=================== STEP 10 DEBUG BEFORE RENDERING ===================');
  console.log(`Register Number: ${placeholderObject.REGISTER_NO}`);
  console.log(`Student Name: ${placeholderObject.STUDENT_NAME}`);
  console.log(`Department: ${placeholderObject.DEPARTMENT}`);
  console.log(`Semester: ${placeholderObject.SEMESTER}`);
  console.log(`Total University Subjects: ${placeholderObject.UNIVERSITY_SUBJECTS.length}`);
  placeholderObject.UNIVERSITY_SUBJECTS.forEach((sub, i) => {
    console.log(`  [Sub ${i + 1}] Code: ${sub.CODE}, Title: "${sub.TITLE}", Grade: ${sub.GRADE}, Pass/Fail: ${sub.PASS_FAIL}`);
  });
  console.log(`GPA01: ${placeholderObject.GPA01}`);
  console.log(`GPA02: ${placeholderObject.GPA02}`);
  console.log(`GPA03: ${placeholderObject.GPA03}`);
  console.log(`GPA04: ${placeholderObject.GPA04}`);
  console.log(`GPA05: ${placeholderObject.GPA05}`);
  console.log(`GPA06: ${placeholderObject.GPA06}`);
  console.log(`GPA07: ${placeholderObject.GPA07}`);
  console.log(`CGPA: ${placeholderObject.CGPA}`);
  console.log(`Arrears01: ${placeholderObject.ARREARS01}`);
  console.log(`Arrears02: ${placeholderObject.ARREARS02}`);
  console.log(`Arrears03: ${placeholderObject.ARREARS03}`);
  console.log(`Arrears04: ${placeholderObject.ARREARS04}`);
  console.log(`Arrears05: ${placeholderObject.ARREARS05}`);
  console.log(`Arrears06: ${placeholderObject.ARREARS06}`);
  console.log(`Arrears07: ${placeholderObject.ARREARS07}`);
  console.log(`Class Obtained: ${placeholderObject.CLASS_OBTAINED}`);
  console.log('Complete Placeholder JSON:');
  console.log(JSON.stringify(placeholderObject, null, 2));
  console.log('=====================================================================');

  const cleanName = (templateFileName || 'template_cie1.docx')
    .replace(/^https?:\/\/[^\/]+/, '')
    .replace(/^\/?(backend\/templates\/|templates\/|public\/templates\/)?/, '');

  const candidateUrls = [
    `/templates/${cleanName}`,
    `./templates/${cleanName}`,
    `templates/${cleanName}`,
    `${typeof window !== 'undefined' ? window.location.origin : ''}/templates/${cleanName}`,
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
    throw new Error(`Failed to fetch template "${cleanName}". Ensure template_cie1.docx exists in public/templates/.`);
  }

  const zip = new PizZip(arrayBuffer);
  let xml = zip.file('word/document.xml')?.asText() || '';

  const mappingLogs: PlaceholderMappingLog[] = [];
  const mappedPlaceholders: string[] = [];
  const unmappedPlaceholders: string[] = [];

  // STEP 6 — Map Top Level DOCX Placeholders
  xml = xml.replace(/\{\{REGISTER_NO\}\}/gi, placeholderObject.REGISTER_NO);
  xml = xml.replace(/\{\{STUDENT_NAME\}\}/gi, placeholderObject.STUDENT_NAME);
  xml = xml.replace(/\{\{register_number\}\}/gi, placeholderObject.REGISTER_NO);
  xml = xml.replace(/\{\{student_name\}\}/gi, placeholderObject.STUDENT_NAME);
  xml = xml.replace(/\{\{REGULATION\}\}/gi, placeholderObject.REGULATION);
  xml = xml.replace(/\{\{DEPARTMENT\}\}/gi, placeholderObject.DEPARTMENT);
  xml = xml.replace(/\{\{SEMESTER\}\}/gi, placeholderObject.SEMESTER);
  xml = xml.replace(/\{\{EXAM_SESSION\}\}/gi, placeholderObject.EXAM_SESSION);
  xml = xml.replace(/\{\{ACADEMIC_YEAR\}\}/gi, placeholderObject.ACADEMIC_YEAR);

  // Dynamic Placeholder Replacement Fallback
  const placeholderRegex = /\{\{(?:<[^>]+>)*?([A-Za-z0-9_.\s-]+)(?:<[^>]+>)*?\}\}/g;
  let match;
  const scannedPlaceholders = new Set<string>();

  while ((match = placeholderRegex.exec(xml)) !== null) {
    const phName = match[1].replace(/<[^>]+>/g, '').trim();
    if (phName) scannedPlaceholders.add(phName);
  }

  scannedPlaceholders.forEach((ph) => {
    const upperPh = ph.toUpperCase().replace(/[\s_.-]+/g, '');
    let val = '';

    if (upperPh === 'REGISTERNO' || upperPh === 'REGISTERNUMBER' || upperPh === 'REG') {
      val = placeholderObject.REGISTER_NO;
    } else if (upperPh === 'STUDENTNAME' || upperPh === 'NAME') {
      val = placeholderObject.STUDENT_NAME;
    } else if (upperPh === 'REGULATION') {
      val = placeholderObject.REGULATION;
    } else if (upperPh === 'DEPARTMENT' || upperPh === 'DEPT') {
      val = placeholderObject.DEPARTMENT;
    } else if (upperPh === 'GPA01') val = placeholderObject.GPA01;
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
      xml = xml.replace(replaceRegex, val);
    }
  });

  // STEP 7 — University Subjects Table & Internal Marks Table Rendering
  const tableMatches = xml.match(/<w:tbl[\s\S]*?<\/w:tbl>/gi) || [];

  if (tableMatches.length >= 4) {
    // TABLE 2: University Results Table (Renders 10 rows if 10 subjects, 7 rows if 7 subjects)
    let tbl2 = tableMatches[1];
    let rows2 = tbl2.match(/<w:tr[\s\S]*?<\/w:tr>/gi) || [];
    const univList = placeholderObject.UNIVERSITY_SUBJECTS;

    if (rows2.length >= 2) {
      const headerRowXml = rows2[0];
      const templateRowXml = rows2[1]; // Template data row

      const newRowsXml = univList.map((item) => {
        const vals = [
          item.SEM || 'VI',
          item.CODE || '',
          item.TITLE || '',
          item.GRADE || '',
          item.PASS_FAIL || '',
        ];
        return updateRowCells(templateRowXml, vals);
      });

      // Construct new table XML containing header row + all N cloned data rows
      const tableInnerContent = [headerRowXml, ...newRowsXml].join('');
      const newTbl2Xml = tbl2.replace(/(<w:tbl[\s\S]*?>)[\s\S]*?(<\/w:tbl>)/i, `$1${tableInnerContent}$2`);
      xml = xml.replace(tableMatches[1], newTbl2Xml);
    }

    // TABLE 3: GPA & CGPA Summary Table
    let tbl3 = tableMatches[2];
    let rows3 = tbl3.match(/<w:tr[\s\S]*?<\/w:tr>/gi) || [];

    rows3.forEach((rXml, rIdx) => {
      let updatedR = rXml;

      updatedR = updatedR.replace(/\{\{GPA01\}\}/gi, placeholderObject.GPA01);
      updatedR = updatedR.replace(/\{\{GPA02\}\}/gi, placeholderObject.GPA02);
      updatedR = updatedR.replace(/\{\{GPA03\}\}/gi, placeholderObject.GPA03);
      updatedR = updatedR.replace(/\{\{GPA04\}\}/gi, placeholderObject.GPA04);
      updatedR = updatedR.replace(/\{\{GPA05\}\}/gi, placeholderObject.GPA05);
      updatedR = updatedR.replace(/\{\{GPA06\}\}/gi, placeholderObject.GPA06);
      updatedR = updatedR.replace(/\{\{GPA07\}\}/gi, placeholderObject.GPA07);
      updatedR = updatedR.replace(/\{\{CGPA\}\}/gi, placeholderObject.CGPA);
      updatedR = updatedR.replace(/\{\{ARREARS01\}\}/gi, placeholderObject.ARREARS01);
      updatedR = updatedR.replace(/\{\{ARREARS02\}\}/gi, placeholderObject.ARREARS02);
      updatedR = updatedR.replace(/\{\{ARREARS03\}\}/gi, placeholderObject.ARREARS03);
      updatedR = updatedR.replace(/\{\{ARREARS04\}\}/gi, placeholderObject.ARREARS04);
      updatedR = updatedR.replace(/\{\{ARREARS05\}\}/gi, placeholderObject.ARREARS05);
      updatedR = updatedR.replace(/\{\{ARREARS06\}\}/gi, placeholderObject.ARREARS06);
      updatedR = updatedR.replace(/\{\{ARREARS07\}\}/gi, placeholderObject.ARREARS07);
      updatedR = updatedR.replace(/\{\{CLASS_OBTAINED\}\}/gi, placeholderObject.CLASS_OBTAINED);

      if (rIdx === 1) { // GPA Row
        const gpaVals = [
          placeholderObject.GPA01,
          placeholderObject.GPA02,
          placeholderObject.GPA03,
          placeholderObject.GPA04,
          placeholderObject.GPA05,
          placeholderObject.GPA06,
          placeholderObject.GPA07,
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
      } else if (rIdx === 2) { // Arrears Row
        const arrVals = [
          placeholderObject.ARREARS01,
          placeholderObject.ARREARS02,
          placeholderObject.ARREARS03,
          placeholderObject.ARREARS04,
          placeholderObject.ARREARS05,
          placeholderObject.ARREARS06,
          placeholderObject.ARREARS07,
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
      } else if (rIdx === 3) { // CGPA Row
        let cIdx = 0;
        updatedR = updatedR.replace(/<w:tc[\s\S]*?<\/w:tc>/gi, (cellXml) => {
          if (cIdx === 1) {
            cIdx++;
            return setCellContent(cellXml, placeholderObject.CGPA);
          }
          cIdx++;
          return cellXml;
        });
      } else if (rIdx === 4) { // Class Obtained Row
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

      tbl3 = tbl3.replace(rXml, updatedR);
    });
    xml = xml.replace(tableMatches[2], tbl3);

    // TABLE 4: Internal Evaluation Marks Table
    let tbl4 = tableMatches[3];
    let rows4 = tbl4.match(/<w:tr[\s\S]*?<\/w:tr>/gi) || [];
    const internalList = student.internalEvalResults || [];
    const isModel = cleanName.includes('model');
    const isCie2 = cleanName.includes('cie1_cie2');

    if (rows4.length >= 3 && internalList.length > 0) {
      const headerRow1 = rows4[0];
      const headerRow2 = rows4[1];
      const templateRowXml = rows4[2];

      const newRowsXml = internalList.map((item) => {
        let vals: string[] = [];
        if (isModel) {
          vals = [
            item.sem || 'VI',
            item.code || '',
            item.title || '',
            item.cie1Marks !== undefined && item.cie1Marks !== null ? String(item.cie1Marks) : '',
            item.cie1Marks !== undefined && item.cie1Marks !== null && String(item.cie1Marks).trim() !== '' ? (Number(item.cie1Marks) >= 50 ? 'PASS' : (isNaN(Number(item.cie1Marks)) ? '' : 'FAIL')) : '',
            item.cie2Marks !== undefined && item.cie2Marks !== null ? String(item.cie2Marks) : '',
            item.cie2Marks !== undefined && item.cie2Marks !== null && String(item.cie2Marks).trim() !== '' ? (Number(item.cie2Marks) >= 50 ? 'PASS' : (isNaN(Number(item.cie2Marks)) ? '' : 'FAIL')) : '',
            item.modelMarks !== undefined && item.modelMarks !== null ? String(item.modelMarks) : '',
            item.modelMarks !== undefined && item.modelMarks !== null && String(item.modelMarks).trim() !== '' ? (Number(item.modelMarks) >= 50 ? 'PASS' : (isNaN(Number(item.modelMarks)) ? '' : 'FAIL')) : '',
          ];
        } else if (isCie2) {
          vals = [
            item.sem || 'VI',
            item.code || '',
            item.title || '',
            item.cie1Marks !== undefined && item.cie1Marks !== null ? String(item.cie1Marks) : '',
            item.cie1Marks !== undefined && item.cie1Marks !== null && String(item.cie1Marks).trim() !== '' ? (Number(item.cie1Marks) >= 50 ? 'PASS' : (isNaN(Number(item.cie1Marks)) ? '' : 'FAIL')) : '',
            item.cie2Marks !== undefined && item.cie2Marks !== null ? String(item.cie2Marks) : '',
            item.cie2Marks !== undefined && item.cie2Marks !== null && String(item.cie2Marks).trim() !== '' ? (Number(item.cie2Marks) >= 50 ? 'PASS' : (isNaN(Number(item.cie2Marks)) ? '' : 'FAIL')) : '',
          ];
        } else {
          vals = [
            item.sem || 'VI',
            item.code || '',
            item.title || '',
            item.cie1Marks !== undefined && item.cie1Marks !== null ? String(item.cie1Marks) : '',
            item.cie1Marks !== undefined && item.cie1Marks !== null && String(item.cie1Marks).trim() !== '' ? (Number(item.cie1Marks) >= 50 ? 'PASS' : (isNaN(Number(item.cie1Marks)) ? '' : 'FAIL')) : '',
          ];
        }
        return updateRowCells(templateRowXml, vals);
      });

      const table4InnerContent = [headerRow1, headerRow2, ...newRowsXml].join('');
      const newTbl4Xml = tbl4.replace(/(<w:tbl[\s\S]*?>)[\s\S]*?(<\/w:tbl>)/i, `$1${table4InnerContent}$2`);
      xml = xml.replace(tableMatches[3], newTbl4Xml);
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
  regulation: string = '2021'
): Promise<DocxPopulationResult> {
  return populateOfficialDocxTemplateWithLogs(templateFileName, student, regulation);
}
