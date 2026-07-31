export interface SubjectResult {
  sem: string;
  code: string;
  title: string;
  grade: string;
  passFail: 'PASS' | 'FAIL';
}

export interface InternalEvalResult {
  sem: string;
  code: string;
  title: string;
  cie1Marks: number;
  passFail: 'PASS' | 'FAIL';
}

export interface StudentRecord {
  id: string;
  regNo: string;
  name: string;
  department: string;
  regulation: string;
  universityResults: SubjectResult[];
  gpa: number;
  cgpa: number;
  classObtained: string;
  arrears: {
    '01': number | string;
    '02': number | string;
    '03': number | string;
    '04': number | string;
    '05': number | string;
    '06': number | string;
    '07': number | string;
  };
  gpaBySem: {
    '01': number | string;
    '02': number | string;
    '03': number | string;
    '04': number | string;
    '05': number | string;
    '06': number | string;
    '07': number | string;
  };
  cgpaBySem: {
    '01': number | string;
    '02': number | string;
    '03': number | string;
    '04': number | string;
    '05': number | string;
    '06': number | string;
    '07': number | string;
  };
  internalEvalResults: InternalEvalResult[];
}

export interface UploadSummary {
  fileName: string;
  fileSize: string;
  department: string;
  academicYear: string;
  totalStudents: number;
  subjectsPerStudent: number;
  reportsCount: number;
  templateUsed: string;
  uploadedDate: string;
  status: 'Ready for Download' | 'Processing' | 'Idle' | 'Error';
}

export interface SystemStats {
  totalStudents: number;
  reportsGenerated: number;
  pdfPages: number;
  department: string;
  academicYear: string;
  uploadStatus: string;
}
