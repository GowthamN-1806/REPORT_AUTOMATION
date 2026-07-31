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
  PageBreak,
} from 'docx';
import { StudentRecord } from '../types';

export const generateCombinedWordDocument = async (students: StudentRecord[]): Promise<void> => {
  const docChildren: (Paragraph | Table)[] = [];

  students.forEach((student, index) => {
    // PAGE 1: Header
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [
          new TextRun({
            text: 'JEPPIAAR INSTITUTE OF TECHNOLOGY',
            bold: true,
            size: 28, // 14pt
            color: '0284C7',
            font: 'Arial',
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 40 },
        children: [
          new TextRun({
            text: '"Self Belief, Self Discipline, Self Respect"',
            italic: true,
            bold: true,
            size: 20,
            color: '0369A1',
            font: 'Georgia',
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 180 },
        children: [
          new TextRun({
            text: '( AN AUTONOMOUS INSTITUTION )',
            bold: true,
            size: 16,
            color: 'DC2626',
            font: 'Arial',
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { after: 60 },
        children: [
          new TextRun({
            text: 'Greetings from Jeppiaar Institute of Technology,',
            size: 22,
            font: 'Times New Roman',
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: 'This is to inform you that the results of the Semester End Examination held during ',
            size: 22,
            font: 'Times New Roman',
          }),
          new TextRun({
            text: 'Nov/Dec 2025 ',
            bold: true,
            size: 22,
            font: 'Times New Roman',
          }),
          new TextRun({
            text: 'have been released.',
            size: 22,
            font: 'Times New Roman',
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { after: 80 },
        children: [
          new TextRun({
            text: `Regulation:${student.regulation || '2021/2024'}`,
            bold: true,
            size: 22,
            font: 'Times New Roman',
          }),
        ],
      })
    );

    // Register Number & Name Table
    const studentInfoTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Register number:', bold: true, size: 20 })] })],
              width: { size: 40, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: student.regNo, size: 20 })] })],
              width: { size: 60, type: WidthType.PERCENTAGE },
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Name of the Student:', bold: true, size: 20 })] })],
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: student.name, bold: true, size: 20 })] })],
            }),
          ],
        }),
      ],
    });
    docChildren.push(studentInfoTable);

    // University Results Table
    const univHeaderRow = new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Semester', bold: true, size: 20 })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Subject Code', bold: true, size: 20 })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Subject Name', bold: true, size: 20 })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Grade', bold: true, size: 20 })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Pass/Fail', bold: true, size: 20 })] })] }),
      ],
    });

    const univRows = (student.universityResults || []).map((sub) => {
      return new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ text: sub.sem })] }),
          new TableCell({ children: [new Paragraph({ text: sub.code })] }),
          new TableCell({ children: [new Paragraph({ text: sub.title })] }),
          new TableCell({ children: [new Paragraph({ text: sub.grade })] }),
          new TableCell({ children: [new Paragraph({ text: sub.passFail })] }),
        ],
      });
    });



    docChildren.push(
      new Paragraph({ spacing: { before: 120 } }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [univHeaderRow, ...univRows],
      })
    );

    // University Results Text
    docChildren.push(
      new Paragraph({
        spacing: { before: 140, after: 60 },
        children: [
          new TextRun({
            text: 'Nov/Dec 2025 University Results:-',
            bold: true,
            size: 22,
            font: 'Times New Roman',
          }),
        ],
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [
          new TextRun({
            text: 'GPA/CGPA:-',
            bold: true,
            size: 22,
            font: 'Times New Roman',
          }),
        ],
      })
    );

    // GPA/CGPA Matrix Table
    const getVal = (map: Record<string, any> | undefined, key: string, fallback: string) => {
      if (!map) return fallback;
      const v = map[key] || map[key.replace(/^0/, '')];
      return v !== undefined && v !== null && v !== '' ? String(v) : fallback;
    };

    const matrixHeader = new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'SEMESTER', bold: true, size: 18 })] })] }),
        new TableCell({ children: [new Paragraph({ text: '01' })] }),
        new TableCell({ children: [new Paragraph({ text: '02' })] }),
        new TableCell({ children: [new Paragraph({ text: '03' })] }),
        new TableCell({ children: [new Paragraph({ text: '04' })] }),
        new TableCell({ children: [new Paragraph({ text: '05' })] }),
        new TableCell({ children: [new Paragraph({ text: '06' })] }),
        new TableCell({ children: [new Paragraph({ text: '07' })] }),
      ],
    });

    const matrixRows = [
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'ARREARS', bold: true, size: 18 })] })] }),
          ...['01', '02', '03', '04', '05', '06', '07'].map((sem) =>
            new TableCell({ children: [new Paragraph({ text: getVal(student.arrears, sem, '0') })] })
          ),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'GPA', bold: true, size: 18 })] })] }),
          ...['01', '02', '03', '04', '05', '06', '07'].map((sem) =>
            new TableCell({ children: [new Paragraph({ text: getVal(student.gpaBySem, sem, sem === '05' ? String(student.gpa) : '-') })] })
          ),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'CGPA', bold: true, size: 18 })] })] }),
          ...['01', '02', '03', '04', '05', '06', '07'].map((sem) =>
            new TableCell({ children: [new Paragraph({ text: getVal(student.cgpaBySem, sem, sem === '05' ? String(student.cgpa) : '-') })] })
          ),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'CLASS OBTAINED', bold: true, size: 18 })] })] }),
          new TableCell({
            columnSpan: 7,
            children: [new Paragraph({ children: [new TextRun({ text: student.classObtained || 'FIRST CLASS', bold: true })] })],
          }),
        ],
      }),
    ];

    docChildren.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [matrixHeader, ...matrixRows],
      })
    );

    // Continuous Internal Evaluation Header
    docChildren.push(
      new Paragraph({
        spacing: { before: 140, after: 80 },
        children: [
          new TextRun({
            text: 'Academic Year 2025-2026- Even Sem- Continuous Internal Evaluation Results:',
            bold: true,
            size: 22,
            font: 'Times New Roman',
          }),
        ],
      })
    );

    // Continuous Internal Evaluation Table
    const cieHeaderRow = new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Semester', bold: true, size: 20 })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Subject Code', bold: true, size: 20 })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Subject Name', bold: true, size: 20 })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'CIE I Marks', bold: true, size: 20 })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Pass/Fail', bold: true, size: 20 })] })] }),
      ],
    });

    const cieRows = (student.internalEvalResults || []).map((sub) => {
      return new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ text: sub.sem })] }),
          new TableCell({ children: [new Paragraph({ text: sub.code })] }),
          new TableCell({ children: [new Paragraph({ text: sub.title })] }),
          new TableCell({ children: [new Paragraph({ text: String(sub.cie1Marks) })] }),
          new TableCell({ children: [new Paragraph({ text: sub.passFail })] }),
        ],
      });
    });



    docChildren.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [cieHeaderRow, ...cieRows],
      }),
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 200 },
        children: [
          new TextRun({
            text: 'Signature of Counsellor',
            bold: true,
            size: 22,
            font: 'Times New Roman',
          }),
        ],
      })
    );

    // PAGE BREAK -> PAGE 2 ACKNOWLEDGEMENT
    docChildren.push(new Paragraph({ children: [new PageBreak()] }));

    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: 'ACKNOWLEDGEMENT',
            bold: true,
            size: 24,
            font: 'Arial',
          }),
        ],
      }),
      new Paragraph({
        spacing: { after: 100 },
        children: [
          new TextRun({
            text: 'To',
            size: 22,
            font: 'Times New Roman',
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        children: [
          new TextRun({
            text: `The Class Counsellor, Department of ${student.department || 'Computer Science and Engineering'} ,`,
            bold: true,
            size: 22,
            font: 'Times New Roman',
          }),
        ],
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: 'Jeppiaar Institute of Technology, Kunnam, Sunguvarchatram, Sriperumbudur (T.K), Chennai - 631604.',
            size: 22,
            font: 'Times New Roman',
          }),
        ],
      }),
      new Paragraph({
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: `Progress report of my Son / Daughter Name: `,
            size: 22,
            font: 'Times New Roman',
          }),
          new TextRun({
            text: `${student.name} – Reg. ${student.regNo}`,
            bold: true,
            size: 22,
            font: 'Times New Roman',
          }),
          new TextRun({
            text: ` for Nov/Dec 2025 end Semester exam and 2025-2026 AY – Even Sem- Continuous Internal Evaluation Results have been received.`,
            size: 22,
            font: 'Times New Roman',
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 240, after: 100 },
        children: [
          new TextRun({
            text: 'Signature of the Parent',
            bold: true,
            size: 22,
            font: 'Times New Roman',
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: 'Date:',
            bold: true,
            size: 22,
            font: 'Times New Roman',
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 180 },
        children: [
          new TextRun({
            text: 'JIT/EXAM/FORM-09-b',
            bold: true,
            size: 20,
            font: 'Arial',
          }),
        ],
      })
    );

    // Page break if not last student
    if (index < students.length - 1) {
      docChildren.push(new Paragraph({ children: [new PageBreak()] }));
    }
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: docChildren,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `JEPPIAAR_IT_PARENTS_Mark_Reports_Combined.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
