import { useState, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { Activity, Heart, Baby, Clock, DollarSign, FlaskConical, Plus, Trash2, Edit2, Save, X, Printer, ChevronRight, Search, SlidersHorizontal, ChevronDown, ArrowUpDown, AlertTriangle } from 'lucide-react';
import { ivfFailureData } from '../data/mockData';
import { useTheme } from '../ThemeContext';

const chartTabs = [
  { key: 'bpsugar', label: 'BP Sugar Chart', icon: Activity, color: '#3CC0D0' },
  { key: 'bp', label: 'Blood Pressure', icon: Heart, color: '#EF4444' },
  { key: 'kick', label: 'Kick Count', icon: Baby, color: '#F6C177' },
  { key: 'preterm', label: 'Preterm Labour', icon: Clock, color: '#8B5CF6' },
  { key: 'costing', label: 'Costing Sheet', icon: DollarSign, color: '#22C55E' },
  { key: 'ivf', label: 'IVF Failure', icon: FlaskConical, color: '#F59E0B' },
];

const patientOptions = [
  { id: 'P001', name: 'Aisha Mehta', gender: 'Female', age: 33 },
  { id: 'P005', name: 'Priya Nair', gender: 'Female', age: 30 },
  { id: 'P007', name: 'Deepa Pillai', gender: 'Female', age: 37 },
];

const initBpSugarRows = [
  { id: 1, date: '06/03/2026', beforeBreakfast: 88, afterBreakfast: 132, afterLunch: 145, afterDinner: 118, bp: '120/80' },
  { id: 2, date: '07/03/2026', beforeBreakfast: 92, afterBreakfast: 138, afterLunch: 150, afterDinner: 122, bp: '125/82' },
  { id: 3, date: '08/03/2026', beforeBreakfast: 86, afterBreakfast: 128, afterLunch: 140, afterDinner: 115, bp: '118/78' },
  { id: 4, date: '09/03/2026', beforeBreakfast: 95, afterBreakfast: 145, afterLunch: 158, afterDinner: 130, bp: '130/85' },
  { id: 5, date: '10/03/2026', beforeBreakfast: 89, afterBreakfast: 135, afterLunch: 148, afterDinner: 120, bp: '122/80' },
  { id: 6, date: '11/03/2026', beforeBreakfast: 84, afterBreakfast: 125, afterLunch: 138, afterDinner: 112, bp: '115/75' },
  { id: 7, date: '12/03/2026', beforeBreakfast: 87, afterBreakfast: 130, afterLunch: 142, afterDinner: 116, bp: '119/79' },
];
const initBpRows = [
  { id: 1, date: '06/03/2026', systolic: 120, diastolic: 80, pulse: 72, remarks: 'Normal' },
  { id: 2, date: '07/03/2026', systolic: 125, diastolic: 82, pulse: 74, remarks: 'Normal' },
  { id: 3, date: '08/03/2026', systolic: 118, diastolic: 78, pulse: 70, remarks: 'Normal' },
  { id: 4, date: '09/03/2026', systolic: 130, diastolic: 85, pulse: 78, remarks: 'Slightly elevated - monitor' },
  { id: 5, date: '10/03/2026', systolic: 122, diastolic: 80, pulse: 72, remarks: 'Normal' },
  { id: 6, date: '11/03/2026', systolic: 115, diastolic: 75, pulse: 68, remarks: 'Normal' },
  { id: 7, date: '12/03/2026', systolic: 119, diastolic: 79, pulse: 71, remarks: 'Normal' },
];
const initKickRows = [
  { id: 1, date: '06/03/2026', kickCount: 12, remarks: 'Active morning movements' },
  { id: 2, date: '07/03/2026', kickCount: 15, remarks: 'Good activity' },
  { id: 3, date: '08/03/2026', kickCount: 10, remarks: 'Minimum threshold met' },
  { id: 4, date: '09/03/2026', kickCount: 18, remarks: 'Very active today' },
  { id: 5, date: '10/03/2026', kickCount: 14, remarks: 'Normal' },
  { id: 6, date: '11/03/2026', kickCount: 16, remarks: 'Active evening movements' },
  { id: 7, date: '12/03/2026', kickCount: 13, remarks: 'Normal' },
];
const initPretermRows = [
  { id: 1, date: '06/03/2026', contractionCount: 2, duration: '20 sec', remarks: 'Braxton Hicks' },
  { id: 2, date: '07/03/2026', contractionCount: 3, duration: '25 sec', remarks: 'Mild, irregular' },
  { id: 3, date: '08/03/2026', contractionCount: 1, duration: '15 sec', remarks: 'Minimal activity' },
  { id: 4, date: '09/03/2026', contractionCount: 5, duration: '30 sec', remarks: 'Increased - advised rest' },
  { id: 5, date: '10/03/2026', contractionCount: 2, duration: '20 sec', remarks: 'Settled after rest' },
  { id: 6, date: '11/03/2026', contractionCount: 1, duration: '15 sec', remarks: 'Normal' },
  { id: 7, date: '12/03/2026', contractionCount: 3, duration: '25 sec', remarks: 'Mild' },
];
const initCostingRows = [
  { id: 1, item: 'IVF Base Package', quantity: 1, amount: 120000, total: 120000 },
  { id: 2, item: 'Medication - Stimulation', quantity: 1, amount: 45000, total: 45000 },
  { id: 3, item: 'Egg Retrieval (OPU)', quantity: 1, amount: 25000, total: 25000 },
  { id: 4, item: 'ICSI Procedure', quantity: 5, amount: 3000, total: 15000 },
  { id: 5, item: 'Embryo Transfer', quantity: 1, amount: 15000, total: 15000 },
  { id: 6, item: 'Cryopreservation', quantity: 3, amount: 5000, total: 15000 },
  { id: 7, item: 'Anesthesia', quantity: 1, amount: 8000, total: 8000 },
  { id: 8, item: 'Lab Tests & Scans', quantity: 1, amount: 12000, total: 12000 },
];
const initIvfRows = [
  { id: 1, testName: 'Karyotyping (Female)', result: 'Normal 46,XX', remarks: 'No chromosomal abnormality' },
  { id: 2, testName: 'Karyotyping (Male)', result: 'Normal 46,XY', remarks: 'No chromosomal abnormality' },
  { id: 3, testName: 'Thrombophilia Panel', result: 'MTHFR Mutation +', remarks: 'Low molecular weight heparin prescribed' },
  { id: 4, testName: 'NK Cell Activity', result: 'Elevated (18%)', remarks: 'Intralipid infusion recommended' },
  { id: 5, testName: 'Endometrial Receptivity Array', result: 'Pre-receptive', remarks: 'Window shifted by 24 hours' },
  { id: 6, testName: 'Sperm DNA Fragmentation', result: 'DFI: 22%', remarks: 'Antioxidant therapy for 3 months' },
];

function useEditableTable<T extends { id: number }>(initial: T[]) {
  const [rows, setRows] = useState<T[]>(initial);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editRow, setEditRow] = useState<T | null>(null);
  const startEdit = (row: T) => { setEditingId(row.id); setEditRow({ ...row }); };
  const cancelEdit = () => { setEditingId(null); setEditRow(null); };
  const saveEdit = () => { if (editRow) setRows(rows.map(r => r.id === editRow.id ? editRow : r)); setEditingId(null); setEditRow(null); };
  const deleteRow = (id: number) => setRows(rows.filter(r => r.id !== id));
  const addRow = (newRow: T) => setRows([...rows, newRow]);
  return { rows, editingId, editRow, setEditRow, startEdit, cancelEdit, saveEdit, deleteRow, addRow };
}

function EditCell({ value, onChange, type = 'text', darkMode }: { value: any; onChange: (v: any) => void; type?: string; darkMode?: boolean }) {
  return (
    <input type={type} value={value}
      onChange={e => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
      className="w-full px-2 py-1 rounded-lg text-xs outline-none"
      style={{ border: '1.5px solid #3CC0D0', background: darkMode ? 'rgba(60,192,208,0.1)' : '#EFF9FB', color: 'var(--acutix-text-primary)', fontFamily: 'Poppins', minWidth: '80px' }}
    />
  );
}

// LCNC Control Bar above tables
function ControlBar({ search, onSearch, onAddRow, onAddCol, onPrint, reportType }: {
  search: string; onSearch: (v: string) => void; onAddRow: () => void; onAddCol: () => void; onPrint: () => void;
  reportType: string;
}) {
  const { darkMode } = useTheme();
  const [showAddMenu, setShowAddMenu] = useState(false);

  return (
    <div className="rounded-xl p-3 mb-3 flex flex-wrap gap-2 items-center relative" style={{ background: 'var(--acutix-table-header-bg)', border: `1px solid var(--acutix-input-border)` }}>
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold" style={{ background: darkMode ? 'rgba(60,192,208,0.15)' : '#EFF9FB', color: '#3CC0D0' }}>
        <SlidersHorizontal size={12} /> {reportType}
      </div>
      <div className="relative flex-1 min-w-36">
        <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--acutix-text-muted)' }} />
        <input type="text" placeholder="Search records..." value={search} onChange={e => onSearch(e.target.value)}
          className="w-full pl-7 pr-2.5 py-1.5 rounded-lg text-xs outline-none"
          style={{ border: `1px solid var(--acutix-input-border)`, background: 'var(--acutix-input-bg)', color: 'var(--acutix-text-body)', fontFamily: 'Poppins' }} />
      </div>
      <div className="flex gap-2 ml-auto relative">
        <button onClick={onPrint} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
          style={{ background: 'var(--acutix-input-bg)', color: 'var(--acutix-text-secondary)', border: `1px solid var(--acutix-input-border)` }}>
          <Printer size={12} /> Print
        </button>
        <div className="relative">
          <button onClick={() => setShowAddMenu(!showAddMenu)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #1F2A5A, #3CC0D0)' }}>
            <Plus size={12} /> Add <ChevronDown size={12} className={`transition-transform ${showAddMenu ? 'rotate-180' : ''}`} />
          </button>
          {showAddMenu && (
            <div className="absolute right-0 top-full mt-1 w-32 rounded-xl py-1 z-50 shadow-lg" style={{ background: 'var(--acutix-card-bg)', border: '1px solid var(--acutix-input-border)' }}>
              <button className="w-full text-left px-3 py-2 text-xs hover:bg-black/5 transition-colors" style={{ color: 'var(--acutix-text-primary)' }} onClick={() => { onAddRow(); setShowAddMenu(false); }}>Add Row</button>
              <button className="w-full text-left px-3 py-2 text-xs hover:bg-black/5 transition-colors" style={{ color: 'var(--acutix-text-primary)' }} onClick={() => { onAddCol(); setShowAddMenu(false); }}>Add Column</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Delete Confirmation Modal
function DeleteModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="rounded-2xl w-full max-w-sm p-6 shadow-2xl" style={{ background: 'var(--acutix-card-bg)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#FEE2E2' }}>
            <AlertTriangle size={20} style={{ color: '#EF4444' }} />
          </div>
          <div>
            <h3 className="font-bold text-sm" style={{ color: 'var(--acutix-text-primary)' }}>Delete Record</h3>
            <p className="text-xs" style={{ color: 'var(--acutix-text-secondary)' }}>Are you sure you want to delete this report entry?</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2 rounded-xl text-sm font-medium border transition-colors"
            style={{ borderColor: 'var(--acutix-input-border)', color: 'var(--acutix-text-secondary)' }}>Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90"
            style={{ background: '#EF4444' }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

function RowActions({ isEditing, onEdit, onSave, onCancel, onDelete }: {
  isEditing: boolean; onEdit: () => void; onSave: () => void; onCancel: () => void; onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {isEditing ? (
        <>
          <button onClick={onSave} className="p-1.5 rounded-lg hover:bg-green-100 transition-colors" title="Save"><Save size={13} style={{ color: '#22C55E' }} /></button>
          <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" title="Cancel"><X size={13} style={{ color: '#9CA3AF' }} /></button>
        </>
      ) : (
        <>
          <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors" title="Edit"><Edit2 size={13} style={{ color: '#3CC0D0' }} /></button>
          <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors" title="Delete"><Trash2 size={13} style={{ color: '#EF4444' }} /></button>
        </>
      )}
    </div>
  );
}

function PatientEntryForm({ selectedPatient, setSelectedPatient }: { selectedPatient: string; setSelectedPatient: (v: string) => void }) {
  const patient = patientOptions.find(p => p.id === selectedPatient)!;
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const filteredOptions = patientOptions.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="rounded-2xl p-5 mb-4" style={{ background: 'var(--acutix-card-bg)', boxShadow: 'var(--acutix-card-shadow)' }}>
      <p className="text-xs font-semibold mb-3" style={{ color: 'var(--acutix-text-secondary)' }}>PATIENT DETAILS</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="relative">
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--acutix-text-body)' }}>Patient Search</label>
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--acutix-text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search patient..." 
              value={isOpen ? searchTerm : patient.name}
              onChange={e => { setSearchTerm(e.target.value); setIsOpen(true); }}
              onFocus={() => { setIsOpen(true); setSearchTerm(''); }}
              onBlur={() => setTimeout(() => setIsOpen(false), 200)}
              className="w-full pl-7 pr-3 py-2 rounded-xl text-sm outline-none cursor-pointer"
              style={{ border: '1.5px solid var(--acutix-input-border)', background: 'var(--acutix-input-bg)', color: 'var(--acutix-text-primary)', fontFamily: 'Poppins' }} 
            />
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--acutix-text-muted)' }} />
          </div>
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 rounded-xl py-1 z-50 max-h-40 overflow-y-auto shadow-lg" style={{ background: 'var(--acutix-card-bg)', border: '1px solid var(--acutix-input-border)' }}>
              {filteredOptions.length > 0 ? filteredOptions.map(p => (
                <div key={p.id} className="px-3 py-2 text-xs cursor-pointer hover:bg-black/5 transition-colors" style={{ color: 'var(--acutix-text-primary)' }}
                  onClick={() => { setSelectedPatient(p.id); setIsOpen(false); setSearchTerm(''); }}>
                  {p.name} <span style={{ color: 'var(--acutix-text-muted)' }}>({p.id})</span>
                </div>
              )) : (
                <div className="px-3 py-2 text-xs" style={{ color: 'var(--acutix-text-muted)' }}>No patients found</div>
              )}
            </div>
          )}
        </div>
        {[
          { label: 'Patient ID', value: patient.id },
          { label: 'Gender', value: patient.gender },
          { label: 'Age', value: `${patient.age} years` },
        ].map((f, i) => (
          <div key={i}>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--acutix-text-body)' }}>{f.label}</label>
            <div className="px-3 py-2 rounded-xl text-sm" style={{ background: 'var(--acutix-table-header-bg)', color: 'var(--acutix-text-body)', border: '1.5px solid var(--acutix-input-border)' }}>
              {f.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const TH = "text-left px-4 py-3 text-xs font-semibold";
const TD = "px-4 py-3";

export function Charts() {
  const [activeChart, setActiveChart] = useState('bpsugar');
  const [selectedPatient, setSelectedPatient] = useState('P001');
  const [tableSearch, setTableSearch] = useState('');
  const [patientFilter, setPatientFilter] = useState('all');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteTable, setDeleteTable] = useState<string>('');
  const { darkMode } = useTheme();

  const bpSugar = useEditableTable(initBpSugarRows);
  const bp = useEditableTable(initBpRows);
  const kick = useEditableTable(initKickRows);
  const preterm = useEditableTable(initPretermRows);
  const costing = useEditableTable(initCostingRows);
  const ivf = useEditableTable(initIvfRows);

  const [dynamicColumns, setDynamicColumns] = useState<Record<string, string[]>>({
    bpsugar: [], bp: [], kick: [], preterm: [], costing: [], ivf: []
  });

  const handleAddColumn = (chart: string) => {
    setDynamicColumns(prev => ({
      ...prev,
      [chart]: [...prev[chart], `New Column ${prev[chart].length + 1}`]
    }));
  };

  const handleRenameColumn = (chart: string, idx: number, newName: string) => {
    setDynamicColumns(prev => ({
      ...prev,
      [chart]: prev[chart].map((col, i) => i === idx ? newName : col)
    }));
  };

  const handleDeleteColumn = (chart: string, idx: number) => {
    setDynamicColumns(prev => ({
      ...prev,
      [chart]: prev[chart].filter((_, i) => i !== idx)
    }));
  };

  const activeTab = chartTabs.find(t => t.key === activeChart)!;
  const cardBg = 'var(--acutix-card-bg)';
  const cardShadow = 'var(--acutix-card-shadow)';
  const textPrimary = 'var(--acutix-text-primary)';
  const textSecondary = 'var(--acutix-text-secondary)';
  const gridStroke = darkMode ? '#2a2e42' : '#F3F4F6';
  const tooltipStyle = { borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontFamily: 'Poppins', fontSize: 11, background: darkMode ? '#232738' : '#fff', color: darkMode ? '#E8E8ED' : '#374151' };

  const handleDelete = (id: number, table: string) => { setDeleteId(id); setDeleteTable(table); };
  const confirmDelete = () => {
    if (deleteId === null) return;
    if (deleteTable === 'bpsugar') bpSugar.deleteRow(deleteId);
    else if (deleteTable === 'bp') bp.deleteRow(deleteId);
    else if (deleteTable === 'kick') kick.deleteRow(deleteId);
    else if (deleteTable === 'preterm') preterm.deleteRow(deleteId);
    else if (deleteTable === 'costing') costing.deleteRow(deleteId);
    else if (deleteTable === 'ivf') ivf.deleteRow(deleteId);
    setDeleteId(null); setDeleteTable('');
  };

  const bpSugarChartData = bpSugar.rows.map(r => ({ day: r.date.slice(0, 5), afterBreakfast: r.afterBreakfast, afterLunch: r.afterLunch, afterDinner: r.afterDinner, beforeBreakfast: r.beforeBreakfast }));
  const bpChartData = bp.rows.map(r => ({ day: r.date.slice(0, 5), systolic: r.systolic, diastolic: r.diastolic, pulse: r.pulse }));
  const kickChartData = kick.rows.map(r => ({ day: r.date.slice(0, 5), kickCount: r.kickCount }));
  const pretermChartData = preterm.rows.map(r => ({ day: r.date.slice(0, 5), contractionCount: r.contractionCount }));

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Delete Confirmation */}
      {deleteId !== null && <DeleteModal onConfirm={confirmDelete} onCancel={() => { setDeleteId(null); setDeleteTable(''); }} />}

      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: textPrimary }}>Medical Charts</h1>
          <p className="text-sm flex items-center gap-1" style={{ color: textSecondary }}>
            <span style={{ color: 'var(--acutix-text-muted)' }}>Dashboard</span>
            <ChevronRight size={12} style={{ color: 'var(--acutix-text-muted)' }} />
            <span>Charts</span>
            <ChevronRight size={12} style={{ color: 'var(--acutix-text-muted)' }} />
            <span style={{ color: textPrimary }}>{activeTab.label}</span>
          </p>
        </div>
      </div>

      {/* Chart Tabs */}
      <div className="flex gap-2.5 mb-5 flex-wrap">
        {chartTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeChart === tab.key;
          return (
            <button key={tab.key} onClick={() => { setActiveChart(tab.key); setTableSearch(''); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: isActive ? tab.color : cardBg,
                color: isActive ? 'white' : textSecondary,
                boxShadow: isActive ? `0 4px 15px ${tab.color}50` : cardShadow,
                border: isActive ? 'none' : `1.5px solid var(--acutix-input-border)`,
              }}>
              <Icon size={15} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Patient Entry Form */}
      {['bpsugar', 'bp', 'kick', 'preterm'].includes(activeChart) && (
        <PatientEntryForm selectedPatient={selectedPatient} setSelectedPatient={setSelectedPatient} />
      )}

      {/* === BP Sugar === TABLE first, then CHART */}
      {activeChart === 'bpsugar' && (
        <div className="space-y-4">
          <div className="rounded-2xl p-5" style={{ background: cardBg, boxShadow: cardShadow }}>
            <ControlBar search={tableSearch} onSearch={setTableSearch}
              onAddRow={() => bpSugar.addRow({ id: Date.now(), date: new Date().toLocaleDateString('en-GB').replace(/\//g, '/'), beforeBreakfast: 0, afterBreakfast: 0, afterLunch: 0, afterDinner: 0, bp: '' })}
              onAddCol={() => handleAddColumn('bpsugar')}
              onPrint={() => window.print()} reportType="BP & Sugar" />
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr style={{ background: 'var(--acutix-table-header-bg)' }}>
                  {['Date', 'Before Breakfast', 'After Breakfast', 'After Lunch', 'After Dinner', 'BP'].map(c => <th key={c} className={TH} style={{ color: textSecondary }}>{c}</th>)}
                  {dynamicColumns.bpsugar.map((c, i) => (
                    <th key={i} className={TH} style={{ color: textSecondary }}>
                      <div className="flex items-center gap-1 group">
                        <input value={c} onChange={e => handleRenameColumn('bpsugar', i, e.target.value)}
                          className="bg-transparent border-none outline-none text-xs font-semibold w-24 focus:border-b focus:border-gray-300" />
                        <button onClick={() => handleDeleteColumn('bpsugar', i)} className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-red-500 hover:bg-red-50 transition-all"><X size={12} /></button>
                      </div>
                    </th>
                  ))}
                  <th className={TH} style={{ color: textSecondary }}>Actions</th>
                </tr></thead>
                <tbody>
                  {bpSugar.rows.filter(r => !tableSearch || r.date.includes(tableSearch) || r.bp.includes(tableSearch)).map(row => {
                    const isE = bpSugar.editingId === row.id; const er = bpSugar.editRow;
                    return (
                      <tr key={row.id} className="border-t transition-colors" style={{ borderColor: 'var(--acutix-table-border)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--acutix-hover-bg)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <td className={TD}>{isE && er ? <EditCell value={er.date} onChange={v => bpSugar.setEditRow({ ...er, date: v })} darkMode={darkMode} /> : <span className="text-xs font-medium px-2 py-1 rounded-lg" style={{ background: 'var(--acutix-table-header-bg)', color: 'var(--acutix-text-body)' }}>{row.date}</span>}</td>
                        <td className={TD}>{isE && er ? <EditCell value={er.beforeBreakfast} onChange={v => bpSugar.setEditRow({ ...er, beforeBreakfast: v })} type="number" darkMode={darkMode} /> : <span className="text-sm" style={{ color: 'var(--acutix-text-body)' }}>{row.beforeBreakfast}</span>}</td>
                        <td className={TD}>{isE && er ? <EditCell value={er.afterBreakfast} onChange={v => bpSugar.setEditRow({ ...er, afterBreakfast: v })} type="number" darkMode={darkMode} /> : <span className="text-sm" style={{ color: 'var(--acutix-text-body)' }}>{row.afterBreakfast}</span>}</td>
                        <td className={TD}>{isE && er ? <EditCell value={er.afterLunch} onChange={v => bpSugar.setEditRow({ ...er, afterLunch: v })} type="number" darkMode={darkMode} /> : <span className="text-sm" style={{ color: 'var(--acutix-text-body)' }}>{row.afterLunch}</span>}</td>
                        <td className={TD}>{isE && er ? <EditCell value={er.afterDinner} onChange={v => bpSugar.setEditRow({ ...er, afterDinner: v })} type="number" darkMode={darkMode} /> : <span className="text-sm" style={{ color: 'var(--acutix-text-body)' }}>{row.afterDinner}</span>}</td>
                        <td className={TD}>{isE && er ? <EditCell value={er.bp} onChange={v => bpSugar.setEditRow({ ...er, bp: v })} darkMode={darkMode} /> : <span className="text-xs font-semibold px-2 py-1 rounded-lg" style={{ background: darkMode ? 'rgba(239,68,68,0.15)' : '#FEE2E2', color: '#EF4444' }}>{row.bp}</span>}</td>
                        {dynamicColumns.bpsugar.map((_, i) => <td key={i} className={TD}><EditCell value={isE && er ? (er as any)[`dyn_${i}`] || '' : (row as any)[`dyn_${i}`] || ''} onChange={v => isE && er ? bpSugar.setEditRow({ ...er, [`dyn_${i}`]: v } as any) : undefined} darkMode={darkMode} /></td>)}
                        <td className={TD}><RowActions isEditing={isE} onEdit={() => bpSugar.startEdit(row)} onSave={bpSugar.saveEdit} onCancel={bpSugar.cancelEdit} onDelete={() => handleDelete(row.id, 'bpsugar')} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <div className="rounded-2xl p-6" style={{ background: cardBg, boxShadow: cardShadow }}>
            <div className="flex items-center justify-between mb-4">
              <div><h3 className="font-bold" style={{ color: textPrimary }}>BP & Blood Sugar Chart</h3><p className="text-xs" style={{ color: textSecondary }}>Daily sugar monitoring readings (mg/dL)</p></div>
              <div className="flex gap-3">
                {[{ label: 'Before Brkfst', color: '#3CC0D0' }, { label: 'After Brkfst', color: '#F6C177' }, { label: 'After Lunch', color: '#EF4444' }, { label: 'After Dinner', color: '#8B5CF6' }].map(l => (
                  <div key={l.label} className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{ background: l.color }} /><span className="text-xs" style={{ color: textSecondary }}>{l.label}</span></div>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={bpSugarChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: darkMode ? '#6B7280' : '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: darkMode ? '#6B7280' : '#9CA3AF' }} axisLine={false} tickLine={false} domain={[60, 200]} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="beforeBreakfast" stroke="#3CC0D0" strokeWidth={2} dot={{ r: 3, fill: '#3CC0D0' }} name="Before Breakfast" />
                <Line type="monotone" dataKey="afterBreakfast" stroke="#F6C177" strokeWidth={2} dot={{ r: 3, fill: '#F6C177' }} name="After Breakfast" />
                <Line type="monotone" dataKey="afterLunch" stroke="#EF4444" strokeWidth={2} dot={{ r: 3, fill: '#EF4444' }} name="After Lunch" />
                <Line type="monotone" dataKey="afterDinner" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 3, fill: '#8B5CF6' }} name="After Dinner" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* === Blood Pressure === TABLE first, then CHART */}
      {activeChart === 'bp' && (
        <div className="space-y-4">
          <div className="rounded-2xl p-5" style={{ background: cardBg, boxShadow: cardShadow }}>
            <ControlBar search={tableSearch} onSearch={setTableSearch}
              onAddRow={() => bp.addRow({ id: Date.now(), date: new Date().toLocaleDateString('en-GB').replace(/\//g, '/'), systolic: 0, diastolic: 0, pulse: 0, remarks: '' })}
              onAddCol={() => handleAddColumn('bp')}
              onPrint={() => window.print()} reportType="Blood Pressure" />
            <div className="overflow-x-auto"><table className="w-full"><thead><tr style={{ background: 'var(--acutix-table-header-bg)' }}>
              {['Date', 'Systolic (mmHg)', 'Diastolic (mmHg)', 'Pulse (bpm)', 'Remarks'].map(c => <th key={c} className={TH} style={{ color: textSecondary }}>{c}</th>)}
              {dynamicColumns.bp.map((c, i) => (
                <th key={i} className={TH} style={{ color: textSecondary }}>
                  <div className="flex items-center gap-1 group">
                    <input value={c} onChange={e => handleRenameColumn('bp', i, e.target.value)}
                      className="bg-transparent border-none outline-none text-xs font-semibold w-24 focus:border-b focus:border-gray-300" />
                    <button onClick={() => handleDeleteColumn('bp', i)} className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-red-500 hover:bg-red-50 transition-all"><X size={12} /></button>
                  </div>
                </th>
              ))}
              <th className={TH} style={{ color: textSecondary }}>Actions</th>
            </tr></thead><tbody>
              {bp.rows.filter(r => !tableSearch || r.date.includes(tableSearch) || r.remarks.toLowerCase().includes(tableSearch.toLowerCase())).map(row => {
                const isE = bp.editingId === row.id; const er = bp.editRow;
                return (<tr key={row.id} className="border-t transition-colors" style={{ borderColor: 'var(--acutix-table-border)' }} onMouseEnter={e => (e.currentTarget.style.background = 'var(--acutix-hover-bg)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td className={TD}>{isE && er ? <EditCell value={er.date} onChange={v => bp.setEditRow({ ...er, date: v })} darkMode={darkMode} /> : <span className="text-xs font-medium px-2 py-1 rounded-lg" style={{ background: 'var(--acutix-table-header-bg)', color: 'var(--acutix-text-body)' }}>{row.date}</span>}</td>
                  <td className={TD}>{isE && er ? <EditCell value={er.systolic} onChange={v => bp.setEditRow({ ...er, systolic: v })} type="number" darkMode={darkMode} /> : <span className="text-sm font-semibold" style={{ color: '#EF4444' }}>{row.systolic}</span>}</td>
                  <td className={TD}>{isE && er ? <EditCell value={er.diastolic} onChange={v => bp.setEditRow({ ...er, diastolic: v })} type="number" darkMode={darkMode} /> : <span className="text-sm font-semibold" style={{ color: '#3B82F6' }}>{row.diastolic}</span>}</td>
                  <td className={TD}>{isE && er ? <EditCell value={er.pulse} onChange={v => bp.setEditRow({ ...er, pulse: v })} type="number" darkMode={darkMode} /> : <span className="text-sm" style={{ color: 'var(--acutix-text-body)' }}>{row.pulse}</span>}</td>
                  <td className={TD}>{isE && er ? <EditCell value={er.remarks} onChange={v => bp.setEditRow({ ...er, remarks: v })} darkMode={darkMode} /> : <span className="text-xs" style={{ color: textSecondary }}>{row.remarks}</span>}</td>
                  {dynamicColumns.bp.map((_, i) => <td key={i} className={TD}><EditCell value={isE && er ? (er as any)[`dyn_${i}`] || '' : (row as any)[`dyn_${i}`] || ''} onChange={v => isE && er ? bp.setEditRow({ ...er, [`dyn_${i}`]: v } as any) : undefined} darkMode={darkMode} /></td>)}
                  <td className={TD}><RowActions isEditing={isE} onEdit={() => bp.startEdit(row)} onSave={bp.saveEdit} onCancel={bp.cancelEdit} onDelete={() => handleDelete(row.id, 'bp')} /></td>
                </tr>);
              })}
            </tbody></table></div>
          </div>
          <div className="rounded-2xl p-6" style={{ background: cardBg, boxShadow: cardShadow }}>
            <h3 className="font-bold mb-1" style={{ color: textPrimary }}>Blood Pressure Chart</h3>
            <p className="text-xs mb-4" style={{ color: textSecondary }}>Systolic / Diastolic monitoring (mmHg)</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={bpChartData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: darkMode ? '#6B7280' : '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: darkMode ? '#6B7280' : '#9CA3AF' }} axisLine={false} tickLine={false} domain={[60, 150]} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                <ReferenceLine y={120} stroke="#EF4444" strokeDasharray="4 4" />
                <ReferenceLine y={80} stroke="#3B82F6" strokeDasharray="4 4" />
                <Bar dataKey="systolic" fill="#EF4444" radius={[6, 6, 0, 0]} name="Systolic (mmHg)" opacity={0.85} />
                <Bar dataKey="diastolic" fill="#3B82F6" radius={[6, 6, 0, 0]} name="Diastolic (mmHg)" opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* === Kick Count === */}
      {activeChart === 'kick' && (
        <div className="space-y-4">
          <div className="rounded-2xl p-5" style={{ background: cardBg, boxShadow: cardShadow }}>
            <ControlBar search={tableSearch} onSearch={setTableSearch}
              onAddRow={() => kick.addRow({ id: Date.now(), date: new Date().toLocaleDateString('en-GB').replace(/\//g, '/'), kickCount: 0, remarks: '' })}
              onAddCol={() => handleAddColumn('kick')}
              onPrint={() => window.print()} reportType="Kick Count" />
            <div className="overflow-x-auto"><table className="w-full"><thead><tr style={{ background: 'var(--acutix-table-header-bg)' }}>
              {['Date', 'Kick Count', 'Remarks'].map(c => <th key={c} className={TH} style={{ color: textSecondary }}>{c}</th>)}
              {dynamicColumns.kick.map((c, i) => (
                <th key={i} className={TH} style={{ color: textSecondary }}>
                  <div className="flex items-center gap-1 group">
                    <input value={c} onChange={e => handleRenameColumn('kick', i, e.target.value)}
                      className="bg-transparent border-none outline-none text-xs font-semibold w-24 focus:border-b focus:border-gray-300" />
                    <button onClick={() => handleDeleteColumn('kick', i)} className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-red-500 hover:bg-red-50 transition-all"><X size={12} /></button>
                  </div>
                </th>
              ))}
              <th className={TH} style={{ color: textSecondary }}>Actions</th>
            </tr></thead><tbody>
              {kick.rows.filter(r => !tableSearch || r.date.includes(tableSearch) || r.remarks.toLowerCase().includes(tableSearch.toLowerCase())).map(row => {
                const isE = kick.editingId === row.id; const er = kick.editRow;
                return (<tr key={row.id} className="border-t transition-colors" style={{ borderColor: 'var(--acutix-table-border)' }} onMouseEnter={e => (e.currentTarget.style.background = 'var(--acutix-hover-bg)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td className={TD}>{isE && er ? <EditCell value={er.date} onChange={v => kick.setEditRow({ ...er, date: v })} darkMode={darkMode} /> : <span className="text-xs font-medium px-2 py-1 rounded-lg" style={{ background: 'var(--acutix-table-header-bg)', color: 'var(--acutix-text-body)' }}>{row.date}</span>}</td>
                  <td className={TD}>{isE && er ? <EditCell value={er.kickCount} onChange={v => kick.setEditRow({ ...er, kickCount: v })} type="number" darkMode={darkMode} /> : <span className="text-sm font-semibold" style={{ color: row.kickCount >= 10 ? '#22C55E' : '#EF4444' }}>{row.kickCount}</span>}</td>
                  <td className={TD}>{isE && er ? <EditCell value={er.remarks} onChange={v => kick.setEditRow({ ...er, remarks: v })} darkMode={darkMode} /> : <span className="text-xs" style={{ color: textSecondary }}>{row.remarks}</span>}</td>
                  {dynamicColumns.kick.map((_, i) => <td key={i} className={TD}><EditCell value={isE && er ? (er as any)[`dyn_${i}`] || '' : (row as any)[`dyn_${i}`] || ''} onChange={v => isE && er ? kick.setEditRow({ ...er, [`dyn_${i}`]: v } as any) : undefined} darkMode={darkMode} /></td>)}
                  <td className={TD}><RowActions isEditing={isE} onEdit={() => kick.startEdit(row)} onSave={kick.saveEdit} onCancel={kick.cancelEdit} onDelete={() => handleDelete(row.id, 'kick')} /></td>
                </tr>);
              })}
            </tbody></table></div>
          </div>
          <div className="rounded-2xl p-6" style={{ background: cardBg, boxShadow: cardShadow }}>
            <h3 className="font-bold mb-1" style={{ color: textPrimary }}>Kick Count Chart</h3>
            <p className="text-xs mb-4" style={{ color: textSecondary }}>Daily fetal movement count</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={kickChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: darkMode ? '#6B7280' : '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: darkMode ? '#6B7280' : '#9CA3AF' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <ReferenceLine y={10} stroke="#22C55E" strokeDasharray="4 4" label={{ value: 'Min (10)', fill: '#22C55E', fontSize: 10 }} />
                <Bar dataKey="kickCount" fill="#F6C177" radius={[6, 6, 0, 0]} name="Kick Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* === Preterm Labour === */}
      {activeChart === 'preterm' && (
        <div className="space-y-4">
          <div className="rounded-2xl p-5" style={{ background: cardBg, boxShadow: cardShadow }}>
            <ControlBar search={tableSearch} onSearch={setTableSearch}
              onAddRow={() => preterm.addRow({ id: Date.now(), date: new Date().toLocaleDateString('en-GB').replace(/\//g, '/'), contractionCount: 0, duration: '', remarks: '' })}
              onAddCol={() => handleAddColumn('preterm')}
              onPrint={() => window.print()} reportType="Preterm Labour" />
            <div className="overflow-x-auto"><table className="w-full"><thead><tr style={{ background: 'var(--acutix-table-header-bg)' }}>
              {['Date', 'Contraction Count', 'Duration', 'Remarks'].map(c => <th key={c} className={TH} style={{ color: textSecondary }}>{c}</th>)}
              {dynamicColumns.preterm.map((c, i) => (
                <th key={i} className={TH} style={{ color: textSecondary }}>
                  <div className="flex items-center gap-1 group">
                    <input value={c} onChange={e => handleRenameColumn('preterm', i, e.target.value)}
                      className="bg-transparent border-none outline-none text-xs font-semibold w-24 focus:border-b focus:border-gray-300" />
                    <button onClick={() => handleDeleteColumn('preterm', i)} className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-red-500 hover:bg-red-50 transition-all"><X size={12} /></button>
                  </div>
                </th>
              ))}
              <th className={TH} style={{ color: textSecondary }}>Actions</th>
            </tr></thead><tbody>
              {preterm.rows.filter(r => !tableSearch || r.date.includes(tableSearch) || r.remarks.toLowerCase().includes(tableSearch.toLowerCase())).map(row => {
                const isE = preterm.editingId === row.id; const er = preterm.editRow;
                return (<tr key={row.id} className="border-t transition-colors" style={{ borderColor: 'var(--acutix-table-border)' }} onMouseEnter={e => (e.currentTarget.style.background = 'var(--acutix-hover-bg)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td className={TD}>{isE && er ? <EditCell value={er.date} onChange={v => preterm.setEditRow({ ...er, date: v })} darkMode={darkMode} /> : <span className="text-xs font-medium px-2 py-1 rounded-lg" style={{ background: 'var(--acutix-table-header-bg)', color: 'var(--acutix-text-body)' }}>{row.date}</span>}</td>
                  <td className={TD}>{isE && er ? <EditCell value={er.contractionCount} onChange={v => preterm.setEditRow({ ...er, contractionCount: v })} type="number" darkMode={darkMode} /> : <span className="text-sm font-semibold" style={{ color: row.contractionCount >= 4 ? '#EF4444' : 'var(--acutix-text-body)' }}>{row.contractionCount}</span>}</td>
                  <td className={TD}>{isE && er ? <EditCell value={er.duration} onChange={v => preterm.setEditRow({ ...er, duration: v })} darkMode={darkMode} /> : <span className="text-sm" style={{ color: 'var(--acutix-text-body)' }}>{row.duration}</span>}</td>
                  <td className={TD}>{isE && er ? <EditCell value={er.remarks} onChange={v => preterm.setEditRow({ ...er, remarks: v })} darkMode={darkMode} /> : <span className="text-xs" style={{ color: textSecondary }}>{row.remarks}</span>}</td>
                  {dynamicColumns.preterm.map((_, i) => <td key={i} className={TD}><EditCell value={isE && er ? (er as any)[`dyn_${i}`] || '' : (row as any)[`dyn_${i}`] || ''} onChange={v => isE && er ? preterm.setEditRow({ ...er, [`dyn_${i}`]: v } as any) : undefined} darkMode={darkMode} /></td>)}
                  <td className={TD}><RowActions isEditing={isE} onEdit={() => preterm.startEdit(row)} onSave={preterm.saveEdit} onCancel={preterm.cancelEdit} onDelete={() => handleDelete(row.id, 'preterm')} /></td>
                </tr>);
              })}
            </tbody></table></div>
          </div>
          <div className="rounded-2xl p-6" style={{ background: cardBg, boxShadow: cardShadow }}>
            <h3 className="font-bold mb-1" style={{ color: textPrimary }}>Preterm Labour Chart</h3>
            <p className="text-xs mb-4" style={{ color: textSecondary }}>Daily contraction count monitoring</p>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={pretermChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: darkMode ? '#6B7280' : '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: darkMode ? '#6B7280' : '#9CA3AF' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <ReferenceLine y={4} stroke="#EF4444" strokeDasharray="4 4" label={{ value: 'Alert (≥4)', fill: '#EF4444', fontSize: 10 }} />
                <Line type="monotone" dataKey="contractionCount" stroke="#8B5CF6" strokeWidth={2.5} dot={{ r: 4, fill: '#8B5CF6' }} name="Contractions" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* === Costing Sheet === */}
      {activeChart === 'costing' && (
        <div className="space-y-4">
          <PatientEntryForm selectedPatient={selectedPatient} setSelectedPatient={setSelectedPatient} />
          <div className="rounded-2xl overflow-hidden" style={{ background: cardBg, boxShadow: cardShadow }}>
            <div className="px-6 py-4" style={{ background: 'linear-gradient(135deg, #1F2A5A, #3CC0D0)' }}>
              <h3 className="font-bold text-white">IVF Costing Sheet</h3>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>{patientOptions.find(p => p.id === selectedPatient)?.name} · Cycle 2</p>
            </div>
            <div className="p-5">
              <ControlBar search={tableSearch} onSearch={setTableSearch}
                onAddRow={() => costing.addRow({ id: Date.now(), item: '', quantity: 0, amount: 0, total: 0 })}
                onAddCol={() => handleAddColumn('costing')}
                onPrint={() => window.print()} reportType="Costing" />
              <div className="overflow-x-auto"><table className="w-full"><thead><tr style={{ background: 'var(--acutix-table-header-bg)' }}>
                {['#', 'Item Description', 'Qty', 'Amount (₹)', 'Total (₹)'].map(c => <th key={c} className={TH} style={{ color: textSecondary }}>{c}</th>)}
                {dynamicColumns.costing.map((c, i) => (
                  <th key={i} className={TH} style={{ color: textSecondary }}>
                    <div className="flex items-center gap-1 group">
                      <input value={c} onChange={e => handleRenameColumn('costing', i, e.target.value)}
                        className="bg-transparent border-none outline-none text-xs font-semibold w-24 focus:border-b focus:border-gray-300" />
                      <button onClick={() => handleDeleteColumn('costing', i)} className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-red-500 hover:bg-red-50 transition-all"><X size={12} /></button>
                    </div>
                  </th>
                ))}
                <th className={TH} style={{ color: textSecondary }}>Actions</th>
              </tr></thead><tbody>
                {costing.rows.filter(r => !tableSearch || r.item.toLowerCase().includes(tableSearch.toLowerCase())).map((row, i) => {
                  const isE = costing.editingId === row.id; const er = costing.editRow;
                  const total = er && isE ? er.quantity * er.amount : row.quantity * row.amount;
                  return (<tr key={row.id} className="border-t transition-colors" style={{ borderColor: 'var(--acutix-table-border)' }} onMouseEnter={e => (e.currentTarget.style.background = 'var(--acutix-hover-bg)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td className={TD}><span className="text-xs font-bold" style={{ color: 'var(--acutix-text-muted)' }}>{i + 1}</span></td>
                    <td className={TD}>{isE && er ? <EditCell value={er.item} onChange={v => costing.setEditRow({ ...er, item: v })} darkMode={darkMode} /> : <span className="text-sm font-medium" style={{ color: textPrimary }}>{row.item}</span>}</td>
                    <td className={TD}>{isE && er ? <EditCell value={er.quantity} onChange={v => costing.setEditRow({ ...er, quantity: v })} type="number" darkMode={darkMode} /> : <span className="text-sm" style={{ color: 'var(--acutix-text-body)' }}>{row.quantity}</span>}</td>
                    <td className={TD}>{isE && er ? <EditCell value={er.amount} onChange={v => costing.setEditRow({ ...er, amount: v })} type="number" darkMode={darkMode} /> : <span className="text-sm" style={{ color: 'var(--acutix-text-body)' }}>₹{row.amount.toLocaleString()}</span>}</td>
                    <td className={TD}><span className="text-sm font-bold" style={{ color: '#22C55E' }}>₹{total.toLocaleString()}</span></td>
                    {dynamicColumns.costing.map((_, idx) => <td key={idx} className={TD}><EditCell value={isE && er ? (er as any)[`dyn_${idx}`] || '' : (row as any)[`dyn_${idx}`] || ''} onChange={v => isE && er ? costing.setEditRow({ ...er, [`dyn_${idx}`]: v } as any) : undefined} darkMode={darkMode} /></td>)}
                    <td className={TD}><RowActions isEditing={isE} onEdit={() => costing.startEdit(row)} onSave={costing.saveEdit} onCancel={costing.cancelEdit} onDelete={() => handleDelete(row.id, 'costing')} /></td>
                  </tr>);
                })}
              </tbody><tfoot><tr style={{ background: darkMode ? 'rgba(34,197,94,0.08)' : '#F0FDF4', borderTop: '2px solid #BBF7D0' }}>
                <td colSpan={4} className="px-4 py-3.5 font-bold text-sm" style={{ color: textPrimary }}>Grand Total</td>
                <td className="px-4 py-3.5"><span className="text-lg font-bold" style={{ color: '#22C55E' }}>₹{costing.rows.reduce((s, r) => s + r.quantity * r.amount, 0).toLocaleString()}</span></td>
                {dynamicColumns.costing.map((_, i) => <td key={i} />)}
                <td />
              </tr></tfoot></table></div>
            </div>
          </div>
        </div>
      )}

      {/* === IVF Failure === */}
      {activeChart === 'ivf' && (
        <div className="space-y-4">
          <PatientEntryForm selectedPatient={selectedPatient} setSelectedPatient={setSelectedPatient} />
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {/* Table FIRST */}
            <div className="rounded-2xl p-5" style={{ background: cardBg, boxShadow: cardShadow }}>
              <ControlBar search={tableSearch} onSearch={setTableSearch}
                onAddRow={() => ivf.addRow({ id: Date.now(), testName: '', result: '', remarks: '' })}
                onAddCol={() => handleAddColumn('ivf')}
                onPrint={() => window.print()} reportType="IVF Failure" />
              <div className="overflow-x-auto"><table className="w-full"><thead><tr style={{ background: 'var(--acutix-table-header-bg)' }}>
                {['Test Name', 'Result', 'Remarks'].map(c => <th key={c} className={TH} style={{ color: textSecondary }}>{c}</th>)}
                {dynamicColumns.ivf.map((c, i) => (
                  <th key={i} className={TH} style={{ color: textSecondary }}>
                    <div className="flex items-center gap-1 group">
                      <input value={c} onChange={e => handleRenameColumn('ivf', i, e.target.value)}
                        className="bg-transparent border-none outline-none text-xs font-semibold w-24 focus:border-b focus:border-gray-300" />
                      <button onClick={() => handleDeleteColumn('ivf', i)} className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-red-500 hover:bg-red-50 transition-all"><X size={12} /></button>
                    </div>
                  </th>
                ))}
                <th className={TH} style={{ color: textSecondary }}>Actions</th>
              </tr></thead><tbody>
                {ivf.rows.filter(r => !tableSearch || r.testName.toLowerCase().includes(tableSearch.toLowerCase()) || r.result.toLowerCase().includes(tableSearch.toLowerCase())).map(row => {
                  const isE = ivf.editingId === row.id; const er = ivf.editRow;
                  return (<tr key={row.id} className="border-t transition-colors" style={{ borderColor: 'var(--acutix-table-border)' }} onMouseEnter={e => (e.currentTarget.style.background = 'var(--acutix-hover-bg)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td className={TD}>{isE && er ? <EditCell value={er.testName} onChange={v => ivf.setEditRow({ ...er, testName: v })} darkMode={darkMode} /> : <span className="text-sm font-medium" style={{ color: textPrimary }}>{row.testName}</span>}</td>
                    <td className={TD}>{isE && er ? <EditCell value={er.result} onChange={v => ivf.setEditRow({ ...er, result: v })} darkMode={darkMode} /> : <span className="text-xs px-2 py-1 rounded-lg" style={{ background: darkMode ? 'rgba(245,158,11,0.12)' : '#FFF7ED', color: '#F59E0B' }}>{row.result}</span>}</td>
                    <td className={TD}>{isE && er ? <EditCell value={er.remarks} onChange={v => ivf.setEditRow({ ...er, remarks: v })} darkMode={darkMode} /> : <span className="text-xs" style={{ color: textSecondary }}>{row.remarks}</span>}</td>
                    {dynamicColumns.ivf.map((_, i) => <td key={i} className={TD}><EditCell value={isE && er ? (er as any)[`dyn_${i}`] || '' : (row as any)[`dyn_${i}`] || ''} onChange={v => isE && er ? ivf.setEditRow({ ...er, [`dyn_${i}`]: v } as any) : undefined} darkMode={darkMode} /></td>)}
                    <td className={TD}><RowActions isEditing={isE} onEdit={() => ivf.startEdit(row)} onSave={ivf.saveEdit} onCancel={ivf.cancelEdit} onDelete={() => handleDelete(row.id, 'ivf')} /></td>
                  </tr>);
                })}
              </tbody></table></div>
              <div className="mt-4 p-3.5 rounded-xl" style={{ background: darkMode ? 'rgba(245,158,11,0.08)' : '#FFF7ED', border: '1px solid #FED7AA' }}>
                <p className="text-xs font-semibold" style={{ color: '#F59E0B' }}>📋 Investigation Recommendation</p>
                <p className="text-xs mt-1" style={{ color: textSecondary }}>Poor egg quality remains the leading cause (30%). Consider enhanced stimulation protocol and preimplantation genetic testing (PGT) for next cycle.</p>
              </div>
            </div>
            {/* Chart */}
            <div className="rounded-2xl p-6" style={{ background: cardBg, boxShadow: cardShadow }}>
              <h3 className="font-bold mb-1" style={{ color: textPrimary }}>IVF Failure Analysis</h3>
              <p className="text-xs mb-4" style={{ color: textSecondary }}>Cause distribution of failed cycles</p>
              <div className="flex justify-center">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={ivfFailureData} cx="50%" cy="50%" outerRadius={110} innerRadius={55} paddingAngle={3} dataKey="value">
                      {ivfFailureData.map((entry, index) => (<Cell key={index} fill={entry.color} />))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-2">
                {ivfFailureData.map((item, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ background: item.color }} /><span className="text-xs font-medium" style={{ color: textPrimary }}>{item.name}</span></div>
                      <span className="text-xs font-bold" style={{ color: item.color }}>{item.value}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: gridStroke }}><div className="h-full rounded-full" style={{ width: `${item.value}%`, background: item.color }} /></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
