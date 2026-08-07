import { StudentRecord } from '../types';
import { populateOfficialDocxTemplateWithLogs } from './officialDocxProcessor';

/**
 * Downloads a single student's filled official DOCX report.
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
 * Generates official Word (.doc / .docx) reports for all merged students into ONE single combined document
 * with page breaks separating each student's report so user can scroll continuously without any XML errors.
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

  let reportsHtml = '';

  students.forEach((student) => {
    const univRows = (student.universityResults || []).map((u) => `
      <tr>
        <td style="text-align:center; padding: 4px; border: 1px solid #000;">${u.sem || 'V'}</td>
        <td style="text-align:center; font-weight:bold; padding: 4px; border: 1px solid #000;">${u.code || ''}</td>
        <td style="text-align:left; padding: 4px; border: 1px solid #000;">${u.title || ''}</td>
        <td style="text-align:center; font-weight:bold; padding: 4px; border: 1px solid #000;">${u.grade || ''}</td>
        <td style="text-align:center; font-weight:bold; padding: 4px; border: 1px solid #000;">${u.passFail || ''}</td>
      </tr>
    `).join('');

    const hasCie2 = (student.internalEvalResults || []).some((item) => item && item.cie2Marks !== undefined && item.cie2Marks !== null && String(item.cie2Marks).trim() !== '');
    const hasModel = (student.internalEvalResults || []).some((item) => item && item.modelMarks !== undefined && item.modelMarks !== null && String(item.modelMarks).trim() !== '');

    const cieHeaderHtml = hasModel
      ? `
        <th style="border: 1px solid #000; padding: 5px; width: 10%;">Semester</th>
        <th style="border: 1px solid #000; padding: 5px; width: 14%;">Subject Code</th>
        <th style="border: 1px solid #000; padding: 5px; width: 34%; text-align: left;">Subject Name</th>
        <th style="border: 1px solid #000; padding: 5px; width: 11%;">CIE I Marks</th>
        <th style="border: 1px solid #000; padding: 5px; width: 11%;">CIE II Marks</th>
        <th style="border: 1px solid #000; padding: 5px; width: 11%;">Model Marks</th>
        <th style="border: 1px solid #000; padding: 5px; width: 9%;">Pass/Fail</th>
      `
      : hasCie2
      ? `
        <th style="border: 1px solid #000; padding: 5px; width: 12%;">Semester</th>
        <th style="border: 1px solid #000; padding: 5px; width: 16%;">Subject Code</th>
        <th style="border: 1px solid #000; padding: 5px; width: 40%; text-align: left;">Subject Name</th>
        <th style="border: 1px solid #000; padding: 5px; width: 11%;">CIE I Marks</th>
        <th style="border: 1px solid #000; padding: 5px; width: 11%;">CIE II Marks</th>
        <th style="border: 1px solid #000; padding: 5px; width: 10%;">Pass/Fail</th>
      `
      : `
        <th style="border: 1px solid #000; padding: 5px; width: 12%;">Semester</th>
        <th style="border: 1px solid #000; padding: 5px; width: 16%;">Subject Code</th>
        <th style="border: 1px solid #000; padding: 5px; width: 46%; text-align: left;">Subject Name</th>
        <th style="border: 1px solid #000; padding: 5px; width: 14%;">CIE I Marks</th>
        <th style="border: 1px solid #000; padding: 5px; width: 12%;">Pass/Fail</th>
      `;

    const cieRows = (student.internalEvalResults || []).map((c) => {
      let markCells = `<td style="text-align:center; font-weight:bold; padding: 4px; border: 1px solid #000;">${c.cie1Marks !== undefined && c.cie1Marks !== null ? c.cie1Marks : ''}</td>`;
      
      if (hasCie2 || hasModel) {
        markCells += `<td style="text-align:center; font-weight:bold; padding: 4px; border: 1px solid #000;">${c.cie2Marks !== undefined && c.cie2Marks !== null ? c.cie2Marks : ''}</td>`;
      }
      
      if (hasModel) {
        markCells += `<td style="text-align:center; font-weight:bold; padding: 4px; border: 1px solid #000;">${c.modelMarks !== undefined && c.modelMarks !== null ? c.modelMarks : ''}</td>`;
      }

      return `
        <tr>
          <td style="text-align:center; padding: 4px; border: 1px solid #000;">${c.sem || 'VI'}</td>
          <td style="text-align:center; font-weight:bold; padding: 4px; border: 1px solid #000;">${c.code || ''}</td>
          <td style="text-align:left; padding: 4px; border: 1px solid #000;">${c.title || ''}</td>
          ${markCells}
          <td style="text-align:center; font-weight:bold; padding: 4px; border: 1px solid #000;">${c.passFail || ''}</td>
        </tr>
      `;
    }).join('');

    const arrearsRow = [1, 2, 3, 4, 5, 6, 7].map(sem => {
      const val = student.arrears ? (student.arrears[`0${sem}`] || student.arrears[`${sem}`] || '') : '';
      return `<td style="text-align:center; padding: 4px; border: 1px solid #000;">${val}</td>`;
    }).join('');

    const gpaRow = [1, 2, 3, 4, 5, 6, 7].map(sem => {
      const val = student.gpaBySem ? (student.gpaBySem[`0${sem}`] || student.gpaBySem[`${sem}`] || (sem === 5 && student.gpa ? student.gpa : '')) : '';
      return `<td style="text-align:center; padding: 4px; border: 1px solid #000;">${val}</td>`;
    }).join('');

    const cgpaRow = [1, 2, 3, 4, 5, 6, 7].map(sem => {
      const val = student.cgpaBySem ? (student.cgpaBySem[`0${sem}`] || student.cgpaBySem[`${sem}`] || (sem === 5 && student.cgpa ? student.cgpa : '')) : '';
      return `<td style="text-align:center; padding: 4px; border: 1px solid #000;">${val}</td>`;
    }).join('');

    reportsHtml += `
      <div style="page-break-after: always; padding: 15px; font-family: 'Times New Roman', Times, serif;">
        <div style="text-align: center; margin-bottom: 12px;">
          <h2 style="color: #0284c7; margin: 0; font-size: 16px; font-weight: bold;">JEPPIAAR INSTITUTE OF TECHNOLOGY</h2>
          <p style="color: #0369a1; font-style: italic; font-weight: bold; margin: 2px 0; font-size: 11px;">"Self Belief, Self Discipline, Self Respect"</p>
          <p style="color: #dc2626; font-weight: bold; margin: 2px 0; font-size: 10px;">( AN AUTONOMOUS INSTITUTION )</p>
        </div>

        <p style="margin: 4px 0; font-size: 12px;">Greetings from Jeppiaar Institute of Technology,</p>
        <p style="margin: 4px 0; font-size: 12px;">This is to inform you that the results of the Semester End Examination held during <b>Nov/Dec 2025</b> have been released.</p>
        <p style="text-align: right; font-weight: bold; margin: 4px 0; font-size: 12px;">Regulation: ${regulation || '2021'}</p>

        <!-- Student Details -->
        <table style="width: 100%; border-collapse: collapse; margin-top: 8px; margin-bottom: 12px;">
          <tr>
            <td style="width: 30%; border: 1px solid #000; padding: 5px; font-weight: normal; font-size: 12px;">Register number:</td>
            <td style="width: 70%; border: 1px solid #000; padding: 5px; font-weight: bold; font-size: 12px;">${student.regNo || ''}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #000; padding: 5px; font-weight: normal; font-size: 12px;">Name of the Student:</td>
            <td style="border: 1px solid #000; padding: 5px; font-weight: bold; font-size: 12px;">${student.name || ''}</td>
          </tr>
        </table>

        <!-- University Results -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 11px;">
          <thead>
            <tr style="background-color: #f8fafc;">
              <th style="border: 1px solid #000; padding: 5px; width: 12%;">Semester</th>
              <th style="border: 1px solid #000; padding: 5px; width: 16%;">Subject Code</th>
              <th style="border: 1px solid #000; padding: 5px; width: 44%; text-align: left;">Subject Name</th>
              <th style="border: 1px solid #000; padding: 5px; width: 14%;">Grade</th>
              <th style="border: 1px solid #000; padding: 5px; width: 14%;">Pass/Fail</th>
            </tr>
          </thead>
          <tbody>
            ${univRows.length > 0 ? univRows : '<tr><td style="border:1px solid #000; padding:4px; text-align:center;">V</td><td style="border:1px solid #000; padding:4px;"></td><td style="border:1px solid #000; padding:4px;"></td><td style="border:1px solid #000; padding:4px;"></td><td style="border:1px solid #000; padding:4px;"></td></tr>'}
          </tbody>
        </table>

        <p style="font-weight: bold; margin: 4px 0; font-size: 12px;">Nov/Dec 2025 University Results:-</p>
        <p style="font-weight: bold; margin: 2px 0 6px 0; font-size: 12px;">GPA/CGPA:-</p>

        <!-- GPA/CGPA Matrix -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 11px;">
          <tr style="font-weight: bold;">
            <td style="border: 1px solid #000; padding: 4px; width: 25%;">SEMESTER</td>
            <td style="border: 1px solid #000; padding: 4px; text-align: center;">01</td>
            <td style="border: 1px solid #000; padding: 4px; text-align: center;">02</td>
            <td style="border: 1px solid #000; padding: 4px; text-align: center;">03</td>
            <td style="border: 1px solid #000; padding: 4px; text-align: center;">04</td>
            <td style="border: 1px solid #000; padding: 4px; text-align: center;">05</td>
            <td style="border: 1px solid #000; padding: 4px; text-align: center;">06</td>
            <td style="border: 1px solid #000; padding: 4px; text-align: center;">07</td>
          </tr>
          <tr>
            <td style="border: 1px solid #000; padding: 4px; font-weight: bold;">ARREARS</td>
            ${arrearsRow}
          </tr>
          <tr>
            <td style="border: 1px solid #000; padding: 4px; font-weight: bold;">GPA</td>
            ${gpaRow}
          </tr>
          <tr>
            <td style="border: 1px solid #000; padding: 4px; font-weight: bold;">CGPA</td>
            ${cgpaRow}
          </tr>
          <tr>
            <td style="border: 1px solid #000; padding: 4px; font-weight: bold;">CLASS OBTAINED</td>
            <td colspan="7" style="border: 1px solid #000; padding: 4px; font-weight: bold;">${student.classObtained || ''}</td>
          </tr>
        </table>

        <p style="font-weight: bold; margin: 8px 0 4px 0; font-size: 12px;">Academic Year 2025-2026- Even Sem- Continuous Internal Evaluation Results:</p>

        <!-- CIE Results Table -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px;">
          <thead>
            <tr style="background-color: #f8fafc;">
              ${cieHeaderHtml}
            </tr>
          </thead>
          <tbody>
            ${cieRows}
          </tbody>
        </table>

        <br/>
        <p style="text-align: right; font-weight: bold; font-size: 12px; margin-top: 20px;">Signature of Counsellor</p>
      </div>
    `;
  });

  const fullHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>JEPPIAAR IT STUDENT MARKS REPORTS</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        @page { size: 8.5in 11in; margin: 0.5in; }
        body { font-family: 'Times New Roman', serif; font-size: 12pt; }
        table { border-collapse: collapse; width: 100%; }
        td, th { border: 1px solid black; }
      </style>
    </head>
    <body>
      ${reportsHtml}
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + fullHtml], {
    type: 'application/msword',
  });

  const fileName = `JEPPIAAR_IT_ALL_STUDENT_MARKS_REPORTS.doc`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
