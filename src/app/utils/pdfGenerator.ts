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
  onProgress?: (current: number, total: number) => void
): Promise<void> => {
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
    pdf.text(`Regulation:${student.regulation || '2021/2024'}`, pageWidth - margin, y, { align: 'right' });

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
    pdf.text(student.regNo, margin + 166, y + 14);

    // Row 2: Name
    y += 20;
    pdf.rect(margin, y, 160, 20);
    pdf.rect(margin + 160, y, contentWidth - 160, 20);
    pdf.setFont('times', 'normal');
    pdf.text('Name of the Student:', margin + 6, y + 14);
    pdf.setFont('times', 'bold');
    pdf.text(student.name, margin + 166, y + 14);

    // University Results Table
    y += 32;
    pdf.setFont('times', 'bold');
    pdf.setFontSize(10.5);

    // Header Row
    const colW1 = [65, 85, 235, 65, 65];
    let currX = margin;
    
    pdf.rect(margin, y, contentWidth, 20);
    ['Semester', 'Subject Code', 'Subject Name', 'Grade', 'Pass/Fail'].forEach((h, hIdx) => {
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
      pdf.rect(margin, y, contentWidth, 18);
      
      if (item) {
        let x = margin;
        pdf.text(item.sem, x + colW1[0] / 2, y + 12, { align: 'center' }); x += colW1[0];
        pdf.setFont('times', 'bold');
        pdf.text(item.code, x + colW1[1] / 2, y + 12, { align: 'center' }); x += colW1[1];
        pdf.setFont('times', 'normal');
        pdf.text(item.title.substring(0, 48), x + 6, y + 12); x += colW1[2];
        pdf.setFont('times', 'bold');
        pdf.text(item.grade, x + colW1[3] / 2, y + 12, { align: 'center' }); x += colW1[3];
        pdf.text(item.passFail, x + colW1[4] / 2, y + 12, { align: 'center' });
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
    pdf.rect(margin, y, contentWidth, 18);
    let mX = margin;
    pdf.text('SEMESTER', mX + 8, y + 12); mX += matrixCols[0];
    for (let c = 1; c <= 7; c++) {
      pdf.text(`0${c}`, mX + matrixCols[c] / 2, y + 12, { align: 'center' });
      mX += matrixCols[c];
    }

    // Row: ARREARS
    y += 18;
    pdf.rect(margin, y, contentWidth, 18);
    mX = margin;
    pdf.text('ARREARS', mX + 8, y + 12); mX += matrixCols[0];
    pdf.setFont('times', 'normal');
    for (let c = 1; c <= 7; c++) {
      const semKey = `0${c}`;
      const arrVal = getSemValue(student.arrears, semKey, '0');
      pdf.text(String(arrVal), mX + matrixCols[c] / 2, y + 12, { align: 'center' });
      mX += matrixCols[c];
    }

    // Row: GPA
    y += 18;
    pdf.setFont('times', 'bold');
    pdf.rect(margin, y, contentWidth, 18);
    mX = margin;
    pdf.text('GPA', mX + 8, y + 12); mX += matrixCols[0];
    pdf.setFont('times', 'normal');
    for (let c = 1; c <= 7; c++) {
      const semKey = `0${c}`;
      const gpaVal = getSemValue(student.gpaBySem, semKey, c === 5 ? String(student.gpa) : '-');
      pdf.text(String(gpaVal), mX + matrixCols[c] / 2, y + 12, { align: 'center' });
      mX += matrixCols[c];
    }

    // Row: CGPA
    y += 18;
    pdf.setFont('times', 'bold');
    pdf.rect(margin, y, contentWidth, 18);
    mX = margin;
    pdf.text('CGPA', mX + 8, y + 12); mX += matrixCols[0];
    pdf.setFont('times', 'normal');
    for (let c = 1; c <= 7; c++) {
      const semKey = `0${c}`;
      const cgpaVal = getSemValue(student.cgpaBySem, semKey, c === 5 ? String(student.cgpa) : '-');
      pdf.text(String(cgpaVal), mX + matrixCols[c] / 2, y + 12, { align: 'center' });
      mX += matrixCols[c];
    }

    // Row: CLASS OBTAINED
    y += 18;
    pdf.setFont('times', 'bold');
    pdf.rect(margin, y, contentWidth, 18);
    pdf.text('CLASS OBTAINED', margin + 8, y + 12);
    pdf.text(student.classObtained || 'FIRST CLASS', margin + 120, y + 12);

    // Continuous Internal Evaluation Header
    y += 30;
    pdf.setFont('times', 'bold');
    pdf.setFontSize(11);
    pdf.text('Academic Year 2025-2026- Even Sem- Continuous Internal Evaluation Results:', margin, y);

    // Continuous Internal Evaluation Table
    y += 10;
    const colW2 = [65, 85, 235, 65, 65];
    currX = margin;
    
    pdf.rect(margin, y, contentWidth, 20);
    ['Semester', 'Subject Code', 'Subject Name', 'CIE I Marks', 'Pass/Fail'].forEach((h, hIdx) => {
      pdf.text(h, currX + (hIdx === 2 ? 6 : colW2[hIdx] / 2), y + 14, { align: hIdx === 2 ? 'left' : 'center' });
      currX += colW2[hIdx];
    });

    y += 20;
    pdf.setFont('times', 'normal');
    const cieList = student.internalEvalResults || [];
    const maxCieRows = cieList.length;

    for (let r = 0; r < maxCieRows; r++) {
      const item = cieList[r];
      pdf.rect(margin, y, contentWidth, 18);
      
      if (item) {
        let x = margin;
        pdf.text(item.sem, x + colW2[0] / 2, y + 12, { align: 'center' }); x += colW2[0];
        pdf.setFont('times', 'bold');
        pdf.text(item.code, x + colW2[1] / 2, y + 12, { align: 'center' }); x += colW2[1];
        pdf.setFont('times', 'normal');
        pdf.text(item.title.substring(0, 48), x + 6, y + 12); x += colW2[2];
        pdf.setFont('times', 'bold');
        pdf.text(String(item.cie1Marks), x + colW2[3] / 2, y + 12, { align: 'center' }); x += colW2[3];
        pdf.text(item.passFail, x + colW2[4] / 2, y + 12, { align: 'center' });
      }

      y += 18;
    }

    // Counsellor Signature
    y += 40;
    pdf.setFont('times', 'bold');
    pdf.setFontSize(11);
    pdf.text('Signature of Counsellor', pageWidth - margin, y, { align: 'right' });


    // ==========================================
    // PAGE 2: ACKNOWLEDGEMENT FORM
    // ==========================================
    pdf.addPage('a4', 'portrait');

    // Page 2 Border Frame
    pdf.setDrawColor(15, 23, 42); // slate-900
    pdf.setLineWidth(1);
    pdf.rect(18, 18, pageWidth - 36, pageHeight - 36);
    pdf.rect(22, 22, pageWidth - 44, pageHeight - 44);

    let p2Y = 60;

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.setTextColor(15, 23, 42);
    pdf.text('ACKNOWLEDGEMENT', margin, p2Y);

    p2Y += 30;
    pdf.setFont('times', 'normal');
    pdf.setFontSize(11);
    pdf.text('To', margin, p2Y);

    p2Y += 25;
    pdf.setFont('times', 'bold');
    pdf.text(`The Class Counsellor, Department of ${student.department || 'Computer Science and Engineering'} ,`, pageWidth / 2, p2Y, { align: 'center' });

    p2Y += 20;
    pdf.setFont('times', 'normal');
    pdf.text('Jeppiaar Institute of Technology, Kunnam, Sunguvarchatram, Sriperumbudur (T.K), Chennai - 631604.', margin, p2Y);

    p2Y += 30;
    pdf.text('Progress report of my Son / Daughter Name: ', margin, p2Y);
    const p1 = pdf.getTextWidth('Progress report of my Son / Daughter Name: ');
    pdf.setFont('times', 'bold');
    pdf.text(`${student.name} – Reg. ${student.regNo}`, margin + p1, p2Y);
    const p2 = pdf.getTextWidth(`${student.name} – Reg. ${student.regNo}`);
    pdf.setFont('times', 'normal');
    pdf.text(' for', margin + p1 + p2, p2Y);

    p2Y += 18;
    pdf.text('Nov/Dec 2025 end Semester exam and 2025-2026 AY – Even Sem- Continuous Internal Evaluation', margin, p2Y);

    p2Y += 18;
    pdf.text('Results have been received.', margin, p2Y);

    p2Y += 70;
    pdf.setFont('times', 'bold');
    pdf.text('Signature of the Parent', pageWidth - margin, p2Y, { align: 'right' });

    p2Y += 30;
    pdf.setFont('times', 'normal');
    pdf.text('Date:', margin, p2Y);

    p2Y += 40;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.text('JIT/EXAM/FORM-09-b', pageWidth - margin, p2Y, { align: 'right' });
  }

  pdf.save('JEPPIAAR_IT_PARENTS_Mark_Reports_Combined.pdf');
};
