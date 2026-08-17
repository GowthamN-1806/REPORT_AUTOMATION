import { jsPDF } from 'jspdf';
import { StudentRecord } from '../types';

export const getSemEvenOddLabel = (sem?: string): string => {
  if (!sem) return 'Even Sem';
  const str = String(sem).trim().toUpperCase();
  const clean = str.replace(/^(?:SEMESTER|SEM)\s*[:./-]?\s*/i, '').trim();

  if (/^(II|IV|VI|VIII|0?2|0?4|0?6|0?8)$/i.test(clean) || /\b(II|IV|VI|VIII)\b/i.test(clean)) {
    return 'Even Sem';
  }
  if (/^(I|III|V|VII|0?1|0?3|0?5|0?7)$/i.test(clean) || /\b(I|III|V|VII)\b/i.test(clean)) {
    return 'Odd Sem';
  }
  return 'Even Sem';
};

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

    let y = 95;
    pdf.setTextColor(15, 23, 42);
    pdf.setFont('times', 'bold');
    pdf.setFontSize(10.5);
    pdf.text(`Regulation: ${regulation || '2021'}`, pageWidth - margin, y, { align: 'right' });

    const hasUniv = (student.universityResults && student.universityResults.length > 0) || Boolean(student.gpa || student.cgpa);
    const rawSession = (student.examSession || '').replace(/\s*[\-\–:]?\s*(?:BEFORE|AFTER)?\s*REVALUATION.*/i, '').trim().toUpperCase();

    pdf.setFont('times', 'normal');
    pdf.setFontSize(10.5);
    pdf.text('Greetings from Jeppiaar Institute of Technology,', margin, y);

    y += 16;
    if (hasUniv) {
      const sessionText = rawSession ? `held during ${rawSession} ` : '';
      pdf.text(`This is to inform you that the results of the Semester End Examination ${sessionText}have been released.`, margin, y);
    } else {
      pdf.setFont('times', 'bold');
      pdf.text('Continuous Internal Evaluation Mark Report', margin, y);
    }

    // Student Details Box Table (Register Number & Name of Student)
    y += 24;
    pdf.setFont('times', 'bold');
    pdf.setFontSize(10.5);

    pdf.rect(margin, y, 160, 20);
    pdf.rect(margin + 160, y, contentWidth - 160, 20);
    pdf.setFont('times', 'normal');
    pdf.text('Register Number:', margin + 6, y + 14);
    pdf.setFont('times', 'bold');
    pdf.text(student.regNo || '', margin + 166, y + 14);

    y += 20;
    pdf.rect(margin, y, 160, 20);
    pdf.rect(margin + 160, y, contentWidth - 160, 20);
    pdf.setFont('times', 'normal');
    pdf.text('Name of the Student:', margin + 6, y + 14);
    pdf.setFont('times', 'bold');
    pdf.text(student.name || '', margin + 166, y + 14);

    if (hasUniv) {
      // University Results Section Heading & Table
      y += 36;
      pdf.setFont('times', 'bold');
      pdf.setFontSize(10.5);
      pdf.setTextColor(15, 23, 42);
      const univHeadingText = rawSession ? `${rawSession} Semester End Examination Results:` : 'Semester End Examination Results:';
      pdf.text(univHeadingText, margin, y);

      y += 14;
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

      // GPA/CGPA Header
      y += 18;
      pdf.setFont('times', 'bold');
      pdf.setFontSize(11);
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
                         getSemesterNumber(student.universityResults?.[0]?.sem) ||
                         4;

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
        const gpaVal = getSemValue(student.gpaBySem, semKey, c === activeSemNum && student.gpa !== undefined ? String(student.gpa) : '');
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
        const cgpaVal = getSemValue(student.cgpaBySem, semKey, c === activeSemNum && student.cgpa !== undefined ? String(student.cgpa) : '');
        pdf.text(String(cgpaVal), mX + matrixCols[c] / 2, y + 12, { align: 'center' });
        mX += matrixCols[c];
      }

      // Row: CLASS OBTAINED
      y += 18;
      pdf.setFont('times', 'bold');
      pdf.setFontSize(8.5);
      pdf.rect(margin, y, 105, 18);
      pdf.rect(margin + 105, y, contentWidth - 105, 18);
      pdf.text('CLASS OBTAINED', margin + 6, y + 12);
      pdf.setFont('times', 'normal');
      pdf.setFontSize(10);
      pdf.text(student.classObtained || '', margin + 111, y + 12);
    }

    // Continuous Internal Evaluation Header & Table
    const cieList = student.internalEvalResults || [];
    const hasCie1 = cieList.some((item) => item && item.cie1Marks !== undefined && item.cie1Marks !== null && String(item.cie1Marks).trim() !== '');
    const hasCie2 = cieList.some((item) => item && item.cie2Marks !== undefined && item.cie2Marks !== null && String(item.cie2Marks).trim() !== '');
    const hasModel = cieList.some((item) => item && item.modelMarks !== undefined && item.modelMarks !== null && String(item.modelMarks).trim() !== '');

    if (cieList.length > 0) {
      y += 30;
      pdf.setFont('times', 'bold');
      const semText = getSemEvenOddLabel(student.currentSemester);
      const ayStr = student.academicYear || '';
      const cieHeaderStr = ayStr
        ? `Academic Year ${ayStr} – ${semText} – Continuous Internal Evaluation Results:`
        : `Academic Year – ${semText} – Continuous Internal Evaluation Results:`;
      pdf.text(cieHeaderStr, margin, y);

      y += 10;

      // Build dynamic columns list based exclusively on uploaded exam data
      interface DynamicCol {
        id: 'sem' | 'code' | 'title' | 'cie1' | 'cie1Pf' | 'cie2' | 'cie2Pf' | 'model' | 'modelPf' | 'passFail';
        header: string;
        width: number;
        align: 'left' | 'center';
      }

      const activeCols: DynamicCol[] = [
        { id: 'sem', header: 'Semester', width: 40, align: 'center' },
        { id: 'code', header: 'Subject Code', width: 60, align: 'center' },
      ];

      const examColsCount = (hasCie1 ? 1 : 0) + (hasCie2 ? 1 : 0) + (hasModel ? 1 : 0);
      
      let markWidth = 60;
      let pfWidth = 65;
      if (examColsCount === 2) {
        markWidth = 48;
        pfWidth = 54;
      } else if (examColsCount >= 3) {
        markWidth = 43;
        pfWidth = 46;
      }

      if (hasCie1) {
        activeCols.push({ id: 'cie1', header: 'CIE I Marks', width: markWidth, align: 'center' });
        activeCols.push({ id: 'cie1Pf', header: 'CIE I Result', width: pfWidth, align: 'center' });
      }
      if (hasCie2) {
        activeCols.push({ id: 'cie2', header: 'CIE II Marks', width: markWidth, align: 'center' });
        activeCols.push({ id: 'cie2Pf', header: 'CIE II Result', width: pfWidth, align: 'center' });
      }
      if (hasModel) {
        activeCols.push({ id: 'model', header: 'Model Marks', width: markWidth, align: 'center' });
        activeCols.push({ id: 'modelPf', header: 'Model Result', width: pfWidth, align: 'center' });
      }

      if (examColsCount === 0) {
        activeCols.push({ id: 'passFail', header: 'Pass/Fail', width: 65, align: 'center' });
      }

      // Calculate title width to take up remaining horizontal space (total width = 525)
      const fixedWidthSum = activeCols.reduce((acc, col) => acc + col.width, 0);
      const titleWidth = Math.max(110, 525 - fixedWidthSum);

      // Insert title column after subject code
      activeCols.splice(2, 0, { id: 'title', header: 'Subject Name', width: titleWidth, align: 'left' });

      // Render 2-Tier Grouped Header Row
      let headerY1 = y;
      let headerY2 = y + 16;
      let headerHeight = 32;

      pdf.setFont('times', 'bold');
      pdf.setFontSize(examColsCount >= 3 ? 8 : 8.5);

      // 1. First 3 vertical-span headers: Semester, Subject Code, Subject Name
      pdf.rect(margin, headerY1, 40, headerHeight);
      pdf.text('Semester', margin + 20, headerY1 + 20, { align: 'center' });

      pdf.rect(margin + 40, headerY1, 60, headerHeight);
      pdf.text('Subject Code', margin + 70, headerY1 + 20, { align: 'center' });

      pdf.rect(margin + 100, headerY1, titleWidth, headerHeight);
      pdf.text('Subject Name', margin + 106, headerY1 + 20, { align: 'left' });

      let currX = margin + 100 + titleWidth;

      // 2. Exam Group Headers & Sub-Headers (CIE I, CIE II, Model Exam)
      if (hasCie1) {
        const groupW = markWidth + pfWidth;
        pdf.rect(currX, headerY1, groupW, 16);
        pdf.text('CIE I', currX + groupW / 2, headerY1 + 11, { align: 'center' });

        pdf.rect(currX, headerY2, markWidth, 16);
        pdf.text('Marks', currX + markWidth / 2, headerY2 + 11, { align: 'center' });

        pdf.rect(currX + markWidth, headerY2, pfWidth, 16);
        pdf.text('Pass/Fail', currX + markWidth + pfWidth / 2, headerY2 + 11, { align: 'center' });

        currX += groupW;
      }

      if (hasCie2) {
        const groupW = markWidth + pfWidth;
        pdf.rect(currX, headerY1, groupW, 16);
        pdf.text('CIE II', currX + groupW / 2, headerY1 + 11, { align: 'center' });

        pdf.rect(currX, headerY2, markWidth, 16);
        pdf.text('Marks', currX + markWidth / 2, headerY2 + 11, { align: 'center' });

        pdf.rect(currX + markWidth, headerY2, pfWidth, 16);
        pdf.text('Pass/Fail', currX + markWidth + pfWidth / 2, headerY2 + 11, { align: 'center' });

        currX += groupW;
      }

      if (hasModel) {
        const groupW = markWidth + pfWidth;
        pdf.rect(currX, headerY1, groupW, 16);
        pdf.text('Model Exam', currX + groupW / 2, headerY1 + 11, { align: 'center' });

        pdf.rect(currX, headerY2, markWidth, 16);
        pdf.text('Marks', currX + markWidth / 2, headerY2 + 11, { align: 'center' });

        pdf.rect(currX + markWidth, headerY2, pfWidth, 16);
        pdf.text('Pass/Fail', currX + markWidth + pfWidth / 2, headerY2 + 11, { align: 'center' });

        currX += groupW;
      }

      if (examColsCount === 0) {
        pdf.rect(currX, headerY1, 65, headerHeight);
        pdf.text('Pass/Fail', currX + 32.5, headerY1 + 20, { align: 'center' });
      }

      y += headerHeight;
      pdf.setFont('times', 'normal');
      pdf.setFontSize(8.5);

      const evaluateCiePfHelper = (markVal: any): string => {
        if (markVal === undefined || markVal === null) return '';
        const str = String(markVal).trim().toUpperCase();
        if (!str) return '';
        if (/^(O|A\+|A|B\+|B|C|D|P|PASS)$/.test(str)) return 'PASS';
        if (/^(RA|U|AB|ABSENT|FAIL|F)$/.test(str)) return 'FAIL';
        const num = Number(str);
        return !isNaN(num) ? (num >= 50 ? 'PASS' : 'FAIL') : '';
      };

      // Render Data Rows
      cieList.forEach((item) => {
        let x = margin;
        activeCols.forEach((col) => {
          pdf.rect(x, y, col.width, 18);
          x += col.width;
        });

        if (item) {
          let cx = margin;
          activeCols.forEach((col) => {
            let cellText = '';
            if (col.id === 'sem') cellText = item.sem || student.currentSemester || 'V';
            else if (col.id === 'code') cellText = item.code || '';
            else if (col.id === 'title') cellText = (item.title || '').substring(0, 28);
            else if (col.id === 'cie1') cellText = item.cie1Marks !== undefined && item.cie1Marks !== null ? String(item.cie1Marks) : '';
            else if (col.id === 'cie1Pf') cellText = item.cie1PassFail || evaluateCiePfHelper(item.cie1Marks);
            else if (col.id === 'cie2') cellText = item.cie2Marks !== undefined && item.cie2Marks !== null ? String(item.cie2Marks) : '';
            else if (col.id === 'cie2Pf') cellText = item.cie2PassFail || evaluateCiePfHelper(item.cie2Marks);
            else if (col.id === 'model') cellText = item.modelMarks !== undefined && item.modelMarks !== null ? String(item.modelMarks) : '';
            else if (col.id === 'modelPf') cellText = item.modelPassFail || evaluateCiePfHelper(item.modelMarks);
            else if (col.id === 'passFail') cellText = item.passFail || '';

            const isBold = col.id === 'code' || col.id.startsWith('cie') || col.id.startsWith('model') || col.id === 'passFail';
            pdf.setFont('times', isBold ? 'bold' : 'normal');
            pdf.text(cellText, cx + (col.align === 'left' ? 6 : col.width / 2), y + 12, { align: col.align });
            cx += col.width;
          });
        }

        y += 18;
      });
    }

    // Signature of Counsellor
    y += 35;
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
    pdf.setFontSize(10.5);
    pdf.text('To', margin, p2Y);

    p2Y += 15;
    const deptStr = student.department && student.department.trim() ? student.department.trim() : '';
    pdf.text(`The Class Counsellor, Department of ${deptStr},`, margin, p2Y);

    // Helper to render a justified line of text segments across contentWidth
    const renderJustifiedLine = (
      segments: { text: string; bold?: boolean }[],
      startY: number
    ) => {
      pdf.setFontSize(10.5);
      const words: { text: string; bold: boolean; width: number }[] = [];
      segments.forEach((seg) => {
        pdf.setFont('times', seg.bold ? 'bold' : 'normal');
        const segWords = seg.text.split(' ');
        segWords.forEach((w, wIdx) => {
          if (w === '' && wIdx > 0) return;
          const wordText = w;
          const wWidth = pdf.getTextWidth(wordText);
          words.push({ text: wordText, bold: !!seg.bold, width: wWidth });
        });
      });

      if (words.length === 0) return;

      pdf.setFont('times', 'normal');
      const normalSpaceWidth = pdf.getTextWidth(' ');

      const totalWordsWidth = words.reduce((acc, w) => acc + w.width, 0);
      const totalNormalSpaces = (words.length - 1) * normalSpaceWidth;
      const totalNaturalWidth = totalWordsWidth + totalNormalSpaces;

      const extraSpaceTotal = Math.max(0, contentWidth - totalNaturalWidth);
      const extraPerSpace = words.length > 1 ? extraSpaceTotal / (words.length - 1) : 0;

      let currentX = margin;
      words.forEach((w, idx) => {
        pdf.setFont('times', w.bold ? 'bold' : 'normal');
        pdf.text(w.text, currentX, startY);
        currentX += w.width + normalSpaceWidth + extraPerSpace;
      });
    };

    p2Y += 22;
    // Justified Paragraph Line 1 (Address Line - Starts Left, Ends Right)
    renderJustifiedLine([
      { text: 'Jeppiaar Institute of Technology, Kunnam, Sunguvarchatram, Sriperumbudur (T.K.), Chennai - 631604.', bold: false }
    ], p2Y);

    p2Y += 15;
    // Justified Paragraph Line 2 (Progress report + Student Name & Reg No)
    renderJustifiedLine([
      { text: 'Progress report of my Son / Daughter Name: ', bold: false },
      { text: `${student.name || ''} – Reg. ${student.regNo || ''}`, bold: true },
      { text: ' for', bold: false }
    ], p2Y);

    p2Y += 15;
    const semText = getSemEvenOddLabel(student.currentSemester);
    const ayStrAck = student.academicYear ? `${student.academicYear} AY – ${semText} – ` : `${semText} – `;
    const rawSessionAck = (student.examSession || '').replace(/\s*[\-\–:]?\s*(?:BEFORE|AFTER)?\s*REVALUATION.*/i, '').trim();
    const examTextPrefix = rawSessionAck ? `${rawSessionAck} end Semester exam` : 'end Semester exam';
    renderJustifiedLine([
      { text: `${examTextPrefix} and ${ayStrAck}Continuous Internal Evaluation`, bold: false }
    ], p2Y);

    p2Y += 15;
    // Paragraph Line 4 (Last Line - Left Aligned)
    pdf.setFont('times', 'normal');
    pdf.setFontSize(10.5);
    pdf.text('Results have been received.', margin, p2Y);

    p2Y += 34;
    pdf.setFont('times', 'bold');
    pdf.setFontSize(10.5);
    pdf.text('Signature of the Parent', pageWidth - margin, p2Y, { align: 'right' });

    p2Y += 20;
    pdf.setFont('times', 'normal');
    pdf.setFontSize(10.5);
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
