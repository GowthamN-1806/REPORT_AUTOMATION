export interface SubjectResult {
  sem: string;
  code: string;
  title: string;
  grade: string;
  passFail: 'PASS' | 'FAIL' | '';
}

export interface InternalEvalResult {
  sem: string;
  code: string;
  title: string;
  cie1Marks: number | string;
  cie2Marks?: number | string;
  passFail: 'PASS' | 'FAIL' | '';
}

export interface StudentRecord {
  id: string;
  regNo: string;
  name: string;
  department: string;
  regulation: string;
  universityResults: SubjectResult[];
  gpa?: number | string;
  cgpa?: number | string;
  classObtained: string;
  arrears: Record<string, number | string>;
  gpaBySem: Record<string, number | string>;
  cgpaBySem: Record<string, number | string>;
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
