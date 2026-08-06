import { jsPDF } from 'jspdf';
import { StudentRecord } from '../types';

const loadImg = (src: string): Promise<HTMLImageElement | null> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
};

export const generateCombinedPDF = async (
  students: StudentRecord[],
  reportContainerElement?: HTMLElement | null,
  onProgress?: (current: number, total: number) => void,
  regulation: string = '2021',
  returnBlobUrl: boolean = false
): Promise<string | void> => {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth(); // 595.28 pt
  const pageHeight = pdf.internal.pageSize.getHeight(); // 841.89 pt
  const margin = 35;
  const contentWidth = pageWidth - margin * 2;

  const jitLogoImg = await loadImg('/jit_logo.png');
  const naacLogoImg = await loadImg('/naac_logo.png');
  const nbaLogoImg = await loadImg('/nba_logo.png');

  const getSemValue = (map: Record<string, any> | undefined, semKey: string, fallback: string): string => {
    if (!map) return fallback;
    const val = map[semKey] || map[semKey.replace(/^0/, '')];
    return val !== undefined && val !== null && val !== '' ? String(val) : fallback;
  };

  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    if (i > 0) {
      pdf.addPage('a4', 'portrait');
    }

    if (onProgress) {
      onProgress(i + 1, students.length);
    }

    // ==========================================
    // PAGE 1: MARKS REPORT & EVALUATION
    // ==========================================

    // Simple Page Border Frame
    pdf.setDrawColor(15, 23, 42); // slate-900
    pdf.setLineWidth(1);
    pdf.rect(18, 18, pageWidth - 36, pageHeight - 36);
    pdf.rect(22, 22, pageWidth - 44, pageHeight - 44);

    // Render Logos
    if (jitLogoImg) {
      pdf.addImage(jitLogoImg, 'PNG', 35, 30, 42, 48);
    }
    if (naacLogoImg) {
      pdf.addImage(naacLogoImg, 'PNG', pageWidth - 35 - 85, 32, 36, 40);
    }
    if (nbaLogoImg) {
      pdf.addImage(nbaLogoImg, 'PNG', pageWidth - 35 - 45, 34, 45, 38);
    }

    // Top Header Titles
    pdf.setTextColor(2, 132, 199); // #0284c7
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(15);
    pdf.text('JEPPIAAR INSTITUTE OF TECHNOLOGY', pageWidth / 2, 45, { align: 'center' });

    pdf.setTextColor(3, 105, 161); // #0369a1
    pdf.setFont('times', 'bolditalic');
    pdf.setFontSize(10.5);
    pdf.text('"Self Belief, Self Discipline, Self Respect"', pageWidth / 2, 58, { align: 'center' });

    pdf.setTextColor(220, 38, 38); // #dc2626
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.text('( AN AUTONOMOUS INSTITUTION )', pageWidth / 2, 70, { align: 'center' });

    // Greetings Line
    let y = 95;
    pdf.setTextColor(15, 23, 42);
    pdf.setFont('times', 'normal');
    pdf.setFontSize(11);
    pdf.text('Greetings from Jeppiaar Institute of Technology,', margin, y);

    y += 14;
    pdf.text('This is to inform you that the results of the Semester End Examination held during ', margin, y);
    const textWidth = pdf.getTextWidth('This is to inform you that the results of the Semester End Examination held during ');
    pdf.setFont('times', 'bold');
    pdf.text('Nov/Dec', margin + textWidth, y);
    const novWidth = pdf.getTextWidth('Nov/Dec');
    pdf.setFont('times', 'normal');
    pdf.text(' 2025 have been released.', margin + textWidth + novWidth, y);

    y += 18;
    pdf.setFont('times', 'bold');
    pdf.text(`Regulation: ${regulation || '2021'}`, pageWidth - margin, y, { align: 'right' });

    // Register Number & Name Box Table
    y += 8;
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.8);
    
    // Row 1: Reg No
    pdf.rect(margin, y, 160, 20);
    pdf.rect(margin + 160, y, contentWidth - 160, 20);
    pdf.setFont('times', 'normal');
    pdf.text('Register number:', margin + 6, y + 14);
    pdf.setFont('times', 'bold');
    pdf.text(student.regNo || '', margin + 166, y + 14);

    // Row 2: Name
    y += 20;
    pdf.rect(margin, y, 160, 20);
    pdf.rect(margin + 160, y, contentWidth - 160, 20);
    pdf.setFont('times', 'normal');
    pdf.text('Name of the Student:', margin + 6, y + 14);
    pdf.setFont('times', 'bold');
    pdf.text(student.name || '', margin + 166, y + 14);

    // University Results Table
    y += 32;
    pdf.setFont('times', 'bold');
    pdf.setFontSize(10.5);

    // Header Row
    const colW1 = [65, 85, 235, 65, 75];
    let currX = margin;
    
    ['Semester', 'Subject Code', 'Subject Name', 'Grade', 'Pass/Fail'].forEach((h, hIdx) => {
      pdf.rect(currX, y, colW1[hIdx], 20);
      pdf.text(h, currX + (hIdx === 2 ? 6 : colW1[hIdx] / 2), y + 14, { align: hIdx === 2 ? 'left' : 'center' });
      currX += colW1[hIdx];
    });

    y += 20;
    pdf.setFont('times', 'normal');
    pdf.setFontSize(10);

    const univList = student.universityResults || [];
    const maxUnivRows = univList.length;

    for (let r = 0; r < maxUnivRows; r++) {
      const item = univList[r];
      let x = margin;
      colW1.forEach((w) => {
        pdf.rect(x, y, w, 18);
        x += w;
      });
      
      if (item) {
        let cx = margin;
        pdf.text(item.sem || '', cx + colW1[0] / 2, y + 12, { align: 'center' }); cx += colW1[0];
        pdf.setFont('times', 'bold');
        pdf.text(item.code || '', cx + colW1[1] / 2, y + 12, { align: 'center' }); cx += colW1[1];
        pdf.setFont('times', 'normal');
        pdf.text((item.title || '').substring(0, 48), cx + 6, y + 12); cx += colW1[2];
        pdf.setFont('times', 'bold');
        pdf.text(item.grade || '', cx + colW1[3] / 2, y + 12, { align: 'center' }); cx += colW1[3];
        pdf.text(item.passFail || '', cx + colW1[4] / 2, y + 12, { align: 'center' });
      }

      y += 18;
    }

    // Nov/Dec 2025 University Results Header
    y += 12;
    pdf.setFont('times', 'bold');
    pdf.setFontSize(11);
    pdf.text('Nov/Dec 2025 University Results:-', margin, y);

    y += 18;
    pdf.text('GPA/CGPA:-', margin, y);

    // Matrix Table (SEMESTER, ARREARS, GPA, CGPA, CLASS OBTAINED)
    y += 8;
    const matrixCols = [100, ...Array(7).fill((contentWidth - 100) / 7)];

    // Matrix Header: SEMESTER | 01 | 02 | 03 | 04 | 05 | 06 | 07
    let mX = margin;
    matrixCols.forEach((w) => {
      pdf.rect(mX, y, w, 18);
      mX += w;
    });
    mX = margin;
    pdf.text('SEMESTER', mX + 8, y + 12); mX += matrixCols[0];
    for (let c = 1; c <= 7; c++) {
      pdf.text(`0${c}`, mX + matrixCols[c] / 2, y + 12, { align: 'center' });
      mX += matrixCols[c];
    }

    // Row: ARREARS
    y += 18;
    mX = margin;
    matrixCols.forEach((w) => {
      pdf.rect(mX, y, w, 18);
      mX += w;
    });
    mX = margin;
    pdf.text('ARREARS', mX + 8, y + 12); mX += matrixCols[0];
    pdf.setFont('times', 'normal');
    for (let c = 1; c <= 7; c++) {
      const semKey = `0${c}`;
      const arrVal = getSemValue(student.arrears, semKey, '');
      pdf.text(String(arrVal), mX + matrixCols[c] / 2, y + 12, { align: 'center' });
      mX += matrixCols[c];
    }

    // Row: GPA
    y += 18;
    mX = margin;
    matrixCols.forEach((w) => {
      pdf.rect(mX, y, w, 18);
      mX += w;
    });
    pdf.setFont('times', 'bold');
    mX = margin;
    pdf.text('GPA', mX + 8, y + 12); mX += matrixCols[0];
    pdf.setFont('times', 'normal');
    for (let c = 1; c <= 7; c++) {
      const semKey = `0${c}`;
      const gpaVal = getSemValue(student.gpaBySem, semKey, (c === 5 || c === 5) && student.gpa !== undefined ? String(student.gpa) : '');
      pdf.text(String(gpaVal), mX + matrixCols[c] / 2, y + 12, { align: 'center' });
      mX += matrixCols[c];
    }

    // Row: CGPA
    y += 18;
    mX = margin;
    matrixCols.forEach((w) => {
      pdf.rect(mX, y, w, 18);
      mX += w;
    });
    pdf.setFont('times', 'bold');
    mX = margin;
    pdf.text('CGPA', mX + 8, y + 12); mX += matrixCols[0];
    pdf.setFont('times', 'normal');
    for (let c = 1; c <= 7; c++) {
      const semKey = `0${c}`;
      const cgpaVal = getSemValue(student.cgpaBySem, semKey, (c === 5 || c === 5) && student.cgpa !== undefined ? String(student.cgpa) : '');
      pdf.text(String(cgpaVal), mX + matrixCols[c] / 2, y + 12, { align: 'center' });
      mX += matrixCols[c];
    }

    // Row: CLASS OBTAINED
    y += 18;
    pdf.setFont('times', 'bold');
    pdf.rect(margin, y, 100, 18);
    pdf.rect(margin + 100, y, contentWidth - 100, 18);
    pdf.text('CLASS OBTAINED', margin + 8, y + 12);
    pdf.setFont('times', 'normal');
    pdf.text(student.classObtained || '', margin + 108, y + 12);

    // Continuous Internal Evaluation Header
    y += 30;
    pdf.setFont('times', 'bold');
    pdf.setFontSize(11);
    pdf.text('Academic Year 2025-2026- Even Sem- Continuous Internal Evaluation Results:', margin, y);

    // Continuous Internal Evaluation Table (7 Columns: Semester, Subject Code, Subject Name, CIE I Marks, CIE II Marks, Model Marks, Pass/Fail)
    y += 10;
    const colW2 = [45, 65, 165, 60, 60, 60, 70];
    currX = margin;
    
    const cieHeaders = ['Semester', 'Subject Code', 'Subject Name', 'CIE I Marks', 'CIE II Marks', 'Model Marks', 'Pass/Fail'];
    cieHeaders.forEach((h, hIdx) => {
      pdf.rect(currX, y, colW2[hIdx], 20);
      pdf.text(h, currX + (hIdx === 2 ? 6 : colW2[hIdx] / 2), y + 14, { align: hIdx === 2 ? 'left' : 'center' });
      currX += colW2[hIdx];
    });

    y += 20;
    pdf.setFont('times', 'normal');
    const cieList = student.internalEvalResults || [];
    const maxCieRows = cieList.length;

    for (let r = 0; r < maxCieRows; r++) {
      const item = cieList[r];
      let x = margin;
      colW2.forEach((w) => {
        pdf.rect(x, y, w, 18);
        x += w;
      });
      
      if (item) {
        let cx = margin;
        pdf.text(item.sem || 'VI', cx + colW2[0] / 2, y + 12, { align: 'center' }); cx += colW2[0];
        pdf.setFont('times', 'bold');
        pdf.text(item.code || '', cx + colW2[1] / 2, y + 12, { align: 'center' }); cx += colW2[1];
        pdf.setFont('times', 'normal');
        pdf.text((item.title || '').substring(0, 34), cx + 6, y + 12); cx += colW2[2];
        pdf.setFont('times', 'bold');
        pdf.text(item.cie1Marks !== undefined && item.cie1Marks !== null ? String(item.cie1Marks) : '', cx + colW2[3] / 2, y + 12, { align: 'center' }); cx += colW2[3];
        pdf.text(item.cie2Marks !== undefined && item.cie2Marks !== null ? String(item.cie2Marks) : '', cx + colW2[4] / 2, y + 12, { align: 'center' }); cx += colW2[4];
        pdf.text(item.modelMarks !== undefined && item.modelMarks !== null ? String(item.modelMarks) : '', cx + colW2[5] / 2, y + 12, { align: 'center' }); cx += colW2[5];
        pdf.text(item.passFail || '', cx + colW2[6] / 2, y + 12, { align: 'center' });
      }

      y += 18;
    }

    // Counsellor Signature
    y += 40;
    pdf.setFont('times', 'bold');
    pdf.setFontSize(11);
    pdf.text('Signature of Counsellor', pageWidth - margin, y, { align: 'right' });


    // ==========================================
    // PAGE 2: GRADUATE ATTRIBUTES / CONTINUOUS EVALUATION / ACKNOWLEDGEMENT
    // ==========================================
    pdf.addPage('a4', 'portrait');

    pdf.setDrawColor(15, 23, 42);
    pdf.setLineWidth(1);
    pdf.rect(18, 18, pageWidth - 36, pageHeight - 36);
    pdf.rect(22, 22, pageWidth - 44, pageHeight - 44);

    let p2Y = 45;

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(15, 23, 42);
    pdf.text('ACKNOWLEDGEMENT', pageWidth / 2, p2Y, { align: 'center' });

    p2Y += 20;
    pdf.setFont('times', 'normal');
    pdf.setFontSize(10);
    pdf.text('To', margin, p2Y);

    p2Y += 15;
    const deptStr = student.department && student.department.trim() ? student.department.trim() : '';
    pdf.text(`The Class Counsellor, Department of ${deptStr},`, pageWidth / 2, p2Y, { align: 'center' });

    p2Y += 15;
    pdf.setFont('times', 'normal');
    pdf.text('Jeppiaar Institute of Technology, Kunnam, Sunguvarchatram, Sriperumbudur (T.K), Chennai - 631604.', margin, p2Y);

    p2Y += 20;
    pdf.text('Progress report of my Son / Daughter Name: ', margin, p2Y);
    const p1 = pdf.getTextWidth('Progress report of my Son / Daughter Name: ');
    pdf.setFont('times', 'bold');
    pdf.text(`${student.name || ''} – Reg. ${student.regNo || ''}`, margin + p1, p2Y);
    const p2 = pdf.getTextWidth(`${student.name || ''} – Reg. ${student.regNo || ''}`);
    pdf.setFont('times', 'normal');
    pdf.text(' for', margin + p1 + p2, p2Y);

    p2Y += 14;
    pdf.text('Nov/Dec 2025 end Semester exam and 2025-2026 AY – Even Sem- Continuous Internal Evaluation', margin, p2Y);

    p2Y += 14;
    pdf.text('Results have been received.', margin, p2Y);

    p2Y += 30;
    pdf.setFont('times', 'bold');
    pdf.text('Signature of the Parent', pageWidth - margin, p2Y, { align: 'right' });

    p2Y += 18;
    pdf.setFont('times', 'normal');
    pdf.text('Date:', margin, p2Y);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9.5);
    pdf.text('JIT/EXAM/FORM-09-b', pageWidth - margin, p2Y, { align: 'right' });

    // Section 16.2 CLASSIFICATION OF THE DEGREE AWARDED
    p2Y += 22;
    pdf.setDrawColor(203, 213, 225); // slate-300
    pdf.setLineWidth(0.5);
    pdf.line(margin, p2Y, pageWidth - margin, p2Y);

    p2Y += 15;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.text('16.2    CLASSIFICATION OF THE DEGREE AWARDED', margin, p2Y);

    p2Y += 14;
    pdf.text('16.2.1  FIRST CLASS WITH DISTINCTION', margin, p2Y);

    p2Y += 12;
    pdf.setFont('times', 'normal');
    pdf.setFontSize(8.5);
    pdf.text('A student who satisfies the following conditions shall be declared to have passed the examination in ', margin + 15, p2Y);
    const w1 = pdf.getTextWidth('A student who satisfies the following conditions shall be declared to have passed the examination in ');
    pdf.setFont('times', 'bold');
    pdf.text('First class with Distinction:', margin + 15 + w1, p2Y);

    p2Y += 12;
    pdf.setFont('times', 'normal');
    const bullet1 = '• Should have passed the examination in all the courses of all the eight semesters (10 Semesters in case of Mechanical';
    pdf.text(bullet1, margin + 25, p2Y);
    p2Y += 11;
    pdf.text('  (Sandwich) and 6 semesters in the case of Lateral Entry) in the student\'s First Appearance within ', margin + 25, p2Y);
    const w2 = pdf.getTextWidth('  (Sandwich) and 6 semesters in the case of Lateral Entry) in the student\'s First Appearance within ');
    pdf.setFont('times', 'bold');
    pdf.text('five years', margin + 25 + w2, p2Y);
    const w3 = pdf.getTextWidth('five years');
    pdf.setFont('times', 'normal');
    pdf.text(' (Six years', margin + 25 + w2 + w3, p2Y);
    p2Y += 11;
    pdf.text('  in the case of Mechanical (Sandwich) and Four years in the case of Lateral Entry). Withdrawal from examination', margin + 25, p2Y);
    p2Y += 11;
    pdf.text('  (vide Clause 17) will not be considered as an appearance.', margin + 25, p2Y);

    p2Y += 12;
    pdf.text('• Should have secured a CGPA of not less than ', margin + 25, p2Y);
    const w4 = pdf.getTextWidth('• Should have secured a CGPA of not less than ');
    pdf.setFont('times', 'bold');
    pdf.text('8.50.', margin + 25 + w4, p2Y);

    p2Y += 12;
    pdf.setFont('times', 'normal');
    pdf.text('• One year authorized break of study (if availed of) is included in the five years (Six years in the case of Mechanical', margin + 25, p2Y);
    p2Y += 11;
    pdf.text('  (Sandwich) and four years in the case of Lateral entry) for award of First class with Distinction.', margin + 25, p2Y);

    p2Y += 12;
    pdf.text('• Should NOT have been prevented from writing end semester examination due to lack of attendance in any semester.', margin + 25, p2Y);

    p2Y += 16;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.text('16.2.2  FIRST CLASS:', margin, p2Y);

    p2Y += 12;
    pdf.setFont('times', 'normal');
    pdf.setFontSize(8.5);
    pdf.text('A student who satisfies the following conditions shall be declared to have passed the examination in ', margin + 15, p2Y);
    const w5 = pdf.getTextWidth('A student who satisfies the following conditions shall be declared to have passed the examination in ');
    pdf.setFont('times', 'bold');
    pdf.text('First class:', margin + 15 + w5, p2Y);

    p2Y += 12;
    pdf.setFont('times', 'normal');
    pdf.text('• Should have passed the examination in all the courses of all eight semesters (10 Semesters in case of Mechanical', margin + 25, p2Y);
    p2Y += 11;
    pdf.text('  (Sandwich) and 6 semesters in the case of Lateral Entry) ', margin + 25, p2Y);
    const w6 = pdf.getTextWidth('  (Sandwich) and 6 semesters in the case of Lateral Entry) ');
    pdf.setFont('times', 'bold');
    pdf.text('within five years.', margin + 25 + w6, p2Y);

    p2Y += 12;
    pdf.setFont('times', 'normal');
    pdf.text('• One year authorized break of study (if availed of) or prevention from writing the End Semester examination due', margin + 25, p2Y);
    p2Y += 11;
    pdf.text('  to lack of attendance (if applicable) is included in the duration of five years for award of First class.', margin + 25, p2Y);

    p2Y += 12;
    pdf.text('• Should have secured a CGPA of not less than ', margin + 25, p2Y);
    const w7 = pdf.getTextWidth('• Should have secured a CGPA of not less than ');
    pdf.setFont('times', 'bold');
    pdf.text('6.50.', margin + 25 + w7, p2Y);

    p2Y += 16;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.text('16.2.3  SECOND CLASS:', margin, p2Y);

    p2Y += 12;
    pdf.setFont('times', 'normal');
    pdf.setFontSize(8.5);
    pdf.text('All other students (not covered in clauses 16.2.1 and 16.2.2) who qualify for the award of the degree (vide Clause 16.1) shall', margin + 15, p2Y);
    p2Y += 11;
    pdf.text('be declared to have passed the examination in ', margin + 15, p2Y);
    const w8 = pdf.getTextWidth('be declared to have passed the examination in ');
    pdf.setFont('times', 'bold');
    pdf.text('Second Class.', margin + 15 + w8, p2Y);
  }

  if (returnBlobUrl) {
    return pdf.output('bloburl') as string;
  }

  pdf.save('JEPPIAAR_IT_PARENTS_Mark_Reports_Combined.pdf');
};
