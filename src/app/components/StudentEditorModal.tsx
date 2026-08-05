import React, { useState } from 'react';
import { X, Save, Edit3, User, BookOpen, FileCheck } from 'lucide-react';
import { StudentRecord, SubjectResult, InternalEvalResult } from '../types';

interface StudentEditorModalProps {
  student: StudentRecord;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedStudent: StudentRecord) => void;
}

export const StudentEditorModal: React.FC<StudentEditorModalProps> = ({
  student,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(student.name);
  const [regNo, setRegNo] = useState(student.regNo);
  const [department, setDepartment] = useState(student.department || 'Computer Science and Engineering');
  const [regulation, setRegulation] = useState(student.regulation || '2021');
  const [gpa, setGpa] = useState<string>(student.gpa !== undefined ? String(student.gpa) : '7.50');
  const [cgpa, setCgpa] = useState<string>(student.cgpa !== undefined ? String(student.cgpa) : '7.38');
  const [classObtained, setClassObtained] = useState(student.classObtained || 'FIRST CLASS');

  const [univResults, setUnivResults] = useState<SubjectResult[]>(student.universityResults || []);
  const [internalResults, setInternalResults] = useState<InternalEvalResult[]>(student.internalEvalResults || []);

  const handleUnivGradeChange = (index: number, newGrade: string) => {
    const updated = [...univResults];
    updated[index] = {
      ...updated[index],
      grade: newGrade.toUpperCase(),
      passFail: ['RA', 'F', 'FAIL', 'AB', 'U'].includes(newGrade.toUpperCase()) ? 'FAIL' : 'PASS',
    };
    setUnivResults(updated);
  };

  const handleInternalMarkChange = (
    index: number,
    field: 'cie1Marks' | 'cie2Marks' | 'modelMarks',
    val: string
  ) => {
    const updated = [...internalResults];
    const num = val === '' ? '' : Number(val);
    updated[index] = {
      ...updated[index],
      [field]: num,
    };
    setInternalResults(updated);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...student,
      name,
      regNo,
      department,
      regulation,
      gpa,
      cgpa,
      classObtained,
      universityResults: univResults,
      internalEvalResults: internalResults,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center border border-blue-400/30">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight">Edit Student Record</h3>
              <p className="text-[11px] text-blue-200/80 font-mono">In-Memory Edit • Reg: {regNo}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Section 1: Basic Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-extrabold text-blue-950 uppercase tracking-wider border-b border-slate-100 pb-2">
              <User className="w-4 h-4 text-blue-600" />
              <span>Basic Information</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Student Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Register Number</label>
                <input
                  type="text"
                  value={regNo}
                  onChange={(e) => setRegNo(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-semibold font-mono bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Regulation</label>
                <input
                  type="text"
                  value={regulation}
                  onChange={(e) => setRegulation(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-semibold font-mono bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Performance & Academic Overall */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-extrabold text-blue-950 uppercase tracking-wider border-b border-slate-100 pb-2">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>Overall Academic Performance</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">GPA (Sem 5)</label>
                <input
                  type="text"
                  value={gpa}
                  onChange={(e) => setGpa(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-bold font-mono bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">CGPA</label>
                <input
                  type="text"
                  value={cgpa}
                  onChange={(e) => setCgpa(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-bold font-mono bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Class Obtained</label>
                <select
                  value={classObtained}
                  onChange={(e) => setClassObtained(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                >
                  <option value="FIRST CLASS WITH DISTINCTION">FIRST CLASS WITH DISTINCTION</option>
                  <option value="FIRST CLASS">FIRST CLASS</option>
                  <option value="SECOND CLASS">SECOND CLASS</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Subject Grades & Internal Marks */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-extrabold text-blue-950 uppercase tracking-wider border-b border-slate-100 pb-2">
              <BookOpen className="w-4 h-4 text-purple-600" />
              <span>Subject Grades & Internal Marks</span>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-700 font-extrabold text-[11px]">
                    <th className="p-3 border-b border-slate-200">Code</th>
                    <th className="p-3 border-b border-slate-200">Title</th>
                    <th className="p-3 border-b border-slate-200 w-24">Univ Grade</th>
                    <th className="p-3 border-b border-slate-200 w-20">CIE 1</th>
                    <th className="p-3 border-b border-slate-200 w-20">CIE 2</th>
                    <th className="p-3 border-b border-slate-200 w-20">Model</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {univResults.map((sub, idx) => {
                    const ie = internalResults[idx] || { cie1Marks: 80, cie2Marks: 82, modelMarks: 84 };
                    return (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-2.5 font-bold font-mono text-blue-950">{sub.code}</td>
                        <td className="p-2.5 font-medium text-slate-600 truncate max-w-[180px]">{sub.title}</td>
                        <td className="p-2.5">
                          <input
                            type="text"
                            value={sub.grade}
                            onChange={(e) => handleUnivGradeChange(idx, e.target.value)}
                            className="w-16 px-2 py-1 text-center font-black font-mono bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white"
                          />
                        </td>
                        <td className="p-2.5">
                          <input
                            type="number"
                            value={ie.cie1Marks !== undefined ? ie.cie1Marks : ''}
                            onChange={(e) => handleInternalMarkChange(idx, 'cie1Marks', e.target.value)}
                            className="w-14 px-2 py-1 text-center font-bold font-mono bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white"
                          />
                        </td>
                        <td className="p-2.5">
                          <input
                            type="number"
                            value={ie.cie2Marks !== undefined ? ie.cie2Marks : ''}
                            onChange={(e) => handleInternalMarkChange(idx, 'cie2Marks', e.target.value)}
                            className="w-14 px-2 py-1 text-center font-bold font-mono bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white"
                          />
                        </td>
                        <td className="p-2.5">
                          <input
                            type="number"
                            value={ie.modelMarks !== undefined ? ie.modelMarks : ''}
                            onChange={(e) => handleInternalMarkChange(idx, 'modelMarks', e.target.value)}
                            className="w-14 px-2 py-1 text-center font-bold font-mono bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal Footer Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-extrabold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
