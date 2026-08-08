import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  PageBreak,
  ImageRun,
  TableBorders,
  VerticalAlign,
} from 'docx';
import { StudentRecord } from '../types';

// Helper to fetch logo images as Uint8Array safely
const fetchLogoBuffer = async (url: string): Promise<Uint8Array | null> => {
  try {
    const res = await fetch(url);
    if (res.ok) {
      const buf = await res.arrayBuffer();
      if (buf && buf.byteLength > 0) {
        return new Uint8Array(buf);
      }
    }
  } catch (e) {
    console.warn(`Failed to fetch logo from ${url}:`, e);
  }
  return null;
};

// Helper to resolve numeric semester (1..7)
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

// Helper for semester matrix values
const getSemValue = (map: Record<string, any> | undefined, semKey: string, fallback: string): string => {
  if (!map) return fallback;
  const val = map[semKey] || map[semKey.replace(/^0/, '')];
  return val !== undefined && val !== null && String(val).trim() !== '' ? String(val) : fallback;
};

// Standard table border style
const thinBorders: TableBorders = {
  top: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
  left: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
  right: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
  insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
  insideVertical: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
};

/**
 * Builds all section children (Paragraphs & Tables) for a single student report
 * matching the Live Preview / PDF structure exactly.
 */
const buildStudentReportChildren = (
  student: StudentRecord,
  regulation: string = '2021',
  logos: { jit: Uint8Array | null; naac: Uint8Array | null; nba: Uint8Array | null },
  isFirstStudent: boolean = true
): (Paragraph | Table)[] => {
  const children: (Paragraph | Table)[] = [];

  if (!isFirstStudent) {
    children.push(
      new Paragraph({
        children: [new PageBreak()],
      })
    );
  }

  // ----------------------------------------------------
  // PAGE 1: MARKS REPORT & EVALUATION
  // ----------------------------------------------------

  // Header Logos & Title Table (3 columns: Left Logo, Center Titles, Right Logos)
  const headerCells: TableCell[] = [];

  // Left Cell: JEPPIAAR Logo
  const leftChildren: Paragraph[] = [];
  if (logos.jit) {
    leftChildren.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        children: [
          new ImageRun({
            data: logos.jit,
            transformation: { width: 50, height: 58 },
            type: 'png',
          }),
        ],
      })
    );
  }
  if (leftChildren.length === 0) {
    leftChildren.push(new Paragraph({ children: [] }));
  }

  headerCells.push(
    new TableCell({
      width: { size: 1400, type: WidthType.DXA },
      borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
      children: leftChildren,
      verticalAlign: VerticalAlign.CENTER,
    })
  );

  // Center Cell: College Titles
  headerCells.push(
    new TableCell({
      width: { size: 6600, type: WidthType.DXA },
      borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 20 },
          children: [
            new TextRun({
              text: 'JEPPIAAR INSTITUTE OF TECHNOLOGY',
              bold: true,
              size: 26, // 13pt
              color: '0284C7',
              font: 'Arial',
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 20 },
          children: [
            new TextRun({
              text: '"Self Belief, Self Discipline, Self Respect"',
              bold: true,
              italics: true,
              size: 19, // 9.5pt
              color: '0369A1',
              font: 'Times New Roman',
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 40 },
          children: [
            new TextRun({
              text: '( AN AUTONOMOUS INSTITUTION )',
              bold: true,
              size: 17, // 8.5pt
              color: 'DC2626',
              font: 'Arial',
            }),
          ],
        }),
      ],
      verticalAlign: VerticalAlign.CENTER,
    })
  );

  // Right Cell: NAAC & NBA Logos
  const rightChildren: Paragraph[] = [];
  const rightRuns: ImageRun[] = [];
  if (logos.naac) {
    rightRuns.push(
      new ImageRun({
        data: logos.naac,
        transformation: { width: 42, height: 46 },
        type: 'png',
      })
    );
  }
  if (logos.nba) {
    rightRuns.push(
      new ImageRun({
        data: logos.nba,
        transformation: { width: 50, height: 42 },
        type: 'png',
      })
    );
  }
  rightChildren.push(
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: rightRuns,
    })
  );
  if (rightChildren.length === 0) {
    rightChildren.push(new Paragraph({ children: [] }));
  }

  headerCells.push(
    new TableCell({
      width: { size: 1400, type: WidthType.DXA },
      borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
      children: rightChildren,
      verticalAlign: VerticalAlign.CENTER,
    })
  );

  children.push(
    new Table({
      width: { size: 9400, type: WidthType.DXA },
      rows: [new TableRow({ children: headerCells })],
    })
  );

  // Spacing
  children.push(
    new Paragraph({
      spacing: { before: 100, after: 40 },
      children: [
        new TextRun({
          text: 'Greetings from Jeppiaar Institute of Technology,',
          font: 'Times New Roman',
          size: 21, // 10.5pt
        }),
      ],
    })
  );

  // Context Paragraph & Regulation
  children.push(
    new Paragraph({
      spacing: { before: 0, after: 60 },
      children: [
        new TextRun({
          text: 'This is to inform you that the results of the Semester End Examination held during ',
          font: 'Times New Roman',
          size: 20, // 10pt
        }),
        new TextRun({
          text: 'Nov/Dec',
          bold: true,
          font: 'Times New Roman',
          size: 20,
        }),
        new TextRun({
          text: ' 2025 have been released.',
          font: 'Times New Roman',
          size: 20,
        }),
      ],
    })
  );

  children.push(
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { before: 0, after: 100 },
      children: [
        new TextRun({
          text: `Regulation: ${regulation || '2021'}`,
          bold: true,
          font: 'Times New Roman',
          size: 20,
        }),
      ],
    })
  );

  // Table 1: Register Number & Student Name
  children.push(
    new Table({
      width: { size: 9400, type: WidthType.DXA },
      borders: thinBorders,
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 2800, type: WidthType.DXA },
              children: [
                new Paragraph({
                  spacing: { before: 40, after: 40 },
                  children: [new TextRun({ text: 'Register number:', font: 'Times New Roman', size: 20 })],
                }),
              ],
            }),
            new TableCell({
              width: { size: 6600, type: WidthType.DXA },
              children: [
                new Paragraph({
                  spacing: { before: 40, after: 40 },
                  children: [new TextRun({ text: student.regNo || '', bold: true, font: 'Times New Roman', size: 20 })],
                }),
              ],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              width: { size: 2800, type: WidthType.DXA },
              children: [
                new Paragraph({
                  spacing: { before: 40, after: 40 },
                  children: [new TextRun({ text: 'Name of the Student:', font: 'Times New Roman', size: 20 })],
                }),
              ],
            }),
            new TableCell({
              width: { size: 6600, type: WidthType.DXA },
              children: [
                new Paragraph({
                  spacing: { before: 40, after: 40 },
                  children: [new TextRun({ text: student.name || '', bold: true, font: 'Times New Roman', size: 20 })],
                }),
              ],
            }),
          ],
        }),
      ],
    })
  );

  children.push(new Paragraph({ spacing: { before: 0, after: 120 }, children: [] }));

  // Table 2: University Results Table
  const univList = student.universityResults || [];
  const univRows: TableRow[] = [];

  // Header Row
  univRows.push(
    new TableRow({
      children: [
        new TableCell({ width: { size: 1200, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Semester', bold: true, font: 'Times New Roman', size: 20 })] })] }),
        new TableCell({ width: { size: 1800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Subject Code', bold: true, font: 'Times New Roman', size: 20 })] })] }),
        new TableCell({ width: { size: 4000, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: 'Subject Name', bold: true, font: 'Times New Roman', size: 20 })] })] }),
        new TableCell({ width: { size: 1200, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Grade', bold: true, font: 'Times New Roman', size: 20 })] })] }),
        new TableCell({ width: { size: 1200, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Pass/Fail', bold: true, font: 'Times New Roman', size: 20 })] })] }),
      ],
    })
  );

  univList.forEach((item) => {
    univRows.push(
      new TableRow({
        children: [
          new TableCell({ width: { size: 1200, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: item.sem || 'IV', font: 'Times New Roman', size: 19 })] })] }),
          new TableCell({ width: { size: 1800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: item.code || '', bold: true, font: 'Times New Roman', size: 19 })] })] }),
          new TableCell({ width: { size: 4000, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: item.title || '', font: 'Times New Roman', size: 19 })] })] }),
          new TableCell({ width: { size: 1200, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: item.grade || '', bold: true, font: 'Times New Roman', size: 19 })] })] }),
          new TableCell({ width: { size: 1200, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: item.passFail || '', bold: true, font: 'Times New Roman', size: 19 })] })] }),
        ],
      })
    );
  });

  children.push(
    new Table({
      width: { size: 9400, type: WidthType.DXA },
      borders: thinBorders,
      rows: univRows,
    })
  );

  // Section Header: University Results & GPA Matrix
  children.push(
    new Paragraph({
      spacing: { before: 120, after: 40 },
      children: [
        new TextRun({
          text: 'Nov/Dec 2025 University Results:-',
          bold: true,
          font: 'Times New Roman',
          size: 21,
        }),
      ],
    })
  );

  children.push(
    new Paragraph({
      spacing: { before: 0, after: 60 },
      children: [
        new TextRun({
          text: 'GPA/CGPA:-',
          bold: true,
          font: 'Times New Roman',
          size: 21,
        }),
      ],
    })
  );

  // Table 3: GPA & CGPA Summary Matrix Table
  const activeSemNum = getSemesterNumber(student.semester) ||
                       getSemesterNumber(student.universityResults?.[0]?.sem) ||
                       4;

  const matrixColsW = [2400, 1000, 1000, 1000, 1000, 1000, 1000, 1000];

  // Header Row: SEMESTER | 01 | 02 | 03 | 04 | 05 | 06 | 07
  const mHeadCells: TableCell[] = [
    new TableCell({ width: { size: matrixColsW[0], type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: 'SEMESTER', bold: true, font: 'Times New Roman', size: 20 })] })] }),
  ];
  for (let c = 1; c <= 7; c++) {
    mHeadCells.push(
      new TableCell({
        width: { size: matrixColsW[c], type: WidthType.DXA },
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `0${c}`, bold: true, font: 'Times New Roman', size: 20 })] })],
      })
    );
  }

  // Row 1: ARREARS
  const arrCells: TableCell[] = [
    new TableCell({ width: { size: matrixColsW[0], type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: 'ARREARS', bold: true, font: 'Times New Roman', size: 20 })] })] }),
  ];
  for (let c = 1; c <= 7; c++) {
    const val = getSemValue(student.arrears, `0${c}`, '');
    arrCells.push(
      new TableCell({
        width: { size: matrixColsW[c], type: WidthType.DXA },
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(val), font: 'Times New Roman', size: 19 })] })],
      })
    );
  }

  // Row 2: GPA
  const gpaCells: TableCell[] = [
    new TableCell({ width: { size: matrixColsW[0], type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: 'GPA', bold: true, font: 'Times New Roman', size: 20 })] })] }),
  ];
  for (let c = 1; c <= 7; c++) {
    const val = getSemValue(student.gpaBySem, `0${c}`, c === activeSemNum && student.gpa !== undefined ? String(student.gpa) : '');
    gpaCells.push(
      new TableCell({
        width: { size: matrixColsW[c], type: WidthType.DXA },
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(val), font: 'Times New Roman', size: 19 })] })],
      })
    );
  }

  // Row 3: CGPA
  const cgpaCells: TableCell[] = [
    new TableCell({ width: { size: matrixColsW[0], type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: 'CGPA', bold: true, font: 'Times New Roman', size: 20 })] })] }),
  ];
  for (let c = 1; c <= 7; c++) {
    const val = getSemValue(student.cgpaBySem, `0${c}`, c === activeSemNum && student.cgpa !== undefined ? String(student.cgpa) : '');
    cgpaCells.push(
      new TableCell({
        width: { size: matrixColsW[c], type: WidthType.DXA },
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(val), font: 'Times New Roman', size: 19 })] })],
      })
    );
  }

  // Row 4: CLASS OBTAINED
  const classRowCells: TableCell[] = [
    new TableCell({ width: { size: 2400, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: 'CLASS OBTAINED', bold: true, font: 'Times New Roman', size: 18 })] })] }),
    new TableCell({ width: { size: 7000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: student.classObtained || '', font: 'Times New Roman', size: 20 })] })] }),
  ];

  children.push(
    new Table({
      width: { size: 9400, type: WidthType.DXA },
      borders: thinBorders,
      rows: [
        new TableRow({ children: mHeadCells }),
        new TableRow({ children: arrCells }),
        new TableRow({ children: gpaCells }),
        new TableRow({ children: cgpaCells }),
        new TableRow({ children: classRowCells }),
      ],
    })
  );

  // Internal Evaluation Header
  children.push(
    new Paragraph({
      spacing: { before: 140, after: 40 },
      children: [
        new TextRun({
          text: 'Academic Year 2025-2026- Even Sem- Continuous Internal Evaluation Results:',
          bold: true,
          font: 'Times New Roman',
          size: 21,
        }),
      ],
    })
  );

  // Table 4: Internal Evaluation Marks Table
  const cieList = student.internalEvalResults || [];
  const hasCie2 = cieList.some((item) => item && item.cie2Marks !== undefined && item.cie2Marks !== null && String(item.cie2Marks).trim() !== '');
  const hasModel = cieList.some((item) => item && item.modelMarks !== undefined && item.modelMarks !== null && String(item.modelMarks).trim() !== '');

  let colW2 = [1200, 1600, 4200, 1200, 1200];
  if (hasModel) {
    colW2 = [1000, 1400, 3400, 1200, 1200, 1200, 1000];
  } else if (hasCie2) {
    colW2 = [1100, 1500, 3800, 1000, 1000, 1000];
  }

  const cieRows: TableRow[] = [];

  // CIE Table Header
  const cieHeadCells: TableCell[] = [
    new TableCell({ width: { size: colW2[0], type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Semester', bold: true, font: 'Times New Roman', size: 19 })] })] }),
    new TableCell({ width: { size: colW2[1], type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Subject Code', bold: true, font: 'Times New Roman', size: 19 })] })] }),
    new TableCell({ width: { size: colW2[2], type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: 'Subject Name', bold: true, font: 'Times New Roman', size: 19 })] })] }),
    new TableCell({ width: { size: colW2[3], type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'CIE I Marks', bold: true, font: 'Times New Roman', size: 19 })] })] }),
  ];

  if (hasCie2 || hasModel) {
    cieHeadCells.push(new TableCell({ width: { size: colW2[4], type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'CIE II Marks', bold: true, font: 'Times New Roman', size: 19 })] })] }));
  }
  if (hasModel) {
    cieHeadCells.push(new TableCell({ width: { size: colW2[5], type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Model Marks', bold: true, font: 'Times New Roman', size: 19 })] })] }));
  }
  const pfIdx = hasModel ? 6 : (hasCie2 ? 5 : 4);
  cieHeadCells.push(new TableCell({ width: { size: colW2[pfIdx], type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Pass/Fail', bold: true, font: 'Times New Roman', size: 19 })] })] }));

  cieRows.push(new TableRow({ children: cieHeadCells }));

  cieList.forEach((item) => {
    const c1 = item.cie1Marks !== undefined && item.cie1Marks !== null ? String(item.cie1Marks) : '';
    const c2 = item.cie2Marks !== undefined && item.cie2Marks !== null ? String(item.cie2Marks) : '';
    const cm = item.modelMarks !== undefined && item.modelMarks !== null ? String(item.modelMarks) : '';

    const rowCells: TableCell[] = [
      new TableCell({ width: { size: colW2[0], type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: item.sem || student.currentSemester || 'IV', font: 'Times New Roman', size: 18 })] })] }),
      new TableCell({ width: { size: colW2[1], type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: item.code || '', bold: true, font: 'Times New Roman', size: 18 })] })] }),
      new TableCell({ width: { size: colW2[2], type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: item.title || '', font: 'Times New Roman', size: 18 })] })] }),
      new TableCell({ width: { size: colW2[3], type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: c1, bold: true, font: 'Times New Roman', size: 18 })] })] }),
    ];

    if (hasCie2 || hasModel) {
      rowCells.push(new TableCell({ width: { size: colW2[4], type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: c2, bold: true, font: 'Times New Roman', size: 18 })] })] }));
    }
    if (hasModel) {
      rowCells.push(new TableCell({ width: { size: colW2[5], type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: cm, bold: true, font: 'Times New Roman', size: 18 })] })] }));
    }

    rowCells.push(new TableCell({ width: { size: colW2[pfIdx], type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: item.passFail || '', bold: true, font: 'Times New Roman', size: 18 })] })] }));

    cieRows.push(new TableRow({ children: rowCells }));
  });

  children.push(
    new Table({
      width: { size: 9400, type: WidthType.DXA },
      borders: thinBorders,
      rows: cieRows,
    })
  );

  // Signature of Counsellor
  children.push(
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { before: 240, after: 120 },
      children: [
        new TextRun({
          text: 'Signature of Counsellor',
          bold: true,
          font: 'Times New Roman',
          size: 21,
        }),
      ],
    })
  );


  // ----------------------------------------------------
  // PAGE 2: ACKNOWLEDGEMENT & DEGREE CLASSIFICATION RULES
  // ----------------------------------------------------
  children.push(
    new Paragraph({
      children: [new PageBreak()],
    })
  );

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 120 },
      children: [
        new TextRun({
          text: 'ACKNOWLEDGEMENT',
          bold: true,
          font: 'Arial',
          size: 22,
        }),
      ],
    })
  );

  children.push(
    new Paragraph({
      spacing: { before: 40, after: 40 },
      children: [new TextRun({ text: 'To', font: 'Times New Roman', size: 20 })],
    })
  );

  const deptStr = student.department && student.department.trim() ? student.department.trim() : '';
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 40, after: 40 },
      children: [new TextRun({ text: `The Class Counsellor, Department of ${deptStr},`, font: 'Times New Roman', size: 20 })],
    })
  );

  children.push(
    new Paragraph({
      spacing: { before: 40, after: 120 },
      children: [new TextRun({ text: 'Jeppiaar Institute of Technology, Kunnam, Sunguvarchatram, Sriperumbudur (T.K), Chennai - 631604.', font: 'Times New Roman', size: 20 })],
    })
  );

  children.push(
    new Paragraph({
      spacing: { before: 60, after: 60 },
      children: [
        new TextRun({ text: 'Progress report of my Son / Daughter Name: ', font: 'Times New Roman', size: 20 }),
        new TextRun({ text: `${student.name || ''} – Reg. ${student.regNo || ''}`, bold: true, font: 'Times New Roman', size: 20 }),
        new TextRun({ text: ' for Nov/Dec 2025 end Semester exam and 2025-2026 AY – Even Sem- Continuous Internal Evaluation Results have been received.', font: 'Times New Roman', size: 20 }),
      ],
    })
  );

  children.push(
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { before: 200, after: 60 },
      children: [new TextRun({ text: 'Signature of the Parent', bold: true, font: 'Times New Roman', size: 20 })],
    })
  );

  // Date & JIT/EXAM/FORM-09-b Table
  children.push(
    new Table({
      width: { size: 9400, type: WidthType.DXA },
      borders: {
        top: { style: BorderStyle.NONE },
        bottom: { style: BorderStyle.NONE },
        left: { style: BorderStyle.NONE },
        right: { style: BorderStyle.NONE },
        insideHorizontal: { style: BorderStyle.NONE },
        insideVertical: { style: BorderStyle.NONE },
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 4700, type: WidthType.DXA },
              children: [new Paragraph({ children: [new TextRun({ text: 'Date:', font: 'Times New Roman', size: 20 })] })],
            }),
            new TableCell({
              width: { size: 4700, type: WidthType.DXA },
              children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'JIT/EXAM/FORM-09-b', bold: true, font: 'Arial', size: 19 })] })],
            }),
          ],
        }),
      ],
    })
  );

  children.push(
    new Paragraph({
      spacing: { before: 100, after: 100 },
      border: {
        bottom: { color: 'CBD5E1', space: 1, style: BorderStyle.SINGLE, size: 6 },
      },
      children: [],
    })
  );

  // Section 16.2 CLASSIFICATION OF THE DEGREE AWARDED
  children.push(
    new Paragraph({
      spacing: { before: 80, after: 40 },
      children: [new TextRun({ text: '16.2    CLASSIFICATION OF THE DEGREE AWARDED', bold: true, font: 'Arial', size: 19 })],
    })
  );

  children.push(
    new Paragraph({
      spacing: { before: 30, after: 30 },
      children: [new TextRun({ text: '16.2.1  FIRST CLASS WITH DISTINCTION', bold: true, font: 'Arial', size: 18 })],
    })
  );

  children.push(
    new Paragraph({
      spacing: { before: 20, after: 20 },
      children: [
        new TextRun({ text: 'A student who satisfies the following conditions shall be declared to have passed the examination in ', font: 'Times New Roman', size: 17 }),
        new TextRun({ text: 'First class with Distinction:', bold: true, font: 'Times New Roman', size: 17 }),
      ],
    })
  );

  children.push(
    new Paragraph({
      spacing: { before: 20, after: 20 },
      children: [
        new TextRun({ text: '• Should have passed the examination in all the courses of all the eight semesters (10 Semesters in case of Mechanical (Sandwich) and 6 semesters in the case of Lateral Entry) in the student\'s First Appearance within ', font: 'Times New Roman', size: 17 }),
        new TextRun({ text: 'five years', bold: true, font: 'Times New Roman', size: 17 }),
        new TextRun({ text: ' (Six years in the case of Mechanical (Sandwich) and Four years in the case of Lateral Entry). Withdrawal from examination (vide Clause 17) will not be considered as an appearance.', font: 'Times New Roman', size: 17 }),
      ],
    })
  );

  children.push(
    new Paragraph({
      spacing: { before: 20, after: 20 },
      children: [
        new TextRun({ text: '• Should have secured a CGPA of not less than ', font: 'Times New Roman', size: 17 }),
        new TextRun({ text: '8.50.', bold: true, font: 'Times New Roman', size: 17 }),
      ],
    })
  );

  children.push(
    new Paragraph({
      spacing: { before: 20, after: 20 },
      children: [
        new TextRun({ text: '• One year authorized break of study (if availed of) is included in the five years (Six years in the case of Mechanical (Sandwich) and four years in the case of Lateral entry) for award of First class with Distinction.', font: 'Times New Roman', size: 17 }),
      ],
    })
  );

  children.push(
    new Paragraph({
      spacing: { before: 20, after: 40 },
      children: [
        new TextRun({ text: '• Should NOT have been prevented from writing end semester examination due to lack of attendance in any semester.', font: 'Times New Roman', size: 17 }),
      ],
    })
  );

  children.push(
    new Paragraph({
      spacing: { before: 30, after: 30 },
      children: [new TextRun({ text: '16.2.2  FIRST CLASS:', bold: true, font: 'Arial', size: 18 })],
    })
  );

  children.push(
    new Paragraph({
      spacing: { before: 20, after: 20 },
      children: [
        new TextRun({ text: 'A student who satisfies the following conditions shall be declared to have passed the examination in ', font: 'Times New Roman', size: 17 }),
        new TextRun({ text: 'First class:', bold: true, font: 'Times New Roman', size: 17 }),
      ],
    })
  );

  children.push(
    new Paragraph({
      spacing: { before: 20, after: 20 },
      children: [
        new TextRun({ text: '• Should have passed the examination in all the courses of all eight semesters (10 Semesters in case of Mechanical (Sandwich) and 6 semesters in the case of Lateral Entry) ', font: 'Times New Roman', size: 17 }),
        new TextRun({ text: 'within five years.', bold: true, font: 'Times New Roman', size: 17 }),
      ],
    })
  );

  children.push(
    new Paragraph({
      spacing: { before: 20, after: 20 },
      children: [
        new TextRun({ text: '• One year authorized break of study (if availed of) or prevention from writing the End Semester examination due to lack of attendance (if applicable) is included in the duration of five years for award of First class.', font: 'Times New Roman', size: 17 }),
      ],
    })
  );

  children.push(
    new Paragraph({
      spacing: { before: 20, after: 40 },
      children: [
        new TextRun({ text: '• Should have secured a CGPA of not less than ', font: 'Times New Roman', size: 17 }),
        new TextRun({ text: '6.50.', bold: true, font: 'Times New Roman', size: 17 }),
      ],
    })
  );

  children.push(
    new Paragraph({
      spacing: { before: 30, after: 30 },
      children: [new TextRun({ text: '16.2.3  SECOND CLASS:', bold: true, font: 'Arial', size: 18 })],
    })
  );

  children.push(
    new Paragraph({
      spacing: { before: 20, after: 20 },
      children: [
        new TextRun({ text: 'All other students (not covered in clauses 16.2.1 and 16.2.2) who qualify for the award of the degree (vide Clause 16.1) shall be declared to have passed the examination in Second Class.', font: 'Times New Roman', size: 17 }),
      ],
    })
  );

  return children;
};

/**
 * Dynamically generates a single student Word (.docx) document without using any .docx template files.
 */
export const generateDynamicSingleWordDocument = async (
  student: StudentRecord,
  regulation: string = '2021'
): Promise<Blob> => {
  const jitLogo = await fetchLogoBuffer('/jit_logo.png');
  const naacLogo = await fetchLogoBuffer('/naac_logo.png');
  const nbaLogo = await fetchLogoBuffer('/nba_logo.png');

  const children = buildStudentReportChildren(student, regulation, { jit: jitLogo, naac: naacLogo, nba: nbaLogo }, true);

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
        },
        children,
      },
    ],
  });

  return await Packer.toBlob(doc);
};

/**
 * Dynamically generates a single combined Word (.docx) document containing ALL students.
 */
export const generateDynamicCombinedWordDocument = async (
  students: StudentRecord[],
  regulation: string = '2021'
): Promise<Blob> => {
  if (!students || students.length === 0) {
    throw new Error('No student data provided for Word document generation.');
  }

  const jitLogo = await fetchLogoBuffer('/jit_logo.png');
  const naacLogo = await fetchLogoBuffer('/naac_logo.png');
  const nbaLogo = await fetchLogoBuffer('/nba_logo.png');

  const allChildren: (Paragraph | Table)[] = [];

  students.forEach((student, idx) => {
    const studentChildren = buildStudentReportChildren(
      student,
      regulation,
      { jit: jitLogo, naac: naacLogo, nba: nbaLogo },
      idx === 0
    );
    allChildren.push(...studentChildren);
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
        },
        children: allChildren,
      },
    ],
  });

  return await Packer.toBlob(doc);
};
